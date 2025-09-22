---
title: "Logistic Regression Error"
date: "2025-09-22"
excerpt: "Divide by Zero & Overflow이 발생하는 이유"
category: "Recommendation"
tags: ["Azura", "Modeling"]
---

```python
from sklearn.linear_model import LogisticRegression

lg_reg = LogisticRegression()
lg_reg.fit(X_tr, y_tr)
```

LogisticRegression을 학습할 때 다음과 같은 에러가 발생하는 이유

```
/miniconda3/lib/python3.12/site-packages/sklearn/utils/extmath.py:203: RuntimeWarning: divide by zero encountered in matmul
  ret = a @ b
/miniconda3/lib/python3.12/site-packages/sklearn/utils/extmath.py:203: RuntimeWarning: overflow encountered in matmul
  ret = a @ b
/miniconda3/lib/python3.12/site-packages/sklearn/utils/extmath.py:203: RuntimeWarning: invalid value encountered in matmul
  ret = a @ b
```

> 핵심은 X_tr @ w(또는 X_tr.T @ r) 같은 연산에서 값이 ±inf로 튀거나 NaN이 생겨버렸다는 것

나의 경우에는 카테고리형 피처를 label encoding 했는데, 카테고리 개수가 많이지면서 다른 피처 값이랑 차이가 많이 나게 되어서 발생한 문제.

- Label Encoding된 categorical 변수들이 매우 큰 값을 가짐
    - 예: device_id가 1000000+ 의 값
    - 예: site_id가 500000+ 의 값
- 피처 간 스케일 차이가 극심함
    - hour_of_day: 0~23
    - device_id: 0~1000000+
- 가중치(weights) 계산 시 수치적 불안정성 발생

# Sklearn의 LogisticRegression의 solver

## 1. liblinear (default)

```
LogisticRegression(solver='liblinear')
```

- 특징:
    - 작은 데이터셋에 최적화 (수천~수만 개 샘플)
    - L1, L2 정규화 모두 지원
    - 메모리 효율적
    - 수치적으로 안정적
    - 단일 스레드
장점: 빠르고 안정적, 정규화 옵션 풍부
단점: 대용량 데이터에서는 느림

## 2. saga (Stochastic Average Gradient)

```
LogisticRegression(solver='saga')
```

- 특징:
    - 대용량 데이터에 최적화 (수십만~수백만 개 샘플)
    - L1, L2 정규화 모두 지원
    - Sparse 데이터에 효율적
    - 멀티스레드 지원
    - Stochastic gradient 기반
- 장점: 대용량 데이터에서 빠름, 메모리 효율적
- 단점: 작은 데이터에서는 오히려 느릴 수 있음

## 3. lbfgs (Limited-memory BFGS)

```
LogisticRegression(solver='lbfgs')
```

- 특징:
    - 중간 크기 데이터에 적합
    - L2 정규화만 지원
    - Quasi-Newton 방법
    - 메모리 사용량이 큼

장점: 수렴이 빠름 (적은 반복)
단점: L1 정규화 불가, 메모리 많이 사용

## 4. newton-cg (Newton Conjugate Gradient)

- 특징:
    - L2 정규화만 지원
    - Hessian 행렬 계산
    - 메모리 사용량이 큼

장점: 정확한 수렴
단점: 메모리 많이 사용, L1 정규화 불가