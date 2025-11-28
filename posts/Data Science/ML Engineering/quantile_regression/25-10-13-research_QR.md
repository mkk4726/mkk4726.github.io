---
title: "Non-crossing Quantile Regression: 교차 방지 기법과 폭 정규화"
date: "2025-10-13"
excerpt: "여러 분위를 동시에 학습하면서 quantile crossing 문제를 방지하고, 예측구간 길이를 정규화하는 최신 연구들을 모델 계열별로 정리했습니다."
category: "Machine Learning"
tags: ["Quantile Regression"]
---

# 지금 고민하고 있는 부분

1. qunatile crossing problem을 모델 부분에서 해결하기
2. loss function에 prediction interval width를 regularization으로 추가히기


# GPT-5 리서치로 조사해보기

여러 개의 quantile을 한 번에 학습하면서 quantile crossing 문제를 방지하기 위한 단조증가(τ에 대해 비감소) 제약 기법들을 모델 계열별로 정리했습니다. 또한 quantile 간 차이(prediction interval width)를 regularization 항으로 넣는 방법과 관련 선행연구도 함께 다룹니다.

---

## 1) 이론적 배경

조건부 quantile 함수 $Q(x,\tau)$는 $\tau \in (0,1)$에 대해 단조 비감소해야 합니다. 개별 quantile을 따로 학습하면 데이터 noise와 sample variability로 인해 $Q(x,0.9) < Q(x,0.8)$ 같은 crossing이 쉽게 발생합니다. 이는 확률적 해석을 깨뜨리므로 monotonicity 보장이 중요합니다. Crossing 문제는 고전적 QR과 최신 deep learning QR 모두에서 보고되었습니다. ([Alfred Galichon][1])

동시 학습의 장점은 서로 다른 $\tau$ 사이의 정보를 공유하여 안정성과 효율을 높이고, 동시에 단조 constraint를 자연스럽게 적용할 수 있다는 것입니다(constraint optimization, parameterization, penalization 등). ([BPB][2])

---

## 2) 교차 방지 기법: 방법론별 핵심 연구

### A. Post-hoc Rearrangement로 단조화

**Chernozhukov–Fernández-Val–Galichon (Econometrica, 2010)**: 추정 결과 곡선을 monotonic rearrangement(정렬)하여 crossing을 제거하면 원래 추정보다 실제 quantile 함수에 더 가까워지는 성질(finite-sample improvement)을 증명했습니다. 구현이 간단해 많은 패키지에 포함되어 있지만, 학습 중 constraint가 아닌 post-hoc correction이라는 한계가 있습니다. ([Alfred Galichon][1])

### B. Hard Constraints 또는 Model Parameterization으로 Monotonicity 보장

#### 1. 고전/스플라인/선형 QR

* **Bondell–Reich–Wang (Biometrika, 2010)**: 선형/smoothing spline QR에 non-crossing linear constraint를 직접 적용하여 동시 추정. Sample point에서 $X\beta_{\tau_k} \le X\beta_{\tau_{k+1}}$ 형태의 constraint를 푸는 LP/quadratic optimization 접근법. ([BPB][2])
* **Wu–Liu (2009)**: Stepwise 방식으로 여러 quantile을 순차적으로 적합하되 non-crossing constraint를 유지. ([Intl Press][3])

#### 2. Kernel/RKHS의 Multi-task Quantile Learning

**Sangnier–Fercoq–d'Alché-Buc (NeurIPS, 2016)**: Vector-valued RKHS에서 여러 $\tau$를 동시에 학습하는 Joint Quantile Regression (JQR)을 제안했습니다. Multi-task 구조가 crossing을 억제하고 generalization 성능 향상을 제공합니다(hard constraint 없이도 crossing 완화). ([NeurIPS Proceedings][4])

#### 3. Bayesian Simultaneous Quantile Estimation

