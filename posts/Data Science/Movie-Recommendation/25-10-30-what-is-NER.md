---
title: "NER이란 뭘까? 개념 빠르게 익혀보자"
date: "2025-10-30"
excerpt: "Named Entity Recognition에 대해 정리"
category: "Data Science"
tags: ["Movie-Recommendation"]
---

검색엔진에서 유용하게 사용할 수 있는 도구처럼 느껴진다.
쿼리에서 엔티티를 추출한다니.

---

## 1. 엔티티란?

문장 속에서 고유한 의미를 가지는 이름 있는 단위

| 유형                     | 설명         | 예시          |
| ---------------------- | ---------- | ----------- |
| **PER (Person)**       | 사람 이름      | 이병헌, BTS    |
| **LOC (Location)**     | 지명, 나라, 도시 | 서울, 미국, 부산  |
| **ORG (Organization)** | 기관, 회사, 단체 | 삼성전자, 넷플릭스  |
| **DATE**               | 날짜, 연도     | 2025년, 어제   |
| **TIME**               | 시간         | 오후 3시       |
| **MONEY**              | 금액         | 30만 원, $10  |
| **PERCENT**            | 퍼센트        | 25%         |
| **PRODUCT**            | 제품 이름      | 아이폰 15, 소나타 |
| **EVENT**              | 행사, 사건     | 월드컵, WWDC   |


이를 통해 문장을 "구조적"으로 이해할 수 있게 됨.

---

그렇다면 이게 어떻게 가능한거지?

## 2. 학습되는 원리, 모델 구조

| 문장                | 토큰 라벨                 |
| ----------------- | --------------------- |
| 이병헌은 부산에서 영화를 찍었다 | B-PER O B-LOC O O O O |

엔티티를 토큰으로 정의하고, 정확히는 토큰 중 엔티티에 해당하는 걸 엔티티 토큰으로 정의하고 맞추는 문제 푸는구나.

