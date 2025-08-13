---
title: "Quantile Regression: 평균이 아닌 분위수를 예측하는 방법"
date: "2025-08-13"
excerpt: "전통적인 회귀분석과 달리 특정 분위수를 직접 예측하는 quantile regression의 개념과 활용법"
category: "Data Science"
tags: ["statistics", "regression", "quantile", "prediction-interval"]
---

## Quantile Regression이란?

**Quantile regression**은 전통적인 회귀분석과 달리 **특정 분위수(quantile)를 직접 예측**하는 방법입니다.

### 전통적 회귀분석 vs Quantile Regression

**전통적 회귀분석 (OLS):**
- 목표: 조건부 평균 $\mathbb{E}[Y|X]$ 예측
- Loss: Mean Squared Error (MSE)
- 가정: 오차가 정규분포를 따름

**Quantile Regression:**
- 목표: 조건부 분위수 $q_\tau(Y|X)$ 예측
- Loss: Pinball Loss (Quantile Loss)
- 가정: 분포 가정 없음, 더 robust

## Pinball Loss (Quantile Loss)

Quantile regression의 핵심은 **pinball loss**입니다:

$$
\mathcal{L}_\tau(y, \hat{q}_\tau(x)) = \max\big(\tau \cdot [y - \hat{q}_\tau(x)], (1-\tau) \cdot [\hat{q}_\tau(x) - y]\big)
$$

### Pinball Loss의 직관적 이해

- $\tau = 0.5$ (중앙값): 양쪽 오차에 동일한 페널티
- $\tau = 0.9$ (90분위수): 
  - 예측값이 실제값보다 작으면 큰 페널티
  - 예측값이 실제값보다 크면 작은 페널티
- $\tau = 0.1$ (10분위수): 반대 패턴

## Prediction Interval 구성

Quantile regression으로 prediction interval을 만들 수 있습니다:

1. **두 개의 quantile 모델 학습:**
   - $\tau = \alpha/2$ (하한)
   - $\tau = 1 - \alpha/2$ (상한)

2. **Prediction Interval:**
   $$[q_{\alpha/2}(x), q_{1-\alpha/2}(x)]$$

### 예시: 90% Prediction Interval
- $\tau = 0.05$ 모델로 하한 예측
- $\tau = 0.95$ 모델로 상한 예측
- 결과: $[q_{0.05}(x), q_{0.95}(x)]$

## 장점과 특징

### 장점
- **분포 가정 불필요**: 정규성 가정 없이도 작동
- **Heteroscedasticity 대응**: 분산이 일정하지 않아도 적합
- **Outlier robust**: 극값에 덜 민감
- **직관적 해석**: 분위수는 비선형 변환에도 불변

### 특징
- **비대칭성**: 분포가 비대칭일 때 더 정확
- **계산 효율성**: 선형 프로그래밍으로 해결 가능
- **해석력**: 각 변수의 영향력을 분위수별로 분석 가능

## 구현 방법

### Python 예시 (scikit-learn)

```python
from sklearn.linear_model import QuantileRegressor
import numpy as np

# 데이터 준비
X = np.random.randn(1000, 2)
y = X[:, 0] + X[:, 1] + np.random.randn(1000) * (1 + abs(X[:, 0]))

# 10분위수와 90분위수 모델 학습
q10_model = QuantileRegressor(quantile=0.1, alpha=0)
q90_model = QuantileRegressor(quantile=0.9, alpha=0)

q10_model.fit(X, y)
q90_model.fit(X, y)

# Prediction interval
q10_pred = q10_model.predict(X)
q90_pred = q90_model.predict(X)

# 80% prediction interval
pi_lower = q10_pred
pi_upper = q90_pred
```

### LightGBM에서의 구현

```python
import lightgbm as lgb

# Quantile regression을 위한 파라미터
params = {
    'objective': 'quantile',
    'metric': 'quantile',
    'quantile': 0.1,  # 10분위수
    'boosting_type': 'gbdt'
}

# 모델 학습
model_q10 = lgb.train(params, train_data)
model_q90 = lgb.train(params, train_data)

# Prediction interval
q10_pred = model_q10.predict(X_test)
q90_pred = model_q90.predict(X_test)
```

## 실무 활용 사례

### 1. 금융 리스크 관리
- **VaR (Value at Risk)**: 특정 분위수로 위험 측정
- **Credit scoring**: 대출 상환 확률의 분위수 예측

### 2. 의료 진단
- **혈압 예측**: 정상 범위의 상하한 예측
- **약물 반응**: 개인별 반응의 분위수 예측

### 3. 제조업 품질 관리
- **품질 지표**: 제품 특성의 허용 범위 예측
- **불량률 예측**: 특정 임계값 이하/이상 확률

### 4. 부동산 가격 예측
- **가격 범위**: 시장 변동성을 고려한 가격 구간
- **투자 리스크**: 하락 가능성과 상승 가능성 동시 고려

## 주의사항과 한계

### 주의사항
- **Quantile crossing**: 높은 분위수가 낮은 분위수보다 작아질 수 있음
- **Calibration**: 실제 coverage가 목표 coverage와 다를 수 있음
- **데이터 요구량**: 극단적 분위수 예측에는 충분한 데이터 필요

### 한계
- **계산 복잡도**: OLS보다 계산 비용 높음
- **해석 복잡성**: 여러 분위수 모델의 동시 해석 필요
- **불확실성 분해**: epistemic vs aleatoric uncertainty 구분 어려움

## 최신 발전 동향

### 1. Deep Quantile Regression
- 신경망 기반 quantile regression
- 복잡한 비선형 관계 모델링

### 2. Conformal Quantile Regression
- Finite-sample coverage 보장
- Calibration 자동화

### 3. Multi-task Quantile Learning
- 여러 분위수를 동시에 학습
- Quantile crossing 방지

## 결론

Quantile regression은 전통적인 회귀분석의 한계를 넘어서는 강력한 도구입니다. 특히:

- **Prediction interval** 구성에 매우 유용
- **분포 가정 없이** robust한 예측 가능
- **실무적 해석**이 직관적이고 명확

다만, 여러 분위수 모델의 동시 학습과 calibration 등 실무적 고려사항을 잘 파악하고 사용하는 것이 중요합니다.

---

**참고자료:**
- [Quantile Regression - Wikipedia](https://en.wikipedia.org/wiki/Quantile_regression)
- [scikit-learn QuantileRegressor](https://scikit-learn.org/stable/modules/generated/sklearn.linear_model.QuantileRegressor.html)
- [LightGBM Quantile Regression](https://lightgbm.readthedocs.io/en/latest/Parameters.html#objective)
