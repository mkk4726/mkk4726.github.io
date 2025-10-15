---
title: "XGBoost 이해하기!"
date: "2025-09-28"
excerpt: "매번 까먹는 개념들...한번 정리해보자"
category: "Engineering"
tags: ["XGBoost"]
---

베이스라인으로 가져가는 모델이지만 자세한 세부 내용은 자주 까먹는다... ㅎㅎ
한번 쭉 정리해보자.

---

# 개념 스케치

이론적 배경 정리. 키워드들 나열 해보기.

- XGBoost는 Gradient Boosting + Regularization + System Optimization의 결합체입니다.
- 손실함수를 2차 테일러 근사식으로 근사하고, 이를 통해 각 트리의 리프 노드 가중치를 최적화합니다.
- 이런 접근은 수학적으로 안정적이고, 실무에서는 매우 강력한 일반화 성능을 보입니다.

| 특징                               | 설명                                                          |
| -------------------------------- | ----------------------------------------------------------- |
| **1. Regularization (정규화)**      | L1, L2 정규화를 목적함수에 추가해 과적합 방지                                |
| **2. Second-order optimization** | 단순 gradient(1차 미분)뿐 아니라 **Hessian(2차 미분)**까지 사용해 더 정교한 업데이트 |
| **3. Shrinkage (Learning rate)** | 각 트리의 영향력을 줄여(overfitting 방지) 천천히 학습                        |
| **4. Column Subsampling**        | 각 트리를 학습할 때 **특징(feature)의 일부만 사용**해 다양성 확보                 |
| **5. Handling Missing Values**   | 결측치를 자동으로 처리하는 split direction 학습                           |
| **6. Parallelization**           | 분할 후보 탐색을 병렬로 수행하여 빠름                                       |
| **7. Tree Pruning**              | 후진 제거 방식(backward pruning)으로 불필요한 분할을 잘라냄                   |

## 핵심 수학 개념

XGBoost의 이론적 기반이 되는 수학 개념들입니다.

**Second-order Taylor Approximation (2차 테일러 근사)**

XGBoost는 objective function을 gradient(1차 미분)와 Hessian(2차 미분) 정보를 모두 사용해 근사합니다. 이것이 일반적인 gradient boosting과의 가장 큰 차이점입니다.

$$
\mathcal{L}^{(t)} \approx \sum_{i=1}^{n} [l(y_i, \hat{y}_i^{(t-1)}) + g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i)] + \Omega(f_t)
$$

여기서 $g_i$는 gradient, $h_i$는 Hessian(2차 미분), $\Omega(f_t)$는 정규화 항입니다.

**Gain (분할 이득)**

노드를 분할할 때 loss가 얼마나 감소하는지를 측정합니다. 이 값이 클수록 해당 분할이 모델 성능 향상에 기여한다는 의미입니다.

$$
Gain = \frac{1}{2} \left[ \frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{H_L + H_R + \lambda} \right] - \gamma
$$

$G_L$, $G_R$은 왼쪽/오른쪽 자식 노드의 gradient 합, $H_L$, $H_R$은 Hessian 합입니다. 이 Gain이 양수일 때만 분할을 수행합니다.

**Gamma (γ) - Minimum Split Loss**

분할을 수행하기 위한 최소 gain 임계값입니다. 이 값이 클수록 트리가 보수적으로 성장하며 과적합을 방지합니다. 위 Gain 수식에서 마지막에 빼지는 항으로, 트리 복잡도에 대한 페널티 역할을 합니다.

## 시스템 최적화 기법

**Approximate Greedy Algorithm & Weighted Quantile Sketch**

데이터가 클 때 모든 가능한 분할점을 탐색하는 것은 비효율적입니다. XGBoost는 quantile 기반으로 후보 분할점을 효율적으로 샘플링합니다. 특히 weighted quantile sketch는 각 데이터포인트의 Hessian 값을 가중치로 사용해 더 정교한 샘플링을 수행합니다.

**Sparsity-aware Split Finding**

희소 행렬이나 결측치가 많은 데이터를 효율적으로 처리합니다. 각 분할점에서 결측치를 왼쪽/오른쪽 중 어느 방향으로 보낼지 자동으로 학습하며, 이를 **default direction**이라고 합니다.

**Block Structure for Parallel Learning**

데이터를 compressed column (CSC) 포맷으로 저장해 분할점 탐색을 병렬화합니다. 각 feature별로 정렬된 데이터를 블록 단위로 저장하여 캐시 효율성을 높입니다.

## 주요 하이퍼파라미터

기본적인 파라미터 외에 특정 상황에서 중요한 파라미터들입니다.

| 파라미터                    | 설명                                                       | 사용 케이스                    |
| ----------------------- | -------------------------------------------------------- | ------------------------- |
| **max_delta_step**      | 각 트리의 가중치 업데이트 크기를 제한 (기본값 0 = 무제한)                       | imbalanced 데이터에서 안정성 향상   |
| **scale_pos_weight**    | 양성 클래스의 가중치를 조정 (기본값 1)                                  | 클래스 불균형 문제 해결             |
| **base_score**          | 모든 인스턴스의 초기 예측값 (기본값 0.5)                                | 사전 지식이 있을 때 초기값 조정        |
| **tree_method**         | 트리 구성 알고리즘 선택 (`auto`, `exact`, `approx`, `hist`, `gpu_hist`) | 데이터 크기와 리소스에 따라 선택       |
| **grow_policy**         | 트리 성장 방식 (`depthwise`, `lossguide`)                       | `lossguide`는 LightGBM 스타일 |
| **max_bin**             | histogram 알고리즘의 bin 개수                                   | 메모리-정확도 트레이드오프            |
| **sampling_method**     | 서브샘플링 방식 (`uniform`, `gradient_based`)                    | GOSS(Gradient-based) 샘플링  |

## 모델 끼리 비교

| 항목           | XGBoost                                                              | LightGBM                                                                                  | Random Forest                        |
| ------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------ |
| 기본 구조        | Gradient Boosted Trees                                               | **Histogram 기반 GBDT**                                                                     | Bagging 기반 트리 앙상블                    |
| **트리 성장 방식** | **Level-wise(depth-wise)**                                           | **Leaf-wise(best-first)**                                                                 | (보통) 완전 성장 후 가지치기                    |
| **병렬/가속**    | 특성/데이터 병렬, GPU 지원                                                    | 히스토그램 병렬, GPU, EFB/GOSS                                                                   | **트리 단위 병렬**                         |
| 속도(학습)       | 빠름                                                                   | **매우 빠름**                                                                                 | 보통~빠름(병렬 시)                          |
| **과적합 제어**   | **L1/L2(λ), γ**, `min_child_weight`, `subsample`, `colsample_bytree` | **L1/L2(λ), γ**, `num_leaves`, `min_data_in_leaf`, `feature_fraction`, `bagging_fraction` | 배깅·무작위 특성선택, `max_depth`, **OOB 평가** |
| 데이터 크기       | 중~대형                                                                 | **대형·고차원·희소에 유리**                                                                         | 중형(메모리 의존)                           |
| 결측치 처리       | **자동 default 방향 학습**                                                 | **자동**                                                                                    | 구현 의존(사전 대체 권장)                      |


---

하나씩 이해해보자

# Level-wise vs Leaf-wise

트리 모델의 성장 방식은 모델의 성능과 속도에 큰 영향을 미칩니다. XGBoost와 LightGBM의 가장 큰 차이점 중 하나가 바로 이 트리 성장 전략입니다.

## Level-wise (Depth-wise) - XGBoost

Level-wise는 **같은 깊이(depth)의 모든 노드를 동시에 분할**하는 방식입니다.

**특징:**
- 트리가 깊이 방향으로 균형잡히게 성장합니다 (balanced tree)
- 한 레벨의 모든 노드를 다 처리한 후 다음 레벨로 넘어갑니다
- 각 레벨에서 분할의 이득이 작은 노드도 함께 분할됩니다
- 트리의 최대 깊이(`max_depth`)로 제어하기 쉽습니다

**장점:**
- 과적합 위험이 상대적으로 낮습니다 (균형잡힌 성장)
- 예측 가능하고 안정적인 성능
- 깊이 제한으로 복잡도 관리가 용이

**단점:**
- 비효율적인 분할도 수행됩니다 (이득이 작은 노드도 분할)
- Leaf-wise보다 느릴 수 있습니다
- 같은 성능을 얻기 위해 더 많은 노드가 필요할 수 있습니다

## Leaf-wise (Best-first) - LightGBM

Leaf-wise는 **현재 존재하는 모든 리프 노드 중 gain이 가장 큰 노드만 선택적으로 분할**하는 방식입니다.

**특징:**
- 트리가 비대칭적(asymmetric)으로 성장합니다
- 전체 트리에서 gain이 가장 큰 리프를 찾아 우선 분할합니다
- 효율적으로 loss를 줄일 수 있는 방향으로 집중합니다
- 리프 개수(`num_leaves`)로 제어합니다

**장점:**
- 더 빠르게 loss를 감소시킵니다
- 같은 분할 횟수에서 더 좋은 성능을 얻을 수 있습니다
- 계산 효율이 높습니다

