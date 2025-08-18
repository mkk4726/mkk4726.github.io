---
title: "Symbolic Regressor Model이란?"
date: "2025-08-11"
excerpt: "Symbolic Regressor Model의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["machine-learning", "statistics"]
---

# Symbolic Regressor Model이란?
---

참고자료
- [Wikipedia - Symbolic regression](https://en.wikipedia.org/wiki/Symbolic_regression)
- [PySR: High-Performance Symbolic Regression in Python](https://github.com/MilesCranmer/PySR)
- [gplearn (Genetic Programming in Python)](https://gplearn.readthedocs.io/)
- [Koza (1992) Genetic Programming]


## 개념 요약

Symbolic Regression은 데이터로부터 “함수 형태(functional form)” 자체를 탐색해 발견하는 방법. 즉, 고정된 모델 형태에 파라미터만 맞추는 것이 아니라, operators (e.g., +, −, ×, ÷, sin, exp, log)와 variables를 조합해 interpretable equations를 찾는다.

- **목표**: predictive accuracy와 parsimony 사이의 균형을 맞춘 interpretable model 발견
- **핵심 아이디어**: operators/constants/variables로 이뤄진 tree-structured expressions를 탐색(주로 Genetic Programming)하여 loss를 최소로 하는 수식 찾기


## 어떻게 작동하나 (전형적 파이프라인)
1) Expression space 정의: 가능한 operator set, constants, variables 목록 정의
2) Initialize expressions: 무작위로 여러 expression trees 생성
3) Evaluate objective: data error (e.g., MSE)와 complexity (예: node count)를 함께 고려
4) Search (evolution): selection, crossover, mutation으로 더 좋은 수식을 점진적으로 탐색
5) Pareto frontier: accuracy와 complexity 간 최적 절충의 후보를 여러 개 유지

loss function은 일반적으로 다음과 같이 표현할 수 있다.

$$
\mathcal{L}(f) 
= \underbrace{\frac{1}{N} \sum_{i=1}^N (y_i - f(x_i))^2}_{\text{prediction error}} 
\; + \; \lambda \cdot \underbrace{\text{Complexity}(f)}_{\text{expression complexity}}
$$


## 장점과 단점
- **장점**
  - Interpretability: 결과가 명시적 수식이라 설명이 쉽다
  - Expressiveness: 비선형 관계를 유연하게 포착
  - Knowledge discovery: 데이터에 숨겨진 규칙이나 법칙을 드러내기 좋음
- **단점**
  - Computational cost: 표현식 공간이 방대, 탐색 비용이 큼
  - Overfitting risk: operators/maximum depth를 과도하게 허용하면 노이즈에 적합
  - Reproducibility: 진화적 탐색은 난수 시드에 민감할 수 있음


## 언제 유용한가
- 관계를 설명할 “closed-form equation”이 필요한 경우 (과학/공학 모델링)
- feature interactions가 복잡해 전통적 선형모델이 한계일 때
- black-box 성능도 중요하지만, interpretability와 parsimony가 핵심일 때


## 간단한 예시
예를 들어, 데이터가 다음과 같은 규칙을 따른다고 하자: 

$$
y = 2\,\sin(x) + 0.1\,x^2 + \varepsilon
$$

Symbolic Regression은 위와 유사한 형태의 수식을 데이터만 보고 발견하려 시도한다. 실제로는 coefficients나 operator 선택이 조금 다르게 나올 수 있다.


## Python으로 맛보기 (PySR)

```python
# pip install pysr
import numpy as np
from pysr import PySRRegressor

rng = np.random.default_rng(42)
X = rng.uniform(-3.0, 3.0, size=(200, 1))
y = 2 * np.sin(X[:, 0]) + 0.1 * (X[:, 0] ** 2) + rng.normal(0, 0.1, size=200)

model = PySRRegressor(
    niterations=200,
    unary_operators=("sin", "cos", "exp", "log"),
    binary_operators=("+", "-", "*", "/"),
    loss="loss(x, y) = (x - y)^2",
    maxsize=20,
    populations=20,
    progress=False,
    random_state=42,
)

model.fit(X, y)
print(model)  # 파레토 프론티어 후보 요약
print(model.sympy())  # 최고 성능/단순성 절충 식 하나 출력
```

모델은 accuracy-complexity 절충을 고려한 여러 수식을 제시한다. 예를 들어 다음과 같은 형태가 나올 수 있다.

$$
\hat{y} = 1.98\,\sin(x) + 0.12\,x^2
$$


