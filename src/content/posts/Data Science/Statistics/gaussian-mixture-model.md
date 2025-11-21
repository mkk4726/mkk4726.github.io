---
title: "Gaussian Mixture Model (GMM) 개념 정리해보기"
date: "2025-11-21"
excerpt: "GMM(Gaussian Mixture Model)의 개념, 원리, EM 알고리즘, 그리고 활용 사례에 대한 정리"
category: "Data Science"
tags: ["statistics", "machine-learning", "clustering"]
---

# Gaussian Mixture Model (GMM)이란?

**Gaussian Mixture Model (GMM)** 은 전체 데이터의 확률 분포가 여러 개의 **가우시안 분포(Gaussian Distribution)** 의 조합(Mixture)으로 이루어져 있다고 가정하는 확률 모델입니다. 

주로 **비지도 학습(Unsupervised Learning)**에서 **군집화(Clustering)**나 **밀도 추정(Density Estimation)**에 사용됩니다.

## 핵심 아이디어

> "데이터가 $K$개의 서로 다른 정규분포(가우시안 분포)에서 생성되었다고 가정하자."

예를 들어, 사람들의 키 데이터를 분석한다고 할 때, 남성의 키 분포와 여성의 키 분포가 섞여 있을 수 있습니다. GMM은 이 데이터를 두 개의 가우시안 분포(남성, 여성)의 합으로 모델링하여 각 데이터가 남성 그룹에 속할 확률과 여성 그룹에 속할 확률을 추정합니다.

---

# GMM vs K-Means

가장 대중적인 군집화 알고리즘인 K-Means와 비교하면 GMM의 특징이 더 명확해집니다.

| 특징 | K-Means | GMM |
|------|---------|-----|
| **군집 형태** | 원형 (Spherical) | 타원형 (Ellipsoidal) 가능 |
| **할당 방식** | **Hard Clustering** (무조건 하나의 군집에 할당) | **Soft Clustering** (각 군집에 속할 확률 계산) |
| **파라미터** | 중심점 (Centroid) | 평균($\mu$), 공분산($\Sigma$), 혼합 계수($\pi$) |
| **유연성** | 낮음 (분산이 다른 군집을 잘 못 찾음) | 높음 (다양한 크기와 모양의 군집 표현 가능) |

**GMM의 장점:**
- 데이터가 특정 군집에 속할 **확률**을 제공합니다.
- 군집의 크기(분산)와 모양(공분산)이 달라도 유연하게 대처할 수 있습니다.

---

# 수학적 모델

GMM은 $K$개의 가우시안 분포의 가중 합으로 표현됩니다.

$$p(x) = \sum_{k=1}^{K} \pi_k \mathcal{N}(x | \mu_k, \Sigma_k)$$

여기서:
- $K$: 군집(Component)의 개수
- $\pi_k$: $k$번째 가우시안 분포가 선택될 확률 (Mixing Coefficient). $\sum \pi_k = 1$
- $\mathcal{N}(x | \mu_k, \Sigma_k)$: $k$번째 가우시안 분포 (평균 $\mu_k$, 공분산 $\Sigma_k$)

즉, GMM을 학습시킨다는 것은 데이터 $X$가 주어졌을 때, 이 데이터를 가장 잘 설명하는 파라미터 $\theta = \{ \pi_k, \mu_k, \Sigma_k \}$들을 찾는 과정입니다.

---

# 학습 방법: EM 알고리즘 (Expectation-Maximization)

GMM은 파라미터를 추정하기 위해 **EM 알고리즘**을 사용합니다. K-Means와 매우 유사한 반복적인 절차를 따릅니다.

1. **초기화 (Initialization)**: 파라미터 $\mu_k, \Sigma_k, \pi_k$를 랜덤하게 혹은 K-Means 결과로 초기화합니다.
2. **E-Step (Expectation)**: 
   - 현재 파라미터를 고정한 상태에서, 각 데이터 $x_i$가 각 군집 $k$에 속할 확률(Responsibility, $\gamma(z_{nk})$)을 계산합니다.
   - "이 데이터는 1번 군집일 확률이 70%, 2번 군집일 확률이 30%야."
