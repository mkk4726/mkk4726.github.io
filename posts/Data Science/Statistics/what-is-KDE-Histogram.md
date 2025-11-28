---
title: "KDE와 Histogram에 대한 정리"
date: "2025-08-12"
excerpt: "KDE와 Histogram이 뭔지, 차이점에 대한 정리"
category: "Data Science"
tags: ["statistics"]
---


# What is Histogram?
> 히스토그램은 **데이터의 분포(어디에 값이 많이 몰려 있는지)**를 보기 위해 데이터 범위를 여러 구간(bin)으로 나누고, 각 구간에 속한 데이터 개수를 세어 막대그래프로 표현한 것

## 히스토그램의 쓰임
- 데이터 분포의 형태 파악 (정규분포? 치우침? 두 개의 봉우리가 있음?)
- 분포 비교 (예: A 그룹과 B 그룹의 측정값 분포 차이)
- 통계/머신러닝 전처리(확률분포 추정, KL divergence 계산 등)

## 히스토그램 기반 확률분포 추정의 장점
- 구현이 쉽고 빠름
- np.histogram, np.histogramdd로 바로 가능
- 시각화하기 좋음
- 이산형 데이터에서는 자연스럽게 적용 가능

## 단점
- bin 크기(폭), bin 개수에 따라 결과가 민감하게 변함
- 데이터가 적으면 bin이 비게 되고, 분포가 부정확해짐
- 다차원 데이터일수록 bin 개수가 기하급수적으로 늘어(희소화), KL 값이 불안정해짐 → "차원의 저주" 문제
- 연속형 데이터에서는 부드러운 분포 형태를 제대로 못 잡을 수 있음


## python code

```python
import numpy as np

data = [1, 2, 2, 3, 3, 3, 4]
counts, bin_edges = np.histogram(data, bins=3, density=False) # 차원이 여러개면 np.ravel()을 써서 모든 값을 1차원으로 펼쳐서 계산
print(counts)     # [2 3 2]
print(bin_edges)  # [1. 2. 3. 4.]
```

```python
hist, edges = np.histogramdd(data.drop(["size"], axis=1).to_numpy(), bins=30, range=None, density=False) # 차원 별로 bin을 쪼개줌
```

# What is KDE?
KDE(Kernel Density Estimation, 커널 밀도 추정)는 히스토그램보다 한 단계 더 세련된 확률밀도 추정 방법

## 정의와 수식
- 데이터의 각 관측치에 작은 kernel을 얹어 평균함으로써 연속적이고 부드러운 확률밀도함수(pdf)를 추정하는 **비모수적(non-parametric)** 방법

$$
\hat{f}_h(x) = \frac{1}{n h} \sum_{i=1}^{n} K\!\left(\frac{x - x_i}{h}\right)
$$

- **K(kernel)**: Gaussian, Epanechnikov, Top-hat 등. 일반적으로 kernel 선택보다 **bandwidth h** 선택이 성능에 더 큰 영향
- **h(bandwidth)**: 각 데이터 포인트에 얹는 kernel의 폭 (width)을 결정. 곡선의 매끄러움 조절. 작으면 과적합(울퉁불퉁), 크면 과평활(모드가 사라짐)

## 장점
- 히스토그램 대비 매끄러운 분포 추정, bin 경계 인공효과가 적음
- 연속형 데이터에서 모드, 꼬리(tail) 구조 확인에 유리

## 단점/주의
- 성능이 bandwidth에 매우 민감 → Cross-Validation, Silverman's rule, Scott's rule 등으로 선택
- 경계(boundary) 근처 bias 발생 가능 → reflection 등 보정 기법 고려
- 고차원에서는 표본 희소화로 성능 급감(차원의 저주)

## Python 예시
```python
import numpy as np
import matplotlib.pyplot as plt
from sklearn.neighbors import KernelDensity

rng = np.random.default_rng(0)
x = rng.normal(loc=0, scale=1, size=200)[:, None]

# KDE fit
kde = KernelDensity(kernel="gaussian", bandwidth=0.3).fit(x)
x_plot = np.linspace(-4, 4, 400)[:, None]
density = np.exp(kde.score_samples(x_plot))

# visualize vs histogram
plt.hist(x.ravel(), bins=30, density=True, alpha=0.3, label="hist")
plt.plot(x_plot, density, label="KDE")
plt.legend(); plt.show()
```

bandwidth 선택은 `GridSearchCV`로 교차검증해 결정하는 것이 실전에서 가장 안전함.







# KDE vs Histogram

| 특징   | 히스토그램            | KDE               |
| ---- | ---------------- | ----------------- |
| 형태   | 계단식              | 부드러운 곡선           |
| 파라미터 | bin 개수/폭         | 밴드폭(bandwidth)    |
| 고차원  | bin 폭 설정 어려움     | bandwidth 설정 어려움  |
| 민감도  | bin 개수에 민감       | bandwidth에 민감     |
| 장점   | 구현 쉬움, 직관적       | 매끄럽고 부드러운 분포 추정   |
| 단점   | 고차원/데이터 적을 때 부정확 | bandwidth 선택이 어려움 |


