---
title: "[Paper Review] Quasi-Oracle Estimation of Heterogeneous Treatment Effects"
date: "2025-07-17"
excerpt: "R-leaner 방법 소개와 이게 가지는 quasi-oracle property에 대해 설명"
category: "Causal Inference"
tags: ["Paper Review"]
---

[paper link](https://arxiv.org/pdf/1712.04912)


# 논문 리뷰

# Abstract

> Flexible estimation of heterogeneous treatment effects lies at the heart of many statistical challenges, such as personalized medicine and optimal resource allocation.

개인화된 처치효과를 유연하게 추정하는 것은 많은 분야에서 통계적 문제의 핵심입니다.

개인화된 처치효과를 알고 있으면 개인화된 약처방이나 교육정책 결정, 자원 분배 등 많은 문제에서 좋은 결정을 내릴 수 있습니다.
하지만 이를 추정하는 일은 꽤나 복잡한 일이라서 논문에서는 이를 유연하게 추정할 수 있는 방법을 제시하고 있습니다.

이 논문에서는 marginal effects와 treatment propensity라는 두 가지 nuisance component를 추정하여 개인화된 처치효과를 추정하는 방법을 제시합니다.

> we show that our method has a quasi-oracle property: Even if the pilot estimates for marginal effects and treatment propensities are not particularly accurate, we achieve the same error bounds as an oracle who has a priori knowledge of these two nuisance components. 

이러한 방법은 quasi-oracle property를 가지고 있다고 합니다.

<small> *quasi-oracle property : marginal effects와 treatment propensity의 추정이 정확하지 않더라도, 마치 이 두 nuisance component를 미리 알고 있는 것과 같은 오차 경계를 달성할 수 있는 성질</small>


# 1. Introduction

**기존 연구의 한계점**:
1. 방법론적 불일치: 관찰 연구에서 기계학습 방법을 처치효과 추정에 어떻게 적용해야 하는지에 대한 포괄적인 답이 아직 확립되지 않음
2. 개발 과정의 복잡성: 인과관계 기계학습 방법을 개발하는 과정이 노동집약적이며, 전문 연구자들의 참여가 필수적
3. 이론적 근거 부족: 대부분의 방법들이 수치적 실험으로만 검증되고, 형식적인 수렴 보장이나 오차 경

**이 논문의 새로운 접근법**:
1. 자동화된 프레임워크: 임의의 손실 최소화 절차를 통해 개인화된 처치효과 추정기를 완전 자동으로 명세할 수 있는 프레임워크 제공
2. Oracle 수준의 성능: 데이터 생성 분포에 대한 모든 정보를 알고 있는 oracle 방법과 비교 가능한 오차 경계 달성
3. 이론적 기반: 이중 강건 추정(double robust estimation), oracle 부등식, 교차 검증을 결합하여 일반적인 기계학습 도구로 원리적 통계 추정을 위한 손실 함수 개발

이 논문은 기존의 실용적 한계와 이론적 부족함을 모두 해결하는 새로운 접근법을 제시하고 있습니다.

# 2. A Loss Function for Treatment Effect Estimation

> We formalize our problem in terms of the potential outcomes framework (Neyman, 1923; Rubin, 1974).

potential outcomes framework를 사용해 문제를 정의합니다.

**데이터 구조**:
- **관찰 데이터**: $(X_i, Y_i, W_i)$ for $i = 1, ..., n$
  - $X_i \in \mathcal{X}$: 개인별 특성 (features)
  - $Y_i \in \mathbb{R}$: 관찰된 결과 (observed outcome)
  - $W_i \in \{0, 1\}$: 처치 할당 (treatment assignment)

**잠재 결과 (Potential Outcomes)**:
- **잠재 결과**: $\{Y_i(0), Y_i(1)\}$
  - $Y_i(0)$: 처치를 받지 않았을 때의 결과
  - $Y_i(1)$: 처치를 받았을 때의 결과
- **관찰된 결과와의 관계**: $Y_i = Y_i(W_i)$

**조건부 평균 처치효과 (CATE)**:
- **목표 함수**: $\tau^*(x) = \mathbb{E}[Y(1) - Y(0) \mid X = x]$
  - 특성 $X = x$인 개인들의 평균 처치효과

**식별 조건**:
- **Unconfoundedness**: 처치 할당이 관찰되지 않은 confounding variable에 의해 영향을 받지 않는다는 가정

이 수식들은 인과추론의 표준적인 잠재결과 프레임워크를 따르며, 개인화된 처치효과 추정을 위한 기본 구조를 정의합니다.

> In order to identify $\tau^*(x)$, we assume unconfoundedness, i.e., the treatment assignment is randomized once we control for the features $X_i$ (Rosenbaum and Rubin, 1983).

CATE를 추정하기 위해서는 무작위 할당처럼 unconfoundedness 가정을 만족해야 합니다.
이를 위해서 X를 통제할 수 있습니다.

**Assumption 1** : The treatment assignment $W_i$ is unconfounded, $\{Y_i(0), Y_i(1)\} \perp \!\!\! \perp W_i \mid X_i$

- **Treatment Propensity** : $e^*(x) = \Pr(W = 1 \mid X = x)$
- **Conditional Response Surfaces** : $\mu^{*(w)}(x) = \mathbb{E}[Y(w) \mid X = x]$ for $w \in \{0, 1\}$
- **Error Term** : $\varepsilon_i(w) := Y_i(w) - \{\mu^{*(0)}(X_i) + w\tau^*(X_i)\}$
- **성질** : unconfoundedness 하에서 $\mathbb{E}[\varepsilon_i(W_i) \mid X_i, W_i] = 0$
- **Conditional Mean Outcome** : $m^*(x) = \mathbb{E}[Y \mid X = x] = \mu^{*(0)}(x) + e^*(x)\tau^*(x)$


$$
Y_i - m^*(X_i) = \{W_i - e^*(X_i)\} \tau^*(X_i) + \varepsilon_i \tag{1}
$$

(1)에서 **propensity score $e^*(X_i)$를 통해 X를 통제**합니다.

- **$W_i - e^*(X_i)$**: 실제 처치 할당에서 예측된 처치 확률을 뺀 값
- 이는 X를 통제한 후의 "처치 할당의 편차"를 나타냄
- 마치 X가 같은 그룹 내에서 무작위 할당된 것처럼 만듦

따라서 이 등식은 **propensity score를 통한 X 통제**를 구현한 것입니다.

> The goal of this paper is to study how we can use the Robinson’s transfomation (1) for flexible treatment effect estimation that builds on modern machine learning approaches such as boosting or deep learning. 

이 논문의 목표는 부스팅이나 딥러닝과 같은 현대적인 기계학습 방법을 기반으로 하는 유연한 처치효과 추정을 위해 Robinson's transfomation (1)을 어떻게 사용할 수 있는지 연구하는 것입니다.

> Our main result is that we can use this representation to construct a loss function that captures heterogeneous treatment effects, and that we can then accurately estimate treatment effects—both in terms of empirical performance and asymptotic guarantees—by finding regularized minimizers of this loss function.

이 논문의 주요 결과는 이 표현을 사용하여 개인화된 처치효과를 포착하는 손실 함수를 구성할 수 있으며, 이 손실 함수의 정규화된 최소화 해를 찾아 처치효과를 정확하게 추정할 수 있다는 것입니다.

$$
\tau^*(\cdot) = \arg\min_{\tau} \mathbb{E}\left[\{Y_i - m^*(X_i)\} - \{W_i - e^*(X_i)\} \tau(X_i)\right]^2 \tag{2}
$$


$$
\tilde{\tau}(\cdot) = \arg\min_{\tau} \left\{ \frac{1}{n} \sum_{i=1}^n \left( \{ Y_i - m^*(X_i) \} - \{ W_i - e^*(X_i) \} \tau(X_i) \right)^2 + \Lambda_n[\tau(\cdot)] \right\} \tag{3}
$$

where the term $\Lambda_n[\tau(\cdot)]$ is interpreted as a regularizer on the complexity of the $\tau(\cdot)$ function

> This regularization could be explicit as in penalized regression, or implicit, e.g., as provided by a carefully designed deep neural network.

정규화항은 모델의 설계에 맞춰 적용한다고 합니다. 

> The difficulty, however, is that in practice we never know the weighted main effect function $m^*(x)$ and usually don’t know the treatment propensities $e^*(x)$ either, and so the estimator (3) is not feasible.

하지만 어려운 점은 당연하게도 $m^*(x)$와 $e^*(x)$를 알 수 없다는 점입니다.

> Given these preliminaries, we here study the following class of two-step estimators using cross-fitting (Chernozhukov et al., 2018; Schick, 1986) motivated by the above oracle procedure:

**Cross-fitting을 이용한 2단계 추정 방법**:

**Step 1**: 데이터 분할 및 Nuisance Component 추정
- 데이터를 Q개(보통 5 또는 10)의 균등한 크기의 fold로 분할
- $q(\cdot)$: $i = 1, \ldots, n$ 샘플 인덱스를 Q개의 fold에 매핑하는 함수
- Cross-fitting을 통해 $\hat{m}$과 $\hat{e}$를 최적 예측 정확도를 위해 조정된 방법으로 추정

**Step 2**: Plug-in 추정
- (3)의 plug-in 버전을 통해 처치효과 추정
- $\hat{e}^{(-q(i))}(X_i)$ 등은 i번째 훈련 예제가 속한 fold를 사용하지 않고 만든 예측값

$$
\hat{\tau}(\cdot) = \arg\min_{\tau} \left\{ \hat{L}_n[\tau(\cdot)] + \Lambda_n[\tau(\cdot)] \right\} \tag{4}
$$

$$
\hat{L}_n[\tau(\cdot)] = \frac{1}{n} \sum_{i=1}^n \left[ \{Y_i - \hat{m}^{(-q(i))}(X_i)\} - \{W_i - \hat{e}^{(-q(i))}(X_i)\} \tau(X_i) \right]^2 \tag{4a}
$$


> In other words, the first step learns an approximation for the oracle objective, and the second step optimizes it. We refer to this approach as the R-learner in recognition of the work of Robinson (1988) and to emphasize the role of residualization. We will also refer to the squared loss $L_b^n[\tau(\cdot)]$ as the R-loss.

1. 1단계: 오라클 목적함수(이론적으로 최적임을 보장하는 함수)의 근사값을 학습
2. 2단계: 그 근사 목적함수를 실제로 최적화
3. 이 전체 과정을 R-learner라 부르고, 손실함수를 R-loss라 부름


**논문의 주요 기여**:
1. 다양한 방법 적용 및 성능
- R-learner를 페널티 회귀, 커널 릿지 회귀, 부스팅 등 다양한 방법에 적용하여 기존 방법들보다 좋은 성능을 보임.
2. 이론적 보장
- 커널 회귀의 경우, 실제 추정기(plug-in estimator)의 오차 경계가 오라클(이론적 최적) 방법과 거의 일치함을 증명.
- 특히, nuisance component($m^*(x)$, $e^*(x)$)의 추정 오차가 충분히 빠르게 줄어들면, 최종 처치효과 추정기의 수렴 속도는 오직 $\tau^*(x)$의 복잡도에만 의존함.
3. 실용적 장점
- R-learner는 처치확률과 결과 예측의 상관관계를 손실함수 구조로 분리하여, 두 작업(상관관계 제거, 처치효과 추정)을 명확히 분리함.
- 이로 인해 다양한 기계학습 도구(예: glmnet, XGBoost, TensorFlow 등)를 손쉽게 활용할 수 있고, 손실함수(R-loss)만 잘 최소화하면 됨.
- 복잡한 교차검증 없이도 손실함수 기반의 간단한 튜닝이 가능함.

# 3. Related Work


## **1. Regularization bias**:

> However, the fact that both $\hat{\beta}^{(0)}$ and $\hat{\beta}^{(1)}$ are regularized towards 0 separately may inadvertently regularize the treatment effect estimate $\hat{\beta}^{(1)} - \hat{\beta}^{(0)}$ away from 0, even when $\tau^*(x) = 0$ everywhere

- CATE(조건부 평균 처치효과)는 $\tau^*(x) = \mu^{*(1)}(x) - \mu^{*(0)}(x)$로 쓸 수 있음.
- 흔히 $\mu^{*(1)}(x)$와 $\mu^{*(0)}(x)$를 각각 따로 추정한 뒤, 그 차이로 처치효과를 구하는데,
- 이때 두 함수를 별도로 정규화(regularization)하면 regularization bias가 발생할 수 있음.
- 예를 들어, 라쏘(lasso) 회귀를 각각의 집단(처치/비처치)에 따로 적용하면,
- 두 추정치 모두 0에 가까워지도록 정규화되어 실제로는 처치효과가 없을 때도 $\hat{\tau}(x) = \hat{\mu}^{(1)}(x) - \hat{\mu}^{(0)}(x)$가 0에서 멀어질 수 있음.
- 특히, 처치군과 대조군의 샘플 수가 다를 때 이 현상이 더 심해짐.

$$
\begin{align}
\hat{\beta}^{(w)} = \arg\min_{\beta^{(w)}} \left\{ \sum_{i:W_i=w} \left( Y_i - X_i^\top \beta^{(w)} \right)^2 + \lambda^{(w)} \|\beta^{(w)}\|_1 \right\} \tag{5}
\end{align}
$$


간단하게 대조군과 통제군을 따로 학습시키고, 그 결과를 비교해서 처치효과를 얻으면 되는거 아니야? 라고 생각할 수 있지만 이렇게 하면 regularization bias라고 하는, 과하게 정규화되어 처치효과가 0일 때도 0에서 멀어질 수 있는 문제가 발생합니다.

## **2. Regularization Bias를 피하는 최근 방법들**:
- 최근 연구들은 regularization bias 문제를 피하기 위해 다양한 구조적(machine learning 구조 자체의) 개선 방법을 제안함.
- 예를 들어, Imai & Ratkovic (2013)은 식 (5)처럼 처치군/대조군을 따로 학습하는 대신, 아래와 같이 하나의 라쏘(lasso) 회귀로 동시에 학습하는 방법을 제안함:

$$
\begin{align}
\hat{b}, \hat{\delta} = \arg\min_{b, \delta} \left\{ \sum_{i=1}^n \left( Y_i - X_i^\top b + (W_i - 0.5) X_i^\top \delta \right)^2 + \lambda_b \|b\|_1 + \lambda_\delta \|\delta\|_1 \right\} \tag{6}
\end{align}
$$

- 여기서 최종 처치효과 추정은 $\hat{\tau}(x) = x^\top \hat{\delta}$로 계산함.
- 이 방법은 $\delta$에만 희소성(sparsity)을 강제하여, 처치효과의 구조적 특성을 더 잘 반영할 수 있음.
- 이외에도 신경망 등 다양한 기계학습 방법에서 처치효과 이질성(heterogeneity)을 잘 추정하도록 구조를 설계하는 연구들이 진행되고 있음(예: Shalit et al., 2017).

## **3. Loss Function(손실함수) 변경을 통한 접근**:

> Here, instead of trying to modify the algorithms underlying different machine learning tools to improve their performance as treatment effect estimators, we focus on modifying the loss function used to training generic machine learning methods.

- 최근 연구들은 모델 구조 자체를 바꾸는 대신, 손실함수(R-loss)를 바꿔서 처치효과 추정 성능을 높이는 방법에 주목하고 있음.
- 이 접근은 van der Laan과 Dudoit(2003) 등에서 시작된 연구 흐름을 기반으로 하며, 이들은 doubly robust objective(이중 강건 목적함수)에 대한 교차검증을 통해 최적의 통계적 규칙을 선택하는 방법을 제안함.
- Luedtke & van der Laan(2016) 등은 이러한 목적함수를 이용해 개별화 처치규칙(individualized treatment rules)이나
이질적 처치효과(heterogeneous treatment effects)를 학습하는 다양한 유효한 목적함수(oracle loss 등)의 성질을 분석함.
- 본 논문의 기여는,
  - R-loss를 활용해 범용 기계학습(generic machine learning)으로 처치효과를 추정하는 방법을 제시하고,
  - 커널 힐버트 공간에서의 정규화 회귀 등 널리 쓰이는 비모수적 방법에 대해 강한 이론적 오차 경계(수렴률 보장)를 제공한 것임.

## **4. meta-learning 방법들**:

[meta learner 관련 설명자료](https://matheusfacure.github.io/python-causality-handbook/21-Meta-Learners.html)


**X-learner (Künzel et al., 2019)**:
- 먼저 $\hat{\mu}^{(w)}(x)$를 비모수 회귀 방법으로 추정
- 처치 관찰값에 대해 pseudo-effects $D_i = Y_i - \hat{\mu}^{(-i)}{(0)}(X_i)$를 정의하고, 이를 이용해 $\hat{\tau}^{(1)}(X_i)$를 비모수 회귀로 추정
- 대조군에 대해서도 유사하게 $\hat{\tau}^{(0)}(X_i)$를 구하고, 두 추정기를 다음과 같이 결합:
$$
\hat{\tau}(x) = \{1 - \hat{e}(x)\} \hat{\tau}^{(1)}(x) + \hat{e}(x) \hat{\tau}^{(0)}(x) \tag{7}
$$

**U-learner (Künzel et al., 2019)**:
- $U_i = \frac{Y_i - m^(X_i)}{W_i - e^(X_i)}$에 대해 $\mathbb{E}[U_i \mid X_i = x] = \tau(x)$임을 이용
- $U_i$를 $X_i$에 대해 범용 기계학습 방법으로 회귀

**Propensity Score 가중 방법들**:
  - Athey & Imbens (2016), Tian et al. (2014) 등이 제안
  - 결과나 공변량을 propensity score로 가중하여 처치효과 추정
  - 예: $Y_i\{W_i - e^(X_i)\}/\{e^(X_i)(1-e^(X_i))\}$를 $X_i$에 대해 회귀

**본 논문의 기여**:
- R-learner 방법을 제안하여 다양한 설정에서 baseline보다 의미있는 개선을 제공
- Quasi-oracle 오차 경계를 제공하여 $\hat{\tau}$의 오차가 $\hat{e}$나 $\hat{m}$의 오차보다 빠르게 감소할 수 있음을 이론적으로 보장



## **5. 관련 연구와 본 논문의 차별점**:

- **가장 유사한 기존 연구**:
  - Zhao, Small, and Ertefaie (2017):
    - Robinson 변환과 라쏘(lasso)를 결합해 고차원 선형모형에서 효과 수정(effect modification)에 대한 유효한 사후선택 추론(post-selection inference)을 제공
    - 하지만 일반적인 기계학습 맥락에서 손실함수로 Robinson 변환을 활용한 것은 본 논문이 처음
- **이론적 기반**:
  - 본 논문의 이론적 결과는 Robinson(1988) 등에서 발전된 준모수적 효율성(semiparametric efficiency)과 직교 모멘트(orthogonal moments) 이론에 기반
  - 알고리즘적으로는 Targeted Maximum Likelihood Estimation(TMIE)와 유사:
    1. nuisance component를 비모수적으로 추정
    2. 이를 활용해 likelihood(또는 손실함수)를 최적화
  - Cross-fitting(홀드아웃 예측)은 최근 준모수적 추정에서 널리 쓰이는 방법
- **본 논문의 차별점**:
  - 기존 연구들은 주로 단일(또는 저차원) 파라미터 추정에 초점
  - 본 논문은 복잡한 함수적 객체(즉, $\tau^(\cdot)$ 전체 함수)를 추정하는 데 초점 최적 처치 할당 규칙(optimal treatment allocation rule) 추정과도 관련 있지만, 목적함수(손실)가 다름
- **추가 논의**:
  - 본 논문은 모집단에서 무작위 추출된 샘플을 가정
  - 엄격한 무작위화 추론(randomization inference) 하에서의 비모수적 처치효과 추정에 대한 추가 연구도 흥미로운 주제임


# 4. The R-Learner in Action

## 4.1 Application to a Voting Study

투표에 관한 연구에 이를 적용해본 사례를 이야기하고 있습니다.

### 연구 배경
- **원본 연구**: Arceneaux, Gerber, and Green (2006)
- **연구 주제**: 유료 투표 독려 전화가 투표율에 미치는 효과
- **실제 결과**: 투표 독려 전화의 효과가 거의 없음 (1% 미만)

### 실험 설계

#### **데이터 구성**
- **전체 샘플**: 1,895,468개 관측치
- **처치 그룹**:59,264개 (전화 받은 사람)
- **분석 샘플**: 148160개 (모든 처치 그룹 + 랜덤 대조 그룹)
- **처치 비율**: 2/5 (40

#### **데이터 분할**
- **훈련 세트**: 1000개
- **테스트 세트**: 25,0개  
- **홀드아웃 세트**: 나머지

#### **인공적 처치효과 추가**
실제로는 처치효과가 거의 없으므로, 인공적으로 처치효과를 추가:

$$
\tau^*(X_i) = -\frac{\text{VOTE00}_i}{2 + \frac{100}{\text{AGE}_i}}
$$

- **VOTE00_i**: 200투표 여부
- **AGE_i**: 나이
- **목적**: 이질적 처치효과 추정을 위한 의미있는 작업 생성

### R-learner 적용 과정

#### **Step 1: Nuisance Components 추정**
- **부스팅과 라쏘** 두 방법으로 $\hat{e}(\cdot)$와 $\hat{m}(\cdot)$ 추정
- **교차검증**으로 최적 모델 선택
- **결과**: 부스팅이 두 nuisance components 모두에서 더 나은 성능

#### **Step2 R-loss 최적화**
- **라쏘**: R-loss = 00.1816 (훈련), 0.1781 (홀드아웃)
- **부스팅**: R-loss = 00.1818 (훈련), 0.1783홀드아웃)
- **최종 선택**: 라쏘 기반 $\hat{\tau}(\cdot)$

### 성능 비교

#### **Oracle Test Set MSE (Mean Squared Error)**
| 방법 | MSE |
|------|-----|
| **R-learner (라쏘)** | 00.47 ×10⁻³ |
| **R-learner (부스팅)** | 1.2310|
| **Single Lasso** | 00.61 ×10⁻³ |
| **BART** | 40.05 ×10⁻³ |

#### **성능 분석**
1. **R-learner (라쏘)가 최고 성능**2. **라쏘 vs 부스팅**: 
   - 라쏘: 편향 있지만 분산 낮음
   - 부스팅: 노이즈 많지만 편향 적음
   - **편향-분산 트레이드오프**에서 라쏘가 유리

### 핵심 발견

#### **1. 하이브리드 접근법의 우수성**
- **Nuisance components**: 비모수적 방법 (부스팅) 사용
- **처치효과 추정**: 간단한 방법 (라쏘) 사용
- **이유**: 각 단계에 최적화된 방법 선택

#### **2. 기존 방법들의 한계**
- **Single Lasso**: 모든 곳에서 선형 모델링 → 모델 오지정 가능성
- **BART**: 모든 곳에서 비모수적 모델링 → 불안정한 $\tau(\cdot)$ 추정

#### **3. R-learner의 장점**
- **유연성**: 각 단계에 적합한 방법 선택 가능
- **안정성**: 교차검증을 통한 안정적인 모델 선택
- **성능**: 기존 방법들보다 우수한 추정 정확도

### 실용적 교훈
1. **단계별 최적화**: 각 단계에 가장 적합한 방법 선택
2. **교차검증의 중요성**: 과적합 방지와 모델 선택
3. **편향-분산 트레이드오프**: 데이터 크기와 복잡성 고려
4. **실제 데이터 적용**: 이론적 방법의 실제 성능 검증

## 4.2 Model Averaging with the R-Learner

여러 모델을 합치는 stacking 방법을 적용한 시도를 이야기하고 있습니다.

### 배경과 동기

앞선 섹션에서는 R-learner의 각 단계에서 사용할 추정 전략을 세심하게 고려했습니다. 하지만 실제로는 분석의 시작점으로 기성품(off-the-shelf) 처치효과 추정기를 사용하는 것을 선호하는 경우가 많습니다. 

이 섹션에서는 **stacking**의 변형을 통해 합의 처치효과 추정을 구축하는 R-learning 접근법을 논의합니다.

### Stacking 기반 합의 추정

#### **기본 설정**
- $k = 1, \ldots, K$개의 서로 다른 처치효과 추정기 $\hat{\tau}_k$ 보유
- 훈련 세트에서 out-of-fold 추정치 $\hat{\tau}_k^{(-i)}(X_i)$ 접근 가능
- 신뢰할 수 있는 out-of-fold 추정치 $\hat{e}^{(-i)}(X_i)$와 $\hat{m}^{(-i)}(X_i)$ 보유

#### **합의 추정 방법**

R-loss에 따라 $\hat{\tau}_k(\cdot)$의 최적 양의 선형 결합을 취하여 합의 추정 $\hat{\tau}(\cdot)$를 구축:

$$
\hat{\tau}(x) = \hat{c} + \sum_{k=1}^K \alpha_k \hat{\tau}_k(x) \tag{8a}
$$

$$
(\hat{b}, \hat{c}, \hat{\alpha}) = \arg\min_{b, c, \alpha} \left\{ \sum_{i=1}^n \left[ \left(Y_i - \hat{m}^{(-i)}(X_i)\right) - b - \left(c + \sum_{k=1}^K \alpha_k \hat{\tau}_k^{(-i)}(X_i)\right) \left(W_i - \hat{e}^{(-i)}(X_i)\right) \right]^2 : \alpha \geq 0 \right\} \tag{8b}
$$

#### **수식의 구성 요소**
- **$\hat{c}$**: 상수 처치효과 항 (유연성을 위해 자유롭게 조정)
- **$\hat{b}$**: 절편 ($\hat{m}$의 잠재적 편향 흡수)
- **$\alpha_k$**: 각 추정기의 가중치 (비음 제약)

### 실험 설정

#### **데이터 생성 과정**

다음과 같은 데이터 생성 분포에서 실험을 수행했습니다:

$$
X_i \sim N(0, I_{d \times d}), \quad W_i \sim \mathrm{Bernoulli}(0.5) \tag{9a}
$$

$$
Y_i \mid X_i, W_i \sim N\left(\frac{3}{1 + e^{X_{i3} - X_{i2}}} + (W_i - 0.5) \tau^*(X_i), \sigma^2\right) \tag{9b}
$$

**실험 조건:**
- 샘플 크기: $n = 10,000$ (무작위 연구 설계)
- 차원: $d = 10$
- 다양한 $\tau^*(\cdot)$와 $\sigma$ 선택

#### **처치효과 함수**

두 가지 유형의 처치효과 함수를 고려:

1. **연속 함수**: $\tau^*(X_i) = \frac{1}{1 + e^{X_{i1} - X_{i2}}}$

2. **불연속 함수**: $\tau^*(X_i) = \frac{\mathbf{1}\{X_{i1} > 0\}}{1 + e^{-X_{i2}}}$

### 비교 방법

**추정 방법들:**
- **BART** (Bayesian Additive Regression Trees)
- **Causal Forests** (인과관계 숲)
- **Stacking**: 식 (8)을 이용한 두 방법의 결합

**실험 조건:**
- 데이터가 무작위화되었다는 것을 실험자가 알고 있다고 가정
- 필요한 곳에서는 $\hat{e}(x) = 0.5$ 사용
- Stacking용 $\hat{m}(\cdot)$는 random forest로 추정

### 실험 결과 (Figure 2)

#### **연속 처치효과 함수의 경우**
- **BART**: Causal Forests보다 약간 우수한 성능
- **Stacking**: 노이즈 수준 $\sigma$가 매우 클 때까지 개별 방법보다 우수
- **고노이즈 환경**: 모든 방법이 상수 처치효과 추정기와 비슷한 수준

#### **불연속 처치효과 함수의 경우**
- **Causal Forests**: 낮은 노이즈 수준에서 특히 유리
- **Stacking**: 더 정확한 기본 학습자의 성능을 자동으로 매칭

### 핵심 발견

#### **1. Stacking의 자동 적응성**
- 각 설정에서 더 나은 기본 학습자를 자동으로 식별
- 수동 선택 없이도 최적 성능에 근접

#### **2. 방법론적 유연성**
- 기존 처치효과 추정기들을 그대로 활용
- 복잡한 알고리즘 수정 없이 성능 개선

#### **3. 실용적 장점**
- **자동화**: 복잡한 모델 선택 과정 단순화
- **견고성**: 다양한 데이터 특성에 대한 적응력
- **효율성**: 기존 도구들의 강점을 효과적으로 결합


# 5. A Quasi-Oracle Error Bound

이 섹션에서는 R-learner의 핵심 이론적 기여인 **quasi-oracle property**에 대해 설명합니다.

## 5.1 Oracle과 Quasi-Oracle의 개념

### **Oracle Estimator**
이상적인 oracle은 다음을 미리 알고 있다고 가정합니다:
- **True marginal effect**: $m^*(x) = \mathbb{E}[Y \mid X = x]$
- **True propensity score**: $e^*(x) = \Pr(W = 1 \mid X = x)$

Oracle이 이 정보를 알고 있다면, 다음 손실함수를 직접 최소화할 수 있습니다:

$$
\mathcal{L}_n^{\text{oracle}}[\tau(\cdot)] = \frac{1}{n} \sum_{i=1}^n \left[ \{Y_i - m^*(X_i)\} - \{W_i - e^*(X_i)\} \tau(X_i) \right]^2
$$

### **R-learner (Quasi-Oracle)**
실제로는 $m^*(x)$와 $e^*(x)$를 모르므로, 추정값 $\hat{m}(\cdot)$과 $\hat{e}(\cdot)$을 사용:

$$
\hat{\mathcal{L}}_n[\tau(\cdot)] = \frac{1}{n} \sum_{i=1}^n \left[ \{Y_i - \hat{m}^{(-q(i))}(X_i)\} - \{W_i - \hat{e}^{(-q(i))}(X_i)\} \tau(X_i) \right]^2
$$

## 5.2 Main Theoretical Result

논문의 핵심 이론적 결과는 다음과 같습니다:

### **Theorem (Informal)**
적절한 조건 하에서, R-learner $\hat{\tau}$는 다음 성질을 만족합니다:

$$
\mathbb{E}\left[\|\hat{\tau} - \tau^*\|^2\right] \lesssim \text{Oracle Rate} + \text{Nuisance Rate}
$$

여기서:
- **Oracle Rate**: oracle이 달성할 수 있는 최적 수렴률
- **Nuisance Rate**: nuisance components 추정 오차의 곱

### **Quasi-Oracle Property**
만약 nuisance components의 추정이 충분히 빠르게 수렴한다면:

$$
\text{Nuisance Rate} = \|\hat{m} - m^*\| \cdot \|\hat{e} - e^*\| \to 0
$$

이 경우 R-learner는 **oracle rate**를 달성합니다:

$$
\mathbb{E}\left[\|\hat{\tau} - \tau^*\|^2\right] \lesssim \text{Oracle Rate}
$$

## 5.3 Why Does This Work?

### **1. Cross-fitting의 역할**
- **Overfitting 방지**: 같은 데이터로 추정과 예측을 하지 않음
- **Bias 감소**: $\mathbb{E}[\hat{m}^{(-i)}(X_i) - m^*(X_i)] \approx 0$

### **2. Doubly Robust Structure**
R-loss는 doubly robust 구조를 가집니다:

$$
\mathbb{E}\left[\left\{Y_i - m^*(X_i)\right\} - \left\{W_i - e^*(X_i)\right\} \tau^*(X_i) \mid X_i\right] = 0
$$

이는 다음을 의미합니다:
- $m^*(x)$ 또는 $e^*(x)$ 중 하나만 정확해도 편향이 없음
- 두 추정의 오차가 곱의 형태로 나타남

### **3. Product Form of Error**
최종 오차는 다음과 같이 분해됩니다:

$$
\text{Total Error} \approx \text{Oracle Error} + \|\hat{m} - m^*\| \times \|\hat{e} - e^*\|
$$

따라서 두 nuisance components가 모두 $o(1)$ 속도로 수렴하면, 곱은 더 빠르게 수렴합니다.

## 5.4 Practical Implications

### **1. Flexible Method Choice**
- 각 단계에서 **서로 다른 기계학습 방법** 사용 가능
- $\hat{m}$에는 random forests, $\hat{e}$에는 logistic regression 등

### **2. Robustness**
- 한 nuisance component가 부정확해도 다른 것이 보완
- 완벽한 추정이 필요하지 않음

### **3. Rate Optimality**
- 적절한 조건 하에서 **minimax optimal** 달성
- 이론적으로 최선의 성능 보장

# 논문에서 궁금한 점들 정리

## 그래서 quasi-oracle property는 어떻게 보장되는건데?

### **핵심 메커니즘**

#### **1. Robinson's Transformation의 마법**
Robinson's transformation (1988)이 핵심입니다:

$$
Y_i - m^*(X_i) = \{W_i - e^*(X_i)\} \tau^*(X_i) + \varepsilon_i
$$

이 변환의 특별한 성질:
- **Orthogonality**: $\mathbb{E}[\varepsilon_i \mid X_i, W_i] = 0$
- **Causal Isolation**: 처치효과만 분리됨

#### **2. Cross-fitting의 핵심 역할**
```
Step 1: 데이터를 K개 fold로 분할
Step 2: k번째 fold를 제외하고 m̂, ê 추정  
Step 3: k번째 fold에서 τ̂ 추정
Step 4: 모든 fold에 대해 반복
```

**왜 이게 중요한가?**
- **Independence**: 추정에 사용된 데이터와 예측 데이터가 독립
- **Bias Reduction**: $\mathbb{E}[\hat{m}^{(-i)}(X_i) \mid X_i] \approx m^*(X_i)$

#### **3. Doubly Robust의 수학적 구조**

핵심은 다음 decomposition입니다:

$$
\hat{\mathcal{L}}_n - \mathcal{L}_n^{\text{oracle}} = \text{Bias Term} + \text{Variance Term}
$$

**Bias Term**:
$$
\frac{2}{n} \sum_{i=1}^n \left[\{Y_i - m^*(X_i)\} - \{W_i - e^*(X_i)\}\tau^*(X_i)\right] \times \left[\{\hat{m}^{(-i)} - m^*\}(X_i) - \{\hat{e}^{(-i)} - e^*\}(X_i)\tau^*(X_i)\right]
$$

Cross-fitting에 의해 이 term의 기댓값이 0에 가까워집니다.

**Variance Term**:
$$
\left\|\{\hat{m} - m^*\} - \{\hat{e} - e^*\}\tau^*\right\|^2
$$

이는 $\|\hat{m} - m^*\| \times \|\hat{e} - e^*\|$의 order입니다.

#### **4. 수렴률의 곱셈 구조**

만약:
- $\|\hat{m} - m^*\| = O_p(r_m)$
- $\|\hat{e} - e^*\| = O_p(r_e)$

그러면:
$$
\|\hat{\tau} - \tau^*\| = O_p(\max\{r_{\text{oracle}}, r_m \times r_e\})
$$

**예시**: 
- $r_m = r_e = n^{-1/4}$ (느린 수렴)
- $r_m \times r_e = n^{-1/2}$ (빠른 수렴!)
- Oracle rate $r_{\text{oracle}} = n^{-1/3}$이면
- 최종 rate = $\max\{n^{-1/3}, n^{-1/2}\} = n^{-1/3}$ ✨

### **실제 동작 예시**

#### **시나리오 1: 완벽한 Oracle**
```python
# Oracle knows true m*(x) and e*(x)
oracle_loss = R_loss(Y, W, X, tau, m_true, e_true)
oracle_rate = n^(-1/3)  # optimal rate for τ* complexity
```

#### **시나리오 2: R-learner with Imperfect Estimates**
```python
# Step 1: Estimate nuisances with cross-fitting
m_hat = estimate_m_with_crossfit(Y, X)  # rate: n^(-1/4)
e_hat = estimate_e_with_crossfit(W, X)  # rate: n^(-1/4)

# Step 2: Optimize R-loss
tau_hat = optimize_R_loss(Y, W, X, m_hat, e_hat)

# Achieved rate: max(n^(-1/3), n^(-1/4) × n^(-1/4)) = n^(-1/3)
# Same as oracle! 🎉
```

### **왜 이게 "Quasi-Oracle"인가?**

1. **Oracle과 같은 수렴률**: $n^{-1/3}$ 달성
2. **하지만 Oracle이 아님**: $m^*, e^*$를 실제로는 모름
3. **Automatic**: 추가적인 튜닝 없이 자동으로 달성
4. **Robust**: nuisance 추정이 완벽하지 않아도 작동

이것이 바로 **"quasi-oracle property"**의 핵심입니다! 🎯

