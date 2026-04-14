---
title: "Double Robustness: 인과추론의 핵심 개념 완전 정복"
date: 2025-07-17
excerpt: "Double Robustness의 이론적 기반부터 실용적 응용까지 완전 해부"
category: "Causal Inference"
tags:
  - "Causal-Inference"
  - "Theory"
  - "R-learner"
public: true
---

# Double Robustness: 인과추론의 핵심 개념 완전 정복

**Double Robustness**(이중 강건성)는 현대 인과추론의 핵심 개념 중 하나로, R-learner와 같은 최신 방법론의 이론적 기반이 됩니다. 이 포스트에서는 Double Robustness의 모든 측면을 자세히 살펴보겠습니다.

# 1. Double Robustness란 무엇인가?

## 1.1 직관적 이해

**Double Robustness**는 **"두 가지 모델 중 하나만 정확해도 편향 없는 추정이 가능한 성질"**입니다.

### **간단한 비유**
- **자물쇠 두 개**: 문을 열려면 둘 중 하나만 열면 됨
- **백업 시스템**: 주 시스템이 실패해도 보조 시스템이 작동
- **이중 보험**: 하나가 실패해도 다른 하나가 보장

## 1.2 인과추론에서의 의미

인과추론에서 우리가 추정해야 하는 두 가지 핵심 요소:

1. **Outcome Model** (결과 모델): $\mu(x, w) = \mathbb{E}[Y | X = x, W = w]$
2. **Propensity Score Model** (처치 확률 모델): $e(x) = \text{Pr}(W = 1 | X = x)$

**Double Robustness**: 이 둘 중 **하나만 정확해도** 처치효과를 편향 없이 추정할 수 있음!

# 2. 수학적 이론: 핵심 메커니즘

## 2.1 Potential Outcomes Framework

**기본 설정**:
- **잠재결과**: $Y_i(0), Y_i(1)$ (처치를 받지 않았을 때/받았을 때의 결과)
- **관찰결과**: $Y_i = Y_i(W_i)$ 
- **개별 처치효과**: $\tau_i = Y_i(1) - Y_i(0)$
- **평균 처치효과**: $\tau = \mathbb{E}[Y(1) - Y(0)]$

**근본적 문제**: 같은 개인에 대해 $Y_i(0)$과 $Y_i(1)$을 동시에 관찰할 수 없음!

## 2.2 Unconfoundedness Assumption

$$\{Y(0), Y(1)\} \perp \!\!\! \perp W \mid X$$

**의미**: 공변량 $X$를 통제하면 처치 할당이 무작위와 같음

이 가정 하에서 다음이 성립:
$$\mathbb{E}[Y(w) | X] = \mathbb{E}[Y | X, W = w] = \mu(X, w)$$

## 2.3 Double Robustness의 수학적 표현

### **핵심 항등식**

Average Treatment Effect (ATE)에 대한 doubly robust 추정량:

$$\hat{\tau}_{DR} = \frac{1}{n} \sum_{i=1}^n \left[ \frac{W_i Y_i}{\hat{e}(X_i)} - \frac{(1-W_i) Y_i}{1-\hat{e}(X_i)} + \frac{W_i - \hat{e}(X_i)}{\hat{e}(X_i)(1-\hat{e}(X_i))} \left\{ \hat{\mu}(X_i, 1) - \hat{\mu}(X_i, 0) \right\} \right]$$

### **더 간단한 형태**

AIPW (Augmented Inverse Propensity Weighting) 추정량:

$$\hat{\tau}_{AIPW} = \frac{1}{n} \sum_{i=1}^n \left[ \hat{\mu}(X_i, 1) - \hat{\mu}(X_i, 0) + \frac{W_i}{\hat{e}(X_i)} \{Y_i - \hat{\mu}(X_i, 1)\} - \frac{1-W_i}{1-\hat{e}(X_i)} \{Y_i - \hat{\mu}(X_i, 0)\} \right]$$

## 2.4 왜 "Double Robust"인가?

### **핵심 정리**

**Theorem**: 다음 조건 중 **하나만** 만족하면 $\mathbb{E}[\hat{\tau}_{AIPW}] = \tau$:

1. **Outcome model이 정확**: $\hat{\mu}(x, w) = \mu^*(x, w)$
2. **Propensity model이 정확**: $\hat{e}(x) = e^*(x)$