<figure>
  <img src="/post/Recommendation/BERT_for_NER.png" alt="BERT 기반 NER 구조도" style="max-width: 500px; width: 100%; border: 1px solid #eee;">
  <figcaption>
    <b>BERT를 이용한 NER(개체명 인식) 예시 구조</b><br>
    입력 문장이 토큰화되어 임베딩되고, 각 토큰별로 엔티티(Label)를 예측하는 구조.<br>
    <span style="color: gray; font-size: 0.95em;">
      (이미지 출처: https://vamvas.ch/bert-for-ner)
    </span>
  </figcaption>
</figure>

위 그림같은 모델 구조.

---

## 3. 사용할 수 있는 모델은 뭐가 있지? 

AI 시켜서 정리함.


## ✅ 성능 지표

한국어 NER을 평가할 만한 벤치마크 중 대표적인 건 **KLUE** 벤치마크야. ([OpenReview][1])

* KLUE의 NER 태스크에서는 entity-level macro-F1, character-level macro-F1 같은 지표를 사용해. ([Medium][2])
* baseline 결과 예시: 예컨대 KLUE-benchmark 레포지토리에 따르면 `koELECTRA-base` 같은 모델이 NER 태스크에서 F1 점수가 **약 86.11** 등으로 나오는 항목이 있어. ([GitHub][3])
* 또 mBERT-base, XLM-R-base, KR-BERT-base 같이 여러 사전학습 언어 모델들도 비교대상으로 올라와 있어. ([GitHub][3])

즉 “쓸 만한 수준”이냐 하면 — 네, 충분히 쓸 수 있는 수준이야. 다만 “도메인 특화 / 고정밀 필요”이면 추가 튜닝이나 domain-specific 데이터셋이 필요하긴 해.

## 한국어 NER 성능과 주요 오픈소스 모델 정리

한국어 개체명 인식(NER) 분야에서는 최근 다양한 사전학습 언어 모델과 벤치마크가 활용된다. 대표적인 평가지표로는 KLUE의 entity-level macro-F1, character-level macro-F1이 있으며, 이 벤치마크에서 `koELECTRA-base`와 같은 모델이 F1 기준 약 86점대를 기록할 정도로 실용성이 높다. mBERT, XLM-R, KR-BERT 기반 모델들도 활발히 비교된다. 기본 성능은 이미 “쓸만한 수준”이지만, 도메인 특화 적용이나 고정밀이 필요한 경우에는 별도의 파인튜닝 혹은 추가 데이터셋 활용이 필요하다.

### 대표 오픈소스 한국어 NER 모델

- **Pororo** : KakaoBrain의 한국어 NLP 라이브러리 중 하나로, `Pororo(task="ner", lang="ko")`와 같이 코드 한 줄로 바로 실험·적용할 수 있다. 공식 문서에 F1 등 평가 지표가 공개되어 있고 사용법이 매우 쉽다.
- **KoELECTRA (파인튜닝 NER 버전)** : 예를 들어, KoELECTRA Small V3 Modu Ner 등은 precision 0.82, recall 0.84, F1 0.83 등 성능 수치와 함께 Dataloop 등에서 배포된다. 다양한 파생모델, 공식/비공식 저장소가 많다.
- **KLUE 기반 모델** : 유명 벤치마크인 KLUE의 official baseline(BERT, RoBERTa, RoBERTa-large 등)이 모두 NER task에서 성능 수치와 함께 제공된다.
- **GLiNER-ko**: Hugging Face에서 taeminlee가 공개한 모델로, 한국어 전용 NER 적용에 바로 활용할 수 있다.
- **Ko-FIN-NER (Roberta small)**: 금융 분야 특화로 파인튜닝된 NER 모델도 존재하며, 관련 수치와 설명 자료 모두 공개되어 있다.

### 실제 적용 시 참고할 점

- 일반적으로 학습 데이터가 뉴스 등 범용 텍스트라, 의료·법률 등 특수 도메인에는 추가 파인튜닝이 필요하다.
- KLUE-NER 기준 6개 엔티티 타입(사람·장소·기관 등)이며 원하는 엔티티가 더 많다면 라벨 커스텀 필요.
- 한국어 특성상 형태소·어절 분해 등 전처리와 토크나이저 선택이 성능에 중요한 영향을 미친다.
- 각 모델별로 inference 속도·모델 크기에 차이가 있으니 리소스 제약(GPU, 서버환경 등)을 고려해야 한다.

[1]: https://openreview.net/forum?id=q-8h8-LZiUm&utm_source=chatgpt.com "KLUE: Korean Language Understanding Evaluation"
[2]: https://ai-network.medium.com/%EB%AA%A8%EB%91%90%EC%9D%98-ai-%ED%95%9C%EA%B5%AD%EC%96%B4-%EC%9E%90%EC%97%B0%EC%96%B4-%EC%9D%B4%ED%95%B4-%EB%B2%A4%EC%B9%98%EB%A7%88%ED%81%AC-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%85%8B-klue-eaeab688f035?utm_source=chatgpt.com "[AI 모델 탐험기] #11 한국어 자연어 이해 벤치마크 데이터 셋 ..."
[3]: https://github.com/KLUE-benchmark/KLUE?utm_source=chatgpt.com "GitHub - KLUE-benchmark/KLUE: 📖 Korean NLU Benchmark"
[4]: https://kakaobrain.github.io/pororo/tagging/ner.html?utm_source=chatgpt.com "Named Entity Recognition — PORORO"
[5]: https://dataloop.ai/library/model/leo97_koelectra-small-v3-modu-ner/?utm_source=chatgpt.com "KoELECTRA Small V3 Modu Ner · Models · Dataloop"
[6]: https://github.com/monologg/KoELECTRA?utm_source=chatgpt.com "GitHub - monologg/KoELECTRA: Pretrained ELECTRA Model for Korean"
[7]: https://datasets-benchmarks-proceedings.neurips.cc/paper/2021/file/98dce83da57b0395e163467c9dae521b-Paper-round2.pdf?utm_source=chatgpt.com "KLUE: Korean Language Understanding Evaluation"
[8]: https://huggingface.co/taeminlee/gliner_ko?utm_source=chatgpt.com "taeminlee/gliner_ko"
[9]: https://dataloop.ai/library/model/hyeonseo_ko_fin_ner_roberta_small_model/?utm_source=chatgpt.com "Ko fin ner roberta small model · Models · Dataloop"

---

## 4. 결론

성능이 괜찮아 보이는 (정확도 80% 이상으로 보임) 오픈소스 모델을 쉽게 쓸 수 있는 것 같아서, 이걸 베이스라인으로 잡고 빠르게 구현해보자.