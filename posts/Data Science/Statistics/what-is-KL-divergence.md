---
title: "KL Divergence란?"
date: "2025-08-10"
excerpt: "KL Divergence 개념정리"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1: [공돌이의 수학정리노트](https://angeloyeo.github.io/2020/10/27/KL_divergence.html)

# entropy

[entropy 개념 정리](/posts/Data%20Science/what-is-information-entropy)

$$
H(x) = - \sum_{i=1}^n p(x_i)log(p(x_i)) \tag{1}
$$

# cross entropy

예측과 달라서 생기는 깜놀도 (즉 정보량)

$$
H(p, q) = - \sum_{i=1}^n p(x_i)log(q(x_i)) \tag{2}
$$




# KL divergence

> A simple interpretation of the KL divergence of P from Q is the expected excess surprisal from using Q as a model instead of P when the actual distribution is P.

$$
D_{KL}(p||q) = \sum_{x \in X} p(x) \log \frac{p(x)}{q(x)} \tag{3}
$$

$$
= \sum_{x \in X} p(x) \log p(x) - \sum_{x \in X} p(x) \log q(x) \tag{4}
$$

$$
D_{KL}(p||q) = H(p, q) - H(p) \tag{5}
$$