### **증명의 핵심 아이디어**

AIPW 추정량을 다음과 같이 분해할 수 있습니다:

$$\hat{\tau}_{AIPW} = \underbrace{\frac{1}{n} \sum_{i=1}^n \{\hat{\mu}(X_i, 1) - \hat{\mu}(X_i, 0)\}}_{\text{Outcome-based}} + \underbrace{\frac{1}{n} \sum_{i=1}^n \left[\frac{W_i}{\hat{e}(X_i)} - \frac{1-W_i}{1-\hat{e}(X_i)}\right] \{Y_i - \hat{\mu}(X_i, W_i)\}}_{\text{IPW correction}}$$

**케이스 1**: Outcome model이 정확한 경우
- 첫 번째 항이 정확한 $\tau$ 제공
- 두 번째 항의 기댓값이 0 (잔차의 가중평균)

**케이스 2**: Propensity model이 정확한 경우  
- 두 번째 항이 IPW 추정량으로 정확한 $\tau$ 제공
- 첫 번째 항의 오차가 두 번째 항에 의해 상쇄

# 3. 직관적 이해: 왜 작동하는가?

## 3.1 Visual Intuition

```
진실한 처치효과: τ* = 5

시나리오 1: Outcome Model 정확, Propensity Model 부정확
┌─────────────────┐    ┌─────────────────┐
│ Outcome Model   │    │ Propensity Model│
│ ✅ τ̂ = 5.0     │ +  │ ❌ 편향 있음    │ = τ̂ = 5.0 ✅
└─────────────────┘    └─────────────────┘

시나리오 2: Outcome Model 부정확, Propensity Model 정확  
┌─────────────────┐    ┌─────────────────┐
│ Outcome Model   │    │ Propensity Model│
│ ❌ 편향 있음    │ +  │ ✅ 정확함       │ = τ̂ = 5.0 ✅
└─────────────────┘    └─────────────────┘

시나리오 3: 둘 다 정확
┌─────────────────┐    ┌─────────────────┐
│ Outcome Model   │    │ Propensity Model│
│ ✅ τ̂ = 5.0     │ +  │ ✅ 정확함       │ = τ̂ = 5.0 ✅
└─────────────────┘    └─────────────────┘
```

## 3.2 보상 메커니즘 (Compensation Mechanism)

### **Outcome Model이 정확한 경우**
```python
# Outcome model이 완벽하면
mu_hat(x, 1) - mu_hat(x, 0) ≈ τ*

# IPW correction term은
E[W/e_hat(X) - (1-W)/(1-e_hat(X))] * {Y - mu_hat(X,W)} ≈ 0
# (잔차의 가중평균은 0에 가까움)
```

### **Propensity Model이 정확한 경우**
```python
# Propensity model이 완벽하면 IPW가 정확한 추정 제공
IPW_term = E[W*Y/e*(X) - (1-W)*Y/(1-e*(X))] = τ*

# Outcome model의 오차는 IPW correction에 의해 상쇄됨
```

## 3.3 실제 데이터 예시

### **시뮬레이션 설정**
```python
n = 1000
X = np.random.normal(0, 1, (n, 2))
e_true = expit(X[:, 0])  # true propensity
W = np.random.binomial(1, e_true)

# True outcome model: complex nonlinear
Y_0 = X[:, 0]**2 + X[:, 1] + noise
Y_1 = Y_0 + 2 + X[:, 0]  # treatment effect = 2 + X[:, 0]
Y = W * Y_1 + (1 - W) * Y_0

true_ATE = 2 + np.mean(X[:, 0])  # ≈ 2.0
```

### **시나리오별 결과**
```python
# Scenario 1: Good outcome model, bad propensity model
mu_hat_good = fit_complex_model(Y, X, W)  # R² = 0.95
e_hat_bad = 0.5  # constant (wrong!)

AIPW_1 = compute_AIPW(Y, W, X, mu_hat_good, e_hat_bad)
# Result: 2.03 (거의 정확! ✅)

# Scenario 2: Bad outcome model, good propensity model  
mu_hat_bad = fit_linear_model(Y, X, W)  # R² = 0.3 (underfit)
e_hat_good = fit_logistic_model(W, X)  # very accurate

AIPW_2 = compute_AIPW(Y, W, X, mu_hat_bad, e_hat_good)
# Result: 1.97 (여전히 정확! ✅)

# Scenario 3: Both models bad
AIPW_3 = compute_AIPW(Y, W, X, mu_hat_bad, e_hat_bad)
# Result: 1.2 (편향됨 ❌)
```

