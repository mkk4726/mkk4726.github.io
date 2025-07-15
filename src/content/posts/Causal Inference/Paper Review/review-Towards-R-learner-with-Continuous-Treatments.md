---
title: "[Paper Review] Towards R-learner with Continuous Treatments"
date: "2025-07-11"
excerpt: "연속형 처치를 위한 R-learner를 어떻게 구현할 수 있는지에 대한 논의"
category: "Causal Inference"
tags: ["Paper Review"]
---

[paper link](https://arxiv.org/pdf/2208.00872)

# 논문의 배경
---

[Quasi-Oracle Estimation of Heterogeneous Treatment Effects](https://arxiv.org/pdf/1712.04912) 에서 개인화 처치 효과를 추정하는 방법을 제안했습니다.

<small> * 개인화 처치효과 : 어떤 처치를 했을 때 개인별로 어떤 효과가 있을지 추정한 것</small>

개인화 처치효과를 추정하는 건 인과추론의 가장 핵심적인 문제이며, 이는 다양한 분야에서 통찰을 제공합니다.
예를 들어 정밀의학에서는 환자별 처치 효과를 추정하여 처치 선택을 결정하고, 교육에서는 학생별 처치 효과를 추정하여 교육 방법을 결정하고, 온라인 마케팅에서는 사용자별 처치 효과를 추정하여 맞춤형 광고를 제공하고, 오프라인 정책 평가에서는 지역별 처치 효과를 추정하여 정책을 결정할 수 있습니다.

> 즉, 개인화 처치효과를 알게 되면 어떤 선택에 대한 근거를 제공할 수 있습니다.

기존 논문에서는 이진 처치의 개인화 처치효과를 추정하는 방법을 이야기했고, 이 논문에서는 이를 확장해서 연속형 처치에 대해서도 이를 적용하기 위한 방법론을 이 논문에서 이야기하고 있습니다.

[[Paper Review] Quasi-Oracle Estimation of Heterogeneous Treatment Effects](/posts/Causal%20Inference/review-Quasi-Oracle-Estimation-of-Heterogeneous-Treatment-Effects) <- 이 논문에 대한 리뷰는 여기서 확인할 수 있습니다.

> 기존의 방법을 확장할 때 발생하는 문제와 이를 해결한 방법론에 대한 이야기에 집중해서 이 논문을 이해했습니다.

간단히 요약하면 다음과 같습니다
1. 이진 처치에서는 처치효과를 추정하는 방법이 있었는데, 이를 연속형 처치로 확장하면 문제가 발생한다. (유일해를 가지지 않는 문제)
2. 이를 해결하기 위해서 2가지 방법을 제안한다.
   1. Tikhonov regularization
   2. zero-constraining operator를 통해서 해결한다.


# 논문 내용 정리
---

## Abstract
---

> However, extending the R-learner framework from binary to continuous treatments introduces a non-identifiability issue, as the functional zero constraint inherent to the conditional average treatment effect cannot be directly imposed in the R-loss under continuous treatments

이 논문의 핵심 주장입니다.   
> binary 를 continuous로 확장하면 non-identifiability issue가 발생한다.

이걸 해결하기 위한 과정을 **identification strategy**라고 칭하고 있습니다.
2가지 과정을 통해 이를 구현한다고 합니다.
1. Tikhonov regularization
2. zero-constraining operator

왜 이슈가 발생하고 어떻게 해결했는지를 이해하는게 이 논문의 핵심이라고 이해됩니다.
그리고 이 논문에서 generalized R-loss를 정의했는데, 이 수식이 어떻게 유도되는지를 이해하는 부분도 큰 도움이 됩니다.

## 1. Introduction
---
> Estimating heterogeneous treatment effects is fundamental in causal inference and provides insights into various fields, including precision medicine, education, online marketing, and offline policy evaluation

개인별 처치효과를 추정하는 건 다양한 분야에서 중요한 정보를 제공해줄 수 있기에 중요한 문제입니다.

The treatment effect heterogeneity can be quantified by: 
$$
\begin{equation}
\tau(x, t) = E[Y^{(t)} - Y^{(0)} | X = x]
\end{equation}
$$
- $t = 0$ : reference treatment level

heterogeneous treatment effects는 conditional average treatment effect (CATE)로 정의됩니다.
이는 조건부로 처치효과를 계산한 값을 의미합니다. (환자의 조건이 x일 때의 ATE)


>  On the contrary, the R-learner and its variants (Kennedy, 2023) target the treatment effect estimatio

[Towards Optimal Doubly Robust Estimation of Heterogeneous Causal Effects](https://arxiv.org/pdf/2004.14497)

기존의 다른 연구들은 이 CATE를 직접적으로 추정하지 않았지만 R-learner 모델은 이를 직접적으로 추정하고 있습니다.

> The R-learner capitalizes on the decomposition of the outcome model initially proposed by Robinson (1988) in partially linear models and extends for machine learning-based treatment effect estimation (Nie and Wager, 2021)


R-learner는 partially linear model에서 제안한 수학적 분해 방법을 기반으로 삼아서 이를 머신러닝 기반 처치효과 추정으로 확장된 개념입니다.
이에 대한 간단한 정리는 [What is FWL?](/posts/Causal%20Inference/2025-07-02-what-is-fwl)에서 확인할 수 있습니다.

**참고 논문**: 
- Robinson, P. M. (1988). Root-N-consistent semiparametric regression. Econometrica, 56(4), 931-954. [[논문 링크](https://www.jstor.org/stable/1912705)]
- Nie, X., & Wager, S. (2021). Quasi-oracle estimation of heterogeneous treatment effects. Biometrika, 108(2), 299-319. [[논문 링크](https://arxiv.org/abs/1712.04912)]

> Notably, when using the two nuisance functions estimated under flexible models, the R-learner preserves the oracle property of treatment effect estimation as though the nuisance functions were known. Despite these advantages, the current R-learner framework applies only to binary or categorical treatments.

R-learner의 중요한 특징은 유연한 모델을 통해 두 개의 nuisance function을 추정하더라도, 마치 이 함수들이 정확히 알려진 것처럼 처치효과 추정의 oracle 성질을 유지한다는 점입니다. 하지만 이러한 장점에도 불구하고, 현재 R-learner 프레임워크는 이진형 또는 범주형 처치에만 적용할 수 있다는 한계가 있습니다.


> In this article, we extend the R-learner framework to estimate the conditional average treatment effect flexibly with continuous treatments. This extension is nontrivial in both identification and estimation. Echoing the approach of Nie and Wager (2021), we focus on adapting the generalized R-learner loss function with continuous treatments.

이 논문에서는 R-learner 프레임워크를 연속형 처치에 대해서 확장해서 CATE를 추정하는 방법을 제안합니다.
이 확장은 식별과 추정 모두에서 어려운 문제입니다. Nie와 Wager (2021)의 접근 방식을 따라서 연속형 처치에 대한 일반화된 R-learner 손실 함수를 적용하는 방법을 중점적으로 다룹니다.

이진처치 ($T = 1$ or $T = 0$ 이 존재하는 경우)와 다르게 연속형일 경우에 발생하는 어려움들에 대해 이야기하며 이를 해결하기 위한 방법을 제안합니다.

> Unlike the binary-treatment case, we demonstrate that directly minimizing the generalized R-loss does not uniquely identify $\tau (x, t)$ but instead identifies a broad class of functions.

이진처치와 달리, 연속형 처치에서는 R-loss를 최소화하는 것만으로는 유일한 CATE 함수를 식별할 수 없고, 대신 함수들의 넓은 집합만을 식별할 수 있다고 설명합니다. 
이것이 바로 non-identifiability issue의 핵심입니다.

이진처치의 경우 zero condition ($\tau (x, t): \tau (x, 0) \equiv 0$)을 만족하는 것이 쉽지만, 연속형 처치의 경우에는 이를 만족하는 것이 쉽지 않기 때문입니다.

간단하게 설명해보면, 이진처치의 경우 zero condition을 만족하고 이게 cate function을 유일하게 추정하도록 해주지만, 연속형 처치의 경우에는 zero condition을 만족하는 것이 쉽지 않기 때문에 이를 만족하는 함수들의 넓은 집합만을 추정하게 된다고 이해할 수 있습니다.

논문에서는 이 non-identifiability 문제를 해결하기 위해 **ℓ2-정규화된 R-learner**를 제안합니다. 이 방법은 Tikhonov 정규화 원리를 기반으로 합니다.

#### 1. Tikhonov 정규화란?

Tikhonov 정규화는 **ill-posed problem**(잘 정의되지 않은 문제)을 해결하기 위한 방법입니다. 연속형 처치에서 발생하는 non-identifiability 문제가 바로 이런 ill-posed problem의 대표적인 예입니다.

**핵심 아이디어**: 
- 문제가 너무 유연해서 해가 무수히 많을 때
- 추가적인 제약조건(정규화)을 도입하여 해를 유일하게 만듦
- 수학적으로는 `||f||²` 같은 정규화 항을 손실 함수에 추가

#### 2. 2단계 추정 과정

논문의 핵심은 **2단계 추정 과정**을 통해 문제를 해결하는 것입니다:

**1단계**: 중간 함수 추정
```
τ̃(x, t) = τ(x, t) - E{τ(X, T) | X = x}
```

**2단계**: Zero-constraining operator를 통한 변환
```
τ(x, t) = 변환(τ̃(x, t))
```

#### 3. Zero-constraining operator의 역할

이 operator는 추정된 함수가 항상 zero condition을 만족하도록 보장합니다:
- τ(x, 0) = 0 (기준 처치 수준에서의 효과는 0)
- 이를 통해 유일한 해를 찾을 수 있음

#### 4. Sieve 방법론

**Sieve 방법**은 무한차원 함수 공간을 유한차원으로 근사하는 방법입니다:

**기본 아이디어**:
- 무한차원 함수를 유한개의 기저 함수들의 선형결합으로 근사
- 예: 다항식, 스플라인, 푸리에 급수 등

**수학적 표현**:
```
τ(x, t) ≈ Σᵢ βᵢ φᵢ(x, t)
```
여기서 φᵢ(x, t)는 기저 함수들입니다.

#### 5. 저차원 행렬과 Non-identification

일반적인 sieve 회귀와 달리, 이 논문에서는 **저차원 행렬**이 등장합니다. 이는 연속형 처치에서 발생하는 non-identification 문제의 수학적 표현입니다.

**핵심 개념**: 
- Generalized R-loss의 non-identification 특성 때문에 행렬이 ill-conditioned가 됨
- 행렬의 고유값들이 0에 가까워져서 수치적 불안정성 발생
- 이는 행렬 교란 이론(matrix perturbation theory)과 스펙트럴 분석이 필요한 이유

**자세한 이론적 배경**: [Ill-conditioned 행렬과 고유값: 연속형 처치 R-learner의 이론적 배경](/posts/Causal%20Inference/ill-conditioned-matrix-theory)

#### 6. 수렴 속도의 특징

**핵심 결과**: 
> "nuisance 함수들이 oP(n^(-1/4)) 수렴 속도로 근사될 수 있다면, 추정량의 수렴 속도는 결과 모델의 매끄러움에 의존하지 않고, 오직 CATE와 propensity score 함수의 매끄러움에만 의존한다"

**의미**:
- 결과 모델의 복잡성에 관계없이 좋은 성능 보장
- CATE와 propensity score만 잘 추정되면 됨
- 이는 **double robustness**의 연속형 버전

#### 7. 점근적 정규성과 추론

**점근적 정규성**: 
- 추정량이 정규분포로 수렴
- 이를 통해 신뢰구간과 가설검정 가능

**닫힌 형태 분산 추정량**:
- 복잡한 부트스트랩 없이도 분산 계산 가능
- 계산 효율성 향상

**참고 논문**:
- Tikhonov, A. N. (1963). On the solution of ill-posed problems and the method of regularization. Doklady Akademii Nauk SSSR, 151(3), 501-504. [[논문 링크](https://www.mathnet.ru/php/archive.phtml?wshow=paper&jrnid=dan&paperid=26736&option_lang=eng)]
- Bhatia, R. (2013). Matrix analysis. Springer Science & Business Media. [[책 링크](https://link.springer.com/book/10.1007/978-1-4612-0653-8)]
- Chen, X. (2007). Large sample sieve estimation of semi-nonparametric models. Handbook of econometrics, 6, 5549-5632. [[논문 링크](https://www.sciencedirect.com/science/article/abs/pii/S1573441207060066)]

**핵심 개념들**:
- **Ill-posed problem**: 해가 유일하지 않거나 불안정한 문제
- **Tikhonov regularization**: 정규화를 통한 ill-posed problem 해결
- **Sieve method**: 무한차원을 유한차원으로 근사하는 방법
- **Matrix perturbation theory**: 행렬의 작은 변화가 고유값에 미치는 영향 연구
- **Spectral analysis**: 행렬의 고유값과 고유벡터 분석


### 1.1 Setup and notation

이론적 배경과 관련한 수식을 정리합니다.

- $\{Z_i = (X_i, T_i, Y_i)\}_{i=1}^n$ : independent and identically distributed samples from the distribution of $(X, T, Y)$
- $X = (X^{(1)}, \ldots, X^{(d)})$ : $d$-dimensional vector of covariates. 
- $Y^{(t)}$ : potential outcome had the unit received treatment level $T = t \in \mathbb{R}$
- $\tau(x, t)$ : causal estimand defined in (1)

Under Rubin's causal model framework (Rubin, 1974), 
$$
\begin{equation}
\tau(x, t) = E[Y^{(t)} - Y^{(0)} | X = x]
\end{equation}
$$

> Due to the fundamental problem in causal inference that not all potential outcomes can be observed for a particular unit, $\tau(x, t)$ is not identifiable without further assumptions. We employ common assumptions for continuous treatments (Kennedy et al., 2017).

인과추론에서는 모든 관측값을 확인할 수 없는 상태에서 처치효과를 추정하기 위해서 3가지의 가정이 존재합니다.

**Assumption 1 (No unmeasured confounding).** We have $\{Y^{(t)}\}_{t \in \mathcal{T}} \perp\!\!\!\perp T \mid X$

**Assumption 2 (Stable unit and treatment value).** When $T = t \in \mathcal{T}$, we have $Y = Y^{(t)}$

**Assumption 3 (Positivity).** There exists an $\epsilon > 0$ such that the generalized propensity score $f(T = t \mid X = x) \in (\epsilon, 1/\epsilon)$ for any $(x, t) \in \mathcal{X} \times \mathcal{T}$.

**Notation**:

- For any vector $v$, $\|v\|$ denotes its $\ell_2$ norm
- For any random variable $W \in \mathcal{W}$, $f(w)$ and $P(w)$ denote its probability density function and probability measure
- For any function $g(w)$:
  - $P_n\{g(W)\} = \frac{1}{n}\sum_{i=1}^n g(W_i)$ denotes its empirical expectation
  - $\|g\|_{L_2} = \left\{\int_{w \in \mathcal{W}} g^2(w) dw\right\}^{1/2}$ denotes its $L_2$ norm
  - $\|g\|_{L_2^P} = \left\{\int_{w \in \mathcal{W}} g^2(w) dP(w)\right\}^{1/2}$ denotes its $L_2^P$ norm  
  - $\|g\|_{\mathcal{W}} = \sup_{w \in \mathcal{W}} |g(w)|$ denotes its $L_\infty$ norm
- $L_2^P(\mathcal{W})$ represents the function space of all $g(w)$ with a bounded $L_2^P$ norm
- When $g(w)$ is a multivariate function, denote $\|g\|_{\mathcal{W}} = \sup_{w \in \mathcal{W}} \|g(w)\|$

**Nuisance Functions**:

- **Conditional outcome mean**: $m(x) = E(Y \mid X = x)$
- **Generalized propensity score**: $\varpi(t \mid x) = f(T = t \mid X = x)$

**Full conditional outcome mean model**:
$$\mu(x, t) = E(Y \mid X = x, T = t)$$

**Observation noises**:
$$\varepsilon_i = Y_i - \mu(X_i, T_i), \quad i = 1, \ldots, n$$

where $E(\varepsilon_i \mid X_i, T_i) = 0$, following the definition of $\mu(x, t)$.

## 2. Generalized R-learner
---

### 2.1 The generalized R-loss
---

> We first generalize the idea of the Robinson's residual (Robinson, 1988; Nie and Wager, 2021) to the continuous-treatment scenario. 

이번 절에서는 일반화된 R-loss를 어떻게 유도하는지에 대해 설명합니다.

The unconfoundedness and stable unit and treatment value imply:

$$
\begin{equation}
Y_i^{(T_i)} = \mu(X_i, T_i) + \varepsilon_i = \mu(X_i, 0) + \tau(X_i, T_i) + \varepsilon_i \tag{3}
\end{equation}
$$

> **해석**: 
> - **첫 번째 등식**: Assumption 2와 equation (2)에서 유도
> - **두 번째 등식**: Assumption 1과 $\tau(x, t)$의 정의에서 유도
> - **특징**: 비모수적 모델이며 추가적인 구조적 가정이 없음

**Step 2: 조건부 기댓값 계산**:

Given $X_i$, taking the conditional expectation on (3) leads to:

$$
\begin{equation}
m(X_i) = E\left[Y_i^{(T_i)} \mid X = X_i\right] = \mu(X_i, 0) + E_{\varpi}\{\tau(X, T) \mid X = X_i\} \tag{4}
\end{equation}
$$

> **전체 기댓값 법칙 적용**:
> $$E(\varepsilon_i \mid X_i) = E\left[E(\varepsilon_i \mid X_i, T_i) \mid X_i\right] = E[0 \mid X_i] = 0$$

**일반화된 Propensity Score 기댓값**:

The notation $E_{\varpi}\{\tau(X, T) \mid X = X_i\}$ in (4) highlights the dependency of the conditional expectation on the generalized propensity score as:

$$E_{\varpi}\{\tau(X, T) \mid X = X_i\} = \int_{t \in \mathcal{T}} \tau(X_i, t) \varpi(t \mid X_i) dt$$

> **핵심**: 연속형 처치에서는 적분을 통해 모든 처치 수준에 대한 가중 평균을 계산

**Step 3: 잔차 도출**:

By subtracting (4) from (3) on both left- and right-hand sides, we have:

$$
\begin{equation}
Y_i^{(T_i)} - m(X_i) = \tau(X_i, T_i) - E_{\varpi}\{\tau(X, T) \mid X = X_i\} + \varepsilon_i \tag{5}
\end{equation}
$$

> **해석**: 
> - **좌변**: 관찰된 결과에서 조건부 평균을 뺀 값 (Robinson's residual)
> - **우변**: 처치효과에서 평균 처치효과를 뺀 값 + 노이즈

**Step 4: 손실 함수 도출**:

By treating the left-hand side of (5) as the response and the right-hand side except $\varepsilon_i$ as the mean function, we derive the following population loss function:

$$
\begin{equation}
L_c(h) = E\left[\left\{Y - m(X) - h(X, T) + E_{\varpi}\{h(X, T) \mid X\}\right\}^2\right] \tag{6}
\end{equation}
$$

> **핵심 특징**:
> - **최적해**: $h = \tau$에서 최소화됨
> - **일반화**: 이진 처치 R-learner의 자연스러운 확장
> - **참고**: Nie and Wager (2021, §7)의 다중 처치 설정에서 유사한 손실함수 등장

**이진 처치와의 연결**:

> In particular, under the binary-treatment case, $\tau(x, t)$ reduces to $\{\tau(x, 0), \tau(x, 1)\}$, where $\tau(x, 0) = E(Y^{(0)} - Y^{(0)} \mid X = x) = 0$ for any $x \in \mathcal{X}$, and $\tau(x, 1)$ is the conditional average treatment effect of interest. It suffices to estimate $\tau(x, 1)$ by solving the $h(\cdot, 1)$ that minimizes (6), after imposing a zero condition of $h(\cdot, 0)$:

$$
\begin{equation}
h(x, 0) = 0, \quad \text{for any } x \in \mathcal{X} \tag{7}
\end{equation}
$$

> **Zero condition**: 기준 처치 수준에서의 효과는 0으로 설정

**이진 처치 R-loss로의 환원**:

유도된 일반화된 R-loss가 기존의 이진 처치에서의 loss function으로 유도될 수 있음을 설명합니다.

> More specifically, observing that under (7) one has $h(X, T) - E_e\{h(X, T) \mid X\} = \{T - e(X)\}h(X, 1)$ a.s., where $e(x) = \text{pr}(T = 1 \mid X = x)$ is the propensity score, the R-loss function (6) reduces to:

$$
\begin{equation}
L_b(h) = E\left[\left\{Y - m(X) - \{T - e(X)\}h(X, 1)\right\}^2\right] \tag{8}
\end{equation}
$$

> **핵심**: 
> - **조건**: $h(x, 0) = 0$ (zero condition)
> - **결과**: $h(X, T) - E_e\{h(X, T) \mid X\} = \{T - e(X)\}h(X, 1)$
> - **의미**: 일반화된 R-loss가 이진 처치의 고전적 R-loss로 환원됨

> **핵심**: T가 1 or 0인 상황에서 zero condition을 고려해 (6)번 수식을 전개하면 기존의 이진 처치에서의 손실함수 수식과 같은 (8)번 수식을 얻을 수 있습니다.


### 2.2 Non-identification of the generalized R-loss
---

> The R-learner for continuous treatment will have poor estimation performance, due to the non-unique identifiability of the generalized R-loss

**핵심 문제**:

이 절에서는 **non-identification 문제**에 대해 설명합니다. 연속형 처치에서 일반화된 R-loss를 직접 최소화하면 유일한 해를 찾을 수 없다는 것이 핵심 문제입니다.

**해집합 정의**:

$$
\begin{equation}
S = \{h \mid h(X, T) = \tau(X, T) + s(X) \text{ a.s., for any } s \in L_2^P(X)\} \tag{9}
\end{equation}
$$

> **해석**: $S$는 목표 함수 $\tau(X, T)$에 공변량 $X$의 함수 $s(X)$를 더한 모든 함수들의 집합

**검증 과정**:

> It is easy to check that for any $h \in S$:

$$
Y - m(X) - [h(X, T) - E_{\varpi}\{h(X, T) \mid X\}] = Y - m(X) - [\tau(X, T) - E_{\varpi}\{\tau(X, T) \mid X\}] \text{ a.s.}
$$

> **의미**: $S$에 속한 모든 함수 $h$가 동일한 손실값을 가짐


**Non-identification 문제**:

> From (6), any function $h \in S$ minimizes the generalized R-loss $L_c(\cdot)$. Therefore, when $T$ is continuous, directly minimizing the generalized R-loss fails to uniquely identify the target estimand $\tau(x, t)$, as there are **infinitely many solutions** in $S$.

> **핵심 문제**: 
> - 연속형 처치에서는 무한히 많은 해가 존재
> - 유일한 CATE 함수를 식별할 수 없음
> - 이는 **ill-posed problem**의 전형적인 예

**이론적 근거**:

> This result theoretically substantiates the ill-posedness of estimating $\tau(x, t)$ by minimizing the empirical counterpart of $L_c(\cdot)$ using nonparametric estimators, and also explains the failure-to-estimate issue illustrated in Fig. 1.

> Part (i) of Proposition 1 below rigorously proves that $S$ in fact contains **all minima** of $L_c(\cdot)$ in $L_2^P(X, T)$.

**이진 처치와의 대비**:

> In contrast, minimizing the binary-treatment R-loss (8) which incorporates the zero condition (7), can successfully identify $\tau$, because (7) narrows the general solution set $S$ into:

$$
\begin{equation}
S^\natural = \{h \mid h(X, T) = \tau(X, T) \text{ a.s.}\} \tag{10}
\end{equation}
$$

> **핵심 차이**:
> - **연속형**: $S$ (무한히 많은 해)
> - **이진형**: $S^\natural$ (유일한 해)
> - **원인**: Zero condition (7)이 해집합을 좁혀줌

**Proposition 1** - Suppose Assumptions 1–2 hold. Then, the following statements hold:

> **Part (i)**: 처치 T가 연속형인 경우, S는 다음 최적화 문제의 해답해다.
> - **최적화 문제**: $\arg\min_{h \in L_2^P(X,T)} L_c(h)$
> - **해집합**: $S$

> **Part (ii)**: 처치 T가 이진형인 경우, S는 다음 최적화 문제의 해답해다.
> - **최적화 문제**: $\arg\min_{h \in \mathcal{L}_b} L_b(h)$
> - **해집합**: $S^\natural$

> **결과**: 관심 함수들의 집합 $\mathcal{L}_b = \{h \mid h(\cdot, 1) \in L_2^P(X) \text{ and } h(X, 0) = 0 \text{ a.s.}\}$ 중에서, (10)의 $S^\natural$가 다음 최적화 문제의 해집합이다:
> - **최적화 문제**: $\arg\min_{h \in \mathcal{L}_b} L_b(h)$
> - **해집합**: $S^\natural$

> **의미**: 이진형 처치에서는 zero condition이 적용된 R-loss $L_b(h)$의 최소화가 유일한 해 $S^\natural$를 제공

**핵심 차이점**:

| 구분 | 연속형 처치 | 이진형 처치 |
|------|-------------|-------------|
| **최적화 문제** | $\arg\min_{h \in L_2^P(X,T)} L_c(h)$ | $\arg\min_{h \in \mathcal{L}_b} L_b(h)$ |
| **해집합** | $S$ (무한히 많은 해) | $S^\natural$ (유일한 해) |
| **제약조건** | 없음 | $h(X, 0) = 0$ (zero condition) |
| **식별 가능성** | ❌ 불가능 | ✅ 가능 |



### 2.3 One-step nonparametric identification with a functional zero constraint

논문에서 계속해서 이야기하고 있는 것은 zero-condition을 통해 이진 처치의 경우 유일해를 얻었지만, 연속 처치의 경우 유일해를 얻지 못한다는 것입니다.


# 논문에서 의문이 들었던 부분들 정리
---

## 왜 이진 처치에서는 Zero Condition이 적용되고, 연속 처치에서는 적용되지 않을까?
---

### 이진 처치에서의 Zero Condition

**이진 처치의 특성**:
- 처치 수준: $T \in \{0, 1\}$ (이산적)
- 목표: $\tau(x, 1)$ (처치 효과)만 추정
- 기준점: $T = 0$ (통제 그룹)

**Zero Condition의 자연스러운 적용**:
$$\tau(x, 0) = E[Y^{(0)} - Y^{(0)} \mid X = x] = 0$$

> **이유**: 
> - $T = 0$은 "처치를 받지 않은 상태"를 의미
> - 같은 상태에서의 차이는 당연히 0
> - 이는 **자연스러운 제약조건**이 됨

**수학적 효과**:
- 해집합 $S$에서 $h(x, 0) = 0$ 조건을 추가
- $S^\natural = \{h \mid h(X, T) = \tau(X, T) \text{ a.s.}\}$로 축소
- **유일한 해** 보장

### 연속 처치에서의 문제

**연속 처치의 특성**:
- 처치 수준: $T \in \mathbb{R}$ (연속적)
- 목표: $\tau(x, t)$ for all $t \in \mathcal{T}$ (모든 처치 수준에서의 효과)
- 기준점: $T = 0$이 **임의적**일 수 있음

**Zero Condition 적용의 한계**:
> $L_b$를 통해 이진처치에서는 zero-condtion을 loss 함수에 녹여낼 수 있었는데, 연속형에서는 이를 loss function에 녹여낼 수 없다.

문제는 “zero condition을 R-loss 안에서 직접 구현하기 어렵다”는 점입니다.
Binary T에서는 T∈{0, 1}이라 (T-e(X))h(X,1) 형태로 식을 재정리하면 h(x,0)=0이 자동으로 내재됩니다.


### 핵심 차이점 요약

| 구분 | 이진 처치 | 연속 처치 |
|------|-----------|-----------|
| **처치 특성** | 이산적 $\{0, 1\}$ | 연속적 $\mathbb{R}$ |
| **기준점** | $T = 0$ (자연스러움) | $T = 0$ (임의적) |
| **Zero Condition** | 수식에서 쉽게 강제 가능 | 무한차원 제약 → 구현 난이도 높음 |
| **해집합(이론)** | $S^\natural$ (유일) | $S$ (무한) |
| **식별 가능성(실전)** | ✅ 가능 | ❌ 추가 장치 필요 |

## "h(x, 0)=0만 강제하면 되지 않나?" – 왜 실전에서는 안 통할까?
---

수학적으로는 $h(x,0)=0$을 정확히 부과하면 $s(x)=−\tau(x,0)=0$이 되어 해가 유일합니다.  문제는 **모델 학습 단계에서 이 무한차원 제약을 그대로 구현하기 어렵다**는 점에 있습니다.

1. 실무에서는 $h$를 신경망·트리·커널 등 **유연한 함수 근사기**로 파라미터화하고, 손실을 확률적 경사하강법으로 최소화합니다.
   - 이때 “$t=0$에서 반드시 0”이라는 제약을 네트워크 출력 전체에 강제하기가 쉽지 않습니다.
2. 그래서 학습 과정에서는 $\hat{h}(x,t) = \tau(x,t) + s(x)$ 꼴의 함수도 손실을 동일하게 만들 수 있습니다.
   - 이유: R-loss 안의 $E[h(X,T)\mid X]$ 항에서 $s(x)$가 상쇄되기 때문입니다.
3. 즉, **zero condition을 코드에 명시하지 않으면** 여전히 식별 실패(ill-posed)가 발생합니다.

따라서 저자들은 다음과 같은 두 단계 절차를 제안합니다.
- **1단계**: 제약 없이 $\tilde{h}$를 학습
- **2단계**: 특수한 사상("zero-constraining operator")으로 $\tilde{h}$를 $t=0$에서 0이 되도록 변환
- 추가로 **Tikhonov 정규화**를 넣어 수치적 안정성을 확보합니다.













