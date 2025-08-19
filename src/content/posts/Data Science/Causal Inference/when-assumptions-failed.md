---
title: "양수성 가정 등 필요한 가정이 깨졌을 때 대처방안"
date: "2025-08-19"
excerpt: "양수성 가정 등 필요한 가정이 깨졌을 때 대처방안"
category: "Causal Inference"
tags: ["ATE"]
---


# GPT Pro 답변

아주 핵심만 먼저 요약할게요.

**양수성(positivity/overlap)이 안 맞으면 ‘원래 ATE를 그대로’는 비(非)식별일 수 있습니다.** 따라서 (1) 문제의 성격을 진단하고, (2) *표본/대상·가중치·추정량·질문(estimand)* 중 어디를 바꿀지 결정하며, (3) 바뀐 점(대상·평가량)을 투명하게 보고하는 것이 정석입니다. 이 아래에 이론적 배경→진단→대응전략(옵션별 장단점)→실무 레시피 순으로 정리했습니다.

---

## 1) 이론적 배경: 왜 양수성이 중요한가?

* (이산 처리 $A\in\{0,1\}$) **양수성**은 $0< P(A=a\mid X=x)$ 가 *해당 공변량 지지집합 전체에서* 성립해야 한다는 가정입니다. 강한 의미로는 $\exists\ \epsilon>0$ s.t. $\epsilon\le P(A=1\mid X)\le 1-\epsilon$. 이 가정이 깨지면 어떤 $x$에 대해서는 $A=a$가 “절대” 관측되지 않아 $\mathbb{E}[Y\mid A=a,X=x]$ 자체가 데이터로 확인 불가(무한 외삽)라 **ATE의 비모수적 식별이 무너집니다**. Hernán & Robins 교과서에서도 양수성을 교환가능성(무교란)·일관성과 함께 핵심 식별가정으로 설명합니다. ([Miguel Hernán][1], [Harvard SPH Content][2])
* 실무에서는 두 부류로 나눕니다. **구조적 위반(structural)**: 규정/의료 금기 등으로 특정 $X=x$에서 어떤 처치가 원천 불가능. **확률적(실무) 위반(practical)**: 가능은 하지만 표본에서 거의/전혀 나타나지 않아 가중치가 폭주. Petersen 등은 두 상황을 구분하고, 전자는 “질문을 바꿔야” 하고 후자는 “추정 절차를 안정화”하는 접근을 정리합니다. ([biostats.bepress.com][3])
* 시간가변 노출에서는 각 시점마다 **순차 양수성**이 필요합니다. 위반되면 MSM/IPW 같은 방법의 가중치가 폭주해 분산·편향이 커집니다. (가중치 안정화는 분산을 줄여주지만, **식별 자체를 복원해 주진 않습니다**.) ([Epidemiologic Research][4])

---

## 2) 먼저 하는 일: 진단 체크리스트

1. **추정된 PS 분포의 겹침**(히스토그램/커널밀도·Q–Q/eCDF 겹침): 꼬리에서 한쪽 집단이 “사라지면” 경고. Imbens & Rubin 교과서의 “overlap 진단” 논의와 유사. ([Cambridge University Press & Assessment][5])
2. **극단 가중치/유효표본크기(ESS)**: $\text{ESS}=(\sum_i w_i)^2/\sum_i w_i^2$ (집단별 ESS도 확인). ESS가 급감하면 실무적 양수성 문제가 의심됩니다. ([R Project Search][6])
3. **분리(separation)/완전예측**: PS 로지스틱에서 완전분리 징후(계수 발산).
4. **연속/다단계 노출**: “연속 노출용 양수성 진단” 같은 전용 테스트/시각화를 병행. ([Wiley Online Library][7])
5. **부트스트랩 기반 취약성 평가**: 파라메트릭 부트스트랩으로 양수성 취약 구간을 정량화(폭주 가중치가 추정량을 지배하는지). ([biostats.bepress.com][3])

---

## 3) 대응 전략 지도(무엇을 바꿀 것인가?)

