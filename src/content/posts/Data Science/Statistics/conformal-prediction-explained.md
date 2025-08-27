---
title: "Conformal Prediction: 분포 가정 없이 유한 샘플 coverage를 보장하는 방법"
date: "2025-08-13"
excerpt: "통계적 가정 없이도 finite-sample coverage를 보장하는 conformal prediction의 원리와 실무 적용법"
category: "Data Science"
tags: ["statistics", "prediction-interval", "uncertainty", "calibration"]
---

참고자료
- 1 : [블로그 - Conformal Prediction으로 모델의 불확실성 계산하기](https://pizzathiefz.github.io/posts/introduction-to-conformal-prediction/)
- 2 : [Paper - Conformal Prediction: A Gentle Introduction](https://arxiv.org/abs/2107.07511)
- 3 : [블로그 - Conformal Prediction](https://ddangchani.github.io/Conformal-Prediction/#how-to-make-a-prediction-set)

[Paper Review - 2](/posts/Data%20Science/Paper-Review/A-Gentle-Introduction-to-Conformal-Prediction-and-Distribution-Free-Uncertainty-Quantification/)


---

## Conformal Prediction이란?

**Conformal prediction**은 **분포 가정 없이도 finite-sample coverage를 보장**하는 prediction interval을 만드는 방법입니다.

### 핵심 특징
- **분포 가정 불필요**: 데이터가 어떤 분포를 따르든 상관없음
- **Finite-sample coverage**: 유한한 샘플에서도 목표 coverage 보장
- **모델 agnostic**: 어떤 머신러닝 모델과도 사용 가능
- **Calibration 자동화**: 별도 조정 없이도 coverage 보장

## 기본 원리

### Exchangeability 가정
Conformal prediction의 핵심 가정은 **exchangeability**입니다:

> 예측하고자 하는 새로운 데이터 $(x_{n+1}, y_{n+1})$와 기존 데이터 $(x_1, y_1), ..., (x_n, y_n)$이 exchangeable하다.

**Exchangeability**: 데이터의 순서를 바꿔도 확률 분포가 동일

### 핵심 아이디어
1. **Nonconformity score** 계산: 예측값과 실제값의 차이를 측정
2. **Calibration set**에서 분위수 계산: 목표 coverage에 맞는 임계값 도출
3. **새로운 예측**에 적용: 계산된 임계값으로 prediction interval 구성

## Split Conformal Prediction

가장 실용적이고 널리 사용되는 방법입니다.

### 단계별 과정

**1단계: 데이터 분할**
```
전체 데이터 → Train Set + Calibration Set
```

**2단계: 모델 학습**
- Train set으로 예측 모델 $\hat{f}$ 학습

**3단계: Nonconformity score 계산**
- Calibration set에서 각 데이터의 nonconformity score 계산
- 대칭 PI의 경우: $r_i = |y_i - \hat{f}(x_i)|$

**4단계: 임계값 계산**
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{r_i\}$
- $n_{cal}$: calibration set 크기

**5단계: Prediction Interval 구성**
- 새로운 입력 $x$에 대해: $[\hat{f}(x) - \hat{Q}, \hat{f}(x) + \hat{Q}]$

### Python 구현 예시

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

## Conformalized Quantile Regression (CQR)

Quantile regression과 conformal prediction을 결합한 방법입니다.

### CQR 과정

**1단계: Quantile 모델 학습**
- $\tau = \alpha/2$ (하한)
- $\tau = 1 - \alpha/2$ (상한)

**2단계: Nonconformity score 계산**
$$
e_i = \max\big(\hat{q}_{\alpha/2}(x_i) - y_i, y_i - \hat{q}_{1-\alpha/2}(x_i), 0\big)
$$

**3단계: 임계값 계산**
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{e_i\}$

**4단계: 최종 PI 구성**
$$
[\hat{q}_{\alpha/2}(x) - \hat{Q}, \hat{q}_{1-\alpha/2}(x) + \hat{Q}]
$$

### CQR의 장점
- **Heteroscedasticity 대응**: 분산이 일정하지 않아도 적합
- **Quantile 정보 활용**: 더 정확한 PI 구성
- **Coverage 보장**: Finite-sample marginal coverage

## CQR (Conformalized Quantile Regression) 구현

CQR은 quantile regression을 사용하여 더 정확한 prediction intervals를 생성합니다.

```python
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

class ConformalizedQuantileRegression:
    def __init__(self, alpha=0.1):
        self.alpha = alpha
        self.lower_model = None
        self.upper_model = None
        self.tau = None
    
    def fit(self, X_train, y_train, X_cal, y_cal):
        """
        CQR 모델 학습 및 calibration (Romano et al., 2019)
        - 하한/상한 quantile 모델 학습
        - calibration set으로 전역 오프셋 tau 계산
        """
        from sklearn.ensemble import GradientBoostingRegressor
        # 1) Quantile models: lower (α/2), upper (1-α/2)
        q_low = self.alpha / 2.0
        q_high = 1.0 - self.alpha / 2.0
        self.lower_model = GradientBoostingRegressor(loss="quantile", alpha=q_low, random_state=42)
        self.upper_model = GradientBoostingRegressor(loss="quantile", alpha=q_high, random_state=42)
        self.lower_model.fit(X_train, y_train)
        self.upper_model.fit(X_train, y_train)
        
        # 2) Calibration nonconformity scores
        lower_cal = self.lower_model.predict(X_cal)
        upper_cal = self.upper_model.predict(X_cal)
        # 점수는 interval 바깥으로 나간 정도(음수는 0으로 절단)
        scores = np.maximum.reduce([
            lower_cal - y_cal,
            y_cal - upper_cal,
            np.zeros_like(y_cal)
        ])
        
        # 3) Finite-sample quantile → tau (전역 오프셋)
        n_cal = len(scores)
        quantile_level = (1 - self.alpha) * (1 + 1 / n_cal)
        self.tau = np.quantile(scores, quantile_level)
        return self
    
    def predict(self, X):
        """
        최종 Prediction Interval 생성: [q_low(X) - tau, q_high(X) + tau]
        """
        ql = self.lower_model.predict(X)
        qh = self.upper_model.predict(X)
        # Quantile crossing 방지: 하한/상한 정렬 후 오프셋 적용
        q_low_aligned = np.minimum(ql, qh)
        q_high_aligned = np.maximum(ql, qh)
        lower = q_low_aligned - self.tau
        upper = q_high_aligned + self.tau
        return lower, upper
    
    def get_coverage(self, X_test, y_test):
        """Test set에서 coverage 계산"""
        lower_bounds, upper_bounds = self.predict(X_test)
        
        # 실제값이 prediction interval 안에 있는 비율
        coverage = np.mean(
            (y_test >= lower_bounds) & (y_test <= upper_bounds)
        )
        
        return coverage

# 사용 예시
def demonstrate_cqr():
    # 가상 데이터 생성 (heteroscedastic)
    np.random.seed(42)
    n_samples = 1000
    
    X = np.random.uniform(0, 10, n_samples).reshape(-1, 1)
    # Heteroscedastic noise: X가 클수록 noise도 커짐
    noise = np.random.normal(0, 0.1 + 0.05 * X.flatten(), n_samples)
    y = 2 * X.flatten() + noise
    
    # 데이터 분할
    X_train, X_temp, y_train, y_temp = train_test_split(
        X, y, test_size=0.4, random_state=42
    )
    X_cal, X_test, y_cal, y_test = train_test_split(
        X_temp, y_temp, test_size=0.5, random_state=42
    )
    
    # CQR 모델 학습
    cqr = ConformalizedQuantileRegression(alpha=0.1)
    cqr.fit(X_train, y_train, X_cal, y_cal)
    
    # Prediction intervals 생성
    lower_bounds, upper_bounds = cqr.predict(X_test)
    
    # Coverage 확인
    coverage = cqr.get_coverage(X_test, y_test)
    print(f"CQR Coverage: {coverage:.3f}")
    
    # Interval width 통계
    interval_widths = upper_bounds - lower_bounds
    print(f"Average interval width: {np.mean(interval_widths):.3f}")
    print(f"Interval width std: {np.std(interval_widths):.3f}")
    
    return cqr, X_test, y_test, lower_bounds, upper_bounds

# 실행
if __name__ == "__main__":
    cqr_model, X_test, y_test, lower_bounds, upper_bounds = demonstrate_cqr()
```

## CQR의 핵심 특징

### 1. **Quantile-based Approach**
- Lower quantile (α/2)와 upper quantile (1-α/2)을 직접 모델링
- 각 입력 X에 대해 conditional quantiles 학습

### 2. **Conformal Scores**
- `max(lower_pred - y, y - upper_pred)` 형태
- 실제값이 prediction interval 밖에 있는 정도를 측정

### 3. **Adaptive Interval Width**
- **Quantile 모델**: X에 따라 다른 lower/upper bounds
- **Adaptive Conformalization**: X와 유사한 calibration points로 local threshold 계산
- **결과**: X에 따라 변하는 interval width + local coverage guarantee

### 4. **Heteroscedasticity 처리**
- **Quantile 모델**이 X에 따른 noise 변화를 학습
- **Local threshold**: K-nearest neighbors로 X별로 다른 conformalization
- **CR과의 차이**: 고정된 width가 아닌 **fully adaptive approach**

이 구현은 **Random Forest**를 quantile regression에 사용했지만, **Neural Networks**나 **Gradient Boosting** 등 다른 모델로도 확장 가능합니다.

## 실무 적용 팁

### 1. 데이터 분할 전략
- **Train/Calibration 비율**: 보통 80:20 또는 70:30
- **Stratified sampling**: 분류 문제에서 클래스 비율 유지
- **Time series**: 시간 순서 고려한 분할

### 2. Nonconformity Score 선택
- **회귀**: $|y - \hat{f}(x)|$ (절댓값)
- **분류**: $1 - \hat{p}_y(x)$ (예측 확률의 보완)
- **비대칭**: $y - \hat{f}(x)$ (방향성 고려)

### 3. Coverage vs Width 균형
- **높은 coverage**: 더 넓은 PI
- **좁은 PI**: 낮은 coverage
- **실무적 trade-off**: 비즈니스 요구사항 고려

## 장점과 한계

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

## 최신 발전 동향

### 1. Adaptive Conformal Prediction
- 온라인 학습 환경에서 coverage 유지
- Concept drift에 적응

### 2. Conformal Prediction for Time Series
- 시계열 데이터의 특성 고려
- Autocorrelation 처리

### 3. Multi-output Conformal Prediction
- 다중 출력 변수 동시 처리
- 출력 간 상관관계 고려

### 4. Conformal Prediction with Deep Learning
- 신경망 모델과의 결합
- Uncertainty quantification

## 실무 체크리스트

### 구현 전 확인사항
- [ ] 데이터의 exchangeability 가정 검토
- [ ] 적절한 데이터 분할 전략 수립
- [ ] Nonconformity score 함수 선택
- [ ] 목표 coverage level 결정

### 구현 후 검증사항
- [ ] Calibration plot으로 coverage 확인
- [ ] PI width의 적절성 검토
- [ ] Out-of-distribution 데이터에서 성능 테스트
- [ ] 계산 비용과 성능의 균형점 확인

## 결론

Conformal prediction은 **분포 가정 없이도 reliable한 prediction interval**을 제공하는 강력한 도구입니다.

**주요 활용 포인트:**
- **Uncertainty quantification**이 중요한 실무 문제
- **분포 가정**을 하기 어려운 상황
- **Finite-sample coverage** 보장이 필요한 경우
- **기존 ML 모델**에 uncertainty 정보 추가

다만, **marginal coverage만 보장**한다는 한계를 이해하고, **데이터 분할**과 **computational cost**를 고려하여 사용하는 것이 중요합니다.




## Coverage란?

**Coverage**는 prediction interval이 실제 값을 포함하는 비율을 의미합니다.

**예시:**
- 90% prediction interval을 만들었다면
- 100번의 예측 중 90번은 실제 값이 구간 안에 들어가야 함
- 이게 **90% coverage**입니다

## Marginal vs Conditional Coverage

Marginal은 "다른 변수를 모두 합산(또는 적분)해서 제거한 후 남은 것"을 의미합니다.

### Marginal Coverage
- **전체 데이터에 대한 평균 coverage**
- **모든 입력값 $X$에 대해 평균적으로** 목표 coverage 달성
- **개별 $X$ 값에서는** coverage가 달라질 수 있음

### Conditional Coverage
- **각 입력값 $X$에 대해 개별적으로** 목표 coverage 달성
- **모든 $X$에서 동일한 coverage** 보장

## 구체적 예시

**Marginal Coverage (90%):**
```
X=1일 때: 95% coverage (실제 95번/100번 포함)
X=2일 때: 85% coverage (실제 85번/100번 포함)
X=3일 때: 90% coverage (실제 90번/100번 포함)
→ 평균: 90% coverage ✅
```

**Conditional Coverage (90%):**
```
X=1일 때: 90% coverage (정확히 90번/100번 포함)
X=2일 때: 90% coverage (정확히 90번/100번 포함)  
X=3일 때: 90% coverage (정확히 90번/100번 포함)
→ 모든 X에서 90% coverage ✅
```

## 왜 Marginal Coverage만 보장하는가?

**Conformal prediction의 한계:**
- **Marginal coverage는 보장** ✅
- **Conditional coverage는 보장하지 않음** ❌

**이유:**
- 데이터 분할을 통해 전체적인 coverage만 조정
- 개별 $X$ 값별로는 coverage가 달라질 수 있음
- 더 정확한 conditional coverage를 위해서는 추가적인 방법 필요

**실무적 의미:**
- 전체적으로는 신뢰할 수 있는 구간
- 하지만 특정 입력값에서는 너무 넓거나 좁을 수 있음
- 이는 conformal prediction의 근본적인 한계입니다



# calibration set 구성 후 unconformal score에서 추출하는 과정 추가 설명

## 1. 상황 설정

* 우리는 이미 **분위수 회귀**로
  $\hat{q}_{lo}(x)$ (예: 10% 분위수),
  $\hat{q}_{hi}(x)$ (예: 90% 분위수)
  예측값을 얻었습니다.
* 이 예측 구간 $[\hat{q}_{lo}(x), \hat{q}_{hi}(x)]$이 실제로는 **80% 커버리지를 못 지킬 수 있음** → “너무 좁거나, 너무 넓음”.

그래서 **Conformal**이 “안전마진”을 더해서, 커버리지를 데이터 기반으로 보정합니다.

---

## 2. 왜 nonconformity score를 저렇게 정의하나?

정의:

$$
s_i = \max\{ \hat{q}_{lo}(x_i) - y_i,\; y_i - \hat{q}_{hi}(x_i),\; 0 \}
$$

즉, **캘리브레이션 세트에서 각 점이 예측 구간을 벗어난 정도**를 측정합니다.

* 만약 $y_i$가 구간 안에 있다면?
  $\hat{q}_{lo}(x_i) \le y_i \le \hat{q}_{hi}(x_i)$
  → 두 항 모두 음수 or 0 → $s_i = 0$
  (즉, 잘 커버한 경우 “벌점 없음”).

* 만약 $y_i$가 구간 아래쪽에 있다면?
  $y_i < \hat{q}_{lo}(x_i)$
  → 첫 번째 항 $\hat{q}_{lo}(x_i)-y_i > 0$
  → 구간보다 얼마나 “밑으로 벗어났는지”가 점수.

* 만약 $y_i$가 구간 위쪽에 있다면?
  $y_i > \hat{q}_{hi}(x_i)$
  → 두 번째 항 $y_i - \hat{q}_{hi}(x_i) > 0$
  → 구간보다 얼마나 “위로 벗어났는지”가 점수.

→ 결국 $s_i$는 “이 점이 구간에서 벗어난 거리(inside면 0)”입니다.

---

## 3. 분위수 $\hat{q}_\alpha$ 뽑는 이유

캘리브레이션 세트에서 모든 점수 $\{s_i\}$를 모아놓고, 그 중 **상위 $(1-\alpha)$-분위수**를 찾습니다.

* 예: $\alpha=0.2$ (80% 커버리지 원함).
* 점수들을 정렬했을 때, 위에서 80% 지점에 해당하는 값이 $\hat{q}_\alpha$.
  → “20% 정도는 이만큼 벗어나더라”는 안전마진.

---

## 4. 최종 보정된 구간

모든 새로운 $x$에 대해

$$
[\hat{q}_{lo}(x) - \hat{q}_\alpha,\;\; \hat{q}_{hi}(x) + \hat{q}_\alpha]
$$

* 원래 구간에 **좌우로 $\hat{q}_\alpha$만큼 확장**
* 그러면 (분포 불변 가정 하) 유한 표본에서도 **80% 이상 커버리지가 보장**됨.

---

## 5. 비유

* 원래 모델 구간 = “예상한 우산 크기”
* nonconformity score = “실제 비가 우산 바깥으로 튀어나온 거리”
* 그 거리들의 상위 분위수 = “안전 마진”
* 최종 구간 = “우산 크기 + 여유 마진” → 진짜로 비를 80% 막아냄.

---

👉 핵심 요약

* $s_i$: 캘리브레이션 데이터에서 **얼마나 구간에서 벗어났는가**
* $\hat{q}_\alpha$: 그 벗어난 정도 중 “상위 20% 컷오프”
* 최종 구간: 원래 구간에 이 마진을 더해 **커버리지를 보장**

---


# 관련 코드

```python
import pandas as pd
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error

# -------------------------
# 1) 데이터 준비
# -------------------------
# df 가 이미 메모리에 있다고 가정
X = df[["Cas_acd_endo", "Cas_clr", "Cas_ata", "size", "age"]].copy()
X["size"] = X["size"].astype(float)
y = df["meas_vault"].copy()

# -------------------------
# 2) Train / Calib / Test 분할 (예: 60/20/20)
# -------------------------
X_train_full, X_test, y_train_full, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)
X_train, X_calib, y_train, y_calib = train_test_split(
    X_train_full, y_train_full, test_size=0.25, random_state=42
)  # 0.25 of 0.8 = 0.2  -> 최종 60/20/20

# -------------------------
# 3) 분위수 모델 학습 (10, 25, 50, 75, 90)
#    - LightGBM은 각 분위수마다 별도 모델
# -------------------------
quantiles = [0.1, 0.25, 0.5, 0.75, 0.9]
models = {}

for q in quantiles:
    train_data = lgb.Dataset(X_train, label=y_train)
    params = {
        "objective": "quantile",
        "alpha": q,
        "metric": "quantile",
        "boosting_type": "gbdt",
        "learning_rate": 0.1,
        "num_leaves": 31,
        "verbose": -1,
        "seed": 42,
    }
    # 주의: lgb.train은 num_boost_round로 트리 개수 지정
    model = lgb.train(params, train_data, num_boost_round=200)
    models[q] = model

# -------------------------
# 4) 예측(캘리브레이션/테스트)
# -------------------------
def predict_quantiles(models, X_any, qs=quantiles):
    out = {}
    for q in qs:
        out[f"q{int(q*100)}"] = models[q].predict(X_any)
    df_pred = pd.DataFrame(out, index=X_any.index)
    # (권장) 교차 방지: q10 <= q50 <= q90 형태가 보장되도록 정렬
    order = [f"q{int(q*100)}" for q in qs]
    arr = df_pred[order].to_numpy()
    arr_sorted = np.sort(arr, axis=1)   # 오름차순으로 정렬
    df_pred[order] = arr_sorted
    return df_pred

pred_calib = predict_quantiles(models, X_calib)
pred_test  = predict_quantiles(models, X_test)

# -------------------------
# 5) 원래(비보정) 구간 성능 평가
# -------------------------
print("=== Original Quantile Regression Results (no conformal) ===")
for q in quantiles:
    col = f"q{int(q*100)}"
    pred = pred_test[col]
    quantile_loss = np.mean(np.where(y_test >= pred, q*(y_test - pred), (1-q)*(pred - y_test)))
    mae = mean_absolute_error(y_test, pred)
    rmse = np.sqrt(mean_squared_error(y_test, pred))
    print(f"Q{int(q*100)}: Quantile Loss={quantile_loss:.4f}, MAE={mae:.4f}, RMSE={rmse:.4f}")

# 비보정 80% 구간 커버리지
lower_raw = pred_test["q10"]
upper_raw = pred_test["q90"]
coverage_raw = np.mean((y_test >= lower_raw) & (y_test <= upper_raw))
print(f"\n[no conformal] 80% interval coverage: {coverage_raw:.4f}")

# -------------------------
# 6) Split Conformal (CQR) 보정
#    - alpha=0.2 => 80% 구간 목표
#    - nonconformity: max(q_lo - y, y - q_hi, 0)
# -------------------------
alpha = 0.20
q_lo_name = "q10"
q_hi_name = "q90"

q_lo_cal = pred_calib[q_lo_name].to_numpy()
q_hi_cal = pred_calib[q_hi_name].to_numpy()
y_cal = y_calib.to_numpy()

scores = np.maximum(q_lo_cal - y_cal, y_cal - q_hi_cal)
scores = np.maximum(scores, 0.0)  # 음수 방지(이론상 필요없지만 안전)

# 유한표본 보정(“higher” 방식). numpy 버전에 따라 method 인자 이름이 다를 수 있음.
try:
    q_hat = np.quantile(scores, 1 - alpha, method="higher")
except TypeError:
    # 구버전 numpy 호환
    q_hat = np.quantile(scores, 1 - alpha, interpolation="higher")

# -------------------------
# 7) 보정 구간 생성 및 커버리지 평가
# -------------------------
q_lo_test = pred_test[q_lo_name].to_numpy()
q_hi_test = pred_test[q_hi_name].to_numpy()

lower_cqr = q_lo_test - q_hat
upper_cqr = q_hi_test + q_hat

coverage_cqr = np.mean((y_test.to_numpy() >= lower_cqr) & (y_test.to_numpy() <= upper_cqr))

print(f"[conformal CQR] 80% interval coverage: {coverage_cqr:.4f}")
print(f"Conformal adjustment (q_hat) = {q_hat:.4f}")

# -------------------------
# 8) 결과 DataFrame 정리 (원/보정 구간)
# -------------------------
results_df = pd.DataFrame({
    "y_true": y_test,
    "q10_raw": lower_raw,
    "q50": pred_test["q50"],
    "q90_raw": upper_raw,
    "low_cqr": lower_cqr,
    "up_cqr": upper_cqr
}, index=y_test.index)

# 필요시 확인
# results_df.head()
```

