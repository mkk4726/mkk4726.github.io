---
title: "Alternating Least Squares 란?"
date: "2025-10-06"
excerpt: "MF를 효율적으로 진행하는 모델인 ALS에 대해 정리해보기"
category: "Recommendation"
tags: ["ALS", "MF", "CF"]
---

# 개념 스케치

Matrix Factorization(MF)을 효율적으로 수행하는 최적화 알고리즘이다.

핵심 아이디어는 한쪽을 고정하고 다른 쪽을 최소제곱으로 푸는 Block Coordinate Descent(블록 좌표 하강) 방식이다. 전체 문제는 non-convex지만, 각 서브문제(한쪽을 고정했을 때)는 convex하며 정확히는 릿지 회귀 형태가 되어 닫힌형(closed-form, normal equations)으로 안정적으로 풀 수 있다.

무슨 말일까... 흠

대규모 데이터에서 효과적이다. 왜?

---

# 1. MF는 non-convex 문제인가?

Matrix Factorization(MF)은 기본적으로 non-convex 최적화 문제다. 이를 이해하기 위해 MF의 목적 함수를 살펴보자. 사용자-아이템 행렬 $R$을 두 개의 저차원 행렬 $U$(사용자 latent factor)와 $V$(아이템 latent factor)의 곱으로 근사하려는 문제를 생각해보면, 일반적인 목적 함수는 다음과 같다:

$$
L(U, V) = \sum_{(i,j) \in \Omega} (R_{ij} - U_i^T V_j)^2 + \lambda(\|U\|^2 + \|V\|^2)
$$

여기서 $\Omega$는 관측된 평점의 집합이고, $\lambda$는 regularization 항이다. 이 함수가 non-convex인 이유는 $U$와 $V$가 동시에 변수로 포함되어 있고, 특히 $U_i^T V_j$라는 곱셈 형태로 나타나기 때문이다. 

수학적으로 convexity를 체크하는 한 가지 방법은 Hessian matrix를 살펴보는 것인데, $U$와 $V$를 함께 고려한 전체 공간에서 이 함수의 Hessian은 positive semi-definite가 아니다. 더 직관적으로는, $U$와 $V$를 동시에 스케일링할 수 있다는 점을 생각해볼 수 있다. 예를 들어 $(U, V)$가 하나의 해라면 $(cU, V/c)$도 동일한 목적 함수 값을 가지는데(regularization을 무시하면), 이는 여러 개의 local minima가 존재할 수 있음을 시사한다.

## Hessian Matrix로 Convexity 판단하기

이차 미분 가능한 함수 $f: \mathbb{R}^n \to \mathbb{R}$의 convexity를 판단하는 이론적 기준은 다음과 같다:

**정리**: 함수 $f$가 convex이기 위한 필요충분조건은 정의역의 모든 점에서 Hessian matrix $H(x)$가 positive semi-definite(PSD)인 것이다.

Hessian matrix는 함수의 이차 편미분들로 구성된 대칭 행렬이다. 변수가 $x = (x_1, x_2, \ldots, x_n)$일 때:

$$
H(x) = \begin{bmatrix}
\frac{\partial^2 f}{\partial x_1^2} & \frac{\partial^2 f}{\partial x_1 \partial x_2} & \cdots & \frac{\partial^2 f}{\partial x_1 \partial x_n} \\
\frac{\partial^2 f}{\partial x_2 \partial x_1} & \frac{\partial^2 f}{\partial x_2^2} & \cdots & \frac{\partial^2 f}{\partial x_2 \partial x_n} \\
\vdots & \vdots & \ddots & \vdots \\
\frac{\partial^2 f}{\partial x_n \partial x_1} & \frac{\partial^2 f}{\partial x_n \partial x_2} & \cdots & \frac{\partial^2 f}{\partial x_n^2}
\end{bmatrix}
$$

