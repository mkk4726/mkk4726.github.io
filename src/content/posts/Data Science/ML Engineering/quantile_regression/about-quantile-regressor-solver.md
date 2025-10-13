---
title: "sklearn.linear_model.QuantileRegressor의 solver 정리"
date: "2025-09-23"
excerpt: "quantile regressor에서 사용하는 solver에 대해 정리"
category: "Machine Learning"
tags: ["Regression"]
---

# QuantileRegressor의 Solver 옵션 분석

scikit-learn의 `QuantileRegressor`는 quantile regression을 구현하는 클래스로, 다양한 solver 옵션을 제공합니다. 
각 solver는 뭔지, 언제 뭘 쓰면 좋을지에 대해 정리했습니다.

**결론:**
> `QuantileRegressor`의 solver 선택은 데이터 크기, 안정성 요구사항, 그리고 성능 목표에 따라 달라집니다. 

대부분의 경우 'highs' solver로 시작하여 문제가 발생하면 다른 옵션들을 시도하는 것이 좋은 접근법입니다. 
각 solver의 특성을 이해하고 상황에 맞게 선택하면 더 효율적인 quantile regression을 수행할 수 있습니다.

---

## Quantile Regression의 이론적 배경

### 1. Quantile의 수학적 정의

Quantile regression을 이해하기 위해서는 먼저 quantile의 수학적 정의부터 시작해야 합니다. 
연속형 확률변수 $Y$에 대해, $\tau$-quantile $Q_Y(\tau)$는 다음을 만족하는 값입니다:

$$
P(Y \leq Q_Y(\tau)) = \tau
$$

> 즉, $\tau$-quantile은 확률변수가 그 값보다 작거나 같을 확률이 $\tau$인 값입니다.

### 2. Quantile Regression의 수학적 공식

Quantile regression에서는 조건부 quantile function을 다음과 같이 모델링합니다:

$$
Q_y(\tau | X) = X\beta(\tau)
$$

여기서:
- $\tau \in (0,1)$: quantile level
- $X \in \mathbb{R}^{n \times p}$: 독립변수 행렬
- $\beta(\tau) \in \mathbb{R}^p$: quantile level $\tau$에 따른 회귀계수
- $Q_y(\tau | X)$: 조건부 quantile function

### 3. Loss Function: Pinball Loss (Quantile Loss)

Quantile regression의 핵심은 pinball loss function입니다. 
> 이는 quantile regression의 **정의**이며, 모든 solver가 동일하게 사용하는 loss function입니다:

$$
\rho_\tau(u) = u(\tau - \mathbb{I}(u < 0))
$$

여기서 $\mathbb{I}(\cdot)$는 indicator function입니다. 이를 더 명확하게 표현하면:

$$
\rho_\tau(u) = \begin{cases}
\tau u & \text{if } u \geq 0 \\
(\tau - 1)u & \text{if } u < 0
\end{cases}
$$


**다른 Loss Function과의 비교:**

| Loss Function | 사용 목적 | 예측값 | 특징 |
|---------------|-----------|--------|------|
| MSE | OLS Regression | 평균 | 대칭적, outlier에 민감 |
| MAE | LAD Regression | 중앙값 | 대칭적, robust |
| Pinball Loss | Quantile Regression | 임의의 quantile | 비대칭적, robust |



### 4. Optimization Problem

Quantile regression은 다음 최적화 문제를 해결합니다:

$$
\min_{\beta} \sum_{i=1}^{n} \rho_\tau(y_i - x_i^T\beta)
$$

이를 linear programming 형태로 변환하면:

$$
\min_{u^+, u^-} \sum_{i=1}^{n} (\tau u_i^+ + (1-\tau)u_i^-)
$$

subject to:
- $y_i - x_i^T\beta = u_i^+ - u_i^-$ for all $i$
- $u_i^+ \geq 0, u_i^- \geq 0$ for all $i$


---


## Linear Programming의 이론적 기초

### 1. Linear Programming의 표준 형태

Linear Programming (LP)은 다음과 같은 표준 형태로 표현됩니다:

