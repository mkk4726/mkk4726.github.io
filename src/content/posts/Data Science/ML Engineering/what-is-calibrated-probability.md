---
title: "보정된 확률(Calibrated Probability)이란?"
date: "2025-08-18"
excerpt: "머신러닝 모델의 확률 예측을 실제 관찰 빈도와 일치시키는 방법에 대한 정리"
category: "Data Science"
tags: ["calibration", "probability", "machine-learning", "logistic-regression", "platt-scaling"]
---

참고자료
- 1: [Scikit-learn - Probability Calibration](https://scikit-learn.org/stable/modules/calibration.html)
- 2: [nannyML](https://www.nannyml.com/blog/probability-calibration)

# 보정된 확률(Calibrated Probability)이란?

---

머신러닝 모델이 예측한 확률이 실제 관찰된 빈도와 일치하는 정도를 의미합니다. 많은 경우 모델의 출력은 확률처럼 보이지만, 실제로는 보정되지 않은(uncalibrated) 상태입니다.

> **보정되지 않은 확률**: 모델이 예측한 확률이 실제와 다를 수 있음
> **보정된 확률**: 모델의 예측 확률이 실제 관찰 빈도와 일치

## 왜 보정이 필요한가?

### Logistic Regression의 경우

Logistic Regression은 0~1 사이의 값을 출력하지만, 이는 실제 확률과 다를 수 있습니다:

```
예측 확률 | 예측 횟수 | 실제 발생 횟수 | 실제 비율
80%      | 100      | 65             | 65% (overconfident)
30%      | 100      | 45             | 45% (underconfident)
90%      | 100      | 95             | 95% (well-calibrated)
```

### 보정되지 않은 확률의 원인

1. **정규화(Regularization)**: L1/L2 정규화가 확률 추정을 왜곡
2. **클래스 불균형**: 소수 클래스에 대해 underconfident
3. **모델 복잡성**: 복잡한 모델이 훈련 데이터에 과적합
4. **특성 스케일링**: 특성의 스케일이 확률 추정에 영향

## 보정 방법

### 1. Platt Scaling

로지스틱 회귀를 사용한 후처리 방법입니다:

$$P(y=1|x) = \frac{1}{1 + \exp(-a \cdot f(x) + b)}$$

여기서:
- $f(x)$: 원본 모델의 예측값
- $a, b$: 보정 파라미터 (검증 데이터로 학습)

### 2. Isotonic Regression

단조성 제약을 가진 비모수적 방법입니다:

$$P(y=1|x) = m(f(x))$$

여기서 $m$은 monotonic increasing function입니다.

### 3. Temperature Scaling

Softmax 출력을 조정하는 방법입니다:

$$P(y=k|x) = \frac{\exp(z_k/T)}{\sum_{i=1}^{K} \exp(z_i/T)}$$

여기서 $T$는 temperature parameter입니다.

## 실제 모델별 보정 필요성

### Tree-based Models (LightGBM, XGBoost)

Tree-based 모델들은 특히 보정이 필요합니다:

```
예측 확률 | 예측 횟수 | 실제 발생 횟수 | 실제 비율
90%      | 100      | 70             | 70% (overconfident)
10%      | 100      | 30             | 30% (underconfident)
```

**왜 이런 현상이 발생할까?**

1. **Boosting 특성**: 여러 weak learner를 순차적으로 결합하면서 확률 추정이 왜곡됨
2. **과적합**: 강력한 모델이 훈련 데이터에 과적합되어 과신(overconfident)하게 됨
3. **Loss function**: 분류 정확도에 최적화되어 있지 확률 추정에는 최적화되지 않음

**해결 방법**:
```python
from sklearn.calibration import CalibratedClassifierCV
import lightgbm as lgb

# LightGBM 모델
lgb_model = lgb.LGBMClassifier()

# 보정된 모델 (isotonic이 tree-based 모델에 더 적합)
calibrated_model = CalibratedClassifierCV(
    lgb_model, 
    method='isotonic',  # LightGBM에는 isotonic이 더 적합
    cv=5
)

# 보정된 확률 (이제 사용 가능)
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

## 보정 평가 방법

### Reliability Plot (Reliability Diagram)

예측 확률과 실제 관찰 빈도(observed frequency)를 비교하는 시각화:

```
예측 확률 구간 | 샘플 수 | 실제 양성 비율
[0.0, 0.1)     | 100    | 0.05
[0.1, 0.2)     | 150    | 0.12
...
[0.9, 1.0)     | 80     | 0.92
```

### Calibration Error

보정 품질을 정량적으로 측정:

$$\text{Calibration Error} = \sum_{i=1}^{B} \frac{n_i}{N} |p_i - \hat{p}_i|$$

여기서:
- $B$: number of bins
- $n_i$: number of samples in i-th bin
- $N$: total number of samples
- $p_i$: predicted probability in i-th bin
- $\hat{p}_i$: observed frequency in i-th bin

## 실제 구현 예시

### Python 코드

```python
from sklearn.calibration import CalibratedClassifierCV
from sklearn.linear_model import LogisticRegression

# 원본 모델
base_model = LogisticRegression()

# 보정된 모델 (Platt Scaling 사용)
calibrated_model = CalibratedClassifierCV(
    base_model, 
    method='sigmoid',  # Platt Scaling
    cv=5
)

# 학습
calibrated_model.fit(X_train, y_train)

# 보정된 확률 예측
calibrated_probs = calibrated_model.predict_proba(X_test)[:, 1]
```

### sklearn.calibration 모듈

`sklearn.calibration`은 실제로 존재하는 공식 모듈입니다:

```python
# 주요 import
from sklearn.calibration import CalibratedClassifierCV
from sklearn.calibration import calibration_curve

# calibration_curve 사용 예시
fraction_of_positives, mean_predicted_value = calibration_curve(
    y_true, y_pred, n_bins=10
)
```

**CalibratedClassifierCV의 주요 파라미터**:
- `method='sigmoid'`: Platt Scaling (로지스틱 회귀 기반)
- `method='isotonic'`: Isotonic Regression (비모수적 방법)
- `cv`: Cross-validation fold 수

## 보정의 중요성

### 1. 의사결정 지원

- 확률 기반 의사결정에서 신뢰성(reliability) 확보
- 리스크 평가의 정확성 향상

### 2. 비즈니스 응용

- **의료진단**: 질병 발생 확률의 정확한 추정
- **금융리스크**: 대출 상환 확률의 신뢰성
- **추천시스템**: 사용자 선호도 확률의 정확성

### 3. 모델 평가

- 단순 정확도 외에 확률적 성능(probabilistic performance) 측정
- 모델의 불확실성(uncertainty)에 대한 이해

## 주의사항

1. **데이터 누수(Data Leakage)**: 보정 시 검증 데이터를 별도로 사용
2. **도메인 변화(Domain Shift)**: 새로운 도메인에서는 재보정 필요
3. **계산 비용(Computational Cost)**: 보정 과정에서 추가적인 계산 오버헤드

## 결론

보정된 확률은 머신러닝 모델의 출력을 실제 확률과 일치시키는 중요한 과정입니다. 특히 의사결정이 중요한 응용 분야에서는 모델의 확률 예측이 신뢰할 수 있어야 하므로, 적절한 보정 방법을 적용하는 것이 필수적입니다.

**중요한 점**:
- **Logistic Regression**: 기본적으로 보정이 필요
- **Tree-based Models (LightGBM, XGBoost)**: 특히 보정이 필수적
- **sklearn.calibration**: 공식적으로 제공되는 보정 도구
- **method 선택**: 
  - `sigmoid`: 선형 모델에 적합
  - `isotonic`: tree-based 모델에 더 적합

따라서 `predict_proba`를 직접 확률로 사용하면 안 되고, 반드시 보정 과정을 거쳐야 합니다.

---

# Bad Machine Learning models can still be well-calibrated (2번 글 정리)

> Machine learning models are often evaluated based on their performance, measured by how close some metric is to zero or one (depending on the metric), 
> but this is not the only factor that determines their usefulness. 

explore the difference between good calibration and good performance and when one might be preferred over the other.

Probability calibration?
> Probability calibration, in its strong definition, is the degree to which the probabilities predicted by a classification model match the true frequencies of the target classes in a dataset

> A model with strong calibration guarantees that its predictions satisfy the frequentist definition of probability (as opposed to the Bayesian one), which states that an event’s probability is the limit of its relative frequency in many trials.

대부분의 ML 알고리즘은 ill-calibrated하다. 확률로 쓰기는 어려움. 

> Most machine learning models are ill-calibrated, and the reasons depend on the learning algorithm

1. **Tree-based Ensembles의 문제점**
- **Random Forest**: 여러 개별 트리의 예측을 평균내어 최종 예측 생성
- **확률 추정의 한계**: 0과 1에 가까운 확률을 얻기 어려움
- **이유**: 개별 트리들 간에 항상 분산(variance)이 존재

2. **확률 추정의 왜곡 현상**
- **0 근처**: 실제보다 높게 추정 (overestimate)
- **1 근처**: 실제보다 낮게 추정 (underestimate)
- **결과**: 극단적인 확률(0% 또는 100%)을 신뢰할 수 없음

3. **모델 최적화의 문제**
- **Binary metrics**: 정확도(accuracy) 등은 단순히 맞다/틀리다만 판단
- **확실성 무시**: 모델이 얼마나 확신하는지는 고려하지 않음
- **Gini-impurity**: 의사결정트리가 분할을 결정할 때 사용하는 지표
- **목표**: 가능한 한 빠르고 정확하게 분류하는 것

왜 이런 현상이 발생할까?
1. **Ensemble 특성**: 여러 트리의 예측을 평균내면서 극단값이 완화됨
2. **분산 존재**: 각 트리가 서로 다른 패턴을 학습
3. **최적화 목표**: 분류 정확도에 집중, 확률 추정은 부차적


> The consequence of this is that while the scores produced by most machine learning models preserve order (the higher the number, the more likely the positive class), they cannot be interpreted as frequentist probabilities.

## Do you even need calibration?

> When training a classification model, you need to ask yourself a crucial question: do you actually need the model to be well-calibrated? 
> The answer will depend on how the model will be used. Let’s take a look at some examples.

문제에 따라 calibration이 필요한지 정해진다.
ranking 같은 문제에서는 필요 없을 것이고, 은행에서 대출을 갚을 확률 같은 경우에는 엄밀한 calibration이 필요할 것이다.

## A story of a poor, well-calibrated model

> But guess what, getting accurate predictions is not what we need! Just like in the credit line assignment and performance estimation examples, here too, the game is all about getting the probabilities right.

모델의 성능이 안좋을때도 유용할 수 있다.

> The model’s test accuracy was 63%. This is certainly better than a dummy model, which always predicts the home team to win; such a model would score 46% as the hosts tend to win almost half of the games. That said, 63% does not seem to be a great result.

## When it’s impossible to get a good performance

> Now consider an attempt to predict dice rolls. Our model should produce a probability of the die facing up to six after it has been rolled.

주사위를 굴려서 6이 나올 확률을 예측하는 모델의 성능은 높일 수가 없다. 어떤 값에 의해 결정되는게 아닌 랜덤이니까.

> Consider these two competing approaches. Model A is a dummy binary classifier that always predicts with full confidence that the rolled number is not a six;  that is, it predicts a six 0% of the time and a not-six 100% of the time. Model B also never predicts a six, but the probabilities it outputs are different: it always predicts a six with the probability of  ⅙ and a not-six with the probability of  ⅚.

> In the long run, both models feature the same accuracy: they are correct 5 out of 6 times. And this is as good as any model can get. However, an important fact differentiates between the two models: model B is perfectly calibrated while Model A is not calibrated at all.

되게 좋은 예시네. 예측 성능만으로는 평가할 수 없는 이유.

> As far as calibration is concerned, the two models couldn’t be more different. How about the usefulness of the two models? > Model A doesn’t really deliver any value. 
> Model B, on the other hand, allows us to accurately predict the target frequency in the long run. 
> It also allows us to run simulations to answer more complex questions such as: what is the probability of rolling four not-six and seven sixes in 11 rolls? Once again, despite the poor predictive performance, good calibration yields the model useful!





# Calibration probability 성능 확인하는 법

🔎 Calibration 성능 평가 관점 2가지

## 1. **Calibration quality (확률 보정 품질)**

* 여기서 calibration curve가 **가장 직관적인 도구**예요.
* 하지만 curve는 **시각적** 확인이므로, 정량적인 지표도 함께 씁니다:

  * **ECE (Expected Calibration Error)**

    * 예측확률 bin별 편차를 가중평균한 값.
    * 작을수록 확률이 잘 보정됨.
  * **MCE (Maximum Calibration Error)**

    * bin별 최대 편차.
  * **Brier Score**

    * 확률 예측과 실제 라벨(0/1)의 평균제곱오차.
    * 분류 성능 + 보정 품질 모두 반영.
* 따라서 “curve + ECE/Brier 같은 수치”를 함께 봐야 함.

---

## 2. **Discrimination ability (분류력, 순위 유지 성능)**

* 모델이 보정되었더라도, 분류력(예: AUC, Accuracy, F1)이 나빠지면 의미가 없죠.
* calibration은 보통 \*\*단조 변환(sigmoid, isotonic)\*\*이라서 **순위 기반 metric(AUC)은 거의 유지**되지만, 임계값 기반 정확도·정밀도 등은 달라질 수 있어요.
* 따라서 calibration 후에도 **AUC나 Accuracy를 확인**해야 합니다.

---

* **Calibration curve만으로는 부족**합니다.
* 추천 평가 방법:

  1. **Calibration curve** → 직관적 모양 확인
  2. **ECE / Brier score** → 정량적 calibration 품질
  3. **AUC / Accuracy / F1** → 분류력 유지 여부

---

👉 정리하면, 확률 보정의 성능은 **“확률의 신뢰도”와 “분류력” 두 축을 모두 확인해야** 하고, 따라서 curve 하나로만 판단하면 위험합니다.

원하시면 제가 \*\*실제 예측 확률 데이터(예: 100개 샘플 가상)\*\*를 만들어서, 보정 전후의 **calibration curve + ECE + AUC**를 직접 비교해 드릴까요?
