---
title: "meta-learning이란?"
date: "2025-08-04"
excerpt: "meta-learning의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["meta-learning", "machine-learning", "statistics"]
---

참고자료
- [Bot Penguin - Meta Learning](https://botpenguin.com/glossary/meta-learning)
- [논문세미나 007 - Meta-Learning의 개념 및 연구 분야 (김도형 연구원)](https://www.youtube.com/watch?v=eaEL9rJ2Mx0)


# meta-learning이란? 개념적 정의
---
“배우는 방법을 배우는 것” (learning to learn)

> meta-learning (메타 러닝)은 기계학습에서 점점 더 중요한 개념이 되고 있으며, 특히 few-shot learning, online adaptation, 개인화 모델링 등에서 매우 강력한 도구입니다.

> Meta-learning, also known as "learning how to learn," is a cutting-edge approach in machine learning that focuses on algorithms that learn from their experiences and adapt to new data more effectively

개념만으로는 크게 와닿진 않네.

<figure>
<img src="/post/DataScience/meta_learning_concept_1.webp" alt="Meta-learning 개념도" />
<figcaption>그림 1. Meta-learning의 기본 개념</figcaption>
</figure>

> Meta-learning enhances traditional machine learning methods by adding a meta-layer to optimize learning algorithms.

과거의 학습 경험 (데이터나 파라미터)를 바탕으로 새로운 문제에 대해서 빠르게 학습해나가는 방법

<figure>
<img src="/post/DataScience/A-taxonomy-of-meta-learning-Meta-learning-strategies-are-divided-into-two-main.png" alt="Meta-learning strategies" />
<figcaption>그림 2. Meta-learning strategies</figcaption>
</figure>


## 기본 아이디어 : 

일반적인 머신러닝에서는 하나의 작업(task)에 대해 모델을 학습합니다.
하지만 메타 러닝은 여러 개의 작업들을 보고, 새로운 작업에 빠르게 적응할 수 있는 학습 전략을 학습하는 것이 목표입니다.

일반 머신러닝:
- 학습: 하나의 데이터셋에서 파라미터를 최적화
- 테스트: 같은 도메인의 unseen 데이터에 적용

메타 러닝:
- 학습: 여러 task를 보면서, 모델이 "어떻게 빠르게 적응할 수 있을지"를 학습
- 테스트: 새로운 task에 **소수의 샘플(few-shot)**만으로 빠르게 적응


# Meta-Classifiers and Regressors

> Meta-classifiers play a central role in ensemble machine learning techniques. They act as a higher-level classifier that takes the predictions of multiple base-level classifiers to generate a final prediction.

여러 값을 하나로 합치는 역할을 하는 모델.

stacking 방법에서 맨 마지막에 쓰이는 모델, 모델의 예측값을 바탕으로 예측값을 생성하는 모델.

random-forest도 어떻게 보면 meta-classifier구나. decision-tree 예측값을 voting해서 결과내는 방식이니까.

