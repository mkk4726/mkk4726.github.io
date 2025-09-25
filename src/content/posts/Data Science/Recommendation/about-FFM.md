---
title: "Field-aware Factorization Machines에 대해 정리"
date: "2025-09-25"
excerpt: "FFM에 대해 이해해보자"
category: "Recommendation"
tags: ["FFM", "ML", "CTR"]
---

# 개념 스케치

결국 FM에서의 목표는 interaction 잘 모델링 하는 것.
FM에서 한 단계 발전한게 FFM.

이름에서 알 수 있듯 "field"라는 개념이 도입됨.
interaction을 더 잘 모델링하기 위해서.

| clicked | Publisher (P) | Advertiser (A) | Gender (G) |
|---------|---------------|----------------|------------|
| Yes     | ESPN          | Nike           | Male       |


이런 데이터가 있을 때 FM에서는 다음과 같이 interaction을 모델링함.

$$
W_{ESPN} \cdot W_{NIKE} + W_{ESPN} \cdot W_{MALE} + W_{NIKE} \cdot W_{MALE}
$$

이때 ESPN은 하나의 임베딩 벡터를 가지는데, Advertiser과 Gender의 관계를 모두 잘 반영할 수 있을까?
라는 의문이 들었고 그러면 각각 임베딩 벡터를 가지도록 해보자는 아이디어.

다음처럼 모델링한다.

$$
W_{ESPN,A} \cdot W_{Nike,P} + W_{ESPN,G} \cdot W_{Male,P} + W_{Nike,G} \cdot W_{Male,A}
$$

이제 embedding vector는 하나의 field에 대한 정보만 가지니까 K (임베딩 벡터의 길이)를 훨씬 더 작게 잡는다고 한다.

직관적으로 이해할 수 있듯 계산비용 (더 이상 FM 트릭 적용 안됨. linear complexity X)과 메모리 비용이 훨씬 커진다.

Azura와 같은 2014년정도쯤에 나온 대회에서 이 모델이 SOTA 였다고 한다.
