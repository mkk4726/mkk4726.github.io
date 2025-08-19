---
title: "Pearson vs Spearman 정리"
date: "2025-08-19"
excerpt: "상관관계 지표에 대한 비교"
category: "Data Science"
tags: ["statistics", "correlation"]
---

참고 글 
- [링크드인 - Timer Bikmukhametov](https://www.linkedin.com/feed/update/urn:li:activity:7362124920685842432/)

# 링크드인 글 정리

> Pearson vs Spearman Coefficient. 어떤 것을 선택할까?

<figure>
<img src="/post/DataScience/linear_corr.gif" alt="Pearson vs Spearman" style="width: 50%; height: auto;" />
<figcaption>Pearson vs Spearman</figcaption>
</figure>


## Pearson coefficient
Pearson coefficient는 두 변수의 covariance를 각 변수의 standard deviation의 곱으로 나눈 값입니다.

절댓값이 정확히 ±1이면 X와 Y 사이의 관계를 linear equation으로 완벽하게 설명할 수 있음을 의미합니다.

**장점:**
- 간단하며, normally distributed data에 잘 작동합니다
- linear relationship을 잘 나타냅니다

**단점:**
- non-linear relationship을 포착하지 못합니다
- outlier에 민감하여 값이 왜곡될 수 있습니다

## Spearman coefficient
monotonic relationship을 측정합니다 (데이터가 linear하지 않더라도 함께 증가하거나 감소하는 관계).

중복된 data value가 없다면, +1 또는 -1의 완벽한 Spearman correlation이 발생하는 경우는 각 변수가 다른 변수의 완벽한 monotone function일 때입니다.

**장점:**
- non-linear relationship과 outlier에 잘 작동합니다

**단점:**
- absolute difference를 무시하고 rank만 중요합니다
- ranking에 의존하므로 outlier에 대한 sensitivity가 낮습니다

## 선택 가이드

### 기본 원칙
- 데이터가 linear trend를 따른다면, Pearson이 좋은 선택입니다
- 데이터가 non-linear pattern이나 outlier를 가진다면, Spearman이 더 신뢰할 만합니다

### 추가 고려사항

**데이터 분포 확인:**
- **정규분포**: Pearson이 더 적합 (parametric method)
- **비정규분포**: Spearman이 더 안전 (non-parametric method)
- **순서형 데이터**: Spearman만 의미가 있음

**샘플 크기:**
- **작은 샘플 (n < 30)**: Spearman이 더 robust
- **큰 샘플**: 둘 다 사용 가능하지만 목적에 따라 선택

**해석의 목적:**
- **선형 관계의 강도** 측정이 목적: Pearson
- **단조 관계의 방향성** 확인이 목적: Spearman
- **순위 기반 분석**: Spearman (예: 설문조사 순위 데이터)

**실무 팁:**
- 두 방법 모두 계산해보고 결과가 크게 다르면 데이터를 재검토
- Pearson ≫ Spearman: 강한 선형 관계 존재
- Spearman ≫ Pearson: 비선형이지만 단조적 관계 존재
- 둘 다 낮음: 관계가 약하거나 복잡한 비선형 관계

**주의사항:**
- 상관관계 ≠ 인과관계 (둘 다 동일하게 적용)
- 구간별로 다른 패턴을 보이는 데이터는 전체 상관계수로 판단하지 말 것
- 이상치 제거 전후로 비교 분석 권장




# 수식과 계산 방식

## Pearson 상관계수 (r)

> Pearson 상관계수는 두 변수 간의 선형 관계의 강도를 측정합니다.

**수식:**

$$
r = \frac{\sum_{i=1}^{n}(x_i - \bar{x})(y_i - \bar{y})}{\sqrt{\sum_{i=1}^{n}(x_i - \bar{x})^2}\sqrt{\sum_{i=1}^{n}(y_i - \bar{y})^2}}
$$

또는 공분산을 사용하여:

$$
r = \frac{Cov(X,Y)}{S_x \cdot S_y}
$$

여기서:
- $x_i, y_i$: 개별 데이터 포인트
- $\bar{x}, \bar{y}$: 각 변수의 평균
- $Cov(X,Y)$: X와 Y의 공분산
- $S_x, S_y$: 각 변수의 표준편차

**계산 과정:**
1. 각 변수의 평균을 계산
2. 각 데이터 포인트에서 평균을 뺀 편차를 계산
3. 편차의 곱의 합을 구함 (공분산의 분자)
4. 각 변수의 편차 제곱합을 구하고 제곱근을 취함
5. 공분산을 표준편차의 곱으로 나눔

## Spearman 상관계수 (ρ)

> Spearman 상관계수는 두 변수의 순위(rank) 간의 상관관계를 측정합니다.

**수식:**

$$
\rho = 1 - \frac{6\sum_{i=1}^{n}d_i^2}{n(n^2-1)}
$$

여기서:
- $d_i$: 각 관측치의 두 변수 순위 차이
- $n$: 관측치의 개수

또는 순위에 대한 Pearson 상관계수로:

$$
\rho = \frac{\sum_{i=1}^{n}(R(x_i) - \overline{R(x)})(R(y_i) - \overline{R(y)})}{\sqrt{\sum_{i=1}^{n}(R(x_i) - \overline{R(x)})^2}\sqrt{\sum_{i=1}^{n}(R(y_i) - \overline{R(y)})^2}}
$$

여기서:
- $R(x_i), R(y_i)$: 각 변수의 순위
- $\overline{R(x)}, \overline{R(y)}$: 순위의 평균

**계산 과정:**
1. 각 변수의 데이터를 순위로 변환 (가장 작은 값이 1순위)
2. 동일한 값이 있는 경우 평균 순위를 부여
3. 각 관측치에 대해 두 변수의 순위 차이 $d_i$를 계산
4. $d_i^2$의 합을 구함
5. 공식에 대입하여 상관계수를 계산

**예시:**
데이터: X = [1, 2, 3, 4, 5], Y = [2, 4, 1, 5, 3]

1. 순위 변환:
   - X의 순위: [1, 2, 3, 4, 5]
   - Y의 순위: [2, 4, 1, 5, 3]

2. 순위 차이: d = [1-2, 2-4, 3-1, 4-5, 5-3] = [-1, -2, 2, -1, 2]

3. $d^2$ = [1, 4, 4, 1, 4], 합계 = 14

4. $\rho = 1 - \frac{6 \times 14}{5(25-1)} = 1 - \frac{84}{120} = 1 - 0.7 = 0.3$

