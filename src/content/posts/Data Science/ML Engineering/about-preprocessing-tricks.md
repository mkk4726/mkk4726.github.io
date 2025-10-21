---
title: "데이터 전처리 방법론들에 대해 정리"
date: "2025-10-21"
excerpt: "왜 데이터 전처리를 해야하고, 어떤 방법을 써야하고, 어떤 효과를 가지는지정리"
category: "Engineering"
tags: ["Preprocessing", "Feature Engineering", "Power Transformation"]
---

머신러닝 모델을 학습시킬 때, 데이터의 분포가 한쪽으로 크게 치우쳐 있거나 분산이 불균일하면 모델 성능에 문제가 생길 수 있습니다.
특히 선형 모델이나 거리 기반 알고리즘은 feature의 scale과 분포 형태에 민감합니다. 

이런 문제를 해결하기 위해 데이터 변환을 통해 분포를 더 대칭적이고 안정적으로 만드는 전처리 기법을 적용해볼 수 있습니다.

---

# 왜 분포 변환이 필요한가

실제 데이터는 꽤나 더럽습니다. 특히 right-skewed 분포를 띌 가능성이 높습니다. 
예를 들어 소득, 주택 가격, 웹사이트 방문자 수 같은 변수들은 대부분의 값이 작은 범위에 몰려있고 소수의 큰 값들이 긴 꼬리를 형성합니다.

이런 분포는 세 가지 문제를 일으킬 수 있습니다.
1. 큰 값들이 모델 학습 과정에서 과도한 영향력을 행사한다. 손실 함수가 큰 오차에 민감하게 반응하면서 일부 outlier에 fitting되는 현상이 발생한다. 
2. gradient 계산이 불안정해진다. 값의 범위가 지나치게 넓으면 numerical precision 문제로 학습이 느려지거나 발산할 수 있다. 
3. 많은 통계적 기법들이 가정하는 homoscedasticity(등분산성)가 깨진다. 큰 값에서 분산이 커지는 heteroscedasticity는 confidence interval 추정과 hypothesis testing을 부정확하게 만든다.

---

# 어떻게 해결할 수 있나

## Power Transformation

Power transformation은 데이터에 거듭제곱 연산을 적용해 분포의 형태를 바꾸는 방법입니다.

가장 단순한 형태는 log 변환입니다. $z = \log(y)$로 변환하면 큰 값들이 압축되면서 right-skew가 완화됩니다.
하지만 log 변환은 두 가지 제약이 있습니다. 
1. 양수에서만 정의되므로 0이나 음수가 있으면 사용할 수 없고
2. 변환 강도를 조절할 수 없어 데이터 특성에 맞는 최적화가 어렵다.

Box-Cox 변환과 Yeo-Johnson 변환은 이런 log 변환의 제약을 극복한 일반화된 방법입니다. 
파라미터 $\lambda$를 조정하면서 데이터에 가장 적합한 변환 강도를 찾을 수 있습니다.

## Box-Cox Transformation

Box-Cox 변환은 1964년 George Box와 David Cox가 제안한 방법으로, 다음과 같이 정의됩니다.

$$
T(y; \lambda) =
\begin{cases}
\dfrac{y^\lambda - 1}{\lambda}, & \text{if } \lambda \neq 0 \\
\log(y), & \text{if } \lambda = 0
\end{cases}
$$

이 변환은 $y > 0$인 경우에만 적용 가능합니다.

파라미터 $\lambda$의 값에 따라 변환의 특성이 달라집니다.
- $\lambda = 1$이면 $T(y) = y - 1$로 사실상 변환이 없고
- $\lambda = 0$일 때는 log 변환과 동일합니다. 
- $\lambda$가 1보다 작을수록 큰 값을 더 강하게 압축해서 right-skewness를 줄입니다.
- 반대로 $\lambda > 1$이면 작은 값을 압축하고 큰 값을 확대해서 left-skewness를 완화합니다.

변환식에서 $-1$을 빼고 $\lambda$로 나누는 이유는 $\lambda = 0$ 근처에서 연속성을 유지하기 위해서 입니다. 
이 정규화 덕분에 서로 다른 $\lambda$ 값으로 변환한 결과를 직접 비교할 수 있습니다.
실제로 최적 $\lambda$는 maximum likelihood estimation으로 찾는데, 변환 후 데이터가 정규분포에 가장 가까워지는 값을 선택합니다.

## Yeo-Johnson Transformation

Box-Cox의 가장 큰 제약은 양수에서만 작동한다는 점입니다. 
실무 데이터에는 음수나 0이 포함된 경우가 많은데, 이때는 Yeo-Johnson 변환을 사용합니다.
2000년 In-Kwon Yeo와 Richard Johnson이 제안한 이 방법은 전체 실수 범위에서 정의됩니다.

$$
T(y; \lambda) =
\begin{cases}
\frac{(y+1)^\lambda - 1}{\lambda}, & y \ge 0, \lambda \neq 0 \\
\log(y+1), & y \ge 0, \lambda = 0 \\
-\frac{(-y+1)^{2 - \lambda} - 1}{2 - \lambda}, & y < 0, \lambda \neq 2 \\
-\log(-y+1), & y < 0, \lambda = 2
\end{cases}
$$

이 변환의 핵심은 양수와 음수를 각각 다르게 처리하면서도 전체적으로 단조 증가 함수를 유지한다는 점입니다.
- $y \ge 0$일 때는 Box-Cox와 유사한 형태지만 $y+1$을 사용해 0을 처리합니다. 
- $y < 0$일 때는 대칭적인 변환을 적용해서 음수 영역에서도 skewness를 조절할 수 있습니다.

