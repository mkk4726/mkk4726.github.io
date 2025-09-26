---
title: "Metrics for Quantile Regressor"
date: "2025-09-26"
excerpt: "Quantile Regressor를 판단하는 평가지표는 뭐가 있을까?"
category: "Machine Learning"
tags: ["Quantile Regression", "Metrics"]
---

# 스케치

quantile regressor로 구간을 추정하는 방향. 어떤 모델이 최적일까?
pinball loss가 최소인 모델?

직관적으로 생각할 때는 목표하는 신뢰수준을 만족하는가 (예측구간이 데이터를 얼만큼 포함하는지) + 신뢰수준의 길이
원하는 신뢰수준을 만족하는 모델일 때 신뢰수준이 최소인 모델을 고르면 될 것 같은데
보통 어떤 metric을 보려나?


GPT가 제시해준 5개 지표.
1. Pinball loss -> 모델이 학습할 때 쓰는 loss. 
   - [pinball loss에 대해 간단히 정리했던 글](/Users/visuworks/Desktop/mkk4726.github.io/src/content/posts/Data%20Science/ML%20Engineering/quantile-regression-explained.md)
2. Coverage Probability -> 예측구간에서 데이터를 얼마나 포함하는지 여부
3. Interval Score : Coverage + Sharpness -> 두 개 다 같이 고려한 경우. 이것과 관련된 지표들이 많더라.
4. CRPS (Continuous Ranked Probability Score)
5. Calibration Metrics -> 예측된 분위수/구간이 실제 데이터 분포와 일치하는가?를 살펴보는 것들.


**Winkler Interval score metric :**
- [Kaggle](https://www.kaggle.com/datasets/carlmcbrideellis/winkler-interval-score-metric)
- [Winkler Score](https://otexts.com/fpp3/distaccuracy.html#winkler-score)

> The Mean Winkler Interval (MWI) Score evaluates prediction intervals by combining their width with a penalty for intervals that do not contain the observation [8, 10].

$$
\text{MWI Score} = \frac{1}{n} \sum_{i=1}^{n} (\hat y^{\text{up}}_{i} - \hat y^{\text{low}}_{i}) + \frac{2}{\alpha} \sum_{i=1}^{n} \max(0, |y_{i} - \hat y^{\text{boundary}}_{i}|)
$$

where $\hat y^{\text{boundary}}_{i}$ is the nearest interval boundary not containing $y_{i}$, and $\alpha$ is the significance level.


**MAPIE :**
- [How to measure conformal prediction performance?](https://mapie.readthedocs.io/en/latest/theoretical_description_metrics.html)


**CRPS (Continuous Ranked Probability Score) :**
- Pinball Loss: 특정 분위수에 대해 잘 맞췄는가?
- CRPS: 모든 분위수를 종합했을 때, “예측된 분포와 실제가 얼마나 잘 맞는가?”
> 즉, CRPS는 분위수 전반에 걸친 성능 평가 지표라서 Quantile Regressor를 여러 𝜏 에서 학습했을 때 분포 전체 품질을 한 번에 평가할 수 있습니다.

> CRPS는 예측된 확률 분포와 실제 관측값 사이의 거리를 측정합니다. 예측 분포가 실제 값에 가까울수록 낮은 점수를 받습니다.



---