---
title: "Optimization methods에 대해 가벼운 스케치"
date: "2025-10-12"
excerpt: "최적화 방법론들에 대해 가볍게 정리해보자"
category: "Engineering"
tags: ["Optimization"]
---

## 키워드

Newton's method, hessian matrix, gradient descent, gradient, quasi-newton, BFGS, L-BFGS

## 개념 스케치

최적해를 한번에 구하면 좋겠지만 그게 불가능한 경우 -> 현재 점에서 최적해 방향(기울기)으로 조금씩 내려가자

현재 위치에서 기울기로 방향을 알 수 있다면, 2차 도함수 (곡률)로는 더 정확한 정보를 알 수 있다.
따라서 이걸 사용하면 더 빠르게 수렴한다. 하지만 계산비용이 높아진다는 문제가 있다.

---

## 1. Gradient Descent

Gradient descent는 기계학습에서 가장 널리 사용되는 최적화 알고리즘이다. 함수의 최솟값을 찾기 위해 현재 위치에서 gradient의 반대 방향으로 조금씩 이동하는 방식으로 작동한다. 산을 내려갈 때 가장 가파른 경사를 따라 내려가는 것과 같은 원리라고 생각하면 이해하기 쉽다.

### 기본 원리

손실 함수 $L(\theta)$가 주어졌을 때, 우리의 목표는 이 함수를 최소화하는 파라미터 $\theta$를 찾는 것이다. Gradient descent는 다음과 같은 업데이트 규칙을 따른다:

$$
\theta_{t+1} = \theta_t - \eta \nabla_\theta L(\theta_t)
$$

여기서 $\eta$는 learning rate로, 각 스텝에서 얼마나 크게 이동할지를 결정하는 하이퍼파라미터다. $\nabla_\theta L(\theta_t)$는 현재 파라미터에서의 gradient를 의미한다. Gradient가 함수가 증가하는 방향을 가리키므로, 그 반대 방향(음의 gradient 방향)으로 이동하면 함수값을 감소시킬 수 있다.

### Batch Gradient Descent

가장 기본적인 형태의 gradient descent는 전체 데이터셋을 사용하여 gradient를 계산한다. 데이터셋이 $\{(x_1, y_1), ..., (x_n, y_n)\}$으로 주어졌을 때, 손실 함수는 다음과 같이 표현된다:

$$
L(\theta) = \frac{1}{n}\sum_{i=1}^{n} \ell(f_\theta(x_i), y_i)
$$

여기서 $\ell$은 개별 샘플에 대한 손실 함수다. Batch gradient descent는 전체 데이터에 대한 평균 gradient를 계산하므로 정확하고 안정적인 업데이트를 제공한다. 하지만 데이터셋이 클 경우 한 번의 업데이트에 많은 계산이 필요하다는 단점이 있다.

### Stochastic Gradient Descent (SGD)

SGD는 매 업데이트마다 하나의 샘플만 사용하여 gradient를 계산한다. 즉, 각 스텝에서 랜덤하게 선택된 샘플 $(x_i, y_i)$에 대해:

$$
\theta_{t+1} = \theta_t - \eta \nabla_\theta \ell(f_\theta(x_i), y_i)
$$

이 방식은 계산이 매우 빠르고 메모리 효율적이다. 또한 noise가 있어서 local minima에서 빠져나올 수 있다는 장점도 있다. 하지만 gradient 추정이 noisy하여 수렴 경로가 불안정하고 진동할 수 있다.

### Mini-batch Gradient Descent

실제로 가장 많이 사용되는 방식은 mini-batch gradient descent다. 이는 batch와 SGD의 절충안으로, 작은 배치 크기 $b$의 샘플들을 사용하여 gradient를 계산한다:

$$
\theta_{t+1} = \theta_t - \eta \frac{1}{b}\sum_{i \in \mathcal{B}_t} \nabla_\theta \ell(f_\theta(x_i), y_i)
$$

여기서 $\mathcal{B}_t$는 시간 $t$에서 선택된 mini-batch다. 일반적으로 배치 크기는 32, 64, 128, 256 등의 2의 거듭제곱으로 설정한다. Mini-batch 방식은 GPU의 병렬 연산을 효율적으로 활용할 수 있고, gradient 추정의 분산을 줄이면서도 계산 효율성을 유지한다.

