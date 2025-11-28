---
title: "Azura modeling 정리"
date: "2025-09-22"
excerpt: "Azura dataset으로 모델링하면서 고민했던 부분, 배웠던 부분 정리"
category: "Recommendation"
tags: ["Azura", "Modeling"]
---

# 1. Baseline model : Logistic Regression

가장 처음으로 baseline model 만들기.
가장 단순한 모델과 단순한 피처만 사용해보기

- model : logistic regression
- feature : "banner_pos", "C1" (광고에 대한 정보만 사용)

## label encoding 에서의 문제

세부카테고리가 너무 많은 경우에 label encoding을 하게 되면 encoding된 값이 너무 커지는 문제가 생기네.
이렇게 커질정도로 카테고리가 많은 피처는 애초에 제외하고 사용하는게 맞는 것 같다.


## label 불균형에서 오는 문제

```python
y_tr.value_counts(normalize=True)

click
0    0.830194
1    0.169806
Name: proportion, dtype: float64
```

그냥 학습시키게 되면 예측값을 다 0으로 뱉어버림.
0으로만 해도 84%정도는 맞추니까 loss 값이 낮아지게 되기 때문에

```python
lg_reg = LogisticRegression(solver="liblinear", random_state=42)
y_pred = lg_reg.predict(X_ts)
```

```python
print(y_pred.mean())

0.0
```

가장 단순하게 해결하는 방법은 label별로 가중치를 조정해주는 것

```python
lg_reg = LogisticRegression(
    solver='saga',
    class_weight='balanced',  # 자동으로 클래스 비율에 반비례하는 가중치
    C=0.1,
    random_state=42
)
```

```python
print(y_pred.mean())

0.27988432552202047
```

## 결과

0으로만 뱉는 문제 해결됨.
logloss도 0.59정도에서 0.69로 향상.

하지만 여전히 성능은 안좋은 상태.

```
Log Loss: 0.6904
ROC AUC: 0.5335
Accuracy: 0.6920
Precision: 0.1994
Recall: 0.2718
F1 Score: 0.2301

Actual CTR: 0.1693
Predicted CTR: 0.4983
CTR Bias: 0.3290
```

사실 안좋은건지에 대한 감도 잘 안온다. CTR prediction task는 처음이라.
피처들이 전부 다 범주형이라서 CatBoost가 효과적이지 않을까?

---

# 2. Catboost

- feature : "banner_pos", "C1" (광고에 대한 정보만 사용)

```
=== Baseline Logistic Regression Results ===
Log Loss: 0.6956
ROC AUC: 0.5392
Accuracy: 0.6920
Precision: 0.1994
Recall: 0.2718
F1 Score: 0.2301

Actual CTR: 0.1693
Predicted CTR: 0.5028
CTR Bias: 0.3336
```

성능이 크게 좋아지진 않았네.

- feature : 'C1', 'banner_pos', 'site_id', 'site_domain', 'site_category', 'app_id', 'app_domain', 'app_category'

(광고에 대한 정보 + 사이즈 정보 + 앱 정보)

```
=== Baseline Logistic Regression Results ===
Log Loss: 0.6357
ROC AUC: 0.7282
Accuracy: 0.6920
Precision: 0.1994
Recall: 0.2718
F1 Score: 0.2301

Actual CTR: 0.1693
Predicted CTR: 0.4680
CTR Bias: 0.2987
```