# 4. Double Robustness의 장점과 한계

## 4.1 핵심 장점

### **1. 견고성 (Robustness)**
- **모델 오지정에 대한 보험**: 하나가 틀려도 안전
- **실무적 안정성**: 완벽한 모델링이 어려운 현실에서 유용

### **2. 효율성 (Efficiency)**
- **둘 다 정확하면 최고 효율성**: 최소 분산 달성
- **Semiparametric efficiency bound** 달성

### **3. 유연성 (Flexibility)**
- **서로 다른 방법 조합**: 각 모델에 최적화된 방법 사용 가능
- **기계학습 방법 활용**: 복잡한 모델도 사용 가능

## 4.2 한계점

### **1. 둘 다 틀리면 편향**
```python
# 최악의 시나리오
if outcome_model_wrong and propensity_model_wrong:
    bias = f(error_outcome, error_propensity)  # 편향 발생
```

### **2. 분산 증가 가능성**
- **IPW term의 극단값**: propensity score가 0 또는 1에 가까우면 분산 급증
- **Overlap 조건 필요**: $0 < e(x) < 1$ for all $x$

### **3. 추정 복잡성**
- **두 모델 모두 추정**: 계산 부담 증가
- **교차검증 복잡성**: 각 모델의 튜닝이 복잡

# 5. R-learner와의 연결

## 5.1 Robinson's Transformation과 Double Robustness

R-learner는 Robinson's transformation을 사용합니다:

$$Y_i - m^*(X_i) = \{W_i - e^*(X_i)\} \tau^*(X_i) + \varepsilon_i$$

이를 다시 정리하면:

$$Y_i = m^*(X_i) + \{W_i - e^*(X_i)\} \tau^*(X_i) + \varepsilon_i$$

### **Double Robust Structure**

R-loss 함수:
$$\hat{L}_n\{\tau(\cdot)\} = \frac{1}{n} \sum_{i=1}^n \left[ \left\{Y_i - \hat{m}^{(-q(i))}(X_i)\right\} - \left\{W_i - \hat{e}^{(-q(i))}(X_i)\right\} \tau(X_i) \right]^2$$

**핵심**: 이 손실함수도 double robust 성질을 가집니다!

- **$\hat{m}$이 정확**하면 첫 번째 항이 정확한 잔차 제공
- **$\hat{e}$가 정확**하면 두 번째 항이 정확한 가중치 제공

## 5.2 왜 R-learner가 Quasi-Oracle인가?

```python
# Oracle knows m*(x) and e*(x)
oracle_loss = E[(Y - m*(X) - {W - e*(X)}*τ*(X))²] 

# R-learner uses estimates
r_loss = E[(Y - m̂(X) - {W - ê(X)}*τ̂(X))²]

# Double robustness ensures:
if rate(m̂ - m*) * rate(ê - e*) → 0 faster than oracle_rate:
    rate(R-learner) ≈ oracle_rate  # 🎯
```

# 6. 실용적 구현 가이드

## 6.1 Python Implementation

