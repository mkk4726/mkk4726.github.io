---
title: "Collaborative Filtering에 대해 정리"
date: "2025-09-24"
excerpt: "CF에 대해 이해해보자"
category: "Recommendation"
tags: ["CF", "ML"]
---

참고자료
- 1: [수달이가 알려주는 머신러닝](https://ai-with-sudal-ee.tistory.com/6)
- 2: [MATRIX FACTORIZATION TECHNIQUES FOR RECOMMENDER SYSTEMS](https://datajobs.com/data-science-repo/Recommender-Systems-[Netflix].pdf)

---

추천에서 사용되는 기본적인 모델인 CF (collaborative Filtering)에 대해 정리했습니다.

기본적인 추천 알고리즘은 다음처럼 분류해볼 수 있습니다.

1. Collaborative Filtering
    - Memory Based Approach (neighborhood methods)
      - User-based Filtering
      - Item-based Filtering
   - Model Based Approach (latent factor models)
     - Matrix Factorization
2. Contents-Based Filtering

1번과 2번에서 가져가는 컨셉이 다릅니다.
1번은 아이템 혹은 유저 정보 (meta data)를 사용하지 않고 interaction 만으로 추천을 하는 것이고,
2번은 meta data에 기반해 추천을 하는 것입니다. 

> An alternative to content filtering relies only on past user behavior - for example, previous transactions or product ratings - without requiring the creation of explicit profiles.
> (출처: 참고 2)

CF는 크게 neighborhood methods와 latent factor models로 구분할 수 있습니다.
이웃을 찾아주는 컨셉은 매력적이지만 sparsity와 scalability 문제에 취약합니다.
이러한 부분을 보완하기 위해 latent factor을 모델링하는 MF가 도입되었다고 생각할 수 있습니다.

CF는 content-based 보다 더 정확하고 "domain free" 한 좋은 방법이지만, cold-start에는 취약한 문제가 있습니다. 

---

# Neighborhood Methods

사용자와 아이템의 interation (구매, 클릭, 시청 등) 을 바탕으로 유사한 유저 혹은 아이템을 추천하는 방법입니다.

이 모델의 핵심 아이디어는 다음과 같습니다.
- 비슷한 취향을 가진 사람은 비슷한 아이템을 좋아할 것이다 (user-based)
- 비슷한 아이템은 비슷한 사용자들에게 선택될 것이다 (item-based)

<figure>
<img src="./images/item-user-cf.png" alt="item-user-cf" width="100%" />
<figcaption>그림1. item-based와 user-based의 차이 (출처 :  참고1)</figcaption>
</figure>

---

## User-based Filtering

취향이 "비슷한" 혹은 "유사한" 사람을 찾는 문제를, 유저를 벡터로 표현하고, 비슷한 벡터를 찾는 문제로 생각해볼 수 있습니다.

나의 취향을 아이템을 선택 혹은 평가하는 패턴으로 정의할 수 있습니다.
영화 데이터라면, 각 유저는 아이템들에 대한 평점을 나타내는 벡터를 가집니다.
이 벡터가 유저의 취향을 표현하고 있다고 이해할 수 있습니다.

- User A: [영화1: 5점, 영화2: 3점, 영화3: 0점(미평가), ...]
- User B: [영화1: 4점, 영화2: 2점, 영화3: 5점, ...]

두 유저 간의 유사도는 주로 다음 두 가지 방법을 통해 정의할 수 있습니다.

1. Cosine Similarity

$$
sim(A, B) = \frac{A \cdot B}{||A|| \times ||B||} = \frac{\sum_{i=1}^{n} A_i \times B_i}{\sqrt{\sum_{i=1}^{n} A_i^2} \times \sqrt{\sum_{i=1}^{n} B_i^2}}
$$

2. Pearson Correlation Coefficient (더 일반적)

$$
sim(A, B) = \frac{\sum_{i=1}^{n} (A_i - \bar{A})(B_i - \bar{B})}{\sqrt{\sum_{i=1}^{n} (A_i - \bar{A})^2} \times \sqrt{\sum_{i=1}^{n} (B_i - \bar{B})^2}}
$$

여기서 $\bar{A}, \bar{B}$는 각 유저의 평균 평점입니다.

### 두 방법의 차이점

**Cosine Similarity**:
- 원점에서의 각도만 고려
- 절대적인 평점 값에 민감
- 스케일 차이는 제거하지만 bias는 반영

**Pearson Correlation**:
- 각 유저의 평균 평점을 고려 (평점 bias 제거)
- 한 유저가 전반적으로 높은 평점을 주는 성향을 보정
- 상대적인 선호도 패턴만 비교

**실무에서는 Pearson Correlation이 더 많이 사용된다고 합니다.** 
이유는 사용자마다 평점을 주는 기준이 다르기 때문입니다. 예를 들어, 한 사용자는 5점 만점에 4-5점을 주는 성향이 있고, 다른 사용자는 1-3점을 주는 성향이 있다면, cosine similarity는 이를 제대로 반영하지 못하지만 Pearson correlation은 이러한 개인적 bias를 제거하고 순수한 취향 패턴만 비교합니다.

### 단점과 한계점

Collaborative Filtering은 강력한 추천 방법이지만 다음과 같은 한계점들을 가지고 있습니다:

**1. Cold Start Problem (콜드 스타트 문제)**
새로운 사용자가 시스템에 가입했을 때, 아직 평점 데이터가 없어서 추천을 할 수 없는 문제입니다. 또한 새로운 아이템이 추가되었을 때, 아직 아무도 평가하지 않아서 추천 시스템에 포함되지 않는 문제도 있습니다.

**2. Sparsity Problem (희소성 문제)**
실제 데이터에서는 사용자-아이템 평점 행렬이 매우 희소합니다. 예를 들어, Netflix에서 사용자는 전체 영화의 1% 정도만 시청합니다. 이로 인해 유사한 사용자나 아이템을 찾기 어렵고, 유사도 계산이 부정확해져 추천 품질이 저하됩니다.

**3. Popularity Bias (인기도 편향)**
CF는 인기 있는 아이템을 더 자주 추천하는 경향이 있습니다. 인기 있는 아이템은 더 많은 사용자가 평가하므로 유사도 계산에 더 많이 포함되고, 결과적으로 롱테일(Long Tail) 아이템들은 추천받기 어려워 다양성이 부족해집니다.

**4. Scalability Issues (확장성 문제)**
User-based CF는 사용자 수가 증가할수록 계산 복잡도가 O(m²)로 증가하고, Item-based CF는 아이템 수가 증가할수록 계산 복잡도가 O(n²)로 증가합니다. 실시간 추천이 필요한 대규모 서비스에서는 성능상 문제가 될 수 있습니다.

**5. Gray Sheep Problem (회색 양 문제)**
모든 사용자와 평균적인 유사도를 보이는 사용자들은 추천을 받기 어려운 문제입니다. 너무 일반적인 취향을 가져서 특별히 유사한 사용자 그룹을 찾기 어려운 경우입니다.

**6. Data Quality 의존성**
CF의 성능은 입력 데이터의 품질에 크게 의존합니다. 잘못된 평점 데이터, 봇이나 가짜 계정의 평점, 시간에 따른 취향 변화 미반영 등의 문제가 추천 품질에 직접적인 영향을 미칩니다.

이러한 한계점들 때문에 현대 추천 시스템에서는 CF와 콘텐츠 기반 필터링, 딥러닝 모델 등을 조합한 하이브리드 추천 시스템을 많이 사용합니다.

---

## Item-based Filtering

유저 기반 필터링에는 여러 한계점이 존재했는데, 그 중 확장성 문제가 가장 치명적입니다.
유저가 많다면 계산 비용이 너무 높아져서 실시간 추천이 어려워집니다. 이를 해결하기 위해 등장한 것이 **Item-based Collaborative Filtering** 입니다.

user-based filtering과 똑같은 컨셉입니다. 다만 비슷한 아이템을 추천하는 것이 목적입니다.
Item-based CF는 "비슷한 아이템은 비슷한 사용자들에게 선택될 것이다"라는 아이디어를 바탕으로 벡터를 정의합니다.
그림1에서 그 차이를 살펴볼 수 있습니다.

item-based는 user-based에 비해 확장성이 보장됩니다.
- 유저의 수 >>> 아이템의 수 -> 계산 비용자체가 적음
- 미리 계산해놓고 (오프라인에서) 추천에 사용할 수 있음

하지만 여전히 cold start나 sparsity에 취약하다는 한계점이 존재합니다.

### 왜 아이템 간 유사도는 미리 계산할 수 있을까?

**아이템의 특성은 상대적으로 안정적** 이기 때문입니다. 구체적인 이유들을 살펴보면:

**1. 아이템의 속성 변화가 적음**
- CF에서는 meta data를 사용하지 않고 오직 사용자-아이템 상호작용(평점, 클릭 등)만으로 유사도를 계산합니다
- 아이템 자체의 특성이 변하지 않으므로, 사용자들의 상호작용 패턴도 상대적으로 안정적입니다
- 따라서 아이템 간의 유사도도 상대적으로 안정적입니다

**2. 아이템 수가 사용자 수보다 적음**
- 일반적으로 아이템 수 < 사용자 수입니다
- 예: Netflix 영화 10만 편 vs 사용자 2억 명
- 적은 수의 아이템 간 유사도만 미리 계산하면 됩니다

**3. 계산 결과 재사용 가능**
- 아이템 A와 아이템 B의 유사도는 모든 사용자에게 동일하게 적용됩니다
- 한 번 계산하면 모든 사용자의 추천에 활용할 수 있습니다

**반면 사용자 간 유사도는 왜 미리 계산하기 어려울까?**

**사용자의 취향은 자주 변합니다**:
- 새로운 영화를 보고 취향이 바뀔 수 있습니다
- 시간이 지나면서 관심사가 달라집니다
- 계절, 상황에 따라 선호도가 변합니다

**사용자 수가 매우 많습니다**:
- 새로운 사용자가 계속 가입합니다
- 사용자 간 유사도 계산량이 기하급수적으로 증가합니다

따라서 Item-based CF에서는 아이템 간 유사도를 **오프라인에서 미리 계산**해두고, 사용자가 추천을 요청할 때 **이미 계산된 유사도만 불러와서** 빠르게 추천할 수 있습니다.

---

# Latent Factor Model (Matrix Factorization)

Matrix Factorization는 Collaborative Filtering의 한계점을 극복하기 위해 등장한 모델 기반 접근법입니다. 

기존 CF의 주요 한계점으로는 사용자-아이템 평점 행렬의 극심한 희소성(sparsity)으로 인한 유사도 계산의 부정확성, 사용자나 아이템 수 증가에 따른 계산 복잡도의 기하급수적 증가(scalability 문제), 그리고 인기 아이템에 편향되어 추천 다양성이 부족한 문제 등이 있었습니다. 

이 방법은 넷플릭스에서 2006년부터 2009년까지 진행된 **Netflix Prize** 대회를 통해 주목받기 시작했습니다.

## Netflix Prize와 Matrix Factorization

넷플릭스는 2006년 사용자 평점 예측 정확도를 개선하기 위해 Netflix Prize 대회를 개최했습니다. 상금은 100만 달러였고, 당시 넷플릭스의 추천 시스템 Cinematch보다 RMSE를 10% 이상 개선하면 우승할 수 있었습니다. 

이 대회에서 우승한 방법이 바로 **Matrix Factorization** 이었습니다. 
우승팀은 여러 모델을 앙상블했지만, 그 핵심은 SVD(Singular Value Decomposition)를 기반으로 한 Matrix Factorization이었습니다.

## 기본 아이디어

Matrix Factorization의 핵심 아이디어는 **사용자-아이템 평점 행렬을 두 개의 낮은 차원의 행렬로 분해** 하는 것입니다.

$$
R \approx P \times Q^T
$$

여기서:
- $R$: 사용자-아이템 평점 행렬 (User × Item)
- $P$: 사용자 잠재 요인 행렬 (User × Latent Factors)  
- $Q$: 아이템 잠재 요인 행렬 (Item × Latent Factors)

### 직관적 이해

이 방법을 직관적으로 이해해보면:

**사용자와 아이템을 모두 잠재 공간(latent space)에서 벡터로 표현** 합니다. 
예를 들어, 영화 추천에서 잠재 요인이 "액션", "로맨스", "코미디" 등의 장르라고 생각해볼 수 있습니다.

- 사용자 벡터: 해당 사용자가 각 장르를 얼마나 선호하는지
- 아이템 벡터: 해당 아이템이 각 장르에 얼마나 속하는지

두 벡터의 내적(dot product)이 사용자가 해당 아이템에 줄 평점이 됩니다.

### 장점

**1. Sparsity 문제 해결**
- 희소한 평점 행렬을 저차원의 조밀한 행렬로 변환
- 관찰되지 않은 평점도 예측 가능

**2. 확장성**
- 메모리 기반 CF 대비 계산 효율성 향상
- 실시간 추천 가능

**3. 일반화 성능**
- 과적합 방지
- 노이즈에 강함

### 한계점

**1. Cold Start 문제는 여전히 존재**
- 새로운 사용자나 아이템에 대한 추천 어려움

**2. 해석 가능성 부족**
- 잠재 요인의 의미를 명확히 해석하기 어려움

**3. 선형 관계 가정**
- 복잡한 비선형 관계는 포착하지 못함

Matrix Factorization는 현대 추천 시스템의 기초가 되는 중요한 방법론이며, 이후 등장한 딥러닝 기반 추천 모델들의 토대가 되었습니다.


---

## Latent Factor를 학습하는 방법

Matrix Factorization에서 잠재 요인을 학습하는 방법에는 크게 두 가지 접근법이 있습니다.

### 1. SVD 기반 접근법 (Classical SVD)

전통적인 Singular Value Decomposition을 사용하는 방법입니다.

**장점:**
- 수학적으로 정확한 분해 결과
- 전역 최적해 보장
- 잘 정립된 수학적 이론

**단점:**
- 결측값(missing values) 처리 불가
- 실제 추천 시스템 데이터는 대부분 희소하므로 직접 적용 어려움
- 계산 복잡도가 높음

### 2. SGD 기반 접근법 (Stochastic Gradient Descent)

최적화 문제로 접근하여 경사하강법으로 잠재 요인을 학습하는 방법입니다.

**목적 함수:**

$$
\min_{P,Q} \sum_{(u,i) \in K} (r_{ui} - p_u^T q_i)^2 + \lambda(||p_u||^2 + ||q_i||^2)
$$

여기서:
- $K$: 관찰된 평점들의 집합
- $r_{ui}$: 사용자 u가 아이템 i에 준 실제 평점
- $p_u$: 사용자 u의 잠재 요인 벡터
- $q_i$: 아이템 i의 잠재 요인 벡터
- $\lambda$: 정규화 파라미터 (과적합 방지)

**학습 과정:**
1. P와 Q를 랜덤하게 초기화
2. 관찰된 평점 데이터에 대해 반복:
   - 예측 오차 계산: $e_{ui} = r_{ui} - p_u^T q_i$
   - 경사하강법으로 파라미터 업데이트:
     - $p_u \leftarrow p_u + \alpha(e_{ui} \cdot q_i - \lambda \cdot p_u)$
     - $q_i \leftarrow q_i + \alpha(e_{ui} \cdot p_u - \lambda \cdot q_i)$

**장점:**
- 결측값 자연스럽게 처리 가능
- 계산 효율성이 높음
- 대규모 데이터에 적합
- 다양한 정규화 기법 적용 가능
- 실무에서 널리 사용됨

**단점:**
- 지역 최적해에 빠질 가능성
- 하이퍼파라미터 튜닝 필요
- 수렴성 보장 어려움

### 실무에서의 선택

실제 추천 시스템에서는 **SGD 기반 접근법** 이 더 널리 사용됩니다. 이유는 실제 사용자-아이템 평점 행렬이 극도로 희소하기 때문에 전통적인 SVD를 직접 적용하기 어렵고, SGD 방법이 결측값을 자연스럽게 처리하면서도 계산 효율성을 제공하기 때문입니다.

Netflix Prize에서 우승한 팀도 SGD 기반의 Matrix Factorization을 핵심으로 사용했으며, 이후 많은 상용 추천 시스템에서 이 방법을 채택하고 있습니다.