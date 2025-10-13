---
title: "SVM이란?"
date: "2025-10-03"
excerpt: "가장 기본적인 ml model 다시 한번 복습해보기."
category: "Data Science"
tags: ["SVM", "machine-learning"]
---

## 개념 스케치

데이터의 클래스를 잘 구분하는 벡터를 찾는 것.
즉 구분선과 각 클래스까지의 구분되는 정도가 최대가 되도록 하는 것.

단순한 직선으로는 구분하기 어려운 경우가 많다 -> 복잡한 직선을 쓴다 (이게 직관적인데)
대신 -> 공간을 확장한다 (커널)

---

## SVM (Support Vector Machine) 개요

SVM은 지도학습 알고리즘으로, 분류와 회귀 문제 모두에 사용할 수 있지만 주로 분류 문제에서 많이 활용됩니다. 이름에서 알 수 있듯이 "벡터" 개념을 사용하여 데이터를 분류하는 결정 경계면을 찾는 알고리즘입니다.

## SVM의 핵심 개념

- **Hyperplane** : 두 클래스 사이의 margin을 최대화하는 결정 경계. 2D에서는 직선, 3D에서는 평면, 그 이상에서는 hyperplane
- **Support vector** : hyperplane에 가장 가까운 데이터 포인트로, margin의 폭을 결정하며 모델을 규정하는 핵심 표본
- **Margin** : hyperplane과 support vector 사이의 거리. margin을 최대화하면 일반화 성능이 향상되고 과적합 방지에 도움

## SVM의 핵심 원리: maximum margin 분류기

SVM의 가장 중요한 아이디어는 **maximum margin** 을 가지는 결정 경계를 찾는 것입니다.

### Margin
- 결정 경계와 가장 가까운 데이터 포인트들(support vector) 사이의 거리
- 이 거리가 최대가 되도록 결정 경계를 설정하면 일반화 성능이 향상됨

### Hard margin vs Soft margin

#### Hard margin
- 모든 학습 데이터를 완벽하게 분류하려는 접근법
- 수학식: 모든 데이터 포인트에 대해 $y_i(\mathbf{w} \cdot \mathbf{x}_i + b) \geq 1$
- **장점**: 명확한 결정 경계
- **단점**: 이상치(outlier)에 매우 민감하고, 선형 분리 불가능한 데이터에서 사용할 수 없음

#### Soft margin
- 일부 데이터 포인트를 잘못 분류하더라도 전체적인 마진을 최대화하는 접근법
- slack variable $\xi_i$를 도입하여 제약을 완화
- 목적 함수: $\min \frac{1}{2}||\mathbf{w}||^2 + C \sum \xi_i$
- **Hyperparameter C**: 오분류를 허용하는 정도를 조절 (작을수록 소프트, 클수록 하드에 가까움)

## SVM 작동 방식

- **선형 분리 가능한 경우** : 두 클래스를 선형(직선/평면/hyperplane)으로 나눌 수 있을 때, margin을 최대화하는 hyperplane을 찾아 분류
- **선형 분리 불가능한 경우** : 실제 데이터는 비선형이 많으므로, kernel trick으로 고차원 특징 공간에서 선형 분리가 가능하도록 변환
- **Soft margin 적용** : 현실 세계의 노이즈와 이상치를 고려해 일부 오분류를 허용하여 보다 견고한 경계를 학습

## Kernel trick

### 왜 커널이 필요할까?
선형적으로 분리되지 않는 데이터의 경우, 고차원 공간으로 매핑하면 선형 분리가 가능해집니다. 하지만 고차원으로 직접 매핑하면 계산량이 기하급수적으로 증가합니다.

### Kernel trick의 원리
inner product를 계산하는 함수를 정의하여 고차원 매핑을 우회적으로 수행합니다.

### 주요 커널 함수들

#### 1. Linear kernel
```python
K(x, y) = x · y
```
- 기본 형태로 사용

#### 2. Polynomial kernel
```python
K(x, y) = (γ(x · y) + r)^d
```
- 매개변수: γ (gamma), r (coef0), d (degree)
- 비선형 결정 경계를 만들 수 있음

