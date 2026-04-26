---
title: 알라딘 AI Engineer 포트폴리오 초안
date: 2026-04-24
excerpt: 알라딘 AI Engineer 지원용 포트폴리오 스크래치
category: Career
tags:
  - Portfolio
  - Aladin
  - AI Engineer
Done: false
---

- 대상 이력서: [[Career/Resume/Scatch/26-04-24-알라딘-ai-engineer-이력서-스케치|알라딘 AI Engineer 이력서 스케치]]
- 작성 원칙: 이력서 한 문장을 목차로 삼아 문제-해결-성과 순서로 상세 기술
- JD 키워드: OCR, Recognition, Vision, Retrieval, RAG, LLM, Serving, Monitoring, Cost-Performance Tradeoff

---

## 검사장비 이미지 수집부터 OCR 추론, DB 적재까지 End-to-End 파이프라인을 구축해 데이터 확인 시간을 95% 단축(20초 -> 1초/건)

`키워드`: OCR, Pipeline, Serving, FastAPI, Async, 운영자동화

### 아키텍처 (삽입 예정)
- 위치: OCR Client/Server 비동기 파이프라인 구조도
- 포함 요소: Image Ingestion -> OCR Service -> Post-processing -> DB -> Monitoring

### 면접관 스캔용 요약 (9줄)
- 문제: 검사결과 이미지가 분산되어 수동 조회(20초/건)로 운영 비효율 발생.
- 제약: 장비 종류가 다양하고 실시간 처리 안정성이 필요.
- 접근: 수집-추론-적재를 하나의 End-to-End 파이프라인으로 재설계.
- 구현: 레거시 절차지향 코드를 OOP로 재구성해 에러 추적성과 유지보수성 확보.
- 구현: Client/Server 역할을 재정의하고 비동기 처리 도입.
- 구현: OCR 지연이 사용자 플로우를 막지 않도록 큐 기반 처리 흐름 적용.
- 결과: 데이터 확인 시간 95% 단축(20초 -> 1초/건).
- 결과: 평균 응답속도 5초 -> 1초로 개선.
- 임팩트: 안정적 데이터 수집 기반으로 후속 서비스 운영 신뢰성 확보.

### 문제
병원 검사결과가 장비별 이미지 파일로 흩어져 있어 담당자가 건당 약 20초를 들여 수동으로 조회해야 했다. 이 구조에서는 데이터 수집이 누락되기 쉽고, 후속 서비스에서 안정적으로 활용하기 어려웠다.

### 해결
검사장비 이미지 실시간 수신 -> OCR 처리 -> DB 적재까지 하나의 파이프라인으로 설계했다. 기존 레거시를 OOP로 재구성해 에러 추적이 가능하도록 만들고, Client/Server 역할을 재정의해 OCR 처리 지연이 사용자 경험에 영향을 주지 않도록 비동기 구조를 도입했다.

### 성과
수동 확인 프로세스를 자동화해 데이터 확인 시간을 95% 단축했다(20초 -> 1초/건). 평균 응답속도도 5초에서 1초로 개선되어 현장 운영 안정성이 높아졌다.

관련 문서:
- [[Career/Project/OCR/프로젝트 설명|OCR 프로젝트 설명]]
- [[Career/Project/OCR/파이프라인 설계 및 구현|파이프라인 설계 및 구현]]

---

## 고정 레이아웃 특성을 활용해 Detection을 룰 기반으로 단순화하고 TrOCR를 고도화해 검증셋 200건 기준 Character-level Accuracy 100%를 달성

`키워드`: OCR, Recognition, TrOCR, Model Selection, Evaluation Set, Triton

### 아키텍처 (삽입 예정)
- 위치: Rule-based Detection + TrOCR Recognition + Triton Serving 구조도
- 포함 요소: ROI Rule Engine -> TrOCR -> Post-processing -> Validation Pipeline

