---
title: "R-learner란?"
date: "2025-07-23"
excerpt: "R-learner의 개념에 대해 정리"
category: "Causal Inference"
tags: ["R-learner", "인과추론"]
---


# 1. CATE estimation이란?
---

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
다만 개개인별로 인과효과가 다르다는 것은 직관적인데요. 이를 위해 추정하는 값이 CATE 입니다.

> Estimating heteronenous treatment effects is fundamental in causal inference and provides insights into various fields.
>
> - Towards R-learner with Continuous Treatment

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









# 3. R-learner란? 다른 meta-learner들과 비교
---





# 4. Double robustness란
---





# 5. R-loss가 정의되는 방식
---

