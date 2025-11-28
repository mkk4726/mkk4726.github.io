---
title: "Logarithmic Loss란?"
date: "2025-09-22"
excerpt: "CTR prediction에서 사용되는 metric 정리"
category: "Recommendation"
tags: ["CTR-prediction"]
---

Logarithmic Loss(로그 손실)는 분류 문제, 특히 이진 분류에서 모델의 예측 성능을 측정하는 지표입니다. 
다른 이름으로는 Log Loss, Cross-Entropy Loss라고도 불립니다.

$$
\text{Log Loss} = -\frac{1}{N} \sum_{i=1}^{N} [y_i \log(p_i) + (1-y_i) \log(1-p_i)]
$$
- N: 샘플의 수
- y: 실제 클래스 (0 또는 1)
- p: 예측된 확률 (0과 1 사이)


단순히 클릭/비클릭을 예측하는 것이 아니라, 얼마나 정확한 확률을 예측하는지를 중요하게 여기기 때문에 이 지표를 사용한다고 합니다.

> 정확도가 단순히 정답/오답만을 판별하는 것과 달리, 로그 손실은 모델이 예측한 확률값을 기반으로 성능을 평가합니다. 
> 즉, 모델이 정답을 얼마나 확신하는지를 고려합니다.

---

## 파이썬 구현

### 기본 구현

```python
import numpy as np
from sklearn.metrics import log_loss

def logarithmic_loss(y_true, y_pred_proba):
    """
    Logarithmic Loss 계산
    
    Parameters:
    y_true: 실제 클래스 (0 또는 1)
    y_pred_proba: 예측 확률 (0과 1 사이)
    """
    # 0으로 나누는 것을 방지하기 위해 아주 작은 값 추가
    epsilon = 1e-15
    y_pred_proba = np.clip(y_pred_proba, epsilon, 1 - epsilon)
    
    # Log Loss 계산
    log_loss = -np.mean(y_true * np.log(y_pred_proba) + 
                       (1 - y_true) * np.log(1 - y_pred_proba))
    return log_loss

# 예시 데이터
y_true = np.array([1, 0, 1, 0, 1])
y_pred_proba = np.array([0.9, 0.1, 0.8, 0.2, 0.7])

# 구현한 함수로 계산
custom_log_loss = logarithmic_loss(y_true, y_pred_proba)
print(f"Custom Log Loss: {custom_log_loss:.4f}")

# sklearn으로 검증
sklearn_log_loss = log_loss(y_true, y_pred_proba)
print(f"Sklearn Log Loss: {sklearn_log_loss:.4f}")
```

### CTR 예측에서의 활용

```python
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import log_loss

# 예시: CTR 데이터
# 실제 사용 시에는 train_df, test_df를 사용
X_train, X_test, y_train, y_test = train_test_split(
    features, target, test_size=0.2, random_state=42, stratify=target
)

# 모델 훈련
model = LogisticRegression()
model.fit(X_train, y_train)

# 예측 확률
y_pred_proba = model.predict_proba(X_test)[:, 1]

# Log Loss 계산
log_loss_score = log_loss(y_test, y_pred_proba)
print(f"Log Loss: {log_loss_score:.4f}")
```

### Log Loss 해석

```python
# 다양한 예측 확률에 따른 Log Loss 비교
def compare_predictions():
    y_true = [1, 1, 0, 0]  # 실제 클릭 여부
    
    predictions = {
        "Perfect": [1.0, 1.0, 0.0, 0.0],      # 완벽한 예측
        "Good": [0.9, 0.8, 0.1, 0.2],         # 좋은 예측
        "Poor": [0.6, 0.7, 0.4, 0.3],         # 나쁜 예측
        "Terrible": [0.1, 0.2, 0.9, 0.8]      # 매우 나쁜 예측
    }
    
    for name, pred in predictions.items():
        loss = log_loss(y_true, pred)
        print(f"{name:>10}: {loss:.4f}")

compare_predictions()
```

**결과 해석:**
- **Perfect (0.0000)**: 완벽한 예측으로 Log Loss가 0에 가까움
- **Good (0.1993)**: 좋은 예측으로 낮은 Log Loss
- **Poor (0.6829)**: 나쁜 예측으로 높은 Log Loss  
- **Terrible (2.3026)**: 매우 나쁜 예측으로 매우 높은 Log Loss

### 실제 CTR 예측에서의 고려사항

```python
# 클래스 불균형 처리
def balanced_log_loss(y_true, y_pred_proba, sample_weight=None):
    """
    클래스 불균형이 심한 CTR 데이터에서 사용할 수 있는 
    가중치가 적용된 Log Loss
    """
    if sample_weight is None:
        # 클릭 비율에 따른 자동 가중치 계산
        click_ratio = np.mean(y_true)
        sample_weight = np.where(y_true == 1, 1/click_ratio, 1/(1-click_ratio))
    
    epsilon = 1e-15
    y_pred_proba = np.clip(y_pred_proba, epsilon, 1 - epsilon)
    
    log_loss = -np.mean(sample_weight * (
        y_true * np.log(y_pred_proba) + 
        (1 - y_true) * np.log(1 - y_pred_proba)
    ))
    return log_loss
```