## 실무 팁
- operator set을 도메인 지식으로 제한하면 탐색 효율과 해석 가능성이 크게 개선
- expression complexity 제약(`maxsize`, operator weights)을 강하게 주어 overfitting 방지
- cross-validation으로 일반화 성능 점검, random seed 고정으로 reproducibility 관리
- 탐색 시간 예산을 단계적으로 늘려가며 Pareto frontier를 비교


## 관련 모델/개념
- Genetic Programming
- Interpretable ML
- Sparse modeling(L1/L0)과의 비교: 전자는 주어진 형태 내 계수 희소화, SR은 형태 자체를 탐색


## Genetic Programming(GP)란?

Genetic Programming은 evolutionary algorithm 계열로, 프로그램 또는 수식(expression)을 직접 “진화”시켜서 주어진 목적함수(fitness)를 최대화/최소화하는 기법이다. Symbolic Regression에서는 operators, variables, constants로 구성된 expression tree를 개체로 취급하여 탐색한다.

- **Expression representation**: tree-structured expressions (nodes = operators, leaves = variables/constants)
- **Search operators**:
  - Selection: tournament selection 등으로 상위 개체 선별
  - Crossover: subtree 단위 교차로 두 식을 결합
  - Mutation: point/subtree/hoist mutation으로 식 일부를 무작위 변이
- **Objective(Fitness)**: 예측 오차(MSE 등)와 complexity(노드 수, 깊이 등)를 함께 고려

$$
\min_f \; (\, \text{MSE}(f),\; \text{Complexity}(f) \,)
$$

- **Key hyperparameters**: population size, generations, max depth/size, crossover rate, mutation rate, tournament size, parsimony coefficient
- **Pros/Cons**:
  - Pros: 매우 유연한 가설 공간, 높은 해석 가능성, 변수 상호작용 자동 발견
  - Cons: 계산 비용 큼, expression bloat(불필요하게 커짐) 위험, 확률적 변동성
  - Mitigation: parsimony pressure(복잡도 패널티), depth/size cap, 도메인 priors로 초기 개체 시딩

관계 정리: GP는 SR에서 가장 널리 쓰이는 search backbone이며, 대안으로 simulated annealing, MCMC, reinforcement learning 기반 탐색 등이 활용되기도 한다.


## Genetic Programming 상세 설명

- **Representation (tree-based expressions)**: 각 개체는 expression tree로 표현. 내부 노드 = operators(예: +, −, ×, ÷, sin, exp, log), 리프 = variables/constants(ephemeral random constants 포함).
- **Function/Terminal set 설계**: 도메인 지식으로 operator 집합과 변수, 상수 범위를 제한하면 탐색 효율과 해석 가능성이 향상.
- **Initialization (ramped half-and-half)**: full/grow 방식을 섞어 다양한 깊이/구조의 초기 개체를 생성.
- **Selection (tournament 등)**: 여러 개체를 무작위로 뽑아 최적 개체를 선택. 간단하고 병렬화 용이.
- **Variation operators**:
  - Crossover: 두 부모의 subtree를 교환해 자식 생성
  - Mutation: point/subtree/hoist mutation으로 일부 구조를 무작위 변경
  - Reproduction: 우수 개체를 그대로 다음 세대로 복사(elitism와 함께 사용)
- **Fitness/objective**: 보통 예측 오차(MSE, MAE 등)를 최소화하면서 complexity(size, depth, description length 등)도 함께 최소화하는 multi-objective 관점

$$
\min_f \; \Big[\; \text{Error}(f),\; \text{Complexity}(f) \;\Big]
$$

- **Scalarization (Parsimony pressure)**: multi-objective를 단일 목적로 합쳐 penalty를 주기도 함

$$
\text{Fitness}_{\text{penalized}}(f) = \text{MSE}(f) + \alpha\,\text{size}(f)
$$

- **Non-dominated sorting (예: NSGA-II)**: Pareto frontier 기반으로 dominance 관계로 순위를 매겨 다양한 절충해를 유지
- **Bloat control**: expression bloat 방지용으로 max depth/size, lexicographic parsimony pressure, size-fair crossover 등을 사용
- **Constants 처리**: ephemeral random constants(무작위 상수)를 두고, 필요 시 local search/gradient-free tuning으로 계수 미세 조정
- **Typing/Grammar constraints**: strongly typed GP나 grammar-guided GP로 유효한 수식만 생성하도록 제한
- **Validation/Elitism**: validation 성능으로 조기 종료와 model pick을 안정화, 우수 개체를 다음 세대에 보존

