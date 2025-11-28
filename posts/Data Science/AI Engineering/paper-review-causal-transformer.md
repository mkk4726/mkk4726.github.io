---
title: "[Paper Review] Causal Transformer for Estimating Counterfactual Outcomes "
date: "2025-09-03"
excerpt: "Causal Transformer for Estimating Counterfactual Outcomes 논문 리뷰"
category: "AI Engineering"
tags: ["Transformer", "Causal Inference"]
pubic: false
---

- [논문 링크](https://arxiv.org/pdf/2204.07258)


<figure>
<img src="./images/하이퍼커넥트-모델설명2.png" alt="하이퍼커넥트-모델설명" width="100%" />
</figure>
<figure>
<img src="./images/하이퍼커넥트-모델설명.png" alt="하이퍼커넥트-모델설명" width="100%" />
<figcaption>그림1. 하이퍼커넥트 모델설명</figcaption>
</figure>
<small>[설명 블로그 링크](https://hyperconnect.github.io/2024/11/19/azar-recommendation-model.html)</small>


아자르에서 two-tower 모델 기반으로 추천 모델을 구성하고 있고, 이때 유저의 임베딩을 구할 때 causal transformer를 사용한다고 합니다.
인과추론 모델들을 적용해보려고 시도하던 중, 이 causal transformer를 알면 도움이 될 수도 있을 것 같아 찾아보게 됐습니다.

# 