**단점:**
- 과적합되기 쉽습니다 (특히 데이터가 적을 때)
- 트리가 한쪽으로 치우쳐 자랄 수 있습니다
- 신중한 하이퍼파라미터 튜닝이 필요합니다

## 시각적 비교

```
Level-wise (XGBoost):
         Root
        /    \
      L1      L1      <- 레벨 1 (2개 모두 분할)
     / \     / \
   L2  L2  L2  L2     <- 레벨 2 (4개 모두 분할)
  /\  /\  /\  /\
 L3... (균형잡힌 성장)


Leaf-wise (LightGBM):
         Root
        /    \
      L1      L1
     / \       
   L2  L2      <- gain 큰 것만 분할
  /\   
 L3 L3          <- 계속 gain 큰 것만
/\
L4 L4           <- 비대칭 성장
```

## 실무 선택 기준

**XGBoost (Level-wise)를 선택할 때:**
- 데이터 크기가 작거나 중간 규모일 때
- 과적합 위험을 최소화하고 싶을 때
- 안정적이고 예측 가능한 성능이 필요할 때
- 해석 가능성이 중요할 때 (균형잡힌 트리)

**LightGBM (Leaf-wise)을 선택할 때:**
- 데이터가 크고 학습 속도가 중요할 때
- 성능을 극대화하고 싶을 때 (충분한 데이터가 있다면)
- 고차원 데이터를 다룰 때
- 하이퍼파라미터 튜닝 리소스가 충분할 때

대부분의 경우 LightGBM이 더 빠르고 좋은 성능을 보이지만, 데이터가 적거나 과적합이 우려될 때는 XGBoost의 안정성이 더 유리할 수 있습니다. 

---

# 최적화 방법

XGBoost의 핵심은 2차 테일러 근사를 통한 효율적인 최적화입니다. 일반적인 gradient boosting이 1차 미분(gradient)만 사용하는 것과 달리, XGBoost는 2차 미분(Hessian)까지 활용하여 더 정교하고 빠른 수렴을 달성합니다.

## Objective Function의 구조

XGBoost는 매 iteration마다 새로운 트리 $f_t$를 추가하며, $t$번째 iteration의 목적함수는 다음과 같습니다.

$$
\mathcal{L}^{(t)} = \sum_{i=1}^{n} l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) + \Omega(f_t)
$$

여기서 $l$은 loss function (예: MSE, log loss), $\hat{y}_i^{(t-1)}$은 이전까지의 예측값, $f_t(x_i)$는 새로 추가할 트리의 예측값입니다. $\Omega(f_t)$는 정규화 항으로, 트리의 복잡도를 제어합니다.

**정규화 항의 정의:**

$$
\Omega(f_t) = \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2
$$

$T$는 리프 노드의 개수, $w_j$는 $j$번째 리프 노드의 가중치(예측값), $\gamma$는 리프 개수에 대한 페널티, $\lambda$는 L2 정규화 계수입니다.

## 2차 테일러 근사 (Second-order Taylor Approximation)

핵심 아이디어는 loss function을 현재 예측값 $\hat{y}_i^{(t-1)}$ 주변에서 테일러 전개하는 것입니다. $f_t(x_i)$를 추가로 더할 때 loss가 어떻게 변하는지를 근사합니다.

함수 $f(x + \Delta x)$를 $x$ 근처에서 2차까지 테일러 전개하면:

$$
f(x + \Delta x) \approx f(x) + f'(x)\Delta x + \frac{1}{2}f''(x)\Delta x^2
$$

이를 우리 문제에 적용하면, $\Delta x = f_t(x_i)$이고:

$$
l(y_i, \hat{y}_i^{(t-1)} + f_t(x_i)) \approx l(y_i, \hat{y}_i^{(t-1)}) + g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i)
$$

여기서:
- $g_i = \frac{\partial l(y_i, \hat{y}_i^{(t-1)})}{\partial \hat{y}_i^{(t-1)}}$ : **gradient** (1차 미분)
- $h_i = \frac{\partial^2 l(y_i, \hat{y}_i^{(t-1)})}{\partial (\hat{y}_i^{(t-1)})^2}$ : **Hessian** (2차 미분)

상수항 $l(y_i, \hat{y}_i^{(t-1)})$은 최적화에 영향을 주지 않으므로 제거하면:

$$
\tilde{\mathcal{L}}^{(t)} = \sum_{i=1}^{n} [g_i f_t(x_i) + \frac{1}{2} h_i f_t^2(x_i)] + \Omega(f_t)
$$

이것이 XGBoost가 실제로 최적화하는 근사된 목적함수입니다.

## 리프 노드별 재구성

트리 $f_t$는 각 데이터 포인트를 특정 리프 노드에 할당하고, 해당 리프의 가중치를 예측값으로 사용합니다. 리프 노드 $j$에 속하는 데이터 포인트들의 집합을 $I_j = \{i \mid q(x_i) = j\}$라 하면 ($q$는 데이터를 리프에 매핑하는 함수):

$$
f_t(x_i) = w_{q(x_i)}
$$

즉, 같은 리프에 속한 모든 데이터는 같은 가중치 $w_j$를 예측값으로 받습니다. 이를 이용해 목적함수를 리프별로 재구성하면:

$$
\tilde{\mathcal{L}}^{(t)} = \sum_{j=1}^{T} [(\sum_{i \in I_j} g_i) w_j + \frac{1}{2}(\sum_{i \in I_j} h_i) w_j^2] + \gamma T + \frac{1}{2}\lambda \sum_{j=1}^{T} w_j^2
$$

리프 $j$의 gradient 합과 Hessian 합을 다음과 같이 정의하면:

$$
G_j = \sum_{i \in I_j} g_i, \quad H_j = \sum_{i \in I_j} h_i
$$

목적함수는 더 간결해집니다:

$$
\tilde{\mathcal{L}}^{(t)} = \sum_{j=1}^{T} [G_j w_j + \frac{1}{2}(H_j + \lambda) w_j^2] + \gamma T
$$

## 최적 가중치 계산

이제 각 리프 $j$의 최적 가중치 $w_j^*$를 구할 수 있습니다. 위 식은 $w_j$에 대한 2차 함수이므로, 미분해서 0이 되는 점을 찾으면 됩니다:

$$
\frac{\partial \tilde{\mathcal{L}}^{(t)}}{\partial w_j} = G_j + (H_j + \lambda) w_j = 0
$$

따라서:

$$
w_j^* = -\frac{G_j}{H_j + \lambda}
$$

이것이 리프 노드 $j$의 **최적 가중치**입니다. 분자는 해당 리프의 gradient 합, 분모는 Hessian 합 + 정규화 항입니다. 

**직관적 해석:**
- $G_j < 0$이면 (gradient가 음수) loss를 더 줄이기 위해 예측값을 증가시켜야 하므로 $w_j^* > 0$
- $H_j$가 크면 (곡률이 크면) loss가 급격히 변하므로 작은 업데이트만 수행 (안정성)
- $\lambda$가 크면 정규화가 강해져 가중치가 작아짐 (과적합 방지)

## 최적 손실값 (Objective Value)

최적 가중치 $w_j^*$를 목적함수에 대입하면, 주어진 트리 구조에서 달성 가능한 최소 손실값을 얻습니다:

$$
\tilde{\mathcal{L}}^{(t)}(w^*) = -\frac{1}{2} \sum_{j=1}^{T} \frac{G_j^2}{H_j + \lambda} + \gamma T
$$

이 값이 작을수록 해당 트리 구조가 더 좋습니다. 이제 이 식을 이용해 어떻게 분할할지 결정할 수 있습니다.

## Gain: 분할 이득 계산

노드를 왼쪽(L)과 오른쪽(R) 자식으로 분할할 때, loss가 얼마나 감소하는지를 **Gain**으로 측정합니다.

분할 전 (하나의 노드):

$$
\mathcal{L}_{\text{before}} = -\frac{1}{2} \frac{(G_L + G_R)^2}{(H_L + H_R) + \lambda} + \gamma
$$

분할 후 (두 개의 노드):

$$
\mathcal{L}_{\text{after}} = -\frac{1}{2} \left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda}\right] + 2\gamma
$$

Gain은 분할로 인한 loss 감소량입니다:

$$
\text{Gain} = \mathcal{L}_{\text{before}} - \mathcal{L}_{\text{after}} = \frac{1}{2} \left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{(H_L + H_R) + \lambda}\right] - \gamma
$$

**분할 결정 규칙:**
- $\text{Gain} > 0$: 분할하면 loss가 감소하므로 분할 수행
- $\text{Gain} \leq 0$: 분할해도 이득이 없거나 오히려 손해(리프 개수 증가 페널티)이므로 분할 중단

$\gamma$가 클수록 분할에 보수적이 되어 트리가 작아지고 과적합이 방지됩니다.

## Newton-Raphson Method와의 관계

XGBoost의 최적화는 Newton-Raphson method와 밀접한 관련이 있습니다. Newton method는 함수 $f(x)$의 최솟값을 찾기 위해 다음 업데이트를 반복합니다:

