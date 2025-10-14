---
title: "Bayesian Optimization이란?"
date: "2025-10-10"
excerpt: "하이퍼파라미터 튜닝을 할 때 사용하는 BO에 대해서 정리해보기"
category: "Engineering"
tags: ["Tuning", "Bayesian Optimization"]
---

# 개념 스케치

모델 실험 비용 (특정 하이퍼파리미터로 학습하고 테스트) 이 클 때 Grid Search와 같은 방법들을 꽤나 부담된다.
실험 한번에 1분이 걸린다고 가정하고, 찾는 하이퍼파라미터 개수가 3개, 파라미터별로 10구간을 찾는다면 1000분이 걸린다.
따라서 조금 더 합리적으로 최적의 하이퍼파라미터를 찾기 위한 방법이 제시되었다.

실험을 다음처럼 정의할 수 있다.
- x : 하이퍼파라미터
- f(x): 하이퍼파라미터가 주어졌을 때 validation score
- 실험셋 (D) : [(x1, f(x1)), (x2, f(x2)), (x3, f(x3)), ... , (xn, f(xn))]
- 실험셋을 통해 f(x)가 최적이 되는 x'을 찾는 것

함수 자체를 알 수 없으니, 이를 확률적으로 모델링해야 한다. 
이때 사용되는 개념이 Gaussian Process. 
이는 함수의 모든 점들이 정규분포를 따른다는 가정 (function prior)
실험을 해가면서 수집되는 데이터(D) 로 이 분포를 업데이트 함 (posterior)

업데이트 된 분포 (posterior)을 사용해 acquistion function을 정의하고, 이를 통해 다음에 탐색할 x 후보군을 생성.
이 후보군으로 실험을 진행하고, 분포 업데이트하고, 다시 탐색하는 과정을 반복.

# 이론적인 내용 정리하기 (AI와 함께 작성했습니다.)

**Bayesian Optimization**은 머신러닝에서 하이퍼파라미터를 **효율적으로** 찾기 위한 방법입니다. 특히 **실험(모델 학습 한 번)** 이 비싸고 느릴 때 매우 강력합니다.

이론을 한 문장으로 요약하면:

> "모델을 직접 다 돌려보지 않고, **'좋을 것 같은 지점'을 확률적으로 추정하면서 똑똑하게 탐색하는 방법**"

## 왜 필요한가?

하이퍼파라미터 튜닝을 한다고 생각해봅시다. 예를 들어 LightGBM의 다음 파라미터를 튜닝해야 한다면 `learning_rate`, `num_leaves`, `max_depth`, `lambda_l1`와 같은 여러 파라미터가 있습니다.

이제 생각해봅시다. Grid Search는 모든 조합을 다 시도하니 너무 느리고, Random Search는 랜덤하게 시도하니 빠르지만 비효율적입니다. 그럼, "**이전 실험 결과를 바탕으로 다음 시도를 똑똑하게 고를 수 없을까?**" 바로 이게 **Bayesian Optimization**의 아이디어입니다.

## 수학적 직관: "우리가 모르는 함수 f"

모델의 성능(예: validation accuracy)을 **하이퍼파라미터 x의 함수**라고 생각합니다.

$$
f(x) = \text{validation score given hyperparameter } x
$$

우리는 이 함수를 **직접 알지 못하지만**, "몇 번 실험해본 결과"는 알고 있습니다. 즉, 우리가 가진 건 일부 점에서의 값 $(x_1, f(x_1)), (x_2, f(x_2)), \ldots$이고, 목표는 **$f(x)$**를 최대화하는 $x^*$를 찾는 것입니다.

## 핵심 개념: "함수의 분포를 가정한다"

우리는 $f(x)$의 형태를 모르니까, "**함수 자체를 확률적으로 모델링**"합니다. 그중 가장 일반적인 선택이 **Gaussian Process (GP)** 입니다.

GP는 "함수의 모든 점들이 정규분포를 따른다"고 가정하는 **function prior** 입니다. 이제 데이터를 관찰할 때마다, "이 함수가 어떤 모양일 가능성이 높은지"를 **posterior**로 업데이트합니다.

## GP가 만들어내는 것: "평균 + 불확실성"

Gaussian Process를 이용하면, 각 지점 $x$에 대해 두 가지 정보를 얻을 수 있습니다:

