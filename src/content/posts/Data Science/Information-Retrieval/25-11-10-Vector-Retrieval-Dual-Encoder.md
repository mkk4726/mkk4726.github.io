---
title: "Vector Retrieval: Dual Encoder와 Embedding Space 학습"
date: "2025-11-10"
excerpt: "현대적인 검색 시스템의 핵심인 Dual Encoder 구조와 Embedding Space 학습 방법, 그리고 Hard Negative Mining 전략에 대한 상세 설명"
category: "Information Retrieval"
tags: ["Information Retrieval", "Vector Search", "Dual Encoder", "Embedding", "Machine Learning"]
---

현대적인 검색 시스템(DPR, CLIP, Semantic Search 등)에서 Vector Retrieval 단계는 매우 중요한 역할을 합니다. 특히 Dual Encoder 학습과 Embedding Space 학습 및 정규화는 서로 연결된 핵심 개념으로, 의미적 검색의 품질을 결정짓는 요소입니다.

## Dual Encoder (이중 인코더)

### 기본 개념

Dual Encoder는 Query와 Document(혹은 Item)를 각자 별도의 인코더로 임베딩하고, 두 임베딩 벡터의 유사도(similarity)를 학습하는 구조입니다. 이 방식의 핵심은 Query와 Document를 독립적으로 인코딩할 수 있다는 점입니다.

### 구조

기본적인 Dual Encoder의 구조는 다음과 같습니다. Query Encoder와 Document Encoder가 각각 입력을 받아 벡터로 변환하고, 이 두 벡터 간의 유사도를 계산합니다.

```
[Query Encoder]                [Document Encoder]
   ┌─────────────┐                ┌─────────────┐
   │  "아이폰 15 가격"  │                │  "iPhone 15 price list" │
   └──────┬──────┘                └──────┬──────┘
          │                              │
      [Vector q]                     [Vector d]
          │                              │
          └────── cosine(q, d) ──────────┘
```

이때 두 인코더는 같은 BERT 계열 모델을 weight sharing할 수도 있고, Query와 Document의 성격이 다르면 서로 다른 파라미터로 구성할 수도 있습니다. 실무에서는 데이터의 특성과 도메인에 따라 적절한 방식을 선택합니다.

### 학습 방식

Dual Encoder의 학습은 Contrastive Learning 방식을 따릅니다. 학습 데이터는 크게 두 가지 유형으로 구성됩니다.

Positive pair는 실제로 관련 있는 (query, doc) 쌍이고, Negative pair는 무관한 (query, doc) 쌍입니다. 학습 목표는 다음과 같은 loss function으로 표현됩니다.

$$
L = -\log \frac{e^{\text{sim}(q, d^+)}}{e^{\text{sim}(q, d^+)} + \sum_j e^{\text{sim}(q, d_j^-)}}
$$

이는 positive는 가깝게, negative는 멀게 만드는 Contrastive Loss입니다. 이때 Hard Negative Mining(뒤에서 설명)이 함께 쓰이면 학습 효과가 더욱 향상됩니다.

### 장점

Dual Encoder 방식은 여러 실용적인 장점을 제공합니다.

첫째, 검색 속도가 매우 빠릅니다. 모든 문서 벡터를 미리 계산해두고 ANN(Approximate Nearest Neighbor) 알고리즘(예: FAISS, ScaNN)을 사용하면 실시간 검색이 가능합니다.

둘째, 확장성이 뛰어납니다. Query만 인코딩하면 되므로 대규모 문서 컬렉션에서도 효율적으로 작동합니다.

셋째, 유연성이 높습니다. 텍스트 외에도 이미지, 오디오, 코드 등 멀티모달 데이터에 확장 가능합니다(CLIP 등).

## Embedding Space 학습 및 정규화

Dual Encoder가 만들어내는 것은 결국 공통 벡터 공간(embedding space)입니다. 이 공간에서 의미적으로 비슷한 쿼리와 문서는 가깝게, 관계없는 것들은 멀리 떨어지게 배치됩니다. 이런 거리 기반 의미공간을 Embedding Space라고 부릅니다.