행렬 $H$가 positive semi-definite라는 것은 임의의 벡터 $v \in \mathbb{R}^n$에 대해 $v^T H v \geq 0$이 성립한다는 의미다. 이는 다음과 같이 해석할 수 있다:

1. **일변수 함수의 경우** ($n=1$): Hessian은 단순히 이차 도함수 $f''(x)$다. $f''(x) \geq 0$이면 함수가 아래로 볼록(convex)하다는 고등학교 미적분학의 결과와 일치한다.

2. **다변수 함수의 경우**: Hessian이 PSD라는 것은 모든 방향으로 함수가 위로 휘어진다(또는 평평하다)는 의미다. 즉, 어떤 점에서 어떤 방향으로 움직이든 이차 근사가 항상 아래로 볼록한 형태를 유지한다.

3. **PSD 판정 방법**: 행렬이 PSD인지 확인하는 방법은 여러 가지가 있다:
   - 모든 eigenvalue가 $\geq 0$이다
   - 모든 leading principal minor가 $\geq 0$이다 (Sylvester's criterion)
   - Cholesky decomposition이 존재한다

**MF 목적 함수에 적용하기**: MF의 목적 함수 $L(U, V)$를 $(U, V)$ 전체에 대한 함수로 보면, 이차 미분을 계산할 수 있다. 특히 $U_i^T V_j$ 항을 미분하면 교차항(cross term)이 나타나는데, 예를 들어:

$$
\frac{\partial^2 L}{\partial U_{ik} \partial V_{jk}} = -2(R_{ij} - U_i^T V_j)
$$

이런 교차 미분항들이 Hessian matrix에 나타나고, 이 항들 때문에 Hessian이 indefinite(부정부호)가 된다. 즉, 어떤 방향 $v$에서는 $v^T H v > 0$이지만 다른 방향 $w$에서는 $w^T H w < 0$인 경우가 존재한다. 이것이 바로 함수가 non-convex임을 의미한다.

**대조: 한쪽을 고정하면**: $V$를 상수로 고정하고 $U_i$만 변수로 보면, $L(U_i | V)$의 Hessian은 다음과 같은 형태가 된다:

$$
H(U_i) = 2 \sum_{j: (i,j) \in \Omega} V_j V_j^T + 2\lambda I = 2(V_{\Omega_i}^T V_{\Omega_i} + \lambda I)
$$

이것은 명백히 PSD다 ($V_{\Omega_i}^T V_{\Omega_i}$는 Gram matrix이므로 항상 PSD이고, $\lambda I$는 positive definite). 따라서 한쪽을 고정하면 각 서브문제가 convex가 되는 것이다.

---

# 2. 그럼 어떻게 ALS가 효율적으로 풀 수 있을까?

ALS의 핵심 아이디어는 non-convex 문제를 번갈아가며(alternating) 두 개의 convex 문제로 나누는 것이다. 구체적으로 $U$를 고정하고 $V$만 최적화하는 단계와, $V$를 고정하고 $U$만 최적화하는 단계를 반복한다.

$V$를 고정했을 때, 각 사용자 $i$에 대한 목적 함수는 다음과 같이 쓸 수 있다:

$$
L(U_i | V) = \sum_{j: (i,j) \in \Omega} (R_{ij} - U_i^T V_j)^2 + \lambda \|U_i\|^2
$$

이것은 $U_i$에 대한 이차 함수이고, 계수가 양수이므로 convex하다. 사실 이것은 정확히 ridge regression(릿지 회귀) 문제와 같은 형태다. Ridge regression은 closed-form solution이 있다:

$$
U_i = (V_{\Omega_i}^T V_{\Omega_i} + \lambda I)^{-1} V_{\Omega_i}^T R_i
$$

여기서 $\Omega_i$는 사용자 $i$가 평가한 아이템들의 집합이고, $V_{\Omega_i}$는 해당 아이템들의 latent factor를 모은 행렬이다. 마찬가지로 $U$를 고정했을 때 $V_j$를 구하는 것도 동일한 형태의 ridge regression이 된다.

---

# 3. Block Coordinate Descent의 관점

ALS는 Block Coordinate Descent의 한 예시다. 전체 변수 공간 $(U, V)$를 두 개의 블록으로 나누고, 각 블록을 번갈아가며 최적화하는 방식이다. 이 방법이 효과적인 이유는:

**수렴 보장**: 각 단계에서 목적 함수 값이 감소하거나 유지되므로, 전체 알고리즘은 (적어도 local minimum으로) 수렴한다.

**안정성**: 각 서브문제가 convex이고 closed-form solution이 있어서 수치적으로 안정적이다. Gradient descent처럼 learning rate를 튜닝할 필요가 없고, 각 iteration에서 정확한 최적해를 구할 수 있다.

**효율성**: 행렬 연산으로 병렬화가 용이하고, 특히 sparse한 데이터(대부분의 추천 시스템 데이터는 sparse하다)에서 효율적으로 동작한다. 각 사용자(또는 아이템)를 독립적으로 업데이트할 수 있기 때문에 대규모 데이터셋에도 적용 가능하다.

결국 ALS는 non-convex 문제를 여러 개의 간단한 convex 문제로 분해함으로써, 실용적이고 효율적인 해법을 제공하는 것이다.

---

# 4. 왜 대규모 데이터셋에 효과적인가?

ALS가 Netflix Prize 이후 실무에서 널리 사용되는 이유는 대규모 데이터에서의 확장성(scalability) 때문이다. 추천 시스템 데이터는 보통 수백만 명의 사용자와 수십만 개의 아이템으로 구성되는데, ALS는 이런 규모에서도 효율적으로 동작한다.

## Sparsity 활용

추천 시스템 데이터의 가장 큰 특징은 sparsity다. 예를 들어 Netflix의 경우 사용자당 평균 평가 영화 수가 전체 영화 수의 1%도 안 된다. 이런 sparse한 데이터에서 ALS는 매우 효율적이다.

각 사용자 $i$를 업데이트할 때, 목적 함수는 해당 사용자가 평가한 아이템들($\Omega_i$)에 대해서만 계산하면 된다:

$$
U_i = (V_{\Omega_i}^T V_{\Omega_i} + \lambda I)^{-1} V_{\Omega_i}^T R_i
$$

여기서 $V_{\Omega_i}$는 $|\Omega_i| \times k$ 크기의 행렬이다 ($k$는 latent factor 차원). 대부분의 사용자는 소수의 아이템만 평가했으므로 $|\Omega_i| \ll m$ (전체 아이템 수)이고, 따라서 역행렬 계산이 전체 아이템을 고려하는 것보다 훨씬 빠르다.

구체적으로, $k \times k$ 크기의 행렬 $(V_{\Omega_i}^T V_{\Omega_i} + \lambda I)$의 역행렬을 구하는 비용은 $O(k^3)$이다. $k$는 보통 10~200 정도의 작은 값이므로 이 연산은 매우 빠르다. 전체 사용자를 업데이트하는 데 걸리는 시간은:

$$
O(n \cdot \bar{r} \cdot k^2 + n \cdot k^3)
$$

여기서 $n$은 사용자 수, $\bar{r}$은 사용자당 평균 평가 수다. Sparse한 데이터에서 $\bar{r}$이 작기 때문에 전체 계산량이 관리 가능한 수준이 된다.

## 완벽한 병렬화

ALS의 가장 큰 장점 중 하나는 각 iteration 내에서 완벽한 병렬 처리가 가능하다는 점이다.

**사용자 업데이트 단계**에서 각 사용자 $U_i$의 계산은 다른 사용자들과 완전히 독립적이다. $V$가 고정되어 있으므로, 모든 사용자를 동시에(병렬로) 업데이트할 수 있다:

```
for each user i in parallel:
    U_i = (V_{Ω_i}^T V_{Ω_i} + λI)^{-1} V_{Ω_i}^T R_i
```

마찬가지로 **아이템 업데이트 단계**에서도 모든 아이템을 병렬로 업데이트할 수 있다. 이런 병렬 구조는 MapReduce, Spark 같은 분산 컴퓨팅 프레임워크와 완벽하게 맞아떨어진다. 실제로 Spark MLlib의 ALS 구현은 이런 병렬성을 활용하여 수십억 개의 평점 데이터를 처리할 수 있다.

**SGD와의 비교**: Stochastic Gradient Descent(SGD)로 MF를 학습할 경우, 각 업데이트가 이전 업데이트에 의존하기 때문에 완전한 병렬화가 어렵다. 물론 Hogwild 같은 기법으로 부분적인 병렬화가 가능하지만, ALS만큼 자연스럽지 않다.

## 메모리 효율성

ALS는 메모리 측면에서도 효율적이다. 저장해야 하는 주요 데이터는:
- User latent factors $U$: $n \times k$
- Item latent factors $V$: $m \times k$
- Sparse rating matrix $R$: $|\Omega|$개의 관측값

전체 메모리 사용량은 $O((n + m) \cdot k + |\Omega|)$이다. Sparse matrix를 밀집(dense) 형태로 저장할 필요가 없고, 관측된 평점들만 저장하면 된다. 또한 $k$가 보통 수십~수백 정도로 작기 때문에 latent factor matrix들도 메모리에 무리 없이 올릴 수 있다.

분산 환경에서는 각 워커 머신이 사용자들의 부분집합(또는 아이템들의 부분집합)만 담당하면 되므로, 메모리가 클러스터 전체에 분산된다.

## Implicit Feedback 데이터에도 효과적

추천 시스템에서는 명시적 평점(explicit rating)뿐만 아니라 암묵적 피드백(implicit feedback, 예: 클릭, 구매, 시청 기록)도 많이 사용된다. Implicit feedback은 보통 모든 사용자-아이템 쌍에 대해 신호가 있다고 볼 수 있어서 데이터가 더 dense하다.

Hu et al. (2008)이 제안한 implicit ALS는 confidence weight를 도입하여 이 문제를 해결한다:

$$
L(U, V) = \sum_{i,j} c_{ij}(p_{ij} - U_i^T V_j)^2 + \lambda(\|U\|^2 + \|V\|^2)
$$

여기서 $p_{ij} \in \{0, 1\}$은 선호 여부이고, $c_{ij}$는 신뢰도다. 이 경우에도 각 사용자의 업데이트는 closed-form으로 풀 수 있고, 특별한 행렬 연산 최적화 기법을 사용하면 효율적으로 계산할 수 있다.

## 실무 사례

- **Spotify**: 수억 명의 사용자와 수천만 개의 곡에 대한 추천에 ALS 사용
- **Netflix**: Netflix Prize 이후 실제 서비스에서 ALS 기반 모델 활용
- **YouTube**: 초기 추천 시스템에서 ALS를 활용한 implicit feedback 모델 사용

결론적으로 ALS는 closed-form solution, 완벽한 병렬화, sparsity 활용, 메모리 효율성 등의 특성 덕분에 대규모 추천 시스템에서 매우 실용적인 선택이 된다.

---

# 5. 이론적 깊이: 계산·메모리·분산 관점에서의 분석

지금까지 ALS의 장점을 개괄적으로 살펴봤다면, 이제는 대규모 데이터셋에서 ALS가 왜 잘 작동하는지를 **계산·메모리·분산 관점**에서 이론적으로 더 깊이 파보자.

## 핵심 요약

- **작은 릿지 회귀의 대량 병렬화**: 각 사용자/아이템마다 크기 $k \times k$의 선형계만 풀면 되어서(닫힌형), 노드별로 독립 병렬 처리 가능
- **희소성 활용 + 사전계산(Gram)**: 관측 항만 훑고, $Y^T Y$ 같은 Gram matrix를 캐시해서 연산량을 $O(\text{nnz}(R) \cdot k^2)$로 줄임
- **통신/동기화가 단순**: 한 스텝에서 한 쪽 행렬만 바뀌므로 브로드캐스트/셔플 패턴이 규칙적이고, SGD류보다 동기화 충돌이 적음
- **수렴이 안정**: Learning rate 튜닝 없이 단조 감소(각 서브문제 볼록) → 적은 반복 수로 수렴

## 5.1 계산 복잡도: 왜 싸게 먹히나

평점 행렬 $R \in \mathbb{R}^{m \times n}$의 관측 수를 $\text{nnz}(R)$, 잠재 차원을 $k$라 하면, 명시적 ALS에서 사용자 스텝의 사용자 $u$ 업데이트는:

$$
A_u = \sum_{i \in \Omega(u)} y_i y_i^T + \lambda I, \quad b_u = \sum_{i \in \Omega(u)} y_i r_{ui}, \quad x_u = A_u^{-1} b_u
$$

이고 비용은 대략:

$$
\mathcal{O}(|\Omega(u)| \cdot k^2) + \mathcal{O}(k^3)
$$

전체 사용자에 대해:

$$
\sum_u \mathcal{O}(|\Omega(u)| \cdot k^2) + m \cdot \mathcal{O}(k^3) \approx \mathcal{O}(\text{nnz}(R) \cdot k^2)
$$

보통 $k$는 50~200 수준이라 $k^3$은 미미하다. 아이템 스텝도 대칭이므로 **한 번의 전체 반복(iteration)** 비용은:

$$
\mathcal{O}(\text{nnz}(R) \cdot k^2) + (m + n) \cdot \mathcal{O}(k^3) \approx \mathcal{O}(\text{nnz}(R) \cdot k^2)
$$

즉, **관측 수에 선형적**으로 스케일한다.

### 암묵적 ALS(Implicit)에서도 선형 스케일 유지

암묵형은 $c_{ui}(p_{ui} - x_u^T y_i)^2$ 합으로 보이기에 겉으로는 모든 $(u, i)$ 쌍을 다 써야 할 것 같지만:

$$
Y^T C_u Y = Y^T Y + \sum_{i \in \Omega(u)} (c_{ui} - 1) \cdot y_i y_i^T
$$

처럼 $C_u = I + (C_u - I)$로 분해하면, **전항 $Y^T Y$는 공통 Gram** (한 번 계산/캐시), 나머지는 **관측 항만 누적**하면 된다. 결국 여기서도 $\mathcal{O}(\text{nnz}(R) \cdot k^2)$로 떨어진다.

## 5.2 메모리·캐시 지역성: 큰데도 왜 버티나

- **희소 저장(CSR/CSC)**: $R$은 극도로 희소하므로 행/열별 인덱스만 들고 다니면 된다
- **작은 선형계**: 매 업데이트는 $k \times k$ SPD(대칭 양정) 시스템 → Cholesky나 CG(Conjugate Gradient)로 빠르고 안정적으로 푼다
  - 벡터화/BLAS 최적화, GPU에선 batched Cholesky/CG로 다수 사용자/아이템을 한 번에 처리 가능
- **Gram 캐시**: $Y^T Y$, $X^T X$를 캐시해 반복마다 재활용 → 대규모에서도 메모리-계산 절감
- **편향항/평균 분리**: $\mu, b_u, b_i$를 분리해 놓으면 $X, Y$가 데이터의 "잔차"만 학습 → 수치적으로 안정

## 5.3 분산 처리에 특히 유리한 이유

- **Block Coordinate Descent 구조**: 사용자 업데이트는 서로 독립, 아이템 업데이트도 서로 독립 → 데이터 병렬이 자연스럽다
- **통신 패턴 단순화**: 한 라운드에서 $Y$를 고정하면 워커들은 자신의 사용자 파티션을 로컬의 관측 $R$ 조각과 $Y$로만 계산한다
  - 분산 Spark 기준: $Y$를 브로드캐스트(또는 블록화) → 각 워커가 로컬 $R$을 훑어 $x_u$들을 갱신 → 수집
  - 다음 라운드엔 $X$를 고정하고 동일 패턴 반복
  - **쓰기 충돌이나 락**이 사실상 없다 (SGD의 "파라미터 서버" 동기화 난제가 거의 없음)
- **적은 동기화 지점**: "사용자 스윕" 끝/"아이템 스윕" 끝의 두 지점 정도만 동기화. 반면 SGD는 미니배치마다 동기화/파라미터 교환이 빈번해 네트워크 병목이 나타나기 쉽다
- **예측 가능성**: Learning rate/모멘텀 같은 민감한 하이퍼튜닝 없이도 안정 수렴 → 분산 환경에서 재현성/운영 안정성이 높다

## 5.4 SGD/BPR 대비 실전 성능이 잘 나오는 이유

- **반복당 비용은 무겁지만 반복 수가 적음**: 각 스텝이 "정확한(최적) 해"라서 손실이 단조 감소 → 보통 **10~30회** 반복이면 충분. SGD는 보통 더 많은 에포크와 섬세한 스케줄이 필요
- **음성(negative) 샘플링 불필요(암묵형)**: 전공간을 가중 회귀로 다루되 계산은 관측 항만 쓰는 트릭 덕분에, 대규모에서 샘플링 바이어스 없이 효율
- **대규모 희소성 우호적**: $\text{nnz}(R)$에 비례해 스케일 → 유저/아이템이 수천만이어도 관측 밀도가 낮다면 충분히 처리 가능

## 5.5 이론적 뒷받침 (수렴·해석)

- 전체 문제는 비볼록이지만, **한쪽을 고정한 서브문제는 볼록(릿지 회귀)** → 각 스텝이 전역해. 따라서 목적함수 값은 **단조 감소**하며, **정지점**(stationary point)에 도달한다
- **MAP 해석**: $r_{ui} = x_u^T y_i + \varepsilon$, $\varepsilon \sim \mathcal{N}(0, \sigma^2)$, $x_u, y_i \sim \mathcal{N}(0, \tau^{-1} I)$ 가정의 **최대사후(MAP)**. Regularization이 가우시안 사전과 대응되어 수치 안정성(정규화)이 이론적으로 정당화된다

## 5.6 언제 비효율적일 수 있나 (경계 조건)

- **랭크 $k$가 과도하게 큰 경우**: $k^2$가 커지면 per-user 비용이 커짐 (수백~수천 차원)
- **엄격한 온라인/스트리밍**: ALS는 배치적. 초저지연 개인화에는 온라인 SGD/BPR이 더 맞다
- **메타정보가 지배적**: 순수 협업 신호가 빈약하고 텍스트/그래프 특징이 중요하다면 FM/DeepFM/신경 행렬분해가 더 낫기도 함

## 5.7 실무 최적화 체크리스트

- $k \in [50, 200]$, $\lambda$ 로그 스윕, 반복 10~30회 + 조기 종료
- **Gram 캐시** ($Y^T Y$, $X^T X$)와 **관측 항만 누적** 최적화 적용
- **Cholesky/CG**로 $k \times k$ 시스템을 batched로 처리 (GPU/HPC 유리)
- 파티셔닝 시 **데이터 지역성** (동일 사용자/아이템 묶음) 유지해 셔플 최소화
- 극저밀도 사용자/아이템은 **최소 관측 수 필터**로 수치 문제 방지

이러한 이론적 분석을 통해 ALS가 단순히 "잘 작동한다"는 경험적 사실을 넘어서, **왜 대규모에서 효율적인지**를 계산 복잡도, 메모리 구조, 분산 시스템 관점에서 명확히 이해할 수 있다.