$$
x_{t+1} = x_t - \frac{f'(x_t)}{f''(x_t)}
$$

XGBoost에서 $w_j^* = -\frac{G_j}{H_j + \lambda}$는 정확히 이 형태입니다:
- $G_j$는 1차 미분 (gradient)
- $H_j$는 2차 미분 (Hessian)
- $\lambda$는 정규화로 인한 추가 곡률

일반적인 gradient boosting은 $w_j^* = -\alpha G_j$ (여기서 $\alpha$는 learning rate) 형태로, 1차 정보만 사용하는 gradient descent입니다. 반면 XGBoost는 2차 정보를 활용하여 더 정확한 방향과 크기로 업데이트합니다.

**장점:**
- **빠른 수렴**: 2차 정보로 최적점에 더 빠르게 도달
- **자동 step size**: Hessian이 자동으로 적절한 업데이트 크기 결정
- **안정성**: 곡률 정보로 급격한 변화 방지

## 구체적 예시: Squared Loss

Squared loss $l(y, \hat{y}) = \frac{1}{2}(y - \hat{y})^2$를 사용하는 경우를 살펴보겠습니다.

**Gradient와 Hessian:**

$$
g_i = \frac{\partial}{\partial \hat{y}_i^{(t-1)}} \frac{1}{2}(y_i - \hat{y}_i^{(t-1)})^2 = -(y_i - \hat{y}_i^{(t-1)}) = -r_i
$$

$$
h_i = \frac{\partial^2}{\partial (\hat{y}_i^{(t-1)})^2} \frac{1}{2}(y_i - \hat{y}_i^{(t-1)})^2 = 1
$$

여기서 $r_i = y_i - \hat{y}_i^{(t-1)}$는 residual입니다. 따라서:
- $G_j = -\sum_{i \in I_j} r_i$ : 리프 $j$의 residual 합의 음수
- $H_j = |I_j|$ : 리프 $j$의 데이터 개수

최적 가중치:

$$
w_j^* = \frac{\sum_{i \in I_j} r_i}{|I_j| + \lambda}
$$

정규화가 없으면 ($\lambda = 0$), 이는 단순히 residual의 평균입니다. 즉, squared loss에서 XGBoost는 각 리프에 residual의 평균을 할당하는데, 이는 일반적인 gradient boosting과 동일합니다.

## 구체적 예시: Logistic Loss

Binary classification에서 logistic loss $l(y, \hat{y}) = y\log(1+e^{-\hat{y}}) + (1-y)\log(1+e^{\hat{y}})$를 사용하는 경우:

$p_i = \frac{1}{1 + e^{-\hat{y}_i^{(t-1)}}}$를 예측 확률이라 하면:

**Gradient와 Hessian:**

$$
g_i = p_i - y_i
$$

$$
h_i = p_i(1 - p_i)
$$

Hessian $h_i$는 예측 확률의 분산 형태입니다. 예측이 확실할수록 ($p_i \approx 0$ 또는 $p_i \approx 1$) $h_i$가 작아지고, 불확실할수록 ($p_i \approx 0.5$) $h_i$가 커집니다.

**최적 가중치:**

$$
w_j^* = -\frac{\sum_{i \in I_j} (p_i - y_i)}{\sum_{i \in I_j} p_i(1-p_i) + \lambda}
$$

분자는 예측 오차의 합, 분모는 "불확실성"의 합입니다. 불확실한 예측이 많을수록 보수적인(작은) 업데이트를 수행합니다.

## 실전에서의 계산 흐름

XGBoost가 새로운 트리를 학습하는 전체 과정입니다:

**1. Gradient와 Hessian 계산**
각 데이터 포인트 $i$에 대해 현재 예측값 $\hat{y}_i^{(t-1)}$에서 $g_i$와 $h_i$를 계산합니다.

**2. 트리 성장**
루트 노드부터 시작하여:
- 현재 노드의 $G$와 $H$ 계산
- 모든 가능한 분할(feature, threshold)에 대해 Gain 계산
- Gain이 가장 큰 분할 선택
- $\text{Gain} > 0$이면 분할 수행, 그렇지 않으면 리프로 남김
- 자식 노드들에 대해 재귀적으로 반복

**3. 리프 가중치 할당**
트리 구조가 완성되면, 각 리프 $j$에 대해 $w_j^* = -\frac{G_j}{H_j + \lambda}$ 계산

**4. 예측값 업데이트**

$$
\hat{y}_i^{(t)} = \hat{y}_i^{(t-1)} + \eta \cdot f_t(x_i)
$$

여기서 $\eta$는 learning rate(shrinkage), $f_t(x_i) = w_{q(x_i)}^*$

**5. 다음 iteration**
$t = t+1$로 증가하고 1단계부터 반복

## 왜 2차 근사인가?

**더 정확한 근사**: 1차 테일러는 선형 근사이지만, 2차 테일러는 곡률까지 고려하여 실제 함수에 더 가깝습니다.

**더 빠른 수렴**: Newton method는 gradient descent보다 빠르게 수렴합니다. 실험적으로도 XGBoost는 같은 성능을 얻기 위해 더 적은 트리가 필요합니다.

**자동 step size 조정**: Hessian이 자동으로 적절한 업데이트 크기를 결정합니다. Gradient만 사용하면 learning rate를 수동으로 튜닝해야 합니다.

**안정성**: 2차 정보는 loss surface의 곡률을 반영하므로, 급격한 변화를 피하고 안정적으로 최적화할 수 있습니다.

물론 2차 미분 계산에 추가 비용이 들지만, 대부분의 loss function에서 Hessian은 간단한 형태이므로 효율적으로 계산 가능합니다. 빠른 수렴으로 인한 이득이 계산 비용을 상쇄하고도 남습니다.

## 딥러닝 vs 트리 모델에서의 Hessian

딥러닝에서는 Newton method나 2차 최적화가 거의 사용되지 않는 반면, XGBoost에서는 매우 효율적입니다. 이 차이는 **무엇에 대한 미분인가**에서 비롯됩니다.

**딥러닝에서의 Hessian (사용하기 어려움)**

딥러닝에서 Hessian을 계산한다면, 이는 **모델 파라미터(가중치)에 대한 2차 미분**입니다. 모델 파라미터를 $\theta$라 하면:

$$
H_{ij} = \frac{\partial^2 \mathcal{L}}{\partial \theta_i \partial \theta_j}
$$

문제는 파라미터 개수입니다. 예를 들어 파라미터가 1백만 개인 신경망이라면:
- Hessian 행렬 크기: $10^6 \times 10^6 = 10^{12}$ 개 원소
- 메모리 요구량: 수 테라바이트 (float32 기준)
- 계산 복잡도: $O(n^2)$ 이상 (n은 파라미터 개수)

이런 이유로 딥러닝에서는:
- 1차 최적화만 사용 (SGD, Adam 등)
- 근사 방법 사용 (L-BFGS, Natural Gradient 등)
- Hessian-free 최적화 기법 연구

**XGBoost에서의 Hessian (매우 효율적)**

XGBoost에서 Hessian은 **예측값에 대한 loss의 2차 미분**입니다:

$$
h_i = \frac{\partial^2 l(y_i, \hat{y}_i)}{\partial \hat{y}_i^2}
$$

핵심 차이점:
1. **스칼라 값**: 각 데이터 포인트마다 하나의 스칼라 값만 계산합니다. $n$개 데이터라면 $n$개 값만 필요합니다.
2. **독립 계산**: 각 $h_i$는 독립적으로 계산 가능하며, 병렬화가 쉽습니다.
3. **단순한 공식**: Loss function의 형태에 따라 간단한 공식으로 계산됩니다.

**구체적 비교 예시**

Logistic regression을 생각해봅시다. 파라미터가 $\theta \in \mathbb{R}^d$이고, 예측값이 $\hat{y}_i = \theta^T x_i$입니다.

딥러닝 스타일 (파라미터에 대한 Hessian):
- Hessian 행렬: $H \in \mathbb{R}^{d \times d}$
- 계산량: $O(d^2)$ 또는 $O(nd^2)$
- 메모리: $O(d^2)$

XGBoost 스타일 (예측값에 대한 Hessian):
- 각 데이터의 Hessian: $h_i = p_i(1-p_i)$ (스칼라)
- 계산량: $O(n)$ (데이터 개수에 선형)
- 메모리: $O(n)$

**트리 구조의 이점**

트리 모델은 구조 자체가 Hessian 계산을 더 효율적으로 만듭니다:

1. **파라미터화 방식**: 트리는 명시적인 수치 파라미터를 최적화하지 않습니다. 대신 데이터 공간을 분할하고 각 리프에 값을 할당합니다.

2. **Closed-form 해**: 트리 구조가 고정되면, 각 리프의 최적 가중치는 closed-form으로 계산됩니다 ($w_j^* = -\frac{G_j}{H_j + \lambda}$). 반복적 최적화가 필요 없습니다.

3. **분할 탐색**: 각 분할 후보를 평가할 때, $G$와 $H$의 합만 계산하면 됩니다. 이는 $O(1)$ 연산입니다 (합을 미리 계산해두면).

**예시: 1000개 데이터, 100개 특성**

딥러닝 (간단한 MLP, 파라미터 10,000개):
- Gradient 계산: $O(10000)$ - 실용적 ✓
- Hessian 계산: $O(10000^2) = O(10^8)$ - 비실용적 ✗
- 메모리: 약 400MB (Hessian 저장)

XGBoost:
- Gradient 계산: $O(1000)$ - 매우 빠름 ✓
- Hessian 계산: $O(1000)$ - 매우 빠름 ✓
- 메모리: 약 8KB (Hessian 저장)

**왜 loss의 Hessian은 간단한가?**

대부분의 loss function은 예측값에 대해 간단한 형태를 가집니다:

- **Squared loss**: $h_i = 1$ (상수!)
- **Logistic loss**: $h_i = p_i(1-p_i)$ (확률값의 곱셈 두 번)
- **Poisson loss**: $h_i = e^{\hat{y}_i}$ (지수 함수 한 번)
- **Huber loss**: $h_i = \mathbb{1}_{|r_i| \leq \delta}$ (조건부 상수)

이들은 모두 $O(1)$ 시간에 계산 가능하며, 복잡한 행렬 연산이 전혀 필요 없습니다.

**결론**

XGBoost에서 2차 미분이 효율적인 이유는:
1. **예측값에 대한 미분**이므로 스칼라 값만 계산 (행렬 아님)
2. Loss function의 형태가 단순하여 $O(1)$ 계산
3. 트리 구조 덕분에 합산 연산만으로 최적화 가능
4. 데이터 개수에만 선형적으로 비례 (파라미터 개수와 무관)

반면 딥러닝에서는 파라미터에 대한 Hessian 행렬이 필요하므로, 차원의 저주로 인해 계산이 불가능합니다. 이것이 같은 "2차 미분"이지만 XGBoost에서는 실용적이고 딥러닝에서는 비실용적인 이유입니다.


---

# 분할 후보 탐색 전략

트리를 성장시킬 때 가장 계산 비용이 큰 부분은 최적의 분할점을 찾는 것입니다. 각 노드에서 모든 feature와 모든 가능한 threshold를 평가해야 하므로, 데이터가 커지면 매우 느려집니다. XGBoost는 이를 해결하기 위해 여러 전략을 사용합니다.

## Exact Greedy Algorithm

가장 기본적인 방법은 모든 가능한 분할점을 전수 탐색하는 것입니다.

**알고리즘:**

1. 각 feature에 대해, 해당 feature 값으로 데이터를 정렬
2. 정렬된 순서대로 순회하면서 각 값을 분할 threshold 후보로 고려
3. 각 후보에 대해 Gain 계산
4. Gain이 최대인 분할 선택

**예시:**

Feature $x_j$의 값이 `[1.2, 3.5, 3.5, 4.1, 7.8]`이라면:
- 후보 분할점: `1.2, 3.5, 4.1, 7.8` (중복 제거)
- 각 threshold에 대해: 데이터를 `≤ threshold`와 `> threshold`로 나누고 Gain 계산

**계산 복잡도:**

$m$개 feature, 각 feature당 평균 $k$개 unique 값이 있다면:
- 정렬 비용: $O(mk \log k)$
- Gain 계산: $O(mk)$ (정렬 후 선형 스캔)
- 총: $O(mk \log k)$

**문제점:**

데이터가 크면 이 방법은 매우 느립니다:
- 100만 데이터, 100개 feature → 1억 개 분할 후보 평가
- 각 iteration마다 반복 (트리 깊이 × 트리 개수)
- 메모리에 정렬된 데이터 유지 필요

## Approximate Algorithm: Quantile-based Split Finding

대용량 데이터에서는 모든 값을 분할 후보로 고려하지 않고, **quantile 기반으로 대표 후보들만 추출**합니다.

**핵심 아이디어:**

Feature 값의 분포를 $q$개 구간(bucket)으로 나누고, 각 구간의 경계를 분할 후보로 사용합니다. 예를 들어 percentile [0%, 25%, 50%, 75%, 100%]를 후보로 사용하면 4개 분할 후보만 평가하면 됩니다.

**알고리즘:**

1. 각 feature에 대해 percentile 기반 후보 추출
   - 예: 33-percentile, 67-percentile → 3개 bucket
2. 데이터를 후보 기준으로 bucket에 할당
3. 각 bucket 경계를 분할 threshold로 평가
4. 가장 좋은 분할 선택

**예시:**

Feature 값: `[1.2, 2.3, 2.8, 3.5, 4.1, 5.0, 5.5, 6.2, 7.8, 9.1]` (10개)

Exact 방법: 10개 (또는 unique 값 수) 후보 평가

Approximate 방법 (4-quantile):
- 25%-ile: 2.8
- 50%-ile: 4.55
- 75%-ile: 6.2
- 후보: `[2.8, 4.55, 6.2]` → 3개만 평가

**Global vs Local 전략:**

**Global**: 트리 시작 시 한 번만 quantile 계산하고, 모든 노드에서 동일한 후보 사용
- 장점: 계산 빠름, quantile 계산 1회
- 단점: 깊은 노드에서는 부정확할 수 있음 (데이터 분포가 변하므로)

**Local**: 각 노드마다 그 노드의 데이터로 quantile 재계산
- 장점: 더 정확한 분할 (각 노드의 분포 반영)
- 단점: 계산 비용 증가

실험 결과 적절한 bucket 수 (예: 32~128)를 사용하면 local 방법도 충분히 빠르면서 정확도가 더 높습니다.

## Weighted Quantile Sketch

여기서 XGBoost의 독창적인 부분이 나옵니다. 단순히 균등하게 quantile을 나누는 것이 아니라, **Hessian 값을 가중치로 사용한 weighted quantile**을 계산합니다.

**왜 가중치가 필요한가?**

각 데이터 포인트가 모델 학습에 기여하는 정도가 다릅니다. Hessian 값 $h_i$는 해당 데이터 포인트가 loss에 미치는 "민감도"를 나타냅니다.

Gain 수식을 다시 보면:

$$
\text{Gain} = \frac{1}{2} \left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{(H_L + H_R) + \lambda}\right]
$$

