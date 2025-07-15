---
title: "User-Based Collaborative Filtering"
date: "2025-07-15"
excerpt: "User-Based Collaborative Filtering 알고리즘에 대한 설명"
category: "Recommendation"
tags: ["추천시스템"]
---


# User-Based Collaborative Filtering (사용자 기반 협업 필터링)

## 개요

User-Based Collaborative Filtering은 추천 시스템에서 가장 오래되고 직관적인 이웃(neighborhood) 기반 방법입니다. 핵심 아이디어는 **"비슷한 취향을 가진 사용자들이 비슷한 아이템을 좋아할 것이다"** 라는 가정에 기반합니다.

## 기본 개념

- **사용자-아이템 평점 행렬 $R$**: 행은 사용자, 열은 아이템
- **원소 $r_{u,i}$**: 사용자 $u$가 아이템 $i$에 매긴 평점 (또는 암시적 행동)
- **목표**: 사용자 $u$에게 아이템 $i$를 추천할지 결정

## 알고리즘 절차

### 1. 유사도(Similarity) 계산

사용자 간 유사도를 계산하는 방법들:

#### Cosine Similarity
$$\text{sim}(u,v) = \frac{\mathbf{r}_u \cdot \mathbf{r}_v}{\|\mathbf{r}_u\| \times \|\mathbf{r}_v\|}$$

#### Pearson Correlation
$$\text{sim}(u,v) = \frac{\sum_{i \in I_{uv}} (r_{u,i} - \bar{r}_u)(r_{v,i} - \bar{r}_v)}{\sqrt{\sum_{i \in I_{uv}} (r_{u,i} - \bar{r}_u)^2} \times \sqrt{\sum_{i \in I_{uv}} (r_{v,i} - \bar{r}_v)^2}}$$

여기서 $I_{uv}$는 두 사용자가 모두 평가한 아이템 집합

#### Adjusted Cosine Similarity
$$\text{sim}(u,v) = \frac{\sum_{i \in I_{uv}} (r_{u,i} - \bar{r}_i)(r_{v,i} - \bar{r}_i)}{\sqrt{\sum_{i \in I_{uv}} (r_{u,i} - \bar{r}_i)^2} \times \sqrt{\sum_{i \in I_{uv}} (r_{v,i} - \bar{r}_i)^2}}$$

여기서 $\bar{r}_i$는 아이템 $i$의 평균 평점

### 2. Top-K 이웃 선택

사용자 $u$와 유사도가 가장 높은 $K$명의 사용자 이웃 집합 $N_u$ 선택

### 3. 평점 예측 / 추천 점수 계산

#### 가중 평균 방식
$$\hat{r}_{u,i} = \bar{r}_u + \frac{\sum_{v \in N_u} \text{sim}(u,v) \times (r_{v,i} - \bar{r}_v)}{\sum_{v \in N_u} |\text{sim}(u,v)|}$$

#### 단순 가중합 방식
$$\hat{r}_{u,i} = \frac{\sum_{v \in N_u} \text{sim}(u,v) \times r_{v,i}}{\sum_{v \in N_u} |\text{sim}(u,v)|}$$

### 4. 추천 리스트 생성

아직 소비하지 않은 아이템 중 $\hat{r}_{u,i}$가 높은 순으로 $N$개 반환

## 장점

1. **직관성**: 구현이 간단하고 이해하기 쉬움
2. **New Item Cold-Start 대응**: 새로운 아이템이 들어와도 비슷한 사용자가 평가했다면 곧바로 추천 가능
3. **미묘한 패턴 포착**: 사용자 선호의 세밀한 패턴을 이웃 기반으로 포착 가능
4. **해석 가능성**: 왜 이 아이템을 추천했는지 설명 가능

## 단점

1. **희소성(Sparsity)**: 평점 행렬이 희소하면 공통 평가 아이템이 적어 유사도 계산이 불안정
2. **확장성(Scalability)**: 사용자 수가 늘어날수록 전체 유사도 계산 비용 $O(|U|^2)$
3. **사용자 Cold-Start**: 새 사용자는 평점이 없어 추천 불가
4. **Popularity Bias**: 많은 평점을 남긴 헤비 유저에게 유사도가 집중될 수 있음
5. **Gray Sheep 문제**: 독특한 취향을 가진 사용자는 유사한 이웃을 찾기 어려움

## 개선 기법

### 1. Significance Weighting
공통 평가 아이템 수가 적으면 유사도에 패널티 부여

### 2. Neighborhood Size 최적화
- $K$값 튜닝
- 유사도 threshold 설정

### 3. 정규화 및 보정
- Normalization (평균·표준편차 제거)
- Shrinkage
- Baseline 보정 (글로벌 평균 + user bias + item bias)

### 4. Hybrid 접근법
- 사용자 기반 CF + 아이템 기반 CF 결합
- 콘텐츠 기반 특징과 결합
- 모델 기반(행렬 분해)과 스위칭

