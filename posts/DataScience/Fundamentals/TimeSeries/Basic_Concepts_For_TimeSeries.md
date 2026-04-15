---
title: 시계열에서 사용되는 기본 개념들 정리
date: 2026-04-15
excerpt: ARIMA, ACF, PACF, Stationary 등의 개념들에 대해 이해해보기
category: TimeSeries
tags:
  - TimeSeries
Done: false
---

이번에 정리할 키워드들
: ARIMA, 정상성 (Stationary), 정상성 검증 (ACF, PACF, ADF Test)

---

## 시계열 데이터의 특징

시계열 데이터는 일반적인 데이터 혹은 테이블 데이터와 다르게 "자기상관성"을 가진다.
이건 오늘 나의 몸무게가 어제 나의 몸무게와 높은 상관성을 가진다는 말이다.
따라서 오늘 나의 몸무게를 예측하기 위해서 어제 나의 몸무게가 중요한 피처로 사용된다.

대표적인 ARIMA 모델이나 피처 엔지니어링을 통한 GBDT 활용도 이런 과거 데이터를 피처로 사용하기 위한 개념들이다.

---
## AR (Auto Regressive)

가장 기본적으로 과거의 데이터로 현재의 데이터를 모델링할 수 있다.

$$
y_t = c + \phi_1 y_{t-1} + \phi_2 y_{t-2} + \cdots + \phi_p y_{t-p} + \epsilon_t
$$
- $p$: lag 개수 → AR(p)
- $\phi_i$​: 각 lag의 계수
- $\epsilon_t$​: white noise (오차)

lag y를 feature로 하는 linear regression으로도 이해할 수 있다.

> AR 모델의 한계는 $\epsilon_t$ 를 활용하지 못한다는 것.
> -> 오차구조를 모델링하지 않음

$y_t$와 $y_{t-1}$ 간의 관계만을 모델링하기 때문에 underfitting 될 수 밖에 없음

이걸 해결하기 위해 나온 개념이 MR!

---
## MA (Moving Average)

$$
y_t = c + \epsilon_t + \theta_1 \epsilon_{t-1} + \theta_2 \epsilon_{t-2} + \cdots + \theta_q \epsilon_{t-q}
$$

당연히 오차항만으로 모델링해서 사용하진 않고, AR 개념과 합쳐서 사용함

---

## ARMA (AutoRegressive MovingAverage)

$$
y_t = c + \phi_1 y_{t-1} + \cdots + \phi_p y_{t-p} + \epsilon_t + \theta_1 \epsilon_{t-1} + \cdots + \theta_q \epsilon_{t-q}
$$

ARMA 모델은 "정상성"을 가정하고 있음.
어쩌면 당연한건데, 모델의 파라미터는 공통됨 (시점 t별로 존재하지 않음)
따라서 시점 t별로 데이터의 특징이 달라진다면, 이 모델은 엉망이 됨.

이게 정상성의 개념

---

## 정상성 (Stationary)

> 시간에 따라 데이터의 특징이변하지 않음.

이건 다시 말하면

> 시간에 따라 평균, 분산, 자기상관 구조가 변하지 않는다

1. 평균이 일정
2. 분산이 일정
3. 자기상관 구조가 일정
$$
\begin{aligned}
&\text{(1) Mean:} && E[y_t] = \mu \quad (\text{time-invariant}) \\
&\text{(2) Variance:} && \mathrm{Var}(y_t) = \sigma^2 \\
&\text{(3) Covariance:} && \mathrm{Cov}(y_t, y_{t-k}) = \gamma(k)
\end{aligned}
$$

