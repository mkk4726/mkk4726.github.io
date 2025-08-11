---
title: "Genetic Programming이란?"
date: "2025-08-11"
excerpt: "Genetic Programming의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["machine-learning", "statistics"]
---


# Genetic Programming(GP)이란?
---

참고자료
- [Koza (1992) Genetic Programming]
- [Wikipedia - Genetic programming](https://en.wikipedia.org/wiki/Genetic_programming)
- [DEAP: Distributed Evolutionary Algorithms in Python](https://deap.readthedocs.io/)
- [gplearn: Genetic Programming in Python](https://gplearn.readthedocs.io/)
- [PySR: High-Performance Symbolic Regression in Python](https://github.com/MilesCranmer/PySR)


## 개념 요약

> Genetic Programming은 evolutionary algorithm의 한 형태로, 개체를 고정 길이 벡터가 아니라 “프로그램/수식(expression)” 그 자체로 간주하고 selection, crossover, mutation 같은 연산을 통해 점진적으로 개선하는 방법이다. 
> 특히 tree-structured representation을 사용한 수식 탐색에 널리 쓰이며, Symbolic Regression의 핵심 backbone으로 활용된다.

- **목표**: 주어진 목적함수(fitness)를 최소화/최대화하는 program을 자동으로 발견
- **표현(Representation)**: 보통 tree로 표현된 expression(내부 노드=operators, 리프=variables/constants)
- **탐색(Search)**: population 기반 evolutionary search (selection → crossover/mutation → replacement)
- **다목적 최적화**: 정확도와 복잡도(해석성) 사이의 절충을 함께 고려


## 목적함수와 다목적 관점

예측 문제에서 흔한 설정은 예측 오차와 표현 복잡도를 동시에 줄이는 것이다.

$$
\min_f \; \Big[\; \text{Error}(f),\; \text{Complexity}(f) \;\Big]
$$

단일 스칼라로 합치는 방식(parsimony pressure)도 많이 쓴다.

$$
\text{Fitness}_{\text{penalized}}(f) = \text{Error}(f) + \lambda\,\text{size}(f)
$$

여기서 `size(f)`는 노드 수, 트리 깊이, description length 등으로 정의한다. `\lambda`는 복잡도 패널티 강도를 조절한다. 또는 NSGA-II 같은 non-dominated sorting으로 Pareto frontier를 유지한다.


## 전형적 파이프라인
1) Function/Terminal set 정의: 사용할 operators(+, −, ×, ÷, sin, exp, log, ...), variables, constants 범위 설정
2) 초기 개체 생성: ramped half-and-half로 다양한 깊이/모양의 트리를 만들기
3) Fitness 평가: train(또는 CV)에서 Error와 Complexity 산출
4) Selection: tournament 등으로 부모 선택, elitism으로 최상위 보존
5) Variation: subtree crossover, mutation(point/subtree/hoist)로 새 개체 생성
6) 제약/안전장치: max depth/size, safe operators(0-division 보호 등)
7) 세대 반복: budget(세대 수, population size) 내에서 반복, validation 기준으로 best 선택


## 핵심 연산자와 설계 요소
- **Selection**: tournament selection이 단순하면서도 효과적. tournament size가 클수록 exploitation↑, 다양성↓
- **Crossover (subtree)**: 두 부모의 서브트리를 교환해 자식 생성. 구조적 탐색의 핵심
- **Mutation**: point/subtree/hoist mutation으로 부분 구조를 무작위 변화해 다양성 확보
- **Elitism/Reproduction**: 우수 개체를 보존해 퇴행 방지
- **Bloat control**: 표현이 불필요하게 커지는 bloat 방지용으로 max depth/size, lexicographic parsimony, size-fair crossover 등을 사용
- **Ephemeral Random Constants(ERC)**: 트리 말단에 난수 상수를 두고 필요 시 지역 탐색으로 미세 조정
- **Typing/Grammar constraints**: strongly typed GP나 grammar-guided GP로 유효한 프로그램만 생성하도록 제한


## 대표 변형들
- **Tree-based GP**: 가장 표준적 형태. Symbolic Regression에 광범위 사용
- **Strongly-Typed GP**: 노드별 타입 제약으로 불법 표현 방지, 탐색 안정성↑
- **Grammar-Guided GP (GGGP)**: BNF/CFG 등 문법으로 합법 프로그램만 생성
- **Linear GP / Cartesian GP**: 비트스트림 또는 graph-like 표현으로 코드/회로 형태 탐색


