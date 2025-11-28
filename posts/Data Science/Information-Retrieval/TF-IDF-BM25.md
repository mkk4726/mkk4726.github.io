---
title: "TF-IDF, BM25 개념 정리하고 코드 구현하지"
date: "2025-11-10"
excerpt: "IR에서 가장 기본적으로 사용되는 관련도 점수 개념 정리하기"
category: "Information Retrieval"
tags: ["IR"]
---

# TF-IDF 란?

DS 처음 공부할 때 배우는 개념.
비슷한 문서를 찾을 때 사용하는 개념. 문서를 어떻게 벡터화 할 것인가? -> 단어의 사용 빈도를 통해 정의하자.
이 말은 "비슷한 단어를 쓰는 문서는 비슷한 문서다" 라는 가정이 포함된 것.

| 시대    | 모델                              | 특징       |
| ----- | ------------------------------- | -------- |
| 1990s | TF-IDF, BM25                    | 단어 빈도 기반 |
| 2010s | word2vec, GloVe                 | 단어 의미 벡터 |
| 2020s | Sentence-BERT, OpenAI Embedding | 문장 의미 벡터 |

## 구현코드 
-> [구현 노트북](/posts/Data%20Science/Information-Retrieval/TF-IDF-BM25-notebook) 참고하기
간단하게 보면 TF (문서에서 단어의 빈도) * IDF ( 1 / 전체 문서에서 나오는 빈도, 패널티항)

이를 통해 문서의 벡터를 구할 수 있음.
단어별로 TF-IDF score가 나오는데, 이게 해당 문서의 벡터.

예시 문서 집합(docs):

```python
docs = {
    "D1": "I love machine learning",
    "D2": "machine learning is powerful",
    "D3": "I love deep learning"
}
```

예시 TF-IDF 행렬:

|     | aihe    | and     | deep    | her     | is      | learning | love    | loves   | machine  | powerful |
|-----|---------|---------|---------|---------|---------|----------|---------|---------|----------|----------|
| D1  | 0.00000 | 0.00000 | 0.00000 | 0.00000 | 0.00000 | 0.42544  | 0.72033 | 0.00000 | 0.54783  | 0.00000  |
| D2  | 0.00000 | 0.00000 | 0.00000 | 0.00000 | 0.58448 | 0.34521  | 0.00000 | 0.00000 | 0.44451  | 0.58448  |
| D3  | 0.43239 | 0.43239 | 0.43239 | 0.43239 | 0.00000 | 0.25537  | 0.00000 | 0.43239 | 0.00000  | 0.00000  |

그리고 쿼리도 벡터화함.

쿼리 예시:  
'I love you'

이 쿼리를 TF-IDF 벡터로 변환한 결과 예시:
{'deep': 0,
 'i': 0.4054651081081644,
 'is': 0,
 'learning': 0,
 'love': 0.4054651081081644,
 'machine': 0,
 'powerful': 0}

- 쿼리에 등장하는 단어(i, love)에 대해서는 각 단어의 IDF 값을 곱해서 벡터 값을 줌
- 쿼리에 없는 단어는 0
- 문서와 동일한 벡터 공간으로 변환한 것임




