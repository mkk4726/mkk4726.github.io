---
title: "Metrics for Quantile Regressor"
date: "2025-09-26"
excerpt: "Quantile Regressor를 판단하는 평가지표는 뭐가 있을까?"
category: "Machine Learning"
tags: ["Quantile Regression", "Metrics"]
---

# 스케치

1. Pinball loss
2. Coverage Probability
3. Interval Score : Coverage + Sharpness
4. CRPS (Continuous Ranked Probability Score)
5. Calibration Metrics




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