| 정보 | 의미 |
|------|------|
| **평균 예측값** $\mu(x)$ | 현재까지의 데이터로 보았을 때 성능이 좋을 것으로 예상되는 값 |
| **불확실성** $\sigma(x)$ | 그 근처를 아직 많이 탐색하지 않아서 얼마나 확실하지 않은지 |

즉, 어떤 구간은 예측이 **좋지만 확실하고($\sigma$ 작음)**, 다른 구간은 **예측이 불확실($\sigma$ 큼)** 할 수 있습니다.

## 다음 "어디를 시도할지" 결정하는 함수 (Acquisition Function)

이제 GP가 만들어준 "예측 평균 + 불확실성"을 기반으로 다음 시도할 점을 정해야 합니다. 이를 결정하는 것이 **Acquisition Function**입니다.

대표적인 것들:

| 이름 | 개념 | 수식 직관 |
|------|------|-----------|
| **Expected Improvement (EI)** | 현재 최고점보다 얼마나 좋아질 기대값이 큰가 | $E[\max(0, f(x)-f_{best})]$ |
| **Upper Confidence Bound (UCB)** | 탐색 vs 활용의 균형을 조절 | $\mu(x) + \kappa\sigma(x)$ |
| **Probability of Improvement (PI)** | 개선될 확률이 얼마나 되는가 | $P(f(x)>f_{best})$ |

예를 들어 EI는 "현재 최고 성능보다 개선될 기대값이 높은 지점"을 선택합니다.

## 전체 알고리즘 흐름

Bayesian Optimization은 이렇게 돌아갑니다:

1. **초기 샘플 몇 개**를 랜덤하게 시도 → $D_0 = \{x_i, f(x_i)\}$
2. **Gaussian Process**로 $f(x)$의 posterior 추정
3. **Acquisition Function**을 최대로 하는 $x_{next}$ 선택
4. 그 $x_{next}$로 **실험을 수행**하고 결과 $f(x_{next})$를 관찰
5. $D \leftarrow D \cup \{x_{next}, f(x_{next})\}$
6. 수렴할 때까지 2~5 반복

즉, GP는 "우리가 모르는 함수의 믿음"을 업데이트하고, Acquisition Function은 "다음 실험할 곳"을 선택하는 역할을 합니다.

## 이론적 핵심 요약

| 구성 요소 | 의미 | 수학적 대응 |
|----------|------|-------------|
| 목적함수 $f(x)$ | 하이퍼파라미터 → 성능 | black-box function |
| 확률모형 $P(f)$ | 함수 위의 분포 | Gaussian Process |
| Posterior $P(f \mid D)$ | 데이터를 관찰한 후 믿음 | GP 업데이트 |
| Acquisition Function $\alpha(x; P(f \mid D))$ | 다음 탐색할 점 | Expected Improvement 등 |
| 탐색 정책 | exploitation vs exploration | $\mu(x)$ vs $\sigma(x)$ trade-off |

## ML 관점의 해석

Bayesian Optimization은 **"샘플 효율적인 hyperparameter tuning"** 방법입니다. 즉, 모델 한 번 학습하는 게 너무 비싸면 (예: 딥러닝, AutoML), "이전 실험 결과를 통해 다음 실험을 똑똑하게 선택"합니다.

실제 구현 예:
- `scikit-optimize (skopt)`
- `optuna` → 내부적으로 TPE(Tree-structured Parzen Estimator) 사용
- `hyperopt`
- `bayes_opt`

## 비유로 쉽게 말하면

"Bayesian Optimization은 과학자가 실험하는 과정과 같다."

처음엔 감으로 몇 번 실험해보고, 실험 결과를 통해 **'좋은 구간'에 대한 믿음이 생깁니다**. 아직 확실하지 않은 구간은 조금씩 탐색하면서, 확실히 좋은 구간은 더 깊게 파고듭니다. 계속 반복하면서 "가장 좋은 조합"을 찾습니다.

## 한 줄 정리

> **Bayesian Optimization = "모델의 성능 함수를 확률적으로 추정하면서, 탐색과 활용을 균형 있게 조절해 최적 하이퍼파라미터를 찾는 방법"**

---

# 주요 키워드 상세 설명

## Gaussian Process란?