$G$와 $H$가 함께 사용되며, $H$가 큰 데이터 포인트는 더 중요합니다. 따라서 quantile을 계산할 때도 $H$를 가중치로 고려해야 정확합니다.

**Weighted Quantile의 정의:**

각 데이터 $(x_i, h_i)$가 있을 때 (feature 값 $x_i$, Hessian 가중치 $h_i$), rank function을 다음과 같이 정의합니다:

$$
r_k(z) = \frac{1}{\sum_{i=1}^{n} h_i} \sum_{x_i < z, i \in \mathcal{D}_k} h_i
$$

여기서 $\mathcal{D}_k$는 $k$번째 노드의 데이터 집합입니다. $r_k(z)$는 feature 값이 $z$보다 작은 데이터들의 Hessian 합의 비율을 나타냅니다.

**목표:** $r_k(s_{k,j}) \approx \frac{j}{q}$가 되는 분할 후보 $\{s_{k,1}, s_{k,2}, \ldots, s_{k,q-1}\}$를 찾습니다.

즉, 전체 Hessian 합을 $q$등분하는 지점들을 후보로 선택합니다.

**직관적 이해:**

일반 quantile: 데이터 개수를 균등 분할
- 10개 데이터 → 각 bucket에 2-3개씩

Weighted quantile: Hessian 합을 균등 분할
- Hessian이 큰 데이터가 많은 영역은 더 많은 후보 할당
- Hessian이 작은 데이터는 덜 중요하므로 후보 감소

**구체적 예시:**

5개 데이터, 3-quantile (2개 후보) 추출

| Feature 값 | Hessian | 누적 Hessian |
|----------|---------|-------------|
| 1.0      | 0.1     | 0.1         |
| 2.0      | 0.1     | 0.2         |
| 3.0      | 0.5     | 0.7         |
| 4.0      | 0.2     | 0.9         |
| 5.0      | 0.1     | 1.0         |

일반 quantile (데이터 개수 기준):
- 33%-ile: 2.0 (2개/5개 = 40%)
- 67%-ile: 4.0 (4개/5개 = 80%)

Weighted quantile (Hessian 합 기준):
- 33%-ile: 3.0 근처 (누적 Hessian 0.33)
- 67%-ile: 3.0-4.0 사이 (누적 Hessian 0.67)

Hessian이 큰 3.0 근처에 더 많은 후보가 집중됩니다. 이는 해당 영역의 분할이 더 중요하기 때문에 합리적입니다.

**왜 효과적인가?**

1. **적응적 해상도**: 중요한 영역(Hessian 큰 곳)에 더 세밀한 분할 후보 배치
2. **이론적 보장**: 논문에서는 weighted quantile을 사용하면 approximate algorithm의 정확도가 보장됨을 증명
3. **실험적 우수성**: 같은 후보 개수에서 일반 quantile보다 성능 향상

## Quantile Sketch 알고리즘

실제 구현에서는 대용량 데이터의 weighted quantile을 효율적으로 계산하는 "sketch" 알고리즘이 필요합니다.

**문제:** 수백만~수억 개 데이터에서 weighted quantile을 정확히 계산하려면 데이터를 정렬해야 하는데 ($O(n \log n)$), 메모리와 시간이 너무 많이 듭니다.