### A. **표본/대상(population)을 바꾸기** — *겹침이 있는 부분만 추정*

* **공통지지(common support) 제한/트리밍**: PS가 $[\alpha,1-\alpha]$에 있는 단위만 분석. Crump et al.(2009)는 분산을 최소화하는 근사 규칙으로 **$0.1\sim0.9$ 트리밍**을 제안(상황 의존적이며 보고에 투명성 필요). ([EconPapers][8])
* **트리/규칙 기반 지지영역 선택**: Traskin & Small(2011)은 CART로 *해석 가능한 겹침 영역*을 구성. ([SpringerLink][9])
* **Coarsened Exact Matching (CEM)**: 사전 코어스닝한 층에서 처치/대조가 모두 존재하는 층만 유지 → 양수성을 “설계로” 강화. 단, \*\*대상(estimand)이 ‘매칭 후 표본’\*\*으로 바뀝니다. ([JSTOR][10])

> 장점: 외삽을 피하고 안정적. 단점: \*\*ATE가 아니라 ‘겹침 있는 부분의 효과’\*\*로 **질문이 바뀝니다**. (반드시 보고)

---

### B. **가중치를 바꾸기(안정화·캘리브레이션)** — *실무 위반 진정시키기*

* **Stabilized IPTW**: 분산을 줄이고 소수 관측치가 지배하는 것을 막습니다(식별을 복원하는 건 아님). ([Epidemiologic Research][4])
* **가중치/PS 절단(truncation)**: $[c,1-c]$로 자르거나 극단 가중치를 윈저라이즈. **편향–분산 절충**이므로 **cutoff를 데이터 구동적으로** 고르려는 연구가 있습니다(예: AJE 2022). ([Oxford Academic][11])
* **Overlap Weights(OW)**: 처치군은 $1-e(X)$, 대조군은 $e(X)$로 가중 → **가중치가 유계**이고 **겹침이 큰 구간에 초점(ATO)**. 이론적으로 분산 최적·작은 표본에서 **평균의 정확균형**까지 보장. 의료 응용 튜토리얼도 다수. ([Oxford Academic][12])
* **균형지향 PS/보정**: CBPS(공변량 균형을 일으키도록 PS를 추정)·Entropy Balancing(모멘트 제약으로 직접 균형). 극단 가중치를 억제하며 균형을 보장. ([imai.fas.harvard.edu][13], [Massachusetts Institute of Technology][14])

> 장점: 원표본을 크게 버리지 않고 안정화. 단점: ATE→**ATO/ATT 등 대상이 달라질 수 있음**(특히 OW), 또는 절단으로 **작은 편향**이 들어옴(반드시 민감도 분석). ([Oxford Academic][11])

---

### C. **추정량을 바꾸기(모형기반·DR)** — *외삽 민감도를 줄이기*

* **이중강건(AIPW)·TMLE**: 결과모형과 PS모형을 함께 사용해 한쪽이 약간 빗나가도 일관성 보존. \*\*다만 식별 가정(양수성 자체)\*\*은 여전히 필요. TMLE/CTMLE는 **작은 $g(X)=P(A=1\mid X)$** 에 민감한 “clever covariate”를 안정화하려는 절단/협업형 방법이 제안되어 왔습니다. ([CRAN][15], [arXiv][16], [Oxford Academic][11])

---

### D. **질문(estimand)을 바꾸기** — *양수성 가정을 약화/회피*

* **Incremental Propensity Score Interventions (IPSI)**: “모든 사람을 1로/0으로”가 아니라 \*\*처치 확률의 log-odds를 $\delta$만큼 키우면 결과가 얼마나 변하나?\*\*를 묻는 **점진적 개입 효과**. **양수성 가정이 필요 없습니다**(처치 확률을 ‘증감’시키는 개입). 비모수 이론·추정·신뢰대역이 정리되어 있습니다. ([arXiv][17], [Beyond the Average Treatment Effect][18])
* **Stochastic/Modified Treatment Policies (MTP/LMTP)**: “자연적 처치값을 기준으로 $\delta$만큼 늘리기/상한을 두기” 같은 **현실적 정책 개입**을 정의·추정 → **시간가변 노출**에서도 순차 양수성의 부담을 덜어줍니다. ([IDEAS/RePEc][19], [Epidemiologic Research][20])