* **Tokdar–Kadane (Bayesian Analysis, 2012)**: Non-crossing quantile planes를 reparameterization으로 표현하여 nonparametric Bayesian 동시 추정을 구현했으며, multivariate/spatial 확장으로도 이어졌습니다. ([Project Euclid][5])
* **Rodrigues et al. (2017), Simultaneous penalised quantile splines (2018)**: Pyramid·spline 기반으로 여러 quantile 곡선을 동시에 적합하면서 non-crossing을 달성했습니다. ([ScienceDirect][6])
* **Xu–Reich (Biometrics, 2023/2024; "QUINN")**: I-spline으로 conditional distribution function을 모델링하고 inverse function으로 quantile을 추정하여 자연스러운 monotonicity와 quantile process의 유연한 동시 추정을 제공합니다. ([OUP Academic][7])

#### 4. Deep Learning에서 Structural Monotonicity 보장

* **MCQRNN (Cannon 2018/2019)**: MLP에 monotonicity constraint/additivity constraint를 적용하여 여러 quantile을 동시에 추정하면서 non-crossing을 보장합니다. R 패키지(`qrnn`)도 제공됩니다. ([SpringerLink][8])
* **Moon et al. (JCGS, 2021)**: Inequality constraint를 만족하는 Non-crossing Quantile Neural Network + L1-penalizing 기법으로 동시에 다수 quantile을 학습합니다. 코드 공개. ([ResearchGate][9])
* **Deep Non-Crossing Quantiles via ∂/∂τ (AISTATS, 2022)**: Quantile에 대한 partial derivative $\partial Q/\partial\tau$를 항상 양수가 되도록 NN을 설계(positive output)하고 적분하여 $Q$를 얻는 방식으로 numerical precision 수준에서 monotonicity를 보장합니다. ([ar5iv][10])
* **I(S)QF (PMLR, 2022)**: Incremental spline으로 전체 quantile function을 직접 근사하는 NN. Monotone layer를 통해 crossing 방지하며, training grid 너머 임의 $\tau$로도 interpolation/extrapolation이 가능합니다. ([Proceedings of Machine Learning Research][11])
* **Non-Crossing Quantile (NQ) Network (2025)**: Mean-net과 gaps-net을 구성하여 인접 quantile 간 차이(gap)를 non-negative로 출력(예: Softplus)하여 구조적으로 non-crossing을 보장합니다. Slides/preprint/code 공개. ([UNC School of Medicine][12])
* **DNN-NMQR (2024)**: 여러 quantile을 shared representation으로 한 번에 학습하고, penalization으로 crossing을 억제합니다. ([SpringerLink][13])

### C. Soft Constraints (Penalization)로 Non-crossing 유도

* **ReLU/hinge 기반 crossing penalty**: 인접 quantile 예측치 차이에 대해 $\text{pen}_{\text{cross}}=\sum \max(0, Q_{\tau_k}-Q_{\tau_{k+1}})$ 형태의 penalty를 추가하여 crossing을 강하게 억제합니다. Deep NN에 이 penalty를 적용하고 이론적 generalization bound도 제시했습니다. (Tang–Shen–Lin–Huang, 2022; Shen et al., JMLR 2024) ([arXiv][14])
* **Non-crossing Constraint ↔ Fused-Lasso 등가성**: Adaptive (non-crossing) constraint를 가중하면 quantile 간 coefficient 차이에 대한 fused lasso와 등가가 된다는 분석(2024)이 있습니다. 이는 "인접 quantile 간 차이 축소" 관점의 regularization과 연결됩니다. ([arXiv][15])
* **Interquantile Shrinkage (fused penalty)**: Quantile별 regression coefficient의 인접 quantile 간 차이에 penalty를 주어 commonality를 도출하고 stability를 높입니다(variable selection과 동시). 값 예측 자체의 width를 직접 penalize하지는 않지만 "quantile 간 차이 축소 regularization" 철학이 동일합니다. ([ScienceDirect][16])

### D. Distributional RL (DRL) 분야의 Non-crossing Quantile Network

