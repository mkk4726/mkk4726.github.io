---
title: "Non-crossing nonlinear regression quantiles by monotone composite quantile regression neural network, with application to rainfall extremes"
date: "2025-10-21"
excerpt: "한줄 요약 : "
category: "Machine Learning"
tags: ["Quantile Regression", "paper review"]
---

- [paper link](https://link.springer.com/article/10.1007/s00477-018-1573-6)

논문 빠르게 파악하는 연습도 같이


# 개념 요약, 스케치


---

# 1단계. 구조부터 잡는 ‘스켈레톤 리딩’ (5~10분)
> 📍목표: 이 논문이 나랑 관련 있는지 판단

---

## Abstract
- 문제 정의 + 핵심 기여 + 비교 대상이 나오는 부분.
- 여기서 “이 논문이 해결하려는 Pain Point”를 한 문장으로 요약해.

논문에서는 quantile crossing problem을 해결하기 위한 새로운 모델을 제시하고 있다.

> These estimates are prone to “quantile crossing”, where regression predictions for different quantile probabilities do not increase as probability increases.

> As a remedy, this study introduces a novel nonlinear quantile regression model, the monotone composite quantile regression neural network (MCQRNN)
1. simultaneously estimates multiple non-crossing, nonlinear conditional quantile functions
2. allows for optional monotonicity, positivity/non-negativity, and generalized additive model constraints
3. can be adapted to estimate standard least-squares regression and non-crossing expectile regression functions

MCQRNN을 제시. 이에 대한 설명.

>  In comparison to standard QRNN models, the ability of the MCQRNN model to incorporate these constraints, in addition to non-crossing, leads to more robust and realistic estimates of extreme rainfall.

QRNN 모델 대비 실제 문제를 풀기 위한 다양한 조건들도 포함시켜서 학습시킬 수 있다.

---

## Figure
- 모델 구조나 전체 파이프라인을 보여주는 도식이 대부분 핵심 요약임.
- “입력–처리–출력–평가” 흐름을 머릿속에 그려둬.

<figure>
  <img src="/post/PaperReview/MCQRNN/figure1.png" alt="MCQRNN" />
  <figcaption>Fig. 1</figcaption>
</figure>
- 그림 설명 정리:
  - (a), (c): 일반 QRNN(Quantile Regression Neural Network) 결과  
  - (b), (d): MCQRNN(Monotone Composite QRNN) 결과  
  - 각 그래프의 검은 점은 synthetic data (Eq. 15: a, b / Eq. 16: c, d)를 의미  
  - 무지개색 곡선들은 아래에서 위로 각각 분위수 s = 0.1, 0.2, ..., 0.9 (총 9개)를 나타냄  
  - 회색 실선: 실제(ground truth) 조건부 분위수 함수  
- 주요 포인트:  
  - MCQRNN은 quantile crossing 없이, 더 부드럽고 현실적인 분위수 곡선을 산출함

MCQRNN이 조금 더 안정적이다. 

<figure>
  <img src="/post/PaperReview/MCQRNN/figure2.png" alt="MCQRNN" />
  <figcaption>Fig. 2</figcaption>
</figure>

- Fig. 1b, d와 유사한 실험 결과이지만,  
  - (a) : MCQRNN에 positivity constraint(출력 양수 제약)를 추가함  
  - (b) : positivity + monotonicity constraint(출력 양수 및 단조성 제약) 모두 추가  
- (c), (d) : Fig. 1b, d에서 0.1, 0.5, 0.9-quantile에 대해 parametric bootstrap(500회)로 추정한 95% 신뢰구간(Confidence Interval) 결과 표시  

---

## Conclusion
- 어떤 점을 ‘새롭게 했다’ + ‘향후 과제’로 정리해두는 부분.
- Abstract과 결론을 비교하면 “진짜 얻은 건 뭔가”를 파악 가능.

> MCQRNN is the first neural network-based quantile regression model that guarantees non-crossing of regression quantiles.

> Given its close relationship to composite QR models, MCQRNN is first evaluated using the Monte Carlo simulation experiments adopted by Xu et al. (2017) to demonstrate the CQRNN model

기존 모델보다 robust 하다.

- MCQRNN은 기존 MLP, QRNN, CQRNN 모델 대비 특히 오차 분포가 비정규(non-normal)일 때 더욱 견고하다.
- 캐나다 강우량(IDF 곡선) 데이터에 적용하여 실제 성능을 평가함.
- 다양한 폭풍 지속 시간과 재현기간에 대해 정보를 효과적으로 공유하여 과적합에 강하다(cross-validation result).
- 단조 제약(monotonicity constraint) 적용이 가능하여, 강우 강도가 발생 빈도 및 지속 시간이 작아질수록 자연스럽게 증가하는 실제 특성을 반영할 수 있다.
- 계측소가 없는 지역에서도 극한 강우의 현실적이고 신뢰성 있는 추정이 가능하다.

---

## 1문장 요약 시도
- 예: “이 논문은 기존 GBDT 기반 CTR 예측의 calibration 문제를 NN 기반으로 해결함.”
- 이 한 문장이 안 나오면 → 아직 요약할 수준으로 이해가 안 된 것.

QRNN에 다양한 제약조건을 추가해 모델을 학습시킬 수 있고, 이를 통해 원하는 결과를 얻을 수 있다.


---

# 2단계. ‘구조적 리딩’ — 핵심만 깊게 (20~40분)
> 📍목표: 핵심 아이디어·모델·실험 구조를 빠르게 재구성하기

---

## Introduction
- “왜 이 문제인가?” — 문제의 중요성
- “기존 방법의 한계” — baseline 정리
- “우리의 기여” — bullet point로 세 줄 정리

to provide estimates of predictive uncertinity in forcast 위해 quantile regression을 진행해왔음.

> However, given finite samples, this flexibility can lead to ‘‘quantile crossing’’ where, for some values of the covariates, quantile regression predictions do not increase with the specified quantile probability tau.

>  As Ouali et al. (2016) state, ‘‘crossing quantile regression is a serious modeling problem that may lead to an invalid response distribution’’.
  
고전적으로 발생하는 문제가 , "quantile crossing problem".

> Three main approaches have been used to solve the quantile crossing problem: post-processing, stepwise estimation, and simultaneous estimation. 

이를 해결하기 위해 3가지 방법을 시도해왔음.

1. post-processing : 강제로 순서 정렬 시키는 것
2. stepwise estimation : 이전에 추정된 분포선을 넘지 않도록 제약 조건을 걸어가며 순차적으로 회귀선을 학습함. (이전 분포선을 기반으로 단계를 나눠 교차를 방지하며 학습)
3. simultaneous estimation : 여러 분위수 회귀식을 동시에 추정하면서, 파라미터 최적화에 추가 제약조건을 넣어 분위수 간 교차를 방지함 (Takeuchi et al. 2006; Bondell et al. 2010; Liu and Wu 2011; Bang et al. 2016).  
한줄 요약: 모든 분위수 회귀를 한 번에 학습 + 교차 방지 제약 추가

> Unlike sequential estimation, simultaneous estimation is attractive because it does not depend on the order in which quantiles are estimated. Furthermore, fitting for multiple values of tau simultaneously allows one to ‘‘borrow strength’’ across regression quantiles and improve overall model performance (Bang et al. 2016).

여러 분위수를 한번에 학습하는 건 제약조건을 추가할 수 있는 것 외에도 성능 향상에 도움을 줌.

> For a flexible nonlinear model like a neural network, imposing extra constraints, for example as informed by process knowledge, can be useful for narrowing the overall search space of potential nonlinearities.

특히 non-linear 할 때 가장 도움을 줌. 굉장히 많은 공간을 탐색하는 non-linear + constraint는 좋은 성능을 낼 것이라 기대 됨.

- Muggeo et al. (2013): 성장 곡선이 나이에 따라 단조 증가해야 한다는 점을 들어, non-crossing 제약에 더해 monotonicity(단조성) 제약 조건을 추가함.
- Roth et al. (2015): 비선형 단조 분위수 회귀를 활용해 강우 극값(rainfall extremes)에서 감소 또는 증가하는 추세(단조 추세)를 효과적으로 설명함.
- Takeuchi et al. (2006): 커널 기반 비모수(nonparametric) 방식의 분위수 회귀를 제안했고, 이 모델은 SVM과 유사한 구조에 non-crossing, monotonicity(단조성) 제약을 모두 적용함. 추가적으로 양수성(positivity), 가산성(additivity) 등 다양한 제약조건 적용 방법도 제시함.

> However, standard implementations of the kernel quantile regression model (e.g., Karatzoglou et al. 2004; Hofmeister 2017) are computationally costly, with complexity that is cubic in the number of samples, and do not explicitly implement the proposed constraints.

이 논문에서 말하는 핵심. 기존 모델들은 비싸다는 한계점을 가지고 있다. 

> As an alternative, this study introduces an efficient, flexible nonlinear quantile regression model, the monotone composite quantile regression neural network (MCQRNN), that:
1. simultaneously estimates multiple non-crossing quantile functions
2. allows for optional monotonicity, positivity/nonnegativity, and additivity constraints, as well as fine-grained control on the degree of non-additivity
3. can be modified to estimate standard least-squares regression and non-crossing expectile regression functions

이러한 기능들은 아래와 같은 기존 neural network/회귀 모델 요소들을 결합해서 하나의 통합 프레임워크로 구현함:

| 참고 모델                   | 핵심 아이디어                         |
|-----------------------------|--------------------------------------|
| **QRNN** (White 1992; Taylor 2000; Cannon 2011)      | 표준 quantile regression NN 구조         |
| **Monotone MLP** (Zhang & Zhang 1999; Lang 2005; Minin et al. 2010) | 단조성 제약 추가                       |
| **Composite QRNN (CQRNN)** (Xu et al. 2017)         | 여러 분위수 동시 추정                    |
| **Expectile Regression NN** (Jiang et al. 2017)     | expectile 회귀 확장                     |
| **Generalized Additive NN** (Potts 1999)            | 가산성 등 추가 제약 적용                |

MCQRNN은 본 논문 기준 최초로, 신경망 기반에서 **비교차(non-crossing)** 분위수 회귀를 보장하는 모델임.

MCQRNN 모델 개발 흐름과 논문의 구성은 아래와 같다.

- **Sect. 2**: MMLP → MQRNN → 최종 MCQRNN 순서로 모델 구조를 확장함.  
  - 단조성(monotonicity), 양수성/비음수성(positivity/non-negativity), 가산성(generalized additive) 제약을 손쉽게 추가할 수 있도록 설계됨.
  - 조건부 tau-분위수(quantile) 불확실성 추정 방법도 제시.

- **Sect. 3**: Monte Carlo 시뮬레이션을 통해 MCQRNN과 기존 MLP, QRNN, CQRNN 모델의 성능을 검증.
  - 비교 실험에는 Xu et al. (2017)의 3가지 함수와 오차 분포 조합을 사용.

- **Sect. 4**: 실제 캐나다 기후 데이터(연간 최대 강수량)로 MCQRNN 적용 사례 제시.
  - 관측소 미설치 지역의 IDF 곡선(Intensity-Duration-Frequency curve) 예측 문제에 활용.
  - IDF 곡선은 극한 강수(Intensity)의 빈도(Occurrence frequency) 및 지속시간(Duration)과의 관계를 요약하며, 극한 강수량은 비음수이고, 발생확률이 낮거나(즉, 재현주기가 길거나) 지속시간이 짧을수록 강도가 높아지는 ‘단조 증가’ 성질을 나타냄.
  - 따라서 단조성, 비음수성 제약이 특히 중요.
  - MCQRNN 기반 IDF 곡선은 각 리턴피리어드/지속시간별 QRNN을 별도로 적합시키는 기존 방식(Ouali & Cannon, 2018)과 비교 분석.

- **Sect. 5**: 결론 및 향후 연구 방향 제시.


---

## Method
- 도식(fig)을 따라가면서 수식은 건너뛰되,
  - 각 block이 하는 역할을 단어 단위로 요약: (예: Encoder → user/item embedding, Decoder → CTR prediction).
  - “기존 대비 바뀐 점”을 마킹해. (attention 추가, loss 변경 등)

### Modeling framework

#### Monotone multi-layer perceptron (MMLP)

MMLP는 일부 입력 변수에 대해 단조성(monotonicity)을 보장하는 neural network다. 입력 변수를 두 그룹으로 나눈다:
- $M$: 단조성을 원하는 변수들 (monotone variables)
- $I$: 단조성 제약이 없는 변수들 (ignore variables)

**Hidden layer:**

$$
h_j(t) = f\left( \sum_{m \in M} x_m(t) \exp(W_{mj}^{(h)}) + \sum_{i \in I} x_i(t) W_{ij}^{(h)} + b_j^{(h)} \right )
$$

여기서:
- $h_j(t)$: $j$번째 hidden unit의 출력
- $f$: 비선형 activation function (예: sigmoid, tanh)
- $\exp(W_{mj}^{(h)})$: 단조 변수에 대한 가중치는 exponential을 취해 항상 양수를 보장
- $W_{ij}^{(h)}$: 일반 변수에 대한 가중치 (제약 없음)
- $b_j^{(h)}$: bias term

**Output layer:**

$$
g(t) = \sum_{j=1}^{J} h_j(t) \exp(W_j^{(o)}) + b^{(o)}
$$

여기서:
- $g(t)$: 최종 출력
- $\exp(W_j^{(o)})$: hidden layer에서 output으로 가는 가중치도 exponential을 취해 양수 보장
- $b^{(o)}$: output bias
- $J$: hidden unit의 개수

핵심은 단조성을 원하는 경로의 모든 가중치에 $\exp(\cdot)$를 적용하여 양수로 만드는 것이다. 이렇게 하면 단조 변수 $x_m$이 증가할 때 출력 $g(t)$도 반드시 증가하게 된다 (activation function $f$가 비감소 함수일 때).

#### Monotone quantile regression neural network (MQRNN)

MQRNN은 MMLP의 구조를 그대로 사용하되, loss function을 quantile regression용 pinball loss로 변경한 모델이다.

**Pinball loss (Check loss):**

$$
\rho_\tau(u) = u(\tau - \mathbb{I}_{u < 0})
$$

여기서:
- $u = y - g(t)$: 예측 오차 (실제값 - 예측값)
- $\tau \in (0, 1)$: 목표 분위수 (예: 0.5는 중앙값)
- $\mathbb{I}_{u < 0}$: indicator function (u < 0이면 1, 아니면 0)

Pinball loss는 비대칭적(asymmetric)인 손실 함수로:
- $u \geq 0$ (과소추정)일 때: $\tau \cdot u$
- $u < 0$ (과대추정)일 때: $(\tau - 1) \cdot u = -(1-\tau) \cdot u$

예를 들어 $\tau = 0.9$인 경우:
- 과소추정 시 페널티: $0.9 \times u$ (큰 페널티)
- 과대추정 시 페널티: $0.1 \times |u|$ (작은 페널티)

이렇게 하면 모델이 $\tau$-분위수를 학습하게 된다.

**Training objective:**

$$
\min_{W, b} \sum_{t=1}^{T} \rho_\tau(y(t) - g(t))
$$

MQRNN은 MMLP의 단조성 제약을 유지하면서 특정 분위수를 추정할 수 있다. 하지만 여러 분위수를 동시에 추정하지는 못하며, 각 $\tau$마다 별도로 학습해야 한다. 이 경우 quantile crossing이 발생할 수 있다.

**Huber-norm approximation:**

Pinball loss의 문제점은 원점($u = 0$)에서 미분 불가능(non-differentiable)하다는 것이다. Gradient-based optimization을 위해서는 smooth approximation이 필요하다.

Chen (2007)과 Cannon (2011)을 따라, Huber-norm 버전으로 pinball loss를 근사한다:

$$
\rho_\tau^{(A)}(e) = 
\begin{cases}
\tau \cdot u(e) & \text{if } e \geq 0 \\
(\tau - 1) \cdot u(e) & \text{if } e < 0
\end{cases}
$$

여기서 Huber function은:

$$
u(e) = 
\begin{cases}
\frac{e^2}{2\alpha} & \text{if } 0 \leq |e| \leq \alpha \\
|e| - \frac{\alpha}{2} & \text{if } |e| > \alpha
\end{cases}
$$

Huber function의 특징:
- $|e| \leq \alpha$ 구간: squared error ($e^2/2\alpha$) 사용 → 원점에서 미분 가능
- $|e| > \alpha$ 구간: absolute error ($|e| - \alpha/2$) 사용 → quantile regression의 특성 유지
- $\alpha \to 0$일 때: 정확한 pinball loss로 수렴
- $\alpha$는 hyperparameter로, smoothness와 정확도 사이의 trade-off를 조절

이 approximation을 사용하면 gradient descent로 안정적으로 학습할 수 있다.








---


## Experiment
- 어떤 데이터셋, 비교 모델, 지표, 향상 정도인가
- 표 1개, 그림 1개만 선택해서 숫자 메모
- 나중에 “이 논문은 기존 대비 ~% 향상” 이런 식으로 바로 인용 가능하게

---

## 한 줄 요약 갱신
- (문제) — (핵심 아이디어) — (결과) 구조로 다시 요약
- 예: “Imbalanced CTR 데이터에서 feature interaction의 과적합을 완화하기 위해 regularized cross-network를 제안했고, AUC +0.7% 향상.

---


# 3단계. ‘논리적 리딩’ — 정말 쓸 논문만 (1~2시간)
> 📍목표: 이론적 근거와 재현 가능성을 완전히 이해

---

## 수식/가정 정리
- 이 Loss가 실제로 convex인지, regularizer의 의미, gradient 계산 구조 등 ‘이론적 정당성’ 확인.

---

## Discussion / Ablation / Limitation
- 연구자들이 인정한 한계와 future work는 네가 후속 프로젝트 아이디어로 써먹을 포인트.

---

## Reference Jump
- 인용된 핵심 2~3개 논문을 바로 체크해 “계보” 파악.
- 이게 ‘리서치 트리(tree)’를 형성함.