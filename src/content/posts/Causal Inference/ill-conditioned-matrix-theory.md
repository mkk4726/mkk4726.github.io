---
title: "Ill-conditioned 행렬과 고유값: 연속형 처치 R-learner의 이론적 배경"
date: "2025-07-11"
excerpt: "연속형 처치에서 발생하는 non-identification 문제와 ill-conditioned 행렬, 고유값의 관계를 자세히 설명"
category: "Causal Inference"
tags: ["Theory", "Linear Algebra", "Matrix Analysis"]
---

# Ill-conditioned 행렬과 고유값: 연속형 처치 R-learner의 이론적 배경

## 개요

연속형 처치 R-learner에서 발생하는 **non-identification 문제**는 수학적으로 **ill-conditioned 행렬** 문제로 나타납니다. 이 글에서는 이 개념들을 단계별로 자세히 설명합니다.

## 1. 고유값(Eigenvalue)이란?

### 1.1 기본 개념

**고유값**은 행렬의 중요한 특성을 나타내는 스칼라 값입니다.

**수학적 정의**:
행렬 A에 대해, 0이 아닌 벡터 v와 스칼라 λ가 다음을 만족할 때:

$$Av = \lambda v$$

λ를 A의 **고유값**, v를 **고유벡터**라고 합니다.

### 1.2 직관적 이해

고유값은 행렬이 벡터를 **어떤 방향으로 얼마나 늘리거나 줄이는지**를 나타냅니다.

**예시**:

$$A = \begin{bmatrix} 2 & 0 \\ 0 & 3 \end{bmatrix}$$

고유값: $\lambda_1 = 2$, $\lambda_2 = 3$  
고유벡터: $v_1 = [1, 0]$, $v_2 = [0, 1]$

- λ₁ = 2: x축 방향으로 2배 늘림
- λ₂ = 3: y축 방향으로 3배 늘림

### 1.3 고유값의 의미

1. **λ > 1**: 해당 방향으로 확대
2. **0 < λ < 1**: 해당 방향으로 축소
3. **λ = 0**: 해당 방향으로 완전히 압축 (정보 손실)
4. **λ < 0**: 해당 방향으로 반전

## 2. Ill-conditioned 행렬이란?

### 2.1 조건수(Condition Number)

**조건수**는 행렬이 얼마나 "불안정한지"를 측정하는 지표입니다.

**정의**:

$$\kappa(A) = \|A\| \times \|A^{-1}\|$$

여기서 ||A||는 행렬 A의 노름(norm)입니다.

### 2.2 Ill-conditioned의 의미

**Well-conditioned**: 조건수가 작음 (≈ 1)
**Ill-conditioned**: 조건수가 큼 (≫ 1)

### 2.3 왜 문제가 되는가?

Ill-conditioned 행렬에서는 **작은 입력 변화가 큰 출력 변화**를 야기합니다.

**예시**:

$$A = \begin{bmatrix} 1 & 1 \\ 1 & 1.001 \end{bmatrix}$$

$$A^{-1} \approx \begin{bmatrix} 1001 & -1000 \\ -1000 & 1000 \end{bmatrix}$$

조건수 $\approx 4000$ (매우 큼!)

입력에 작은 노이즈가 있으면 해가 크게 달라집니다.

## 3. 연속형 처치에서 Ill-conditioned가 발생하는 이유

### 3.1 Non-identification 문제

연속형 처치에서는 **무한히 많은 처치 수준**이 존재합니다:

이진 처치: $T \in \{0, 1\}$ (2개 값)  
연속형 처치: $T \in [0, 1]$ (무한 개 값)

### 3.2 Generalized R-loss의 특성

**이진 처치 R-loss**:

$$L(\tau) = \mathbb{E}[(Y - \mu_0(X) - \tau(X)(T - \pi(X)))^2]$$

**연속형 처치 R-loss**:

$$L(\tau) = \mathbb{E}[(Y - \mu_0(X) - \tau(X,T)(T - \pi(X)))^2]$$

### 3.3 핵심 차이점

**이진 처치**: τ(X)는 X에만 의존 (유한차원)
**연속형 처치**: τ(X,T)는 X와 T 모두에 의존 (무한차원)

### 3.4 행렬로 표현하면

연속형 처치를 행렬로 표현하면:

$$\begin{bmatrix}
\tau(x_1,t_1) & \tau(x_1,t_2) & \cdots & \tau(x_1,t_n) \\
\tau(x_2,t_1) & \tau(x_2,t_2) & \cdots & \tau(x_2,t_n) \\
\vdots & \vdots & \ddots & \vdots \\
\tau(x_m,t_1) & \tau(x_m,t_2) & \cdots & \tau(x_m,t_n)
\end{bmatrix}$$

