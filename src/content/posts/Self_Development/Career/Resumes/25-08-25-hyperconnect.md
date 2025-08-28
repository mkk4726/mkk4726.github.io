---
title: "HyperConnect ML Engineer"
date: "2025-08-25"
excerpt: "하이퍼 커넥트 이력서 컨셉과 방향 적어보기"
category: "Career"
tags: ["이력서"]
public: false
---

[하이퍼 커넥트 채용공고](/posts/Self_Development/Career/Job Transition/25-08-04-하이퍼커넥트)

채용공고 스케치

거의 2주동안 포트폴리오를 완성하지 못하고 있는데, 다른 이유가 아니라 그냥 원하는 기업에 비해 내가 가진게 너무 볼품없어 보여서 그런 것 같다.
회피는 그만! 뭐가 부족한지 똑바로 확인하고 이 부분들을 채워나가보자.

JD에서 확인한 필수요구사항들.

- AI/ML에 대한 기본 지식과 적어도 한 개 이상의 특정 도메인에 대한 깊이 있는 지식을 갖추고, 관련 프로젝트 경험이 있으신 분
- Exploratory Data Analysis(EDA)를 통해, 데이터의 통계적 특성과 패턴을 발견하고 이를 ML 모델에 반영하실 수 있는 분
- 공개된 벤치마크 데이터 셋을 이용해 모델의 테스트 성능을 올리기 위해 여러 가지 모델링을 해본 경험이 있으신 분
- 구현체가 공개되지 않은 논문을 읽고, 빠르고 정확하게 구현할 수 있는 구현 역량을 갖추신 분
- Tensorflow, PyTorch, JAX 등 오픈소스 프레임워크 및 전반적인 파이썬 개발에 능숙하신 분
- ML 모델 학습 및 서비스 배포에 필요한 엔지니어링 역량을 갖추신 분
- AI 기술의 서비스화에 관심이 많으신 분
- 학위/국적 무관, 영어로 기초적인 의사소통이 가능하고, 한국어로 원활한 의사소통이 가능한 분

앞으로 내 행동 방향.
1. 필수요구사항과 선호경험에 맞는 경험들 최대한 살려서 이력서 제출하기
2. 부족한 부분들은 일할 때 어떻게 채워나갈 수 있을지 고민해보기


3개의 프로젝트를 리드한 경험 적어보자. + CV 다뤘던 경험


# 이력서 스케치 (영문 PDF 제출)

Led 3 projects with development involvement at a startup, demonstrating rapid growth and leadership capabilities.

Projects:

## Lenze size recommendation
- 2025.03 - Present (6 months)

Project Overview:

Developed a service that predicts surgical outcomes for vision correction, enabling surgeons to select optimal lens sizes based on data-driven predictions rather than solely on experience and intuition.

Problem-Solving Process:

1. Model Validation Challenge

- Problem
Faced challenges in evaluating prediction accuracy when the model generated four size options but only one could be validated with real customer data.

- Solution
Leveraged causal inference (positivity assumption) to exploit distributional overlap across treatments (lens sizes), facilitating indirect performance evaluation.
Accounted for non-random treatment assignment (lens sizes) by quantifying overlap in the data and separating overlapping from non-overlapping regions for analysis.
Validated this approach not only through domain expertise but also by statistically examining the distribution across treatments.

Used prediction intervals where treatment distributions overlapped and applied partial identification to quantify prediction ranges in non-overlapping regions.
Motivated by the goal of increasing user trust, expressed predictive uncertainty explicitly through intervals.

- Result
Indirectly evaluated unobserved predictions and visualized both guaranteed and non-guaranteed ranges to effectively communicate predictive uncertainty.


2. Data quality and consistency challenges between training and inference environments

- Problem
In the absence of a unified data pipeline, training and inference each pulled data directly from the data lake, leading to inconsistencies in data processing between environments.

- Solution
Developed a robust data pipeline to cleanse both OCR-collected and external data sources, incorporating data validation and schema enforcement to ensure data quality. 
In addition, built a feature store that unified offline (training) and online (serving) features, securing data consistency across environments and improving the reliability of model deployment.

- Result
Secured data quality through the new pipeline and established consistency across training and inference via the feature store, increasing confidence in model outputs and stability in deployment.



3. Modeling Approach

- Problem

The goal of model development was to deliver results that achieve user satisfaction, thereby fostering trust.
This required not only improving predictive accuracy within the dataset, but also ensuring robust performance in inference settings. 
In addition, the model needed to produce outputs aligned with user intuition—particularly important as the primary users were physicians, necessitating medically interpretable predictions.

- Solution

To improve model performance, I placed strong emphasis on thoroughly examining the data. 
I first analyzed feature distributions and filtered out implausible values that deviated from clinical standards, ensuring a reliable dataset. 

Drawing on physician intuition, I engineered clinically meaningful features—for example, capturing the relationship between age and lens thickness—which not only improved predictive accuracy but also aligned the model’s behavior with medical reasoning. 

To further strengthen reliability, I incorporated medical domain knowledge into the model by applying monotonicity constraints where clinically appropriate. 

Finally, I used interpretability tools such as Shapley values to explain prediction outcomes, enabling physicians to better understand and trust the model’s decisions.

- Result

Through detailed data analysis, I improved data quality and developed new features that enhanced model performance while producing results consistent with medical intuition. 
In addition, the model was not treated as a black box; I provided explanations for its outputs, ensuring that the reasoning behind predictions was transparent and understandable.



4. Lack of monitoring for silent failures and model performance

- Problem

Monitoring was required to ensure model performance in inference settings. 
It was important to track not only how well the model performed during real-world usage, but also to detect potential issues such as data shift. 
Without such monitoring, the service could appear to function normally while causing user discomfort through silent failures, ultimately reducing user trust and engagement.

- Solution




- Result




## OCR  Pipeline








## Chatbot
