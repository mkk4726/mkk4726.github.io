---
title: "Quantile Regression이란?"
date: "2025-08-13"
excerpt: "특정 분위수를 직접 예측하는 quantile regression은 어떻게 학습되는가?"
category: "Data Science"
tags: ["regression", "quantile", "prediction-interval", "pinball-loss"]
---

quantile regression은 기존의 회귀분석과 다르게 특정 분위수 (quantile)을 예측하는 방법입니다.
이를 통해 예측구간 등을 추정할 수 있습니다. 신뢰수준 0.9 예측구간은 0.05 quantile과 0.95 quantile을 통해 추정할 수 있습니다.

---

## 전통적 회귀분석 vs Quantile Regression

기존의 regression과는 목적이 다릅니다. 따라서 다른 loss함수를 사용하고 있습니다.

**전통적 회귀분석 (OLS):**
- 목표: 조건부 평균 $\mathbb{E}[Y|X]$ 예측
- Loss: Mean Squared Error (MSE)
- 가정: 오차가 정규분포를 따름

**Quantile Regression:**
- 목표: 조건부 분위수 $q_\tau(Y|X)$ 예측
- Loss: Pinball Loss (Quantile Loss)
- 가정: 분포 가정 없음, 더 robust

---

## Pinball Loss (Quantile Loss)

Quantile regression의 핵심은 **pinball loss** 입니다.
이를 통해 모델이 분위수를 예측하도록 유도할 수 있습니다.

$$
\mathcal{L}_\tau(y, \hat{q}_\tau(x)) = \max\big(\tau \cdot [y - \hat{q}_\tau(x)], (1-\tau) \cdot [\hat{q}_\tau(x) - y]\big)
$$

위의 식을 통해 아래와 같이 이해할 수 있습니다.

- $\tau = 0.5$ (중앙값): 양쪽 오차에 동일한 페널티
- $\tau = 0.9$ (90분위수): 
  - 예측값이 실제값보다 작으면 큰 페널티
  - 예측값이 실제값보다 크면 작은 페널티
- $\tau = 0.1$ (10분위수): 반대 패턴

<figure>
<img src="/post/DataScience/pinball_loss.png" alt="pinball_loss" /><width="100%"/>
<figcaption>그림1. Pinball Loss</figcaption>
</figure>

pinball loss는 비대칭 손실을 정의한 것입니다. (MSE는 대칭 손실)
그림1을 보면, 실제 값보다 작게 예측했을 때는 큰 패널티를, 크게 예측했을 때는 작은 패널티를 부여하고 있음을 알 수 있습니다.

이를 통해 모델이 90%의 데이터가 예측값보다 작도록, 10%의 데이터가 예측값보다 크도록 예측값을 높게 설정하게 됩니다.

### 구체적인 예시

실제 데이터로 검증해보겠습니다.

**예시: 90분위수 예측**

실제 데이터가 `[1, 3, 5, 7, 9, 11, 13, 15, 17, 19]`라고 가정해보겠습니다.
90분위수는 **17**입니다 (10개 중 9개가 17보다 작음).

#### 모델 학습 과정

1. **초기 예측값**: 10 (중간값)

2. **손실 계산**:
   - `y > 10`인 데이터: `[11, 13, 15, 17, 19]` (5개)
   - `y < 10`인 데이터: `[1, 3, 5, 7, 9]` (5개)

3. **90분위수 손실** ($\tau = 0.9$):
   - 과소예측 오차: $0.9 \times (11-10 + 13-10 + 15-10 + 17-10 + 19-10) = 0.9 \times 25 = 22.5$
   - 과대예측 오차: $0.1 \times (10-1 + 10-3 + 10-5 + 10-7 + 10-9) = 0.1 \times 20 = 2.0$
   - **총 손실**: 24.5

#### 모델이 예측값을 높이는 이유

- **과소예측에 큰 페널티(0.9배)**가 있기 때문에:
  - 모델은 $y > \hat{q}_{0.9}$인 데이터를 줄이려고 함
  - 즉, 예측값을 높여서 더 많은 데이터가 예측값보다 작게 만들려고 함

- **과대예측에 작은 페널티(0.1배)**가 있기 때문에:
  - 모델은 $y < \hat{q}_{0.9}$인 데이터가 많아져도 큰 문제없음

#### 최적해 도달

모델이 예측값을 17로 설정하면:
- `y > 17`: `[19]` (1개, 10%)
- `y < 17`: `[1, 3, 5, 7, 9, 11, 13, 15]` (8개, 80%)
- `y = 17`: `[17]` (1개, 10%)

**정확히 90%의 데이터가 17보다 작거나 같게 됩니다!**

이렇게 비대칭 손실 함수가 모델을 자동으로 올바른 분위수로 "밀어올리는" 것입니다.

---

## Prediction Interval 구성

Quantile regression으로 prediction interval을 만들 수 있습니다.

1. **두 개의 quantile 모델 학습:**
   - $\tau = \alpha/2$ (하한)
   - $\tau = 1 - \alpha/2$ (상한)

2. **Prediction Interval:**
   $$[q_{\alpha/2}(x), q_{1-\alpha/2}(x)]$$

### 예시: 90% Prediction Interval
- $\tau = 0.05$ 모델로 하한 예측
- $\tau = 0.95$ 모델로 상한 예측
- 결과: $[q_{0.05}(x), q_{0.95}(x)]$

---

장점과 특징을 정리하면 아래와 같습니다.

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

---