### 간단 알고리즘 스케치

```text
Initialize population P0 with ramped half-and-half
for gen in 1..G:
  Evaluate Error(f) and Complexity(f) for all f in P_{gen-1}
  Update Pareto frontier with elitism
  while |P_gen| < population_size:
    Select parents via tournament selection
    With prob pc: offspring = crossover(parent1, parent2)
    With prob pm: offspring = mutate(offspring)
    Enforce size/depth constraints on offspring
    Add offspring to P_gen
Return best model on validation (accuracy-parsimony trade-off)
```

### 실무 셋업 팁
- function set: 도메인에 맞는 연산자만(예: 안전한 division, log1p) 사용해 수식 안정성 확보
- constraints: `max depth/size`, safe operators, domain bounds로 탐색 공간 제어
- objectives: validation error + complexity를 함께 모니터링(또는 parsimony penalty)
- search budget: generations, population size를 점진적으로 늘리며 Pareto set 비교
- reproducibility: random seed 고정, 결과 수식은 심플한 것부터 우선 검토

### PySR와의 연결
- PySR는 multi-population evolutionary search와 parsimony pressure를 활용해 빠르게 Pareto frontier를 구축
- 하이퍼파라미터 예: `niterations`, `maxsize`, `binary_operators`, `unary_operators`, `loss`, `populations`


## gplearn로 구현하기 (SymbolicRegressor)

`gplearn`은 scikit-learn 스타일의 Symbolic Regression/Transformation을 제공한다. 기본 연산자는 protected operators를 사용해 `div`(0 나눗셈 보호), `log`(음수/0 보호) 등 수치 안정성을 확보한다.

### Quick start

```python
# pip install gplearn
import numpy as np
from gplearn.genetic import SymbolicRegressor

rng = np.random.default_rng(42)
X = rng.uniform(-3.0, 3.0, size=(200, 1))
y = 2 * np.sin(X[:, 0]) + 0.1 * (X[:, 0] ** 2) + rng.normal(0, 0.1, size=200)

est = SymbolicRegressor(
    population_size=2000,
    generations=30,
    function_set=("add", "sub", "mul", "div", "sin", "cos", "log", "sqrt"),
    metric="mse",
    parsimony_coefficient=0.001,
    p_crossover=0.8,
    p_subtree_mutation=0.05,
    p_hoist_mutation=0.01,
    p_point_mutation=0.05,
    init_depth=(2, 5),
    init_method="half and half",
    const_range=(-2.0, 2.0),
    tournament_size=20,
    stopping_criteria=0.0,
    max_samples=0.9,
    n_jobs=-1,
    random_state=42,
    verbose=1,
)

est.fit(X, y)
print(est._program)     # 발견된 최종 수식 문자열
print(est.predict(X)[:5])
```

### 주요 인자 설명
- **population_size**: 세대당 개체 수. 클수록 탐색 폭↑, 시간/메모리 비용↑
- **generations**: 세대 수. 예산(budget)과 함께 조절
- **function_set**: 사용 연산자 세트. 도메인에 맞게 축소 권장. `div`, `log`, `sqrt` 등은 protected 버전
- **metric**: `"mse"`, `"mae"` 또는 사용자 정의 함수 가능
- **parsimony_coefficient**: 모델 크기(size)에 대한 패널티 강도. 과적합/블로트 완화
- **p_crossover / p_subtree_mutation / p_hoist_mutation / p_point_mutation**: variation 확률. 교차/서브트리/호이스트/포인트 변이 비율
- **init_depth, init_method**: 초기 트리 깊이/방식(`"full"`, `"grow"`, `"half and half"`)
- **const_range**: ephemeral random constants 범위. `None`이면 상수 비활성화
- **tournament_size**: selection 압력 강도. 클수록 exploitation↑, 다양성↓
- **stopping_criteria**: metric이 임계값 이하가 되면 조기 종료
- **max_samples**: 각 세대 학습에 사용하는 샘플 비율(bootstrap/bagging 효과)
- **n_jobs**: 병렬 처리 수. `-1`은 CPU 전부 사용
- **random_state**: 재현성
- **verbose**: 진행 로그 출력
- 참고: `SymbolicTransformer`는 특징 생성기처럼 새 feature들을 만들어 downstream 모델에 사용할 수 있음