> 장점: 현실적·해석 가능, 양수성 부담 완화/회피. 단점: 질문이 **ATE와 다름**—정책/과학적 목적과 일치하는지 합의가 필요.

---

### E. **부분식별/바운딩** — *구조적 위반에서 정직한 보고*

* **Manski bounds 등**: “최악–최선” 범위를 제시(필요 시 IV/단조성으로 축소). **구조적 위반**에선 이런 **바운드 보고**가 솔직한 선택입니다. 최근엔 위반 강도를 매개변수화해 **breakdown frontier**까지 제시하는 프레임워크도 나옵니다. ([JSTOR][21], [arXiv][22])

---

## 4) 실무 레시피(이진 처치, 단일 시점 예)

1. **진단**: PS 겹침·ESS·극단가중치 체크(집단별 ESS, max/min PS 등). 연속/다수준이면 전용 진단도 병행. ([R Project Search][6], [Wiley Online Library][7])
2. **구조적 vs 실무 위반 구분**

   * 구조적: 그 $X$ 영역의 ATE는 **비식별**. → *대상 변경* (겹침 영역으로 제한/OW) 또는 *질문 변경*(IPSI/MTP), 또는 *부분식별 바운드*. ([biostats.bepress.com][3])
   * 실무 위반: 극단가중치/저 ESS. → *가중치 안정화*(Stabilized IPTW, 절단)·*균형지향 가중*(CBPS/EB)·*OW*·*DR/TMLE*을 조합. ([Epidemiologic Research][4], [Oxford Academic][11])
3. **대상과 추정기의 매칭**

   * **ATE 유지 고집**: 최소한 **대상 제한+DR**(예: $[0.05,0.95]$ 트리밍 + AIPW/TMLE) & 절단 민감도 곁들임. ([Oxford Academic][11])
   * **겹침집단 효과(ATO)** 허용: **Overlap Weights + AIPW/TMLE** 권장(가중치 유계·균형 우수). ([Oxford Academic][12])
   * **정책/현실 질문**에 관심: **IPSI**(단일/종단) 또는 **LMTP**(연속/시간가변)로 질문을 재정의. ([arXiv][17], [Epidemiologic Research][20])
4. **보고**: (i) 선택한 *대상/estimand*와 이유, (ii) 트리밍/절단 규칙, (iii) 가중치 분포·ESS, (iv) 균형 지표, (v) 민감도(컷오프·방법 간 비교).

---

## 5) 시간가변·연속 노출의 주의점

* **순차 양수성**이 특히 취약. Stabilized IPW·Super Learner 등으로 품질을 높이되, 폭주하면 **LMTP/확률적 개입/IPSI**로 문답을 바꾸는 것이 합리적일 때가 많습니다. ([Epidemiologic Research][4], [tlverse][23], [arXiv][17])
* **연속 노출**: 양수성 진단 도구를 활용하고(지역적 밀도 결핍), **shift/truncation 정책 효과** 같은 MTP류를 고려. ([Wiley Online Library][7], [IDEAS/RePEc][19])

---

## 6) 어떤 선택이 언제 좋은가? (요약 표)

| 상황                     | 권장 전략                     | 핵심 장점                       | 주의점                                                  |
| ---------------------- | ------------------------- | --------------------------- | ---------------------------------------------------- |
| 꼬리에서 겹침 거의 없음(실무 위반)   | **Overlap Weights + DR**  | 가중치 유계, 겹침집단(ATO)에 최적 효율·균형 | ATO(질문)로 변경됨 ([Oxford Academic][12])                 |
| ATE 고수하되 극단가중치 문제      | **트리밍/절단 + TMLE/AIPW**    | 편향–분산 절충으로 안정화              | 절단이 체계적 편향 도입 가능 → 민감도 보고 필수 ([Oxford Academic][11]) |
| 구조적 금기(어떤 $X$에서 처치 불가) | **겹침영역 한정** 또는 **바운드 보고** | 외삽 회피/정직한 불확실성 보고           | 원래 ATE는 비식별 ([biostats.bepress.com][3], [JSTOR][21]) |
| 정책적 “얼마나 더 권장/감소”가 궁금  | **IPSI**                  | 양수성 불요, 추세곡선으로 해석 용이        | ATE와 다른 질문 ([arXiv][17])                             |
| 종단·연속 노출에서 폭주          | **LMTP/확률적 개입**           | 현실적 정책 정의, 순차 양수성 부담 완화     | 개입 정의·해석을 명확히 문서화 필요 ([Epidemiologic Research][20])  |

