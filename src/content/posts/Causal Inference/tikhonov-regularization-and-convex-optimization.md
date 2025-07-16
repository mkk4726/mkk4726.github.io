---
title: "Tikhonov Regularization과 Convex Optimization: 연속형 처치 R-learner의 이론적 배경"
date: "2025-07-16"
excerpt: "Ill-posed problem을 해결하는 Tikhonov regularization과 convex optimization의 원리"
category: "Causal Inference"
tags: ["Theory", "Optimization", "Regularization"]
---

# 개요
---

연속형 처치에서 R-learner를 적용할 때 발생하는 **non-identification 문제**를 해결하기 위해 **Tikhonov regularization**과 **convex optimization** 이론이 핵심적인 역할을 합니다. 이 글에서는 이러한 수학적 도구들의 원리와 응용을 자세히 설명합니다.

# 1. Ill-posed Problem과 Non-identification
---

## 1.1 Well-posed vs Ill-posed Problem

**Well-posed problem (잘 정의된 문제)** 의 3가지 조건:
1. **존재성 (Existence)**: 해가 존재한다
2. **유일성 (Uniqueness)**: 해가 유일하다  
3. **안정성 (Stability)**: 입력의 작은 변화가 해의 작은 변화를 가져온다

**Ill-posed problem**은 이 중 하나 이상의 조건을 만족하지 않는 문제입니다.

## 1.2 연속형 처치에서의 Non-identification

연속형 처치 R-learner에서는 **유일성 조건**이 위반됩니다:

$$L_c(h) = E\left[\left\{Y - m(X) - h(X, T) + E_{\varpi}\{h(X, T) \mid X\}\right\}^2\right]$$

이 손실함수를 최소화하는 해집합은:
$$S = \{h \mid h(X, T) = \tau(X, T) + s(X) \text{ a.s., for any } s \in L_2^P(X)\}$$

> **문제**: 무한히 많은 해가 존재하여 유일한 CATE 함수 $\tau(x, t)$를 식별할 수 없음

# 2. Tikhonov Regularization
---

## 2.1 기본 원리

**Tikhonov regularization**은 ill-posed problem을 well-posed problem으로 변환하는 방법입니다.

**원래 문제**:
$$\min_{h} L(h)$$

**정규화된 문제**:
$$\min_{h} L(h) + \rho \|h\|^2$$

여기서:
- $\rho > 0$: 정규화 매개변수
- $\|h\|^2$: 정규화 항 (일반적으로 $L_2$ norm)

## 2.2 연속형 처치 R-learner에서의 적용

$$
\begin{equation}
\tau_\rho = \arg \min_{h \in L_2^P(X,T)} \left[ L_c(h) + \rho \|h\|_{L_2^P}^2 \right]
\end{equation}
$$

**정규화 항의 역할**:
- $\|h\|_{L_2^P}^2 = E\{h^2(X, T)\}$
- 함수의 "크기"를 제한하여 과적합 방지
- 무한히 많던 해를 유일한 해로 수렴시킴

## 2.3 Tikhonov 정리

**정리**: 정규화 매개변수 $\rho > 0$가 주어졌을 때, 정규화된 문제는 유일한 해 $\tau_\rho$를 가진다.

**증명 아이디어**:
1. $L_c(h)$는 convex하지만 strictly convex하지 않음
2. $\rho \|h\|_{L_2^P}^2$는 strictly convex함
3. 둘의 합은 strictly convex가 되어 유일한 최솟값을 가짐

# 3. Convex Optimization
---

## 3.1 Convex Function의 정의

함수 $f: \mathbb{R}^n \to \mathbb{R}$가 **convex**하다는 것은:

$$f(\lambda x + (1-\lambda) y) \leq \lambda f(x) + (1-\lambda) f(y)$$

모든 $x, y \in \text{dom}(f)$와 $\lambda \in [0, 1]$에 대해 성립함을 의미합니다.

## 3.2 Strictly Convex Function

함수 $f$가 **strictly convex**하다는 것은:

$$f(\lambda x + (1-\lambda) y) < \lambda f(x) + (1-\lambda) f(y)$$

$x \neq y$이고 $\lambda \in (0, 1)$일 때 **부등호가 엄격함**을 의미합니다.

## 3.3 Convex Function의 중요한 성질

### 성질 1: 유일한 최솟값
- **Convex function**: 지역 최솟값 = 전역 최솟값
- **Strictly convex function**: 최솟값이 **유일함**

### 성질 2: 최적화의 용이성
- 경사하강법이 전역 최솟값으로 수렴 보장
- 수치적 안정성

### 성질 3: Jensen's Inequality
$$E[f(X)] \geq f(E[X])$$

## 3.4 R-learner에서의 Convexity

**원래 손실함수 $L_c(h)$**:
- Convex하지만 strictly convex하지 않음
- 따라서 최솟값이 유일하지 않음

**정규화된 손실함수 $L_c(h) + \rho \|h\|^2$**:
- $\rho \|h\|^2$가 strictly convex함
- 전체 함수가 strictly convex가 됨
- **유일한 최솟값** 보장

# 4. 수학적 증명
---

## 4.1 $\|h\|_{L_2^P}^2$가 Strictly Convex임을 증명

