---
title: "R-learner란?"
date: "2025-07-23"
excerpt: "R-learner의 개념에 대해 정리"
category: "Causal Inference"
tags: ["R-learner", "인과추론"]
---

R-learner는 CATE estimation에 사용되는 meta-learner 중 하나입니다.
이에 대해 하나씩 정리헀습니다.

# 1. CATE estimation이란?
---

인과추론 (Causal Inference)의 목적은 처치의 효과를 추정하는데에 있습니다.
처치가 결과에 어떤 영향을 미치는지 확인하고 이를 통해 더 좋은 결정을 내릴 수 있습니다.

## 1.1 ATE란?

> ATE(Average Treatment Effect)는 전체 집단에서 처치(예: 신약, 정책 등)가 미치는 평균적인 인과 효과를 의미합니다.

$$
\text{ATE} = \mathbb{E}[Y^{(t)} - Y^{(0)}]
$$
여기서 $$Y^{(t)}$$은 처치를 받았을 때의 잠재적 결과 (Potential Outcome)이고, $$Y^{(0)}$$은 처치를 받지 않았을 때의 잠재적 결과입니다.

즉 처치를 받았을 때의 평균적인 인과효과를 의미합니다.


## 1.2 CATE란?

> CATE(Conditional Average Treatment Effect)는 특정 조건에서 처치가 미치는 평균적인 인과 효과를 의미합니다.

$$
\text{CATE} = \tau(x) = \mathbb{E}[Y^{(t)} - Y^{(0)} | X = x]
$$
여기서 $$X$$는 조건을 의미하고, $$Y^{(t)}$$는 처치를 받았을 때의 잠재적 결과, $$Y^{(0)}$$는 처치를 받지 않았을 때의 잠재적 결과를 의미합니다.

ATE를 통해 처치의 평균적인 인과효과(처치가 결과에 미치는 영향)을 추정했습니다.
다만 개개인별로 인과효과가 다르다는 것은 직관적인데요, 이러한 개별 개체의 처치효과를 ITE라고 합니다.

> ITE (Individual Treatment Effect)
> - 정의: 개별 개체의 처치 효과
> - 수식: $$\text{ITE}_i = Y_i^{(1)} - Y_i^{(0)}$$
> - 의미: 특정 개인이 처치를 받았을 때와 받지 않았을 때의 결과 차이
> - 특징: 실제로는 관찰 불가능 (fundamental problem of causal inference)

그리고 이를 추정하는 값이 CATE 입니다.

> Estimating heteronenous treatment effects is fundamental in causal inference and provides insights into various fields.
>
> -> Towards R-learner with Continuous Treatment

개인별 처치효과를 추정하는 일은 다양한 분야에서 핵심적인 역할을 합니다.
학생별 교육효과를 추정해 개인화된 교육 프로그램을 실행하거나, 환자별 처치효과를 추정해 개인화된 처치를 실행할 수 있습니다.


# 2. CATE estimation에 사용되는 meta-learner들
---

메타러너 (meta-learner)는 기존 예측 머신러닝 알고리즘을 활용해서 처치효과를 추정하는 간단한 방법입니다.
cate estimation을 위해 사용되는 meta-learner에는 대표적으로 T-learner, X-learner, S-learner가 있습니다.

## 2.1 T-learner

범주형 처치를 다룰 때 사용할 수 있는 메타러너입니다.

$$
\hat{\mu}_0(x) = \mathbb{E}[Y | T=0, X = x] \\
\hat{\mu}_1(x) = \mathbb{E}[Y | T=1, X = x] \\
\hat{\tau}(x) = \hat{\mu}_1(x) - \hat{\mu}_0(x)
$$

<figure style="text-align: center;">
  <img src="/post/Causal_Inference/T-learner.png" alt="T-learner" style="display: block; margin: 0 auto;" />
  <figcaption style="text-align: center;">
    그림 1 : T-learner 구조<br/>
    <a href="https://matheusfacure.github.io/python-causality-handbook/21-Meta-Learners.html" target="_blank" style="font-size: 0.8em; color: #fff;">출처: Causal Inference for The Brave and True</a>
  </figcaption>
</figure>

그림1에서 보이는 것처럼, 처치별로 각각의 예측 모델을 만들고 이 모델의 예측결과를 비교해 CATE를 추정합니다.

```python
m0 = LGBMRegressor(max_depth=2, min_child_samples=60)
m1 = LGBMRegressor(max_depth=2, min_child_samples=60)

m0.fit(train.query(f"{T}==0")[X], train.query(f"{T}==0")[y])
m1.fit(train.query(f"{T}==1")[X], train.query(f"{T}==1")[y])

# estimate the CATE
t_learner_cate_train = m1.predict(train[X]) - m0.predict(train[X])
t_learner_cate_test = test.assign(cate=m1.predict(test[X]) - m0.predict(test[X]))
```

