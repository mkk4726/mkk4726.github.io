---
title: "ML의 prediction interval은 어떻게 정의할 수 있을까?"
date: "2025-08-12"
excerpt: "ML의 prediction interval 정의하는 법 정리"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1 : [Confidence vs Prediction Intervals: Understanding the Difference](https://www.datacamp.com/blog/confidence-intervals-vs-prediction-intervals)




## Prediction Interval vs Confidence Interval

- **Prediction Interval (PI)**: 새 관측치 $Y$가 주어진 $X$에서 포함될 구간. 조건부 coverage를 목표로 함.
$$
\mathbb{P}\big( Y \in [L_\alpha(X),\ U_\alpha(X)]\mid X\big) \ge 1-\alpha
$$

- **Confidence Interval (CI)**: 조건부 평균 $\mu(X)=\mathbb{E}[Y\mid X]$ 같은 모수적 target이 구간에 포함될 확률.
$$
\mathbb{P}\big( \mu(X)\in \hat C_\alpha(X) \big) \ge 1-\alpha
$$

- 핵심 차이: CI는 mean estimator의 불확실성(주로 epistemic)을, PI는 mean 주변의 noise(aleatoric)까지 포함해 “개별 예측값”의 불확실성을 다룸. 따라서 동일한 설정에서 PI의 폭이 CI보다 넓음.


## ML에서의 불확실성 (Uncertainty)

- **Aleatoric uncertainty**: 데이터 자체의 내재적 변동성(heteroscedastic noise 포함). 더 많은 데이터로도 완전히 제거되지 않음.
- **Epistemic uncertainty**: 모델/파라미터에 대한 불확실성. 데이터가 많아지면 감소.
- **Calibration**: 목표 coverage(예: 90%)에 실제 커버리지가 맞도록 조정.
- **Coverage 유형**: marginal vs conditional. 실무에서는 분포 가정이 약할 때도 사용할 수 있는 marginal coverage 도구(예: conformal)가 유용.


## 구현 방법들

### 1) Quantile Regression

- 아이디어: $\tau$-quantile 함수 $q_\tau(x)$를 직접 학습해 $[q_\alpha(x), q_{1-\alpha}(x)]$를 PI로 사용.
- Loss(“pinball loss”):
$$
\mathcal{L}_\tau\big(y, \hat q_\tau(x)\big)
= \max\big(\, \tau\,[y-\hat q_\tau(x)],\ (\tau-1)[y-\hat q_\tau(x)]\,\big)
$$
- 구현 팁:
  - 두 모델(or multi-head)로 $q_\alpha, q_{1-\alpha}$ 동시 학습
  - quantile crossing 방지: monotonicity penalty 또는 joint training
- 장점: heteroscedastic noise에 강함, 분포 가정 최소화. 단점: calibration 보장은 없음(사후 조정 가능).

### 2) Conformal Prediction

- 가정: 예측 시점과 calibration 데이터가 exchangeable.
- Split conformal(대중적 실무 절차):
  1. 데이터 분할: train / calibration
  2. train으로 predictor $\hat f$ 학습
  3. calibration에서 비적합도(nonconformity) 계산. 대칭 PI의 경우 $r_i = |y_i - \hat f(x_i)|$
  4. $\hat Q$ = $(1-\alpha)(1+1/n_{cal})$-quantile of $\{r_i\}$
  5. 새 입력 $x$에 대해 $[\hat f(x)-\hat Q,\ \hat f(x)+\hat Q]$

- Quantile 기반(CQR): quantile regressors $\hat q_\alpha, \hat q_{1-\alpha}$의 비적합도
$$
e_i = \max\big(\hat q_\alpha(x_i)-y_i,\ y_i-\hat q_{1-\alpha}(x_i),\ 0\big)
$$
  를 통해 $\hat Q$를 구하고, 최종 구간을 $[\hat q_\alpha(x)-\hat Q,\ \hat q_{1-\alpha}(x)+\hat Q]$로 설정.

- 장점: 분포/모델에 거의 비의존적이며 finite-sample marginal coverage 보장. 단점: 데이터 분할 필요, conditional coverage는 일반적으로 미보장.

### 3) Ensemble Methods

- Bootstrap ensemble, Random Forest, Deep Ensemble 등으로 여러 예측 $\{\hat f_k(x)\}_{k=1}^K$을 얻어 분산을 추정.
- 단순히 ensemble 분산으로 $\hat f(x) \pm z\cdot \hat\sigma_{ens}(x)$를 만들면 calibration이 보장되지 않음.
- 실무 팁: **Jackknife+ / Bootstrap+** 같은 conformalized ensemble을 사용하면 finite-sample coverage에 가까운 보정을 달성.
  - 예: Jackknife+는 leave-one-out 예측 분포를 이용해 하한/상한의 적절한 order statistic을 취해 구간 구성.
- 장점: 구현 용이, epistemic 반영. 단점: 데이터/계산 비용 증가, 별도 calibration 권장.

### 4) Bayesian Approaches

- 목표: posterior predictive $p(y\mid x, \mathcal{D})$로부터 구간 산출.
$$
p(y\mid x, \mathcal{D}) 
= \int p(y\mid x, \theta)\, p(\theta\mid \mathcal{D})\, d\theta
$$
- 구현 예: Bayesian Linear Regression, Gaussian Process, MC Dropout(Bayesian approximation), Stochastic VI, Laplace Approximation 등.
- 절차: posterior predictive의 quantile을 취해 PI 구성.
- 장점: 불확실성 분해 가능(epistemic/aleatoric), 해석력. 단점: 모델/사전 분포에 민감, 대규모 딥러닝에서 근사 필요.


## 실무 체크리스트

- **Coverage vs Width**: 목표 coverage(예: 90%)를 달성하면서 구간 폭을 최소화.
- **Calibration plot**: nominal vs empirical coverage 곡선 확인.
- **Shift robustness**: OOD 상황에서 coverage 붕괴 가능 → 위험구간 탐지, abstention, 최근접-밀도 기반 보완 고려.
- **메소드 선택 가이드**
  - 데이터가 크고 분포 가정이 약함: Conformal(CQR) 우선
  - Heteroscedastic 뚜렷: Quantile Regression(+ conformal calibration)
  - Ensemble을 이미 사용: Jackknife+/Bootstrap+로 conformalize
  - Probabilistic modeling 선호/가능: Bayesian posterior predictive