**해결:** Approximate quantile sketch 알고리즘 사용
- GK algorithm (Greenwald-Khanna)
- Weighted variant
- Mergeable: 병렬/분산 계산 가능

**핵심 특성:**

1. **한 번 스캔**: 데이터를 한 번만 순회하면서 요약 통계 구축
2. **메모리 효율**: $O(1/\epsilon)$ 크기의 sketch 유지 (데이터 크기와 무관)
3. **정확도 보장**: $\epsilon$-approximate quantile 계산
4. **병합 가능**: 여러 sketch를 합쳐서 전체 quantile 계산

**예시:**

1억 개 데이터, 100개 feature, 32개 quantile 후보:
- Exact 정렬: 약 80GB 메모리 필요
- Quantile sketch: 약 10MB 메모리 (8000배 감소)

**알고리즘 흐름:**

```python
# 의사 코드
for feature in features:
    sketch = WeightedQuantileSketch()
    
    # 데이터 스캔하며 sketch 구축
    for i in data_indices:
        sketch.add(feature_value[i], hessian[i])
    
    # Quantile 추출
    candidates = sketch.get_quantiles(num_buckets)
    
    # 분할 평가
    for threshold in candidates:
        gain = compute_gain(threshold)
        update_best_split(gain, feature, threshold)
```

## 실전에서의 선택: tree_method

XGBoost의 `tree_method` 파라미터가 이 전략들을 결정합니다:

**`exact`**
- Exact greedy algorithm 사용
- 모든 값을 분할 후보로 고려
- 작은 데이터에서 최적
- 메모리 사용량 높음

**`approx`**
- Approximate algorithm + weighted quantile
- Global 또는 local 전략 (추가 파라미터)
- 중대형 데이터에 적합
- 속도-정확도 균형

**`hist`** (가장 많이 사용)
- Histogram 기반 알고리즘
- 데이터를 미리 discretize (binning)
- 매우 빠름, 메모리 효율적
- LightGBM 스타일
- `max_bin` 파라미터로 bin 개수 조정 (기본 256)

**`gpu_hist`**
- `hist`의 GPU 가속 버전
- CUDA 지원 GPU 필요
- 대용량 데이터에서 큰 속도 향상

## Histogram 알고리즘 (tree_method='hist')

현대적인 XGBoost 사용에서 가장 권장되는 방법입니다.

**아이디어:**

연속적인 feature 값을 미리 discrete bin으로 변환합니다. 예를 들어 256개 bin을 사용하면, 모든 값을 0~255 사이 정수로 매핑합니다.

**전처리 (한 번만):**

```python
# Feature 값: [1.2, 3.5, 3.7, 7.8, 9.1]
# 256개 bin으로 discretize

bin_edges = compute_quantiles(feature_values, num_bins=256)
# bin_edges: [1.2, 1.5, 1.8, ..., 9.1]

binned_values = digitize(feature_values, bin_edges)
# binned_values: [0, 100, 105, 200, 255]
```

**분할 탐색 (매우 빠름):**

원본 값 대신 bin index로 계산하므로:
- 256개 후보만 평가 (데이터 크기 무관)
- Integer 연산 (빠름)
- 메모리 효율 (int8 사용 가능)
- Cache-friendly

**Gradient histogram:**

각 bin에 대해 gradient와 Hessian 합을 미리 계산해둡니다:

$$
G_{\text{bin}[b]} = \sum_{i: \text{bin}[i]=b} g_i, \quad H_{\text{bin}[b]} = \sum_{i: \text{bin}[i]=b} h_i
$$

분할 평가 시 bin별 합만 더하면 되므로 $O(256) = O(1)$ 시간에 계산 가능합니다.

**장점:**

- **속도**: 데이터 크기에 거의 무관한 분할 탐색
- **메모리**: Binned 데이터는 int8로 저장 가능
- **Cache**: 작은 histogram은 CPU cache에 fit
- **정확도**: 256 bin이면 대부분 충분

**단점:**

- Binning으로 인한 미세한 정확도 손실 (실무에서는 거의 무시 가능)
- 매우 작은 데이터에서는 exact가 더 나을 수 있음

## 파라미터 선택 가이드

**소규모 데이터 (< 10,000 행)**
```python
tree_method='exact'  # 최고 정확도
```

**중규모 데이터 (10,000 ~ 1,000,000 행)**
```python
tree_method='hist'  # 균형잡힌 선택
max_bin=256  # 기본값
```

**대규모 데이터 (> 1,000,000 행)**
```python
tree_method='hist'
max_bin=128  # 속도 향상, 정확도는 거의 동일
```

**GPU 사용 가능**
```python
tree_method='gpu_hist'
# 10배 이상 속도 향상 가능
```

**메모리 제약이 있는 경우**
```python
tree_method='hist'
max_bin=64  # 더 작은 메모리 사용
```

## 성능 비교 예시

100만 행, 100개 feature, depth=6 트리 학습:

| tree_method | 시간 (초) | 메모리 (MB) | 정확도 (AUC) |
|-------------|--------|-----------|------------|
| exact       | 45.2   | 3200      | 0.8523     |
| approx      | 12.1   | 800       | 0.8521     |
| hist        | 3.8    | 400       | 0.8519     |
| gpu_hist    | 0.9    | 500*      | 0.8519     |

*GPU 메모리

## 정리

XGBoost의 분할 후보 탐색은 단순 전수 탐색에서 고도로 최적화된 알고리즘으로 발전했습니다:

1. **Exact**: 완전 탐색, 소규모 데이터
2. **Approximate**: Weighted quantile sketch, 중간 규모
3. **Histogram**: Discretization + cache 최적화, 현재 표준
4. **GPU**: 병렬 가속, 대규모 데이터

핵심 혁신은 **weighted quantile**입니다. Hessian 정보를 활용하여 중요한 영역에 분할 후보를 집중시킴으로써, 적은 후보로도 높은 정확도를 유지합니다. 이는 XGBoost가 빠르면서도 정확한 이유 중 하나입니다.

---

# 병렬화와 시스템 최적화

XGBoost가 빠른 이유는 알고리즘적 효율성뿐만 아니라 시스템 레벨의 최적화 덕분입니다. 특히 병렬화는 여러 레벨에서 이루어지며, 하드웨어 특성을 고려한 세밀한 최적화가 적용되어 있습니다.

## 병렬화의 핵심: 무엇을 병렬화하는가?

먼저 명확히 해야 할 점은 **트리 자체는 순차적으로 학습**된다는 것입니다. Boosting의 특성상 $t$번째 트리는 $t-1$번째까지의 결과에 의존하므로, 트리들을 동시에 학습할 수 없습니다.

그렇다면 무엇을 병렬화할까? 답은 **각 트리를 학습할 때 최적 분할점을 찾는 과정**입니다.

## Feature-level 병렬화 (가장 중요)

XGBoost의 주된 병렬화 전략은 **feature별 분할 후보 탐색을 병렬로 수행**하는 것입니다.

**단일 노드 분할 과정:**

```
for node in current_level:
    # 이 부분을 병렬화
    best_split = None
    best_gain = -inf
    
    for feature in features:  # ← 병렬 처리 가능!
        for threshold in candidates[feature]:
            gain = compute_gain(feature, threshold, node)
            if gain > best_gain:
                best_gain = gain
                best_split = (feature, threshold)
```

각 feature에 대한 분할 후보 평가는 **독립적**입니다. Feature A의 gain 계산이 feature B의 gain 계산에 영향을 주지 않으므로, 모든 feature를 동시에 평가할 수 있습니다.

**병렬화 이득:**

100개 feature, 8개 CPU 코어:
- 순차 처리: 100개 feature × t초 = 100t초
- 병렬 처리: (100개 / 8코어) × t초 ≈ 12.5t초
- 약 8배 속도 향상

**구현 방식:**

```python
# OpenMP 스타일 병렬화 (C++ 구현)
#pragma omp parallel for
for (int feature_id = 0; feature_id < num_features; feature_id++) {
    // 각 스레드가 독립적으로 한 feature의 최적 분할 계산
    SplitEntry local_best = FindBestSplit(feature_id, node_data);
    
    // Critical section: 전역 최적값 업데이트
    #pragma omp critical
    {
        if (local_best.gain > global_best.gain) {
            global_best = local_best;
        }
    }
}
```

**왜 효과적인가?**

1. **Granularity**: Feature 단위는 충분히 큰 작업량 (fine-grained가 아님)
2. **Load balancing**: Feature별 작업량이 비슷함
3. **Communication overhead 최소**: 각 스레드가 독립적으로 계산, 마지막에만 동기화
4. **Scalability**: Feature가 많을수록 병렬화 이득 증가

## Block 구조와 Column Format

병렬화를 효율적으로 수행하기 위해 XGBoost는 데이터를 특수한 형태로 저장합니다.

**문제점: Row-major 형식의 한계**

일반적인 데이터 형식 (행 우선):

```
data = [
    [x1_1, x1_2, ..., x1_m],  # 샘플 1
    [x2_1, x2_2, ..., x2_m],  # 샘플 2
    ...
]
```