### 면접관 스캔용 요약 (9줄)
- 문제: 의료 도메인 요구 정확도(99%+) 대비 기준 데이터셋 자체가 부재.
- 제약: 신규 모델 개발 리소스 제한, 운영 환경은 온프레미스.
- 접근: 도메인 특성(고정 레이아웃)을 활용해 문제를 Detection/Recognition으로 분리.
- 구현: Detection은 룰 기반으로 단순화해 모델 복잡도와 오류 범위 축소.
- 구현: Recognition은 TrOCR 중심으로 전처리/후처리 반복 고도화.
- 구현: 검증셋 200건을 직접 구축해 모델 비교/개선 기준 수립.
- 구현: Triton Inference Server 기반 동시성/동적 배치 운영.
- 결과: Character-level Accuracy 100%(검증셋 200건) 달성.
- 임팩트: 정확도와 운영성(복잡도/유지보수) 균형 확보.

### 문제
의료 도메인 특성상 높은 OCR 정확도가 필요했지만, 초기에는 평가 데이터셋 자체가 없어 성능 기준을 정의할 수 없었다.

### 해결
검사 이미지 200건으로 검증셋을 직접 구축해 비교 가능한 기준을 만들었다. 고정 레이아웃이라는 도메인 특성을 활용해 Text Detection은 룰 기반으로 단순화하고, Text Recognition에 리소스를 집중해 TrOCR와 전처리/후처리를 반복 고도화했다. 서빙은 Triton Inference Server 기반으로 구성해 다중 장비 요청을 안정적으로 처리했다.

### 성과
검증셋 200건 기준 Character-level Accuracy 100%를 달성했다. 복잡한 Detection 모델 없이도 도메인 특화 설계로 정확도와 운영성을 함께 확보했다.

관련 문서:
- [[Career/Project/OCR/OCR 정확도 개선|OCR 정확도 개선]]

---

## 이미지 전송 클라이언트-서버-TrOCR 서빙 3개 프로그램 연결 안정화를 통해 운영 장애 리스크를 줄이고 응답 일관성을 개선

`키워드`: Serving API, Error Case Analysis, Pipeline Optimization, Monitoring, Testing, Triton

### 아키텍처 (삽입 예정)
- 위치: Client(검사실 PC) -> OCR Server -> Triton(TrOCR) 연동 구조도
- 포함 요소: PC Agent/Installer, Input Validation Layer, Inference Queue, Monitoring, Alert

### 면접관 스캔용 요약 (9줄)
- 문제: OCR 운영 안정성은 모델 1개가 아니라 클라이언트-서버-서빙 3개 프로그램의 연결 품질에 좌우됨.
- 제약: 검안사의 기존 흐름(검안 -> 아이리더 업로드)을 방해하면 도입 실패 가능성 큼.
- 접근: 프로그램별 장애 지점을 분리하고 연결 구간을 명시적으로 관리.
- 구현: 클라이언트는 설치/연동 절차를 단순화하고 기존 업무 흐름 비방해 방식으로 전송 처리.
- 구현: 서버는 비정상 입력 검증, 예외 분류, 모니터링 기능을 추가해 장애 전파 방지.
- 구현: 코드 수정 시 대규모 장애를 막기 위해 pytest/mypy 기반 검증 체계 강화.
- 구현: TrOCR는 Triton 온프레 서빙으로 동시성/동적 배치 안정화.
- 결과: 평균 응답속도 5초 -> 1초, 운영 중 장애 원인 추적 시간 단축.
- 임팩트: 추론 비용/응답속도/운영 안정성을 함께 만족하는 서비스 운영 체계 확보.

### 문제
운영 환경에서 장애는 대부분 "모델 정확도"보다 프로그램 간 연결 구간에서 발생했다. 예상하지 못한 입력, PC별 설치/환경 차이, 서버 수정 이후 런타임 오류가 누적되면 OCR 전체 서비스가 영향을 받는 구조였다.

### 해결
OCR 서비스를 3개 프로그램(이미지 전송 클라이언트, OCR 서버, TrOCR Triton 서빙)으로 분리해 각 단계의 실패 원인을 명시적으로 관리했다. 클라이언트는 기존 검안/아이리더 흐름을 방해하지 않도록 연동 방식을 조정했고, 서버는 입력 검증/예외 분류/모니터링을 강화했다. 또한 수정사항 반영 시 회귀를 줄이기 위해 테스트 코드를 체계화했다.

### 성과
서비스 장애를 유발하던 연결 구간 이슈를 줄이고, 장애 범위를 국소화해 복구 속도를 높였다. 결과적으로 응답속도와 운영 안정성 모두 개선되었고, "운영 가능한 OCR 시스템"으로 전환할 수 있었다.

