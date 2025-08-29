---
title: "Positivity(양수성)이란? Overlap assumption이란?"
date: "2025-08-29"
excerpt: "양수성이란? 분포의 겹침이 의미하는건?"
category: "Causal Inference"
tags: ["Positivity", "Overlap assumption"]
---

positivity 혹은 overlap assumption은 인과추론에서 가져가는 기본적인 가정 중 하나입니다.

-> [Casual assumptions](https://www.stats.ox.ac.uk/~evans/APTS/causassmp.html)


왜 분포의 겹침을 기본 가정으로 가져가는지, 이게 어떤 의미인지에 대해 정리했습니다.

---

# RCT (Randomized Controlled Trial)와 양수성

이 개념을 이해하기 위해서 RCT 에 대해 생각해보면 좋습니다.

<figure>
<img src="/post/Causal_Inference/Positivity/RCT.png" alt="RCT" width="80%" />
<figcaption>그림1. RCT : 무작위 배정이 positivity를 보장하는 메커니즘</figcaption>
</figure>

RCT (무작위 배정 실험)은 실험 대상자를 통제 집단과 종속 집단에 무작위로 배정하고, 집단 간의 결과 차이를 통해 처치의 효과를 추정하는 방식입니다.
처치효과를 구하는 가장 이상적인 형태라고 이해할 수 있습니다.
처치효과란 어떤 사람이 처치를 받았을 때의 결과와 받지 않았을 때의 차이를 의미합니다.
- $\text{처치효과} = \text{처치 받았을 때} - \text{처치 안받았을 때}$

하지만 멀티버스가 존재하지 않는 이상, 한 사람에게서 2가지 결과를 모두 얻을 수 없습니다.
RCT에서 가져가는 가정은 "대상자를 무작위로 배정한다면, 집단 간에 차이가 발생하지 않을 것이다" 입니다.
이 의미는 A라는 사람이 처치를 받는 종속 집단에 속한다면, A와 비슷한 사람이 통제 집단에 속해있을 것이고, 이를 통해 간접적으로 처치효과를 추정하겠다는 이야기입니다.

이를 양수성이 보장되는 상황, (처치) 집단 간의 분포가 겹쳐져있다고 표현할 수 있습니다.

양수성 정의은 $0 < P(T=1|X=x) < 1$ 으로 정의할 수 있습니다.
이는 특정 공변량 값 X가 주어졌을 떄, 처치를 받을 확률이 0과 1 사이에 있어야한다는 의미입니다.

RCT에서는 무작위 배정을 통해 자연스럽게 positivity가 충족됩니다. 왜냐하면 모든 사람이 동일한 확률로 처치·비처치 집단에 들어갈 수 있기 때문입니다.

---

# 관찰 연구에서의 양수성 문제

반대로 관찰연구에서는 특정 조건(예: 고위험 환자에게만 약을 투여) 때문에 positivity가 깨지기 쉽습니다.
관찰연구에서는 특정 조건에서 처치 여부가 결정되기 때문입니다.

이런 경우 (처치) 집단 간에 차이가 발생하고, 집단 간의 차이로는 처치효과를 추정할 수 없습니다.
이를 양수성이 보장되지 않는 상황, 집단 간의 분포가 겹쳐져 있지 않은 상황이라고 표현할 수 있습니다.

집단간의 차이를 편향이라고 하고, 실제 관측 데이터에 편향이 존재하는 것을 확인할 수 있습니다.
[데이터에 존재하는 통계적 편향](/posts/Data%20Science/Causal%20Inference/Industry%20Application/what-is-statistical-bias)



---

# 예측 문제와 연관지어보기

양수성이 보장될 경우에는 실제 측정하지 않은 값들도 간접적으로 평가할 수 있다는 이야기를 설명해보겠습니다.

회사에서 풀고 있는 문제는, 렌즈 사이즈 추천 문제입니다.
고객이 시력교정을 위해 렌즈 수술을 할 때에 적절한 렌즈 크기를 결정하는게 굉장히 중요한데, 이때 선택에 도움을 주는 서비스를 만들고 있습니다.

이 상황에서 고민하는 문제는 다음과 같습니다.

<figure>
<img src="/post/Causal_Inference/선택문제_평가_고민.png" alt="평가고민" width="80%" />
<figcaption>그림2. 선택의 문제에서 예측 지표의 한계점</figcaption>
</figure>

선택할 수 있는 렌즈 사이즈가 3개라면, 고객은 1개의 렌즈 크기에 대해서만 수술을 받기 때문에, 3개의 예측 결과가 정확한지 평가할 수 없다는 것입니다.

만약 RCT처럼 렌즈를 무작위로 배정한 경우라면 양수성이 보장되고, 처치의 분포가 겹치기 때문에 간접적으로 평가할 수 있습니다.

<figure>
<img src="/post/Causal_Inference/Positivity/overlap.png" alt="분포가 겹칠 때" width="80%" />
<figcaption>그림3. 분포가 겹칠 때의 상황</figcaption>
</figure>

그림3처럼 처치 간의 분포가 겹칠 때는 비슷한 X에 T가 0과 1인 경우가 모두 있습니다.
따라서 실제로는 T=0이지만, T=1일때의 예측값을 간접적으로 확인할 수 있는 것입니다.

<figure>
<img src="/post/Causal_Inference/Positivity/no-overlap.png" alt="평가고민" width="80%" />
<figcaption>그림4. 분포가 겹치지 않을 때</figcaption>
</figure>

하지만 그림4처럼 분포가 겹치지 않는 경우, 간접적으로도 평가할 수 없습니다.
왜냐하면 비슷한 x에 대해서 T=0이거나 T=1인 점이 없기 때문입니다.