이 형식은 feature별 분할 탐색에 비효율적입니다:
- Feature j의 모든 값을 접근하려면 모든 행을 순회해야 함
- Cache miss 빈번 (메모리 접근 패턴이 비연속적)
- 정렬 시 전체 데이터 이동 필요

**해결: Compressed Column Block (CSC)**

XGBoost는 데이터를 **column-major 형식으로 전치하고 압축**하여 저장합니다:

```
# Feature별로 데이터 저장
feature_blocks = {
    feature_0: [(value, instance_id), ...],  # 정렬됨
    feature_1: [(value, instance_id), ...],
    ...
}
```

각 feature에 대해:
1. (값, 데이터 인덱스) 쌍을 값 기준으로 정렬
2. 압축하여 저장 (sparse data의 경우 효율적)

**Block 구조의 장점:**

**1. Parallel feature scanning**

각 feature block이 독립적이므로 병렬 처리가 자연스럽습니다:

```
Thread 1 → Feature Block 0
Thread 2 → Feature Block 1
Thread 3 → Feature Block 2
...
```

**2. Cache-friendly access**

Feature 값들이 메모리에 연속적으로 배치되어 있어:
- Sequential memory access
- Cache line을 효율적으로 활용
- Prefetching 효과

**3. 정렬 비용 1회**

Block을 만들 때 한 번만 정렬하면, 이후 모든 트리 학습에서 재사용합니다:
- 트리 1: Block 생성 (정렬) + 분할 탐색
- 트리 2~N: 분할 탐색만 (정렬 불필요)

**메모리 레이아웃 비교:**

Row-major (일반적):
```
메모리: [x1_1][x1_2][x1_3]...[x2_1][x2_2][x2_3]...
Feature 2 접근: x1_2, 점프, x2_2, 점프, x3_2, ... (비연속적)
```

Column Block (XGBoost):
```
메모리: [feature_0의 모든 값][feature_1의 모든 값]...
Feature 2 접근: 연속된 메모리 블록 읽기 (cache-friendly)
```

## Cache-aware Access Pattern

현대 CPU의 성능은 메모리 접근 패턴에 크게 의존합니다. XGBoost는 CPU cache 계층 구조를 고려하여 설계되었습니다.

**CPU Cache 계층:**

```
CPU Core
  ↕ ~1 cycle
L1 Cache (32KB)
  ↕ ~4 cycles  
L2 Cache (256KB)
  ↕ ~12 cycles
L3 Cache (8MB, shared)
  ↕ ~40 cycles
Main Memory (GB)
  ↕ ~200 cycles
```

**Cache Miss의 비용**

L1 cache hit vs main memory access: 약 200배 차이!

**XGBoost의 Cache 최적화:**

**1. Gradient/Hessian 통계를 cache에 유지**

각 노드의 $G$와 $H$ 통계는 작은 배열로 표현 가능:

```cpp
// Histogram: bin별 gradient/hessian 합
struct HistEntry {
    double sum_grad;
    double sum_hess;
};

HistEntry hist[256];  // 256 bins = 4KB (L1 cache에 fit)
```

4KB는 L1 cache에 완전히 들어가므로, histogram 기반 분할 탐색이 매우 빠릅니다.

**2. Block 단위 처리**

전체 데이터를 한 번에 처리하지 않고, cache에 들어갈 크기의 block으로 나누어 처리:

```python
block_size = L2_CACHE_SIZE / (sizeof(feature_value) + sizeof(gradient))

for block in range(0, n_samples, block_size):
    # 이 block의 데이터는 L2 cache에 상주
    for i in range(block, min(block + block_size, n_samples)):
        bin_id = data[i].bin
        hist[bin_id].sum_grad += gradients[i]
        hist[bin_id].sum_hess += hessians[i]
```

**3. Prefetching**

순차적 메모리 접근 패턴 덕분에 CPU가 자동으로 다음 데이터를 미리 가져옵니다 (hardware prefetching).

**성능 영향:**

Cache-aware 최적화 전후 비교:
- Before: 메모리 대역폭에 병목 (cache miss 많음)
- After: CPU 연산에 병목 (대부분 cache hit)
- 약 2-3배 속도 향상

## Histogram 기반 병렬화

Histogram 방법은 병렬화에 특히 유리합니다.

**알고리즘:**

```python
# 1. Gradient histogram 구축 (병렬화)
#pragma omp parallel for
for feature_id in range(num_features):
    hist[feature_id] = build_histogram(feature_id, node_data)

# 2. Histogram에서 최적 분할 찾기 (병렬화)
#pragma omp parallel for
for feature_id in range(num_features):
    local_best = find_best_split_from_histogram(hist[feature_id])
    update_global_best(local_best)
```

**병렬화 특징:**

**1. Data-parallel histogram construction**

여러 스레드가 동시에 histogram을 구축할 수 있습니다. 각 스레드가 데이터의 일부를 처리하고, 결과를 합칩니다:

```cpp
// Thread-local histogram
#pragma omp parallel
{
    HistEntry local_hist[256] = {0};
    
    // 각 스레드가 데이터의 일부 처리
    #pragma omp for
    for (int i = 0; i < n_samples; i++) {
        int bin = data[i].bin;
        local_hist[bin].sum_grad += gradients[i];
        local_hist[bin].sum_hess += hessians[i];
    }
    
    // Reduction: local histogram 합치기
    #pragma omp critical
    {
        for (int b = 0; b < 256; b++) {
            global_hist[b] += local_hist[b];
        }
    }
}
```

**2. Histogram subtraction trick**

부모 노드와 한쪽 자식 노드의 histogram이 있으면, 다른 자식은 빼기로 구할 수 있습니다:

$$
H_{\text{right}} = H_{\text{parent}} - H_{\text{left}}
$$

이는 계산량을 최대 50% 감소시킵니다. 데이터가 큰 쪽만 계산하고, 작은 쪽은 빼기로 구합니다.

**3. Small vs Large 노드 전략**

- Small 노드: 직접 histogram 계산
- Large 노드: 형제 노드 계산 후 subtraction

이 적응적 전략으로 항상 최소 작업량으로 histogram을 구합니다.

## Out-of-core Computation

메모리보다 큰 데이터를 처리하기 위한 전략입니다.

**문제:** 데이터가 메모리에 다 들어가지 않는 경우 (예: 100GB 데이터, 16GB RAM)

**해결: Block compression + Disk-based computation**

**1. Block 압축**

Column block을 압축하여 저장:
- Sparse data: CSC format (non-zero만 저장)
- Dense data: Bit packing, quantization

압축률 2-10배로 메모리 사용량 대폭 감소

**2. Block sharding**

데이터를 여러 block으로 나누어 디스크에 저장:

```
Disk: [Block 0][Block 1][Block 2]...
       ↓ Load
Memory: [Block 0]
       → Process → Unload
       ↓ Load
       [Block 1]
       → Process → Unload
       ...
```

**3. Async prefetching**

다음 block을 미리 로드하여 I/O 대기 시간 숨기기:

```python
# 의사 코드
thread_compute = Thread(target=process_block, args=(current_block))
thread_io = Thread(target=load_block, args=(next_block))

thread_compute.start()
thread_io.start()  # 동시에 다음 블록 로드

thread_compute.join()
thread_io.join()

current_block = next_block  # Swap
```

**성능:**

- 순차 I/O: 디스크 대역폭 활용 (~500MB/s SSD)
- Prefetching: I/O와 compute overlap으로 오버헤드 최소화
- 약 2배 느려짐 (vs in-memory), 하지만 처리 가능!

## 분산 학습 (Distributed XGBoost)

단일 머신을 넘어서는 데이터를 위한 병렬화입니다.

**아키텍처:**

```
Master Node
    ↓ (broadcast gradients/hessians)
Worker 1 | Worker 2 | Worker 3 | ...
    ↓ (each computes local histogram)
    → Reduce (merge histograms) →
Master
    ↓ (find best split)
    ↓ (broadcast split decision)
Workers
```

**Data parallelism:**

1. **Data partitioning**: 각 worker가 데이터의 일부 보유
2. **Local computation**: 각 worker가 자신의 데이터로 local histogram 계산
3. **AllReduce**: 모든 worker의 histogram 합치기 (MPI, Rabit 등)
4. **Split decision**: Master가 global histogram에서 최적 분할 결정

**통신 최적화:**

- Histogram 크기: $O(\text{features} \times \text{bins})$ (데이터 크기와 무관)
- 256 bins, 100 features → ~200KB (작음!)
- AllReduce 통신량이 작아 scalability 좋음

**Approximate algorithm과의 시너지:**

Approximate algorithm은 분산 환경에서 특히 유용:
- 각 worker가 local quantile sketch 계산
- Sketch 병합 (mergeable quantile sketch)
- Global quantile 추출
- 통신량: $O(1/\epsilon)$ (작음)

## GPU 가속 (gpu_hist)

GPU의 massive parallelism을 활용합니다.

**GPU vs CPU:**

| 특성 | CPU | GPU |
|-----|-----|-----|
| 코어 수 | 8-64 | 1000-10000+ |
| 클럭 속도 | 3-5 GHz | 1-2 GHz |
| 메모리 대역폭 | ~100 GB/s | ~500 GB/s |
| 적합한 작업 | 복잡한 제어 흐름 | 단순 반복 작업 |

