---
title: "Manski Bounds 개념 정리"
date: "2025-08-20"
excerpt: "Manski bounds에 대한 설명"
category: "Causal Inference"
tags: ["Paper Review", "Partial Identification", "Manski bounds"]
---

참고자료 
- 1: 원본 논문, [pdf 링크](/post/Data%20Science/Causal%20Inference/Paper%20Review/Manski%20-%20Nonparametric%20Bounds.pdf)
- 2: [유튜브 - Brady Neal - Causal Inference](https://www.youtube.com/watch?v=IXNMYqUsBBQ&list=PLoazKTcS0Rzb6bb9L508cyJ1z-U9iWkA0&index=47)

---

Manski bounds는 parital identification의 가장 기본적인 버전 혹은 개념으로 이해할 수 있습니다.

partial identification은 causal inference에서 가져가는 가정들을 충족시키지 못할 때의 대처방안으로 이해할 수 있고, 직접적인 추정은 못하더라도 가정을 통해 범위 등을 추정하겠다는 개념입니다.
- [partial identification에 대한 설명](/posts/Data%20Science/Causal%20Inference/what-is-partial-identification)

프로젝트를 진행하면서 인과추론의 개념들을 적용해보니, 양수성을 보장할 수 없는 경우가 생기고 이때 어떻게 추정을 해야할지 고민이 됐습니다.
Partial Identification은 이런 경우에 어떻게 식별할 수 있는지에 대한 내용들이며, 그 중 하나가 Mansk bounds라고 이해할 수 있습니다.

---

## 기본적인 컨셉

기본적인 가정 (양수성 등) 이 만족되지 않은 상황에서의 추정 방법이기 때문에, 합리적인 "가정"을 통해 예측값의 범위를 추정해야합니다.

> 이때 Manski boudns는 가정을 최소화하고 데이터만으로 논리적으로 가능한 인과효과의 상한/하한을 계산하고자 합니다.

---

## 문제상황

> "No Unobserved Confounding" is Unrealistic

실제 데이터에서 관측되지 않은 교란변수가 없다는 가정은 매우 비현실적입니다.
결과에 영향을 주는 모든 변수들을 측정할 수 없고, 또 데이터로 가지고 있을 수 없기 때문입니다.
따라서 인과추론에서 가져가는 가정들은 이상적일 수 있습니다.

> "The Law of Decreasing Credibility : The credibility of inference decreases with the strength of the assumptions maintained" (Manski, 2003)

저자는 가정들이 많아 질수록 추론의 신뢰도는 떨어질 것이라고 말합니다.


$$
E[Y(1) - Y(0)] = E_{X} [E[Y|T=1, X] - E[Y | T=0, X]] \tag{1}
$$

가정들이 성립한다면 인과효과는 수식 1처럼 정의할 수 있습니다.

> Make weaker assumptions: Identify an interval. "Partial identification" or "set identification"

가정들을 약하게하고, 이때 구간을 구하는는 개념이 Partial Identification 입니다.

---

## No-Assumptions Bound

> Example: $Y(0)$ and $Y(1)$ are between 0 and 1

$$
\text{Min}: 0 - 1 = -1 \leq Y_i(1) - Y_i(0) \leq 1 = 1 - 0, \quad \text{Max}: 1 - 0 = 1 \tag{2}
$$

- Trival length limit: 2

가정이 없는 상황에서는 인과효과의 범위를 데이터의 상한/하한을 통해 추정할 수 있습니다.


> More generally, potential outcomes are bounded: $\forall t, a \leq Y(t) \leq b$

$$
a - b \leq Y_i(1) - Y_i(0) \leq b - a \\
a - b \leq E[Y_i(1) - Y_i(0)] \leq b - a \tag{3}
$$

- Trival length limit: $2(b-a)$

일반화해서 표현하면 수식3과 같습니다.



<figure>
<img src="/post/Causal_Inference/Observational-Counterfactual-Decomposition.png" alt="Observational-Counterfactual Decomposition" width="80%" />
<figcaption>그림1. Observational-Counterfactual Decomposition</figcaption>
</figure>

- $E[Y(1) | T = 0]$: treatment를 받지 않은 그룹의 사람들이 만약 treatment를 받았다면 어떤 결과를 보였을지의 기댓값

그림1과 같이 수식을 전개할 수 있고

<figure>
<img src="/post/Causal_Inference/No-Assumptions-Bound.png" alt="No-Assumptions-Bound" width="80%" />
<figcaption>그림2. No-Assumptions-Bound</figcaption>
</figure>

추정할 수 없는 값들에 대해서는 수식 3에서 정의한 것과 같이, Y(t)의 범위를 넣어 추정할 수 있습니다.

<figure>
<img src="/post/Causal_Inference/No-Assumptions-Interval-Length.png" alt="No-Assumptions-Interval-Length" width="80%" />
<figcaption>그림3. No-Assumptions-Interval-Length</figcaption>
</figure>

- No-assumptions interval lenght: $(1-\pi)b + \pi b - \pi a - (1 - \pi)a = b - a$

최종적으로 manski bounds 를 통해 추정한 범위는 b-a가 되고 이는 Y의 범위만으로 추정한 범위보다 더 좁아지게 됩니다.

---

## 정리

> 추정할 수 없는 값에 대해서는 Y의 상한/하한을 통해 추정하겠다.

제가 이해하는 manski bounds의 핵심 컨셉입니다.
paritial identification의 가장 쉽고 직관적인 개념입니다.

다만, 범위가 굉장히 넓기 때문에 실제로 사용하지는 않고 baseline 정도로 사용해볼만하다고 생각합니다.


---

## 실제로 적용할 떄 고민해야하는 부분들

실제로 적용할 때는 이 컨셉만을 차용해서 사용할 것 같습니다.
이때 고려해야할 점을 간단히 적어봤습니다.

1. 수식에 X가 들어가야 함 (고객별로 bound를 다르게 그려주기 위해서)
- $a(x) \leq Y(x) \leq b(x)$ : 풀고 있는 문제에서는 Y는 vault, b와 a는 ACD와 같은 값으로 정의할 수 있겠다.

2. 추론시점에서는 observational한 값이 없음 -> 다 추정값