## 2.2 S-learner (aka, the Go-Horse Learner)

S러너는 가장 기본적인 방식으로, 단일 머신러닝 모델을 사용하여 추정합니다.

$$
\hat{\mu}(x) = E[Y | X = x] \\
\hat{\tau}(x) = \hat{\mu}(x, T=1) - \hat{\mu}(x, T=0)
$$

<figure style="text-align: center;">
  <img src="/post/Causal_Inference/S-learner.png" alt="S-learner" style="display: block; margin: 0 auto;" />
  <figcaption style="text-align: center;">
    그림 2 : S-learner 구조<br/>
    <a href="https://matheusfacure.github.io/python-causality-handbook/21-Meta-Learners.html" target="_blank" style="font-size: 0.8em; color: #fff;">출처: Causal Inference for The Brave and True</a>
  </figcaption>
</figure>

그림2에서 보이는 것처럼 모든 처치에 대해 예측하는 모델을 만들고, 이 모델을 통해 CATE를 추정합니다.

```python
s_learner = LGBMRegressor(max_depth=3, min_child_samples=30)
s_learner.fit(train[X+[T]], train[y]);

s_learner_cate_train = (s_learner.predict(train[X].assign(**{T: 1})) -
                        s_learner.predict(train[X].assign(**{T: 0})))

s_learner_cate_test = test.assign(
    cate=(s_learner.predict(test[X].assign(**{T: 1})) - # predict under treatment
          s_learner.predict(test[X].assign(**{T: 0}))) # predict under control
)
```

이 모델은 CATE estimation에 사용되는 메타러너 중에 가장 쉽게 적용해볼 수 있는 모델이지만, 편향에 가장 취약한 모델이기도 합니다.

## 2.3 X-learner


<figure style="text-align: center;">
  <img src="/post/Causal_Inference/X-learner.png" alt="X-learner" style="display: block; margin: 0 auto;" />
  <figcaption style="text-align: center;">
    그림 3 : X-learner 구조<br/>
    <a href="https://matheusfacure.github.io/python-causality-handbook/21-Meta-Learners.html" target="_blank" style="font-size: 0.8em; color: #fff;">출처: Causal Inference for The Brave and True</a>
  </figcaption>
</figure>


X-learner는 2단계로 구성되어 있습니다.

1단계에서는 T-learner와 마찬가지로 처치별로 데이터를 나눠 모델을 학습시킵니다.

$$
\hat{M}_0(X) \approx \mathbb{E}[Y | T=0, X] \\
\hat{M}_1(X) \approx \mathbb{E}[Y | T=1, X]
$$

2단계에서는 1단계에서 학습시킨 모델로 추정된 CATE를 계산합니다.

$$
\hat{\tau}(X, T=0) = \hat{M}_0(X) - Y_{T=0} \\
\hat{\tau}(X, T=1) = \hat{M}_1(X) - Y_{T=1}
$$

그 후에 이를 예측하는 모델을 학습시킵니다.

$$
\hat{M}_{\tau 0}(X) = E[\hat\tau(X) | T = 0] \\
\hat{M}_{\tau 1}(X) = E[\hat\tau(X) | T = 1]
$$

마지막으로 이 모델의 결과를 보완해주기 위해서 propensity score를 사용합니다.

학습을 위한 $\hat{\tau}(X, T=0)$ 을 추정할 때 $Y_1$ 이 없기 때문에 $\hat{M}_1$을 사용해서 이를 추정했습니다.
이때 X가 0일 확률이 높다면 $\hat{M}_1$의 예측값의 성능이 떨어질 것이고, 이로 인해 $\hat{\tau}(X, T=0)$의 추정값도 신뢰가 떨어질 것입니다.
반대로 \hat{\tau}(X, T=0)$의 추정값의 신뢰도는 올라갈 것입니다.

이러한 직관을 가지고 propensity score를 사용해서 보완합니다.

$$
\hat{\tau}(X) = \hat{M}_{\tau 0}(X)\hat e(x) - \hat{M}_{\tau 1}(X)(1-\hat e(x))
$$

```python
from sklearn.linear_model import LogisticRegression

np.random.seed(123)

# first stage models
m0 = LGBMRegressor(max_depth=2, min_child_samples=30)
m1 = LGBMRegressor(max_depth=2, min_child_samples=30)

# propensity score model
g = LogisticRegression(solver="lbfgs", penalty='none') 

m0.fit(train.query(f"{T}==0")[X], train.query(f"{T}==0")[y])
m1.fit(train.query(f"{T}==1")[X], train.query(f"{T}==1")[y])
                       
g.fit(train[X], train[T]);
```

