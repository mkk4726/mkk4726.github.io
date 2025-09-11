---
title: "PCA에 대해 정리"
date: "2025-09-10"
excerpt: "PCA란 무엇인가"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1 : [Lee, MinYe 블로그](https://minye-lee19.gitbook.io/sw-engineer/business-analytics/class/pca)

---

PCA는 dimension reduction을 하기 위한 방법.
dimension reduction의 목적은 정보를 최대한 보존하면서 축을 줄이는 것이다.

"정보"를 어떻게 정의하는지에 따라 다양한 방법들이 존재한다.

PCA에서는 "분산"을 "정보의 양"이라고 정의하고, 분산이 최대한 보존되는 축을 찾는 것을 목표로 한다.

목표가 다르다면 다른 방법을 써야 함.

<figure>
<img src="/post/DataScience/LDA.png" alt="LDA" width="100%" />
<figcaption>그림1. LDA 예시 그림</figcaption>
</figure>

---

> 이번 장에서 소개해드리는 변수 추출 방법인 PCA 는 데이터의 분산을 데이터의 특성으로 정의하고 이를 최대한 보존하기 위한 방법론 입니다. 
> PCA 는 특정 기저에 모든 데이터를 사영되었을 시, 사영된 데이터의 퍼진 정도가 최대인 기저를 찾습니다. (참고 1)

<figure>
<img src="/post/DataScience/PCA.png" alt="PCA" width="100%" />
<figcaption>그림2. PCA 예시 그림</figcaption>
</figure>

$$
\max_w w^T S w, \quad \text{s.t.} \quad w^T w = 1 \tag{1}
$$
- $S$ : covariance matrix
- $w^T w = 1 $ : 단위 벡터로 제한하여 방향에만 집중

이 최적화 문제의 해는 **eigenvalue decomposition**을 통해 구할 수 있다.

## Eigenvalue와 Eigenvector

공분산 행렬 $S$에 대해 다음을 만족하는 벡터 $v$와 스칼라 $\lambda$가 존재한다:

$$
S v = \lambda v \tag{2}
$$

여기서:
- $v$: **eigenvector** (고유벡터)
- $\lambda$: **eigenvalue** (고유값)

## PCA와 Eigenvalue의 연결

수식 (1)에서 $w$는 우리가 찾고자 하는 방향 벡터(변수)이고, 이 최적화 문제의 **해 $w^*$가 바로 공분산 행렬 $S$의 eigenvector**가 된다.

구체적으로:
- **$w$**: 최적화 문제의 변수 (방향 벡터)
- **$w^*$**: 최적해 = $S$의 가장 큰 eigenvalue에 해당하는 eigenvector

즉, 분산을 최대화하는 방향은 데이터의 주된 변동 방향과 일치하며, 이는 공분산 행렬의 첫 번째 eigenvector로 구할 수 있다.

## Eigenvector의 의미

**Eigenvector는 기존 축의 선형조합이 아니라, 새로운 좌표계의 축**이다.

예를 들어, 2차원 데이터 $(x_1, x_2)$가 있을 때:
- **기존 축**: $x_1$축, $x_2$축 (원래 좌표계)
- **Eigenvector**: $v_1 = [a, b]^T$, $v_2 = [c, d]^T$ (새로운 좌표계의 축)

PCA는 기존 데이터를 이 새로운 eigenvector 축들로 **투영(projection)**시키는 것이다.

$$
\begin{bmatrix} x_1' \\ x_2' \end{bmatrix} = \begin{bmatrix} a & c \\ b & d \end{bmatrix}^T \begin{bmatrix} x_1 \\ x_2 \end{bmatrix}
$$

여기서:
- $(x_1, x_2)$: 기존 좌표계에서의 원본 데이터
- $(x_1', x_2')$: 새로운 eigenvector 좌표계로 투영된 데이터
- 투영 과정: 원본 데이터를 eigenvector 방향으로 사영하여 새로운 좌표를 얻음



## 최적화 과정: Lagrangian Multiplier

수식 (1)의 제약조건이 있는 최적화 문제를 풀기 위해 **Lagrangian Multiplier**를 사용한다.

### Lagrangian 함수

$$
L = w^T S w - \lambda(w^T w - 1) \tag{3}
$$

여기서:
- $w$: 최적화 변수 (방향 벡터)
- $\lambda$: Lagrangian multiplier
- $w^T w - 1 = 0$: 제약조건 (벡터의 크기가 1)

### 최적화 조건

$w$에 대해 편미분하여 0으로 놓으면:

$$
\frac{\partial L}{\partial w} = 0 \Rightarrow 2Sw - 2\lambda w = 0
$$

$$
(S - \lambda I)w = 0 \tag{4}
$$

### Eigenvalue 문제로 변환

수식 (4)는 정확히 **eigenvalue 문제** $S w = \lambda w$와 동일하다!

따라서:
- **최적해 $w^*$**: 공분산 행렬 $S$의 eigenvector
- **최적값**: 해당 eigenvector의 eigenvalue

### 결론

분산을 최대화하는 방향 $w^*$는 공분산 행렬 $S$의 **가장 큰 eigenvalue에 해당하는 eigenvector**이다.