**Non-crossing QR in DRL (NeurIPS 2020)** 및 후속 연구: Quantile level을 입력으로 받는 network에 monotonicity constraint/layer를 적용하여 전체 quantile distribution을 안정적으로 근사합니다(학습 초기 crossing 방지). 본질은 일반적 conditional distribution learning과 동일한 구조적 아이디어입니다. ([NeurIPS Proceedings][17])

---

## 3) Quantile 간 차이(Prediction Interval Width)를 Regularization 항으로 추가하는 방법

Width regularization은 다음과 같은 여러 방식으로 구현하고 해석할 수 있습니다.

### (i) Direct Width Penalty

Lower/upper 두 quantile $q_{\ell}$, $q_u$를 동시에 학습할 때 다음과 같은 loss function을 사용할 수 있습니다:

$$
\mathcal{L} = \sum_i \bigl[\rho_{\tau_\ell}(y_i - q_\ell(x_i)) + \rho_{\tau_u}(y_i - q_u(x_i))\bigr] + \lambda_{\text{cross}}\sum_i \max(0, q_\ell(x_i)-q_u(x_i)) + \lambda_{\text{width}}\sum_i \bigl(q_u(x_i)-q_\ell(x_i)\bigr)
$$

여기서 첫 항은 pinball loss, 두 번째는 crossing penalty, 세 번째가 width regularization입니다. NQ-Net 같은 gap parameterization(positive gap) 구조에선 gap의 합에 L1/L2를 주는 것이 곧 width shrinkage regularization이 됩니다(구조적으로 non-crossing이 이미 보장). ([UNC School of Medicine][12])

### (ii) Interval Score를 Training Objective로 사용

Gneiting & Raftery (2007)의 Interval Score는 다음과 같이 정의됩니다:

$$
\text{IS}_\alpha = (q_u-q_\ell) + \frac{2}{\alpha}(q_\ell - y)\mathbf{1}_{y<q_\ell} + \frac{2}{\alpha}(y-q_u)\mathbf{1}_{y>q_u}
$$

첫 항이 width(sharpness) 최소화, 나머지는 coverage miss에 대한 penalty입니다. 즉 width를 줄이되 excessive shrinkage에 대한 penalty로 보정하는 proper scoring rule이므로 width regularization의 원리적 대안이 됩니다. 여러 prediction interval (다수 quantile pairs)에 대해선 WIS(Weighted Interval Score)를 사용합니다. ([stat.washington.edu][18])

### (iii) Continuous Quantile의 Expected Pinball Loss

$\tau$를 연속변수로 보고 continuous distribution에 대한 expected pinball loss를 최소화하면 전체 quantile function의 smoothness와 consistency가 regularization처럼 작동합니다. Google의 Deep Lattice 계열은 $\tau$를 monotone input으로 취급해 구조적으로 non-crossing을 보장하며, 이런 continuous quantile learning이 좋은 regularization이 됨을 보였습니다. ([arXiv][19])

### 실무 적용 시 고려사항

Direct width penalty는 undercoverage 위험이 있어 $\lambda_{\text{width}}$를 너무 크게 주면 안 됩니다. 대신 Interval Score는 이 위험을 이론적으로 보정하므로 width shrinkage와 coverage balance가 필요할 때 training objective로 사용하기 좋습니다. 이후 CQR(Conformalized QR)로 post-hoc coverage calibration까지 결합하면, width는 짧고 coverage는 정확한 실용적 pipeline을 구축할 수 있습니다. ([NeurIPS Proceedings][20])

---

## 4) 구현 설계 방법론

### Recipe A: Structural Monotonicity + Width Regularization (권장)

1. **Model**: $Q(x,\tau)=\mu(x) + \sum_{k=1}^{K} \text{Softplus}(g_k(x)) \cdot \mathbf{1}_{\tau \ge \tau_k}$ 또는 $\partial Q/\partial \tau = \text{Softplus}(h(x,\tau))$를 적분하여 non-crossing 구조 구현 ([ar5iv][10])
2. **Loss**: $\sum_{\tau \in \mathcal{T}}\text{pinball}_\tau$ + (optional) Interval Score 또는 gap L1/L2 (width regularization) ([stat.washington.edu][18])
3. (Optional) CQR calibration으로 target coverage 보장 ([NeurIPS Proceedings][20])