관련 문서:
- [[Career/Project/OCR/추론 비용·응답속도 최적화와 에러 케이스 기반 개선|추론 비용·응답속도 최적화와 에러 케이스 기반 개선]]
- [[Career/Project/OCR/파이프라인 설계 및 구현|파이프라인 설계 및 구현]]

---

## Query Rewriting/Decomposition/Keyword Extraction과 임베딩 평가 체계를 도입해 RAG 검색 Hit Rate를 70% 향상(40~50 -> 90~100)

`키워드`: Retrieval, RAG, Query Rewriting, Decomposition, Embedding, Qdrant

### 아키텍처 (삽입 예정)
- 위치: RAG Retrieval Augmentation 파이프라인 구조도
- 포함 요소: Session History -> Rewrite -> Decompose -> Keyword Filter -> Vector Search -> Answer

### 면접관 스캔용 요약 (9줄)
- 문제: 기본 RAG가 다턴/복합 질의/고유명사에서 검색 누락을 빈번히 발생.
- 제약: 병원 도메인 용어가 많아 일반 임베딩만으로는 정밀 검색 한계.
- 접근: 검색 전 단계에서 질의를 구조화하는 도메인 특화 파이프라인 설계.
- 구현: Redis 세션 기반 Query Rewriting으로 맥락 복원.
- 구현: 복합 질문을 Decomposition해 다중 검색 후 결과 통합.
- 구현: Keyword Extraction + 메타데이터 필터링을 결합한 하이브리드 검색 도입.
- 구현: FAQ 기반 평가셋을 직접 구축해 임베딩 모델 객관 비교.
- 결과: Hit Rate 40~50 -> 90~100으로 70% 향상.
- 임팩트: 상담 도메인 검색 정확도 90%+ 안정 확보.

### 문제
기본 RAG 구조에서는 다턴 대화 맥락 단절, 복합 질문 처리 실패, 병원 고유명사 미인식으로 검색 누락이 자주 발생했다.

### 해결
Redis 기반 대화 이력을 활용한 Query Rewriting, 복합 질문 분해(Decomposition), 도메인 키워드 추출과 메타데이터 필터링을 결합한 하이브리드 검색 구조를 설계했다. 또한 FAQ 기반 평가셋을 직접 구축해 임베딩 모델을 비교 선택하고 Qdrant를 도입해 검색/필터링 성능을 높였다.

### 성과
검색 Hit Rate를 40~50 수준에서 90~100 수준으로 끌어올려 70% 향상시켰다. 도메인 특화 질의에서 검색 정확도 90% 이상을 안정적으로 확보했다.

관련 문서:
- [[Career/Project/Chatbot/RAG 파이프라인 설계|RAG 파이프라인 설계]]

---

## 질문 분류 단계를 앞단에 추가해 불필요한 LLM 호출을 줄이고 평균 응답시간 30% 단축, 불만족도 80% 이상 감소

`키워드`: LLM Classification, Latency Optimization, Cost Optimization, UX, Routing

### 아키텍처 (삽입 예정)
- 위치: Intent Classification 기반 라우팅 구조도
- 포함 요소: Classifier -> Fixed Response / Unanswerable / RAG Branch

### 면접관 스캔용 요약 (9줄)
- 문제: 단순 문의도 RAG를 경유해 지연 발생, 답변 불가 질문의 모호 응답으로 불만 증가.
- 제약: 카테고리 변경이 잦아 별도 분류모델 재학습 비용이 큼.
- 접근: RAG 앞단에 LLM 프롬프트 기반 분류 라우팅 계층 추가.
- 구현: 질의를 고정답변/답변불가/RAG대상으로 분기.
- 구현: 고정답변/답변불가는 즉시 응답하도록 경로 최적화.
- 구현: 고객사 운영 매뉴얼 플로우와 버튼/링크 응답 정합성 확보.
- 구현: 전체 질의 약 50%를 분류 단계에서 선처리.
- 결과: 평균 응답시간 30% 단축, 불만족도 80%+ 감소.
- 임팩트: 품질과 비용, 속도를 동시에 개선한 운영형 최적화.

### 문제
운영/주차/상담원 연결 같은 고정 응답 질문에도 RAG를 거치며 지연이 발생했고, 답변 불가 질문에 LLM이 모호한 답변을 생성해 불만족이 증가했다.

