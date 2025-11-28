---
title: "quantile regression model을 최적화하는 법"
date: "2025-10-20"
excerpt: "어떻게 quantile regression model을 최적화했는지 정리했습니다."
category: "Machine Learning"
tags: ["Quantile Regression", "optimization"]
---

예측구간 (prediction interval)을 추정하기 위해서 quantile regression model을 통해 quantile을 추정하고 이를 통해 예측구간을 추정합니다.
즉 유의수준 0.1, 신뢰수준 0.9인 예측구간을 추정하기 위해서는 0.05 quantile과 0.95 quantile을 추정하면 됩니다.

이러한 quantile regression model은 pinball loss를 통해 학습됩니다.
- [이에 대해 정리한 글 - qunaitle regression이란?](//posts/Data%20Science/ML%20Engineering/quantile_regression/quantile-regression-explained.md)

quantile regression model을 최적화하는 부분은 꽤나 까다롭고 한계가 있습니다.
그 이유를 정리해보면, 평가지표는 구간에 대한 것들입니다. 하지만 모델은 각각 만들어집니다. 즉 모델이 학습하는 pinball loss에 직접적인 반영을 할 수가 없습니다.
또한 여러개의 모델을 한번에 튜닝해야 하기 때문에 적절한 파라미터를 찾는 것도 까다롭습니다.

---

# 진행 과정

모델을 튜닝하는 코드입니다. optuna를 통해 구현했습니다. 
모델을 한번 보완해서 추정하는 CQR을 통해 결과를 예측합니다.
- [optuna에 대해정리한 글](/posts/Data%20Science/ML%20Engineering/tuning/what-is-bayesian-optimization.md)
- [CQR에 대해 정리한 글](/posts/Data%20Science/ML%20Engineering/quantile_regression/conformal-prediction-explained.md)

평가지표는 실제 신뢰수준을 만족하는지 (data coverage)와 예측구간의 길이를 함께 고려해서 구성했습니다.
- [평가지표는 어떻게 구성해야할까?](/posts/Data%20Science/ML%20Engineering/quantile_regression/about-quantile-regression-metrics.md)

```python
# --------------------
# Joint search with Optuna
# --------------------
def joint_search(X, y, alpha_total=0.10, n_trials=50, random_state=42):
    # calibration set을 크게 (0.3) - qhat 추정을 더 안정적으로
    X_tr, y_tr, X_cal, y_cal, X_val, y_val = split_tcv(X, y, cal_size=0.3, val_size=0.2, random_state=random_state, stratify="size")

    def objective(trial: optuna.Trial):
        # 1) 하이퍼파라미터 샘플
        #   - nominal quantiles (학습용): alpha에 더 가깝게 설정하여 overcoverage 방지
        # https://proceedings.neurips.cc/paper/2019/file/5103c3584b063c431bd1268e9b5e76fb-Paper.pdf
        # Practical considerations and extensions 참고
        # alpha_total=0.1일 때, tau는 0.05와 0.95 근방에서 탐색
        tau_lo = trial.suggest_float("tau_lo", alpha_total / 2 * 0.8, alpha_total / 2 * 1.2)
        tau_hi = trial.suggest_float("tau_hi", 1 - alpha_total / 2 * 1.2, 1 - alpha_total / 2 * 0.8)
        #   - 좌/우 꼬리 유의수준 배분 (Theorem 2): alpha_lo + alpha_hi = alpha_total
        beta = trial.suggest_float("alpha_split_ratio", 0.3, 0.7)  # 대칭에 가깝게
        alpha_lo = beta * alpha_total
        alpha_hi = alpha_total - alpha_lo

        # LightGBM 하이퍼파라미터
        params = {
            # 트리 개수 범위 확장
            "n_estimators": trial.suggest_int("n_estimators", 100, 1500),
            # Learning rate 더 넓게
            "learning_rate": trial.suggest_float("learning_rate", 0.005, 0.3, log=True),
            # 리프 개수 상한 넓힘 (더 복잡한 트리 허용)
            "num_leaves": trial.suggest_int("num_leaves", 10, 255),
            # 깊이 무제한 포함
            "max_depth": trial.suggest_int("max_depth", -1, 16),  # -1: unlimited depth
            # 리프당 최소 샘플 더 넓게
            "min_child_samples": trial.suggest_int("min_child_samples", 1, 200),
            # Subsampling 비율 확대
            "subsample": trial.suggest_float("subsample", 0.5, 1.0),
            # Feature subsampling 확대
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.5, 1.0),
            # Regularization 범위 더 넓게 (0.0을 1e-8 등 양수로 변경)
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 20.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 20.0, log=True),
        }

        # 2) 학습 (Train)
        model_lo = fit_lgbm_quantile(X_tr, y_tr, tau=tau_lo, params=params, seed=random_state)
        model_hi = fit_lgbm_quantile(X_tr, y_tr, tau=tau_hi, params=params, seed=random_state)

        # 3) 캘리브레이션 (Cal): 좌/우 꼬리 각각의 nonconformity
        qlo_cal = model_lo.predict(X_cal)
        qhi_cal = model_hi.predict(X_cal)

        s_lo = qlo_cal - y_cal  # undercoverage (왼쪽)
        s_hi = y_cal - qhi_cal  # overcoverage  (오른쪽)
        qhat_lo = conformal_qhat(s_lo, alpha_lo)
        qhat_hi = conformal_qhat(s_hi, alpha_hi)

        # 4) 검증 (Val): 보정된 구간으로 평가
        qlo_val = model_lo.predict(X_val)
        qhi_val = model_hi.predict(X_val)

        L = qlo_val - qhat_lo
        U = qhi_val + qhat_hi

        cov = coverage(y_val, L, U)
        wid = avg_width(L, U)
        # iscore = interval_score(y_val, L, U, alpha_total)

        # 목적함수: coverage 목표 달성 + qhat 최소화 + width 최소화
        target_coverage = 1 - alpha_total

        # 1) Coverage를 목표에 정확히 맞추기
        cov_penalty_weight = 1000
        cov_penalty = abs(cov - target_coverage)

        # 2) Qhat을 작게 유지 (conformal correction 최소화)
        qhat_penalty_weight = 1.0
        qhat_penalty = qhat_lo + qhat_hi  # 두 qhat의 합 최소화

        # 3) Width 최소화
        wid_penalty_weight = 1.0

        objective_value = cov_penalty_weight * cov_penalty + qhat_penalty_weight * qhat_penalty + wid_penalty_weight * wid

        # 로깅
        trial.set_user_attr("coverage", float(cov))
        trial.set_user_attr("width", float(wid))
        trial.set_user_attr("qhat_lo", float(qhat_lo))
        trial.set_user_attr("qhat_hi", float(qhat_hi))
        trial.set_user_attr("qhat_sum", float(qhat_lo + qhat_hi))

        return objective_value

    study = optuna.create_study(direction="minimize")
    study.optimize(objective, n_trials=n_trials, show_progress_bar=False)

    best = study.best_trial
    print("Best value (objective):", best.value)
    print("Best params:", best.params)
    print("Coverage (val):", best.user_attrs.get("coverage"))
    print("Avg width (val):", best.user_attrs.get("width"))
    print("qhat_lo / qhat_hi:", best.user_attrs.get("qhat_lo"), best.user_attrs.get("qhat_hi"))

    return study


# --------------------
# 사용 예시
# --------------------
# X, y = ... # (n_samples, n_features), (n_samples,)
study = joint_search(X_train, y_train, alpha_total=0.10, n_trials=100, random_state=42)
```

튜닝하는 하이퍼파라미터로는 다음과 같습니다.
1. 모델이 가지고 있는 하이퍼 파라미터 (위 코드에서는 lightgbm)
2. nomial alpha (tau), pinball loss에서 사용하는 값 (0.05, 0.95)
3. 유의수준 배분하는 정도

튜닝한 후에는 다음과 같은 결과를 얻었습니다.
- 기존대비 약 coverage 1.4% 향상(89.6% → 91.03%) .  width 6정도 증가 (trade-off관계)

---

# 결과 해석하기

앞서 언급했듯 이런 방향으로 모델을 튜닝하는 건 한계가 있습니다.
핵심 이유는 우리가 실제로 최적화하고 싶은 것은 interval 수준의 지표(coverage, width)인데, 학습은 본질적으로 point-wise pinball loss를 통해 개별 quantile을 맞추는 문제이기 때문입니다. 이 불일치로 인해 coverage를 정확히 맞추려 하면 width가 늘고, width를 줄이면 undercoverage가 발생하기 쉬운 구조적 trade-off가 생깁니다. 또한 좌/우 꼬리를 분리해 다루는 calibration 과정에서 데이터가 충분히 크지 않거나 분포의 꼬리가 heavy-tailed이면 qhat 추정의 분산이 커져 튜닝의 불안정성이 커집니다.

실무적으로는 다음과 같은 현상이 자주 관찰됩니다.
1. validation split에 특이치나 국소적인 distribution shift가 있으면 joint search가 그 구간을 과도하게 방어하도록 학습되어 전반적인 width가 불필요하게 커질 수 있습니다.
2. quantile 별 모델을 독립적으로 학습하면 quantile crossing 위험이 상존하고, 사후 보정으로 crossing을 해소하더라도 coverage/width 최적점이 미묘하게 틀어질 수 있습니다.
3. feature space의 이질성(heteroscedasticity)이 큰 영역에서 단일한 규제나 공통 하이퍼파라미터로는 모든 구간을 동시에 잘 맞추기 어렵습니다.

따라서 튜닝만으로 성능을 밀어 올리는 데는 분명한 상한이 있고, 더 큰 개선은 데이터와 모델의 representation에 있다고 생각합니다.
1. feature engineering으로 조건부 분산을 설명하는 변수 추가
2. target transformation(예: log/Box-Cox)으로 pinball loss의 안정화
3. stratified calibration으로 size나 regime 별 qhat을 분리 추정
4. cross-quantile information sharing이 가능한 모형(예: shared representation, monotonic constraint, simultaneous quantile fitting) 

또한 운영 단계에서는 drift 감지를 통해 calibration set을 주기적으로 갱신하고, 과거 window와 최신 window를 혼합해 qhat의 분산을 낮추는 방식을 생각해볼 수 있습니다.

요약하면, 하이퍼파라미터 탐색은 필요조건이지만 충분조건은 아닙니다. 
tuning budget을 과도하게 늘리기보다는, metric을 명확히 고정(목표 coverage, 허용 width), calibration 전략을 견고하게 설계, feature/label 설계를 통해 loss–metric 불일치를 축소하는 편이 재현성과 운영 안정성 측면에서 더 큰 효과를 보일 것이라고 생각합니다.

# 향후 계획

향후에는 conformal 예측의 지역적 버전(local conformal)이나 online calibration을 도입해 분포 변화에 더 민감하게 반응하도록 개선할 계획입니다. 
- local conformal은 feature space를 여러 regime으로 나누어 각 영역별로 서로 다른 qhat을 추정함으로써 heteroscedasticity를 더 세밀하게 포착할 수 있고
- online calibration은 신규 데이터를 sliding window 방식으로 반영해 drift에 적응적으로 대응할 수 있습니다.

다음 단계로는 여러 quantile을 하나의 모델에서 동시에 학습하는 simultaneous multi-quantile 접근을 도입할 수 있을 것 같습니다.
이 방식은 shared representation 위에 다중 quantile head를 두어 모든 quantile이 공통 feature 추출 과정을 공유하면서도 각각 독립적인 출력을 생성하는 구조입니다.

학습 objective는 네 가지 요소로 구성됩니다.
1. 각 quantile별 pinball loss의 합을 기본 항으로 두어 개별 quantile 예측 성능을 보장합니다. 
2. 여기에 평균 구간 길이에 대한 width regularization을 추가해 불필요하게 넓은 구간이 형성되는 것을 방지합니다. 
3. 목표 coverage와의 차이는 temperatured sigmoid 기반 soft indicator와 같은 완만한 surrogate로 반영해 미분 가능한 형태로 coverage penalty를 구성하고
4. quantile이 교차하지 않도록 monotonic constraint나 hinge penalty를 통해 non-crossing 제약을 부과합니다.

좌우 꼬리의 비대칭성을 더 효과적으로 다루기 위해 alpha split 자체를 학습 가능한 변수로 설정합니다. 
이를 통해 고정된 calibration 대신 데이터로부터 최적의 비대칭 배분을 직접 학습하게 되고, 결과적으로 qhat 보정량을 줄여 conformal 의존도를 낮추는 효과를 기대할 수 있습니다.

이러한 metric-aligned objective는 validation 단계에서 사용하는 coverage, width, interval score를 학습 시점부터 직접 반영하므로 하이퍼파라미터 탐색에 대한 의존도를 줄이면서도 운영 환경의 분포 변화에 더 견고한 모델을 제공할 것으로 기대합니다.