### Recipe B: Penalty-based Monotonicity + Width Regularization

표준 multi-quantile network에서 다음 loss function을 사용합니다:

$$
\mathcal{L}=\sum_{\tau}\text{pinball}_\tau + \lambda_{\text{cross}}\sum \max(0, Q_{\tau_k}-Q_{\tau_{k+1}}) + \lambda_{\text{width}}\sum (Q_{\tau_u}-Q_{\tau_\ell})
$$

$\lambda_{\text{cross}}$를 충분히 키워 crossing을 억제하고, $\lambda_{\text{width}}$는 undercoverage 방지를 위해 작게 또는 점증적으로 설정합니다. ([arXiv][14])

---

## 5) 각 계열별 대표 논문 및 패키지

* **Post-hoc Rearrangement**: *Quantile and Probability Curves Without Crossing* (Econometrica 2010) 및 구현 패키지(`quantreg.nonpar`, `Rearrangement`). Sorting을 통한 monotonization. ([Alfred Galichon][1])
* **Linear/Spline QR + Constraints**: Bondell–Reich–Wang (2010), Wu–Liu (2009). Simultaneous estimation과 non-crossing constraints. ([BPB][2])
* **RKHS Multi-task JQR**: Sangnier et al. (NeurIPS 2016) — 하나의 kernel framework에서 여러 $\tau$를 simultaneous learning. ([NeurIPS Proceedings][4])
* **Bayesian Simultaneous Quantile**: Tokdar–Kadane (2012), Rodrigues et al. (2017), QUINN(Xu–Reich, 2023/2024). I-spline/pyramid/reparameterization으로 monotonicity 구현. ([Project Euclid][5])
* **Deep Learning Structural Monotonicity**
  * **MCQRNN**: Non-crossing 보장, R `qrnn` 패키지 ([SpringerLink][8])
  * **Non-crossing QR NN (Moon et al., 2021)**: Inequality constraint + L1; 코드 공개 ([ResearchGate][9])
  * **Deep ∂/∂τ Integration**: Partial derivative positivity로 monotonicity 보장 (AISTATS 2022) ([ar5iv][10])
  * **I(S)QF**: Incremental spline layer로 full quantile modeling (PMLR 2022) ([Proceedings of Machine Learning Research][11])
  * **NQ-Net (gaps-net)**: Mean-net + gaps-net으로 structural non-crossing (slides/preprint/github) ([UNC School of Medicine][12])
  * **DNN-NMQR (2024)**: Shared representation + penalty로 crossing 억제 ([SpringerLink][13])
  * **ReQU-based Full Quantile Process (JMLR 2024)**: Deep ReQU + non-crossing penalty + generalization bound ([Journal of Machine Learning Research][21])
  * **Regularization Strategies (Google, 2021)**: $\tau$를 monotone input으로 취급하는 Deep Lattice와 continuous quantile expected pinball regularization ([arXiv][19])
* **Width (Interval Length) 관련**
  * **Interval Score / WIS**: Width와 miscoverage의 proper scoring — training objective로 사용 가능 ([stat.washington.edu][18])
  * **Width-penalised PI Learning**: Width inflation을 줄이기 위한 PI width penalty loss (2024–2025 사례) ([arXiv][22])
  * **CQR**: 학습된 quantile을 holdout data로 calibration하여 coverage 보장 및 short interval 달성 ([NeurIPS Proceedings][20])

---

## 6) 방법론 선택 가이드

* **Structural Non-crossing Prevention**: Deep ∂/∂τ integration, NQ-Net (gaps-net), MCQRNN 사용. Width는 Interval Score로 조정하거나 gap의 L1/L2 regularization 적용. ([ar5iv][10])
* **Interpretable Statistical Models**: Bondell(2010), Bayesian simultaneous quantile(QUINN 포함) 사용. ([BPB][2])
* **Deep Learning + Penalty**: 기존 multi-quantile NN에 crossing hinge penalty와 width penalty 추가. 필요시 CQR calibration. ([arXiv][14])
* **빠른 실무 적용**: `qrnn`(MCQRNN), `rqPen`(multi-quantile + group/fused penalty), `cqr`(CQR implementation) 패키지 활용. ([CRAN][23])