$$
\min_{x} c^T x
$$

subject to:
- $Ax = b$
- $x \geq 0$

여기서:
- $x \in \mathbb{R}^n$: 결정변수 (decision variables)
- $c \in \mathbb{R}^n$: 목적함수 계수
- $A \in \mathbb{R}^{m \times n}$: 제약조건 계수 행렬
- $b \in \mathbb{R}^m$: 제약조건 우변 벡터

### 2. Duality Theory

모든 LP 문제는 dual problem을 가집니다:

**Primal Problem:**
$$
\min_{x} c^T x \quad \text{subject to } Ax = b, x \geq 0
$$

**Dual Problem:**
$$
\max_{y} b^T y \quad \text{subject to } A^T y \leq c
$$

**Strong Duality Theorem:** 만약 primal과 dual 모두 feasible하다면, 최적값이 같습니다.

### 3. Simplex Method

Simplex method는 LP 문제를 해결하는 가장 기본적인 방법입니다.

**핵심 아이디어:**
1. LP의 feasible region은 convex polyhedron입니다
2. 최적해는 항상 extreme point (vertex)에서 발생합니다
3. 한 extreme point에서 인접한 extreme point로 이동하며 목적함수를 개선합니다

**Simplex Tableau:**
$$
\begin{bmatrix}
1 & 0 & c_B^T B^{-1}N - c_N^T & c_B^T B^{-1}b \\
0 & I & B^{-1}N & B^{-1}b
\end{bmatrix}
$$

여기서 $B$는 basis matrix, $N$은 non-basis matrix입니다.

### 4. Interior Point Methods

Interior point methods는 1980년대에 개발된 LP 해법으로, feasible region의 내부를 따라 최적해로 접근합니다.

**Barrier Method:**
$$
\min_{x} c^T x - \mu \sum_{i=1}^{n} \log(x_i)
$$

subject to $Ax = b$, 여기서 $\mu > 0$는 barrier parameter입니다.

**Karmarkar's Algorithm:**
- Polynomial time complexity: $O(n^{3.5}L)$
- $L$은 입력 크기의 logarithm입니다


---


## Quantile Regression과 Linear Programming의 연결

### 1. Quantile Regression의 LP 변환

Quantile regression 문제를 LP로 변환하는 과정:

**Step 1: Auxiliary Variables 도입**
$$
u_i^+ = \max(0, y_i - x_i^T\beta)
$$
$$
u_i^- = \max(0, x_i^T\beta - y_i)
$$

**Step 2: LP 형태로 변환**
$$
\min_{u^+, u^-, \beta} \sum_{i=1}^{n} (\tau u_i^+ + (1-\tau)u_i^-)
$$

subject to:
- $y_i - x_i^T\beta = u_i^+ - u_i^-$ for all $i$
- $u_i^+ \geq 0, u_i^- \geq 0$ for all $i$

### 2. Dual Formulation

Quantile regression의 dual problem:

$$
\max_{\lambda} \sum_{i=1}^{n} y_i \lambda_i
$$

subject to:
- $\sum_{i=1}^{n} x_{ij} \lambda_i = 0$ for all $j$
- $\tau - 1 \leq \lambda_i \leq \tau$ for all $i$

### 3. KKT Conditions

- [KKT condtion이란?](/posts/Data%20Science/Math/about-KKT.md)

Karush-Kuhn-Tucker 조건을 통해 최적해의 특성을 이해할 수 있습니다:

**Stationarity:**
$$
\sum_{i=1}^{n} x_{ij} \left[ \tau \mathbb{I}(y_i > x_i^T\beta) + (\tau-1) \mathbb{I}(y_i < x_i^T\beta) \right] = 0
$$

**Complementary Slackness:**
$$
u_i^+ \cdot u_i^- = 0
$$

---

## Solver별 이론적 특성

### 1. HiGHS Solver

**이론적 배경:**
- Dual simplex method와 interior point method의 하이브리드
- Preprocessing과 scaling을 통한 수치적 안정성 향상
- Branch-and-bound를 통한 integer programming 지원

