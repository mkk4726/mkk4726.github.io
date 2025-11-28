---
title: "Conformal Prediction: 분포 가정 없이 유한 샘플 coverage를 보장하는 방법"
date: "2025-08-13"
excerpt: "통계적 가정 없이도 finite-sample coverage를 보장하는 conformal prediction에 대해 정리해보기"
category: "Data Science"
tags: ["statistics", "prediction-interval", "uncertainty", "calibration"]
---

참고자료
- 1 : [Paper - Conformal Prediction: A Gentle Introduction](https://arxiv.org/abs/2107.07511)
- 2 : [Paper - Conformalized Quantile Regression](https://proceedings.neurips.cc/paper/2019/file/5103c3584b063c431bd1268e9b5e76fb-Paper.pdf)
- 3 : [블로그 - Conformal Prediction](https://ddangchani.github.io/Conformal-Prediction/#how-to-make-a-prediction-set)
- 4 : [블로그 - Conformal Prediction으로 모델의 불확실성 계산하기](https://pizzathiefz.github.io/posts/introduction-to-conformal-prediction/)


---

# 개념 스케치

Quantile Regression은 예측구간을 추정하기 위해 데이터가 위치할 quantile 값을 추정하는 방법입니다.
모델은 pinball loss를 통해 quantile을 추정합니다. 
- [정리한 글](/posts/Data Science/ML Engineering/quantile_regression/quantile-regression-explained.md)

하지만 추정한 결과가 원하는 수준의 confidence level을 충족시키지 못할 수 있기 때문에, calibraion 단계를 추가해 이를 보장해줍니다. (확률 추정할 때처럼)
이게 CQR입니다. 

등장하는 키워드들.

Conformal, Calibration, CQR


---
# 1. Conformal Prediction이란?

<figure>
<img src="./images/CQR_그림.png" alt="CQR 그림" width="70%" />
<figcaption>그림1. CQR </figcaption>
</figure>

conformal prediction은 calibration set을 통해 목표 coverage를 달성하는 방법입니다.
그림1처럼 quantile regressor의 결과에 conformal prediction을 붙여, 원하는 coverage의 prediction interval을 추정할 수 있습니다.

Conformal Prediction은 분포 가정 없이도 finite-sample coverage를 보장하는 prediction interval을 만드는 방법입니다.
- [Paper - A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification](https://arxiv.org/pdf/2107.07511)

conformal precition은 다음과 같은 특징을 가집니다.
- **분포 가정 불필요** : 데이터가 어떤 분포를 따르든 상관없음
- Finite-sample coverage: 유한한 샘플에서도 목표 coverage 보장
- **모델 agnostic** : 어떤 머신러닝 모델과도 사용 가능
- Calibration 자동화: 별도 조정 없이도 coverage 보장

---

# 2. 기본 원리

Conformal prediction의 핵심 가정은 **Exchangeability**입니다:

> 예측하고자 하는 새로운 데이터 $(x_{n+1}, y_{n+1})$와 기존 데이터 $(x_1, y_1), ..., (x_n, y_n)$이 exchangeable하다.

- Exchangeability: 데이터의 순서를 바꿔도 확률 분포가 동일

이는 train, valid, test을 나눴을 때 3개 모두 같은 분포를 가질 것이라는 이야기와 같습니다.

conformal prediction은 train set에서 valid set과 같은 개념인 calibration set을 따로 두고, 이를 통해 모델의 결과를 보정하겠다는 개념입니다.

학습 순서는 이렇게 구성되어 있습니다.
1. **Nonconformity score** 계산: 예측값과 실제값의 차이를 측정
2. **Calibration set** 에서 분위수 계산: 목표 coverage에 맞는 임계값 도출
3. **새로운 예측** 에 적용: 계산된 임계값으로 prediction interval 구성

---

# 3. Split Conformal Prediction

가장 실용적이고 널리 사용되는 방법입니다.

단계별 과정을 살펴보면, 

1. 데이터 분할
```
전체 데이터 → Train Set + Calibration Set
```

2. 모델 학습
- Train set으로 예측 모델 $\hat{f}$ 학습

3. 3단계: **Nonconformity score** 계산
- Calibration set에서 각 데이터의 nonconformity score 계산
- 대칭 PI의 경우: $r_i = |y_i - \hat{f}(x_i)|$

4. 임계값 계산
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{r_i\}$
- $n_{cal}$: calibration set 크기

5. Prediction Interval 구성
- 새로운 입력 $x$에 대해: $[\hat{f}(x) - \hat{Q}, \hat{f}(x) + \hat{Q}]$


Python 구현하는 예시는 다음과 같습니다.

```python
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

def split_conformal_prediction(X, y, alpha=0.1, test_size=0.2):
    # 1. 데이터 분할
    X_train, X_cal, y_train, y_cal = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    
    # 2. 모델 학습
    model = RandomForestRegressor(random_state=42)
    model.fit(X_train, y_train)
    
    # 3. Calibration set에서 예측
    y_cal_pred = model.predict(X_cal)
    
    # 4. Nonconformity scores 계산
    residuals = np.abs(y_cal - y_cal_pred)
    
    # 5. 임계값 계산
    n_cal = len(y_cal)
    quantile_level = (1 - alpha) * (1 + 1/n_cal)
    threshold = np.quantile(residuals, quantile_level)
    
    return model, threshold

# 사용 예시
model, threshold = split_conformal_prediction(X, y, alpha=0.1)

# 새로운 예측
y_pred = model.predict(X_new)
pi_lower = y_pred - threshold
pi_upper = y_pred + threshold
```

---

# 4. Conformalized Quantile Regression (CQR)

Quantile regression과 conformal prediction을 결합한 방법입니다.
3번 split conformal prediction의 개념과 완전히 일치합니다.

학습과정을 살펴보면, 

1. Quantile 모델 학습
- $\tau = \alpha/2$ (하한)
- $\tau = 1 - \alpha/2$ (상한)

2. Nonconformity score 계산
$$
e_i = \max\big(\hat{q}_{\alpha/2}(x_i) - y_i, y_i - \hat{q}_{1-\alpha/2}(x_i), 0\big)
$$

3. 임계값 계산**
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{e_i\}$

4. 최종 PI 구성**
$$
[\hat{q}_{\alpha/2}(x) - \hat{Q}, \hat{q}_{1-\alpha/2}(x) + \hat{Q}]
$$

이를 통해 더 정확한 PI를 구성할 수 있습니다.


---

# 5. 장점과 한계

Conformal prediction의 장단점을 정리하면 아래와 같습니다.

### 장점
- **분포 가정 불필요**: 어떤 데이터든 사용 가능
- **Finite-sample 보장**: 유한한 샘플에서도 coverage 보장
- **모델 독립적**: 어떤 ML 모델과도 결합 가능
- **Calibration 자동**: 별도 조정 불필요

### 한계
- **Marginal coverage만 보장**: Conditional coverage는 보장하지 않음
- **데이터 분할 필요**: 학습 데이터 일부를 calibration에 사용
- **Computational cost**: 추가 계산 비용
- **Exchangeability 가정**: 시간 순서가 중요한 데이터에는 부적합

---

# 왜 nonconformity score에서 왜 1-alpha qunatile을 뽑을까?

이건 이 방법의 핵심 가정인 exchangability, 교환가능성에 있습니다.

calibration set과 test set (unseen data)는 교환가능하기 때문에 calibration에서 신뢰수준을 만족시키면 test set에서도 만족할 것이라는 이야깁니다.

nonconformity scroe가 다음과 같이 구해졌다고 생각해봅시다.

[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]

$$
e_i = \max\big(\hat{q}_{\alpha/2}(x_i) - y_i, y_i - \hat{q}_{1-\alpha/2}(x_i), 0\big)
$$

nonconformity score, e_i는 위와 같이 구해지기 때문에, 0이 없다는 건 범위 안에 포함된 데이터가 없다는 의미입니다.
이런 상황에서 신뢰수준을 만족하기 위해서는 nonconformity score에서 1-alpha (confidence level)에 해당하는 값을 뽑아서 예측구간에 더해주면 됩니다.
alpha가 1이라면 0.9가 q_hat이 됩니다.

0.9를 더해주면 0.9보다 작은 값들에 해당하는 데이터들은 모두 예측구간 안에 들어오게 되니까, 신뢰수준을 만족하게 됩니다.




---

# nomial alpha 튜닝하기 (참고2)

참고2에 해당하는 논문에서는 conformal 하는 과정에서 보수적으로 신뢰수준을 만족하려다보니, 예측구간이 넓어지는 문제가 발생했다고 합니다.
이를 위해 pinball loss를 통해 qunatile을 예측하는 모델을 만들 때, tau값을 튜닝하는 걸 제안했습니다.

아래 코드는 optuna를 통해 모델의 하이퍼파라미터를 튜닝하는 코드입니다.
이때 tau도 같이 튜닝해줄 수 있습니다.

```python
# --------------------
# Joint search with Optuna
# --------------------
def joint_search(X, y, alpha_total=0.10, n_trials=50, random_state=42):
    X_tr, y_tr, X_cal, y_cal, X_val, y_val = split_tcv(X, y, cal_size=0.2, val_size=0.2, random_state=random_state)

    def objective(trial: optuna.Trial):
        # 1) 하이퍼파라미터 샘플
        #   - nominal quantiles (학습용): 보수성 완화를 위해 튜닝
        # https://proceedings.neurips.cc/paper/2019/file/5103c3584b063c431bd1268e9b5e76fb-Paper.pdf
        # Practical considerations and extensions 참고
        tau_lo = trial.suggest_float("tau_lo", 0.02, 0.08)  # 예: 0.05 근방
        tau_hi = trial.suggest_float("tau_hi", 0.92, 0.98)  # 예: 0.95 근방
        #   - 좌/우 꼬리 유의수준 배분 (Theorem 2): alpha_lo + alpha_hi = alpha_total
        beta = trial.suggest_float("alpha_split_ratio", 0.2, 0.8)  # 비대칭 허용
        alpha_lo = beta * alpha_total
        alpha_hi = alpha_total - alpha_lo

        # LightGBM 공통 하이퍼파라미터 (두 모델에 공유 or 별도도 가능)
        params = {
            "n_estimators": trial.suggest_int("n_estimators", 300, 1200),
            "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.15, log=True),
            "num_leaves": trial.suggest_int("num_leaves", 15, 255),
            "max_depth": trial.suggest_int("max_depth", -1, 12),
            "min_child_samples": trial.suggest_int("min_child_samples", 5, 60),
            "subsample": trial.suggest_float("subsample", 0.6, 1.0),
            "colsample_bytree": trial.suggest_float("colsample_bytree", 0.6, 1.0),
            "reg_alpha": trial.suggest_float("reg_alpha", 1e-8, 10.0, log=True),
            "reg_lambda": trial.suggest_float("reg_lambda", 1e-8, 10.0, log=True),
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

        # 목적함수: Interval Score (proper) + coverage 부족 벌점
        cov_penalty_weight = 10
        cov_penalty = max(0.0, (1 - alpha_total) - cov)
        wid_penalty_weight = 10
        objective_value = wid_penalty_weight * wid + cov_penalty_weight * cov_penalty
        # objective_value = iscore + cov_penalty_weight * cov_penalty

        # 로깅
        trial.set_user_attr("coverage", float(cov))
        trial.set_user_attr("width", float(wid))
        trial.set_user_attr("qhat_lo", float(qhat_lo))
        trial.set_user_attr("qhat_hi", float(qhat_hi))

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
```