### Embedding Space 학습 과정

Embedding Space 학습은 다음과 같은 단계로 진행됩니다.

먼저 초기화 단계에서 BERT나 Transformer 기반 모델로 문장을 벡터화합니다.

$$
q = f_{\theta_q}(\text{Query}), \quad d = f_{\theta_d}(\text{Document})
$$

다음으로 정규화(Normalization) 단계에서 cosine similarity를 안정적으로 계산하기 위해 L2 정규화를 수행합니다.

$$
\hat{q} = \frac{q}{|q|}, \quad \hat{d} = \frac{d}{|d|}
$$

그 후 유사도를 계산합니다.

$$
\text{sim}(\hat{q}, \hat{d}) = \hat{q} \cdot \hat{d}
$$

마지막으로 Contrastive Loss로 학습하여 같은 의미면 가까이, 다르면 멀리 배치되도록 합니다.

### 정규화의 중요성

정규화는 여러 이유로 필수적입니다.

스케일 안정화 측면에서, 벡터 크기(norm)가 다르면 cosine 값이 왜곡될 수 있습니다. 학습 안정화 측면에서는 gradient 폭주를 방지합니다. 거리 기반 검색을 위해서는 FAISS 등 ANN 엔진에서 거리 계산을 일정하게 유지해야 합니다. 또한 Embedding Space를 2D/3D로 투영할 때 의미적 군집이 잘 보이도록 합니다.

### 의미적 임베딩 공간의 형성

모델은 학습을 통해 의미적 구조를 자동으로 형성합니다. 예를 들어, 가격 관련 쿼리와 문서는 한 클러스터를 형성하고, 출시일 관련 쿼리와 문서는 다른 클러스터를, 리뷰 관련 쿼리와 문서는 또 다른 클러스터를 형성합니다. 이런 구조는 명시적으로 설계하지 않아도 Contrastive Learning을 통해 자연스럽게 나타납니다.

## Hard Negative Mining

Hard Negative Mining은 검색(retrieval)이나 임베딩 학습(특히 Dual Encoder, Contrastive Learning)에서 모델이 헷갈려하는 어려운 부정 예시를 집중적으로 학습시키는 전략입니다.

### 기본 개념

검색 모델은 보통 Query와 Document를 임베딩하고, 이 둘의 유사도를 최대화하거나 최소화하도록 학습합니다.

Positive pair는 쿼리와 실제로 관련 있는 문서입니다. 예를 들어 "아이폰 15 가격"과 "Apple iPhone 15 가격표 페이지"의 조합입니다.

Negative pair는 관련 없는 문서입니다. 예를 들어 "아이폰 15 가격"과 "갤럭시 S24 리뷰"의 조합입니다.

### 문제점과 해결책

학습 초기에는 아무 negative나 사용해도 괜찮지만, 모델이 점점 똑똑해지면 너무 쉬운 네거티브는 도움이 되지 않습니다.

예를 들어 쿼리가 "삼성전자 주가"일 때 네거티브로 "치킨 레시피"를 사용하면, 모델은 이미 이런 것들을 잘 구분합니다. 즉, 모델이 이미 잘 구분하는 예시(easy negatives)는 gradient가 거의 생성되지 않습니다.

Hard negative는 모델이 착각하기 쉬운, 즉 유사하지만 다른 예시입니다. 쿼리가 "아이폰 15 가격"일 때 hard negative는 "아이폰 14 가격", "아이폰 15 출시일", "갤럭시 S24 가격" 등이 될 수 있습니다. 이런 경우 모델이 헷갈리기 때문에 학습 과정에서 훨씬 유용한 신호(gradient)를 제공합니다.

### 학습 과정

Dual Encoder에서 Hard Negative Mining을 활용한 학습 과정은 다음과 같습니다.