3. **M-Step (Maximization)**:
   - E-Step에서 구한 확률(Responsibility, $\gamma(z_{nk})$)을 가중치로 사용하여 파라미터를 업데이트합니다.
   - **평균 ($\mu_k$)**: 각 데이터의 위치를 해당 군집에 속할 확률로 가중 평균 냅니다.
     $$ \mu_k = \frac{\sum_{n=1}^N \gamma(z_{nk}) x_n}{N_k} $$
   - **공분산 ($\Sigma_k$)**: 각 데이터와 평균과의 거리를 확률로 가중하여 분산을 구합니다.
     $$ \Sigma_k = \frac{\sum_{n=1}^N \gamma(z_{nk}) (x_n - \mu_k)(x_n - \mu_k)^T}{N_k} $$
   - **혼합 계수 ($\pi_k$)**: 전체 데이터 중 해당 군집이 차지하는 비중을 계산합니다.
     $$ \pi_k = \frac{N_k}{N} $$
   - 여기서 $N_k = \sum_{n=1}^N \gamma(z_{nk})$는 $k$번째 군집의 유효 데이터 개수입니다.
4. **수렴 확인**: 로그 우도(Log-Likelihood)가 더 이상 크게 변하지 않을 때까지 2~3 과정을 반복합니다.

---

# 적절한 군집 개수($K$) 찾기

K-Means의 Elbow Method처럼 GMM에서도 적절한 $K$를 찾아야 합니다. 주로 정보 이론에 기반한 기준을 사용합니다.

- **AIC (Akaike Information Criterion)**:
  $$ AIC = 2k - 2\ln(\hat{L}) $$
  모델의 적합도(Likelihood)를 높이면서도 파라미터 개수($k$)를 최소화하는 방향으로 선택합니다. 데이터가 많지 않을 때 유용합니다.

- **BIC (Bayesian Information Criterion)**:
  $$ BIC = k \ln(n) - 2\ln(\hat{L}) $$
  AIC보다 파라미터 개수에 더 큰 페널티를 부여합니다(데이터 개수 $n$이 반영됨). 모델을 더 단순하게 만드는 경향이 있어, 과적합을 방지하는 데 더 강력합니다.

여기서 $\hat{L}$은 모델의 **최대 우도(Maximum Likelihood)**, $k$는 **파라미터의 개수**, $n$은 **데이터의 개수**를 의미합니다.

AIC와 BIC 값이 **낮을수록** 더 좋은 모델입니다. (모델의 복잡도에 페널티를 주어 과적합을 방지함)

---

# Python 구현 예제 (Scikit-learn)

`sklearn.mixture.GaussianMixture`를 사용하여 쉽게 구현할 수 있습니다.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.mixture import GaussianMixture
from sklearn.datasets import make_blobs

# 1. 데이터 생성
X, y_true = make_blobs(n_samples=400, centers=4, cluster_std=0.60, random_state=0)

# 2. GMM 모델 정의 및 학습
gmm = GaussianMixture(n_components=4, random_state=42)
gmm.fit(X)

# 3. 예측 (군집 할당)
labels = gmm.predict(X)

# 4. 확률 계산 (Soft Clustering)
probs = gmm.predict_proba(X)
print(probs[:5].round(3)) # 상위 5개 데이터의 군집별 확률 출력

# 5. 시각화
plt.scatter(X[:, 0], X[:, 1], c=labels, s=40, cmap='viridis')
plt.title("GMM Clustering Result")
plt.show()
```

## 공분산 유형 (covariance_type)
GMM은 공분산 행렬의 제약 조건에 따라 군집의 모양을 조절할 수 있습니다.
- `'full'`: 각 군집이 각각의 일반적인 공분산 행렬을 가짐 (타원형, 회전 가능). 기본값.
- `'tied'`: 모든 군집이 동일한 공분산 행렬을 공유.
- `'diag'`: 각 군집이 대각 공분산 행렬을 가짐 (타원형이지만 축과 평행).
- `'spherical'`: 각 군집이 단일 분산 값을 가짐 (원형).

---

# 정리

- **GMM**은 데이터를 여러 가우시안 분포의 합으로 모델링하는 확률적 생성 모델입니다.
- **Soft Clustering**을 지원하여 데이터가 각 군집에 속할 확률을 알 수 있습니다.
- **EM 알고리즘**을 통해 학습하며, 초기값에 민감할 수 있습니다.
- 데이터의 분포가 복잡하거나, 군집의 크기와 모양이 다양할 때 K-Means보다 더 좋은 성능을 보일 수 있습니다.