**정리**: $\|h\|_{L_2^P}^2 = E\{h^2(X, T)\}$는 strictly convex하다.

**증명**:
임의의 $h_1 \neq h_2$와 $\lambda \in (0, 1)$에 대해:

$$
\begin{align}
\|\lambda h_1 + (1-\lambda) h_2\|_{L_2^P}^2 &= E\{[\lambda h_1(X,T) + (1-\lambda) h_2(X,T)]^2\} \\
&= E\{\lambda^2 h_1^2(X,T) + 2\lambda(1-\lambda) h_1(X,T)h_2(X,T) + (1-\lambda)^2 h_2^2(X,T)\} \\
&= \lambda^2 E\{h_1^2(X,T)\} + 2\lambda(1-\lambda) E\{h_1(X,T)h_2(X,T)\} + (1-\lambda)^2 E\{h_2^2(X,T)\}
\end{align}
$$

Cauchy-Schwarz 부등식에 의해:
$$E\{h_1(X,T)h_2(X,T)\} \leq \sqrt{E\{h_1^2(X,T)\}} \sqrt{E\{h_2^2(X,T)\}}$$

$h_1 \neq h_2$일 때 부등호가 strict하므로:
$$\|\lambda h_1 + (1-\lambda) h_2\|_{L_2^P}^2 < \lambda \|h_1\|_{L_2^P}^2 + (1-\lambda) \|h_2\|_{L_2^P}^2$$

## 4.2 정규화된 손실함수의 Strict Convexity

**결론**: $L_{c,\ell_2}(h \mid \rho) = L_c(h) + \rho \|h\|_{L_2^P}^2$는 $\rho > 0$일 때 strictly convex하다.

**이유**: 
- $L_c(h)$는 convex
- $\rho \|h\|_{L_2^P}^2$는 strictly convex  
- Convex + Strictly convex = Strictly convex

# 5. 실제 응용과 의미
---

## 5.1 Two-step Procedure

**Step 1**: Tikhonov regularization으로 중간 함수 추정
$$\tilde{\tau}_\rho = \arg \min_{h} \left[ L_c(h) + \rho \|h\|_{L_2^P}^2 \right]$$

**Step 2**: Zero-constraining operator로 최종 CATE 추정
$$\tau(x, t) = \text{ZeroConstraint}(\tilde{\tau}_\rho(x, t))$$

## 5.2 정규화 매개변수 $\rho$의 역할

**$\rho$가 작을 때**:
- 원래 문제에 가까움
- Bias는 작지만 variance가 클 수 있음

**$\rho$가 클 때**:
- 정규화 효과가 강함  
- Variance는 작지만 bias가 클 수 있음

**최적 $\rho$ 선택**:
- Cross-validation
- Information criteria (AIC, BIC)
- Theoretical convergence rate

## 5.3 수렴 속도와 점근적 성질

정규화된 추정량 $\hat{\tau}_\rho$는 다음과 같은 우수한 성질을 가집니다:

1. **Consistency**: $\hat{\tau}_\rho \to \tau$ as $n \to \infty$
2. **Convergence rate**: $O_p(n^{-r})$ for some $r > 0$  
3. **Asymptotic normality**: $\sqrt{n}(\hat{\tau}_\rho - \tau) \xrightarrow{d} N(0, \Sigma)$

# 6. 다른 정규화 방법과의 비교
---

## 6.1 Ridge vs Lasso vs Tikhonov

| 방법 | 정규화 항 | 특징 |
|------|-----------|------|
| **Ridge** | $\lambda \|\beta\|_2^2$ | 계수 축소, 변수 선택 X |
| **Lasso** | $\lambda \|\beta\|_1$ | 변수 선택, 희소성 |
| **Tikhonov** | $\rho \|h\|_{L_2^P}^2$ | 함수 공간에서의 정규화 |

## 6.2 다른 해결 방법들

**Alternative 1**: Truncated SVD
- 특이값 분해 후 작은 특이값 제거
- 수치적 방법

**Alternative 2**: Iterative methods  
- Landweber iteration
- Conjugate gradient methods

**Alternative 3**: Bayesian approach
- Prior distribution 설정
- Posterior inference

# 7. 결론
---

**Tikhonov regularization의 핵심 장점**:

1. **이론적 보장**: Strictly convex optimization으로 유일한 해 보장
2. **수치적 안정성**: Well-conditioned 문제로 변환
3. **일반성**: 다양한 ill-posed problem에 적용 가능
4. **구현 용이성**: 기존 최적화 알고리즘 활용 가능

**연속형 처치 R-learner에서의 의미**:
- Non-identification 문제의 근본적 해결
- 실용적인 CATE 추정 방법 제공  
- 이론적 분석과 실제 구현의 교량 역할

이러한 수학적 도구들은 단순히 기술적 문제를 해결하는 것을 넘어서, **인과추론의 근본적인 어려움을 이해하고 극복하는 방법**을 제시합니다.

---

**참고 문헌**:
- Tikhonov, A. N. (1963). On the solution of ill-posed problems and the method of regularization
- Boyd, S., & Vandenberghe, L. (2004). Convex optimization
- Wahba, G. (1990). Spline models for observational data
- Engl, H. W., Hanke, M., & Neubauer, A. (2000). Regularization of inverse problems 