---
title: "Mid-Ranking: 검색 시스템의 중간 랭킹 단계"
date: "2025-11-10"
category: "Data Science"
tags: ["Information Retrieval", "Ranking", "Search System", "Score Fusion"]
description: "Retrieval과 Re-ranking 사이를 연결하는 Mid-ranking 단계의 역할과 핵심 기술"
---

# Mid-Ranking: 검색 시스템의 중간 랭킹 단계

Mid-ranking 단계는 검색 시스템에서 **"두 세계를 연결하는 다리"** 같은 구간입니다. Retrieval 단계에서 가져온 수천 개의 후보 문서를 Re-ranking 단계에서 세밀하게 점수화하기 전에 중간 필터링, 정규화, 스코어 융합, 도메인 보정을 수행하는 핵심 구간입니다.

## 전체 검색 파이프라인

검색 시스템은 일반적으로 다음과 같은 단계로 구성됩니다:

```
[사용자 쿼리 입력]
   ↓
① Retrieval (BM25 / ANN)  → 빠르게 후보 1~2천 개 추출
   ↓
② Mid-ranking              → 후보 정제 및 점수 융합 (수십~수백 개로 축소)
   ↓
③ Re-ranking               → ML 모델로 정밀한 순위 결정 (Top-k)
   ↓
④ Final Result             → UX·규칙 기반 결과 노출
```

이 중 Mid-ranking은 Retrieval에서 가져온 대량의 후보를 Re-ranking이 처리할 수 있는 적절한 크기로 줄이면서 동시에 여러 검색 소스의 결과를 통합하는 역할을 담당합니다.

## Mid-Ranking의 핵심 역할

Mid-ranking 단계는 다음과 같은 6가지 핵심 역할을 수행합니다:

### 1. 여러 검색 소스 통합

현대 검색 시스템은 단일 검색 방법만 사용하지 않습니다. BM25 같은 전통적인 lexical 검색, Dual Encoder 기반 벡터 검색, 추천 시스템 등 서로 다른 소스의 결과를 하나로 병합해야 합니다. Mid-ranking은 이러한 이질적인 검색 결과를 통합하는 허브 역할을 합니다.

### 2. 스코어 정규화

서로 다른 검색 시스템은 서로 다른 스케일의 점수를 생성합니다. BM25는 0~수십 범위의 점수를, 코사인 유사도는 -1~1 범위의 점수를 생성할 수 있습니다. Mid-ranking에서는 이러한 점수들을 공통 스케일로 맞춰줍니다. 주로 사용되는 정규화 방법은 z-score normalization, min-max scaling, logistic scaling 등이 있습니다.

### 3. 점수 융합 (Score Fusion)

정규화된 점수들을 융합하여 최종 점수를 계산합니다. 가장 기본적인 방법은 가중 합(weighted sum)입니다:

$$
score_{final} = \alpha \times score_{BM25} + \beta \times score_{vector} + \gamma \times score_{boost}
$$

여기서 α, β, γ는 각 검색 방법의 중요도를 나타내는 가중치로, 학습을 통해 찾거나 실험을 통해 튜닝합니다. 이를 통해 전통 검색의 정확도와 임베딩 검색의 의미 검색력을 동시에 활용할 수 있습니다.

### 4. Query Type별 정책 적용

모든 쿼리가 동일한 방식으로 처리되어야 하는 것은 아닙니다. 쿼리의 성격에 따라 다른 전략을 적용할 수 있습니다. 예를 들어 "정확 검색"이 필요한 브랜드명이나 상품명 쿼리는 α를 높이고 β를 낮춰 BM25 점수를 더 중요하게 취급합니다. 반면 "의미 검색"이 필요한 질문형 쿼리는 α를 낮추고 β를 높여 벡터 검색 점수를 더 중요하게 취급합니다.

### 5. 중복 제거 및 품질 필터링

여러 검색 소스에서 같은 문서가 중복으로 들어올 수 있습니다. Mid-ranking에서는 이러한 중복을 제거하고, 품질이 낮은 후보를 필터링합니다. 이를 통해 Re-ranking 단계에서 처리해야 할 후보의 품질을 높입니다.

### 6. Candidate 수 축소

Retrieval 단계에서 가져온 1~2천 개의 후보를 100~300개 정도로 줄여 Re-ranking 단계로 전달합니다. Re-ranking은 일반적으로 복잡한 ML 모델을 사용하므로 계산 비용이 높습니다. Mid-ranking에서 적절히 후보를 축소함으로써 전체 시스템의 효율성을 높입니다.

## 실제 처리 예시

다음은 Mid-ranking이 실제로 어떻게 동작하는지 보여주는 예시입니다:

| 단계 | 입력 | 처리 | 출력 |
|------|------|------|------|
| Retrieval | BM25 상위 1,000개<br>ANN 상위 1,000개 | 두 소스 병합<br>점수 보정 | 300개 후보 |
| Mid-ranking | 300개 후보 | 스코어 융합<br>정규화<br>중복 제거 | 100개 |
| Re-ranking | 100개 | ML 기반 재정렬<br>(LTR, DNN) | 최종 Top 10 결과 |

