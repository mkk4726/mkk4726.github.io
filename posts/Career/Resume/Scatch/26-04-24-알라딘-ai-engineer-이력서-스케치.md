---
title: "알라딘 AI Engineer 이력서 스케치"
date: 2026-04-24
excerpt: "알라딘 AI Engineer 포지션 지원용 이력서 초안"
category: "Career"
tags:
  - "Resume"
  - "Aladin"
  - "AI Engineer"
  - "Draft"
Done: false
---

[[Career/JD/알라딘 커뮤니케이션|알라딘 커뮤니케이션]]


# 이력서 초안 (알라딘 - AI Engineer)

## 포지션 핏 한 줄
- OCR/비전 인식, LLM QA/RAG, 서빙/모니터링까지 실제 운영에서 성과를 낸 AI 엔지니어 포지셔닝.

## 상단 소개 문구 (이력서 Summary 초안)
헬스케어 도메인에서 OCR/ML/LLM 기반 서비스를 End-to-End로 설계·구축·운영해 온 데이터 사이언티스트입니다. 고정 레이아웃 문서 OCR 파이프라인 고도화, 검색 정확도 중심 RAG 개선, 운영 자동화 및 모니터링 체계 구축을 통해 정확도와 응답속도, 운영 효율을 함께 개선해왔습니다. 모델 성능뿐 아니라 성능-비용-운영 트레이드오프를 함께 고려해 실제 서비스에서 지속 가능한 AI 시스템을 만드는 데 강점이 있습니다.

## 경력 기술 초안 (알라딘 JD 매핑)
### OCR 기반 검사결과 자동화 (AI 1인, 2025.03 ~ 2025.06)
- 검사장비 이미지(6종, 40~50대) 실시간 수집 -> OCR 추론 -> DB 적재까지 End-to-End 파이프라인 설계/구현.
- 기존 절차지향 레거시를 OOP 구조로 재설계하고 비동기 처리 도입으로 평균 응답속도 5초 -> 1초 개선.
- 도메인 특성(고정 레이아웃)을 활용해 Text Detection을 룰 기반으로 단순화하고 Text Recognition은 TrOCR 기반으로 고도화.
- 평가 데이터셋 부재 상황에서 검증셋 200건 직접 구축, Character-level Accuracy 100% 달성.
- Triton Inference Server 기반 온프레미스 서빙(동적 배치, 동시성 처리)으로 다중 장비 요청 안정 운영.
- 이미지 전송 클라이언트-서버-TrOCR 서빙 3개 프로그램 연결 안정화를 위해 입력 검증, 모니터링, 테스트 체계를 구축하고 에러 케이스를 단계별(수신/인식/후처리)로 분해해 개선.
- pytest + mypy 검증 체계를 CI에 통합해 런타임 오류를 사전 차단하고 운영 안정성 강화.

### 고객상담 챗봇 개발 (AI 1인, 2024.11 ~ 2025.02)
- FAQ 기반 RAG 파이프라인을 설계해 반복 상담 업무 40% 자동화.
- Query Rewriting/Decomposition/Keyword Extraction + 임베딩 평가 체계로 검색 Hit Rate 70% 향상(40~50 -> 90~100).
- LLM 분류 기반 전처리 단계 도입으로 불필요한 생성 호출을 줄여 평균 응답시간 30% 단축, 불만족도 80% 이상 감소.
- RAGAS 기반 커스텀 지표(Faithfulness, Context Sufficiency)와 Airflow 배치, Slack 알림을 결합해 모니터링 30분 -> 5분 단축.

### 고객상담 챗봇 글로벌 확장 (AI 1인, 2025.08 ~ 2025.11)
- 한국어 특화 고정 파이프라인의 다국어 한계를 Agentic RAG 구조로 전환.
- 언어별 N개 파이프라인 운영 대신 단일 Agentic 구조로 통합해 신규 언어 추가 공수 약 80% 감소.
- 다국어 답변 품질을 한국어 대비 90% 이상 수준으로 유지하며 유지보수 비용 구조 개선.

### 렌즈 사이징 보조 AI 서비스 (AI 2인, 2025.11 ~ 현재) - 역량 보완 프로젝트
- 점 추정 모델의 한계(MAE plateau, 누락 변수)를 분석하고 Quantile Regression + CQR 기반 예측구간 파이프라인으로 문제를 재정의.
- 모델 지표(MAE) 중심 평가를 Coverage/Interval Width와 사용자 의사결정 지표로 확장해 "정확도"를 "활용 가능성"으로 연결.
- 서비스 도입 전후 비교에서 Vault 안정 비율 73% -> 83%(+10%p), 사용자 신뢰도 2.8 -> 4.2(+50%)를 확인.

## 알라딘 지원 시 강조 포인트
- OCR/Recognition 실서비스 운영 경험: 데이터셋 구축, 모델 선택, 서빙, 에러 분석, 품질 개선 루프까지 직접 수행.
- 비전 결과를 실제 업무 흐름에 연결한 경험: OCR 결과를 단순 출력이 아닌 DB 적재/다운스트림 활용 가능한 형태로 구조화.
- LLM QA/RAG 실험 및 운영 경험: 검색 누락 해결, 응답 지연 개선, 모니터링 자동화까지 포함한 운영형 경험.
- 성능-비용-운영 트레이드오프: 불필요한 복잡도를 줄이는 설계(룰 기반 Detection, 호출 분기)로 성능과 운영성 동시 확보.

## 기술 스택 강조
- Python, PyTorch, OpenCV, TrOCR
- FastAPI, Docker, Triton Inference Server, Redis, Qdrant
- Airflow, Google Spreadsheet, Slack, pytest, mypy

## 자기소개서/면접에서 쓸 한 문장
OCR과 LLM을 각각의 모델 성능 문제로 보지 않고, 운영 지표 중심의 하나의 파이프라인 문제로 재정의해 정확도, 응답속도, 유지보수성까지 함께 개선해 왔습니다.

## Portfolio
- 검사장비 이미지 수집부터 OCR 추론, DB 적재까지 End-to-End 파이프라인을 구축해 데이터 확인 시간을 95% 단축(20초 -> 1초/건).
- 고정 레이아웃 특성을 활용해 Detection을 룰 기반으로 단순화하고 TrOCR를 고도화해 검증셋 200건 기준 Character-level Accuracy 100%를 달성.
- Query Rewriting/Decomposition/Keyword Extraction과 임베딩 평가 체계를 도입해 RAG 검색 Hit Rate를 70% 향상(40~50 -> 90~100).
- 질문 분류 단계를 앞단에 추가해 불필요한 LLM 호출을 줄이고 평균 응답시간 30% 단축, 불만족도 80% 이상 감소.
- RAGAS 기반 자동 평가와 Airflow 배치 모니터링을 구축해 대화 로그 검토 시간을 83% 단축(30분 -> 5분).
- 한국어 특화 파이프라인을 Agentic RAG 단일 구조로 전환해 신규 언어 추가 공수를 약 80% 감소.
- 점 추정 한계를 Quantile Regression + CQR 기반 예측구간 문제로 재정의해 임상 의사결정 지표와 사용자 신뢰도를 함께 개선.
- 이미지 전송 클라이언트-서버-TrOCR 서빙 연결 구간을 디버깅하며 입력 검증, 모니터링, 테스트 코드로 운영 장애 리스크를 줄이고 응답 일관성을 개선.

자세한 내용: [[Career/Portfolio/Scatch/26-04-24-알라딘-ai-engineer-portfolio-초안|알라딘 AI Engineer 포트폴리오 초안]]
