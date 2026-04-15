---
title: 시계열에서 사용되는 기본 개념들 정리
date: 2026-04-15
excerpt: ARIMA, ACF, PACF, Stationary 등의 개념들에 대해 이해해보기
category: TimeSeries
tags:
  - TimeSeries
Done: true
---

이번 글에서 정리하는 키워드들
- 모델 : AR, MA, ARMA, ARIMA, SARIMA
- 개념: 정상성 (Stationary), 정상성 검증 (ACF, PACF, ADF Test)

![[Pasted image 20260415215117.png|632]]

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
따라서 시점 t별로 데이터의 특징이 달라진다면, 이 모델은 엉망이 됨. (학습할 수 없음)

---

## 정상성 (Stationary)

> 시간에 따라 데이터의 특징이 변하지 않는다

이건 다시 말하면 다음 조건을 만족한다는 것.

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

이게 보장이 되어야 MA, AR, ARMA 등의 모델의 성능이 보장이된다. 학습할 수 있다.

하지만 보통의 데이터는 정상성을 만족하지 못한다.
다음과 같은 비정상성들이 존재
- **추세 (Trend)** — 시간에 따라 평균이 지속적으로 증가/감소하는 패턴
- **계절성 (Seasonality)** — 일정 주기로 반복되는 패턴 (월별, 분기별 등)
- **주기성 (Cyclicality)** — 계절성보다 긴 불규칙한 주기의 패턴
- **구조적 변화 (Structural Break)** — 특정 시점에 수준이나 기울기가 급변하는 것

비정상성을 없애고 정상성을 만족시키도록 해줘야 함
이때 쓰이는 것 중 하나가 "차분"

---
## 차분 (Differencing)

> 시계열 자체 대신 **값의 변화량**을 보자

- 1차 차분:  $y'_t = y_t - y_{t-1}$
- 2차 차분: $y''_t = y'_t - y'_{t-1}$

비정상성 중 "추세"만 제거할 수 있음.

