---
title: "Segmentation Model"
date: ""
excerpt: "눈의 안쪽 부분을 찍는 안저사진에서 망막병증을 탐지하는 모델"
category: "Career"
tags: ["Segmentation"]
---

- 기간 : 2023.12 ~ 2024.03 (4개월)
- 역할 : 문제정의, 프로젝트 설계, 구현까지 모든 과정

---

# 프로젝트 개요

아이펠이라는 AI 엔지니어 양성과정 부트캠프를 들으면서 진행했던 기업 연계 프로젝트입니다.
사람들의 건강에 기여하고 싶었고, 이를 위해 의료 도메인과 관련된 프로젝트를 진행했습니다.
그 중에서 "안과" 도메인인 회사와 기업 연계 프로젝트를 진행하게 되었습니다.

여러가지 주제 중 "당뇨병성 망막병증 병변 탐지"라는 문제를 정의해 프로젝트를 진행했습니다.
그 이유는 실명률이 가장 높은 질환이었고, 당뇨병 환자에게 자주 발생하는 합병증이기 때문이었습니다.
아버지가 당뇨가 있으시기 때문에, 가족의 건강에 직접적으로 기여할 수 있다는 생각에 관련 문제를 풀어보고 싶었습니다.

<figure>
<img src="/post/Portfolio/aiffel_presentaion_1.png" alt="aiffel_presentaion_1" /><width 80%/>
<figcaption>그림1. 왜 당뇨병성 망막병증으로 주제를 정했는지</figcaption>
</figure>

<small>[발표자료 링크](https://github.com/mkk4726/DR-GeuAl/blob/main/%EC%B5%9C%EC%A2%85%EB%B0%9C%ED%91%9C.pdf)</small>

눈의 안쪽 사진인 "안저사진"에 당뇨병성 망막병증 관련 병변들이 보이고, 이를 통해 초기 진단을 할 수 있습니다.
이를 돕기 위해 안저사진에서 병변들을 탐지하는, Segmentation 모델을 개발하는 프로젝트를 진행했습니다.

프로젝트를 진행하면서, 논문을 읽고 Segmenation 모델들 구현하고 고도화하는 과정을 통해 개발 능력을 키울 수 있었고, 데이터를 뜯어보면서 이미지 전처리를 고도화하는 과정에서 데이터 전처리에 대한 감을 키울 수 있었습니다.


---

# 문제 해결 과정

어떤 문제들이 있었고, 이를 해결하는 과정을 정리했습니다.

---

## 데이터셋은?

> 데이터셋이 없다...

가장 어려웠던 부분입니다. 제공되는 데이터셋이 없었기 때문에 데이터 수집부터 해야했습니다.
하지만 데이터셋이 없으니 거의 1~2주정도를 데이터를 구하기 위한 구글링에 시간을 썼던 것 같습니다.

그러던 중 FGADR 이라는 데이터셋을 찾았고 대략 1500건정도의 데이터를 확보할 수 있었습니다.

---

## 모델링 

> Unet vs DeepLab

Segmentation은 크게 Unet 계열과 DeepLab 계열로 구분할 수 있었고, 각각 다양한 모델들이 존재했습니다.
여러 논문에서 전체 이미지 중 레이블(마스크)이 포함된 부분이 매우 작은 의료 도메인의 특성상, U-Net 계열 모델이 가장 높은 성능을 보였고, 실제로 가지고 있는 데이터셋안에서도 확인할 수 있었습니다.

초기 실험을 통해 Unet을 베이스라인으로 잡았고, 이를 고도화시켜나가는 방식으로 실험읋 진행했습니다.

---

## 이미지 전처리: CLAHE 적용

<figure>
<img src="/post/Portfolio/aiffel_presentation_clahe.png" alt="aiffel_presentaion_clahe" /><width 80%/>
<figcaption>그림2. 이미지 전처리 방법 적용 : CLAHE</figcaption>
</figure>

가장 성능을 높일 수 있었던 부분입니다.
명암대비를 향상시킬 수 있는 방법으로, 병변의 특징을 더 명확하게 보이게 만들 수 있었습니다.
실제로 모델이 그림2의 사진처럼 작은 병변들을 더 잘 찾는 것을 확인할 수 있었습니다.

다만 과도한 명암대비 향상은 false positive를 증가시키므로 실험을 통해 적정 수준을 설정했습니다.

---

## multi-task learning 

<figure>
<img src="/post/Portfolio/aiffel_presentation_mtl.png" alt="aiffel_presentaion_mtl" /><width 80%/>
<figcaption>그림3. 인코더 풍부하게 하기 : MTL</figcaption>
</figure>

다음으로는 Unet의 Encoder를 풍부하게 학습시키기 위해서 multi-task learning을 적용했습니다.
이는 관련 논문들에서 제시한 아이디어들을 참고해 구현한 것입니다.

논문들에서 구현 코드가 공개되어 있지 않아 실제로 구현해보면서 많은 시행착오를 겪어야 했습니다.
특히 Encoder의 어느 부분까지 pretraining 시켜야하며, segmentaion task를 학습할 때는 다른 task의 가중치를 얼마나 줘야하는지 등을 실험을 통해 확인할 수 있었습니다.

MTL을 적용하고 많은 성능은 아니지만 향상된 것을 확인할 수 있었습니다.
