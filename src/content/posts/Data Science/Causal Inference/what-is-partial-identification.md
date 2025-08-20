---
title: "Partial Identification에 대한 설명"
date: "2025-08-19"
excerpt: "Partial Identification이 무엇이고, 양수성이 위반되었을 때 어떻게 쓸 수 있는지"
category: "Causal Inference"
tags: ["ATE"]
---

# Positivity assumption - partial identification

## 1. Treatment positivity assumption (positivity / overlap assumption)

* **인과추론(causal inference)** 에서 필수 가정 중 하나예요.
* 정의:

  $$
  0 < P(T=1 \mid X=x) < 1 \quad \text{for all } x
  $$

  즉, **모든 공변량 $x$** 에 대해 처리를 받을 확률도 0보다 크고, 받지 않을 확률도 0보다 커야 한다는 조건입니다.
* 의미: 어떤 $x$ 값을 가진 집단도 완전히 한쪽 처우(treated/untreated)에만 속하면 안 된다는 것. 그래야 비교(반사실적 추정)가 가능해지죠.

👉 하지만 현실에서는 **positivity 위반(violation)** 이 자주 발생합니다.

* 예: 특정 연령대(아주 어린 아이)는 어떤 약을 절대 처방하지 않는 경우.
* 그러면 $P(T=1 \mid X=x) = 0$이 되어버리죠.

---

## 2. Partial identification

* **완전한 식별(full identification)**:
  모든 가정(ignorability, positivity 등)이 만족되면 **인과효과(ATE 등)를 점추정(point estimate)** 할 수 있습니다.

* **부분 식별(partial identification)**:
  가정이 일부 깨져서 정확한 점추정이 불가능할 때, 가능한 **인과효과의 범위(bound, interval)** 를 추정하는 방법입니다.
  → “효과가 정확히 β다” 대신 “효과는 \[a, b] 사이에 있다”라고 말하는 방식.

---

## 3. Positivity 위반과 partial identification의 관계

* Partial identification 접근은 positivity assumption이 위반된 상황을 다루는 대표적인 방법 중 하나예요.
* positivity가 깨지면 특정 $X$ 영역에서 반사실적 결과를 추정할 수 없게 되는데, 이때 **그 영역에서 인과효과가 어떤 범위에 있을지 논리적·수학적 제약을 통해 interval bound를 구합니다.**
* Manski(1990s 이후)의 work나 최근 causal inference 문헌에서는 이런 상황을 **"bounded causal effects"** 문제로 다룹니다.

---

## 4. 예시 (직관적으로)

* 어떤 약이 어린이에게는 절대 투여되지 않았다고 해봅시다.
  → positivity violation.
* 그럼 어린이 집단에서는 “투여 시 결과”를 관측할 수 없죠.
* **Partial identification 접근**은

  * (a) 이 집단에서의 결과가 최소한 관측된 범위 안에 있을 것이라는 가정,
  * (b) monotonicity 같은 추가 가정 등을 사용해서
    **"효과는 최소 0 이상, 최대 5 이하"** 처럼 구간 추정을 제시합니다.

---

# partial identification 구체적인 이론적인 내용

## 1. 식별(Identification)의 큰 그림

* **완전 식별(full identification)**:
  인과효과(예: ATE, ATT 등)를 **점추정(point estimate)** 할 수 있는 상황.

  * 조건:

    1. **Ignorability (unconfoundedness)**: $Y(1), Y(0) \perp T \mid X$
    2. **Positivity (overlap)**: $0 < P(T=1 \mid X=x) < 1$ for all $x$
  * 이 두 조건이 맞으면, ATE = $\mathbb{E}[Y(1)-Y(0)]$를 관측 데이터로 계산 가능.

* **부분 식별(partial identification)**:
  위 조건들이 완전히 성립하지 않거나, 정보가 부족해서 **점추정 불가능**할 때
  → 가능한 값의 **범위(bounds, intervals)** 를 찾는 접근.

  * 따라서 "효과가 β다" 대신
    "효과는 \[a, b] 범위 안에 있다"라고 말하는 게 핵심.

