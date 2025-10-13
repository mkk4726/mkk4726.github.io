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
1. Pinball loss (Quantile Score) -> 모델이 학습할 때 쓰는 loss. 
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

# Interval Score

- 1: [Kaggle - Winkler Interval score metric](https://www.kaggle.com/datasets/carlmcbrideellis/winkler-interval-score-metric/data)
- 2: [otexts - winkler-score](https://otexts.com/fpp3/distaccuracy.html#winkler-score)

가장 직관적인 방향. coverage + sharpness 한번에 점수로 녹여내기

그 중에서 MWIS는 Wsharpness를 주로 보고 거기에 penalty로 coverage를 더해준 느낌

---

## MWIS

$$
W_{\alpha,t} = 
\begin{cases}
(u_{\alpha,t} - \ell_{\alpha,t}) + \frac{2}{\alpha}(\ell_{\alpha,t} - y_t) & \text{if } y_t < \ell_{\alpha,t} \\
(u_{\alpha,t} - \ell_{\alpha,t}) & \text{if } \ell_{\alpha,t} \leq y_t \leq u_{\alpha,t} \\
(u_{\alpha,t} - \ell_{\alpha,t}) + \frac{2}{\alpha}(y_t - u_{\alpha,t}) & \text{if } y_t > u_{\alpha,t}
\end{cases}
$$

> For observations that fall within the interval, the Winkler score is simply the length of the interval. Thus, low scores are associated with narrow intervals. However, if the observation falls outside the interval, the penalty applies, with the penalty proportional to how far the observation is outside the interval. (참고2)

---

# CRPS

> Often we are interested in the whole forecast distribution, rather than particular quantiles or prediction intervals. 

결국 궁금한 건 특정 분위 수 값이라기 보다는 분포를 잘 추정했는지.

> In that case, we can average the quantile scores over all values of p to obtain the Continuous Ranked Probability Score or CRPS (Gneiting & Katzfuss, 2014). (참조2)

## CRPS 구현 예시

```python
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

def crps_score(observed, predicted_quantiles, quantile_levels):
    """
    CRPS 계산
    
    Parameters:
    - observed: 실제 관측값
    - predicted_quantiles: 예측된 분위수들 (array)
    - quantile_levels: 분위수 레벨들 (array, 0~1 사이)
    
    Returns:
    - CRPS score (낮을수록 좋음)
    """
    n_quantiles = len(quantile_levels)
    crps = 0
    
    for i in range(n_quantiles - 1):
        tau = quantile_levels[i]
        tau_next = quantile_levels[i + 1]
        
        # 현재 분위수와 다음 분위수 사이의 구간에서 CRPS 계산
        if observed <= predicted_quantiles[i]:
            crps += (tau_next - tau) * (predicted_quantiles[i] - observed)**2
        elif observed >= predicted_quantiles[i + 1]:
            crps += (tau_next - tau) * (observed - predicted_quantiles[i + 1])**2
        else:
            # 관측값이 구간 내에 있는 경우
            crps += (tau_next - tau) * (
                (observed - predicted_quantiles[i])**2 * (1 - tau) +
                (predicted_quantiles[i + 1] - observed)**2 * tau
            )
    
    return crps

# 예시: 두 모델의 CRPS 비교
np.random.seed(42)

# 실제 분포 (정규분포)
true_mean, true_std = 0, 1
observed_value = np.random.normal(true_mean, true_std)

# 모델 A: 정확한 분포 예측
quantile_levels = np.linspace(0.1, 0.9, 9)
model_a_quantiles = stats.norm.ppf(quantile_levels, true_mean, true_std)

# 모델 B: 부정확한 분포 예측 (평균이 틀림)
model_b_quantiles = stats.norm.ppf(quantile_levels, true_mean + 0.5, true_std)

# CRPS 계산
crps_a = crps_score(observed_value, model_a_quantiles, quantile_levels)
crps_b = crps_score(observed_value, model_b_quantiles, quantile_levels)

print(f"실제 관측값: {observed_value:.3f}")
print(f"모델 A CRPS: {crps_a:.3f}")
print(f"모델 B CRPS: {crps_b:.3f}")
print(f"모델 A가 {'더 좋음' if crps_a < crps_b else '더 나쁨'}")
```

## CRPS의 직관적 이해

CRPS는 예측된 분포와 실제 관측값 사이의 "거리"를 측정합니다:

1. **완벽한 예측**: 실제 분포와 예측 분포가 일치하면 CRPS = 0
2. **부정확한 예측**: 분포가 틀릴수록 CRPS가 커짐
3. **분위수 종합**: 모든 분위수에 대한 성능을 한 번에 평가

### CRPS 작동 원리: Quantile 값들끼리 비교

CRPS는 기본적으로 **quantile 값들끼리 비교**하는 방식으로 작동합니다:

1. **Quantile 값들로 분포 표현**: 
   - 예측 모델이 여러 분위수(0.1, 0.2, ..., 0.9)에 대해 값을 예측
   - 이 quantile 값들이 모여서 전체 분포를 나타냄

2. **실제 관측값과 비교**:
   - 실제 관측값이 어느 quantile 구간에 속하는지 확인
   - 각 quantile 구간에서 관측값과의 거리를 계산

3. **전체 분포 품질 평가**:
   - 모든 quantile 구간에서의 거리를 가중평균
   - 결과적으로 전체 분포가 얼마나 정확한지 한 점수로 표현

예를 들어, 0.1, 0.5, 0.9 quantile을 예측했다면:
- 실제 값이 0.1 quantile보다 작으면 → 0.1 quantile과의 거리로 penalty
- 실제 값이 0.1~0.5 사이에 있으면 → 해당 구간에서의 적절한 거리 계산
- 실제 값이 0.5~0.9 사이에 있으면 → 해당 구간에서의 적절한 거리 계산
- 실제 값이 0.9 quantile보다 크면 → 0.9 quantile과의 거리로 penalty

> 이렇게 모든 quantile 구간에서의 성능을 종합해서 "이 모델이 분포를 얼마나 잘 예측했는가?"를 평가하는 것이 CRPS입니다!