### 해결
RAG 앞단에 LLM 프롬프트 기반 질문 분류 단계를 배치해 질의를 고정답변/답변불가/RAG대상으로 분기했다. 고정답변 및 답변불가 케이스는 즉시 응답하고, 필요한 케이스만 RAG로 전달하도록 파이프라인을 재구성했다.

### 성과
전체 질의의 약 50%를 앞단에서 처리해 평균 응답시간을 30% 단축했다. 사용자 불만족도도 80% 이상 감소했고, 고객사 운영 매뉴얼과 챗봇 흐름을 정합시켰다.

관련 문서:
- [[Career/Project/Chatbot/질문 분류 및 응답시간 개선|질문 분류 및 응답시간 개선]]

---

## RAGAS 기반 자동 평가와 Airflow 배치 모니터링을 구축해 대화 로그 검토 시간을 83% 단축(30분 -> 5분)

`키워드`: Monitoring, RAGAS, Airflow, Evaluation, Silent Failure, Slack Alert

### 아키텍처 (삽입 예정)
- 위치: 품질 모니터링 자동화 파이프라인 구조도
- 포함 요소: Log Store -> Airflow Batch -> LLM Evaluation -> Daily Summary -> Slack

### 면접관 스캔용 요약 (9줄)
- 문제: 챗봇은 200 OK를 반환해도 답변 품질이 저하되는 silent failure 발생.
- 제약: 일평균 150~200건 로그를 사람이 수동 검토(30분)해야 함.
- 접근: 사람이 보던 기준을 정량 지표로 바꿔 LLM 자동 평가 체계 설계.
- 구현: RAGAS 기반 Faithfulness/Context Sufficiency 커스텀 지표 도입.
- 구현: Airflow 배치로 일/주 단위 자동 계산 및 리포트 생성.
- 구현: 저점수 대화만 선별해 Slack 알림으로 검토 범위 축소.
- 구현: 품질 지표 시계열 축적으로 상태 추적 기반 마련.
- 결과: 로그 검토 시간 30분 -> 5분(83% 단축).
- 임팩트: 운영 피로도 감소 + 품질 저하 조기 탐지 체계 확보.

### 문제
챗봇은 200 OK를 반환해도 답변 품질이 떨어지는 silent failure가 발생한다. 이를 감지하기 위해 일평균 150~200건 로그를 수동 검토해야 했고 운영 피로도가 높았다.

### 해결
RAGAS 기반 커스텀 평가지표(Faithfulness, Context Sufficiency)를 설계하고 Airflow 배치로 자동 평가 파이프라인을 구축했다. 점수가 낮은 대화만 선별해 Slack으로 알림을 보내도록 구성해 사람이 모든 로그를 보는 구조를 개선했다.

### 성과
모니터링 검토 시간을 30분에서 5분으로 83% 단축했다. 대화 품질 지표가 시계열로 축적되어 서비스 상태를 정량적으로 추적할 수 있게 됐다.

관련 문서:
- [[Career/Project/Chatbot/모니터링 자동화|모니터링 자동화]]

---

## 한국어 특화 파이프라인을 Agentic RAG 단일 구조로 전환해 신규 언어 추가 공수를 약 80% 감소

`키워드`: Agentic RAG, Multilingual, Scalability, Maintainability, Tradeoff

### 아키텍처 (삽입 예정)
- 위치: 고정 파이프라인 -> Agentic Tool-call 구조 전환도
- 포함 요소: LLM Agent -> Search Tools -> Iterative Retrieval -> Response

### 면접관 스캔용 요약 (9줄)
- 문제: 언어별 파이프라인 복제로 인해 FAQ/임베딩/프롬프트 유지보수 비용 급증.
- 제약: AI 인력 1명 체계에서 다국어 확장 병목 발생.
- 접근: 고정형 RAG를 Agentic RAG 단일 구조로 전환해 언어 독립성 확보.
- 구현: Agent가 검색 계획 수립과 Tool 호출을 동적으로 수행하도록 설계.
- 구현: 언어별 파이프라인 N개 대신 단일 구조 + 언어별 문서 관리로 단순화.
- 구현: 호출 수/지연시간/비용 증가 트레이드오프를 제한 규칙으로 관리.
- 결과: 신규 언어 추가 공수 약 80% 감소(수주 -> 수일).
- 결과: 다국어 Hit Rate를 한국어 대비 90%+ 수준으로 유지.
- 임팩트: 인력 제약 환경에서도 글로벌 확장 가능한 구조 확보.