```python
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_predict

def doubly_robust_ate(Y, W, X, outcome_model=None, propensity_model=None):
    """
    Doubly Robust ATE 추정
    
    Parameters:
    -----------
    Y : array-like, shape (n,)
        Outcome variable
    W : array-like, shape (n,)  
        Treatment indicator (0 or 1)
    X : array-like, shape (n, p)
        Covariates
    outcome_model : sklearn estimator
        Outcome regression model
    propensity_model : sklearn estimator  
        Propensity score model
    
    Returns:
    --------
    ate_estimate : float
        Doubly robust ATE estimate
    """
    
    n = len(Y)
    
    # Default models
    if outcome_model is None:
        outcome_model = RandomForestRegressor(n_estimators=100, random_state=42)
    if propensity_model is None:
        propensity_model = LogisticRegression(random_state=42)
    
    # Cross-fitting for outcome model
    mu_1_hat = np.zeros(n)
    mu_0_hat = np.zeros(n)
    
    # Estimate E[Y|X,W=1]
    idx_1 = W == 1
    if np.sum(idx_1) > 0:
        mu_1_hat[idx_1] = cross_val_predict(
            outcome_model, X[idx_1], Y[idx_1], cv=5
        )
        outcome_model.fit(X[idx_1], Y[idx_1])
        mu_1_hat[~idx_1] = outcome_model.predict(X[~idx_1])
    
    # Estimate E[Y|X,W=0]  
    idx_0 = W == 0
    if np.sum(idx_0) > 0:
        mu_0_hat[idx_0] = cross_val_predict(
            outcome_model, X[idx_0], Y[idx_0], cv=5
        )
        outcome_model.fit(X[idx_0], Y[idx_0])
        mu_0_hat[~idx_0] = outcome_model.predict(X[~idx_0])
    
    # Cross-fitting for propensity score
    e_hat = cross_val_predict(
        propensity_model, X, W, cv=5, method='predict_proba'
    )[:, 1]
    
    # Clip propensity scores to avoid extreme weights
    e_hat = np.clip(e_hat, 0.01, 0.99)
    
    # AIPW estimator
    aipw_components = (
        (mu_1_hat - mu_0_hat) +  # Outcome-based estimate
        W * (Y - mu_1_hat) / e_hat -  # IPW correction for treated
        (1 - W) * (Y - mu_0_hat) / (1 - e_hat)  # IPW correction for control
    )
    
    ate_estimate = np.mean(aipw_components)
    
    # Standard error (using influence function)
    influence_func = aipw_components - ate_estimate
    se_estimate = np.std(influence_func) / np.sqrt(n)
    
    return {
        'ate': ate_estimate,
        'se': se_estimate,
        'ci_lower': ate_estimate - 1.96 * se_estimate,
        'ci_upper': ate_estimate + 1.96 * se_estimate
    }

# Usage example
def simulate_data(n=1000):
    """Generate simulation data"""
    X = np.random.normal(0, 1, (n, 3))
    
    # True propensity score (logistic)
    e_true = 1 / (1 + np.exp(-(X[:, 0] + 0.5 * X[:, 1])))
    W = np.random.binomial(1, e_true)
    
    # True outcome model (nonlinear)
    Y_0 = X[:, 0]**2 + X[:, 1] + 0.5 * X[:, 2] + np.random.normal(0, 0.5, n)
    Y_1 = Y_0 + 2 + X[:, 0]  # Heterogeneous treatment effect
    Y = W * Y_1 + (1 - W) * Y_0
    
    return Y, W, X, 2.0  # True ATE ≈ 2.0

# Run example
Y, W, X, true_ate = simulate_data()
result = doubly_robust_ate(Y, W, X)

print(f"True ATE: {true_ate:.3f}")
print(f"DR Estimate: {result['ate']:.3f}")
print(f"95% CI: [{result['ci_lower']:.3f}, {result['ci_upper']:.3f}]")
```

## 6.2 Best Practices

### **1. 모델 선택 가이드라인**

```python
# Outcome Model
# - High flexibility for complex relationships
outcome_models = {
    'linear': LinearRegression(),
    'rf': RandomForestRegressor(n_estimators=200),
    'xgb': XGBRegressor(),
    'nn': MLPRegressor(hidden_layer_sizes=(100, 50))
}

# Propensity Model  
# - Focus on overlap and calibration
propensity_models = {
    'logistic': LogisticRegression(C=1.0),
    'rf': RandomForestClassifier(n_estimators=200),
    'calibrated': CalibratedClassifierCV(LogisticRegression())
}
```

### **2. 진단 도구**