---

## 7) 실무 적용을 위한 Objective Function 예시

### Multi-quantile + Structural Non-crossing + Width Regularization

$$
\min_\theta \underbrace{\sum_{\tau\in\mathcal{T}}\sum_i \rho_\tau\big(y_i - Q_\theta(x_i,\tau)\big)}_{\text{simultaneous pinball}} + \underbrace{\lambda_{\text{width}}\sum_i\sum_{(\ell,u)\in\mathcal{P}}\big(Q_\theta(x_i,u)-Q_\theta(x_i,\ell)\big)}_{\text{width regularization}}
$$

### Soft Non-crossing Penalty 추가

$$
+ \underbrace{\lambda_{\text{cross}}\sum_i\sum_{k}\max\big(0, Q_\theta(x_i,\tau_k)-Q_\theta(x_i,\tau_{k+1})\big)}_{\text{crossing suppression}}
$$

### Interval Score Alternative

$$
\text{pinball 대신} \sum_{(\ell,u)\in\mathcal{P}}\sum_i \text{IS}_\alpha\big(y_i; q_\ell(x_i), q_u(x_i)\big)
$$

$\lambda_{\text{width}}$는 작게 시작(예: 1e-3~1e-2)하여 validation coverage를 보며 조정하고, 마지막에 CQR로 target coverage를 맞추면 width-coverage balance를 얻기 쉽습니다. ([stat.washington.edu][18])

---

## 8) 핵심 요약

Non-crossing quantile regression의 핵심 철학은 다음 세 가지로 요약됩니다:

1. **$\tau$-axis Monotonicity 보장**: Architecture, parameterization, penalty 중 하나의 방법으로 monotonicity를 확보
2. **Width Regularization**: Interval Score 같은 proper scoring rule을 사용하거나, gap parameter에 L1/L2 regularization을 적용하여 excessive width를 억제
3. **Coverage 보장**: 필요시 CQR로 target coverage를 post-hoc calibration

이 세 가지를 조합하면 실용적이고 이론적으로도 뒷받침되는 pipeline을 구축할 수 있습니다. ([arXiv][19])

---

## 참고문헌

* **Post-hoc Monotonization**: Chernozhukov et al., *Econometrica* (2010) — Rearrangement method ([Alfred Galichon][1])
* **Simultaneous Constraint QR (Frequentist)**: Bondell–Reich–Wang, *Biometrika* (2010) ([BPB][2])
* **Simultaneous QR (RKHS)**: Sangnier et al., NeurIPS (2016) ([NeurIPS Proceedings][4])
* **Simultaneous QR (Bayesian)**: Tokdar–Kadane, *Bayesian Analysis* (2012); Xu–Reich(QUINN), *Biometrics* (2023/24) ([Project Euclid][5])
* **Deep Learning Structural Monotonicity**: MCQRNN(R package `qrnn`), Moon et al. (2021), Deep ∂/∂τ (AISTATS 2022), I(S)QF (2022), NQ-Net(2025), DNN-NMQR(2024), ReQU-QRP(JMLR 2024) ([CRAN][23])
* **Penalty/Regularization**: Tang et al. (2022) Non-crossing ReLU penalty & Conformal PIs; Fused-Lasso ↔ Non-crossing(2024) ([arXiv][14])
* **Interval Score/WIS**: Gneiting–Raftery(2007) ([stat.washington.edu][18])
* **CQR**: Romano–Patterson–Candès (NeurIPS 2019) ([NeurIPS Proceedings][20])