**수학적 특징:**
- Presolve: 불필요한 변수와 제약조건 제거
- Scaling: 수치적 안정성을 위한 행렬 스케일링
- Pivot selection: 수치적 안정성을 고려한 pivot 선택

### 2. Interior Point Methods

**이론적 배경:**
- Newton's method의 연속화
- Central path를 따라 최적해로 접근
- Barrier function을 통한 feasible region 내부 탐색

**수학적 공식:**
$$
\min_{x} c^T x - \mu \sum_{i=1}^{n} \log(x_i)
$$

subject to $Ax = b$, where $\mu \to 0$

**Convergence Rate:**
- Superlinear convergence under certain conditions
- Complexity: $O(\sqrt{n} \log(1/\epsilon))$ iterations

### 3. Revised Simplex Method

**이론적 배경:**
- Simplex method의 메모리 효율적 구현
- LU decomposition을 통한 basis inverse 계산
- Product form of inverse 사용

**수학적 특징:**
- Basis update: $B_{new} = B_{old} + (a_j - a_i)e_i^T$
- Inverse update: $B_{new}^{-1} = B_{old}^{-1} - \frac{B_{old}^{-1}(a_j - a_i)e_i^T B_{old}^{-1}}{1 + e_i^T B_{old}^{-1}(a_j - a_i)}$

---

## 수치적 안정성과 수렴성

### 1. Condition Number

행렬의 condition number는 수치적 안정성에 중요한 역할을 합니다:

$$
\kappa(A) = \|A\| \|A^{-1}\|
$$

**Quantile regression에서의 의미:**
- 높은 condition number는 수치적 불안정성 야기
- Feature scaling이 중요
- Regularization이 도움이 될 수 있음

### 2. Convergence Criteria

**Primal Feasibility:**
$$
\|Ax - b\|_{\infty} \leq \epsilon_p
$$

**Dual Feasibility:**
$$
\|A^T y + s - c\|_{\infty} \leq \epsilon_d
$$

**Complementary Slackness:**
$$
|x^T s| \leq \epsilon_c
$$

### 3. Numerical Issues

**Degeneracy:**
- Multiple optimal solutions
- Cycling 가능성
- Bland's rule로 해결

**Ill-conditioning:**
- Small pivots
- Numerical errors 누적
- Preprocessing과 scaling 필요

---

## 고급 이론적 주제

### 1. Asymptotic Properties

**Consistency:**
$$
\hat{\beta}(\tau) \xrightarrow{p} \beta(\tau)
$$

**Asymptotic Normality:**
$$
\sqrt{n}(\hat{\beta}(\tau) - \beta(\tau)) \xrightarrow{d} N(0, \tau(1-\tau)(X^T X)^{-1})
$$

### 2. Robustness

Quantile regression은 outlier에 robust합니다:

**Influence Function:**
$$
IF(y; \hat{\beta}(\tau)) = \tau \mathbb{I}(y > x^T\beta) + (\tau-1) \mathbb{I}(y < x^T\beta)
$$

**Breakdown Point:**
- Median regression ($\tau = 0.5$): 50%
- Extreme quantiles: 낮은 breakdown point

### 3. Regularization

**L1 Regularization (Lasso):**
$$
\min_{\beta} \sum_{i=1}^{n} \rho_\tau(y_i - x_i^T\beta) + \lambda \|\beta\|_1
$$

**L2 Regularization (Ridge):**
$$
\min_{\beta} \sum_{i=1}^{n} \rho_\tau(y_i - x_i^T\beta) + \lambda \|\beta\|_2^2
$$

이론적 배경을 통해 quantile regression이 단순한 regression 기법이 아니라, linear programming의 이론적 기초 위에 구축된 수학적으로 엄밀한 방법임을 알 수 있습니다. 각 solver는 이러한 이론적 배경을 바탕으로 다른 접근법을 사용하여 최적화 문제를 해결합니다.

## Solver 옵션들

### 1. 'highs' (기본값)

**특징:**
- HiGHS linear programming solver 사용
- 가장 안정적이고 빠른 solver
- 대부분의 경우에 권장되는 선택