먼저 Positive pairs를 준비합니다(query-doc 맞는 짝). 그 다음 Negative sampling을 수행하는데, 이때 Random negative(쉬운 경우)와 Hard negative mining(어려운 경우)을 함께 사용합니다. 마지막으로 Loss를 계산하여(예: InfoNCE loss, Contrastive loss) 모델이 positive는 가까이, hard negative는 멀어지도록 학습합니다.

### Hard Negative 선택 방법

Hard Negative를 고르는 방법은 크게 세 가지가 있습니다.

Offline mining은 BM25나 이전 모델로 미리 hard negative를 찾아두는 방식입니다. 예를 들어 쿼리와 BM25 Top-k 결과 중 실제 정답이 아닌 문서들을 사용합니다.

Online mining은 현재 모델의 embedding 결과를 보고 batch 안에서 hard negative를 선택하는 방식입니다. 현재 배치에서 가장 높은 점수를 받은 잘못된 문서를 사용합니다.

Cross-encoder filtering은 더 강력한 리랭커 모델로 진짜 hard한 것만 추리는 방식입니다. Cross-Encoder가 헷갈려한 Top-N 문서만 선택합니다.

### Embedding Space에서의 효과

Embedding space에서 보면, Query 주변에 Positive가 가깝게 위치하고, Hard Negatives는 Positive와 가까운 위치에서 시작하지만 학습을 통해 멀어집니다. Easy Negatives는 이미 충분히 멀리 떨어져 있습니다.

모델은 이 Hard Negatives를 멀리 떨어뜨리도록 학습하면서, 결국 fine-grained similarity를 더 잘 학습하게 됩니다.

## 대표적인 모델들

Vector Retrieval 분야에서 널리 사용되는 대표적인 모델들이 있습니다.

DPR(Dense Passage Retrieval)은 Facebook AI에서 개발한 QA용 Dual Encoder입니다. Question Answering 태스크에서 관련 문서를 효과적으로 검색합니다.

CLIP(OpenAI)은 이미지-텍스트 매칭용 Dual Encoder로, 멀티모달 검색의 대표적인 사례입니다.

Sentence-BERT(SBERT)는 문장 의미 임베딩용 Dual Encoder로, 문장 간 유사도 계산에 특화되어 있습니다.

SimCSE는 Contrastive 학습으로 자연스러운 문장 임베딩을 생성하며, 특히 unsupervised 방식에서도 좋은 성능을 보입니다.

## 전체 파이프라인

현대적인 검색 시스템은 보통 다단계 파이프라인으로 구성됩니다.

첫 번째 단계는 BM25 같은 전통적인 방법으로 후보를 빠르게 필터링합니다. 두 번째 단계에서 Dual Encoder를 사용해 의미적 유사도 기반으로 재정렬합니다. 마지막 단계에서 Cross Encoder로 정밀한 리랭킹을 수행합니다.

이런 구조는 속도와 정확도의 균형을 맞추면서도, 대규모 문서 컬렉션에서 효율적으로 작동합니다. Dual Encoder는 이 파이프라인에서 의미적 검색의 핵심 역할을 담당하며, Hard Negative Mining을 통해 지속적으로 성능을 개선할 수 있습니다.

## 정리

Vector Retrieval의 핵심은 의미적으로 정렬된 embedding space를 만드는 것입니다. Dual Encoder 구조를 통해 Query와 Document를 독립적으로 인코딩하면서도 같은 공간에 매핑하고, Contrastive Learning과 Hard Negative Mining을 통해 fine-grained한 의미 구분을 학습합니다. 정규화를 통해 안정적인 학습과 효율적인 검색을 가능하게 하며, 최종적으로 FAISS 같은 ANN 엔진을 활용해 실시간 대규모 검색을 구현합니다.

이러한 기술들은 현대 검색 시스템의 기반이 되어, 전통적인 키워드 기반 검색을 넘어 진정한 의미 기반 검색을 가능하게 만들었습니다.