---

## 7) 참고·근거(일부)

* **진단/대응 종합**: Petersen et al., *Diagnosing and Responding to Violations in the Positivity Assumption* (Berkeley Working Paper; 구조적/확률적 위반, 표본 제한·질문 변경의 원칙). ([biostats.bepress.com][3])
* **트리밍 규칙**: Crump–Hotz–Imbens–Mitnik (2009, *Biometrika*): $[0.1,0.9]$ 규칙의 근사 최적성. ([EconPapers][8])
* **Overlap Weights/ATO**: Li–Morgan–Zaslavsky (2018, JASA) 이론·유계성·정확균형; 의료 응용 요약(JAMA 2020). ([Oxford Academic][12])
* **Stabilized IPW**: Cole & Hernán (2008, *AJE*). ([Epidemiologic Research][4])
* **절단의 데이터구동 선택/CTMLE**: Gruber et al. (2022, *AJE*); Positivity‑C‑TMLE (2017). ([Oxford Academic][11], [arXiv][16])
* **CBPS/Entropy Balancing**: Imai & Ratkovic (2014, JRSS‑B); Hainmueller (2012, *Political Analysis*). ([imai.fas.harvard.edu][13], [Massachusetts Institute of Technology][14])
* **IPSI**: Kennedy (2019, *JASA*): **양수성 없이** 점진적 개입 효과. ([arXiv][17])
* **Stochastic/Modified Treatment Policies**: Díaz & van der Laan (2012, *Biometrics*); Young–Hernán–Robins (2014, *Epidemiologic Methods*) 등. ([IDEAS/RePEc][19], [De Gruyter Brill][24])
* **연속노출 양수성 진단**: “A Simple Diagnostic for the Positivity Assumption for Continuous Exposures.” ([Wiley Online Library][7])
* **ESS 지표**: WeightIt 문서(ESS 공식). ([R Project Search][6])

---

## 8) 실전 적용시 체크리스트(짧게)

* [ ] (필수) **겹침/ESS/가중치 분포** 보고
* [ ] (필수) \*\*선택한 estimand(ATE/ATT/ATO/IPSI/LMTP)\*\*와 **대상(population)** 명시
* [ ] (권장) **트리밍/절단 규칙**과 **민감도 분석**(컷오프·방법 간 비교)
* [ ] (권장) **균형 지표**(SMD 등)와 **추정기 DR 사용 여부**
* [ ] (구조적 위반 시) **부분식별 바운드** 또는 **질문 변경** 이유 설명

---

원하시면, 가지고 계신 데이터/주제에 맞춰 **(i) 겹침 진단 플롯과 ESS 계산, (ii) ATE vs ATO(OW), (iii) 절단 민감도, (iv) IPSI/LMTP로 질문 재정의**까지 한 번에 돌아가는 분석 워크플로를 만들어 드릴게요.

