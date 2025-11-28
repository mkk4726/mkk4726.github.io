---
title: "Mean Shift Clustering 개념 정리"
date: "2025-11-21"
excerpt: "Mean Shift Clustering의 개념, 원리, 장단점, 그리고 Python 구현 예제"
category: "Data Science"
tags: ["statistics", "machine-learning", "clustering"]
---

# Mean Shift Clustering이란?

**Mean Shift Clustering**은 데이터의 **밀도(Density)**가 가장 높은 곳(Mode)으로 데이터 포인트들을 이동시키면서 군집을 형성하는 **비모수적(Non-parametric)** 군집화 알고리즘입니다.

K-Means와 달리 **군집의 개수($K$)를 미리 지정할 필요가 없으며**, 데이터의 분포에 따라 자동으로 군집의 개수가 결정된다는 큰 특징이 있습니다.

## 핵심 아이디어

> "모든 데이터 포인트는 자신 주변에서 가장 밀도가 높은 곳(산의 정상)을 향해 조금씩 이동한다."

**⚠️ 주의**: 여기서 "이동한다"는 것은 원본 데이터의 값을 실제로 바꾸는 것이 아닙니다. 각 데이터 포인트에서 시작하여 **밀도가 가장 높은 중심(Mode)을 찾아가는 경로를 계산하는 과정**을 의미합니다.

마치 등산객이 산을 오를 때, 현재 위치에서 가장 가파른 오르막길을 따라 정상(Mode)으로 이동하는 것과 같습니다.

> **"결국 같은 목적지에 도착한 데이터들끼리 같은 팀이다."**

최종적으로 **같은 정상에 도달한 데이터 포인트끼리** 하나의 군집으로 묶이게 됩니다.

---

# 수학적 원리와 알고리즘 (Mathematical Formulation)

Mean Shift 알고리즘은 데이터의 확률 밀도 함수(PDF)를 추정하고, 그 밀도의 기울기(Gradient)를 따라 등반(Hill Climbing)하는 과정으로 이해할 수 있습니다.

## 1. 커널 밀도 추정 (Kernel Density Estimation, KDE)

데이터의 분포를 알기 위해 **커널 밀도 추정(KDE)** 방법을 사용합니다.
$d$차원 공간에 있는 $n$개의 데이터 포인트 $x_i$가 주어졌을 때, 임의의 점 $x$에서의 밀도 $\hat{f}(x)$는 다음과 같이 추정됩니다.

$$ \hat{f}(x) = \frac{1}{n h^d} \sum_{i=1}^n K\left(\frac{x - x_i}{h}\right) $$

여기서:
- $K(\cdot)$: **커널 함수(Kernel Function)** (주로 가우시안 커널 사용)
- $h$: **대역폭(Bandwidth)** (윈도우의 크기 또는 스무딩 파라미터)

## 2. Mean Shift 벡터 유도

우리의 목표는 밀도 함수 $\hat{f}(x)$가 최대가 되는 지점(Mode), 즉 기울기 $\nabla \hat{f}(x) = 0$인 지점을 찾는 것입니다.
가우시안 커널을 미분하여 정리하면, 현재 위치 $x$를 어디로 이동시켜야 밀도가 높아지는지를 나타내는 **Mean Shift 벡터 $m(x)$**를 얻을 수 있습니다.

$$ m(x) = \frac{\sum_{i=1}^n x_i g\left( \left\| \frac{x - x_i}{h} \right\|^2 \right)}{\sum_{i=1}^n g\left( \left\| \frac{x - x_i}{h} \right\|^2 \right)} - x $$

여기서 $g(\cdot)$는 커널 함수의 미분과 관련된 가중치 함수입니다.
이 수식의 직관적인 의미는 **"현재 위치 $x$를 주변 데이터 포인트 $x_i$들의 가중 평균 위치로 이동시킨다"**는 것입니다. 이때 $x$와 가까운 데이터일수록 더 큰 가중치를 가집니다.

## 3. 알고리즘 수행 단계

실제 알고리즘은 다음과 같은 반복(Iterative) 과정을 통해 수행됩니다.

1. **초기화**: 모든 데이터 포인트 $x_i$를 시작점으로 설정합니다. (또는 그리드 포인트 등 별도의 시드 사용 가능)
2. **Mean Shift 계산**: 현재 위치 $y_t$에 대해 Mean Shift 벡터 $m(y_t)$를 계산합니다.
   $$ y_{t+1} = \frac{\sum_{i=1}^n x_i K(y_t - x_i)}{\sum_{i=1}^n K(y_t - x_i)} $$
   (위 식은 $y_{t+1} = y_t + m(y_t)$와 동일한 의미로, 가중 평균 위치로 바로 이동하는 식입니다.)
3. **이동 및 수렴 확인**:
   - 중심점을 $y_{t+1}$로 업데이트합니다.
   - 이동 거리 $\| y_{t+1} - y_t \|$가 임계값(Tolerance, 예: $10^{-5}$)보다 작으면 멈춥니다.
