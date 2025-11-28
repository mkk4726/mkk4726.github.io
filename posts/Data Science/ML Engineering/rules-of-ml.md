---
title: "좋은 ML 서비스란? 어떻게 정의할 수 있고, 어떻게 개발할 수 있을지"
date: "2025-11-07"
excerpt: "Google - rules of ml에서 이야기하는 내용들 정리"
category: "Data Science"
tags: ["ML Engineering"]
---

ML 서비스를 구축하면서 놓치고 있던 개념들, 생각들을 정리해보자.

<a id="참고자료"></a>

참고자료
- 1: [구글에서 제공하는 포스트 - rules of ml](https://developers.google.com/machine-learning/guides/rules-of-ml#terminology)
  - Google 엔지니어 Martin Zinkevich가 쓴, "머신러닝을 엔지니어링적으로 성공시키기 위한 43가지 실무 규칙"을 담은 명문 가이드
- 2: [매번 큰 영감을 얻는 링크드인 이제헌님의 글](https://www.linkedin.com/feed/update/urn:li:activity:7391194835900305408/)
  - 휴리스틱의 문제, 한계점은 뭐가 있는지. AI가 이를 대체할 수 있는 이유는 무엇인지 잘 설명하고 있음

---

# 나의 커리어적 목표

내가 가지고 있는 커리어에서 목표는, 좋은 서비스를 만들고 싶다는 것.
사용자가 만족하며 자주 사용하고, 이를 통해 수익을 낼 수 있는 그런 서비스를 만들고 싶다.
여러 서비스가 있겠지만 그 중에서 ML을 사용해 편의를 제공하는, ML 서비스를 잘 만드는 사람이 되고 싶다.

그렇다면 좋은 ML 서비스란, ML 서비스를 잘 만드는 것이란 무엇인지 생각해봐야한다.
- ML 성능이 가장 좋은?
- 사용하기 편한?
- 개발 비용 대비 성과가 높은?

영화 추천 서비스를 만든다면, 좋은 영화 추천 서비스란 무엇인지부터 생각해봐야한다.
- 그냥 인기도 기반 추천을 하면 안되는건가?
  
이런 고민들에 대한 답을 [참고1](#참고자료), rules of ml 포스트에서 확인할 수 있다.

---

# 개요

> Do machine learning like the great engineer you are, not like the great machine learning expert you aren't.

실제로 마주하는 대부분의 문제는 모델의 문제가 아니라 엔지니어링적인 문제다.
모델은 전체 서비스의 일부분에 해당.

> So, the basic approach is:
> 1. Make sure your pipeline is solid end to end.
> 2. Start with a reasonable objective.
> 3. Add common­-sense features in a simple way.
> 4. Make sure that your pipeline stays solid.

가장 기본적인 접근은 견고한 파이프라인을 만들고, 그 안에서 평가지표롤 세우고, 보편적인 피처를 추가하는 것.
여기서 더 이상 개선할 수 있는게 없을 떄, 조금씩 복잡한 방법들을 추가하기.

학생 때는 모델적인 측면에만 집중하고 더 높은 성능을 높이는데 집중하지만, 사실 서비스를 만들다보면 대부분은 엔지니어링 영역이라는 것을 알게 되는 것 같다.
누군가는 당연한 이야기라고 생각할 수 있지만, 가장 핵심적인 부분이라고 생각하고 한번 더 마음에 새기게 된다.

---

# Before Machine Learning

이 부분이 가장 좋다.
당연한 이야기지만 머신러닝을 꼭 사용해야하는 건 아니다.
휴리스틱도 처음엔 좋은 접근 방법이다.

## Rule #1: Don't be afraid to launch a product without machine learning.

> Machine learning is cool, but it requires data. Theoretically, you can take data from a different problem and then tweak the model for a new product, but this will likely underperform basic heuristics. 
> If you think that machine learning will give you a 100% boost, then a heuristic will get you 50% of the way there.

내가 운영하고 있는 [영화 추천 서비스](https://movie.mingyuprojects.dev) 를 생각해보면 ctr prediction 모델을 만들고 싶어도, 관련한 데이터가 없다. 따라서 휴리스틱으로 추천을 하고 그 다음에 로그 데이터를 통해 예측할 확률이 높은 걸 보여줄 수 있지 않을까?

## Rule #2: First, design and implement metrics.

이 부분이 가장 핵심.
또 내가 가장 해보고 싶은 경험.
사용자 로그로부터 메트릭을 정의하고, 이를 고도화 해나가는 작업.

> Before formalizing what your machine learning system will do, track as much as possible in your current system. Do this for the following reasons:
> 1. It is easier to gain permission from the system’s users earlier on.
> 2. If you think that something might be a concern in the future, it is better to get historical data now.
> 3. If you design your system with metric instrumentation in mind, things will go better for you in the future. 
>    Specifically, you don’t want to find yourself grepping for strings in logs to instrument your metrics!
> 4. You will notice what things change and what stays the same. 
>    For instance, suppose you want to directly optimize one­-day active users. 
>    However, during your early manipulations of the system, you may notice that dramatic alterations of the user experience don’t noticeably change this metric.

> Google Plus team measures expands per read, reshares per read, plus­ones per read, comments/read, comments per user, reshares per user, etc. which they use in computing the goodness of a post at serving time. 
> Also, note that an experiment framework, in which you can group users into buckets and aggregate statistics by experiment, is important. See Rule #12.

> By being more liberal about gathering metrics, you can gain a broader picture of your system. Notice a problem? Add a metric to track it! Excited about some quantitative change on the last release? Add a metric to track it!

## Rule #3: Choose machine learning over a complex heuristic.

단순한 휴리스틱으로 제품 출시까지 가능, 그 후에 복잡한 휴리스틱은 유지보수가 어려움.
( Hyperconnect 링크드인에서 이런 글을 확인할 수 있었다 )

> As in most software engineering tasks, you will want to be constantly updating your approach, whether it is a heuristic or a machine­-learned model, and you will find that the machine­-learned model is easier to update and maintain (see Rule #16).

---

# ML Phase I — Your First Pipeline (+ Monitoring)

> “모델보다 인프라 · 데이터 신뢰성을 먼저 확보하라.”
> 첫 모델은 단순하게, 파이프라인은 검증 가능하게 만들고, 모니터링 으로 안정성을 유지하라.

- 요약표
| 구분             | Rule | 핵심 제목                         | 요약 핵심 메시지            |
| -------------- | ---- | ----------------------------- | -------------------- |
| **Phase I**    | #4   | Keep the first model simple   | 첫 모델은 단순하게, 인프라는 확실히 |
|                | #5   | Test infra independently      | ML 없이도 파이프라인 검증 가능하게 |
|                | #6   | Beware dropped data           | 복사 파이프라인 데이터 누락 주의   |
|                | #7   | Turn heuristics into features | 기존 룰을 feature 로 활용   |
| **Monitoring** | #8   | Know freshness requirements   | 모델 갱신 주기를 정확히 파악     |
|                | #9   | Detect problems before export | 배포 전 sanity check 필수 |
|                | #10  | Watch for silent failures     | 서서히 망가지는 데이터 감시      |
|                | #11  | Give feature owners & docs    | feature 소유자·문서 명시    |


첫번째로 ML pipeline을 개발할 때는 역시 "파이프라인 안정성"을 우선시 해야 함.
모델은 캡슐화해서 사용할 수 있도록 하고, 모델 없이 (더미 모델로)도 테스트 가능해야 함.

또 잘 돌아가는지 사전에 확인 (test case, sanity check) 해야하고, 모니터링을 통해 확인할 수 있어야 함.

---

# ⚙️ ML Phase II — Feature Engineering

> “End-to-end 파이프라인이 안정됐다면, 이제 ‘좋은 피처를 얼마나 잘 만들고 다룰 수 있는가’가 핵심이다.”

> 모델보다 **데이터 표현력(Features)** 에서 대부분의 성능이 나온다.


| Rule    | 제목                                     | 핵심 메시지           | 주요 키워드                           |
| ------- | -------------------------------------- | ---------------- | -------------------------------- |
| **#16** | Plan to launch and iterate             | 모델은 계속 개선되는 존재   | Iteration, Launch cycle          |
| **#17** | Start with directly observed features  | 직접 관측 가능한 피처부터   | Raw features, Avoid learned ones |
| **#18** | Explore generalizable content features | 맥락 간 일반화 가능한 피처  | Cross-context, Content features  |
| **#19** | Use very specific features             | 많은 단순 피처를 활용     | Granular, Regularization         |
| **#20** | Combine & modify features meaningfully | 사람이 이해 가능한 피처 조합 | Discretization, Cross            |
| **#21** | Feature count ∝ data size              | 피처 수는 데이터 양에 비례  | Data-volume scaling              |
| **#22** | Clean up unused features               | 안 쓰는 피처는 기술 부채   | Feature store hygiene            |




## 🚀 Rule #16 – Plan to launch and iterate

**“모델은 한 번이 아니라 계속 개선되는 존재다.”**

* **핵심 메시지:**
  한 번의 모델로 끝나지 않는다.
  → **“Launch → Measure → Iterate”** 사이클을 지속적으로 반복.
* **실행 포인트:**

  * 모델은 주기적으로 개선되어야 한다 (분기별 업데이트도 OK).
  * 피처 추가, 정규화 조정, objective 변경 등은 꾸준히 반복.
  * **복잡도를 늘릴 때는** “다음 런칭을 얼마나 어렵게 만들까?”를 항상 고려.
* **실무 팁:**
  모델을 교체하기 쉽게 파이프라인을 구성 (feature 추가/제거 용이성 확보).


## 🧠 Rule #18 – Explore with features of content that generalize across contexts

**“맥락을 초월해 일반화 가능한 콘텐츠 피처를 찾아라.”**

* **핵심 메시지:**
  피처는 **다른 환경에서도 의미가 유지**되어야 한다.
* **예시:**

  * YouTube Watch Next는 검색에서의 **co-watch(공동시청)** 데이터를 재활용.
  * 게시글 추천 모델은 다른 채널에서의 **좋아요, 댓글, 공유** 피처를 활용.
* **요점:**
  한 시스템에서 쌓인 행동 데이터는 다른 시스템에서도 유용하다.
  → “cross-context features”는 cold-start 문제 해결에도 도움.
* **실무 팁:**
  personalization보다 **콘텐츠 자체 특성(content features)** 을 먼저 확보하라.



---

# Human Analysis of the System

> **“모델이 잘 돌아가도, 맹신하지 말고 인간의 눈으로 분석하라.”**
> 데이터 사이언스의 핵심은 **모델 해석 → 에러 분석 → 피처 추가**의 반복이다.

| Rule    | 제목                                         | 핵심 메시지                    | 주요 키워드                                  |
| ------- | ------------------------------------------ | ------------------------- | --------------------------------------- |
| **#23** | You are not a typical end user             | 내부 시각은 편향됨, 실제 사용자 테스트 필요 | Usability, Persona, Crowdsourcing       |
| **#24** | Measure the delta between models           | 모델 간 변화량(Δ)을 정량적으로 비교     | Side-by-side test, Symmetric difference |
| **#25** | Utilitarian performance > predictive power | 예측 정확도보다 실제 효용이 더 중요      | Utility, Decision impact                |
| **#26** | Find error patterns → new features         | 오류 패턴을 발견해 feature로 보완    | Error analysis, Feature engineering     |
| **#27** | Quantify undesirable behavior              | 문제 행동을 수치화해 개선            | Metrics, Human labeling, Measurement    |

> **“모델의 한계는 데이터가 아니라 ‘분석 부족’에서 온다.”**
> 인간이 직접 모델의 오류 패턴을 보고,
> 문제를 수치화하고, 새 피처를 설계할 때
> 비로소 ML 시스템은 진짜로 성장한다.

## 🧠 Rule #23 – You are not a typical end user

**“당신은 일반 사용자가 아니다.”**

* **핵심 요지:**
  개발자 자신이 직접 시스템을 평가하면 **편향(bias)** 이 생긴다.
* **이유:**

  1. **코드에 너무 익숙해서** 특정 문제를 못 본다.
  2. **시간 가치가 높아** 대규모 피드백 수집이 비효율적이다.
* **대안:**

  * 내부 테스트(fishfooding)와 외부 사용자 테스트(crowdsourcing, A/B test)를 병행.
  * **“진짜 사용자”의 반응으로 모델 품질을 판단하라.**
* **실무 팁:**

  * **User Persona(가상 사용자 시나리오)** 설정
  * **Usability Testing(실사용자 테스트)** 도입
  * 팀 내 구성원이 실제 사용자 층과 다르면, 더더욱 외부 평가가 필요.

## 🧮 Rule #24 – Measure the delta between models

고려하지 못했던 부분인데, delta를 계산해봐야 하는구나.

**“모델 간의 차이를 정량적으로 측정하라.”**

* **핵심 요지:**
  새 모델이 좋다고 느끼기 전에,
  기존 모델과 **결과 차이(Δ)** 를 수치로 비교하라.
* **방법:**

  * 같은 입력(예: 쿼리, 문서 세트)에 대해 두 모델의 결과를 비교.
  * **Symmetric Difference** (양쪽에서 달라진 항목 비율)를 계산.
  * 차이가 너무 크거나 너무 작으면 원인 분석 필요.
* **활용:**

  * 차이가 **너무 작으면 → 영향이 거의 없음.**
  * 차이가 **너무 크면 → 위험도가 높음.**
  * 차이 큰 케이스를 샘플링해 직접 점검 (Qualitative Review)
* **요약:**

  > “변화가 실제로 존재하는가? 존재한다면 그 변화는 올바른 방향인가?”


## 📊 Rule #25 – When choosing models, utilitarian performance trumps predictive power

**“예측 정확도보다 실제 유용성을 우선하라.”**

내가 가장 중요하게 생각하는 부분!

* **핵심 요지:**
  모델의 목적은 예측이 아니라 **의사결정(decision)** 이다.
  → 실사용에서의 효용(utility)이 정확도보다 중요하다.
* **예시:**

  * 클릭 확률 예측(CVR)이 정확해도,
    실제 **순위 품질**이 나빠지면 의미 없다.
  * Spam filter에서 log loss가 개선돼도,
    실제 **스팸 통과율**이 높아지면 안 된다.
* **핵심 문장:**

  > “What matters is what you do with the prediction.”
  > 즉, 모델이 내놓은 숫자보다 그 숫자를 **어떻게 사용할지(policy layer)** 가 더 중요하다.


## 🔍 Rule #26 – Look for patterns in the measured errors, and create new features

**“모델이 틀린 패턴을 찾아내고, 그것을 피처로 바꿔라.”**

* **핵심 요지:**
  모델이 **어디서, 왜 틀리는지(error pattern)** 를 분석하고,
  그 원인을 보정할 **새로운 feature** 를 만든다.
* **예시:**

  * 모델이 “긴 게시물”을 일관되게 낮게 평가한다면,
    → “게시물 길이(post_length)” 피처를 추가하라.
  * 모델이 “특정 시간대”에 성능이 떨어진다면,
    → “time_of_day” 피처 추가.
* **중요 포인트:**

  * 모델이 **실수한 예제**만 집중 분석하라.
    → 모델이 스스로 고치고 싶어하는 지점을 알려줌.
  * 잘 맞춘 예제는 feature 추가해도 의미 없음.
* **정리:**

  > “Error = feature engineering의 기회.”


## 🧮 Rule #27 – Try to quantify observed undesirable behavior

**“문제되는 모델 행동을 수치로 정의하라.”**

* **핵심 요지:**
  모델의 나쁜 행동(undesirable behavior)을
  **정량화(quantify)** 해야 개선이 가능하다.
* **예시:**

  * “가짜 앱(gag apps)”이 너무 많이 추천된다면,
    → “가짜 앱” 라벨을 인위적으로 붙이고 그 수를 추적.
  * “스팸 게시물”이 과도하게 노출된다면,
    → human labeler로 스팸 비율 측정 → feature or metric 추가.
* **핵심 철학:**

  * “모호한 불만을 수치로 바꿔야 개선할 수 있다.”
  * **Measure first, optimize second.**

---

# Training-Serving Skew

| Rule    | 제목                               | 핵심 메시지                | 주요 키워드                         |
| ------- | -------------------------------- | --------------------- | ------------------------------ |
| **#29** | Train like you serve             | 서빙과 학습 feature 일치     | Logging, Serving-feature reuse |
| **#30** | Importance-weight sampled data   | 데이터는 버리지 말고 가중치 샘플링   | Sampling, Calibration          |
| **#31** | Beware of joined table drift     | 조인 테이블의 시점 불일치 주의     | Snapshot, Feature drift        |
| **#32** | Reuse code between train & serve | 학습·서빙 파이프라인 코드 공유     | Shared library                 |
| **#33** | Test on future data              | 미래 시점 데이터로 평가         | Temporal validation            |
| **#34** | Clean data > more data           | 깨끗한 데이터 확보가 더 중요      | Filtering bias                 |
| **#35** | Ranking skew                     | 단기 ≠ 장기 행동, 피드백 루프 관리 | Regularization, Exploration    |
| **#36** | Positional feedback loops        | 노출 위치 피처로 인한 루프 주의    | Position feature isolation     |
| **#37** | Measure training/serving skew    | 불일치를 정량적으로 모니터링       | Consistency check, Monitoring  |

> **“모델은 데이터의 거울이다 — 훈련과 서비스가 다르면, 거울이 왜곡된다.”**
>
> 학습·서빙 환경의 데이터, 코드, 테이블, 시점, 위치 효과를 일치시키고
> 주기적으로 skew를 모니터링하는 것이
> 대규모 ML 시스템 신뢰성의 핵심이다.

## 🧩 개요: Training-Serving Skew란?

> **Training-serving skew** =
> 모델이 학습할 때 본 데이터(Training)와
> 실제 서비스 시점(Serving)에서 받는 데이터가 **서로 달라서 성능이 떨어지는 현상.**

### 💥 예시

* 학습 시에는 정규화된 feature를 사용했지만,
  서빙 시에는 raw feature가 들어감 → 예측값 엉망
* Training 때는 “사용자 클릭 로그”를 썼는데,
  서빙 시엔 “새 유저”라서 그런 feature 없음 → cold-start 발생
* DB 조인이 학습 때와 달라 feature 값이 바뀜 → feature drift 발생

즉, 모델이 **훈련 때 본 세상과 실제 세상이 다르다.**

## ⚙️ Rule #29 – Train like you serve

**“서빙할 때처럼 학습하라.”**

* **핵심 요지:**
  모델 학습 시 사용된 feature 구성을
  실제 서비스 시 사용하는 feature와 **정확히 일치**시켜라.
* **방법:**

  * Serving 시 사용되는 feature set을 그대로 log로 저장하여 학습에 재사용.
  * 최소한 일부 샘플이라도 serving feature log → training data로 역전송(feedback loop).
* **사례:**
  YouTube Home 모델이 serving-time feature logging으로 전환하면서
  품질 상승 + 코드 복잡도 감소.

## ⚠️ Rule #30 – Importance-weight sampled data, don’t arbitrarily drop it

**“데이터가 많다고 아무거나 버리지 말고, 가중치 샘플링을 써라.”**

* **문제:**
  데이터가 너무 많을 때 임의로 일부만 쓰면 분포가 왜곡됨.
* **해결:**

  * **Importance weighting**:
    샘플 확률이 낮을수록 가중치를 높여 반영.
    예: 30%만 샘플링했으면 → weight = 1 / 0.3 = 3.33
* **결과:**
  → 데이터 분포 왜곡 없이 효율적 학습 가능.
  (정규화 후에도 calibration 유지)

## 🧠 Rule #31 – Beware of data changes in joined tables

**“Training과 Serving 시점에 조인되는 테이블 데이터가 바뀔 수 있다.”**

* **문제:**
  feature를 외부 테이블에서 join 할 때,
  시간차로 인해 내용이 변경 → prediction 불일치.
* **예시:**
  doc_id에 대한 “click_count”가 serving 시점에는 업데이트됨.
* **해결책:**

  * Serving 시점 feature를 log로 남겨 학습에 재사용 (Rule #32 참조)
  * 주기적 snapshot(예: 매일 테이블 freeze)으로 일관성 확보.

## 🔁 Rule #32 – Reuse code between training and serving

**“학습 파이프라인과 서빙 파이프라인은 코드까지 공유하라.”**

* **핵심 요지:**
  Training용 데이터 생성 로직과 Serving용 feature 생성 로직이
  따로 존재하면 불일치가 생긴다.
* **해결책:**

  * 가능한 한 **공통 코드(shared library)** 를 사용.
  * Training / Serving 환경의 언어가 다르면 (예: Python vs C++) → 일관성 유지 어려움.
* **결론:**
  “학습·서빙 코드의 재사용률이 높을수록 skew는 줄어든다.”

## 📆 Rule #33 – Test on future data

**“훈련 데이터보다 이후 시점 데이터로 테스트하라.”**

* **핵심 요지:**
  Training 시점 이후 데이터(next-day or next-week data)로 검증해야
  실제 운영 성능을 예측할 수 있다.
* **실무 팁:**

  * 1/5일 데이터로 학습했다면 → 1/6일 이후 데이터로 검증.
  * Test 성능이 학습보다 약간 낮은 건 정상.
  * 급격한 하락은 시계열적 drift나 feature degradation 신호.

## 🧹 Rule #34 – Clean data matters more than more data

**“데이터가 깨끗해야 모델이 산다.” (특히 filtering task)**

* **문제:**
  spam filtering 같은 이진 분류에서 negative 데이터를 임의로 버리면 bias 발생.
* **해결:**

  * Serving 중 일부 traffic(예: 1%)을 “held-out”으로 유지,
    모든 결과를 사용자에게 보여준 뒤 label 수집 → 편향 없는 데이터 확보.
* **핵심:**
  약간의 단기 성능 손해(노이즈 포함)를 감수하고도
  장기적으로는 더 깨끗한 데이터로 학습해야 한다.

## ⚖️ Rule #35 – Ranking skew: identical short-term ≠ identical long-term

**“랭킹 알고리즘은 바꾸면, 데이터 분포도 바뀐다.”**

* **핵심 요지:**
  새 ranking 모델을 적용하면 “사용자 반응 데이터” 자체가 달라짐.
  → **Feedback loop** 발생
* **예시:**
  인기 앱만 노출 → 계속 인기 앱 데이터만 쌓임 → long-tail 콘텐츠는 사라짐
* **해결책:**

  * Regularization으로 인기 feature 영향 완화
  * 문서 전용 feature(document-only) 피하기
  * 일부 randomness (exploration) 유지

## 📍 Rule #36 – Avoid feedback loops with positional features

**“위치(position) 피처로 인한 피드백 루프를 조심하라.”**

* **문제:**
  상위 노출(position 1)에 있는 콘텐츠는 더 많이 클릭됨.
  → 모델이 “1위였던 항목 = 인기 있다”로 학습 → 루프 발생.
* **해결책:**

  * 학습 시 positional feature를 사용하되,
    서빙 시엔 default position 값 사용.
  * Position feature는 다른 feature와 cross하지 말 것.
* **핵심:**
  위치 영향은 분리해서 모델링해야 한다.

## 📏 Rule #37 – Measure training/serving skew

**“훈련-서빙 불일치를 정량적으로 측정하라.”**

* **핵심 요지:**
  skew는 반드시 생긴다. 문제는 **얼마나, 왜 생기는지 모니터링하느냐**이다.
* **측정 항목:**

  1. Train vs Holdout 데이터 성능 차이
  2. Holdout vs Next-day 데이터 성능 차이
  3. Next-day vs Live (Serving) 예측 차이
* **핵심 문장:**

  > “If a model gives a different score on the same example in training and serving, it’s an engineering bug.”

즉, 같은 입력에 대해 점수가 다르면 ML 문제가 아니라 **시스템 버그**다.


---