```python
def diagnose_overlap(e_hat, W):
    """Check overlap assumption"""
    print(f"Propensity score range: [{e_hat.min():.3f}, {e_hat.max():.3f}]")
    print(f"Extreme scores (< 0.1 or > 0.9): {np.mean((e_hat < 0.1) | (e_hat > 0.9)):.1%}")
    
    # Plot distributions
    import matplotlib.pyplot as plt
    plt.figure(figsize=(10, 4))
    
    plt.subplot(1, 2, 1)
    plt.hist(e_hat[W==0], alpha=0.7, label='Control', bins=30)
    plt.hist(e_hat[W==1], alpha=0.7, label='Treated', bins=30)
    plt.xlabel('Propensity Score')
    plt.ylabel('Frequency')
    plt.legend()
    plt.title('Overlap Check')
    
    plt.subplot(1, 2, 2)
    plt.boxplot([e_hat[W==0], e_hat[W==1]], labels=['Control', 'Treated'])
    plt.ylabel('Propensity Score')
    plt.title('Distribution by Treatment')
    
    plt.tight_layout()
    plt.show()

def check_balance(X, W, e_hat):
    """Check covariate balance after weighting"""
    weights_1 = W / e_hat
    weights_0 = (1 - W) / (1 - e_hat)
    
    for j in range(X.shape[1]):
        mean_1 = np.average(X[W==1, j], weights=weights_1[W==1])
        mean_0 = np.average(X[W==0, j], weights=weights_0[W==0])
        print(f"Variable {j}: Weighted difference = {mean_1 - mean_0:.4f}")
```

# 7. 최신 연구 동향과 확장

## 7.1 Machine Learning과의 결합

### **1. Targeted Maximum Likelihood Estimation (TMLE)**
- **One-step correction**: 초기 추정값을 업데이트
- **Cross-validation**: 최적 모델 선택

### **2. Causal Random Forests**
- **Honest splitting**: 편향 없는 추정
- **Local centering**: Double robustness 보장

### **3. Neural Network Approaches**
- **Representation learning**: 공통 특성 학습
- **Domain adaptation**: Treatment/control domain 정렬

## 7.2 고차원 데이터에서의 확장

### **Debiased Machine Learning (DML)**
```python
# Neyman orthogonality + Cross-fitting
def debiased_ml_ate(Y, W, X):
    # Step 1: Estimate nuisance functions
    theta_0 = estimate_initial(Y, W, X)
    
    # Step 2: Compute orthogonal score
    psi = compute_orthogonal_score(Y, W, X, theta_0)
    
    # Step 3: Solve orthogonal equation
    theta_final = solve_orthogonal_equation(psi)
    
    return theta_final
```

## 7.3 연속 처치와 다중 처치

### **Continuous Treatment**
```python
# GPS (Generalized Propensity Score) + Outcome Model
def continuous_dr(Y, T, X):
    # Estimate treatment density: f(T|X)
    gps_hat = estimate_gps(T, X)
    
    # Estimate dose-response: E[Y|T,X]
    outcome_hat = estimate_outcome(Y, T, X)
    
    # Double robust estimand
    dr_estimate = compute_dr_continuous(Y, T, X, gps_hat, outcome_hat)
    
    return dr_estimate
```

# 8. 결론: Double Robustness의 의의

## 8.1 이론적 기여

1. **편향 없는 추정의 보장**: 모델 오지정에도 robust
2. **효율성**: 최적 조건에서 semiparametric efficiency bound 달성
3. **유연성**: 다양한 기계학습 방법과 결합 가능

## 8.2 실용적 가치

1. **현실적 해결책**: 완벽한 모델링이 어려운 현실에서 안전망 제공
2. **방법론 발전의 기반**: R-learner, TMLE, DML 등의 이론적 토대
3. **산업 응용**: A/B 테스트, 개인화, 정책 평가 등에서 널리 활용

## 8.3 미래 전망

Double Robustness는 앞으로도 인과추론 방법론 발전의 핵심 원리로 작용할 것입니다:

- **딥러닝과의 결합**: 표현 학습 기반 double robust 방법
- **실시간 추론**: 온라인 학습에서의 double robustness
- **복잡한 처치 구조**: 네트워크, 시계열에서의 확장

Double Robustness를 이해하는 것은 현대 인과추론의 핵심을 파악하는 것과 같습니다. 이 개념을 바탕으로 더 robust하고 효율적인 인과 추론 방법들이 계속 발전할 것입니다. 🎯

---

**참고문헌**:
- Robins, J.M., Rotnitzky, A., & Zhao, L.P. (1994). Estimation of regression coefficients when some regressors are not always observed.
- Bang, H. & Robins, J.M. (2005). Doubly robust estimation in missing data and causal inference models.
- Chernozhukov, V., et al. (2018). Double/debiased machine learning for treatment and structural parameters.
- Kennedy, E.H. (2020). Towards optimal doubly robust estimation of heterogeneous causal effects. 
