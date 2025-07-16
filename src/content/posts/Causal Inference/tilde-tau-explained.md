---
title: "Why Do We Introduce the Centered Function tilde_tau(x,t)?"
date: "2025-07-15"
excerpt: "The role of the intermediate, mean-zero CATE in the continuous-treatment R-learner."
category: "Causal Inference"
tags: ["Concept", "R-learner", "Continuous Treatment"]
---

# 1. The problem in one sentence

R-loss를 그대로 최소화하면

$$
h(x,t) = \tau(x,t) + s(x)
$$

형태로 **x 에만 의존하는 덧붙임 함수** $s(x)$ 가 있어도 손실값이 변하지 않는다. 그래서 최소값이 **무한히 많아져** 해가 유일하지 않다.

---

# 2. Where does s(x) come from?

* R-loss에 $\mathbb{E}[ h(X,T) \mid X ]$ 항이 들어가므로 $h(x,t) + s(x)$ 를 넣어도 $s(x)$ 가 자연스럽게 상쇄된다.
* 그 결과 손실값이 동일하니 $s(x)$ 를 얼마든지 붙일 수 있다.
* 이것이 **non-identification(식별 불능)** 문제의 근원이다.

---

# 3. Idea: “center” the function

중간 함수 $\tilde{\tau}(x,t)$ 를 다음처럼 정의한다.

$$
\tilde{\tau}(x,t) = \tau(x,t) - \mathbb{E}[ \tau(X,T) \mid X = x ]
$$

즉, **각 x 마다 t 전역 평균이 0** 이 되도록 중심화한다.

* mean-zero 성질 때문에 $h(x,t)$ 와 $h(x,t)+s(x)$ 의 **차이점이 R-loss 안에서는 지워지지 않는다**. 실제로 $h(X,T)+s(X) - \mathbb{E}[h(X,T)+s(X)\mid X] = h(X,T)-\mathbb{E}[h(X,T)\mid X]$ 이므로, **R-loss 값은 그대로**다.
* 따라서 중심화만으로는 식별 문제가 완전히 사라지지 않는다. **결정적인 열쇠는 다음 단계의 L2 정규화**다.
  - L2 패널티 $\rho\,\|h\|_2^2$ 가 추가되면, $s(x)$ 를 붙이는 순간 노름이 커져서 목적함수가 증가한다.
  - 최적화는 $s(x)=0$ 을 선택해 유일해를 만든다.
* 즉 $\tilde{\tau}$ 는 "mean-zero" 조건을 만족하는 후보 중 하나이며, **식별을 완성하는 것은 정규화**라는 점을 기억해야 한다.


---

# 4. How regularisation fits in

1. **Step-1 (Tikhonov)**
   
   정규화된 최적화 문제를 푼다.
   
   $$
   \tau_{\rho} = \operatorname*{arg\,min}_{h} \Bigl\{ \text{R-loss}(h) + \rho \, \| h \|_2^2 \Bigr\}
   $$
   
   L2 패널티가 들어가면 문제가 **엄밀히 convex** 해져서 유일한 해가 보장된다.

2. **Step-2 (Scaling)**
   
   이론적으로 $\tilde{\tau} = (1 + \rho)\, \tau_{\rho}$ 임이 증명된다(Theorem 1).

3. **Step-3 (Zero-constraining operator)**
   
   마지막으로
   
   $$
   \mathcal{C}(f)(x,t) = f(x,t) - f(x,0)
   $$

   를 적용하면 실제 관심 함수 $\tau(x,t)$ 를 복원한다.

---

# 5. Practical take-aways

* **모델링** – 신경망 같은 유연한 함수 근사기를 쓸 때도 $\tilde{\tau}$ 를 학습하면 식별 문제가 자동으로 해결된다.
* **수치 안정성** – L2 정규화(ρ>0)가 없으면 여전히 ill-posed; ρ 값은 크지 않아도 "유일 최소" 확보에 충분하다.
* **해석** – $\tilde{\tau}$ 는 "x 조건부에서 t 변화만 담은 순수 효과"라서 $s(x)$(x 전용 편향)와 깔끔히 분리된다.

---

# 6. Mini-checklist for implementation

1. 두 nuisance 함수 m(x) 와 varpi(t|x) 추정
2. R-loss + L2 패널티로 $\tau_{\rho}$ 계산
3. $$\tilde{\tau} = (1 + \rho)\, \tau_{\rho}$$
4. $$\hat{\tau}(x,t) = \tilde{\tau}(x,t) - \tilde{\tau}(x,0)$$

---

# 7. Related reading

* Robinson (1988) – partially linear models
* Nie & Wager (2021) – Quasi-Oracle R-learner
* Kennedy et al. (2017) – continuous-treatment GPS
* Tikhonov (1963) – regularisation for ill-posed problems 

---

# 3.5  Why do we still center?

L2 정규화가 최종적으로 $s(x)$ 를 제거하더라도, **중심화가 선행돼야 하는 실용적 이유**가 있습니다.

1. **Canonical representative** – 같은 R-loss 값을 갖는 동치류 $\{h+s(x)\}$ 중에서 $\mathbb{E}[h\mid X]=0$ 인 함수가 가장 작은 $L_2$ 노름을 가지므로, 정규화가 자연스럽게 그 함수를 선택하게 된다.
2. **닫힌 형태 해** – Theorem 1 의 $(1+\rho)^{-1}$ 스케일 관계는 $\mathbb{E}[h\mid X]=0$ 조건이 있어야 성립한다.
3. **Zero-constraining operator** – 마지막 단계에서 $\mathcal{C}(f)(x,t)=f(x,t)-f(x,0)$ 를 적용할 때, 중심화돼 있어야 정확히 $\tau(x,t)$ 로 복원된다.

--- 