### 문제
기존 구조를 언어별로 복제하면 FAQ, 임베딩 모델, 프롬프트, 검색 최적화를 모두 언어별로 유지해야 해서 AI 1인 체계에서 확장이 어려웠다.

### 해결
고정형 파이프라인을 Agentic RAG 구조로 재설계해 LLM Agent가 검색 전략과 도구 호출을 동적으로 수행하도록 전환했다. 언어별 파이프라인 N개를 유지하는 대신 단일 구조를 운영하고 언어별 FAQ 문서만 관리하는 방식으로 바꿨다.

### 성과
신규 언어 추가 공수를 수주 단위에서 수일 단위로 줄여 약 80% 감소시켰다. 다국어 Hit Rate도 한국어 대비 90% 이상 수준을 유지했다.

관련 문서:
- [[Career/Project/Chatbot/글로벌 확장 - Agentic RAG|글로벌 확장 - Agentic RAG]]

---

## 점 추정 한계를 Quantile Regression + CQR 기반 예측구간 문제로 재정의해 임상 의사결정 지표와 사용자 신뢰도를 함께 개선

`키워드`: Quantile Regression, Conformal Prediction, Uncertainty, Product Metric, Decision Support

### 아키텍처 (삽입 예정)
- 위치: Point Estimation -> Prediction Interval(CQR) 전환 구조도
- 포함 요소: Feature Pipeline -> Quantile Model -> Calibration Set -> Conformal Interval -> UI Probability

### 면접관 스캔용 요약 (9줄)
- 문제: 점 추정 기반 모델이 MAE/R2 개선 한계에 도달했고 누락 변수로 불확실성이 컸음.
- 제약: 관측 불가능한 요인(렌즈 정보 부정확성)으로 단일값 정확도만으로 의사결정 지원이 어려움.
- 접근: "정확한 값 예측"에서 "신뢰 가능한 범위 제공"으로 문제를 재정의.
- 구현: Quantile Regression으로 분위수 예측, CQR로 목표 신뢰수준 보정.
- 구현: 평가지표를 MAE 중심에서 Coverage/Interval Width로 확장.
- 구현: 예측 결과를 확률 표현으로 바꿔 임상가가 리스크를 해석 가능하게 설계.
- 결과: Vault 안정 비율 73% -> 83%(+10%p) 개선.
- 결과: 사용자 신뢰도 2.8 -> 4.2(+50%) 향상.
- 임팩트: 도메인 특화 문제를 범용적 "불확실성 기반 의사결정" 프레임으로 전환.

### 문제
점 추정 기반 모델은 MAE 110, R2 0.4 수준에서 개선 한계에 도달했다. 핵심 변수인 렌즈 정보가 데이터에서 누락/오기입되어 단일 예측값을 그대로 의사결정에 쓰기 어려운 상황이었다.

### 해결
문제를 점 추정에서 예측구간 추정으로 재정의했다. Quantile Regression으로 분위수를 추정하고 CQR(Conformalized Quantile Regression)로 Calibration 보정을 적용해 신뢰수준을 만족하는 구간을 제공했다. 동시에 평가 프레임도 MAE 중심에서 Coverage/Interval Width 및 사용자 활용성 지표로 확장했다.

### 성과
도입 전후 비교에서 Vault 안정 비율이 73%에서 83%로 10%p 개선되었고, 현장 사용자 신뢰도는 2.8에서 4.2로 50% 향상되었다. 이 경험은 도메인 의존적인 의료 문제를 불확실성 정량화 기반의 범용 엔지니어링 역량으로 전환한 사례다.

관련 문서:
- [[Career/Project/LensSizing/프로젝트 설명|렌즈 사이징 프로젝트 설명]]
- [[Career/Project/LensSizing/Quantile Regression 및 CQR 파이프라인|Quantile Regression 및 CQR 파이프라인]]
- [[Career/Project/LensSizing/비즈니스 지표 , 수술 안정성 향상|수술 안정성 향상]]
- [[Career/Project/LensSizing/만족도 개선 인터뷰|사용자 만족도 개선 인터뷰]]