## 아이템 기반 CF와 비교

| 구분 | User-Based CF | Item-Based CF |
|------|---------------|---------------|
| **가정** | 비슷한 사용자가 비슷한 아이템을 좋아함 | 비슷한 아이템을 소비한 사용자는 향후 비슷한 아이템을 소비 |
| **적합한 상황** | 사용자 행동이 풍부하고 맞춤형 관계 파악 필요 | 대량 사용자, 상대적으로 적은 아이템 |
| **확장성** | 사용자 수에 따라 성능 저하 | 아이템 수에 따라 성능 저하 |
| **Cold-Start** | New Item에 강함, New User에 약함 | New User에 강함, New Item에 약함 |

## 구현 시 고려사항

### 1. 라이브러리 활용
- **Scikit-surprise**: 다양한 CF 알고리즘 지원
- **Implicit**: 암시적 피드백 기반 CF
- **LightFM**: 하이브리드 모델

### 2. 성능 최적화
- **오프라인 계산**: 유사도 행렬을 미리 계산하여 캐시
- **샘플링**: 대규모 데이터에서 랜덤 샘플링으로 계산량 감소
- **Locality Sensitive Hashing**: 근사 유사도 계산으로 속도 향상

### 3. 실시간 처리
- 주기적 재계산 + 캐시로 대응
- 증분 업데이트 방식 고려

### 4. A/B 테스트
- $K$값, 유사도 종류, 정규화 방식 튜닝
- 추천 품질과 성능 간 균형점 찾기

## Python 구현 예시

```python
import numpy as np
from scipy.spatial.distance import cosine
from scipy.stats import pearsonr

class UserBasedCF:
    def __init__(self, k=10):
        self.k = k
        self.user_similarities = None
        
    def fit(self, ratings_matrix):
        """사용자 유사도 행렬 계산"""
        n_users = ratings_matrix.shape[0]
        self.user_similarities = np.zeros((n_users, n_users))
        
        for i in range(n_users):
            for j in range(i+1, n_users):
                # 공통 평가 아이템 찾기
                common_items = np.where((ratings_matrix[i] != 0) & 
                                      (ratings_matrix[j] != 0))[0]
                
                if len(common_items) < 2:
                    similarity = 0
                else:
                    # Pearson correlation 계산
                    user_i_ratings = ratings_matrix[i, common_items]
                    user_j_ratings = ratings_matrix[j, common_items]
                    
                    try:
                        similarity, _ = pearsonr(user_i_ratings, user_j_ratings)
                        if np.isnan(similarity):
                            similarity = 0
                    except:
                        similarity = 0
                
                self.user_similarities[i, j] = similarity
                self.user_similarities[j, i] = similarity
    
    def predict(self, user_id, item_id, ratings_matrix):
        """특정 사용자의 특정 아이템 평점 예측"""
        if self.user_similarities is None:
            raise ValueError("Model must be fitted first")
        
        # 사용자의 평균 평점
        user_ratings = ratings_matrix[user_id]
        user_mean = np.mean(user_ratings[user_ratings != 0])
        
        # 이웃 사용자들 찾기
        similarities = self.user_similarities[user_id]
        neighbors = np.argsort(similarities)[::-1][1:self.k+1]
        
        numerator = 0
        denominator = 0
        
        for neighbor in neighbors:
            if similarities[neighbor] <= 0:
                continue
                
            neighbor_rating = ratings_matrix[neighbor, item_id]
            if neighbor_rating == 0:
                continue
                
            neighbor_mean = np.mean(ratings_matrix[neighbor][ratings_matrix[neighbor] != 0])
            
            numerator += similarities[neighbor] * (neighbor_rating - neighbor_mean)
            denominator += abs(similarities[neighbor])
        
        if denominator == 0:
            return user_mean
        
        predicted_rating = user_mean + (numerator / denominator)
        return max(1, min(5, predicted_rating))  # 평점 범위 제한
```

## 결론

User-Based CF는 추천 시스템의 기본이 되는 직관적이고 효과적인 방법입니다. 하지만 데이터 희소성과 확장성 한계로 인해, 대규모 서비스에서는 다른 기법(아이템 기반, 행렬 분해, 딥러닝)과 결합하여 사용하는 것이 일반적입니다.

실제 적용 시에는 비즈니스 도메인, 데이터 특성, 성능 요구사항을 종합적으로 고려하여 적절한 하이브리드 접근법을 선택하는 것이 중요합니다.

---

**참고 자료:**
- [Collaborative Filtering for Implicit Feedback Datasets](https://ieeexplore.ieee.org/document/4781121)
- [Item-based collaborative filtering recommendation algorithms](https://dl.acm.org/doi/10.1145/371920.372071)
- [Matrix Factorization Techniques for Recommender Systems](https://ieeexplore.ieee.org/document/5197422) 