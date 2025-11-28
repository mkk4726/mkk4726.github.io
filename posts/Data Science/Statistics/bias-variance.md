---
title: "Bias-Variance Tradeoff"
date: "2025-07-22"
excerpt: "Bias-Variance Tradeoff에 대한 간단한 설명"
category: "Data Science"
tags: ["bias-variance", "machine-learning", "statistics"]
---

# Bias-Variance Tradeoff

머신러닝에서 모델의 성능을 평가할 때 가장 중요한 개념 중 하나가 **Bias-Variance Tradeoff**입니다. 이는 모델의 복잡도와 일반화 성능 사이의 균형을 설명하는 핵심 개념입니다.

## 1. 기본 개념

### Bias (편향)
> 학습된 모델의 예측값 평균과 실제 값 간의 차이

- **정의**: 모델이 실제 데이터 생성 과정을 얼마나 잘 근사하는지를 나타내는 지표
- **높은 Bias**: 모델이 너무 단순해서 데이터의 패턴을 제대로 학습하지 못함
- **낮은 Bias**: 모델이 복잡해서 데이터의 패턴을 잘 학습할 수 있음

### Variance (분산)
> 예측값이 얼마나 흩어졌는지를 나타내는 지표

- **정의**: 모델이 훈련 데이터의 작은 변화에 얼마나 민감한지를 나타내는 지표
- **높은 Variance**: 모델이 훈련 데이터에 과도하게 적합되어 새로운 데이터에 대해 성능이 떨어짐
- **낮은 Variance**: 모델이 훈련 데이터의 노이즈에 덜 민감함

## 2. 수학적 표현

### 예측 오차의 분해

$$E[(y - \hat{f}(x))^2] = \text{Bias}^2 + \text{Variance} + \text{Irreducible Error}$$

여기서:
- $y$: 실제 값
- $\hat{f}(x)$: 모델의 예측값
- $\text{Bias}^2 = E[(\hat{f}(x) - f(x))^2]$: 편향의 제곱
- $\text{Variance} = E[(\hat{f}(x) - E[\hat{f}(x)])^2]$: 분산
- $\text{Irreducible Error}$: 데이터 자체의 노이즈로 인한 오차

### 편향과 분산의 계산

편향과 분산은 다음과 같이 계산됩니다:

$$\text{Bias} = E[\hat{f}(x)] - f(x)$$

$$\text{Variance} = E[(\hat{f}(x) - E[\hat{f}(x)])^2]$$

## 3. Bias-Variance Tradeoff

### 핵심 아이디어
- **모델이 단순할수록**: 높은 편향, 낮은 분산
- **모델이 복잡할수록**: 낮은 편향, 높은 분산

### 시각적 예시

<figure style="text-align: center;">
  <img src="./images/bias_variance_1.png" alt="Bias-Variance Tradeoff" style="width: 100%; max-width: 600px; display: block; margin: 0 auto;"/>
  <figcaption>그림 1: Bias-Variance 개념 설명 그림</figcaption>
</figure>

그림1은 편향과 분산의 개념을 설명하는 그림입니다.

편향은 데이터의 패턴을 얼마나 잘 학습했는지를 의미합니다. 
따라서 편향이 낮으면 패턴을 잘 학습해 파란 원 안에 안에 예측값이 모여있는 것을 확인할 수 있습니다.

분산은 예측값이 얼마나 흩어져있는지를 의미합니다.
따라서 분산이 낮으면 한 곳에 뭉쳐있고, 분산이 높으면 넓게 펴져있는 것을 확인할 수 있습니다.

<figure style="text-align: center;">
  <img src="./images/bias_variance_2.png" alt="Bias-Variance Tradeoff" style="width: 100%; max-width: 600px; display: block; margin: 0 auto;"/>
  <figcaption>그림 2: 실제 예측에서의 Bias-Variance Tradeoff - 단순한 모델(높은 편향, 낮은 분산) vs 복잡한 모델(낮은 편향, 높은 분산)</figcaption>
</figure>

그림2는 실제 예측에서의 Bias-Variance Tradeoff를 설명하는 그림입니다.

학습하는 데이터셋 안에서 패턴을 잘 찾으면 (편향이 낮을수록) 모델은 복잡해져야 하고, 이때 예측 값이 넓게 퍼져있게 됩니다 (분산이 높아짐)
반대로 학습하는 데이터셋 안에서 패턴을 잘 찾지 못하면 (편향이 높을수록) 모델은 단순해져야 하고, 이때 예측 값이 한 곳에 모여있게 됩니다 (분산이 낮아짐)

```
단순한 모델 (예: 선형 회귀)
├── 높은 Bias: 데이터의 복잡한 패턴을 놓침
└── 낮은 Variance: 새로운 데이터에 대해 안정적

복잡한 모델 (예: 고차 다항식, 딥러닝)
├── 낮은 Bias: 데이터의 복잡한 패턴을 잘 학습
└── 높은 Variance: 새로운 데이터에 대해 불안정
```

## 4. 실제 예시

### 선형 회귀 vs 다항 회귀

**선형 회귀 (1차 다항식)**
- 낮은 복잡도 → 높은 편향, 낮은 분산
- 데이터가 비선형 패턴을 가지고 있다면 성능이 떨어짐

**고차 다항 회귀 (예: 10차 다항식)**
- 높은 복잡도 → 낮은 편향, 높은 분산
- 훈련 데이터에는 완벽하게 적합하지만 새로운 데이터에는 성능이 떨어짐

## 5. 모델 선택에서의 적용

### Underfitting vs Overfitting

**Underfitting (과소적합)**
- 높은 편향, 낮은 분산
- 모델이 너무 단순해서 데이터의 패턴을 학습하지 못함
- 해결책: 모델 복잡도 증가

**Overfitting (과적합)**
- 낮은 편향, 높은 분산
- 모델이 훈련 데이터에 과도하게 적합되어 일반화 성능이 떨어짐
- 해결책: 모델 복잡도 감소, 정규화, 더 많은 데이터

## 6. 최적 모델 선택

### 교차 검증 (Cross-Validation)
- 훈련 데이터와 검증 데이터를 분리하여 모델의 일반화 성능 평가
- 편향과 분산의 균형점을 찾는 데 도움

### 정규화 (Regularization)
- Ridge Regression (L2 정규화): 분산을 줄여 과적합 방지
- Lasso Regression (L1 정규화): 특성 선택을 통한 모델 단순화

## 7. 실무적 고려사항

### 데이터 크기의 영향
- **작은 데이터셋**: 분산이 높아 과적합 위험 증가
- **큰 데이터셋**: 편향이 더 중요한 고려사항

### 특성 엔지니어링
- 적절한 특성 선택과 변환이 편향-분산 균형에 큰 영향
- 도메인 지식을 활용한 특성 생성이 중요

## 8. 결론

Bias-Variance Tradeoff는 머신러닝 모델 설계의 핵심 원칙입니다. 최적의 모델은 주어진 데이터와 문제에 대해 편향과 분산이 적절히 균형을 이루는 모델입니다. 이를 위해서는:

1. **데이터의 특성 이해**: 데이터의 복잡도와 노이즈 수준 파악
2. **모델 복잡도 조절**: 문제에 적합한 모델 선택
3. **정규화 기법 활용**: 과적합 방지를 위한 기법 적용
4. **교차 검증**: 모델의 일반화 성능 평가

이러한 원칙을 바탕으로 실무에서 더 나은 머신러닝 모델을 구축할 수 있습니다.