---

## 2. 부분 식별이 필요한 대표적 상황

### (1) **Positivity violation (overlap 위반)**

* 어떤 $X$ 값에서 처리(Treatment)가 전혀 주어지지 않는 경우.
* 예: 어떤 나이대 아이들에게는 절대 약물이 투여되지 않았다면 $P(T=1|X)=0$.
* 이때 그 구간에서 반사실적(counterfactual) 결과는 관측 불가능.
* 해결: 그 구간에서 가능한 결과 범위를 가정하여 **bound** 제시.
  → *Manski bounds* (1989, 1990): 관찰 가능한 부분과 불가능한 부분을 분리해, 논리적으로 가능한 최대·최소 효과를 제시.

---

### (2) **Unobserved confounding (비관측 교란)**

* 교란변수 $U$가 관측되지 않으면 ignorability가 깨짐.
* 이 경우 “효과의 점추정”은 불가능하지만, **추가 가정**(예: 교란의 최대 효과 크기 제한)을 넣으면 **bounded effect**를 제시할 수 있음.
* 예: Rosenbaum의 **sensitivity analysis** → 교란이 얼마나 강해야 추정된 효과가 무너질지를 bound로 제시.

---

### (3) **Instrumental Variables (IV)**

* 도구변수 접근에서도 부분 식별이 자주 등장.
* 강한 가정(완전한 독립성, exclusion restriction 등)이 만족되면 LATE(Local Average Treatment Effect)를 점추정할 수 있음.
* 하지만 가정을 완화하면 → LATE 자체는 **interval identification**으로만 가능.
* 대표적: **Imbens & Manski (2004) bounds**.

---

### (4) **Selection bias / Missing data**

* 데이터가 무작위로 빠지지 않고 선택적 결측(non-ignorable missingness)이 있을 때.
* 이 경우도 관찰 불가능한 부분에 대해 최소·최대 범위를 계산하는 **Manski’s missing data bounds**가 있음.

---

## 3. 대표적인 Bound 기법들

1. **Manski bounds (worst-case bounds)**

   * 가장 기본적인 형태.
   * 가정을 최소화하고, 관측된 데이터만으로 논리적으로 가능한 인과효과의 상한/하한을 계산.
   * 단점: 보통 interval이 너무 넓어서 실용성이 떨어짐.

2. **Lee bounds (2009)**

   * \*\*선택적 이탈(selection)\*\*이 있는 프로그램 평가에서 사용.
   * monotonicity (단조성) 가정을 추가해서 bound를 좁힘.

3. **Imbens-Manski bounds (2004)**

   * 도구변수 기반 추론에서 treatment effect 범위 제시.

4. **Sensitivity analysis 기반 bounds**

   * 비관측 교란이 있을 때, 특정 “감도(sensitivity)” 가정을 통해 효과 범위를 제시.

---

## 4. 이론적 철학

* **점추정(point identification)** 은 강한 가정(positivity, ignorability 등)을 요구.
* 현실에서는 이 가정들이 자주 깨짐 → 강한 가정 대신 **약한 가정**만 두고,

* 추정 가능한 부분만으로 inference → **부분 식별**.
* 따라서 partial identification은 **"robust inference under weaker assumptions"** 라고 할 수 있어요.
* Manski는 이를 **"honest inference"** 라고 부릅니다. (불필요하게 강한 가정으로 잘못된 점추정을 하느니, 범위를 제시하는 것이 더 정직하다).

---

## 5. 요약

* **Partial identification** = 정보 부족/가정 위반 상황에서 가능한 인과효과의 범위를 제시하는 방법.
* 활용되는 이론적 맥락:

  1. **positivity 위반**
  2. **unobserved confounding**
  3. **instrumental variables (약한 가정하에)**
  4. **selection bias / missing data**
* 주요 도구: Manski bounds, Lee bounds, Imbens-Manski bounds, sensitivity analysis

---