이 행렬은 **매우 큰 크기**를 가지며, 많은 행들이 **거의 선형 종속**입니다.

## 4. 고유값이 0에 가까워지는 이유

### 4.1 선형 종속성

연속형 처치에서 τ(x,t) 함수들은 **서로 매우 유사**합니다:

$$\tau(x, 0.1) \approx \tau(x, 0.11) \approx \tau(x, 0.12) \cdots$$

이는 행렬의 행들이 **거의 선형 종속**임을 의미합니다.

### 4.2 고유값의 의미

**고유값이 0에 가까움** = 해당 방향의 정보가 거의 없음

**예시**:

행렬 A의 고유값: $\lambda_1 = 10$, $\lambda_2 = 0.001$, $\lambda_3 = 0.0001$

- $\lambda_1 = 10$: 이 방향은 정보가 풍부
- $\lambda_2 = 0.001$: 이 방향은 정보가 거의 없음
- $\lambda_3 = 0.0001$: 이 방향은 거의 정보 없음

### 4.3 연속형 처치에서의 상황

연속형 처치에서는:
- **대부분의 고유값이 0에 가까움**
- **몇 개의 고유값만 의미 있음**
- **행렬이 거의 특이(singular)에 가까움**

## 5. 왜 문제가 되는가?

### 5.1 수치적 불안정성

**작은 노이즈 → 큰 오차**

원래 문제: $Ax = b$  
노이즈가 있는 문제: $(A + \epsilon)\tilde{x} = b + \delta$

결과: $\|x - \tilde{x}\|$가 매우 클 수 있음

### 5.2 해의 유일성 부족

**무수히 많은 해**가 존재:

$$\tau(x,t) = \tau_0(x,t) + \epsilon(x,t)$$

여기서 $\epsilon(x,t)$는 R-loss를 거의 변화시키지 않는 함수

### 5.3 추정의 어려움

**어떤 해가 "정답"인지 알 수 없음**

## 6. 해결 방법: Tikhonov 정규화

### 6.1 기본 아이디어

**정규화 항 추가**:

$$L(\tau) = \mathbb{E}[(Y - \mu_0(X) - \tau(X,T)(T - \pi(X)))^2] + \lambda\|\tau\|^2$$

### 6.2 수학적 효과

**행렬 표현**:

$$(A^TA + \lambda I)x = A^Tb$$

**고유값 변화**:

원래 고유값: $\lambda_i$  
정규화 후: $\lambda_i + \lambda$

### 6.3 왜 도움이 되는가?

1. **0에 가까운 고유값들이 λ만큼 증가**
2. **행렬이 더 안정적(well-conditioned)이 됨**
3. **유일한 해 보장**

## 7. 실제 예시

### 7.1 간단한 예시

**연속형 처치 함수**:

$$\tau(x,t) = 2t + 0.1\sin(10t)$$

**문제**: sin(10t) 항이 R-loss에 거의 영향을 주지 않음

**해결**: 정규화를 통해 "부드러운" 함수 선호

### 7.2 수치적 예시

원래 행렬 A의 고유값: $[10, 0.1, 0.01, 0.001, \ldots]$  
정규화 후 ($\lambda=1$): $[11, 1.1, 1.01, 1.001, \ldots]$

조건수가 크게 개선됩니다.

## 8. 결론

연속형 처치 R-learner에서 발생하는 non-identification 문제는:

1. **무한차원 함수 공간**에서 발생
2. **Ill-conditioned 행렬**로 수학적 표현
3. **고유값들이 0에 가까움**으로 특징
4. **Tikhonov 정규화**로 해결

이러한 이해는 연속형 처치 효과 추정의 이론적 기반을 제공합니다.

## 참고 자료

**추천 도서**:
- Golub, G. H., & Van Loan, C. F. (2013). Matrix computations. JHU press.
- Trefethen, L. N., & Bau, D. (1997). Numerical linear algebra. SIAM.

**핵심 논문**:
- Tikhonov, A. N. (1963). On the solution of ill-posed problems and the method of regularization.
- Hansen, P. C. (1998). Rank-deficient and discrete ill-posed problems: numerical aspects of linear inversion.

**온라인 자료**:
- [MIT OpenCourseWare: Linear Algebra](https://ocw.mit.edu/courses/mathematics/18-06-linear-algebra-spring-2010/)
- [Khan Academy: Eigenvalues and Eigenvectors](https://www.khanacademy.org/math/linear-algebra/alternate-bases/eigen-everything) 