### Learning Rate의 중요성

Learning rate $\eta$는 gradient descent의 성능에 결정적인 영향을 미친다. Learning rate가 너무 크면 최솟값 근처에서 발산하거나 진동할 수 있고, 너무 작으면 수렴 속도가 매우 느려진다. 실제로는 초기에 큰 learning rate를 사용하다가 점차 줄여가는 learning rate scheduling 기법을 많이 사용한다.

대표적인 learning rate schedule로는 step decay(일정 epoch마다 learning rate를 줄임), exponential decay(지수적으로 감소), cosine annealing(코사인 함수 형태로 감소) 등이 있다. 또는 validation loss가 개선되지 않을 때 learning rate를 줄이는 adaptive한 방법도 널리 사용된다.

### 수렴 조건과 한계

Gradient descent가 global minimum에 수렴하기 위해서는 함수가 convex해야 한다. 하지만 deep learning의 손실 함수는 대부분 non-convex하므로 global minimum 대신 local minimum이나 saddle point에 갇힐 수 있다. 다행히도 실제로는 high-dimensional space에서 local minima보다 saddle point가 더 흔하며, SGD의 noise가 이러한 지점들을 벗어나는 데 도움이 된다.

또한 vanilla gradient descent는 gradient가 0에 가까운 flat region이나 gradient가 매우 큰 steep region에서 학습이 느려지는 문제가 있다. 이를 개선하기 위해 momentum, AdaGrad, RMSprop, Adam 등의 advanced optimizer들이 개발되었다.

---

## 2. Newton's Method

Newton's method는 2차 미분 정보를 활용하여 최적점을 찾는 알고리즘이다. Gradient descent가 1차 미분(gradient)만 사용하는 것과 달리, Newton's method는 2차 미분 정보인 Hessian matrix까지 활용하여 더 빠른 수렴 속도를 달성한다. 함수의 곡률 정보를 직접 사용하기 때문에 learning rate를 수동으로 튜닝할 필요가 없다는 장점이 있다.

### 기본 원리

함수 $L(\theta)$를 현재 점 $\theta_t$ 주변에서 2차 Taylor 전개하면 다음과 같다:

$$
L(\theta) \approx L(\theta_t) + \nabla L(\theta_t)^T(\theta - \theta_t) + \frac{1}{2}(\theta - \theta_t)^T H(\theta_t)(\theta - \theta_t)
$$

여기서 $H(\theta_t)$는 Hessian matrix로, $L$의 2차 편미분들로 구성된다. 즉, $H_{ij} = \frac{\partial^2 L}{\partial \theta_i \partial \theta_j}$다. 이 2차 근사 함수를 최소화하는 $\theta$를 찾기 위해 gradient를 0으로 놓으면:

$$
\nabla L(\theta_t) + H(\theta_t)(\theta - \theta_t) = 0
$$

이를 정리하면 Newton's method의 업데이트 규칙을 얻는다:

$$
\theta_{t+1} = \theta_t - H(\theta_t)^{-1}\nabla L(\theta_t)
$$

Gradient descent의 업데이트 규칙 $\theta_{t+1} = \theta_t - \eta \nabla L(\theta_t)$와 비교하면, learning rate $\eta$ 대신 Hessian의 역행렬 $H^{-1}$을 사용하는 것으로 볼 수 있다. 이는 각 방향마다 적응적으로 step size를 조정하는 효과를 가진다.

### 1차 미분 vs 2차 미분: 직선 vs 곡선

왜 2차 미분 정보를 사용하면 더 빠르게 수렴할까? 이를 이해하려면 1차 미분과 2차 미분이 각각 무엇을 나타내는지 알아야 한다.

1차 미분인 gradient $\nabla L(\theta)$는 함수가 증가하는 방향과 그 속도를 나타낸다. Gradient descent는 현재 위치에서 함수가 직선적으로 변한다고 가정하고, 그 직선의 기울기를 따라 반대 방향으로 이동한다. 하지만 실제 함수는 곡선이므로, 이 선형 근사는 멀리 가면 갈수록 부정확해진다. 그래서 작은 learning rate를 사용해야 하고, 결과적으로 많은 iteration이 필요하다.