**GPU 병렬화 전략:**

**1. Histogram 구축 - Massive parallelism**

```cuda
// CUDA kernel
__global__ void BuildHistogram(data, gradients, hessians, hist) {
    int idx = blockIdx.x * blockDim.x + threadIdx.x;
    
    if (idx < n_samples) {
        int bin = data[idx].bin;
        atomicAdd(&hist[bin].sum_grad, gradients[idx]);
        atomicAdd(&hist[bin].sum_hess, hessians[idx]);
    }
}

// Launch with 10000+ threads
BuildHistogram<<<blocks, threads>>>(...)
```

수천 개의 thread가 동시에 histogram 업데이트

**2. Atomic operations**

여러 thread가 같은 bin을 업데이트할 수 있으므로 atomic operation 필요:
- GPU의 atomic add는 하드웨어 지원
- 최신 GPU (Ampere 등)에서 매우 빠름

**3. Memory hierarchy**

```
GPU Core
  ↕
Shared Memory (48KB per block) - 스레드간 공유
  ↕
L2 Cache (6MB)
  ↕
Global Memory (16GB+)
```

Histogram을 shared memory에 두면 매우 빠른 접근 가능

**성능:**

- 간단한 연산의 대량 반복: GPU가 10-100배 빠름
- Histogram 구축: GPU가 특히 유리
- 전체 학습: 약 5-20배 속도 향상 (데이터/모델 크기에 따라)

## 병렬화 효율성 분석

**Amdahl's Law:**

병렬화 가능한 비율이 $P$일 때, $N$개 프로세서 사용 시 최대 속도 향상:

$$
\text{Speedup} = \frac{1}{(1-P) + \frac{P}{N}}
$$

XGBoost에서 $P \approx 0.95$ (분할 탐색이 95% 차지):
- 8 코어: ~6.3배 속도 향상
- 16 코어: ~9.8배 속도 향상
- 32 코어: ~14.9배 속도 향상

실제로는 통신 오버헤드 등으로 이보다 약간 낮지만, 높은 확장성을 보입니다.

**Strong scaling vs Weak scaling:**

**Strong scaling**: 같은 문제를 더 많은 프로세서로
- XGBoost: 16 코어까지 좋은 scaling
- 이후 통신/동기화 오버헤드 증가

**Weak scaling**: 프로세서 증가와 함께 문제 크기도 증가
- XGBoost: 매우 좋은 scaling
- 분산 환경에서 수백 노드까지 확장 가능

## 실전 최적화 팁

**CPU 병렬화:**

```python
import xgboost as xgb

model = xgb.XGBClassifier(
    tree_method='hist',  # 병렬화에 최적
    n_jobs=-1,  # 모든 CPU 코어 사용
    max_bin=256  # Cache-friendly size
)
```

**GPU 가속:**

```python
model = xgb.XGBClassifier(
    tree_method='gpu_hist',  # GPU 사용
    gpu_id=0  # GPU device ID
)
```

**분산 학습 (Dask 예시):**

```python
import dask.dataframe as dd
from xgboost import dask as dxgb

# Dask DataFrame으로 데이터 로드
X = dd.read_csv('large_data.csv')
y = X['target']
X = X.drop('target', axis=1)

# 분산 학습
dtrain = dxgb.DaskDMatrix(client, X, y)
model = dxgb.train(
    client,
    params={'tree_method': 'hist'},
    dtrain=dtrain,
    num_boost_round=100
)
```

## 정리

XGBoost의 속도는 다층적 병렬화 전략의 결과입니다:

1. **Feature-level parallelism**: 알고리즘의 본질적 병렬성 활용
2. **Block structure**: Cache-friendly 데이터 레이아웃
3. **Histogram method**: 데이터 크기와 무관한 연산량
4. **Out-of-core**: 메모리 제약 극복
5. **Distributed**: 단일 머신 한계 극복
6. **GPU**: Massive parallelism 활용

이러한 최적화들이 결합되어, XGBoost는 단순한 알고리즘 구현을 넘어서 프로덕션급 고성능 시스템이 되었습니다. 이론적 정확성과 실용적 성능을 모두 갖춘 것이 XGBoost의 진정한 강점입니다.

---

# 결측치 처리: Sparsity-aware Split Finding

XGBoost의 결측치 처리는 매우 독창적이며, 전처리 없이도 자동으로 최적의 처리 방법을 학습합니다. 이는 "default direction"이라는 개념을 통해 구현되며, 희소(sparse) 데이터에 대한 효율적인 처리도 함께 제공합니다.

## 전통적 방법의 문제점

일반적인 머신러닝에서 결측치를 다루는 방법들:

1. **삭제**: 결측치가 있는 행 제거 → 데이터 손실
2. **대체**: 평균, 중앙값, 최빈값 등으로 채우기 → 정보 왜곡
3. **별도 카테고리**: -999, NaN 등 특수값 → 트리가 별도 분기 생성해야 함

**문제점:**
- 결측치 자체가 갖는 정보를 활용하지 못함
- 사전 처리 필요 (추가 작업)
- 최적이 아닐 수 있음 (데이터마다 다름)

## XGBoost의 접근: Default Direction

XGBoost는 각 분할점마다 결측치를 **왼쪽 또는 오른쪽 중 하나의 고정된 방향**으로 보냅니다. 이 방향을 "default direction"이라 하며, 학습 시 자동으로 결정됩니다.

**핵심 아이디어:**

분할 `feature_j ≤ threshold`에서:
- 비결측 데이터: 조건에 따라 왼쪽/오른쪽 분할
- 결측 데이터: 모두 default direction으로 이동 (왼쪽 또는 오른쪽)

**장점:**
1. **정보 활용**: 결측치 자체가 패턴을 가질 수 있음을 활용
2. **자동 학습**: 데이터 기반으로 최적 방향 결정
3. **효율성**: 별도 분기 없이 기존 분할에 통합

## Default Direction 학습 알고리즘

각 분할 후보를 평가할 때, XGBoost는 **양쪽 방향을 모두 시도**하고 더 나은 쪽을 선택합니다.

**알고리즘:**

```
For each feature f and threshold t:
    # 비결측 데이터로 기본 분할
    left = {i : x_i[f] ≤ t and x_i[f] is not missing}
    right = {i : x_i[f] > t and x_i[f] is not missing}
    missing = {i : x_i[f] is missing}
    
    # 옵션 1: 결측치를 왼쪽으로
    gain_left = Gain(left ∪ missing, right)
    
    # 옵션 2: 결측치를 오른쪽으로
    gain_right = Gain(left, right ∪ missing)
    
    # 더 좋은 쪽 선택
    if gain_left > gain_right:
        default_direction = LEFT
        best_gain = gain_left
    else:
        default_direction = RIGHT
        best_gain = gain_right
    
    # 최적 분할 업데이트
    if best_gain > global_best_gain:
        update_best_split(f, t, default_direction, best_gain)
```

**Gain 계산 복습:**

$$
\text{Gain} = \frac{1}{2} \left[\frac{G_L^2}{H_L + \lambda} + \frac{G_R^2}{H_R + \lambda} - \frac{(G_L + G_R)^2}{(H_L + H_R) + \lambda}\right] - \gamma
$$

결측 데이터를 어느 쪽에 포함시키느냐에 따라 $G_L, G_R, H_L, H_R$이 달라지므로 Gain도 변합니다.

## 구체적 예시

5개 데이터, feature X로 분할, threshold = 3.0

| Index | X | Gradient | Hessian |
|-------|---|----------|---------|
| 1     | 2.0 | -0.5 | 0.2 |
| 2     | 5.0 | 0.3  | 0.3 |
| 3     | **NaN** | -0.2 | 0.1 |
| 4     | 1.0 | -0.6 | 0.25 |
| 5     | **NaN** | 0.4  | 0.15 |

**Step 1: 비결측 데이터 분할**

- Left (X ≤ 3.0): {1, 4}
  - $G_L = -0.5 + (-0.6) = -1.1$
  - $H_L = 0.2 + 0.25 = 0.45$

- Right (X > 3.0): {2}
  - $G_R = 0.3$
  - $H_R = 0.3$

- Missing: {3, 5}
  - $G_m = -0.2 + 0.4 = 0.2$
  - $H_m = 0.1 + 0.15 = 0.25$

**Step 2: 옵션 1 - 결측치를 왼쪽으로**