```python
import math
import pandas as pd

def term_frequency(term: str, doc_text: str) -> int:
    """
    Term Frequency (TF)를 계산합니다.
    문서 내에서 특정 단어가 나타나는 빈도입니다.
    
    Args:
        term: 단어
        doc_text: 문서 텍스트
    
    Returns:
        TF 값 (단어 빈도)
    """
    terms = doc_text.lower().split()
    return terms.count(term.lower())

def inverse_document_frequency(term: str, docs: dict, inverted_index: dict) -> float:
    """
    Inverse Document Frequency (IDF)를 계산합니다.
    전체 문서 집합에서 특정 단어가 나타나는 문서의 역수를 로그로 계산합니다.

    IDF 공식:
        IDF(term) = log(N / df)
        - N: 전체 문서 수 (total_docs)
        - df: 해당 단어를 포함하는 문서 수 (doc_frequency)
    
    Args:
        term: 단어
        docs: 문서 딕셔너리
        inverted_index: 역색인
    
    Returns:
        IDF 값
    """
    total_docs = len(docs)
    
    # 역색인에서 해당 단어가 나타나는 문서 수(df)
    if term.lower() in inverted_index:
        doc_frequency = len(inverted_index[term.lower()])
    else:
        doc_frequency = 0
    
    # IDF 계산: log(전체 문서 수 / 해당 단어를 포함하는 문서 수)
    # 공식: IDF(term) = log(N / df)
    # 분모(df)가 0이 되는 것을 방지하기 위해 0이면 0 반환
    if doc_frequency == 0:
        return 0
    
    return math.log(total_docs / doc_frequency)

def tf_idf(term: str, doc_id: str, docs: dict, inverted_index: dict) -> float:
    """
    TF-IDF 점수를 계산합니다.
    TF * IDF
    
    Args:
        term: 단어
        doc_id: 문서 ID
        docs: 문서 딕셔너리
        inverted_index: 역색인
    
    Returns:
        TF-IDF 점수
    """
    tf = term_frequency(term, docs[doc_id])
    idf = inverse_document_frequency(term, docs, inverted_index)
    return tf * idf

def build_vocabulary(docs: dict) -> list:
    """
    전체 문서 집합에서 단어 사전(vocabulary)을 구축합니다.
    
    Args:
        docs: 문서 딕셔너리
    
    Returns:
        정렬된 단어 리스트 (전체 vocabulary)
    """
    vocabulary = set()
    for doc_text in docs.values():
        terms = doc_text.lower().split()
        vocabulary.update(terms)
    return sorted(vocabulary)

def compute_tf_idf_scores(
    docs: dict,              # 문서 딕셔너리 {doc_id: doc_text}
    inverted_index: dict,    # 역색인 {term: [doc_id, ...]}
    vocabulary: list         # 전체 단어 사전 (정렬된 단어 리스트)
) -> dict:
    """
    모든 문서에 대한 TF-IDF 벡터를 계산합니다.
    전체 vocabulary에 맞춰 벡터를 생성합니다.
    
    Args:
        docs: 문서 딕셔너리
        inverted_index: 역색인
        vocabulary: 전체 단어 사전
    
    Returns:
        TF-IDF 벡터 딕셔너리 {doc_id: {term: tf_idf_score}}
        모든 문서 벡터는 동일한 vocabulary 차원을 가집니다.
    """
    tf_idf_scores = {}
    
    # 모든 문서에 대해
    for doc_id in docs.keys():
        tf_idf_scores[doc_id] = {}
        
        # 전체 vocabulary의 각 단어에 대해
        for term in vocabulary:
            # 해당 문서에 단어가 있으면 TF-IDF 계산, 없으면 0
            tf_idf_scores[doc_id][term] = tf_idf(term, doc_id, docs, inverted_index)
    
    return tf_idf_scores
```

🧩 참고: 실제 프로젝트에서의 차원 수
데이터셋	Vocabulary 크기	비고
뉴스 기사 1만개	50,000~100,000	불용어 제거 시
논문 초록 (AI 분야)	120,000+	technical term 많음
영화 줄거리 (TMDB)	80,000~150,000	일반 단어 + 이름

⚠️ → 너무 커지면 sparse vector (희소 행렬)로 관리해야 합니다.
→ 그래서 scikit-learn도 csr_matrix(Compressed Sparse Row) 형태로 저장해요.

---

# BM25란?
Best Matching 25

> TF-IDF의 한계를 개선한 버전

TF-IDF의 한계점은 뭐가 있지?

1. 긴 문서에 대한 불이익 (문서 길이 정규화 없음)
   - 긴 문서는 단어가 더 많이 등장할 가능성이 높음
   - 같은 단어가 여러 번 나와도 TF가 계속 증가
   - 결과적으로 긴 문서가 검색 결과에서 유리함
   - 예: 1000단어 문서 vs 100단어 문서에서 같은 단어가 5번씩 나와도 긴 문서의 TF가 더 높을 수 있음

2. 단어 반복 효과 과도함 (TF의 선형 증가)
   - TF가 단어 빈도에 비례해 선형적으로 증가
   - 같은 단어가 10번 나오면 TF=10, 100번 나오면 TF=100
   - 실제로는 단어가 몇 번 나오면 충분히 관련성이 표현됨 (포화 현상)
   - 과도한 반복이 점수에 과도하게 반영됨

3. 단어 순서 무시
   - "machine learning"과 "learning machine"을 동일하게 취급
   - 문맥과 의미를 고려하지 않음

4. 동의어/다의어 처리 불가
   - "car"와 "automobile"을 완전히 다른 단어로 취급
   - "bank" (은행)과 "bank" (강둑)을 구분하지 못함

5. 희소성 문제
   - vocabulary가 커지면 대부분의 값이 0인 sparse vector 생성
   - 메모리와 계산 비용 증가

6. 쿼리 길이에 대한 고려 부족
   - 쿼리와 문서를 동일한 방식으로 벡터화하지만, 쿼리는 보통 짧음
   - 긴 쿼리에서 단어가 많아지면 점수가 과도하게 증가할 수 있음

BM25가 개선한 부분은?

1. **문서 길이 정규화(Document Length Normalization)**  
   - BM25는 `b` 파라미터를 도입하여 문서의 길이를 정규화합니다.  
   - 긴 문서일수록 단순히 등장 단어 수가 많다는 이유만으로 점수가 높아지는 현상을 방지합니다.  
   - 평균보다 긴 문서에는 패널티를, 짧은 문서에는 보너스를 주어 공정하게 비교할 수 있도록 설계되어 있습니다.

