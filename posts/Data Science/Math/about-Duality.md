---
title: "Duality 란?"
date: "2025-09-23"
excerpt: "Duality에 대해 이해해보기"
category: "Math"
tags: ["KKT", "DS", "Math", "Linear Programming"]
---

참고자료
- 1: [ratsgo's blog](https://ratsgo.github.io/convex%20optimization/2018/01/25/duality/)
- 2: [Yong Wang - YouTube](https://www.youtube.com/watch?v=lSM_TQehx00)

---

# 여기에서 나오는 개념 키워드


duality, prial problem, dual problem, largrange multiplier method, 

---

# Duality란?

> 최적화 이론에서 쌍대성(雙對性; duality)이란 어떤 최적화 문제가 원초문제(the primal problem)와 쌍대문제(the dual problem)의 두 가지 관점에서 볼 수 있다는 원칙입니다. 쌍대문제의 상한은 primal problem의 하한(a lower bound)이 됩니다. (참조1)

> Dual is "Transpose" of Primal (참조2)

최적화 문제에서 문제를 더 쉽게 풀기 위해 목적함수와 제약조건을 새롭게 정의합니다.
최적해를 구하기 위해서는 라그랑주 승수법을 이용하기도 하고, 범위를 구하기 위해서는 duality를 이용하기도 합니다.

어떤 컨셉으로 기존의 목적함수를 재정의하는지를 이해해보면 좋을 것 같습니다.

---

# 라그랑주 승수법 (Lagrange Multiplier Method)

## 기본 개념

라그랑주 승수법은 **등식 제약조건이 있는 최적화 문제**를 해결하는 방법입니다:

$$
\begin{align}
\min_{x} \quad & f(x) \\
\text{subject to} \quad & h_j(x) = 0, \quad j = 1, \ldots, p
\end{align}
$$

## 라그랑주 함수 (Lagrangian)

제약조건을 목적함수에 통합하여 **라그랑주 함수**를 만듭니다:

$$
L(x, \mu) = f(x) + \sum_{j=1}^{p} \mu_j h_j(x)
$$

여기서 $\mu_j$는 **라그랑주 승수(Lagrange Multiplier)**입니다.

## 최적화 조건

최적해에서는 다음 조건들이 만족됩니다:

1. **Stationarity**: $\nabla_x L(x^*, \mu^*) = 0$
2. **Primal Feasibility**: $h_j(x^*) = 0$ for all $j$

## 직관적 해석

라그랑주 승수 $\mu_j$는 **제약조건의 "가격" 또는 "민감도"**를 나타냅니다:
- $\mu_j > 0$: 제약조건을 약간 완화하면 목적함수 값이 개선됨
- $\mu_j < 0$: 제약조건을 약간 강화하면 목적함수 값이 개선됨
- $\mu_j = 0$: 제약조건이 목적함수에 영향을 주지 않음

---

# 라그랑주 승수법에서 Duality로의 확장

## 1. 부등식 제약조건 추가

실제 최적화 문제는 대부분 **부등식 제약조건**을 포함합니다:

$$
\begin{align}
\min_{x} \quad & f(x) \\
\text{subject to} \quad & g_i(x) \leq 0, \quad i = 1, \ldots, m \\
& h_j(x) = 0, \quad j = 1, \ldots, p
\end{align}
$$

이때 라그랑주 함수는:

$$
L(x, \lambda, \mu) = f(x) + \sum_{i=1}^{m} \lambda_i g_i(x) + \sum_{j=1}^{p} \mu_j h_j(x)
$$

## 2. 라그랑주 듀얼 함수로의 발전

라그랑주 승수법의 핵심 아이디어를 확장하여 **라그랑주 듀얼 함수**를 정의합니다:

$$
g(\lambda, \mu) = \inf_{x} L(x, \lambda, \mu)
$$

이 함수가 바로 **Duality의 핵심**입니다!

## 3. 라그랑주 승수법과 Duality의 연결고리

| 개념 | 라그랑주 승수법 | Duality |
|------|----------------|---------|
| **목적** | 제약조건 하에서 최적해 찾기 | Primal 문제의 bound 찾기 |
| **핵심 함수** | 라그랑주 함수 $L(x, \lambda, \mu)$ | 듀얼 함수 $g(\lambda, \mu)$ |
| **최적화 변수** | $x$ (primal 변수) | $\lambda, \mu$ (dual 변수) |
| **해석** | 제약조건의 민감도 | 제약조건의 "가격" |

## 4. 왜 Duality가 중요한가?

라그랑주 승수법은 **하나의 해**를 찾는 방법이지만, Duality는:

1. **Primal 문제의 bound**를 제공합니다
2. **계산적 이점**을 제공합니다 (때로는 dual이 더 쉽게 풀림)
3. **경제적 해석**을 가능하게 합니다 (shadow price)
4. **알고리즘 설계**의 기초가 됩니다 (SVM, 신경망 등)

---

# Primal Problem (원초 문제)

Primal problem은 우리가 실제로 해결하고자 하는 **원래의 최적화 문제**입니다. 일반적으로 다음과 같은 형태를 가집니다:

- **목적함수(Objective Function)** : 최소화하거나 최대화하려는 함수
- **제약조건(Constraints)** : 변수들이 만족해야 하는 조건들

예를 들어, 선형계획법에서 primal problem은 다음과 같습니다:
- 목적: c^T x를 최소화
- 제약조건: Ax ≤ b, x ≥ 0

# Dual Problem (쌍대 문제)

Dual problem은 primal problem에서 **파생된 또 다른 최적화 문제** 로, 다음과 같은 특징을 가집니다:

- primal problem의 제약조건들이 dual problem의 변수가 됩니다
- primal problem의 변수들이 dual problem의 제약조건이 됩니다
- 목적함수도 서로 대응되는 관계를 가집니다

## Duality의 핵심 원리

1. **Weak Duality** : dual problem의 최적값은 primal problem의 최적값에 대한 **하한(lower bound)**을 제공합니다.

2. **Strong Duality** : 특정 조건(예: Slater's condition) 하에서 dual problem의 최적값과 primal problem의 최적값이 **동일**합니다.

3. **Complementary Slackness**: 최적해에서 primal과 dual의 제약조건이 서로 보완적인 관계를 가집니다.

## 변환 과정 (참조2)

Primal problem을 Dual problem으로 재정의하는 건 크게 3가지 단계로 이루어져있습니다.
* Step 1: Multiply constraint $i$ by a factor $u_i$. Choose the sign of $u_i$, so that all inequalities are $\leq$ after multiplication.
* Step 2: Add up all the obtained inequalities into a resultant inequality.
* Step 3: Make the coefficients of the resultant constraint match the object function. Then, the RHS of the resultant constaint is an upper bound of z*.

<figure>
<img src="./images/primal_problem.png" alt="Primal problem" /><width="80%" />
<figcaption>그림1. Primal problem</figcaption>
</figure>

그림1과 같은 primal problem이 있을 때, z의 upper bound를 dual problem으로 치환해서 구할 수 있습니다.

<figure>
<img src="./images/duality_1.png" alt="Dual problem" /><width="80%" />
<figcaption>그림2. Dual problem 예시</figcaption>
</figure>

양수인 $u_i$ 을 각 제약조건에 곱해줍니다. 곱해줄 때는 모든 부등호가 한 $\leq$ 이 될 수 있도록 곱해줍니다.
그 후에 이를 정리해서 새로운 제약 조건과 목적함수를 만듭니다.

<figure>
<img src="./images/duality_2.png" alt="Dual problem" /><width="80%" />
<figcaption>그림3. Dual problem 예시</figcaption>
</figure>

일반화된 수식으로는 그림3처럼 표현할 수 있습니다.

<figure>
<img src="./images/duality_3.png" alt="Dual problem" /><width="80%" />
<figcaption>그림4. Dual problem 예시</figcaption>
</figure>
<figure>
<img src="./images/duality_4.png" alt="Dual problem" /><width="80%" />
<figcaption>그림5. Dual problem 예시</figcaption>
</figure>

이를 그림 4와 5처럼 정리할 수 있습니다.

> 이 과정을 요약하면 primal problem에서의 z의 upper bound를 구하기 위해 새로운 목적함수를 정의했습니다.

---

# Primal에서 Dual로 변환할 때 목적함수가 바뀌는 이유

**핵심 질문**: Primal → Dual로 변환할 때 왜 목적함수가 min에서 max로 바뀌는가?

## 라그랑주 듀얼리티의 수학적 구조

Primal 문제가 다음과 같을 때:
```
min f(x) subject to g_i(x) ≤ 0, h_j(x) = 0
```

라그랑주 듀얼 함수는 다음과 같이 정의됩니다:

$$
g(\lambda, \mu) = \inf_{x} L(x, \lambda, \mu) = \inf_{x} \left[ f(x) + \sum_i \lambda_i g_i(x) + \sum_j \mu_j h_j(x) \right]
$$

여기서 핵심은 **infimum(하한)** 을 구한다는 점입니다. 듀얼 문제는 이 라그랑주 듀얼 함수를 **최대화** 하는 것입니다:

$$
\max_{\lambda \geq 0, \mu} g(\lambda, \mu)
$$

## 왜 최적화 방향이 바뀌는가?

**일반적인 원리**: Primal과 Dual은 항상 **반대 방향**으로 최적화됩니다.

### Case 1: Primal이 min → Dual은 max

Primal 문제가 최소화일 때:
```
min f(x) subject to g_i(x) ≤ 0, h_j(x) = 0
```

라그랑주 듀얼 함수: $g(\lambda, \mu) = \inf_{x} L(x, \lambda, \mu)$

**Dual 문제**: $\max_{\lambda \geq 0, \mu} g(\lambda, \mu)$

### Case 2: Primal이 max → Dual은 min

Primal 문제가 최대화일 때:
```
max f(x) subject to g_i(x) ≤ 0, h_j(x) = 0
```

라그랑주 듀얼 함수: $g(\lambda, \mu) = \sup_{x} L(x, \lambda, \mu)$

**Dual 문제**: $\min_{\lambda \geq 0, \mu} g(\lambda, \mu)$

### 핵심 이유:

1. **Weak Duality의 대칭성**: 
   - Primal이 min → Dual은 primal의 **하한(lower bound)**을 제공 → Dual을 max로 최적화
   - Primal이 max → Dual은 primal의 **상한(upper bound)**을 제공 → Dual을 min으로 최적화

2. **수학적 대칭성**: Primal과 Dual은 서로 "transpose" 관계를 유지하며, 최적화 방향도 반대가 됩니다.

3. **라그랑주 승수의 해석**: 듀얼 변수(λ, μ)는 제약조건의 "가격"을 나타내며, primal 문제의 최적값에 가장 가까운 bound를 찾기 위해 반대 방향으로 최적화합니다.

### 직관적 이해: 왜 반대 방향으로 최적화해야 하는가?

**자주 하는 오해**: "Dual이 primal의 상한을 구한다면, dual도 max로 풀면 되지 않나?"

이는 중요한 오해입니다. 핵심은 다음과 같습니다:

### Primal이 max일 때의 상황

**Primal**: max f(x) (우리가 찾고 싶은 최댓값)

**Dual의 역할**: 
- Dual 함수 g(λ,μ)는 **여러 개의 상한값들**을 만들어냅니다
- 이 상한값들 중에서 **가장 작은(tight한) 상한**을 찾아야 합니다
- 따라서 dual을 **min으로 최적화**해야 합니다

### 구체적인 예시

Primal 최적값이 10이라고 가정해봅시다.

**Dual 함수가 만드는 상한들:**
- g(λ₁, μ₁) = 15 (너무 느슨한 상한)
- g(λ₂, μ₂) = 12 (조금 더 tight한 상한)  
- g(λ₃, μ₃) = 10.1 (가장 tight한 상한)

우리가 원하는 것은 **10.1** (가장 작은 상한)입니다. 이를 얻으려면 dual을 **min**으로 최적화해야 합니다.

**만약 dual을 max로 최적화한다면?**
→ 가장 느슨한 상한(15)을 찾게 되어 의미가 없습니다.

### Primal이 min일 때도 동일한 논리

**Primal**: min f(x) (우리가 찾고 싶은 최솟값)

**Dual의 역할**:
- Dual 함수는 **여러 개의 하한값들**을 만들어냅니다
- 이 하한값들 중에서 **가장 큰(tight한) 하한**을 찾아야 합니다
- 따라서 dual을 **max로 최적화**해야 합니다

### 핵심 원리

**Strong Duality**가 성립할 때:
- Primal 최적값 = Dual 최적값
- 하지만 이는 dual을 **올바른 방향**으로 최적화했을 때만 성립합니다

Dual 최적화는 **가장 tight한 bound를 찾는 과정**이므로, 항상 primal과 반대 방향으로 최적화해야 합니다.

## 구체적인 예시

선형계획법에서:
- **Primal**: min c^T x subject to Ax = b, x ≥ 0
- **Dual**: max b^T y subject to A^T y ≤ c

여기서 듀얼 문제는 primal의 제약조건 벡터 b를 최대화하는 것입니다. 이는 primal의 목적함수 계수 c와 대응되는 관계를 가집니다.

### 직관적 이해

듀얼 문제는 "주어진 제약조건 하에서 primal 문제의 최적값을 가장 잘 근사할 수 있는 하한을 찾는" 문제입니다. 따라서 듀얼은 항상 primal과 반대 방향의 최적화를 수행합니다 - primal이 min이면 듀얼은 max, primal이 max이면 듀얼은 min이 됩니다.

이러한 구조는 최적화 이론의 근본적인 원리이며, 단순한 규칙이 아니라 수학적으로 엄밀하게 정의된 관계입니다.