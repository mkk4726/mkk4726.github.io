---
title: "Data Drift란?"
date: "2025-08-10"
excerpt: "Data Drift의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["data-drift", "machine-learning", "statistics", "data-engineering"]
---

# 참고한 글
- 1: [링크드인 - Machine Learning Community (Moderated)](https://www.linkedin.com/feed/update/urn:li:activity:7359233207621361666/)

---

# How to choose Data Drift metrics in ML Production (참조 1)?

- **Jensen–Shannon(JS) Distance**
  - **장점**: symmetric적이고 값이 0~1로 **bounded**라 해석이 쉽고 threshold 설정이 안정적. noise·경미한 변동에 **robust**.
  - **단점**: **computational cost**가 상대적으로 큼(특히 high-dimensional).
  - **언제 쓰나**: 해석 용이성과 **stable monitoring**이 중요할 때.

- **Kullback–Leibler(KL) Divergence**
  - **장점**: distribution의 **subtle differences**까지 sensitive하게 감지(early warning에 유리).
  - **단점**: outlier·작은 probability mass에 **sensitive**해 spike/false alarm 가능, support set mismatch 시 발산.
  - **언제 쓰나**: **early detection**이 최우선이거나 높은 sensitivity가 필요한 시스템.

- **Wasserstein Distance**
  - **장점**: 큰 distribution 변화도 **smoothly tracking**, reference·current distribution이 **겹치지 않아도** 동작.
  - **단점**: **computational cost 큼**(large-scale/real-time, high-dimensional에서 특히 부담).
  - **언제 쓰나**: **large/structural changes의 stable tracking**이 필요할 때.

- **한 줄 가이드**
  - **interpretability·threshold stability**: JS
  - **early detection of subtle changes**: KL
  - **smooth and robust tracking**: Wasserstein


<figure>
<img src="/post/DataScience/DataDrift_plot_1.gif" alt="Data Drift Plot" />
<figcaption>그림 1. Data Drift Plot</figcaption>
</figure>

---

# 지표별 파이썬 구현 예시 (JS/KL/Wasserstein)
연속형 feature의 distribution을 동일한 구간으로 discretize한 뒤, KL/JS를 계산하고 Wasserstein distance를 직접 계산하는 간단한 예시입니다.

```python
import numpy as np
from scipy.stats import entropy, wasserstein_distance

def _normalize_hist(values: np.ndarray, bins: np.ndarray, epsilon: float = 1e-8) -> np.ndarray:
    counts, _ = np.histogram(values, bins=bins)
    probs = counts.astype(float)
    probs = probs / max(probs.sum(), 1.0)
    probs = np.clip(probs, epsilon, None)
    probs = probs / probs.sum()
    return probs

def kl_divergence_from_samples(reference: np.ndarray, current: np.ndarray, num_bins: int = 30, base: int = 2) -> float:
    """KL(P||Q): 기준(reference)=P, 현재(current)=Q"""
    bins = np.histogram_bin_edges(reference, bins=num_bins)
    p = _normalize_hist(reference, bins)
    q = _normalize_hist(current, bins)
    return float(entropy(p, qk=q, base=base))

def js_distance_from_samples(reference: np.ndarray, current: np.ndarray, num_bins: int = 30, base: int = 2) -> float:
    """JS distance: sqrt(JS divergence), 0~1 범위(base=2)"""
    bins = np.histogram_bin_edges(reference, bins=num_bins)
    p = _normalize_hist(reference, bins)
    q = _normalize_hist(current, bins)
    m = 0.5 * (p + q)
    js_div = 0.5 * entropy(p, qk=m, base=base) + 0.5 * entropy(q, qk=m, base=base)
    return float(np.sqrt(js_div))

def wasserstein_from_samples(reference: np.ndarray, current: np.ndarray) -> float:
    return float(wasserstein_distance(reference, current))

# 예시 데이터
ref = np.random.normal(0.0, 1.0, size=10_000)
cur = np.random.normal(0.3, 1.2, size=2_000)

metrics = {
    "KL(P||Q)": kl_divergence_from_samples(ref, cur),
    "JS distance": js_distance_from_samples(ref, cur),
    "Wasserstein": wasserstein_from_samples(ref, cur),
}
print(metrics)
```

참고: 범주형 feature는 각 category의 relative frequency를 probability로 normalize하여 KL/JS를 계산하면 됩니다(동일한 category 순서와 smoothing 필요).

## 데이터 드리프트 지표 비교표

| Metric | 값 범위 | symmetry | distribution overlap 필요 | sensitivity(subtle changes) | 장점 | 단점 | computational cost | 권장 사용 |
|---|---|---|---|---|---|---|---|---|
| JS distance | 0~1 | symmetric | 불필요 | 중간 | interpretability·threshold 설정 용이, noise robust | high-dimensional에서 computational cost 증가 | 중 | stable monitoring/threshold 운영 |
| KL divergence | 0~∞ | asymmetric | 부분 overlap 권장 | 높음 | subtle changes early detection | outlier/sparse probability에 sensitive, false alarm 가능 | 중 | early warning이 중요한 시스템 |
| Wasserstein | ≥0 | symmetric | 불필요 | 중간 | large/structural changes도 smoothly tracking, interpretation 직관적 | large-scale/real-time·high-dimensional에서 cost 큼 | 높음 | robust change tracking, overlap 적은 distribution |

---

# 지표 상세 설명

## Kullback–Leibler(KL) Divergence

relative entropy, I-divergence.

> A simple interpretation of the KL divergence of P from Q is the expected excess surprisal from using Q as a model instead of P when the actual distribution is P.

distance의 속성을 만족하지 못해서 distance라고 표현할 수는 없다.
squared distances의 속성은 만족한다고 한다. 




- 직관: 진짜가 P인데 Q로 coding하려고 할 때 “추가로 내야 하는 information cost”. directionality이 중요해 KL(P||Q)와 KL(Q||P)는 다른 값을 준다.
- 수식
$$
KL(P\,\|\,Q) = \sum\limits_{x} p(x)\,\log\frac{p(x)}{q(x)}\quad(\text{연속형은 적분})
$$
- 특징: asymmetric, lower bound 0·upper bound 없음. Q(x)=0이면서 P(x)>0이면 발산(infinity). sparse probability·outlier에 매우 sensitive.
- 계산법: histogram/KDE로 p,q 추정 후 epsilon smoothing(예: 1e-6). 운영에서는 KL(P\|\|Q), KL(Q\|\|P) 둘 다 보거나 symmetricization(KL sym) 혹은 JS로 대체.
- threshold 힌트: spike가 잦으므로 moving average·quantile 기반 경보, permutation(label shuffle) null로 p-value 추정 권장.
- 사용처: early 미세 변화 탐지, sensitive도 최우선 경보 시스템, 리스크가 큰 영역의 세밀 monitoring.
- 흔한 함정: sample 적을 때 unstable, bin 선택/bandwidth sensitive, log 수치unstable → smoothing/clipping·normalization 필요.




---


## Jensen–Shannon(JS) Divergence

information radius(IRAD) or total divergence

> It is based on the Kullback-Leibler divergence, with some notable (and useful) differences, including that it is symmetric and it always has a finite value.

square root of Jensen-Shannon divergence == Jensen-Shannon distance




- 직관: 두 distribution의 “중간 distribution” M과의 information difference를 평균해 측정하고, square root을 취해 실제 distance로 만든 값. symmetric이고 0~1 범위라 threshold을 정하기 쉽다.
- 수식
$$
JS(P, Q) = \tfrac{1}{2}\,KL(P\,\|\,M) + \tfrac{1}{2}\,KL(Q\,\|\,M)\\
M = \tfrac{1}{2}(P + Q)\\
JS\_\text{dist}(P, Q) = \sqrt{JS(P, Q)}\quad(\text{log base}=2\Rightarrow 0\le JS\_\text{dist}\le 1)
$$
- 특징: symmetric, bounded(0~1), support set mismatch에도 finite. rare event에 over-sensitive하지 않아 운영 monitoring에 안정적.
- 계산법: 연속형은 공통 bin 또는 KDE로 확률추정 후 계산, 범주형은 범주 집합을 합집합으로 정렬해 smoothing(e.g., 1e-6) 후 계산. 표본 적으면 분산↑ → 윈도우 크기 확대.
- threshold 힌트: 기준 기간에서 distribution를 부트스트랩해 경험적 distribution를 만든 뒤 상위 quantile로 경보선 설정(조직별 캘리브레이션 권장).
- 사용처: 해석 용이·안정적 스케일이 필요한 대시보드, 다수 피처의 일관된 threshold 운영.
- 흔한 함정: bin 개수/경계, KDE bandwidth에 sensitive. 범주 희박도 높을 때 값이 과소평가될 수 있음 → smoothing/병합 고려.


---

## Wasserstein Distance (Earth Mover's Distance, 1-Wasserstein)
- 직관: 한 distribution의 질량을 다른 distribution로 옮길 때 필요한 “최소 작업량”. 값의 단위가 원 변수와 같아 해석이 직관적이다.
- 수식(1차원)
$$
W\_1(P, Q) = \int\limits_{0}^{1} \big|F\_P^{-1}(u) - F\_Q^{-1}(u)\big|\,du
$$
- 특징: symmetric, distribution 겹침이 없어도 정의 가능, support set 경계에 강함. 위치·스케일 이동을 부드럽게 반영.
- 계산법: 1D는 `scipy.stats.wasserstein_distance`로 정렬 기반 O(n log n). 다변량은 표준화 후 Sinkhorn(엔트로피 normalization) 등으로 근사(POT 등 라이브러리).
- threshold 힌트: 원 단위 그대로 해석하거나 IQR/표준편차로 normalization해 무단위 distance로 비교. KPI와 직접 연결해 threshold 세팅 용이.
- 사용처: 큰/구조적 이동 추적, 기준·현재 distribution가 거의 겹치지 않는 상황, 비즈니스 단위 해석이 중요한 경우.
- 흔한 함정: 고차원 계산량 부담·메모리 사용 증가, 피처 스케일 mismatch 시 왜곡 → 표준화 필수. 다변량 OT는 구현·튜닝 난이도 높음.

---


