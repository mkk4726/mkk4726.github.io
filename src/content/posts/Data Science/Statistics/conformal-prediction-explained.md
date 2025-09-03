---
title: "Conformal Prediction: 분포 가정 없이 유한 샘플 coverage를 보장하는 방법"
date: "2025-08-13"
excerpt: "통계적 가정 없이도 finite-sample coverage를 보장하는 conformal prediction의 원리와 실무 적용법"
category: "Data Science"
tags: ["statistics", "prediction-interval", "uncertainty", "calibration"]
---

참고자료
- 1 : [블로그 - Conformal Prediction으로 모델의 불확실성 계산하기](https://pizzathiefz.github.io/posts/introduction-to-conformal-prediction/)
- 2 : [Paper - Conformal Prediction: A Gentle Introduction](https://arxiv.org/abs/2107.07511)
- 3 : [블로그 - Conformal Prediction](https://ddangchani.github.io/Conformal-Prediction/#how-to-make-a-prediction-set)

---

<figure>
<img src="/post/ML/CQR_그림.png" alt="CQR 그림" width="70%" />
<figcaption>그림1. CQR </figcaption>
</figure>

conformal prediction은 calibration set을 통해 목표 coverage를 달성하는 방법입니다.
그림1처럼 quantile regressor의 결과에 conformal prediction을 붙여, 원하는 coverage의 prediction interval을 추정할 수 있습니다.

---
## 1. Conformal Prediction이란?

Conformal Prediction은 분포 가정 없이도 finite-sample coverage를 보장하는 prediction interval을 만드는 방법입니다.
- [Paper - A Gentle Introduction to Conformal Prediction and Distribution-Free Uncertainty Quantification](https://arxiv.org/pdf/2107.07511)

conformal precition은 다음과 같은 특징을 가집니다.
- **분포 가정 불필요** : 데이터가 어떤 분포를 따르든 상관없음
- Finite-sample coverage: 유한한 샘플에서도 목표 coverage 보장
- **모델 agnostic** : 어떤 머신러닝 모델과도 사용 가능
- Calibration 자동화: 별도 조정 없이도 coverage 보장

---

## 2. 기본 원리

Conformal prediction의 핵심 가정은 **Exchangeability**입니다:

> 예측하고자 하는 새로운 데이터 $(x_{n+1}, y_{n+1})$와 기존 데이터 $(x_1, y_1), ..., (x_n, y_n)$이 exchangeable하다.

- Exchangeability: 데이터의 순서를 바꿔도 확률 분포가 동일

이는 train, valid, test을 나눴을 때 3개 모두 같은 분포를 가질 것이라는 이야기와 같습니다.

conformal prediction은 train set에서 valid set과 같은 개념인 calibration set을 따로 두고, 이를 통해 모델의 결과를 보정하겠다는 개념입니다.

학습 순서는 이렇게 구성되어 있습니다.
1. **Nonconformity score** 계산: 예측값과 실제값의 차이를 측정
2. **Calibration set** 에서 분위수 계산: 목표 coverage에 맞는 임계값 도출
3. **새로운 예측** 에 적용: 계산된 임계값으로 prediction interval 구성

---

## 3. Split Conformal Prediction

가장 실용적이고 널리 사용되는 방법입니다.

단계별 과정을 살펴보면, 

1. 데이터 분할
```
전체 데이터 → Train Set + Calibration Set
```

2. 모델 학습
- Train set으로 예측 모델 $\hat{f}$ 학습

3. 3단계: **Nonconformity score** 계산
- Calibration set에서 각 데이터의 nonconformity score 계산
- 대칭 PI의 경우: $r_i = |y_i - \hat{f}(x_i)|$

4. 임계값 계산
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{r_i\}$
- $n_{cal}$: calibration set 크기

5. Prediction Interval 구성
- 새로운 입력 $x$에 대해: $[\hat{f}(x) - \hat{Q}, \hat{f}(x) + \hat{Q}]$


Python 구현하는 예시는 다음과 같습니다.

```python
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor

def split_conformal_prediction(X, y, alpha=0.1, test_size=0.2):
    # 1. 데이터 분할
    X_train, X_cal, y_train, y_cal = train_test_split(
        X, y, test_size=test_size, random_state=42
    )
    
    # 2. 모델 학습
    model = RandomForestRegressor(random_state=42)
    model.fit(X_train, y_train)
    
    # 3. Calibration set에서 예측
    y_cal_pred = model.predict(X_cal)
    
    # 4. Nonconformity scores 계산
    residuals = np.abs(y_cal - y_cal_pred)
    
    # 5. 임계값 계산
    n_cal = len(y_cal)
    quantile_level = (1 - alpha) * (1 + 1/n_cal)
    threshold = np.quantile(residuals, quantile_level)
    
    return model, threshold

# 사용 예시
model, threshold = split_conformal_prediction(X, y, alpha=0.1)

# 새로운 예측
y_pred = model.predict(X_new)
pi_lower = y_pred - threshold
pi_upper = y_pred + threshold
```

---

## 4. Conformalized Quantile Regression (CQR)

Quantile regression과 conformal prediction을 결합한 방법입니다.
3번 split conformal prediction의 개념과 완전히 일치합니다.

학습과정을 살펴보면, 

1. Quantile 모델 학습
- $\tau = \alpha/2$ (하한)
- $\tau = 1 - \alpha/2$ (상한)

2. Nonconformity score 계산
$$
e_i = \max\big(\hat{q}_{\alpha/2}(x_i) - y_i, y_i - \hat{q}_{1-\alpha/2}(x_i), 0\big)
$$

3. 임계값 계산**
- $\hat{Q} = (1-\alpha)(1+1/n_{cal})$-quantile of $\{e_i\}$

4. 최종 PI 구성**
$$
[\hat{q}_{\alpha/2}(x) - \hat{Q}, \hat{q}_{1-\alpha/2}(x) + \hat{Q}]
$$

이를 통해 더 정확한 PI를 구성할 수 있습니다.


---

## 장점과 한계

Conformal prediction의 장단점을 정리하면 아래와 같습니다.

### 장점
- **분포 가정 불필요**: 어떤 데이터든 사용 가능
- **Finite-sample 보장**: 유한한 샘플에서도 coverage 보장
- **모델 독립적**: 어떤 ML 모델과도 결합 가능
- **Calibration 자동**: 별도 조정 불필요

### 한계
- **Marginal coverage만 보장**: Conditional coverage는 보장하지 않음
- **데이터 분할 필요**: 학습 데이터 일부를 calibration에 사용
- **Computational cost**: 추가 계산 비용
- **Exchangeability 가정**: 시간 순서가 중요한 데이터에는 부적합

---

## 최신 발전 동향

### 1. Adaptive Conformal Prediction
- 온라인 학습 환경에서 coverage 유지
- Concept drift에 적응

### 2. Conformal Prediction for Time Series
- 시계열 데이터의 특성 고려
- Autocorrelation 처리

### 3. Multi-output Conformal Prediction
- 다중 출력 변수 동시 처리
- 출력 간 상관관계 고려

### 4. Conformal Prediction with Deep Learning
- 신경망 모델과의 결합
- Uncertainty quantification