**장점:**
- 수치적 안정성이 높음
- 메모리 효율적
- 다양한 문제 크기에 적합

**사용 시나리오:**
- 일반적인 quantile regression 문제
- 대용량 데이터셋
- 안정적인 결과가 필요한 경우

### 2. 'highs-ds'

**특징:**
- HiGHS dual simplex method 사용
- 'highs'와 유사하지만 dual formulation 사용

**장점:**
- 특정 문제에서 더 빠를 수 있음
- 'highs'와 유사한 안정성

**사용 시나리오:**
- 'highs'가 느린 경우 대안으로 시도
- 특정 데이터 특성에서 더 나은 성능을 보이는 경우

### 3. 'highs-ipm'

**특징:**
- HiGHS interior point method 사용
- Interior point method는 최적화 문제를 해결하는 다른 접근법

**장점:**
- 매우 큰 문제에서 효율적일 수 있음
- 특정 문제 구조에서 빠른 수렴

**단점:**
- 메모리 사용량이 높을 수 있음
- 일부 문제에서 수치적 불안정성 가능

**사용 시나리오:**
- 매우 큰 데이터셋
- 'highs'가 메모리 부족으로 실패하는 경우

### 4. 'revised simplex'

**특징:**
- Revised simplex method 사용
- 전통적인 linear programming 방법

**장점:**
- 안정적이고 검증된 방법
- 메모리 사용량이 상대적으로 적음

**단점:**
- 다른 solver들에 비해 느릴 수 있음
- 큰 문제에서 비효율적

**사용 시나리오:**
- 다른 solver들이 실패하는 경우
- 작은 데이터셋에서 안정성이 중요한 경우

---

## Solver 선택 가이드라인

### 1. 기본 권장사항
```python
# 대부분의 경우 이렇게 시작
regressor = QuantileRegressor(solver='highs')
```

### 2. 성능 문제가 있는 경우
```python
# 메모리 부족 시
regressor = QuantileRegressor(solver='highs-ipm')

# 속도 문제 시
regressor = QuantileRegressor(solver='highs-ds')
```

### 3. 안정성 문제가 있는 경우
```python
# 수치적 안정성이 중요한 경우
regressor = QuantileRegressor(solver='revised simplex')
```

---

## 실제 사용 예시

```python
from sklearn.linear_model import QuantileRegressor
from sklearn.datasets import make_regression
import numpy as np

# 데이터 생성
X, y = make_regression(n_samples=1000, n_features=10, noise=0.1, random_state=42)

# 다양한 quantile level에서 regression
quantiles = [0.1, 0.5, 0.9]
solvers = ['highs', 'highs-ds', 'highs-ipm', 'revised simplex']

for solver in solvers:
    print(f"\nSolver: {solver}")
    for quantile in quantiles:
        try:
            reg = QuantileRegressor(quantile=quantile, solver=solver)
            reg.fit(X, y)
            print(f"  Quantile {quantile}: R² = {reg.score(X, y):.4f}")
        except Exception as e:
            print(f"  Quantile {quantile}: Error - {e}")
```

## 성능 비교

| Solver | 속도 | 메모리 사용량 | 안정성 | 권장 사용 |
|--------|------|---------------|--------|-----------|
| highs | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 일반적 사용 |
| highs-ds | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | highs 대안 |
| highs-ipm | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ | 대용량 데이터 |
| revised simplex | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 안정성 우선 |

## 주의사항

1. **데이터 크기**: 매우 큰 데이터셋에서는 'highs-ipm'이 유리할 수 있지만, 메모리 사용량을 고려해야 합니다.

2. **수치적 안정성**: 일부 데이터에서는 특정 solver가 수치적으로 불안정할 수 있습니다. 이 경우 다른 solver를 시도해보세요.

3. **Convergence**: 모든 solver가 모든 문제에서 수렴을 보장하지는 않습니다. 문제가 발생하면 다른 solver를 시도하는 것이 좋습니다.

4. **Quantile Level**: 극단적인 quantile level (0.01, 0.99 등)에서는 solver 선택이 더 중요할 수 있습니다.


