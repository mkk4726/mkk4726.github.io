---
title: "KDE에 대한 자세한 정리"
date: "2025-08-12"
excerpt: "KDE에서 사용되는 개념들에 대한 자세히 정리"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1 : [블로그, KDE-Kernel Density Estimation이란?](https://hofe-rnd.tistory.com/entry/KDE-Kernel-Density-Estimation-%EC%9D%B4%EB%9E%80)
- 2 : [블로그, Kernel Density Estimation? KDE 이해](https://yenaworldblog.wordpress.com/2019/01/08/kernel-density-estimation-kde-%EC%9D%B4%ED%95%B4/)


# KDE의 핵심 아이디어

**"점별로 밀도를 구할 때, 모든 기존 데이터 포인트에 대해서 거리로 가중치를 주는 것"**

**구체적인 과정:**

1. **새로운 점 `x`에서 밀도를 구하고 싶음**
2. **모든 기존 데이터 포인트 `x_i`에 대해:**
   - 거리 `|x - x_i|` 계산
   - 거리에 따른 가중치 `K(x - x_i)` 계산
3. **모든 가중치를 합침** → $\sum_{i=1}^{n} K(x - x_i)$
4. **정규화** → $\frac{1}{nh}$ 곱하기

**예시:**
```python
# 새로운 점 x = 4에서 밀도 구하기
# 기존 데이터: [1, 3, 5]

# 각 포인트별 가중치:
# K(4-1) = K(3)     # 거리 3, 낮은 가중치
# K(4-3) = K(1)     # 거리 1, 높은 가중치  
# K(4-5) = K(-1)    # 거리 1, 높은 가중치

# 최종 밀도 = (K(3) + K(1) + K(-1)) / (n*h)
```

**핵심:**
- **거리 기반 가중치**: 가까운 데이터 포인트일수록 더 큰 영향
- **전체 합산**: 모든 기존 데이터의 정보를 활용
- **부드러운 추정**: 개별 포인트가 아닌 전체적인 분포 패턴 반영

---

# PDF와 PMF란?

## PMF (Probability Mass Function, 확률질량함수) :
**PMF**는 이산확률변수(discrete random variable)에서 특정 값이 나올 확률을 나타내는 함수입니다.

**특징:**
- 이산확률변수에만 적용
- 각 값에 대해 확률이 할당됨
- 모든 확률의 합은 1
- 음수 확률은 존재하지 않음

**수학적 표현:**
$$P(X = x_i) = p_i$$

**예시:** 주사위를 던질 때
- P(X=1) = 1/6
- P(X=2) = 1/6
- ... P(X=6) = 1/6

## PDF (Probability Density Function, 확률밀도함수) :
**PDF**는 연속확률변수(continuous random variable)에서 확률 밀도를 나타내는 함수입니다.

**특징:**
- 연속확률변수에만 적용
- 특정 점에서의 확률은 0
- 구간에 대한 확률은 PDF를 적분하여 계산
- 전체 구간에서의 적분값은 1
- 음수 값이 가능 (단, 확률은 항상 양수)

**수학적 표현:**
$$P(a \leq X \leq b) = \int_a^b f(x) dx$$

**예시:** 정규분포 N(0,1)의 PDF
$$f(x) = \frac{1}{\sqrt{2\pi}} e^{-\frac{x^2}{2}}$$

## 주요 차이점

| 구분 | PMF | PDF |
|------|-----|-----|
| 변수 타입 | 이산 | 연속 |
| 확률 계산 | 직접 값 | 적분 필요 |
| 특정 점 확률 | 양수 가능 | 항상 0 |
| 그래프 | 막대 그래프 | 곡선 |

## np.histogram의 density 파라미터

### density=False (기본값)
- **반환값**: 각 구간(bin)에 속하는 데이터의 **개수(count)**
- **특징**: 
  - 모든 구간의 합이 전체 데이터 개수 N과 같음
  - $\sum_{i} \text{count}_i = N$
- **용도**: 데이터의 분포를 파악할 때

**예시:**
```python
import numpy as np
data = [1, 2, 2, 3, 3, 3, 4, 4, 5]
counts, bins = np.histogram(data, bins=5, density=False)
# counts: [1, 2, 3, 2, 1] (각 구간의 데이터 개수)
# sum(counts) = 9 (전체 데이터 개수)
```

### density=True
- **반환값**: 각 구간의 **확률밀도(probability density)**
- **특징**:
  - 각 구간의 값 × 구간 너비의 합이 1이 됨
  - $\sum_{i} \text{density}_i \times \text{bin\_width}_i = 1$
- **용도**: PDF와 비교하거나 확률 분포를 분석할 때

**예시:**
```python
density, bins = np.histogram(data, bins=5, density=True)
# density: [0.25, 0.5, 0.75, 0.5, 0.25] (확률밀도)
# bin_width = 1.0
# sum(density * bin_width) = 1.0
```

## 수학적 관계

**density=False → density=True 변환:**
$$\text{density}_i = \frac{\text{count}_i}{N \times \text{bin\_width}_i}$$

**density=True → density=False 변환:**
$$\text{count}_i = \text{density}_i \times N \times \text{bin\_width}_i$$

## 언제 사용할까?

- **density=False**: 데이터의 실제 분포, 빈도 분석
- **density=True**: PDF 추정, 다른 분포와 비교, 확률적 분석

---

# Kernel function이란?

수학적으로 원점을 중심으로 Symmetric, 적분값이 1인 Non-Negative function

- **Normalization**:
    $$\int_{-\infty}^{\infty} K(x) dx = 1$$
- **Symmetry**: 
    $$K(-x) = K(x)$$
- **Non-negativity**:
    $$K(x) \geq 0 \text{ for all } x$$

## 주요 Kernel 함수들

<figure>
<img src="/post/DataScience/kernel_functions.png" alt="Kernel functions" />
<figcaption>Kernel functions</figcaption>
</figure>


## Kernel의 역할

Kernel function은 각 데이터 포인트 주변에 "가중치"를 부여하는 역할을 합니다:
- 데이터 포인트가 있는 곳에서는 높은 가중치
- 멀어질수록 가중치가 감소
- 전체적으로 부드러운 PDF 추정을 가능하게 함 


# Density Estimation

> **Density Estimation**은 주어진 데이터로부터 확률밀도함수(PDF)를 추정하는 방법입니다. 데이터의 분포를 파악하고 새로운 데이터가 어디에 위치할 확률이 높은지 예측하는 데 사용됩니다.

## 주요 방법들

### 1. Histogram (히스토그램)
가장 기본적인 방법으로, 데이터를 구간(bin)으로 나누어 각 구간의 빈도를 계산합니다.

**장점:**
- 구현이 간단하고 직관적
- 계산 속도가 빠름

**단점:**
- 구간의 위치와 크기에 민감
- 불연속적이고 부드럽지 않음
- 구간 경계에서 불연속성 발생

### 2. Kernel Density Estimation (KDE)
각 데이터 포인트에 kernel function을 배치하여 부드러운 PDF를 추정합니다.

**수식:**
$$\hat{f}(x) = \frac{1}{nh} \sum_{i=1}^{n} K\left(\frac{x - x_i}{h}\right)$$

여기서:
- $\hat{f}(x)$: 추정된 PDF
- $n$: 데이터 개수
- $h$: bandwidth (대역폭)
- $K(\cdot)$: kernel function
- $x_i$: i번째 데이터 포인트

**장점:**
- 부드럽고 연속적인 PDF 추정
- 데이터의 실제 분포를 잘 반영
- bandwidth 조절로 smoothness 조정 가능

**단점:**
- bandwidth 선택이 중요
- 계산 비용이 상대적으로 높음

### 3. Parametric Methods
특정 분포(예: 정규분포, 지수분포)를 가정하고 모수를 추정합니다.

**예시:**
$$f(x) = \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}}$$

**장점:**
- 계산이 빠름
- 해석이 용이
- 적은 데이터로도 추정 가능

**단점:**
- 분포 가정이 틀리면 부정확
- 복잡한 분포를 잘 표현하지 못함

## 언제 어떤 방법을 사용할까?

- **Histogram**: 빠른 탐색적 분석, 대략적인 분포 파악
- **KDE**: 정확한 PDF 추정, 시각화, 비모수적 분석
- **Parametric**: 분포가 명확할 때, 빠른 계산이 필요할 때

---

# Kernel Density Estimation (KDE)

> "각 데이터 포인트 주변에 작은 언덕(kernel)을 만들고, 이들을 모두 더해서 전체적인 지형(PDF)을 만드는 것"

## KDE 수식

$$\hat{f}(x) = \frac{1}{nh} \sum_{i=1}^{n} K\left(\frac{x - x_i}{h}\right)$$

여기서:
- $\hat{f}(x)$: 추정된 PDF
- $n$: 데이터 개수
- $h$: bandwidth (대역폭). 크기에 따라 kernel의 형태가 조절되는 parameter. scaled kernel이라고도 함.
- $K(\cdot)$: kernel function
- $x_i$: i번째 데이터 포인트