- 추세가 존재 -> $y_t = \alpha + \beta t + \epsilon_t$ 
- $E[y_t] = \alpha + \beta_t$ -> 평균이 일정하지 않음
- $E[y'_t] = \beta$ -> 평균이 일정


---

## ARIMA

![[Pasted image 20260415215214.png|673]]
개념 요약

![[Pasted image 20260415215458.png|614]]
ARMA에 차분 개념을 더한게 ARIMA

수식으로 보면:
$$\phi_p(B)\,(1 - B)^d \, y_t = \theta_q(B)\,\varepsilon_t$$
여기서
- $\phi_p(B) = 1 - \phi_1 B - \phi_2 B^2 - \cdots - \phi_p B^p$
- $\theta_q(B) = 1 + \theta_1 B + \theta_2 B^2 + \cdots + \theta_q B^q$



근데 ARIMA는 계절성을 잡지 못함
![[Pasted image 20260415215612.png|644]]

---

## SARIMA

![[Pasted image 20260415215948.png]]

ARIMA에서 계절성 요인을 추가한 모델
![[Pasted image 20260415215702.png|655]]

$$
\Phi_P(B^s)\,\phi_p(B)\,(1 - B)^d\,(1 - B^s)^D \, y_t
=
\Theta_Q(B^s)\,\theta_q(B)\,\varepsilon_t
$$

모델은 이렇게 생겼음. 하나씩 보자면,
- 비계절 AR : $\phi_p(B) = 1 - \phi_1 B - \phi_2 B^2 - \cdots - \phi_p B^p$
- 계절 AR : $\Phi_P(B^s) = 1 - \Phi_1 B^s - \Phi_2 B^{2s} - \cdots - \Phi_P B^{Ps}$
- 비계절 MA : $\theta_q(B) = 1 + \theta_1 B + \theta_2 B^2 + \cdots + \theta_q B^q$
- 계절 MA : $\Theta_Q(B^s) = 1 + \Theta_1 B^s + \Theta_2 B^{2s} + \cdots + \Theta_Q B^{Qs}$

여기서
- B: backshift operator ($B y_t = y_{t-1}$​)
- $s$ : seasonality (예: 월별이면 12)
- $\varepsilon_t$ : white noise

---
## ACF

> 시계열 데이터에서 시차(lag) k만큼 떨어진 두 값 사이의 상관관계를 측정

$$\rho_k = \frac{\text{Cov}(Y_t, Y_{t-k})}{\text{Var}(Y_t)}$$

ACF로 정상성에 대한 감을 잡아볼 수 있음
> ACF는 “검정”이 아니라 **시각적 heuristic**

정상성이 보장된 데이터는 lag가 커질수록 공분산이 급격히 감소함.

(1) 비정상 (Non-stationary, 주로 Trend 존재)
- ACF가 **천천히 감소 (slow decay)**
- 거의 모든 lag에서 유의미한 값
- 형태: 완만한 곡선
👉 해석:
- “과거 값의 영향이 오래 지속됨”
- unit root 가능성 높음

→ 대응: **차분 (d 증가)**

(2)정상 (Stationary)
- ACF가 **빠르게 0으로 수렴**
- 몇 개 lag 이후는 신뢰구간 안 (≈ white noise 수준)
👉 해석:
- short memory process
- AR/MA 모델링 가능 상태

> 또 MA의 차수를 결정하는데 사용할 수  있음.

ACF로 비정상성이 있는지 감을 잡고 -> 차분(d) 진행
차분이 된 데이터로 ACF를 통해 MA(q)의 q차수를 정해볼 수 있음.

```
1. 그래프로 대략 정상/비정상 파악
         ↓
2. ADF Test로 통계적으로 정상성 확인
         ↓
   비정상이면 → 차분(differencing) → 다시 ADF Test
         ↓
3. ACF / PACF로 p, q 차수 결정
         ↓
4. ARIMA(p, d, q) 모델 적합
```

---

## PACF

ACF는 $Y_t$ 와 $Y_{t-k}$ 간의 관계를 정확히 보기 어려움. 
관계가 없더라도 $Y_t$ 와 $Y_{t-1}$ 이 관계가 있고, $Y_{t-1}$ 과 $Y_{t-k}$ 가 관계가 있을 수 있으니까.

PACF는 다음 회귀의 계수로 정의된다:
$$y_t = \phi_{k,1} y_{t-1} + \phi_{k,2} y_{t-2} + \cdots + \phi_{k,k} y_{t-k} + \varepsilon_t$$
여기서:
- $\text{PACF}(k) = \phi_{k,k}$
- 즉, **lag k까지 포함한 AR(k) 회귀에서 마지막 계수**

이렇게 하면 다른 영향은 제거하고 진짜 관계를 볼 수 있어서
이걸 통해 AR(p)에서 p를 어떻게 정할지 알 수 있음.

---

## ADF Test

> 단위근(Unit Root) 이 있으면 비정상 시계열이라는 원리를 이용한 통계적 검정.

AR(1) 모델: $Y_t = \phi Y_{t-1} + \epsilon_t$
- $\phi = 1$ → 충격이 사라지지 않고 **영구히 누적** → **비정상** (분산이 시간에 따라 증가)
- $|\phi| < 1$ → 충격이 시간이 지나면 **소멸** → **정상**
- $|\phi| > 1$ -> 폭발적으로 증가 (이건 검증 대상은 아님)

|가설|내용|
|---|---|
|귀무가설 H₀|단위근이 존재한다 → **비정상**|
|대립가설 H₁|단위근이 없다 → **정상**|

|p-value|해석|
|---|---|
|**p < 0.05**|H₀ 기각 → **정상 시계열** ✅|
|**p ≥ 0.05**|H₀ 채택 → **비정상 시계열** → 차분 필요 ❌|