[1]: https://miguelhernan.org/whatifbook?utm_source=chatgpt.com "Causal Inference: What If (the book) — Miguel Hernán"
[2]: https://content.sph.harvard.edu/wwwhsph/sites/1268/2018/12/hernanrobins_v1.10.37.pdf?utm_source=chatgpt.com "Causal Inference"
[3]: https://biostats.bepress.com/ucbbiostat/paper269/ "
\"Diagnosing and Responding to Violations in the Positivity Assumption\" by Maya L. Petersen, Kristin Porter et al.
"
[4]: https://epiresearch.org/wp-content/uploads/2014/07/Cole_AJE_2008_168_656.pdf?utm_source=chatgpt.com "kwn164 656..664 - epiresearch.org"
[5]: https://www.cambridge.org/core/books/causal-inference-for-statistics-social-and-biomedical-sciences/assessing-overlap-in-covariate-distributions/0186880D45FC793BE1D23E4016A3419F?utm_source=chatgpt.com "Assessing Overlap in Covariate Distributions (Chapter 14) - Causal ..."
[6]: https://search.r-project.org/CRAN/refmans/WeightIt/html/ESS.html?utm_source=chatgpt.com "R: Compute effective sample size of weighted sample"
[7]: https://onlinelibrary.wiley.com/doi/pdf/10.1002/sim.70194?utm_source=chatgpt.com "A Simple Diagnostic for the Positivity Assumption for Continuous Exposures"
[8]: https://econpapers.repec.org/RePEc%3Aoup%3Abiomet%3Av%3A96%3Ay%3A2009%3Ai%3A1%3Ap%3A187-199 "EconPapers: Dealing with limited overlap in estimation of average treatment effects"
[9]: https://link.springer.com/content/pdf/10.1007/s12561-011-9036-3.pdf?utm_source=chatgpt.com "Defining the Study Population for an Observational Study to Ensure ..."
[10]: https://www.jstor.org/stable/pdf/41403736.pdf?utm_source=chatgpt.com "Causal Inference without Balance Checking: Coarsened Exact Matching on ..."
[11]: https://academic.oup.com/aje/article/191/9/1640/6580570?utm_source=chatgpt.com "Data-Adaptive Selection of the Propensity Score Truncation Level for ..."
[12]: https://academic.oup.com/aje/article/188/1/250/5090958?utm_source=chatgpt.com "Addressing Extreme Propensity Scores via the Overlap Weights"
[13]: https://imai.fas.harvard.edu/research/files/CBPS.pdf?utm_source=chatgpt.com "Covariate balancing propensity score - Harvard University"
[14]: https://www.mit.edu/~jhainm/Paper/eb.pdf?utm_source=chatgpt.com "Entropy Balancing for Causal Effects: A Multivariate Reweighting ... - MIT"
[15]: https://cran.r-project.org/web/packages/tmle/tmle.pdf?utm_source=chatgpt.com "tmle: Targeted Maximum Likelihood Estimation"
[16]: https://arxiv.org/pdf/1707.05861?utm_source=chatgpt.com "On Adaptive Propensity Score Truncation in Causal Inference"
[17]: https://arxiv.org/abs/1704.00211?utm_source=chatgpt.com "Nonparametric causal effects based on incremental propensity score interventions"
[18]: https://beyondtheate.com/08_R_ipsi.html?utm_source=chatgpt.com "Incremental Propensity Score Interventions – Beyond the Average ..."
[19]: https://ideas.repec.org/a/bla/biomet/v68y2012i2p541-549.html?utm_source=chatgpt.com "Population Intervention Causal Effects Based on Stochastic I"
[20]: https://epiresearch.org/wp-content/uploads/2024/04/Nonparametric-Causal-Effects-Based-on-Longitudinal-Modified-Treatment-Policies.pdf?utm_source=chatgpt.com "Nonparametric Causal Effects Based on Longitudinal Modified Treatment ..."
[21]: https://www.jstor.org/stable/pdf/2006592?utm_source=chatgpt.com "Nonparametric Bounds on Treatment Effects - JSTOR"
[22]: https://arxiv.org/pdf/2505.24296?utm_source=chatgpt.com "Data Fusion for Partial Identification of Causal Effects"
[23]: https://tlverse.org/tlverse-handbook/shift.html?utm_source=chatgpt.com "Chapter 9 Stochastic Treatment Regimes | Targeted Learning in R - tlverse"
[24]: https://www.degruyterbrill.com/document/doi/10.1515/em-2012-0001/pdf?utm_source=chatgpt.com "Identification, Estimation and Approximation of Risk under ..."