#### 3. RBF kernel
```python
K(x, y) = exp(-γ||x - y||^2)
```
- 가장 많이 사용되는 커널
- 매개변수: γ (gamma)
- γ가 작을수록 부드러운 결정 경계, 클수록 복잡한 결정 경계

#### 4. Sigmoid kernel
```python
K(x, y) = tanh(γ(x · y) + r)
```
- 신경망과 유사한 형태

## 주요 하이퍼파라미터

| 파라미터 | 설명 | 기본값 |
|----------|------|--------|
| `C` | 소프트 마진 정도 (오분류 허용 정도) | 1.0 |
| `kernel` | 커널 함수 종류 | 'rbf' |
| `gamma` | 커널 계수 (RBF, 다항식, 시그모이드에서 사용) | 'scale' |
| `degree` | 다항식 커널의 차수 | 3 |

## 장점과 단점

### 장점
1. **이상치에 강건함**: Soft margin을 통해 outlier의 영향을 줄임
2. **고차원 데이터 처리**: kernel trick을 통해 고차원 데이터도 효과적으로 처리
3. **메모리 효율성**: 서포트 벡터만 기억하면 되므로 메모리 사용량이 적음
4. **이론적 기반**: 강력한 수학적 이론 (VC 차원, 구조적 위험 최소화)을 바탕으로 함

### 단점
1. **대규모 데이터 처리 어려움**: 훈련 시간이 데이터 제곱에 비례하여 증가
2. **하이퍼파라미터 튜닝**: 커널 선택과 파라미터 설정이 까다로움
3. **확률 예측 어려움**: 기본적으로 결정 함수만 제공 (플랫폼에 따라 predict_proba 사용 가능)
4. **다중 클래스 분류**: 원래는 이진 분류이므로 다중 클래스에는 확장 필요

## 활용 분야

1. **텍스트 분류**: 문서 분류, 스팸 메일 필터링
2. **이미지 분류**: 손글씨 숫자 인식, 얼굴 인식 등
3. **생물정보학**: 유전자 분류, 단백질 분류
4. **금융**: 신용 위험 평가, 주식 시장 예측
5. **의료**: 질병 진단, 환자 분류
6. **이상 탐지**: One-Class SVM을 활용한 비지도 이상치 탐지

## 코드 예시 (Python, scikit-learn)

```python
from sklearn.svm import SVC
from sklearn.datasets import make_classification
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

# 데이터 생성
X, y = make_classification(n_samples=1000, n_features=20,
                          n_informative=10, random_state=42)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# SVM 모델 생성 및 학습
svm_model = SVC(kernel='rbf', C=1.0, gamma='scale', random_state=42)
svm_model.fit(X_train, y_train)

# 예측 및 평가
y_pred = svm_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy:.3f}")

# 하이퍼파라미터 튜닝 예시 (GridSearchCV)
from sklearn.model_selection import GridSearchCV

param_grid = {
    'C': [0.1, 1, 10, 100],
    'gamma': ['scale', 'auto', 0.001, 0.01, 0.1, 1],
    'kernel': ['rbf', 'linear']
}

grid_search = GridSearchCV(SVC(), param_grid, cv=5, scoring='accuracy')
grid_search.fit(X_train, y_train)

print(f"Best parameters: {grid_search.best_params_}")
print(f"Best cross-validation score: {grid_search.best_score_:.3f}")
```

## 정리

SVM은 전통적인 머신러닝 알고리즘 중 하나로, 여전히 많은 실무 현장에서 활용되고 있습니다. 특히 kernel trick을 통한 비선형 분류 능력과 강력한 이론적 기반이 장점입니다. 하지만 딥러닝 기법이 발전함에 따라 대규모 데이터에서는 다소 밀리는 경향이 있습니다.

SVM을 효과적으로 사용하기 위해서는:
1. 데이터의 특성에 맞는 커널 선택
2. 적절한 하이퍼파라미터 튜닝
3. 데이터 전처리 (특히 스케일링)의 중요성

을 명심해야 합니다.