- Left': {1, 3, 4, 5}
  - $G_{L'} = -1.1 + 0.2 = -0.9$
  - $H_{L'} = 0.45 + 0.25 = 0.7$

- Right': {2}
  - $G_{R'} = 0.3$
  - $H_{R'} = 0.3$

Gain 계산 (λ=1 가정):

$$
\text{Gain}_{\text{left}} = \frac{1}{2}\left[\frac{(-0.9)^2}{0.7+1} + \frac{0.3^2}{0.3+1} - \frac{(-0.6)^2}{1.0+1}\right]
$$

$$
= \frac{1}{2}\left[\frac{0.81}{1.7} + \frac{0.09}{1.3} - \frac{0.36}{2.0}\right] = \frac{1}{2}[0.476 + 0.069 - 0.180] = 0.183
$$

**Step 3: 옵션 2 - 결측치를 오른쪽으로**

- Left'': {1, 4}
  - $G_{L''} = -1.1$
  - $H_{L''} = 0.45$

- Right'': {2, 3, 5}
  - $G_{R''} = 0.3 + 0.2 = 0.5$
  - $H_{R''} = 0.3 + 0.25 = 0.55$

$$
\text{Gain}_{\text{right}} = \frac{1}{2}\left[\frac{(-1.1)^2}{0.45+1} + \frac{0.5^2}{0.55+1} - \frac{(-0.6)^2}{1.0+1}\right]
$$

$$
= \frac{1}{2}\left[\frac{1.21}{1.45} + \frac{0.25}{1.55} - \frac{0.36}{2.0}\right] = \frac{1}{2}[0.834 + 0.161 - 0.180] = 0.408
$$

**결정: $\text{Gain}_{\text{right}} > \text{Gain}_{\text{left}}$이므로 default direction = RIGHT**

이 분할에서 결측치는 오른쪽으로 이동합니다.

## 왜 이 방법이 효과적인가?

**1. 결측 패턴 학습**

결측치가 무작위가 아니라 패턴을 가질 때 (MCAR이 아닌 MAR, MNAR), 이를 자동으로 학습합니다.

예시:
- 소득 feature가 결측 → 저소득층이 응답 거부 → 결측 = "낮은 소득"의 신호
- XGBoost는 결측치를 낮은 소득 방향으로 보내는 것을 학습

**2. 유연성**

각 분할마다 독립적으로 결정하므로:
- Feature A의 결측은 왼쪽
- Feature B의 결측은 오른쪽
- Feature A의 다른 threshold에서는 다른 방향

데이터의 복잡한 결측 구조를 표현 가능

**3. 단순 대체보다 우수**

단순 대체 (평균 등)는 모든 결측을 같은 값으로 만들지만, default direction은 맥락에 따라 다르게 처리합니다.

## Sparse Data 최적화

Default direction 메커니즘은 **희소 행렬 (sparse matrix)** 처리에도 사용됩니다.

**희소 데이터 예시:**
- One-hot encoding: 대부분 0
- TF-IDF: 단어가 없으면 0
- 유저-아이템 행렬: 대부분 상호작용 없음

**문제:** 0이 압도적으로 많으면 모든 값을 확인하는 것은 비효율적

**해결:** 0을 결측으로 취급하고, non-zero 값만으로 분할 결정

**알고리즘:**

```python
# Feature가 희소할 때
non_zero = {i : x_i[f] != 0}
zero = {i : x_i[f] == 0}  # 매우 많음

# Non-zero만으로 threshold 탐색
for threshold in sorted(values[non_zero]):
    left = {i in non_zero : x_i[f] ≤ threshold}
    right = {i in non_zero : x_i[f] > threshold}
    
    # Zero를 왼쪽 또는 오른쪽으로
    gain_left = Gain(left ∪ zero, right)
    gain_right = Gain(left, right ∪ zero)
    
    # 더 나은 쪽 선택
    ...
```

**효율성:**

- 100만 데이터, 99% sparse (1만 개 non-zero)
- 순차 처리: 100만 번 비교
- Sparse-aware: 1만 번 비교 (100배 빠름)

## 구현 세부사항

**1. CSC (Compressed Sparse Column) Format**

희소 행렬을 효율적으로 저장:

```python
# Dense representation (메모리 낭비)
feature = [0, 0, 0, 5.2, 0, 0, 3.1, 0, ...]

# CSC representation (효율적)
feature = {
    'values': [5.2, 3.1],       # Non-zero 값
    'indices': [3, 6],           # 해당 데이터 인덱스
    'size': 1000000              # 전체 크기
}
```

메모리: $O(\text{non-zeros})$ vs $O(n)$

**2. Default direction 저장**

각 분할 노드에 저장:

```cpp
struct SplitNode {
    int feature_id;
    float threshold;
    Direction default_dir;  // LEFT or RIGHT
    int left_child;
    int right_child;
};
```

예측 시 사용:

```python
def predict(node, x):
    if x[node.feature_id] is missing:
        # Default direction 사용
        if node.default_dir == LEFT:
            return predict(node.left_child, x)
        else:
            return predict(node.right_child, x)
    else:
        # 일반 분할
        if x[node.feature_id] <= node.threshold:
            return predict(node.left_child, x)
        else:
            return predict(node.right_child, x)
```

## 이론적 배경

**정보 이득 관점:**

결측치를 어느 방향으로 보낼지는 **mutual information을 최대화**하는 선택입니다.

$$
I(Y; \text{Split}) = H(Y) - H(Y | \text{Split})
$$

결측치를 포함시킬 때 조건부 엔트로피가 더 감소하는 쪽으로 보내면, 정보 이득이 극대화됩니다.

**Bayesian 관점:**

결측치의 분포를 비결측 데이터로부터 추론:

$$
P(\text{missing} \to \text{left} | \text{data}) \propto \text{Gain}_{\text{left}}
$$

Gain이 높은 방향이 사후 확률이 높은 방향

## 다른 알고리즘과의 비교

| 알고리즘 | 결측치 처리 | 특징 |
|---------|-----------|------|
| **XGBoost** | Default direction 학습 | 자동, 최적, 효율적 |
| **LightGBM** | 동일 (default direction) | XGBoost와 같은 방식 |
| **CatBoost** | 다양한 전략 (ordered TS 등) | 더 복잡한 처리 |
| **Scikit-learn RF** | 지원 안 함 | 사전 대체 필요 |
| **H2O** | Mean/mode 대체 또는 별도 분기 | 자동이지만 덜 최적 |

XGBoost와 LightGBM의 방식이 가장 우수한 것으로 알려져 있습니다.

## 실전 사용

**코드:**

```python
import xgboost as xgb
import numpy as np

# 결측치가 포함된 데이터
X_train = np.array([
    [1.0, 2.0],
    [3.0, np.nan],  # 결측
    [np.nan, 4.0],  # 결측
    [5.0, 6.0]
])
y_train = [0, 1, 1, 0]

# XGBoost는 자동으로 처리
model = xgb.XGBClassifier()
model.fit(X_train, y_train)  # 전처리 불필요!

# 예측 시에도 자동 처리
X_test = np.array([[2.0, np.nan]])
prediction = model.predict(X_test)
```

**주의사항:**

1. **0 vs NaN**: 0이 의미 있는 값이면 NaN으로 명시해야 함
   ```python
   # 잘못된 예: 0을 결측으로 착각
   X[X == 0] = np.nan  # 조심!
   
   # 올바른 예: 진짜 결측만 NaN으로
   # 데이터 로드 시 명시적으로 처리
   ```

2. **Sparse matrix 사용**: scipy.sparse 지원
   ```python
   from scipy.sparse import csr_matrix
   
   X_sparse = csr_matrix(X_train)
   dtrain = xgb.DMatrix(X_sparse, label=y_train)
   model = xgb.train(params, dtrain)
   ```

3. **결측 비율이 높을 때**: Default direction이 더 중요해짐
   - 50% 이상 결측: XGBoost의 강점 발휘
   - 사전 대체보다 성능 우수

## 실험 결과

**벤치마크 (결측 비율별 AUC):**

| 결측 비율 | XGBoost (자동) | RF (평균 대체) | RF (삭제) |
|---------|-------------|-------------|---------|
| 0%      | 0.850       | 0.850       | 0.850   |
| 10%     | 0.848       | 0.845       | 0.830   |
| 30%     | 0.842       | 0.825       | 0.780   |
| 50%     | 0.830       | 0.790       | 0.650   |

결측이 많을수록 XGBoost의 자동 처리가 더 우수합니다.

## 한계와 고려사항

**1. MCAR (Missing Completely At Random)**

결측이 완전 무작위라면 default direction의 이점이 적습니다. 하지만 해가 되지도 않으므로 안전합니다.

**2. 고차원 희소 데이터**

매우 고차원 (수백만 feature)이고 극도로 희소하면:
- 메모리는 CSC로 효율적
- 하지만 feature 수가 많아 학습 느려질 수 있음
- `colsample_bytree`로 feature sampling 권장

**3. 결측 메커니즘 변화**

학습 데이터와 테스트 데이터의 결측 메커니즘이 다르면:
- 예: 학습에서는 MAR, 테스트에서는 MNAR
- 성능 저하 가능
- 도메인 지식으로 보정 필요

## 정리

XGBoost의 결측치 처리는 다음과 같이 요약됩니다:

1. **Default direction**: 각 분할마다 결측치가 갈 방향을 학습
2. **자동 최적화**: Gain이 큰 쪽으로 자동 결정
3. **Sparse-aware**: 희소 데이터에 매우 효율적
4. **전처리 불필요**: NaN을 그대로 사용 가능
5. **패턴 학습**: 결측치 자체의 정보를 활용

이는 XGBoost가 실무에서 강력한 이유 중 하나입니다. 데이터 전처리에 드는 시간과 노력을 줄이면서도, 단순 대체보다 더 나은 성능을 자동으로 달성합니다.