**Gaussian Process (GP)**는 함수 위의 확률 분포를 나타내는 강력한 도구입니다. 일반적인 확률 분포가 값(숫자)에 대한 분포라면, GP는 **함수 자체에 대한 분포**입니다.

### GP의 정의

Gaussian Process는 다음과 같이 정의됩니다:

$$
f(x) \sim \mathcal{GP}(m(x), k(x, x'))
$$

여기서:
- $m(x)$는 **mean function**으로, 각 입력 $x$에 대한 함수값의 기댓값입니다 (보통 0으로 설정)
- $k(x, x')$는 **kernel function** (또는 covariance function)으로, 두 입력 $x$와 $x'$ 사이의 유사도를 측정합니다

### GP의 핵심 특성

GP의 핵심은 **"임의의 유한한 점들의 집합에 대한 함수값들이 다변량 정규분포를 따른다"**는 것입니다. 즉, 점 $x_1, x_2, \ldots, x_n$에서의 함수값 $f(x_1), f(x_2), \ldots, f(x_n)$은 다음과 같은 다변량 정규분포를 따릅니다:

$$
\begin{bmatrix} f(x_1) \\ f(x_2) \\ \vdots \\ f(x_n) \end{bmatrix} \sim \mathcal{N}\left(\begin{bmatrix} m(x_1) \\ m(x_2) \\ \vdots \\ m(x_n) \end{bmatrix}, \begin{bmatrix} k(x_1,x_1) & k(x_1,x_2) & \cdots \\ k(x_2,x_1) & k(x_2,x_2) & \cdots \\ \vdots & \vdots & \ddots \end{bmatrix}\right)
$$

### Kernel Function의 역할

Kernel function $k(x, x')$은 두 점 사이의 **유사도**를 정의합니다. 가까운 점들은 비슷한 함수값을 가질 가능성이 높고, 먼 점들은 독립적일 가능성이 높습니다.

대표적인 kernel:
- **RBF (Radial Basis Function) kernel** 또는 **Squared Exponential kernel**:

$$
k(x, x') = \sigma^2 \exp\left(-\frac{\|x - x'\|^2}{2l^2}\right)
$$

여기서 $\sigma^2$는 신호의 분산, $l$은 length scale (두 점이 얼마나 멀리 떨어져 있어야 독립적인지)

- **Matérn kernel**: RBF보다 덜 매끄러운 함수를 모델링할 때 사용

### GP의 Posterior Update

관찰한 데이터 $D = \{(x_1, y_1), (x_2, y_2), \ldots, (x_n, y_n)\}$가 있을 때, 새로운 점 $x^*$에서의 함수값 $f(x^*)$의 posterior 분포는 여전히 정규분포를 따릅니다:

$$
f(x^*) \mid D \sim \mathcal{N}(\mu(x^*), \sigma^2(x^*))
$$

여기서:

$$
\mu(x^*) = k(x^*, X)(K + \sigma_n^2I)^{-1}y
$$

$$
\sigma^2(x^*) = k(x^*, x^*) - k(x^*, X)(K + \sigma_n^2I)^{-1}k(X, x^*)
$$

- $X = [x_1, x_2, \ldots, x_n]^T$: 관찰한 입력들
- $y = [y_1, y_2, \ldots, y_n]^T$: 관찰한 출력값들
- $K$: kernel matrix with $K_{ij} = k(x_i, x_j)$
- $\sigma_n^2$: 관찰 노이즈의 분산

이 수식들이 의미하는 것은: **관찰한 데이터를 바탕으로 새로운 점에서의 예측 평균과 불확실성을 계산**할 수 있다는 것입니다.

## Acquisition Function이란?

**Acquisition Function**은 Bayesian Optimization에서 "다음에 어디를 탐색할지"를 결정하는 핵심 전략입니다. GP가 제공하는 예측 평균 $\mu(x)$와 불확실성 $\sigma(x)$를 활용하여, **exploitation (활용)** 과 **exploration (탐색)** 사이의 균형을 조절합니다.

### Expected Improvement (EI)

가장 널리 사용되는 acquisition function입니다. "현재까지의 최고 성능 $f_{best}$보다 얼마나 개선될 것으로 기대되는가"를 측정합니다.

$$
\text{EI}(x) = \mathbb{E}[\max(0, f(x) - f_{best})]
$$

GP의 예측이 정규분포 $f(x) \sim \mathcal{N}(\mu(x), \sigma^2(x))$를 따른다면, EI는 closed-form으로 계산 가능합니다:

$$
\text{EI}(x) = \begin{cases}
(\mu(x) - f_{best})\Phi(Z) + \sigma(x)\phi(Z) & \text{if } \sigma(x) > 0 \\
0 & \text{if } \sigma(x) = 0
\end{cases}
$$

여기서:

$$
Z = \frac{\mu(x) - f_{best}}{\sigma(x)}
$$

- $\Phi$: 표준 정규분포의 CDF
- $\phi$: 표준 정규분포의 PDF

**EI의 직관**: EI는 예측 평균이 높을수록, 불확실성이 클수록 높은 값을 가집니다. 즉, "좋을 것 같으면서도 아직 잘 모르는 영역"을 선호합니다.

### Upper Confidence Bound (UCB)

UCB는 exploration-exploitation trade-off를 명시적인 파라미터로 조절합니다:

$$
\text{UCB}(x) = \mu(x) + \kappa \sigma(x)
$$

- $\kappa$: exploration parameter
  - $\kappa$가 크면 → exploration 강화 (불확실한 영역 선호)
  - $\kappa$가 작으면 → exploitation 강화 (확실히 좋은 영역 선호)

**UCB의 직관**: "예측 평균 + (불확실성 × 계수)"를 최대화합니다. 마치 "낙관적으로 추정한 상한"을 최대화하는 것과 같습니다.

이론적으로 $\kappa$를 시간에 따라 증가시키면 ($\kappa_t = \sqrt{2\log(t)}$), UCB는 regret bounds를 보장합니다.

### Probability of Improvement (PI)

"현재 최고 성능보다 개선될 확률"을 측정합니다:

$$
\text{PI}(x) = P(f(x) > f_{best}) = \Phi\left(\frac{\mu(x) - f_{best}}{\sigma(x)}\right)
$$

**PI의 특징**: EI보다 간단하지만, 개선의 "크기"를 고려하지 않고 "개선 여부"만 고려합니다. 따라서 EI보다 덜 greedy한 경향이 있습니다.

### Acquisition Function 선택 전략

- **EI**: 가장 균형잡힌 선택, 대부분의 경우 잘 작동
- **UCB**: $\kappa$를 통해 exploration-exploitation 조절 가능
- **PI**: 보수적인 탐색을 원할 때

실무에서는 보통 EI를 기본으로 사용하고, 필요에 따라 UCB의 $\kappa$를 조절하여 사용합니다.

## Exploitation vs Exploration

Bayesian Optimization의 핵심 딜레마는 **exploitation**과 **exploration** 사이의 균형입니다.

### Exploitation (활용)

"현재까지 알고 있는 정보를 바탕으로 가장 좋은 지점을 선택"하는 전략입니다. GP의 예측 평균 $\mu(x)$가 높은 지점을 선택합니다.

**장점**: 빠르게 좋은 성능에 도달
**단점**: local optimum에 갇힐 수 있음 (전역 최적해를 놓칠 수 있음)

### Exploration (탐색)

"아직 잘 모르는 영역을 탐색"하는 전략입니다. GP의 불확실성 $\sigma(x)$가 큰 지점을 선택합니다.

**장점**: 전역 최적해를 발견할 가능성 증가
**단점**: 실제로는 좋지 않은 영역을 탐색하는데 시간 소비

### Trade-off

좋은 최적화 전략은 이 둘을 **동적으로 균형**있게 조절해야 합니다:
- 초반에는 **exploration**을 많이 → 전체 탐색 공간을 이해
- 후반에는 **exploitation**을 많이 → 좋은 영역을 집중 탐색

Acquisition function들은 이 trade-off를 자동으로 조절합니다:
- EI: $(\mu(x) - f_{best})$ 항이 exploitation, $\sigma(x)$ 항이 exploration
- UCB: $\mu(x)$가 exploitation, $\kappa\sigma(x)$가 exploration

## Prior와 Posterior

### Prior (사전 분포)

실험을 하기 **전**에 함수 $f(x)$에 대해 가지고 있는 믿음입니다. Gaussian Process에서는 mean function $m(x)$와 kernel function $k(x, x')$로 prior를 정의합니다.

$$
f(x) \sim \mathcal{GP}(m(x), k(x, x'))
$$

**Prior의 역할**: "함수가 어떤 성질을 가질 것이다"라는 사전 지식을 반영합니다:
- RBF kernel → 매끄러운 함수를 가정
- 높은 length scale → 멀리 떨어진 점들도 비슷한 값을 가짐
- 낮은 length scale → 급격하게 변하는 함수 가능

### Posterior (사후 분포)

실험 데이터 $D$를 관찰한 **후**에 업데이트된 함수에 대한 믿음입니다.

$$
f(x) \mid D \sim \mathcal{GP}(m_{\text{post}}(x), k_{\text{post}}(x, x'))
$$

**Bayes' Rule**을 통해 prior를 posterior로 업데이트:

$$
P(f \mid D) = \frac{P(D \mid f) \cdot P(f)}{P(D)}
$$

- $P(f)$: prior
- $P(D \mid f)$: likelihood (관찰한 데이터가 나올 확률)
- $P(f \mid D)$: posterior

### Prior에서 Posterior로의 변화

데이터를 관찰하면:
1. **관찰한 점 근처**: 불확실성 $\sigma(x)$가 감소 (더 확실해짐)
2. **관찰하지 않은 점**: kernel을 통해 간접적으로 영향을 받음
3. **전체적인 함수 형태**: 데이터에 맞춰 조정됨

이 과정이 반복되면서 "함수에 대한 믿음"이 점점 정확해지고, Bayesian Optimization은 최적점을 찾아갑니다.

## TPE (Tree-structured Parzen Estimator)

**TPE**는 Gaussian Process 대신 다른 방식으로 함수를 모델링하는 Bayesian Optimization의 변형입니다. `Optuna`와 `HyperOpt` 라이브러리에서 기본적으로 사용됩니다.

### GP와의 차이

**Gaussian Process**:
- $P(f(x) \mid x)$를 모델링 (입력 $x$가 주어졌을 때 함수값 $f(x)$의 분포)
- 함수 전체를 하나의 확률 분포로 모델링

**TPE**:
- $P(x \mid f(x))$를 모델링 (함수값이 좋을 때/나쁠 때 입력의 분포)
- Bayes' Rule을 사용하여 acquisition function 계산

### TPE의 아이디어

관찰한 데이터를 성능에 따라 두 그룹으로 나눕니다:
- $\mathcal{L}$: 성능이 좋은 상위 $\gamma \times 100$% (예: 상위 15%)
- $\mathcal{G}$: 나머지 하위 데이터

그리고 두 개의 확률 분포를 학습합니다:

$$
P(x \mid y < y^*) = l(x)
$$

$$
P(x \mid y \geq y^*) = g(x)
$$

- $l(x)$: "좋은" 하이퍼파라미터들의 분포
- $g(x)$: "나쁜" 하이퍼파라미터들의 분포

### TPE의 Acquisition Function

Expected Improvement의 비율로 acquisition function을 정의:

$$
\text{EI}(x) \propto \frac{l(x)}{g(x)}
$$

**직관**: "좋은 샘플들 사이에서는 흔하지만 ($l(x)$ 높음), 나쁜 샘플들 사이에서는 드문 ($g(x)$ 낮음)" 영역을 선택합니다.

### Parzen Estimator (Tree-structured)

$l(x)$와 $g(x)$를 추정할 때 **Parzen Window** (kernel density estimation)를 사용합니다. "Tree-structured"라는 이름은 하이퍼파라미터 공간이 조건부 구조를 가질 때 (예: "activation='relu'일 때만 alpha 파라미터가 의미있음"), 이를 트리 구조로 표현하기 때문입니다.

### TPE의 장단점

**장점**:
- GP보다 고차원에서 효율적
- 조건부 하이퍼파라미터 공간 처리 용이
- categorical/discrete 파라미터 처리 자연스러움

**단점**:
- GP만큼 이론적으로 잘 정립되지 않음
- 불확실성 추정이 GP만큼 정교하지 않음

실무에서는 **고차원 문제**나 **mixed parameter types** (continuous + categorical)가 있을 때 TPE가 GP보다 선호됩니다.