결과적으로 어떤 실수값도 변환 가능하면서 원본 데이터의 순서 관계를 보존합니다.

## 방법론 비교

세 가지 변환 방법의 특성을 정리하면 다음과 같습니다.

| 구분 | Log 변환 | Box-Cox | Yeo-Johnson |
|------|---------|---------|-------------|
| **적용 가능 범위** | $y > 0$ (양수만) | $y > 0$ (양수만) | 모든 실수 ($-\infty < y < \infty$) |
| **파라미터** | 없음 (고정) | $\lambda$ (연속) | $\lambda$ (연속) |
| **단조성** | 단조 증가 함수 | 단조 증가 함수 | 단조 증가 함수 |
| **유연성** | 고정된 변환 | 데이터에 맞게 조정 가능 | 데이터에 맞게 조정 가능 |
| **관계** | - | $\lambda = 0$일 때 log | $\lambda = 0$ (양수) / $\lambda = 2$ (음수) |
| **장점** | 구현이 단순함<br/>해석이 명확함<br/>계산 비용 낮음 | 통계 이론이 잘 정립됨<br/>해석이 직관적<br/>MLE 기반 최적화 용이 | 0과 음수 처리 가능<br/>별도 전처리 불필요<br/>범용성 높음 |
| **단점** | 0이나 음수 처리 불가<br/>변환 강도 조절 불가<br/>과도한 압축 가능 | 0이나 음수 처리 불가<br/>사전 shift 작업 필요 | 수식이 복잡함<br/>구간별 정의로 이해 어려움 |
| **사용 시기** | 빠른 prototyping<br/>명확한 right-skew<br/>단순한 분석 | 가격, 소득, 거리 등<br/>본질적으로 양수인 변수<br/>최적 변환 필요 시 | 온도, 수익률, 잔차 등<br/>음수 가능한 변수<br/>복잡한 분포 |
| **구현** | `np.log(y)` | `PowerTransformer(method='box-cox')` | `PowerTransformer(method='yeo-johnson')` |

실무에서 선택 기준은 명확합니다.
- 빠른 실험이나 명확한 right-skewness가 있고 변환 강도를 조절할 필요가 없다면 log 변환으로 시작
- 데이터에 0이나 음수가 없고 본질적으로 양수 값만 가지며 최적의 변환 강도를 찾고 싶다면 Box-Cox를 사용 
통계적 배경이 더 오래되었고 많은 연구에서 검증되었기 때문에 해석과 문헌 참조가 용이
- 반면 데이터에 0이나 음수가 포함되어 있거나 변수의 본질상 음수가 가능한 경우 Yeo-Johnson을 선택
사전에 데이터를 shift하는 작업 없이 바로 적용할 수 있어 편리하고 변환 과정에서 정보 손실이 없음

## 실무 적용 방법

Scikit-learn의 `PowerTransformer`는 두 변환을 모두 지원하며 최적 $\lambda$를 자동으로 찾아줍니다.

```python
from sklearn.preprocessing import PowerTransformer

# Box-Cox: 양수 데이터만 가능
pt_boxcox = PowerTransformer(method='box-cox')
y_transformed_bc = pt_boxcox.fit_transform(y_positive.reshape(-1, 1))

# Yeo-Johnson: 모든 실수 가능
pt_yeojohnson = PowerTransformer(method='yeo-johnson')
y_transformed_yj = pt_yeojohnson.fit_transform(y_all.reshape(-1, 1))

# 변환된 데이터로 학습 후, 예측값을 원래 scale로 복원
y_pred_transformed = model.predict(X_test)
y_pred_original = pt_yeojohnson.inverse_transform(y_pred_transformed)
```

변환을 적용할 때 주의할 점이 있습니다. 첫째, training set으로 fit한 transformer를 test set에도 동일하게 적용해야 합니다. Test set으로 따로 fit하면 data leakage가 발생합니다. 둘째, 예측값을 원래 scale로 복원하는 inverse transform을 잊지 말아야 합니다. 모델은 변환된 공간에서 학습하지만 최종 평가와 해석은 원래 scale에서 해야 합니다. 셋째, quantile regression처럼 조건부 분포를 추정하는 경우, pinball loss 같은 metric도 원래 scale에서 계산해야 공정한 비교가 가능합니다.

## 변환의 효과

Power transformation은 세 가지 주요 효과를 냅니다. 첫째, skewness를 줄여서 분포를 대칭적으로 만듭니다. Right-skewed 데이터는 왼쪽으로 당겨지고, left-skewed 데이터는 오른쪽으로 펴집니다. 둘째, heteroscedasticity를 완화합니다. 큰 값에서 분산이 큰 문제가 해결되면서 전체 범위에서 분산이 고르게 분포합니다. 셋째, outlier의 영향력을 감소시킵니다. 극단값이 압축되면서 모델이 전체 데이터 패턴에 집중할 수 있습니다.

결과적으로 선형 회귀, SVM, k-NN 같은 알고리즘의 성능이 개선되고, gradient-based optimization이 더 안정적으로 수렴합니다. 특히 변환 후 정규분포에 가까워지면 통계적 추론의 가정이 만족되어 confidence interval과 hypothesis test의 신뢰성이 높아집니다. 다만 tree-based 모델은 monotonic transformation에 불변하므로 power transformation의 효과가 제한적입니다. 이런 경우 분포 변환보다는 feature interaction이나 hyperparameter tuning에 집중하는 것이 효율적입니다.