### 실무 권장 설정
- 연산자: 도메인에 맞는 최소 집합으로 시작하고 필요 시 추가
- 패널티: `parsimony_coefficient`를 충분히 크게 설정해 단순한 식 우선
- 제약: `init_depth`, `const_range`, `tournament_size`를 완만히 조정하며 overfitting/bloat 균형
- 검증: validation 성능으로 best program을 선택하고 seed 고정

## gplearn 실험 가이드: 하이퍼파라미터 셋업

### 빠른 베이스라인 권장값
- Small data (< 10k rows):
  - `population_size=2000`, `generations=30`
  - `function_set=("add","sub","mul","div","sin","cos","log","sqrt")`
  - `parsimony_coefficient=0.001`
  - `p_crossover=0.8`, `p_subtree_mutation=0.05`, `p_point_mutation=0.05`, `p_hoist_mutation=0.01`
  - `init_depth=(2,5)`, `init_method="half and half"`, `const_range=(-2,2)`
  - `tournament_size=20`, `metric="mse"`, `max_samples=1.0`, `n_jobs=-1`, `random_state=42`
- Medium data (10k–100k rows):
  - `population_size=3000–5000`, `generations=50–100`
  - `parsimony_coefficient=0.003–0.01` (bloat 발생 시 상향)
  - `max_samples=0.7–0.9`로 약한 bagging 적용해 generalization 향상

### 주요 하이퍼파라미터 상호작용
- **population_size × generations**: 탐색 예산. 둘 다 증가하면 성능 잠재력↑, 시간/메모리 비용↑
- **tournament_size**: selection 압력. 크게 하면 exploitation↑, 다양성↓ → 너무 크면 조기 수렴 위험
- **parsimony_coefficient**: size penalty 강도. 클수록 단순한 식 선호, 과적합/블로트 완화
- **function_set**: 도메인 맞춤 축소 권장. 불필요 연산자 제거로 탐색 공간 축소, 해석성↑
- **variation 확률**: `p_crossover`는 높게, mutation 비율은 작게 시작. 정체 시 mutation 소폭↑
- **init_depth / init_method**: 초기 다양성에 영향. 너무 얕으면 탐색 부족, 너무 깊으면 초기에 bloat
- **max_samples**: 1.0 미만이면 세대별 subsampling으로 bagging 유사 효과 → 과적합 완화

### 안정성과 전처리
- gplearn의 `div`, `log`, `sqrt`는 protected operators라 수치 안정성 양호
- feature scaling은 필수는 아니지만 탐색 안정화에 도움(표준화/정규화 권장)
- 타깃 스케일도 식 복잡도에 영향. 필요 시 타깃 스케일링 후 추론 시 역변환

### Validation과 재현성
- `train/validation` 분리 후 validation MSE로 설정 비교
- `random_state` 고정, 결과 수식 길이와 성능을 함께 기록해 단순한 식 우선

```python
from sklearn.model_selection import train_test_split
from gplearn.genetic import SymbolicRegressor

X_tr, X_val, y_tr, y_val = train_test_split(X, y, test_size=0.2, random_state=42)

est = SymbolicRegressor(
    population_size=3000,
    generations=50,
    function_set=("add","sub","mul","div","sin","cos","log","sqrt"),
    metric="mse",
    parsimony_coefficient=0.003,
    p_crossover=0.8,
    p_subtree_mutation=0.05,
    p_hoist_mutation=0.01,
    p_point_mutation=0.05,
    init_depth=(2,5),
    init_method="half and half",
    const_range=(-2,2),
    tournament_size=20,
    max_samples=0.9,
    n_jobs=-1,
    random_state=42,
)

est.fit(X_tr, y_tr)
val_mse = ((est.predict(X_val) - y_val) ** 2).mean()
```

### Custom function 추가하기
`make_function`으로 도메인 친화적 연산자를 추가하면 탐색 효율이 크게 향상될 수 있다.

```python
import numpy as np
from gplearn.functions import make_function

def safe_exp(x):
    return np.exp(np.clip(x, -10, 10))  # 폭주 방지

Exp = make_function(function=safe_exp, name="exp", arity=1)

est = SymbolicRegressor(
    function_set=("add","sub","mul","div","sin","cos","log","sqrt", Exp),
    # ... 기타 하이퍼파라미터 ...
)
```

### 모니터링과 블로트 제어
- `verbose=1`로 진행 상황 모니터링, 수식 길이가 과도하면 `parsimony_coefficient` 상향
- 필요 시 `function_set` 축소 또는 `tournament_size` 하향으로 다양성 회복
- 최종 식은 `est._program`으로 문자열 형태 확인 가능