```python
d_train = np.where(train[T]==0,
                   m1.predict(train[X]) - train[y],
                   train[y] - m0.predict(train[X]))

# second stage
mx0 = LGBMRegressor(max_depth=2, min_child_samples=30)
mx1 = LGBMRegressor(max_depth=2, min_child_samples=30)

mx0.fit(train.query(f"{T}==0")[X], d_train[train[T]==0])
mx1.fit(train.query(f"{T}==1")[X], d_train[train[T]==1]);
```

```python
def ps_predict(df, t): 
    return g.predict_proba(df[X])[:, t]
    
    
x_cate_train = (ps_predict(train,1)*mx0.predict(train[X]) +
                ps_predict(train,0)*mx1.predict(train[X]))

x_cate_test = test.assign(cate=(ps_predict(test,1)*mx0.predict(test[X]) +
                                ps_predict(test,0)*mx1.predict(test[X])))
```


# 3. R-learner란? 다른 meta-learner들과 비교
---

R-learner는 FWL-theorem을 meta-learner 형태로 구현한 모델입니다.
[FWL theorem이란?](/posts/Causal%20Inference/what-is-fwl)
조금 더 엄밀하게 이야기하면 double/debiased machine learning이라고 말할 수 있고,
여기에 propensity score를 함께 사용해 편향을 보정하는 모델이 R-learner입니다.

편향을 nuisance function을 통해 잔차화하여 제거하고, CATE를 추정합니다.
이때 nuisance function들은 기존의 예측 모델을 통해 쉽게 구현되며, CATE estimation에 사용되는 모델도 마찬가지입니다.
따라서 다중회귀모델과 다르게 비선형성을 포착할 수 있습니다.

R-learner는 다른 meta-learner들과 다르게 이 모델은 CATE를 직접적으로 추정하고 있습니다.
따라서 다른 모델보다 CATE를 더 잘 추정한다고 알려져 있습니다.

또한 회귀모델을 통한 잔차화와 propensity score를 통한 잔차화를 진행해 doubly robust 합니다.

# 4. Double robustness란?
---

편향을 제거하기 위한 방법에는 회귀를 통한 잔차화와 propensity score를 통한 방법이 있습니다.
회귀를 통한 잔차화는 FWL-theorem에 기반하고 있습니다.

propensity score를 통한 잔차화의 컨셉은 X를 통제할 수 없다면 e(X)를 통제해서, X를 통제한 것과 같은 상태를 만들자는 것입니다.