4. **군집 할당 (Clustering)**:
   - 수렴한 최종 위치(Mode)가 서로 가까운 포인트들을 동일한 군집으로 묶습니다.
   - 방문한 데이터 포인트 개수가 너무 적은 군집은 노이즈로 처리할 수 있습니다.

---

# 주요 파라미터: 대역폭 (Bandwidth)

Mean Shift에서 가장 중요한 하이퍼파라미터는 **대역폭(Bandwidth)**입니다. 이는 탐색할 윈도우의 크기(반지름)를 결정합니다.

- **Bandwidth가 작을 때**:
  - 윈도우 크기가 작아져서 국소적인 밀도 중심을 찾게 됩니다.
  - 군집의 개수가 많아지고, 자잘한 군집이 형성될 수 있습니다 (Overfitting).
  
- **Bandwidth가 클 때**:
  - 윈도우 크기가 커져서 더 넓은 영역의 데이터를 포함하게 됩니다.
  - 군집의 개수가 적어지고, 서로 다른 군집이 하나로 합쳐질 수 있습니다 (Underfitting).

따라서 적절한 Bandwidth를 설정하는 것이 매우 중요하며, Scikit-learn에서는 `estimate_bandwidth` 함수를 통해 데이터에 적합한 값을 추정할 수 있습니다.

---

# 장단점 분석

## 장점
1. **군집 개수($K$) 자동 결정**: 사전에 군집의 개수를 지정할 필요가 없습니다.
2. **유연한 군집 형태**: K-Means처럼 원형 군집에 국한되지 않고, 데이터의 밀도에 따라 다양한 모양의 군집을 찾아낼 수 있습니다.
3. **이상치(Outlier)에 강함**: 밀도가 낮은 영역의 데이터는 군집에 포함되지 않거나 별도의 군집으로 처리될 수 있습니다.

## 단점
1. **계산 복잡도**: 모든 데이터 포인트에 대해 반복적으로 거리를 계산해야 하므로 데이터가 많을수록 속도가 매우 느려집니다 ($O(N^2)$).
   - 예를 들어, **100만 개 이상의 데이터**를 그대로 학습시키면 계산량이 기하급수적으로 늘어나 현실적으로 사용하기 어렵습니다. (이 경우 `bin_seeding=True` 옵션을 사용하여 데이터를 그리드로 분할하여 계산량을 줄일 수 있습니다.)
2. **Bandwidth 민감도**: Bandwidth 값에 따라 결과가 크게 달라질 수 있습니다.

---

# Python 구현 예제 (Scikit-learn)

Scikit-learn의 `MeanShift` 클래스를 사용하여 구현할 수 있습니다.

```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import MeanShift, estimate_bandwidth
from sklearn.datasets import make_blobs

# 1. 데이터 생성
X, y = make_blobs(n_samples=300, centers=4, cluster_std=0.60, random_state=0)

# 2. Bandwidth 추정 (데이터 분포에 맞춰 자동으로 계산)
bandwidth = estimate_bandwidth(X, quantile=0.2, n_samples=None)
print(f"Estimated bandwidth: {bandwidth:.3f}")

# 3. Mean Shift 모델 학습
ms = MeanShift(bandwidth=bandwidth, bin_seeding=True)
ms.fit(X)

# 4. 결과 확인
labels = ms.labels_
cluster_centers = ms.cluster_centers_
n_clusters_ = len(np.unique(labels))

print(f"Number of estimated clusters: {n_clusters_}")

# 5. 시각화
colors = ['#D32F2F', '#1976D2', '#388E3C', '#FBC02D'] # Red, Blue, Green, Yellow

plt.figure(figsize=(8, 6))
for k, col in zip(range(n_clusters_), colors):
    my_members = labels == k
    cluster_center = cluster_centers[k]
    
    # 데이터 포인트 그리기
    plt.plot(X[my_members, 0], X[my_members, 1], 'o', markerfacecolor=col,
             markeredgecolor='k', markersize=6)
    
    # 중심점(Centroid) 그리기
    plt.plot(cluster_center[0], cluster_center[1], 'o', markerfacecolor=col,
             markeredgecolor='k', markersize=15)

plt.title(f'Mean Shift Clustering (Estimated clusters: {n_clusters_})')
plt.show()
```

---

# 정리

- **Mean Shift**는 데이터의 밀도를 따라 산을 오르듯 군집의 중심을 찾아가는 알고리즘입니다.
- **K를 지정할 필요가 없다**는 점이 가장 큰 매력이지만, **Bandwidth 설정**이 결과에 큰 영향을 미칩니다.
- 데이터셋의 크기가 작고, 군집의 개수를 미리 알 수 없는 경우에 유용하게 사용될 수 있습니다. 하지만 대용량 데이터에는 계산 비용 문제로 적합하지 않을 수 있습니다.