[1]: https://alfredgalichon.com/wp-content/uploads/2012/10/Econometrica_article_may-2010.pdf "Quantile and Probability Curves Without Crossing - Alfred Galichon"
[2]: https://bpb-ap-se2.wpmucdn.com/blogs.unimelb.edu.au/dist/d/296/files/2018/02/noCross-26c5pn3.pdf "Non-crossing quantile regression curve estimation"
[3]: https://intlpress.com/site/pub/files/_fulltext/journals/sii/2009/0002/0003/SII-2009-0002-0003-a004.pdf "Stepwise multiple quantile regression estimation using non-crossing constraints"
[4]: https://proceedings.neurips.cc/paper/2016/file/dfce06801e1a85d6d06f1fdd4475dacd-Paper.pdf "Joint quantile regression in vector-valued RKHSs - NeurIPS"
[5]: https://projecteuclid.org/journals/bayesian-analysis/volume-7/issue-1/Simultaneous-Linear-Quantile-Regression-A-Semiparametric-Bayesian-Approach/10.1214/12-BA702.pdf "Simultaneous Linear Quantile Regression: A Semiparametric Bayesian Approach"
[6]: https://www.sciencedirect.com/science/article/abs/pii/S0167947318302883 "Simultaneous fitting of Bayesian penalised quantile splines"
[7]: https://academic.oup.com/biometrics/article/79/1/151/7478061 "Bayesian Nonparametric Quantile Process Regression and Estimation of Marginals"
[8]: https://link.springer.com/content/pdf/10.1007/s00477-018-1573-6.pdf "Non-crossing nonlinear regression quantiles by monotone composite quantile regression neural network"
[9]: https://www.researchgate.net/publication/350479568_Learning_Multiple_Quantiles_With_Neural_Networks/fulltext/60b3de8345851557baaebc2d/Learning-Multiple-Quantiles-With-Neural-Networks.pdf "Learning Multiple Quantiles With Neural Networks"
[10]: https://ar5iv.org/pdf/2201.12848 "Deep Non-Crossing Quantiles through the Partial Derivative"
[11]: https://proceedings.mlr.press/v151/park22a/park22a.pdf "Learning Quantile Functions without Quantile Crossing for Distribution-free Prediction"
[12]: https://www.med.unc.edu/bigs2/wp-content/uploads/sites/822/2025/07/Deep-Distributional-Learing-with-Non-crossing-Quantile-Network.pdf "Conditional Distributional Learning with Non-crossing Quantile Network"
[13]: https://link.springer.com/article/10.1007/s11222-024-10418-4 "Simultaneous estimation and variable selection for a non-crossing multiple quantile regression model"
[14]: https://arxiv.org/pdf/2210.10161 "Nonparametric Quantile Regression: Non-Crossing Constraints and Conformal Prediction"
[15]: https://arxiv.org/pdf/2403.14036v3 "Fused LASSO as Non-Crossing Quantile Regression"
[16]: https://www.sciencedirect.com/science/article/pii/S0167947313002922 "Interquantile shrinkage and variable selection in quantile regression"
[17]: https://proceedings.neurips.cc/paper/2020/file/b6f8dc086b2d60c5856e4ff517060392-Paper.pdf "Non-crossing quantile regression for deep reinforcement learning"
[18]: https://www.stat.washington.edu/raftery/Research/PDF/Gneiting2007jasa.pdf "Strictly Proper Scoring Rules, Prediction, and Estimation"
[19]: https://arxiv.org/abs/2102.05135 "Regularization Strategies for Quantile Regression"
[20]: https://proceedings.neurips.cc/paper/2019/file/5103c3584b063c431bd1268e9b5e76fb-Paper.pdf "Conformalized Quantile Regression"
[21]: https://jmlr.org/papers/volume25/22-0488/22-0488.pdf "Nonparametric Estimation of Non-Crossing Quantile Regression Process with Deep ReQU Neural Networks"
[22]: https://arxiv.org/pdf/2411.19181 "Width-penalised Prediction Interval Learning"
[23]: https://cran.r-project.org/web/packages/qrnn/qrnn.pdf "qrnn: Quantile Regression Neural Network"
