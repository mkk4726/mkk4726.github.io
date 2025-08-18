---
title: "보정된 확률(Calibrated Probability)이란?"
date: "2025-08-18"
excerpt: "머신러닝 모델의 확률 예측을 실제 관찰 빈도와 일치시키는 방법에 대한 정리"
category: "Data Science"
tags: ["calibration", "probability", "machine-learning", "logistic-regression", "platt-scaling"]
---

참고자료
- [Scikit-learn - Probability Calibration](https://scikit-learn.org/stable/modules/calibration.html)
- [Towards Data Science - Probability Calibration](https://towardsdatascience.com/probability-calibration-7c0e27119bb1)
- [Papers with Code - Calibration](https://paperswithcode.com/task/calibration)

# 보정된 확률(Calibrated Probability)이란?

---

머신러닝 모델이 예측한 확률이 실제 관찰된 빈도와 일치하는 정도를 의미합니다. 많은 경우 모델의 출력은 확률처럼 보이지만, 실제로는 보정되지 않은(uncalibrated) 상태입니다.

> **보정되지 않은 확률**: 모델이 예측한 확률이 실제와 다를 수 있음
> **보정된 확률**: 모델의 예측 확률이 실제 관찰 빈도와 일치

## 왜 보정이 필요한가?

### Logistic Regression의 경우

Logistic Regression은 0~1 사이의 값을 출력하지만, 이는 실제 확률과 다를 수 있습니다:

```
예측 확률 | 예측 횟수 | 실제 발생 횟수 | 실제 비율
80%      | 100      | 65             | 65% (overconfident)
30%      | 100      | 45             | 45% (underconfident)
90%      | 100      | 95             | 95% (well-calibrated)
```

### 보정되지 않은 확률의 원인

1. **정규화(Regularization)**: L1/L2 정규화가 확률 추정을 왜곡
2. **클래스 불균형**: 소수 클래스에 대해 underconfident
3. **모델 복잡성**: 복잡한 모델이 훈련 데이터에 과적합
4. **특성 스케일링**: 특성의 스케일이 확률 추정에 영향

## 보정 방법

### 1. Platt Scaling

로지스틱 회귀를 사용한 후처리 방법입니다:

$$P(y=1|x) = \frac{1}{1 + \exp(-a \cdot f(x) + b)}$$

여기서:
- $f(x)$: 원본 모델의 예측값
- $a, b$: 보정 파라미터 (검증 데이터로 학습)

### 2. Isotonic Regression

단조성 제약을 가진 비모수적 방법입니다:

$$P(y=1|x) = m(f(x))$$

여기서 $m$은 monotonic increasing function입니다.

### 3. Temperature Scaling

Softmax 출력을 조정하는 방법입니다:

$$P(y=k|x) = \frac{\exp(z_k/T)}{\sum_{i=1}^{K} \exp(z_i/T)}$$

여기서 $T$는 temperature parameter입니다.

## 실제 모델별 보정 필요성

### Tree-based Models (LightGBM, XGBoost)

Tree-based 모델들은 특히 보정이 필요합니다:

```
예측 확률 | 예측 횟수 | 실제 발생 횟수 | 실제 비율
90%      | 100      | 70             | 70% (overconfident)
10%      | 100      | 30             | 30% (underconfident)
```

**왜 이런 현상이 발생할까?**

1. **Boosting 특성**: 여러 weak learner를 순차적으로 결합하면서 확률 추정이 왜곡됨
2. **과적합**: 강력한 모델이 훈련 데이터에 과적합되어 과신(overconfident)하게 됨
3. **Loss function**: 분류 정확도에 최적화되어 있지 확률 추정에는 최적화되지 않음

**해결 방법**:
```python
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb

# LightGBM 모델
lgb_model = lgb.LGBMClassifier()

# 보정된 모델 (isotonic이 tree-based 모델에 더 적합)
calibrated_model = CalibratedClassifierCV(
    lgb_model, 
    method='isotonic',  # LightGBM에는 isotonic이 더 적합
    cv=5
)

# 보정된 확률 (이제 사용 가능)
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

## 보정 평가 방법

### Reliability Plot (Reliability Diagram)

예측 확률과 실제 관찰 빈도(observed frequency)를 비교하는 시각화:

```
예측 확률 구간 | 샘플 수 | 실제 양성 비율
[0.0, 0.1)     | 100    | 0.05
[0.1, 0.2)     | 150    | 0.12
...
[0.9, 1.0)     | 80     | 0.92
```

### Calibration Error

보정 품질을 정량적으로 측정:

$$\text{Calibration Error} = \sum_{i=1}^{B} \frac{n_i}{N} |p_i - \hat{p}_i|$$

여기서:
- $B$: number of bins
- $n_i$: number of samples in i-th bin
- $N$: total number of samples
- $p_i$: predicted probability in i-th bin
- $\hat{p}_i$: observed frequency in i-th bin

## 실제 구현 예시

### Python 코드

```python
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression

# 원본 모델
base_model = LogisticRegression()

# 보정된 모델 (Platt Scaling 사용)
calibrated_model = CalibratedClassifierCV(
    base_model, 
    method='sigmoid',  # Platt Scaling
    cv=5
)

# 학습
calibrated_model.fit(X_train, y_train)

# 보정된 확률 예측
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

### sklearn.calibration 모듈

`sklearn.calibration`은 실제로 존재하는 공식 모듈입니다:

```python
# 주요 import
from sklearn.calibration import CalibratedClassifierCV
from sklearn.calibration import calibration_curve

# calibration_curve 사용 예시
fraction_of_positives, mean_predicted_value = calibration_curve(
    y_true, y_pred, n_bins=10
)
```

**CalibratedClassifierCV의 주요 파라미터**:
- `method='sigmoid'`: Platt Scaling (로지스틱 회귀 기반)
- `method='isotonic'`: Isotonic Regression (비모수적 방법)
- `cv`: Cross-validation fold 수

## 보정의 중요성

### 1. 의사결정 지원

- 확률 기반 의사결정에서 신뢰성(reliability) 확보
- 리스크 평가의 정확성 향상

### 2. 비즈니스 응용

- **의료진단**: 질병 발생 확률의 정확한 추정
- **금융리스크**: 대출 상환 확률의 신뢰성
- **추천시스템**: 사용자 선호도 확률의 정확성

### 3. 모델 평가

- 단순 정확도 외에 확률적 성능(probabilistic performance) 측정
- 모델의 불확실성(uncertainty)에 대한 이해

## 주의사항

1. **데이터 누수(Data Leakage)**: 보정 시 검증 데이터를 별도로 사용
2. **도메인 변화(Domain Shift)**: 새로운 도메인에서는 재보정 필요
3. **계산 비용(Computational Cost)**: 보정 과정에서 추가적인 계산 오버헤드

## 결론

보정된 확률은 머신러닝 모델의 출력을 실제 확률과 일치시키는 중요한 과정입니다. 특히 의사결정이 중요한 응용 분야에서는 모델의 확률 예측이 신뢰할 수 있어야 하므로, 적절한 보정 방법을 적용하는 것이 필수적입니다.

**중요한 점**:
- **Logistic Regression**: 기본적으로 보정이 필요
- **Tree-based Models (LightGBM, XGBoost)**: 특히 보정이 필수적
- **sklearn.calibration**: 공식적으로 제공되는 보정 도구
- **method 선택**: 
  - `sigmoid`: 선형 모델에 적합
  - `isotonic`: tree-based 모델에 더 적합

따라서 `predict_proba`를 직접 확률로 사용하면 안 되고, 반드시 보정 과정을 거쳐야 합니다.
