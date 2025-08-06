---
title: "ML의 신뢰구간을 구하는 방법"
date: "2025-08-06"
excerpt: "ML의 신뢰구간은 어떻게 구할까?"
category: "Data Science"
tags: ["machine-learning", "confidence-interval"]
---

참고자료
- 1: [Confidence Intervals for Machine Learning](https://www.geeksforgeeks.org/machine-learning/confidence-intervals-for-machine-learning/)
- 2: [Don’t Forget Confidence Intervals for Your ML Product](https://towardsdatascience.com/dont-forget-confidence-intervals-for-your-ml-product-272009bfab56/)
- 3: [Creating Confidence Intervals for Machine Learning Classifiers](https://sebastianraschka.com/blog/2022/confidence-intervals-for-ml.html)

---

# 신뢰구간의 정의

> A confidence interval provides a range of values within which a population parameter is likely to fall, with a certain level of confidence.

신뢰구간은 모집단의 모수(parameter)가 특정 범위 내에 있을 가능성을 나타내는 통계적 구간


---

# metric에 대한 신뢰구간 (참고1)

보통 ML의 신뢰구간은 metric에 대한 신뢰구간을 의미하는 것 같다.

<figure>
    <img src="/post/DataScience/CI_for_ML/CI_example1.png" alt="confidence_interval_for_ML" style="width: 50%;" />
    <figcaption>그림1. confidence_interval_for_ML (참고1)</figcaption>
</figure>

> For example, a 95% confidence interval of [85%, 90%] for model accuracy means that if we repeated the process multiple times, about 95% of the intervals would contain the true accuracy. This helps in assess model reliability and make informed decisions.

정확도와 같은 평가지표를 신뢰구간으로 제시하면 데이터가 바뀌었을 때에 대한 고려도 할 수 있고, 이러한 이유 떄문에 선택에 더 도움이 됨.

---

# 신뢰구간의 중요성 (참고1)

신뢰구간은 머신러닝의 다양한 영역에서 가치 있는 정보를 제공합니다:

1. 모델 성능 평가
- 정확도나 F1-score와 같은 단일 지표에만 의존하는 대신, 신뢰구간은 서로 다른 샘플에서의 성능 변화를 이해하는 데 도움을 줍니다.
- **예시**: 모델의 정확도가 85%이고 95% 신뢰구간이 [82%, 88%]라면, 새로운 데이터에서 테스트할 때 모델의 정확도가 이 범위 내에서 변동할 수 있음을 의미합니다.

2. 회귀 계수 해석
- 선형 회귀 모델에서 신뢰구간은 추정된 계수의 신뢰성을 평가하는 데 도움을 줍니다.
- **예시**: 특정 특성의 계수가 2.5이고 95% 신뢰구간이 [1.8, 3.2]라면, 해당 특성이 양의 효과를 가진다고 합리적으로 확신할 수 있습니다.

3. 예측의 불확실성
- 신뢰구간은 모델 예측에 대한 불확실성 측정을 제공하며, 특히 확률적 모델에서 유용합니다.
- **예시**: 주택 가격을 [200K, 250K] 범위로 95% 신뢰수준에서 예측한다면, 실제 가격이 이 범위 내에 있을 가능성이 높음을 의미합니다.

4. A/B 테스트 및 가설 검정
- 두 모델이나 특성을 비교할 때, 신뢰구간은 차이가 통계적으로 유의한지 판단하는 데 도움을 줍니다.
- **예시**: 모델 A의 정확도가 90% [88%, 92%]이고 모델 B가 87% [85%, 89%]라면, 모델 A가 우수하다는 증거가 있습니다.

---

# 신뢰구간을 구하는 법 (참고2)

> So how can we create and add confidence intervals to our models? As the name implies, to build confidence intervals (or any other measure of confidence) you first need to define what your metric represents and what confidence means to you and your user. 
> There are many ways to derive a measure of confidence but all depend on some sort of knowledge which you can use to validate and test your predictions.

---

# 신뢰구간을 구하는 법 (참고3)

> Confidence intervals are no silver bullet, but at the very least, they can offer an additional glimpse into the uncertainty of the reported accuracy and performance of a model.

여러 글에서 신뢰구간을 제시하는게 소통을 하는데 도움을 준다고 이야기하네.
공감이 된다. 어떤 추정값을 이야기할 때 불확실성에 대한 이야기는 꼭 포함이 되어야 한다고 생각한다.

<figure>
    <img src="/post/DataScience/CI_for_ML/with_CI_without_CI.png" alt="confidence_interval_for_ML" style="width: 80%;" />
    <figcaption>그림2. with_CI_without_CI</figcaption>
</figure>

확실히 포함된게 더 보기 좋음

## Confidence Intervals in a Nutshell

> A confidence interval is a method that computes an upper and a lower bound around an estimated value. The actual parameter value is either insider or outside these bounds.

추정값에 대한 불확실성을 정량화한게 신뢰구간이라고 생각해볼 수 있겠다.

<figure>
    <img src="/post/DataScience/CI_for_ML/95_percent_CI.png" alt="confidence_interval_for_ML" style="width: 80%;" />
    <figcaption>그림3. 95% 신뢰구간의 의미</figcaption>
</figure>

95% 신뢰구간의 의미는?

> “95% 신뢰구간”이란, 동일한 방법으로 표본을 여러 번 뽑아서 신뢰구간을 계속 계산한다면, 그중 약 95%의 신뢰구간이 모집단의 참값을 포함하게 된다는 의미

오해와 정확한 해석

> 많은 사람들이 “이 신뢰구간 안에 진짜 평균이 95% 확률로 들어 있다”라고 생각하지만, 엄밀하게는 틀린 해석이야. 참값은 이미 고정된 값이니까, 확률로 해석하지 않아. 올바른 해석은 “이 방식으로 구한 신뢰구간이 모집단의 평균을 95% 수준으로 포함한다”는 것.

원하는 건 모델의 성능에 대한 값들.
신뢰구간은 위에서 언급한 것처럼 모델이 추정값에 대한 얼만큼의 불확실성을 가지고 있는지를 의미.

## A Note About Statistical Significance

통계적 유의성이란?

> 통계적 유의성은 관찰된 결과가 단순한 우연이나 확률적 변동이 아닌, 실제로 의미 있는 차이나 관계가 있다고 판단할 수 있는 정도를 나타냅니다.

<figure>
    <img src="/post/DataScience/CI_for_ML/ci-overlap.png" alt="confidence_interval_for_ML" style="width: 80%;" />
    <figcaption>그림4. 신뢰구간의 중복을 통한 판단</figcaption>
</figure>

group1과 group2가 다른지를 신뢰구간을 통해 확인해볼 수 있다.
당연하게도 완전히 겹치지 않으면 확실히 다른 것이라고 판단할 수 있다.
겹친다면 겹친 분포를 그리고 여기서 mu = 0이 신뢰구간에 포함되는지를 통해 확인할 수 있다.








