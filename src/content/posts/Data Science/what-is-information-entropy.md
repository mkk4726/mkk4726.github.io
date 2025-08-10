---
title: "Information Entropy란?"
date: "2025-08-10"
excerpt: "Information Entropy 개념정리"
category: "Data Science"
tags: ["statistics"]
---

참고자료
- 1: [공돌이의 수학정리노트](https://angeloyeo.github.io/2020/10/26/information_entropy.html)
- 2: [위키피디아 Information content](https://en.wikipedia.org/wiki/Information_content)

# 정보란?

> In information theory, the information content, self-information, surprisal, or Shannon information is a basic quantity derived from the probability of a particular event occurring from a random variable. 
> It can be thought of as an alternative way of expressing probability, much like odds or log-odds, but which has particular mathematical advantages in the setting of information theory.

surprisal, information content 이런 단어들은 확률을 변형해서 표현하는 것들.
놀라움 정도를 양적으로 표현한 것 같다.

> The Shannon information can be interpreted as quantifying the level of "surprise" of a particular outcome. 
> As it is such a basic quantity, it also appears in several other settings, such as the length of a message needed to transmit the event given an optimal source coding of the random variable.

$$I(x) = -log_b(P(X))$$

- $b$: $2, e, 10$

왜 log를 붙여서 정의했을까?
- 확률값에 반비례 해야 하기 때문에
- 두 사건의 정보량을 합치면 각 사건의 정보량을 합친 것과 같아야 하기 때문에

# 엔트로피 (entropy) : 평균 정보량

$$H(X) = E[I(X)] = - \sum_{i=1}^n P(x_i) log_b (P(x_i))$$

