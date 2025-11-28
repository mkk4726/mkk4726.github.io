---
title: "KKT condtion 이란?"
date: "2025-09-23"
excerpt: "Karush-Kuhn-Tucker에 대해 이해해보기"
category: "Math"
tags: ["KKT", "DS", "Math", "Linear Programming"]
---

참고자료
- 1: [ratsgo's blog](https://ratsgo.github.io/convex%20optimization/2018/01/26/KKT/)
- 2: [카네기 멜론 대학 강의자료](https://www.stat.cmu.edu/~ryantibs/convexopt/)

---

# KKT 조건 (Karush-Kuhn-Tucker Conditions)

KKT 조건은 제약 조건이 있는 최적화 문제에서 최적해가 만족해야 하는 필요 조건들을 말합니다. 
이는 라그랑주 승수법을 부등식 제약 조건까지 확장한 것으로, 머신러닝과 최적화 이론에서 매우 중요한 역할을 합니다.

모델링의 목표와 비즈니스 목표를 정렬하는 부분에서도 KKT의 개념을 차용하는 글이 있는데, 꽤나 흥미롭습니다.
- [하이퍼커넥트 ML 리더분의 글](https://www.linkedin.com/posts/joonyoungyi_ai-%EB%AC%B8%EC%A0%9C%EC%97%90%EC%84%9C-%EC%B5%9C%EC%A0%81%ED%99%94%ED%95%98%EA%B3%A0%EC%9E%90-%ED%95%98%EB%8A%94-%EC%A7%80%ED%91%9C%EB%8A%94-%ED%95%98%EB%82%98%EC%97%AC%EC%95%BC-%ED%95%A9%EB%8B%88%EB%8B%A4-%ED%98%84%EC%8B%A4%EC%97%90%EC%84%9C-ai%EB%A1%9C-activity-7375782000697413632-MBXy/?utm_source=share&utm_medium=member_android&rcm=ACoAADafY9YBl0pYjiYslOSavtyIuLdy1Q7QDOo)


---

## 기본 개념

KKT 조건은 다음과 같은 형태의 최적화 문제에서 적용됩니다:

$$
\begin{align}
\min_{x} \quad & f(x) \\
\text{subject to} \quad & g_i(x) \leq 0, \quad i = 1, \ldots, m \\
& h_j(x) = 0, \quad j = 1, \ldots, p
\end{align}
$$

여기서 $f(x)$는 목적 함수, $g_i(x) \leq 0$는 부등식 제약 조건, $h_j(x) = 0$는 등식 제약 조건입니다.

## KKT 조건의 구성 요소

KKT 조건은 다음 5가지 조건으로 구성됩니다:

### 1. Stationarity (정상성)
$$
\nabla f(x^*) + \sum_{i=1}^{m} \lambda_i \nabla g_i(x^*) + \sum_{j=1}^{p} \mu_j \nabla h_j(x^*) = 0
$$

직관적인 의미 : 최적점에서 목적함수의 기울기가 제약조건들의 기울기들의 선형 결합으로 완전히 상쇄된다는 것




### 2. Primal Feasibility (주요 실현가능성)
- $g_i(x^*) \leq 0$ for all $i = 1, \ldots, m$
- $h_j(x^*) = 0$ for all $j = 1, \ldots, p$

### 3. Dual Feasibility (쌍대 실현가능성)
$$
\lambda_i \geq 0 \quad \text{for all } i = 1, \ldots, m
$$

### 4. Complementary Slackness (상보적 여유성)
$$
\lambda_i g_i(x^*) = 0 \quad \text{for all } i = 1, \ldots, m
$$

### 5. Lagrange Multipliers (라그랑주 승수)
- $\lambda_i$: 부등식 제약 조건에 대한 라그랑주 승수
- $\mu_j$: 등식 제약 조건에 대한 라그랑주 승수


---

## 직관적 이해

KKT 조건의 핵심 아이디어는 다음과 같습니다:

1. **Stationarity**: 최적점에서 목적 함수의 gradient가 제약 조건의 gradient들의 선형결합으로 표현됩니다.

2. **Complementary Slackness**: 활성 제약 조건(등호가 성립하는 제약)에 대해서만 라그랑주 승수가 0이 아닙니다. 비활성 제약 조건에 대해서는 라그랑주 승수가 0입니다.

3. **Dual Feasibility**: 부등식 제약 조건에 대한 라그랑주 승수는 음수가 될 수 없습니다.

---

## 실제 적용 예시

SVM (Support Vector Machine)에서 KKT 조건이 핵심적으로 사용됩니다. 
SVM의 최적화 문제에서 KKT 조건을 통해 support vector를 식별하고, dual 문제로 변환할 수 있습니다.

KKT 조건은 제약 조건이 있는 최적화 문제에서 최적해의 특성을 이해하고, 효율적인 알고리즘을 설계하는 데 필수적인 도구입니다.
