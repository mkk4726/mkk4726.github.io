---
title: "Confidence Interval vs Prediction Interval"
date: "2025-08-18"
excerpt: "CI와 PI 각각에 대한 정리와, 이 개념 간의 차이에 대한 정리"
category: "Data Science"
tags: ["Confidence-Interval", "Prediction-Interval", "statistics"]
---


# Linear Regression에서의 CI 와 PI 개념

## Confidence Interval for the Mean Response

참고자료
- 1: [psu edu](https://online.stat.psu.edu/stat501/lesson/3/3.2)

> In this section, we are concerned with the confidence interval, called a "t-interval," for the mean response when the predictor value is $x_h$.

formula in words: 
$$
\text{Sample estimate} \pm (t\text{-multiplier} \times \text{standard error})
$$

formula in notation:

$$
\hat{y}_h \pm t_{(1-\alpha/2, n-2)} \times \sqrt{MSE \times \left( \frac{1}{n} + \dfrac{(x_h-\bar{x})^2}{\sum(x_i-\bar{x})^2}\right)}
$$

where:
- $\hat{y}_h$ is the "fitted value" or "predicted value" of the response when the predictor is $x_h$
- $t_{(1-\alpha/2, n-2)}$ is the "t-multiplier." Note that the t-multiplier has $n-2$ (not $n-1$) degrees of freedom because the confidence interval uses the mean square error (MSE) whose denominator is $n-2$.
- The expression under the square root is the "standard error of the fit," which depends on the mean square error (MSE), the sample size ($n$), how far in squared units the predictor value $x_h$ is from the average of the predictor values $\bar{x}$, and the sum of the squared distances of the predictor values $x_i$ from the average of the predictor values $\bar{x}$.


수식을 알아야하는 이유는 width of CI를 결정하는게 뭔지 알기 위해서. 

## Prediction Interval for a New Response

### Mean Response vs New Response
1. Mean Response (평균 응답)
- 정의: 특정 $x_h$ 값에서 무한히 많은 관측값들의 평균
- 예시: 키가 170cm인 모든 사람들의 평균 몸무게
- 특징:
  - 고정된 값 (변하지 않음)
  - 모집단의 특성
  - Confidence Interval의 대상

2. New Response (새로운 응답)
- 정의: 특정 $x_h$ 값에서 새로운 개별 관측값
- 예시: 키가 170cm인 특정 한 사람의 실제 몸무게
- 특징:
  - 랜덤한 값 (매번 다를 수 있음)
  - 개별 관측값의 특성
  - Prediction Interval의 대상

> CI는 mean estimator의 불확실성(주로 epistemic)을, PI는 mean 주변의 noise(aleatoric)까지 포함해 “개별 예측값”의 불확실성을 다룸. 따라서 동일한 설정에서 PI의 폭이 CI보다 넓음.

### 수식에서의 표현

formula in words:
$$
\text{Sample estimate} \pm (t\text{-multiplier} \times \text{standard error})
$$

formula in notation:

$$
\hat{y}_h \pm t_{(1-\alpha/2, n-2)} \times \sqrt{MSE \times \left( 1 + \frac{1}{n} + \dfrac{(x_h-\bar{x})^2}{\sum(x_i-\bar{x})^2}\right)}
$$

- PI: 평균 추정 불확실성 + 개별 관측값의 변동성
- 개별 관측값은 평균 주변에서 RMSE만큼 변동
- RMSE의 정의
    - $$\text{RMSE} = \sqrt{\frac{\sum_{i=1}^{n} (y_i - \hat{y}i)^2}{n-2}}$$
- RMSE의 의미
  - Residual의 표준편차
  - 실제 관측값($y_i$)과 예측값($\hat{y}i$) 사이의 차이
  - 모델이 예측하지 못하는 부분 = 개별 관측값의 고유한 변동성

선형회귀에서는 오차항 $\epsilon_i$가 평균 0, 분산 $\sigma^2$인 정규분포를 따른다고 가정하기 때문에 위와 같은 내용이 성립함.

