---
title: "Data Drift란?"
date: "2025-08-10"
excerpt: "Data Drift의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["data-drift", "machine-learning", "statistics", "data-engineering"]
---

# 참고한 글
- 1: [링크드인 - Machine Learning Community (Moderated)](https://www.linkedin.com/feed/update/urn:li:activity:7359233207621361666/)



# How to choose Data Drift metrics in ML Production (참조 1)?

- **Jensen–Shannon(JS) Distance**
  - **장점**: 대칭적이고 값이 0~1로 **bounded**라 해석이 쉽고 임계값 설정이 안정적. 노이즈·경미한 변동에 **견고**.
  - **단점**: **연산 비용**이 상대적으로 큼(특히 고차원).
  - **언제 쓰나**: 해석 용이성과 **안정적 모니터링**이 중요할 때.

- **Kullback–Leibler(KL) Divergence**
  - **장점**: 분포의 **미세한 차이**까지 민감하게 감지(초기 경보에 유리).
  - **단점**: 아웃라이어·작은 확률질량에 **민감**해 스파이크/오탐 가능, 지원 집합 불일치 시 발산.
  - **언제 쓰나**: **조기 탐지**가 최우선이거나 높은 민감도가 필요한 시스템.

- **Wasserstein Distance**
  - **장점**: 큰 분포 변화도 **매끄럽게 추적**, 기준·현재 분포가 **겹치지 않아도** 동작.
  - **단점**: **계산량 큼**(대규모/실시간, 고차원에서 특히 부담).
  - **언제 쓰나**: **큰/구조적 변화의 안정적 추적**이 필요할 때.

- **한 줄 가이드**
  - **해석·임계값 안정성**: JS
  - **초기 미세 변화 감지**: KL
  - **부드럽고 견고한 추적**: Wasserstein


<figure>
<img src="/post/DataScience/DataDrift_plot_1.gif" alt="Data Drift Plot" />
<figcaption>그림 1. Data Drift Plot</figcaption>
</figure>

## 지표별 파이썬 구현 예시 (JS/KL/Wasserstein)
연속형 피처의 분포를 동일한 구간으로 이산화한 뒤, KL/JS를 계산하고 Wasserstein 거리를 직접 계산하는 간단한 예시입니다.

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

참고: 범주형 피처는 각 범주의 상대도수를 확률로 정규화하여 KL/JS를 계산하면 됩니다(동일한 카테고리 순서와 smoothing 필요).

## 데이터 드리프트 지표 비교표

| Metric | 값 범위 | 대칭성 | 분포 겹침 필요 | 민감도(미세 변화) | 장점 | 단점 | 계산 비용 | 권장 사용 |
|---|---|---|---|---|---|---|---|---|
| JS distance | 0~1 | 대칭 | 불필요 | 중간 | 해석·임계값 설정 용이, 노이즈 견고 | 고차원에서 연산량 증가 | 중 | 안정적 모니터링/임계값 운영 |
| KL divergence | 0~∞ | 비대칭 | 부분 겹침 권장 | 높음 | 미세 변화 조기 감지 | 아웃라이어/희박확률에 민감, 오탐 가능 | 중 | 조기 경보가 중요한 시스템 |
| Wasserstein | ≥0 | 대칭 | 불필요 | 중간 | 큰/구조적 변화도 매끄럽게 추적, 해석 직관적 | 대용량/실시간·고차원에서 비용 큼 | 높음 | 견고한 변화 추적, 겹침 적은 분포 |

## 지표 상세 설명

### Jensen–Shannon(JS) Distance
- 직관: 두 분포의 “중간 분포” M과의 정보 차이를 평균해 측정하고, 제곱근을 취해 실제 거리로 만든 값. 대칭이고 0~1 범위라 임계값을 정하기 쉽다.
- 수식
$$
JS(P, Q) = \tfrac{1}{2}\,KL(P\,\|\,M) + \tfrac{1}{2}\,KL(Q\,\|\,M)\\
M = \tfrac{1}{2}(P + Q)\\
JS\_\text{dist}(P, Q) = \sqrt{JS(P, Q)}\quad(\text{log base}=2\Rightarrow 0\le JS\_\text{dist}\le 1)
$$
- 특징: 대칭, 유계(0~1), 지원 집합 불일치에도 유한. 레어 이벤트에 과민하지 않아 운영 모니터링에 안정적.
- 계산법: 연속형은 공통 bin 또는 KDE로 확률추정 후 계산, 범주형은 범주 집합을 합집합으로 정렬해 스무딩(e.g., 1e-6) 후 계산. 표본 적으면 분산↑ → 윈도우 크기 확대.
- 임계값 힌트: 기준 기간에서 분포를 부트스트랩해 경험적 분포를 만든 뒤 상위 분위수로 경보선 설정(조직별 캘리브레이션 권장).
- 사용처: 해석 용이·안정적 스케일이 필요한 대시보드, 다수 피처의 일관된 임계값 운영.
- 흔한 함정: bin 개수/경계, KDE 대역폭에 민감. 범주 희박도 높을 때 값이 과소평가될 수 있음 → 스무딩/병합 고려.

### Kullback–Leibler(KL) Divergence
- 직관: 진짜가 P인데 Q로 코딩하려고 할 때 “추가로 내야 하는 정보 비용”. 방향성이 중요해 KL(P||Q)와 KL(Q||P)는 다른 값을 준다.
- 수식
$$
KL(P\,\|\,Q) = \sum\limits_{x} p(x)\,\log\frac{p(x)}{q(x)}\quad(\text{연속형은 적분})
$$
- 특징: 비대칭, 하계 0·상계 없음. Q(x)=0이면서 P(x)>0이면 발산(무한대). 희박확률·아웃라이어에 매우 민감.
- 계산법: 히스토그램/KDE로 p,q 추정 후 epsilon 스무딩(예: 1e-6). 운영에서는 KL(P\|\|Q), KL(Q\|\|P) 둘 다 보거나 대칭화(KL sym) 혹은 JS로 대체.
- 임계값 힌트: 스파이크가 잦으므로 이동평균·분위수 기반 경보, 퍼뮤테이션(라벨 셔플) null로 p-value 추정 권장.
- 사용처: 조기 미세 변화 탐지, 민감도 최우선 경보 시스템, 리스크가 큰 영역의 세밀 모니터링.
- 흔한 함정: 샘플 적을 때 불안정, bin 선택/대역폭 민감, 로그 연산 수치불안정 → 스무딩/클리핑·정규화 필요.

### Wasserstein Distance (Earth Mover's Distance, 1-Wasserstein)
- 직관: 한 분포의 질량을 다른 분포로 옮길 때 필요한 “최소 작업량”. 값의 단위가 원 변수와 같아 해석이 직관적이다.
- 수식(1차원)
$$
W\_1(P, Q) = \int\limits_{0}^{1} \big|F\_P^{-1}(u) - F\_Q^{-1}(u)\big|\,du
$$
- 특징: 대칭, 분포 겹침이 없어도 정의 가능, 지원 집합 경계에 강함. 위치·스케일 이동을 부드럽게 반영.
- 계산법: 1D는 `scipy.stats.wasserstein_distance`로 정렬 기반 O(n log n). 다변량은 표준화 후 Sinkhorn(엔트로피 정규화) 등으로 근사(POT 등 라이브러리).
- 임계값 힌트: 원 단위 그대로 해석하거나 IQR/표준편차로 정규화해 무단위 거리로 비교. KPI와 직접 연결해 임계값 세팅 용이.
- 사용처: 큰/구조적 이동 추적, 기준·현재 분포가 거의 겹치지 않는 상황, 비즈니스 단위 해석이 중요한 경우.
- 흔한 함정: 고차원 계산량 부담·메모리 사용 증가, 피처 스케일 불일치 시 왜곡 → 표준화 필수. 다변량 OT는 구현·튜닝 난이도 높음.