반면 2차 미분인 Hessian matrix $H(\theta)$는 함수의 곡률(curvature)을 나타낸다. 곡률이란 함수가 얼마나 구부러져 있는지, 즉 기울기가 얼마나 빠르게 변하는지를 의미한다. Hessian의 각 원소 $H_{ij} = \frac{\partial^2 L}{\partial \theta_i \partial \theta_j}$는 $\theta_i$ 방향으로 움직일 때 $\theta_j$ 방향의 gradient가 얼마나 변하는지를 측정한다.

간단한 1차원 예시로 생각해보자. 함수 $L(\theta) = \frac{1}{2}a\theta^2$이 있을 때, 1차 미분은 $L'(\theta) = a\theta$이고 2차 미분은 $L''(\theta) = a$다. 최솟점은 $\theta^* = 0$이다. Gradient descent는 $\theta_{t+1} = \theta_t - \eta a\theta_t = (1 - \eta a)\theta_t$로 업데이트한다. 이는 기하급수적으로 수렴하지만, $\eta$를 잘 선택해야 하고 여러 번의 iteration이 필요하다. 반면 Newton's method는 $\theta_{t+1} = \theta_t - \frac{a\theta_t}{a} = 0$으로, 단 한 번에 정확한 최솟값에 도달한다. 이는 2차 함수를 정확히 근사할 수 있기 때문이다.

### Hessian이 제공하는 곡률 정보

Hessian matrix는 함수의 local geometry를 더 정확하게 포착한다. 특히 다변수 함수에서 Hessian은 각 방향의 곡률뿐만 아니라 서로 다른 방향들 간의 상호작용까지 알려준다.

Hessian의 고유값(eigenvalue) 분해를 통해 이를 더 명확히 이해할 수 있다. Hessian이 positive definite하다면, 고유값들 $\lambda_1, ..., \lambda_d > 0$와 대응하는 고유벡터들 $v_1, ..., v_d$가 존재한다. 고유벡터들은 함수의 principal direction(주요 방향)을 나타내고, 고유값들은 각 방향의 곡률을 나타낸다.

고유값이 크다는 것은 그 방향으로 함수가 급격하게 변한다는 의미다. 예를 들어 어떤 방향의 고유값이 100이고 다른 방향의 고유값이 1이라면, 첫 번째 방향은 매우 가파른 계곡이고 두 번째 방향은 완만한 경사다. Gradient descent는 모든 방향에 동일한 learning rate를 적용하므로, 가파른 방향에서는 진동하고 완만한 방향에서는 느리게 수렴하는 문제가 발생한다.

Newton's method는 Hessian의 역행렬을 사용함으로써 이 문제를 해결한다. $H^{-1}$의 고유값은 $1/\lambda_i$이므로, 곡률이 큰 방향(고유값이 큰 방향)에서는 작은 step을 취하고, 곡률이 작은 방향(고유값이 작은 방향)에서는 큰 step을 취한다. 이는 마치 각 방향마다 최적의 learning rate를 자동으로 설정하는 것과 같다.

### Quadratic function과 최적성

Newton's method가 특히 강력한 이유는 quadratic function에 대해 정확한 해를 제공하기 때문이다. 일반적인 quadratic function은 다음과 같은 형태다:

$$
L(\theta) = \frac{1}{2}\theta^T A\theta + b^T\theta + c
$$

여기서 $A$는 positive definite matrix다. 이 함수의 gradient는 $\nabla L(\theta) = A\theta + b$이고, Hessian은 $H = A$로 상수다. Newton's method를 적용하면:

$$
\theta_{t+1} = \theta_t - A^{-1}(A\theta_t + b) = \theta_t - \theta_t - A^{-1}b = -A^{-1}b
$$

이는 정확히 $\nabla L(\theta^*) = A\theta^* + b = 0$의 해다. 즉, quadratic function에 대해서는 단 한 번의 iteration으로 정확한 최솟값에 도달한다.

실제 함수는 대부분 quadratic이 아니지만, 최솟점 근처에서는 Taylor 전개에 의해 근사적으로 quadratic으로 볼 수 있다. 그래서 최솟점에 가까워질수록 Newton's method는 매우 빠르게 수렴한다. 반면 gradient descent는 선형 근사를 사용하므로 quadratic 구조를 활용하지 못하고, 많은 iteration을 통해 조금씩 접근해야 한다.

### 수렴 속도

