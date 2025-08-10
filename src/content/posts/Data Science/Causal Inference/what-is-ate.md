---
title: "What is ATE?"
date: "2025-07-17"
excerpt: "What is ATE?"
category: "Causal Inference"
tags: ["ATE"]
---

# ATE란?
---

Average Treatment Effect (ATE)는 모든 사람들이 받은 처치의 평균 효과를 말한다.

즉, 처치받은 결과와 받지 않은 결과의 차이의 평균이라고 이해할 수 있다.

# ATE 추정
---

$$
\hat{ATE} = \frac{1}{N} \sum_{i=1}^{N} (Y_i(1) - Y_i(0)) \tag{1}
$$


정의에 따라 ATE는 (1)처럼 정의된다.
하지만 실제로는 모든 사람들이 처치를 받지 않기 때문에 (1)을 직접 계산할 수 없다.

