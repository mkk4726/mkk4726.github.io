---
title: "how to evaluate CATE estimation model"
date: "2025-07-24"
excerpt: "CATE estimation model 평가 방법에 대해 정리"
category: "Causal Inference"
tags: ["인과추론", "metrics"]
---

참고한 자료
- [Causal Inference for The Brave and True](https://matheusfacure.github.io/python-causality-handbook/18-Heterogeneous-Treatment-Effects-and-Personalization.html)

> When Prediction Fails chapter, they generate data on both $Y_{0i}$ and $Y_{1i}$ so that they can check if their model is correctly capturing the treatment effect $Y_{1i} - Y_{0i}$. 
> That’s fine for academic purposes, but in the real world, we don’t have that luxury.

CATE estimation model은 어떻게 평가할 수 있을까요?
학문적으로는 임의로 데이터를 생성해서 실제로 이를 잘 추정하는지 확인해볼 수 있을 것 같습니다.

> The quality of your model will have to be grounded on something more concrete than a beautiful theory. 

> Unfortunately, it isn’t obvious at all how we achieve anything like a train-test paradigm in the case of causal inference. 
> That’s because causal inference is interested in estimating an unobservable quantity, $\frac{\delta y}{\delta t}$

하지만 실제 데이터에서는 CATE를 직접 확인할 수 없으니, 다른 방법을 써야합니다.
회사에 인과추론을 적용하면서 가장 많이 고민헀던 부분이기도 합니다. 내가 만든 모델의 성능을 어떻게 설명하고 설득할 수 있을까요?

머신러닝은 train-test paradigm을 통해 성능을 평가할 수 있고, 이는 꽤나 직관적으로 모델의 성능을 증명해주고 있습니다.
CATE estimation model에도 이러한 방법이 존재할까요?

> Is not a definitive one, but it works in practice and it has that concreteness, which I hope will approach causal inference from a train-test paradigm similar to the one we have with machine learning. 
> The trick is to use aggregate measurements of sensitivity. 
> Even if you can’t estimate sensitivity individually, you can do it for a group and that is what we will leverage here.

개개인의 CATE는 알 수 없지만 그룹의 ATE는 알 수 있으니 이를 활용해서 CATE를 평가해볼 수 있습니다.


# Sensitivity by Model Band
---

> A good causal model should help us find which customers will respond better and worse to a proposed treatment. 
> They should be able to separate units into how elastic or sensitive they are to the treatment.

CATE estimation의 목적은 처치에 대한 민감도를 개인별로 추정하여, 개인화된 처치를 하는데에 있습니다.
따라서 개인별로 민감도를 명확하게 구분하는 것이 중요합니다.

> If that is the goal, it would be very useful if we could somehow order units from more sensitive to less sensitive.

CATE estimation을 통해 개인별 민감도를 계산하고 이를 활용해 정렬을 할 수 있습니다.
정렬을 얼마나 잘하는지를 통해 모델의 성능을 평가해볼 수 있지 않을까요?

> Sadly, we can’t evaluate that ordering on a unit level. 
> But, what if we don’t need to? 
> What if, instead, we evaluate groups defined by the ordering? 
> If our treatment is randomly distributed (and here is where randomness enters), estimating sensitivity for a group of units is easy. 
> All we need is to compare the outcome between the treated and untreated.

<figure style="text-align: center;">
  <img src="./images/cate_metric_using_ate.png" alt="cate_metric_using_ate" />
  <figcaption> 그림1. CATE 평가 방법에 대한 직관적 설명 (low: 비처치대상, high: 처치대상-가격을 높였을 때)</figcaption>
</figure>

그림1이 의미하는 것은 추정된 cate로 정렬했을 때, 정렬된 것들을 기준으로 그룹을 나눠 ATE를 구하면 그 차이가 분명할 것이라는 것입니다.
맨 오른쪽에 있는, 랜덤하게 cate를 배정한 경우 ATE가 완전하게 같은 것을 확인할 수 있습니다.
반대로 model-2의 경우 ATE가 분명하게 차이가 나는 것을 확인할 수 있습니다.

> Just by looking at these plots, you can get a feeling of which model is better. 
> The more ordered the sensitivities look like and the more different they are between bands, the better. 
> Here, model 2 is probably better than model 1, which is probably better than the random model.


# Cumulative Gain Curve

계속해서 가져가고 있는 컨셉은, CATE estimation은 개인별로 cate를 구분되게 추정하는 것이 목표이고, 이를 사용해 정렬한 후 그룹을 나눠 ATE를 구하면 차이가 나야한다는 것입니다.

<figure style="text-align: center;">
  <img src="./images/cumulative_gain_curve.png" alt="cumulative_gain_curve" />
  <figcaption> 그림2. Cumulative gain curve</figcaption>
</figure>

그림2는 그림1의 그룹별 ATE결과를 바탕으로 높은 순서대로 정렬한 후에, 누적되는 ATE를 살펴본 것입니다.
비교대상인 랜덤한 경우를 보면, ATE 누적 분포가 직선의 모습을 보이고 있는 것을 확인할 수 있습니다.
반대로 정렬이 잘된 경우라면 이 랜덤한 모델이 그리는 직선보다 더 높게 휘어진 직선을 그리고 있는 것을 확인할 수 있습니다.

> Once we have the theoretic random curve, we can use it as a benchmark and compare our other models against it. 
> All curves will start and end at the same point. 
> However, the better the model at ordering sensitivity, the more the curve will diverge from the random line in the points between zero and one.

이러한 방법을 통해 모델의 성능을 평가할 수 있습니다.