Newton's method의 가장 큰 장점은 빠른 수렴 속도다. 최적점 근처에서 Hessian이 positive definite하면 Newton's method는 quadratic convergence를 보인다. 즉, 오차가 각 iteration마다 제곱으로 감소한다. 이는 gradient descent의 linear convergence보다 훨씬 빠르다. 수식으로 표현하면, 최적점 $\theta^*$에 충분히 가까우면:

$$
\|\theta_{t+1} - \theta^*\| \leq C\|\theta_t - \theta^*\|^2
$$

이러한 빠른 수렴 때문에 convex optimization 문제에서는 Newton's method가 매우 효과적이다. 특히 적절한 초기값에서 시작한다면 몇 번의 iteration만으로도 높은 정확도의 해를 얻을 수 있다.

### 계산 복잡도의 문제

하지만 Newton's method는 실용적인 문제가 있다. 첫째, Hessian matrix를 계산해야 한다. 파라미터 개수가 $d$일 때 Hessian은 $d \times d$ 행렬이므로, $O(d^2)$의 메모리가 필요하다. Deep learning 모델처럼 파라미터가 수백만 개인 경우 이는 현실적으로 불가능하다.

둘째, Hessian의 역행렬을 계산해야 한다. 일반적으로 역행렬 계산은 $O(d^3)$의 시간 복잡도를 가진다. 큰 규모의 문제에서는 이 계산이 gradient 계산보다 훨씬 비용이 크다. 또한 Hessian이 positive definite하지 않으면 역행렬이 제대로 정의되지 않거나 잘못된 방향으로 업데이트할 수 있다.

이러한 계산 부담 때문에 Newton's method는 파라미터 개수가 적은 문제나, Hessian의 구조를 활용할 수 있는 특수한 경우에 주로 사용된다. 실제 deep learning에서는 거의 사용되지 않는다.

---

## 3. Quasi-Newton Methods

Newton's method의 장점은 살리되 계산 비용을 줄이기 위해 quasi-Newton methods가 개발되었다. 이 방법들은 Hessian을 직접 계산하지 않고 gradient 정보만으로 Hessian의 근사를 iterative하게 구성한다. 가장 대표적인 방법이 BFGS(Broyden-Fletcher-Goldfarb-Shanno)다.

BFGS는 Hessian의 역행렬 $B_t \approx H^{-1}$를 근사하며, 매 iteration마다 다음과 같이 업데이트한다:

$$
\theta_{t+1} = \theta_t - B_t \nabla L(\theta_t)
$$

$B_t$는 gradient의 변화를 관찰하여 점진적으로 개선된다. BFGS는 여전히 $O(d^2)$의 메모리를 요구하지만, Hessian을 직접 계산하는 것보다는 훨씬 효율적이다.

### L-BFGS (Limited-memory BFGS)

대규모 문제를 위해 L-BFGS가 개발되었다. L-BFGS는 전체 근사 행렬 $B_t$를 저장하지 않고, 최근 몇 개의 gradient와 파라미터 변화만을 메모리에 유지한다. 일반적으로 5-20개 정도의 history를 사용하며, 이를 통해 Hessian과 gradient의 곱을 암묵적으로 계산한다.

메모리 사용량이 $O(md)$로 줄어들기 때문에($m$은 저장할 history 개수), 파라미터가 많은 문제에서도 사용 가능하다. L-BFGS는 batch optimization에서 매우 효과적이며, 특히 전체 데이터셋이 작거나 중간 크기인 경우 SGD 기반 방법보다 빠르게 수렴한다. 하지만 stochastic 상황에서는 gradient의 noise 때문에 성능이 저하되어, mini-batch 환경의 deep learning에서는 잘 사용되지 않는다.

### 실제 사용

Newton's method와 그 변형들은 주로 다음과 같은 상황에서 효과적이다. 파라미터 수가 수천 개 이하인 전통적인 기계학습 모델(logistic regression, SVM 등), 전체 데이터를 사용하는 batch optimization, 높은 정확도가 요구되는 과학 계산 등이 해당된다.

반면 deep learning처럼 파라미터가 매우 많고 stochastic gradient를 사용하는 경우에는 computational overhead가 이점을 상쇄한다. 현대의 대부분 deep learning framework들은 Adam이나 SGD with momentum 같은 1차 방법을 기본으로 사용하며, 이들은 구현이 간단하고 대규모 데이터에 잘 확장된다.

