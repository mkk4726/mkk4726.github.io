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

Manski bounds는 parital identification의 가장 기본적인 버전 혹은 개념으로 이해가 됩니다.

partial identification은 causal inference에서 가져가는 가정들을 충족시키지 못할 때의 대처방안으로 이해할 수 있고, 
직접적인 추정은 못하더라도 가정을 통해 범위 등을 추정하겠다는 개념입니다.
-> [partial identification에 대한 설명](/posts/Data%20Science/Causal%20Inference/what-is-partial-identification)

프로젝트를 진행하면서 인과추론의 개념들을 적용해보니, 양수성을 보장할 수 없는 경우들 많았습니다.  
이런 경우에는 어떻게 식별할 수 있는지에 대한 내용들이며, 그 중 하나가 Mansk bounds라고 이해할 수 있겠습니다.

---

# 기본적인 컨셉

> 가정을 최소화하고, 관측된 데이터만으로 논리적으로 가능한 인과효과의 상한/하한을 계산.


---

# 관련 내용 정리 (참고 2)

"No Unobserved Confounding" is Unrealistic

> "The Law of Decreasing Credibility : The credibility of inference decreases with the strength of the assumptions maintained" (Manski, 2003)

Assume unconfoundedness. Then, Identify a point
$$
E[Y(1) - Y(0)] = E_{W} [E[Y|T=1, W] - E[Y | T=0, W]]
$$


Make weaker assumptions: Identify an interval. 
"Partial identification" or "set identification"

## No-Assumptions Bound

Example: $Y(0)$ and $Y(1)$ are between 0 and 1

$$
\text{Min}: 0 - 1 = -1 \leq Y_i(1) - Y_i(0) \leq 1 = 1 - 0, \quad \text{Max}: 1 - 0 = 1
$$

- Trival length limit: 2

More generally, potential outcomes are bounded: $\forall t, a \leq Y(t) \leq b$

$$
a - b \leq Y_i(1) - Y_i(0) \leq b - a \\
a - b \leq E[Y_i(1) - Y_i(0)] \leq b - a
$$

- Trival length limit: $2(b-a)$

<figure>
<img src="/post/Causal_Inference/Observational-Counterfactual-Decomposition.png" alt="Observational-Counterfactual Decomposition" width="80%" />
<figcaption>Observational-Counterfactual Decomposition</figcaption>
</figure>

- $E[Y(1) | T = 0]$: treatment를 받지 않은 그룹의 사람들이 만약 treatment를 받았다면 어떤 결과를 보였을지의 기댓값

<figure>
<img src="/post/Causal_Inference/No-Assumptions-Bound.png" alt="No-Assumptions-Bound" width="80%" />
<figcaption>No-Assumptions-Bound</figcaption>
</figure>

observational과 counterfactual로 분해한 걸 바탕으로 최소, 최대 범위 산정.
counterfactual 값들에 대해 최대, 최소 값을 넣어 범위 산정.
- b : Y의 최댓값
- a : Y의 최솟값

<figure>
<img src="/post/Causal_Inference/No-Assumptions-Interval-Length.png" alt="No-Assumptions-Interval-Length" width="80%" />
<figcaption>No-Assumptions-Interval-Length</figcaption>
</figure>

- No-assumptions interval lenght: $(1-\pi)b + \pi b - \pi a - (1 - \pi)a = b - a$

---

# 실제로 적용할 떄 고민해야하는 부분들

1. 수식에 X가 들어가야 함 (고객별로 bound를 다르게 그려주기 위해서)
- $a(x) \leq Y(x) \leq b(x)$ : 풀고 있는 문제에서는 Y는 vault, b와 a는 ACD와 같은 값으로 정의할 수 있겠다.

2. 추론시점에서는 observational한 값이 없음 -> 다 추정값


