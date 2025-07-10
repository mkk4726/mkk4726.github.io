---
title: "[Paper Review] Towards R-learner with Continuous Treatments"
date: "2025-07-11"
excerpt: "연속형 처치를 위한 R-learner를 어떻게 구현할 수 있는지에 대한 논의"
category: "Causal Inference"
tags: ["Paper Review"]
---

[paper link](https://arxiv.org/pdf/2208.00872)

# 논문의 배경
---

[Quasi-Oracle Estimation of Heterogeneous Treatment Effects](https://arxiv.org/pdf/1712.04912) 에서 개인화 처치 효과를 추정하는 방법을 제안했습니다.

<small> * 개인화 처치효과 : 어떤 처치를 했을 때 개인별로 어떤 효과가 있을지 추정한 것</small>

개인화 처치효과를 추정하는 건 인과추론의 가장 핵심적인 문제이며, 이는 다양한 분야에서 통찰을 제공합니다.
예를 들어 정밀의학에서는 환자별 처치 효과를 추정하여 처치 선택을 결정하고, 교육에서는 학생별 처치 효과를 추정하여 교육 방법을 결정하고, 온라인 마케팅에서는 사용자별 처치 효과를 추정하여 맞춤형 광고를 제공하고, 오프라인 정책 평가에서는 지역별 처치 효과를 추정하여 정책을 결정할 수 있습니다.

> 즉, 개인화 처치효과를 알게 되면 어떤 선택에 대한 근거를 제공할 수 있습니다.

기존 논문에서는 이진 처치의 개인화 처치효과를 추정하는 방법을 이야기했고, 이 논문에서는 이를 확장해서 연속형 처치에 대해서도 이를 적용하기 위한 방법론을 이 논문에서 이야기하고 있습니다.

[[Paper Review] Quasi-Oracle Estimation of Heterogeneous Treatment Effects](/posts/Causal%20Inference/review-Quasi-Oracle-Estimation-of-Heterogeneous-Treatment-Effects) <- 이 논문에 대한 리뷰는 여기서 확인할 수 있습니다.

> 기존의 방법을 확장할 때 발생하는 문제와 이를 해결한 방법론에 대한 이야기에 집중해서 이 논문을 이해했습니다.

# 논문 내용 정리
---

## Abstract

> However, extending the R-learner framework from binary to continuous treatments introduces a non-identifiability issue, as the functional zero constraint inherent to the conditional average treatment effect cannot be directly imposed in the R-loss under continuous treatments

이 논문의 핵심 주장입니다.   
> binary 를 continuous로 확장하면 non-identifiability issue가 발생한다.

이걸 해결하기 위한 과정을 **identification strategy**라고 칭하고 있습니다.
2가지 과정을 통해 이를 구현한다고 합니다.
1. Tikhonov regularization
2. zero-constraining operator

왜 이슈가 발생하고 어떻게 해결했는지를 이해하는게 이 논문의 핵심이라고 이해됩니다.

## Introduction

$$
\begin{equation}
\tau(x, t) = E[Y^{(t)} - Y^{(0)} | X = x]
\end{equation}
$$

