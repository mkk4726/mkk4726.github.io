---
title: "그리드 서치란(Grid Search)?"
date: "2025-09-15"
excerpt: "하이퍼 파라미터를 찾는 가장 기본적인 컨셉"
category: "Engineering"
tags: ["Tuning", "Grid Search"]
---

# Grid Search란?

<figure>
<img src="/post/DataScience/GridSearch.png" alt="Grid Search" />
<figcaption>그림1. Grid Search</figcaption>
</figure>

하이퍼파라미터를 찾는 가장 기본적인 방법.

Grid Search는 말 그대로 격자(grid) 형태로 하이퍼파라미터의 조합을 체계적으로 탐색하는 방법이다. 예를 들어 learning rate를 [0.001, 0.01, 0.1]로, batch size를 [32, 64, 128]로 설정했다면, 총 3 × 3 = 9가지 조합을 모두 시도해보는 것이다.

장점은 모든 조합을 체계적으로 탐색하기 때문에 최적값을 놓칠 가능성이 낮다는 것이다. 하지만 하이퍼파라미터가 많아질수록 조합의 수가 기하급수적으로 증가해서 계산 비용이 매우 커진다. 

실제로는 random search나 bayesian optimization 같은 더 효율적인 방법들을 많이 사용하지만, Grid Search는 여전히 하이퍼파라미터가 적고 탐색 공간이 작을 때 유용한 기본적인 방법이다.

