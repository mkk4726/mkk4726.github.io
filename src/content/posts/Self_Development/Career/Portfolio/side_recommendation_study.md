---
title: "[Side] 추천 모델링 공부"
date: ""
excerpt: "추천 모델링 공부를 위한 과정들"
category: "Career"
tags: ["ML", "Crawling", "Prediction"]
public: false
---

**두 가지 루트 :**
1. Kaggle 대회 활용
2. 공개 데이터셋 직접 활용.

* 처음엔 **Avazu** (가볍고 전처리 연습에 적합)
* 중간엔 **Outbrain** (관계형 데이터 + 대규모)
* 제대로 깊게 하고 싶으면 **Criteo** (업계 benchmark)

---

모델을 공부하며 다양한 데이터셋에서 모델링을 경험했습니다.

---


* **Avazu CTR Prediction**
  * 목표: 모바일 광고 클릭 여부 예측 (binary classification)
  * 데이터: 수억 건 단위 (압축 후 1GB+). 대규모 샘플링해서 연습하기 좋아요.
  * [Kaggle 대회 링크](https://www.kaggle.com/c/avazu-ctr-prediction)

* **Criteo Display Advertising Challenge**

  * 목표: 디스플레이 광고 클릭 예측 (industry standard benchmark)
  * 데이터: 40M+ samples, 약 13GB.
  * [Dataset 링크](https://www.kaggle.com/c/criteo-display-ad-challenge)

* **Outbrain Click Prediction**

  * 목표: 뉴스 아웃브레인 플랫폼에서 어떤 기사/광고가 클릭될지 예측
  * 복잡한 관계형 데이터 구조 (users, documents, ads, clicks) → real-world pipeline 연습에 최적
  * [Kaggle 대회 링크](https://www.kaggle.com/c/outbrain-click-prediction)

* **TalkingData AdTracking Fraud Detection**

  * 목표: 광고 클릭이 실제 사용자 행동인지, 봇/사기인지 판별
  * CTR 예측과는 조금 다르지만, 광고 데이터 전처리/특징 추출 연습에 적합
  * [Kaggle 대회 링크](https://www.kaggle.com/c/talkingdata-adtracking-fraud-detection)

* **Criteo Terabyte Dataset** (CTR 예측용, 업계 표준)

  * Facebook, Google 논문에도 자주 쓰이는 CTR 예측 benchmark.
  * 1TB급 원본 데이터 → 샘플링 버전도 제공.
  * [Criteo AI Labs](https://ailab.criteo.com/ressources/)

* **iPinYou Dataset** (RTB 광고 경매 로그)

  * Real-Time Bidding 광고 로그 공개 데이터셋. CTR 예측 + bidding 전략 실험에 활용 가능.
  * [iPinYou dataset paper & link](https://arxiv.org/abs/1407.7073)

* **KDD Cup 2012 - Track 2 (CTR Prediction)**

  * 마이크로소프트가 공개한 광고 클릭 예측 데이터.
  * 규모는 크지 않지만, 학습용으로 적합.
  * [KDD Cup 2012 Data](https://www.kdd.org/kdd-cup/view/kdd-cup-2012/)


---