## Score Fusion의 실제 구현

Score fusion은 Mid-ranking의 핵심 기술입니다. 다음은 실제로 사용되는 융합 전략들입니다:

### Linear Combination (선형 결합)

가장 단순하지만 효과적인 방법입니다:

$$
score_{final} = \alpha \times score_{BM25} + \beta \times score_{vector}
$$

여기서 α + β = 1로 정규화하는 경우가 많습니다.

### Query-Adaptive Fusion

쿼리 타입에 따라 가중치를 동적으로 조정합니다:

```python
if query_type == "exact_match":
    alpha, beta = 0.8, 0.2  # BM25 우선
elif query_type == "semantic":
    alpha, beta = 0.3, 0.7  # Vector 우선
else:
    alpha, beta = 0.5, 0.5  # 균형
```

### Reciprocal Rank Fusion (RRF)

점수 대신 순위를 기반으로 융합하는 방법입니다:

$$
score_{RRF} = \sum_{r \in R} \frac{1}{k + rank_r(d)}
$$

여기서 R은 각 검색 시스템의 결과 리스트이고, k는 일반적으로 60으로 설정됩니다. 이 방법은 점수 정규화가 필요 없다는 장점이 있습니다.

## Mid-Ranking에서 사용하는 주요 기술

### 검색 서버/Infrastructure

- **결과 병합 엔진**: 서로 다른 소스의 결과를 효율적으로 통합
- **스코어 정규화 서비스**: BM25와 Vector 점수의 균형화
- **중복 제거 로직**: 같은 결과가 여러 번 노출되는 것을 방지

### 랭킹/ML 기술

- **Score Fusion 모델**: 가중합 기반 점수 융합
- **Late Fusion 전략**: 중간 단계에서 융합 수행
- **Query-type별 가중치 학습**: 쿼리 분류별로 α, β를 다르게 적용

### 언어처리 (NLP/IR)

- **점수 분포 보정**: 각 검색기의 점수 스케일 조정
- **카테고리/도메인별 규칙**: 상품, 뉴스, 콘텐츠별로 다른 정책 적용

## 정규화 방법 비교

### Min-Max Normalization

$$
score_{norm} = \frac{score - score_{min}}{score_{max} - score_{min}}
$$

장점: 0~1 범위로 명확하게 정규화
단점: outlier에 민감함

### Z-Score Normalization

$$
score_{norm} = \frac{score - \mu}{\sigma}
$$

장점: outlier에 더 robust
단점: 범위가 고정되지 않음

### Logistic Scaling

$$
score_{norm} = \frac{1}{1 + e^{-\lambda(score - \theta)}}
$$

장점: 0~1 범위로 부드럽게 변환
단점: λ와 θ 파라미터 튜닝 필요

## 실무에서의 고려사항

Mid-ranking 단계를 설계할 때 다음 사항들을 고려해야 합니다:

### Latency vs Quality Trade-off

Mid-ranking은 실시간으로 동작해야 하므로 지연 시간이 중요합니다. 너무 복잡한 로직은 사용자 경험을 해칠 수 있습니다. 일반적으로 Mid-ranking은 10~50ms 이내에 완료되어야 합니다.

### 가중치 학습 vs 휴리스틱

α, β 같은 가중치를 학습으로 찾을지 휴리스틱으로 정할지 결정해야 합니다. 초기에는 휴리스틱으로 시작하고, 충분한 데이터가 쌓이면 학습 기반으로 전환하는 것이 일반적입니다.

### A/B 테스트

Mid-ranking 전략의 변경은 최종 검색 품질에 큰 영향을 미칩니다. 새로운 융합 전략을 도입할 때는 반드시 A/B 테스트를 통해 검증해야 합니다.

## 핵심 요약

| 구분 | 내용 |
|------|------|
| **핵심 목적** | 여러 검색 소스의 점수를 통합해 "정렬 가능한 하나의 스코어"로 만드는 단계 |
| **입력** | BM25, Dense Vector, 추천 시스템 결과 |
| **출력** | Re-ranking 모델이 학습할 수 있는 "통합 후보 집합" |
| **핵심 기술** | Score Fusion, Normalization, Query-type Weighting |
| **효과** | 전통 검색 + 의미 검색의 장점을 동시에 활용 |

## 결론

Mid-ranking은 현대 검색 시스템에서 필수적인 구성 요소입니다. 단순히 Retrieval과 Re-ranking 사이의 중간 단계가 아니라, 여러 검색 방법의 장점을 통합하고 최적화하는 핵심 역할을 수행합니다. 적절한 Mid-ranking 전략을 통해 검색 품질을 크게 향상시킬 수 있으며, 동시에 시스템의 효율성도 높일 수 있습니다.

검색 시스템을 구축할 때는 Retrieval과 Re-ranking만큼이나 Mid-ranking 단계에도 충분한 관심과 투자가 필요합니다. 특히 여러 검색 방법을 조합하는 하이브리드 검색 시스템에서는 Mid-ranking의 중요성이 더욱 커집니다.

