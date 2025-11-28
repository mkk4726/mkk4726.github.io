---
title: "ML의 prediction interval은 어떻게 정의할 수 있을까?"
date: "2025-08-12"
excerpt: "ML의 prediction interval 정의하는 법 정리"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1 : [Confidence vs Prediction Intervals: Understanding the Difference](https://www.datacamp.com/blog/confidence-intervals-vs-prediction-intervals)
- 2 : [IBM Developer - Prediction intervals explained: A LightGBM tutorial](https://developer.ibm.com/articles/prediction-intervals-explained-a-lightgbm-tutorial/)





## Prediction Interval vs Confidence Interval

- **Prediction Interval (PI)**: 새 관측치 $Y$가 주어진 $X$에서 포함될 구간. 조건부 coverage를 목표로 함.
$$
\mathbb{P}\big( Y \in [L_\alpha(X),\ U_\alpha(X)]\mid X\big) \ge 1-\alpha
$$

- **Confidence Interval (CI)**: 조건부 평균 $\mu(X)=\mathbb{E}[Y\mid X]$ 같은 모수적 target이 구간에 포함될 확률.
$$
\mathbb{P}\big( \mu(X)\in \hat C_\alpha(X) \big) \ge 1-\alpha
$$

- 핵심 차이: CI는 mean estimator의 불확실성(주로 epistemic)을, PI는 mean 주변의 noise(aleatoric)까지 포함해 “개별 예측값”의 불확실성을 다룸. 따라서 동일한 설정에서 PI의 폭이 CI보다 넓음.


## ML에서의 불확실성 (Uncertainty)

- **Aleatoric uncertainty (우연적 불확실성)**: 데이터 자체의 내재적 변동성(heteroscedastic noise 포함). 더 많은 데이터로도 완전히 제거되지 않음. 예: 측정 오차, 자연적인 변동성.

- **Epistemic uncertainty (인식론적 불확실성)**: 모델/파라미터에 대한 불확실성. 데이터가 많아지면 감소. 예: 모델 파라미터 추정의 불확실성, 모델 구조의 한계.

- **CI vs PI**: CI는 주로 epistemic uncertainty를, PI는 epistemic + aleatoric uncertainty 모두를 다룸. 따라서 동일한 설정에서 PI의 폭이 CI보다 넓음.

- **Calibration**: 목표 coverage(예: 90%)에 실제 커버리지가 맞도록 조정.

- **Coverage 유형**: marginal vs conditional. 실무에서는 분포 가정이 약할 때도 사용할 수 있는 marginal coverage 도구(예: conformal)가 유용.


## LightGBM에서 Prediction Interval (참고 2)

LGBM에서 prediction interval 기능도 제공하는구나. quantile-regression 기반.

> When you are performing regression tasks, you have the option of generating prediction intervals by using quantile regression, which is a fancy way of estimating the median value for a regression value in a specific quantile.
> Simply put, a prediction interval is just about generating a lower and upper bound on the final regression value. 
> This is incredibly important for some tasks, which I explain in this article

### Why use them? (them -> prediction interval)
> You can never be 100 percent certain about one prediction from one model. 
> Instead, the idea is to give an interval back to a person who ends up controlling the final decision based on the range that is given by the model.

### Quantile regression
> In the typical linear regression model, you track the mean difference from the ground truth to optimize the model. 
> However, in quantile regression, as the name suggests, you track a specific quantile (also known as a percentile) against the median of the ground truth.

### Quantile and assumptions

> Using the median approach lets you specify the quantiles

**중앙값(median) 접근법의 장점:**

- **분위수 지정 가능**: 5% 분위수(데이터의 5%를 포함)와 95% 분위수(데이터의 95%를 포함)를 지정하여 하한과 상한 경계를 설정할 수 있습니다.

- **Outlier에 강함**: 평균(mean)을 사용할 때는 outlier가 있으면 예측 성능이 떨어질 수 있습니다. 평균은 outlier 값에 크게 영향을 받기 때문입니다. 중앙값을 사용하면 outlier에 덜 민감하여 더 나은 하한과 상한 경계를 만들 수 있습니다.

- **분포 가정 불필요**: 선형 회귀와 달리 데이터의 분포에 대한 가정을 하지 않아, 특정 상황에서 더 유용하고 정확합니다.

### Regression

$$
L = \begin{cases} 
\alpha(y - X\theta), & \text{if } (y - X\theta) \geq 0 \\ 
(\alpha - 1)(y - X\theta), & \text{if } (y - X\theta) < 0 
\end{cases}
$$

> That changes in quantile regression because you must be able to account for the different quantiles.
> - When the alpha is high (for example, 0.95), the errors that are less than zero receive a lower error value than if they are greater than zero.
> - When the alpha is low (for example, 0.05), the errors that are less than zero receive a higher error value than if they are greater than zero, where they receive a smaller error value

### python code

```python
import lightgbm as lgb

regressor = lgb.LGBMRegressor()
regressor.fit(x_train, y_train)
regressor_pred = regressor.predict(x_test)

lower = lgb.LGBMRegressor(objective = 'quantile', alpha = 1 - 0.95)
lower.fit(x_train, y_train)
lower_pred = lower.predict(x_test)

upper = lgb.LGBMRegressor(objective = 'quantile', alpha = 0.95)
upper.fit(x_train, y_train)
upper_pred = upper.predict(x_test)

plt.figure(figsize=(10, 6))

plt.scatter(x_test.MedInc, lower_pred, color='limegreen', marker='o', label='lower', lw=0.5, alpha=0.5)
plt.scatter(x_test.MedInc, regressor_pred, color='aqua', marker='x', label='pred', alpha=0.7)
plt.scatter(x_test.MedInc, upper_pred, color='dodgerblue', marker='o', label='upper', lw=0.5, alpha=0.5)
plt.plot(sorted(x_test.MedInc), sorted(lower_pred), color='black')
plt.plot(sorted(x_test.MedInc), sorted(regressor_pred), color='red')
plt.plot(sorted(x_test.MedInc), sorted(upper_pred), color='black')
plt.legend()

plt.show()
```





## 구현 방법들

### 1 Quantile Regression

- 아이디어: $\tau$-quantile 함수 $q_\tau(x)$를 직접 학습해 $[q_\alpha(x), q_{1-\alpha}(x)]$를 PI로 사용.
- Loss(“pinball loss”):
$$
\mathcal{L}_\tau\big(y, \hat q_\tau(x)\big)
= \max\big(\, \tau\,[y-\hat q_\tau(x)],\ (\tau-1)[y-\hat q_\tau(x)]\,\big)
$$
- 구현 팁:
  - 두 모델(or multi-head)로 $q_\alpha, q_{1-\alpha}$ 동시 학습
  - quantile crossing 방지: monotonicity penalty 또는 joint training
- 장점: heteroscedastic noise에 강함, 분포 가정 최소화. 단점: calibration 보장은 없음(사후 조정 가능).

### 2 Conformal Prediction

- 가정: 예측 시점과 calibration 데이터가 exchangeable.
- Split conformal(대중적 실무 절차):
  1. 데이터 분할: train / calibration
  2. train으로 predictor $\hat f$ 학습
  3. calibration에서 비적합도(nonconformity) 계산. 대칭 PI의 경우 $r_i = |y_i - \hat f(x_i)|$
  4. $\hat Q$ = $(1-\alpha)(1+1/n_{cal})$-quantile of $\{r_i\}$
  5. 새 입력 $x$에 대해 $[\hat f(x)-\hat Q,\ \hat f(x)+\hat Q]$

- Quantile 기반(CQR): quantile regressors $\hat q_\alpha, \hat q_{1-\alpha}$의 비적합도
$$
e_i = \max\big(\hat q_\alpha(x_i)-y_i,\ y_i-\hat q_{1-\alpha}(x_i),\ 0\big)
$$
  를 통해 $\hat Q$를 구하고, 최종 구간을 $[\hat q_\alpha(x)-\hat Q,\ \hat q_{1-\alpha}(x)+\hat Q]$로 설정.

- 장점: 분포/모델에 거의 비의존적이며 finite-sample marginal coverage 보장. 단점: 데이터 분할 필요, conditional coverage는 일반적으로 미보장.

### 3 Ensemble Methods

- Bootstrap ensemble, Random Forest, Deep Ensemble 등으로 여러 예측 $\{\hat f_k(x)\}_{k=1}^K$을 얻어 분산을 추정.
- 단순히 ensemble 분산으로 $\hat f(x) \pm z\cdot \hat\sigma_{ens}(x)$를 만들면 calibration이 보장되지 않음.
- 실무 팁: **Jackknife+ / Bootstrap+** 같은 conformalized ensemble을 사용하면 finite-sample coverage에 가까운 보정을 달성.
  - 예: Jackknife+는 leave-one-out 예측 분포를 이용해 하한/상한의 적절한 order statistic을 취해 구간 구성.
- 장점: 구현 용이, epistemic 반영. 단점: 데이터/계산 비용 증가, 별도 calibration 권장.

### 4 Bayesian Approaches

- 목표: posterior predictive $p(y\mid x, \mathcal{D})$로부터 구간 산출.
$$
p(y\mid x, \mathcal{D}) 
= \int p(y\mid x, \theta)\, p(\theta\mid \mathcal{D})\, d\theta
$$
- 구현 예: Bayesian Linear Regression, Gaussian Process, MC Dropout(Bayesian approximation), Stochastic VI, Laplace Approximation 등.
- 절차: posterior predictive의 quantile을 취해 PI 구성.
- 장점: 불확실성 분해 가능(epistemic/aleatoric), 해석력. 단점: 모델/사전 분포에 민감, 대규모 딥러닝에서 근사 필요.

### 5 MAE 기반 Prediction Interval

MAE(Mean Absolute Error)를 기반으로 prediction interval을 구성하는 방법도 있습니다.

#### 기본 아이디어
- **MAE의 의미**: 예측값과 실제값 간의 평균 절대 오차
- **분포 가정**: 오차가 대칭 분포를 따른다고 가정할 때, MAE를 이용해 prediction interval을 구성할 수 있음

#### 구현 방법

**1. 단순 MAE 기반**
```python
# MAE 계산
mae = np.mean(np.abs(y_true - y_pred))

# Prediction interval 구성 (대칭 분포 가정)
# 90% coverage를 위한 경우
alpha = 0.1
z_score = norm.ppf(1 - alpha/2)  # 1.645 for 90% coverage

# MAE를 표준편차로 변환 (Laplace 분포 가정)
# Laplace 분포에서 MAE = σ√2, 따라서 σ = MAE/√2
sigma_est = mae / np.sqrt(2)

# Prediction interval
lower_bound = y_pred - z_score * sigma_est
upper_bound = y_pred + z_score * sigma_est
```

**2. Heteroscedastic MAE 기반**
```python
# 각 예측값별로 MAE를 계산 (예: binning 또는 local averaging)
def heteroscedastic_mae_based_pi(y_pred, y_true, x_features, bins=10):
    # 예측값을 기준으로 binning
    pred_bins = pd.cut(y_pred, bins=bins)
    
    # 각 bin별로 MAE 계산
    bin_mae = {}
    for bin_name in pred_bins.cat.categories:
        mask = pred_bins == bin_name
        if mask.sum() > 0:
            bin_mae[bin_name] = np.mean(np.abs(y_true[mask] - y_pred[mask]))
    
    # 각 예측값에 대해 해당 bin의 MAE 사용
    pi_bounds = []
    for i, pred in enumerate(y_pred):
        bin_name = pred_bins.iloc[i]
        if bin_name in bin_mae:
            mae_local = bin_mae[bin_name]
            sigma_local = mae_local / np.sqrt(2)
            
            # 90% coverage
            z_score = 1.645
            lower = pred - z_score * sigma_local
            upper = pred + z_score * sigma_local
            pi_bounds.append((lower, upper))
        else:
            pi_bounds.append((pred, pred))
    
    return np.array(pi_bounds)
```

#### 장단점

**장점:**
- **구현 간단**: 복잡한 모델링 없이 기존 MAE 지표를 활용
- **해석 용이**: MAE의 의미를 그대로 prediction interval에 반영
- **계산 효율**: 추가적인 모델 학습이나 복잡한 추론 과정 불필요

**단점:**
- **분포 가정**: 오차가 대칭 분포를 따른다는 가정이 필요
- **Coverage 보장 없음**: 실제 coverage가 목표 coverage와 일치하지 않을 수 있음
- **Homoscedastic 가정**: 기본적으로는 모든 예측값에 동일한 불확실성을 적용

#### 개선 방안

**1. Calibration 적용**
```python
def calibrate_mae_based_pi(y_pred, y_true, target_coverage=0.9):
    # 초기 MAE 기반 PI 생성
    mae = np.mean(np.abs(y_true - y_pred))
    initial_pi = mae * 1.645  # 90% coverage
    
    # Calibration을 위한 scaling factor 찾기
    empirical_coverage = np.mean(
        (y_true >= y_pred - initial_pi) & 
        (y_true <= y_pred + initial_pi)
    )
    
    # Scaling factor 조정
    scaling_factor = target_coverage / empirical_coverage
    calibrated_pi = initial_pi * scaling_factor
    
    return calibrated_pi
```

**2. Ensemble MAE 활용**
```python
def ensemble_mae_based_pi(ensemble_predictions, y_true):
    # Ensemble 예측값들의 표준편차 계산
    pred_std = np.std(ensemble_predictions, axis=0)
    
    # MAE 계산
    ensemble_mean = np.mean(ensemble_predictions, axis=0)
    mae = np.mean(np.abs(y_true - ensemble_mean))
    
    # MAE와 ensemble 분산을 결합
    combined_uncertainty = np.sqrt(mae**2 + pred_std**2)
    
    # Prediction interval 구성
    z_score = 1.645  # 90% coverage
    lower_bound = ensemble_mean - z_score * combined_uncertainty
    upper_bound = ensemble_mean + z_score * combined_uncertainty
    
    return lower_bound, upper_bound
```

#### 실무 적용 시 고려사항

- **데이터 특성**: 오차의 분포가 대칭에 가까운지 확인
- **Calibration 필수**: 실제 coverage와 목표 coverage 간의 차이를 보정
- **Heteroscedasticity**: 예측값에 따라 불확실성이 달라지는 경우 local MAE 사용 고려
- **Ensemble과 결합**: MAE의 장점과 ensemble의 epistemic uncertainty 추정을 결합하여 더 robust한 PI 구성


## 실무 체크리스트

- **Coverage vs Width**: 목표 coverage(예: 90%)를 달성하면서 구간 폭을 최소화.
- **Calibration plot**: nominal vs empirical coverage 곡선 확인.
- **Shift robustness**: OOD 상황에서 coverage 붕괴 가능 → 위험구간 탐지, abstention, 최근접-밀도 기반 보완 고려.
- **메소드 선택 가이드**
  - 데이터가 크고 분포 가정이 약함: Conformal(CQR) 우선
  - Heteroscedastic 뚜렷: Quantile Regression(+ conformal calibration)
  - Ensemble을 이미 사용: Jackknife+/Bootstrap+로 conformalize
  - Probabilistic modeling 선호/가능: Bayesian posterior predictive