참고자료
- [PropensityScoreNotebook.ipynb](/posts/Causal%20Inference/Causal%20Inference%20for%20The%20Brave%20and%20True/PropensityScoreNotebook)
- [Causal Inference for The Brave and True - Propensity Score](https://matheusfacure.github.io/python-causality-handbook/11-Propensity-Score.html)

R-leaner는 이 2가지 모두를 사용해 편향을 없애고 있고, 이를 위한 2개의 모델 중 하나의 성능만 보장되면 나머지 하나의 성능이 부족하더라도 CATE estimation의 성능이 보장된다고 합니다.

## 4.1 ATE에서 doubly robust estimation

$$
\hat{\text{ATE}} = \frac{1}{N} \sum (\frac{T_i(Y_i - \hat \mu_1(X_i))}{\hat P(X_i)} + \hat \mu_1(X_i)) - \frac{1}{N} \sum (\frac{(1-T_i)(Y_i - \hat \mu_0(X_i))}{1 - \hat P(X_i)} + \hat \mu_0(X_i)) \tag{1}
$$

1번 수식에서 앞에 부분은 $\hat E[Y | X, T=1]$ 의 추정값이고, 뒤에 부분은 $\hat E[Y | X, T=0]$ 의 추정값입니다.


$\hat E[Y | X, T=1]$에 대해서 doubly robust가 성립하는지 살펴보고 이를 기반해서 $\hat E[Y | X, T=0]$에 대해서는 유추해보록 하겠습니다.

$$
\hat E[Y_1] = \frac{1}{N} \sum (\frac{T_i(Y_i - \hat \mu_1(X_i))}{\hat P(X_i)} + \hat \mu_1(X_i)) \tag{2}
$$

1. $\hat \mu_1(X_i)$ 가 정확하고 propensity score가 부정확할 때.

식 2에서 $\frac{T_i(Y_i - \hat \mu_1(X_i))}{\hat P(X_i)}$ 부분이 0이 되기 때문에 결과가 보장됩니다.

$$
\begin{align*}
\hat{\mathbb{E}}[Y_1] &= \frac{1}{N} \sum \left( \frac{T_i (Y_i - \hat{\mu}_1(X_i))}{\hat{P}(X_i)} + \hat{\mu}_1(X_i) \right) \\\\
\hat{\mathbb{E}}[Y_1] &= \frac{1}{N} \sum \left( \frac{T_i Y_i}{\hat{P}(X_i)} - \frac{T_i \hat{\mu}_1(X_i)}{\hat{P}(X_i)} + \hat{\mu}_1(X_i) \right) \\\\
\hat{\mathbb{E}}[Y_1] &= \frac{1}{N} \sum \left( \frac{T_i Y_i}{\hat{P}(X_i)} - \left( \frac{T_i}{\hat{P}(X_i)} - 1 \right) \hat{\mu}_1(X_i) \right) \\\\
\hat{\mathbb{E}}[Y_1] &= \frac{1}{N} \sum \left( \frac{T_i Y_i}{\hat{P}(X_i)} - \left( \frac{T_i - \hat{P}(X_i)}{\hat{P}(X_i)} \right) \hat{\mu}_1(X_i) \right)
\end{align*} \tag{3}
$$

2. propensity score가 정확하고 $\hat \mu_1(X_i)$ 가 부정확할 때.

식 3에서 $\frac{T_i - \hat{P}(X_i)}{\hat{P}(X_i)}$ 부분이 0이 되기 때문에 결과가 보장됩니다.


## 4.2 R-learner에서 doubly robust가 보장되는 방식

Quasi-Oracle Estimation of Heterogeneous Treatment Effects에서 이를 정의하고 있습니다.
- [paper link](https://arxiv.org/pdf/1712.04912)
- [paper review](/posts/Causal%20Inference/Paper%20Review/review-Quasi-Oracle-Estimation-of-Heterogeneous-Treatment-Effects)

기본적인 컨셉은 2개의 nuisance function이 이상적일 때의 error bound와 2개 중 1개만 이상적일 때의 error bound가 같다는 것을 증명하는 것입니다.



# 5. R-loss가 정의되는 방식
---
Generalized R-loss는 Towards R-learner with Continuous Treatment 논문에서 제안된 손실함수입니다.
- [paper link](https://arxiv.org/pdf/2208.00872)
- [paper review](/posts/Causal%20Inference/Paper%20Review/review-Towards-R-learner-with-Continuous-Treatments)

$$
L_c(h) = E\left[\left\{Y - m(X) - h(X, T) + E_{\varpi}\{h(X, T) \mid X\}\right\}^2\right] \tag{generalized R-loss}
$$

이는 다음 수식들에서 유도됩니다.
이 수식들은 인과추론의 기본 가정인 unconfoundedness와 stable unit treatment value assumption을 가정하고 있습니다.

- full conditional outcome mean model
$$
\mu(x, t) = \mathbb{E}[Y | X = x, T = t]
$$

- conditional outcome mean
$$
\mu(x) = \mathbb{E}[Y | X = x]
$$

- generalized propensity score
$$
\varpi(x) = \mathbb{E}[T | X = x]
$$

- 수식 전개
$$
Y_i^{(T_i)} = \mu(X_i, T_i) + \epsilon_i  = \mu(X_i, 0) + \tau(X_i, T_i) + \epsilon_i \\
m(X_i) = E(Y_i^{(T_i)} | X=X_i) = \mu(X_i, 0) + E_{\varpi}\{\tau(X, T) | X=X_i\} + \epsilon_i \\
Y_i^{(T_i)} - m(X_i) = \tau(X_i, T_i) - E_{\varpi}\{\tau(X, T) | X=X_i\} + \epsilon_i \\
$$

마지막 식을 $\epsilon_i$ 에 대해서 정리하면 loss function을 얻을 수 있습니다.
여기서 $h(X, t)$는 $tau(X, T)$를 추정하는 함수를 의미합니다.


## 5.1 Binary treatment에 대한 loss function

> Quasi-Oracle Estimation of Heterogeneous Treatment Effects에서 정의한 binary treatment에 대한 loss function은 generalized R-loss의 특수한 경우입니다.

$$
L_b(h) =E[Y - m(X) - {T-e(X)}h(X, 1)]^2 \tag{binary treatment}
$$

T가 0 또는 1이 존재하는 경우이기 떄문에 T를 풀어서 쓸 수 있고, $h(x, 0) = 0$이라는 가정을 loss function에 녹여낼 수 있습니다.