## 간단 알고리즘 스케치

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


## Python 예시 1: gplearn으로 Symbolic Regression

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
    n_jobs=-1,
    random_state=42,
)

est.fit(X, y)
print(est._program)
```


## Python 예시 2: DEAP으로 최소 구현 스케치

아래는 DEAP으로 매우 축약된 Symbolic Regression 골격이다. 실제로는 protected operators, depth 제약, 평가/선택 루프를 더 보강해야 한다.

```python
# pip install deap
import operator
import numpy as np
from deap import base, creator, gp, tools, algorithms

# Function/Terminal set
pset = gp.PrimitiveSet("MAIN", arity=1)
pset.addPrimitive(operator.add, 2)
pset.addPrimitive(operator.sub, 2)
pset.addPrimitive(operator.mul, 2)
pset.addPrimitive(np.sin, 1)
pset.addEphemeralConstant("rand", lambda: np.random.uniform(-1, 1))
pset.renameArguments(ARG0="x")

# Fitness/Individual
creator.create("FitnessMin", base.Fitness, weights=(-1.0,))
creator.create("Individual", gp.PrimitiveTree, fitness=creator.FitnessMin)

toolbox = base.Toolbox()
toolbox.register("expr", gp.genHalfAndHalf, pset=pset, min_=1, max_=3)
toolbox.register("individual", tools.initIterate, creator.Individual, toolbox.expr)
toolbox.register("population", tools.initRepeat, list, toolbox.individual)

# Data
rng = np.random.default_rng(0)
X = rng.uniform(-3, 3, size=200)
y = 2 * np.sin(X) + 0.1 * (X ** 2)

def eval_ind(individual):
    func = gp.compile(expr=individual, pset=pset)
    y_hat = np.array([func(x) for x in X])
    return ((y_hat - y) ** 2).mean(),

toolbox.register("evaluate", eval_ind)
toolbox.register("select", tools.selTournament, tournsize=5)
toolbox.register("mate", gp.cxOnePoint)
toolbox.register("mutate", gp.mutUniform, expr=toolbox.expr, pset=pset)
toolbox.decorate("mate", gp.staticLimit(key=len, max_value=17))
toolbox.decorate("mutate", gp.staticLimit(key=len, max_value=17))

pop = toolbox.population(n=200)
hof = tools.HallOfFame(1)
algorithms.eaSimple(pop, toolbox, cxpb=0.8, mutpb=0.2, ngen=30, halloffame=hof, verbose=False)

print(hof[0])
```


## 장점과 단점
- **장점**
  - 표현력: 모델 형태 자체를 탐색하므로 비선형/상호작용을 유연하게 포착
  - 해석성: 결과가 수식/규칙이면 설명과 지식 발견에 유리
  - 도메인 priors 통합: operators/grammar 제약으로 도메인 지식 주입 가능
- **단점**
  - 계산 비용: 탐색 공간이 매우 크고 세대 반복이 필요
  - Bloat/과적합: 제약과 패널티 없으면 표현이 비대해지고 노이즈 적합 위험
  - 재현성: 확률적 탐색 특성상 난수 시드, 설정에 민감


## 언제 유용한가
- 식 형태가 중요한 과학/공학 모델링(equation discovery)
- 복잡한 feature interaction을 설명 가능한 형태로 포착하고 싶을 때
- 규칙/프로그램 합성이 필요한 컨트롤/휴리스틱 설계
- Feature engineering(SymbolicTransformer)로 해석 가능한 새 특징 생성


## 실무 팁
- **Function set 최소화**: 도메인 친화적 operators만 두고 시작 → 탐색 공간 축소, 해석성 향상
- **안전한 연산자**: protected division/log/sqrt, bound-check로 수치 안정성 확보
- **복잡도 제약**: `max depth/size`, parsimony penalty, size-fair crossover로 bloat 제어
- **Validation 관리**: train/validation 분리, Pareto set에서 단순한 식 우선 검토
- **Search budget 점증**: generations/population을 점진적으로 늘리며 개선 추적
- **Seed 고정 및 로깅**: reproducibility를 위해 random state와 결과 수식/길이/성능 기록


## 관련 키워드
- Symbolic Regression, Interpretable ML, Program Synthesis
- 구현 라이브러리: DEAP, gplearn(SymbolicRegressor/Transformer), PySR