2. **TF 포화(Term Frequency Saturation)**  
   - BM25는 `k₁` 파라미터를 사용해, 단어 빈도의 영향이 일정 수준 이상에서는 점점 완만해지도록(포화) 만듭니다.  
   - 즉, TF-IDF처럼 단어가 10번, 100번 나오면 점수가 무한히 증가하는 것이 아니라, 일정 횟수 이상 반복되면 점수 증가 폭이 줄어듭니다.
   - 이를 통해 단어가 너무 많이 반복 등장하는 문서가 과도하게 높은 점수를 받는 문제를 완화합니다.

3~6번 한계(단어 순서, 동의어/다의어, 희소성, 쿼리 길이 문제 등)는 BM25도 여전히 가지고 있습니다.  
이 부분은 semantic search, embedding 기반 모델 등에서 추가적으로 개선을 시도합니다.



| 구분           | TF-IDF               | BM25                             |
| ------------ | -------------------- | -------------------------------- |
| **TF 반영**    | 선형 증가 (많이 나오면 계속 커짐) | 포화형 증가 (많이 나와도 어느 수준에서 포화)       |
| **문서 길이 보정** | 없음                   | 있음 (`b` 파라미터로 조정)                |
| **IDF 계산식**  | `log(N/DF)`          | `log((N - DF + 0.5)/(DF + 0.5))` |
| **파라미터**     | 없음                   | `k₁`, `b` (기본값 1.5, 0.75)        |
| **결과**       | 단어가 많은 문서가 유리        | 길이에 따른 균형 유지                     |


문서 $d$와 단어 $t$에 대해:

$$
\mathrm{BM25}(t, d) = \mathrm{IDF}(t) \cdot \frac{f(t, d) \cdot (k_1 + 1)}{f(t, d) + k_1 \cdot (1 - b + b \cdot \frac{|d|}{\mathrm{avgdl}})}
$$

여기서
- $f(t, d)$: 문서 $d$에서의 단어 $t$의 빈도수 (term frequency)
- $|d|$: 문서 $d$의 전체 단어 개수 (문서 길이)
- $\mathrm{avgdl}$: 전체 문서의 평균 길이
- $k_1,\ b$: BM25 파라미터 (보통 $k_1=1.5$, $b=0.75$)
- $\mathrm{IDF}(t) = \log\left(\frac{N - df(t) + 0.5}{df(t) + 0.5} + 1\right)$  
  $N$: 전체 문서 수, $df(t)$: 단어 $t$가 등장한 문서 수

쿼리 $q$와 문서 $d$의 BM25 점수는:

$$
\mathrm{score}(q, d) = \sum_{t \in q} \mathrm{BM25}(t, d)
$$


## TF-IDF vs BM25

계산하는 방식에도 차이가 있네

TF-IDF의 경우:
1. 각 문서를 미리 벡터화해놓음 (문서 벡터)
2. 쿼리가 들어오면 쿼리도 같은 방식으로 벡터화함 (쿼리 벡터)
3. 문서 벡터와 쿼리 벡터의 **코사인 유사도**를 계산
4. 같은 문서라도 **쿼리에 따라 유사도 점수가 달라짐**

BM25의 경우:
1. 문서를 미리 벡터화하지 않음
2. 쿼리가 들어오면 **쿼리의 각 단어**에 대해 각 문서의 BM25 점수를 계산
3. 쿼리 단어들의 BM25 점수를 합산
4. 같은 문서라도 **쿼리에 따라 BM25 점수가 달라짐**

핵심 차이점:

**TF-IDF**: 
- 문서 자체의 벡터는 고정 (쿼리와 무관)
- 하지만 쿼리와의 **유사도**는 쿼리에 따라 변함
- 예: "machine learning" 쿼리 vs "deep learning" 쿼리 → 같은 문서라도 유사도 다름

**BM25**:
- 문서 자체의 고정된 벡터가 없음
- 쿼리가 들어올 때마다 **그 쿼리에 대한** BM25 점수를 계산
- 예: "machine learning" 쿼리 vs "deep learning" 쿼리 → 같은 문서라도 BM25 점수 다름

> 차이점은 TF-IDF는 "문서 벡터 vs 쿼리 벡터의 유사도"를 보는 거고, BM25는 "쿼리 단어들이 이 문서에 얼마나 잘 매칭되는가"를 직접 계산하는 거야.

| 질문                      | 답                                 |
| ----------------------- | --------------------------------- |
| BM25는 쿼리마다 새로 계산해야 하나요? | ✅ 맞아요.                            |
| 그럼 TF-IDF보다 계산 비용이 크죠?  | ✅ 네, 훨씬 큽니다.                      |
| 그런데 왜 BM25를 쓰나요?        | ✅ 현실 검색 품질이 훨씬 좋기 때문입니다.          |
| 실제 서비스에서 느릴까요?          | 🚀 Lucene 엔진이 최적화해서 체감상 ms 단위입니다. |