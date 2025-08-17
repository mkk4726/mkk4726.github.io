---
title: "OCR Pipeline System"
description: "문서 이미지에서 텍스트를 추출하는 자동화된 OCR 파이프라인"
technologies: ["Python", "OCR", "Computer Vision", "Docker", "gRPC"]
github: "https://github.com/mkk4726/ocr-pipeline"
demo: "https://ocr-pipeline-demo.example.com"
date: "2024-10-20"
---

# 정의했던 문제들, 해결하는 과정, 해결한 결과

## DB insert error (deadlock)

```text
bnviit-ocr-server
앱  오전 9:51
[ERROR] pentacam_4_2025-08-09 09:51:50 : Fail to insert ocr result to database, Error message : Traceback (most recent call last):
  File "/app/assets/ocr/models.py", line 202, in insert_database
    cursor.execute(query)
pyodbc.ProgrammingError: ('42000', '[42000] [FreeTDS][SQL Server]Transaction (Process ID 727) was deadlocked on lock | communication buffer resources with another process and has been chosen as the deadlock victim. Rerun the transaction. (1205) (SQLExecDirectW)')
, Status : None
```

한번씩 이런 문제가 발생한다. 무슨 문제지?

**GPT 설명**
> 메시지의 핵심은 “Transaction (Process ID 727) was deadlocked … and has been chosen as the deadlock victim” 으로, 동시에 실행 중인 두(또는 그 이상) 트랜잭션이 서로가 보유한 리소스를 기다리며 교착 상태에 빠졌고, SQL Server가 그 중 하나(네 트랜잭션)를 희생(victim) 으로 골라 롤백했다는 뜻이야. 그래서 간헐적으로 실패가 나고, 보통 재실행하면 성공해. 
> 메시지에 보이는 lock | communication buffer는 뭘 의미하나?
> - lock은 우리가 익숙한 테이블/인덱스/키 락 같은 일반 잠금을 뜻하고,
> - communication buffer는 병렬 실행(Parallelism) 때 스레드 간 데이터를 주고받는 익스체인지(exchange) 버퍼 같은 내부 통신 자원을 뜻해. 드물지만 병렬 계획에서 이 자원 때문에 데드락이 날 수 있어. 
> 
> 정리: 네 에러는 “일반 잠금(lock)” 혹은 “병렬 통신 버퍼(communication buffer)” 수준에서 다른 세션과 데드락이 났고, 그 결과 1205로 실패했다는 의미.


**코드에서 발견한 문제점**

INSERT가 동시에 실행될 때 deadlock이 발생할 수 있음

- 공통 베이스: `assets/ocr/models.py` (스택트레이스와 일치)
```173:213:assets/ocr/models.py
    def insert_database(
        self, logger: logging.Logger, db_name: str, data_object: BaseDataBinocular | BaseDataMonocular, server_info: ServerInfo
    ) -> FuncResult[str]:
        try:
            conn = get_conn(db_info=server_info.crm_db_info, deploy_env=server_info.deploy_env)
            cursor = conn.cursor()
            cust_num = data_object.CUST_NUM["ocr_value"]
            exam_date = data_object.Exam_Date["ocr_value"]
            # cust_num, exam_date가 이미 있으면 update, 아니면 insert
            cursor.execute(self.select_query(cust_num, exam_date, db_name))
            rows = cursor.fetchall()
            if len(rows) == 0:
                keys, values = data_object.get_insert_key_value()
                query = self.insert_query(keys, values, db_name)
            else:
                keys, values = data_object.get_update_key_value()
                set_query = ",".join([f"{key} = {value}" for key, value in zip(keys, values)])
                query = self.update_query(set_query, cust_num, exam_date, db_name)
            logger.info(f"Query : {query}")
            cursor.execute(query)
            conn.close()
```

- 두 워커가 **거의 동시에** 실행되지는 예시

```
시간축: 0ms    1ms    2ms    3ms    4ms
워커A:  SELECT → INSERT 시작 → 고유인덱스 잠금 획득 → 클러스터인덱스 잠금 대기
워커B:         SELECT → INSERT 시작 → 클러스터인덱스 잠금 획득 → 고유인덱스 잠금 대기
```

- **SQL Server의 내부 처리 방식 :**

SQL Server는 INSERT 작업을 처리할 때 **여러 단계**로 나누어 처리합니다:

**내부 처리 과정:**
1. **고유성 검증**: 고유 인덱스에 중복 값이 있는지 확인
2. **공간 할당**: 클러스터 인덱스에서 실제 데이터 페이지 할당
3. **데이터 삽입**: 실제 데이터를 페이지에 기록

- **잠금 획득 순서의 차이**

**워커 A의 경우:**
- 고유 인덱스 잠금을 먼저 획득 (중복 검사)
- 클러스터 인덱스 잠금을 기다림 (데이터 페이지 할당)

**워커 B의 경우:**
- 클러스터 인덱스 잠금을 먼저 획득 (데이터 페이지 할당)
- 고유 인덱스 잠금을 기다림 (중복 검사)

- **실제 예시로 설명**

```sql
-- 워커 A: 고유 인덱스 먼저 잠금
BEGIN TRANSACTION;
-- 1. 고유 인덱스 잠금 획득 (중복 검사)
-- 2. 클러스터 인덱스 잠금 대기 (데이터 페이지 할당)
INSERT INTO PENTACAM_DATA (CUST_NUM, Exam_Date, ...) VALUES ('1234', '20240820', ...);
COMMIT;

-- 워커 B: 클러스터 인덱스 먼저 잠금 (동시 실행)
BEGIN TRANSACTION;
-- 1. 클러스터 인덱스 잠금 획득 (데이터 페이지 할당)
-- 2. 고유 인덱스 잠금 대기 (중복 검사)
INSERT INTO PENTACAM_DATA (CUST_NUM, Exam_Date, ...) VALUES ('1234', '20240820', ...);
COMMIT;
```

- **왜 이런 순서가 발생하는가?**

SQL Server의 **쿼리 최적화기(Query Optimizer)**가 각 INSERT 작업의 실행 계획을 **독립적으로** 결정하기 때문입니다:

- **워커 A**: 고유성 검증을 우선적으로 처리
- **워커 B**: 데이터 페이지 할당을 우선적으로 처리

이렇게 **서로 다른 실행 경로**를 택하면서 **서로 다른 잠금 순서**로 진행되어 Deadlock이 발생하는 것입니다.





# 프로젝트 설명

## 프로젝트 개요
병원 검사 결과 이미지에서 실시간으로 데이터를 추출하여 DB에 자동 적재하는 OCR 파이프라인 시스템을 구축했습니다. 기존 수작업으로 진행되던 데이터 입력 과정을 자동화하여 검안사의 업무 효율성을 크게 향상시켰습니다.

## 주요 기능
- **실시간 OCR 처리**: 검사 완료 즉시 이미지에서 데이터 추출
- **고정 이미지 최적화**: 검사 장비별 고정된 이미지 구조 활용
- **다중 OCR 엔진**: TrOCR 기반 고정밀 텍스트 인식
- **데이터 품질 자동화**: 분포 분석 및 이상치 탐지 자동화 시스템
- **일관성 검증**: 고객번호 등 고정값들의 무결성 검증
- **자동 모니터링**: Slack 기반 실시간 에러 알림 및 작업 요약
- **안정적 파이프라인**: 1% 미만 에러율의 안정적인 서비스 운영

## 기술 스택
- **OCR Engine**: TrOCR (Microsoft)
- **Image Processing**: OpenCV, PIL
- **Backend**: Python, gRPC, FastAPI
- **Model Serving**: Triton Server
- **Containerization**: Docker
- **Monitoring**: Slack API
- **Database**: PostgreSQL

## 핵심 기술적 도전과 해결책

### 1. OCR 정확도 99% 달성
**문제**: 검사 결과의 정확성이 매우 중요하므로 높은 OCR 정확도 필요

**해결책**:
- **고정 이미지 구조 활용**: 검사 장비별 고정된 이미지 레이아웃을 활용하여 Text Detection 단계 생략
- **TrOCR 모델 적용**: Text Recognition에 특화된 TrOCR 모델 사용으로 정확도 향상
- **이미지 전처리**: 노이즈 제거, 대비 개선 등 전처리 과정 최적화
- **결과 후처리**: OCR 결과 정제 및 검증 로직 구현
- **데이터 품질 자동화**: 각 값의 분포 분석 및 이상치 탐지 자동화 시스템 구축
- **일관성 검증**: 고객번호 등 고정값들의 일관성 검증 로직 개발

**결과**: OCR 정확도 99% 달성

### 2. 안정적인 파이프라인 구축
**문제**: 실시간 데이터 추출을 위한 안정적인 서비스 운영 필요

**해결책**:
- **객체 지향 설계**: 각 기능을 담당하는 객체들로 파이프라인 구성
- **단계별 에러 처리**: 이미지 송수신, 전처리, OCR, 후처리, DB 적재 각 단계별 명확한 에러 처리
- **비동기 처리**: 1초 이내 응답을 위한 비동기 처리 구조 구현
- **자동 모니터링**: 각 객체별 모니터링 자동화

**결과**: 에러율 1% 미만의 안정적인 파이프라인 구축

### 3. 기존 프로세스 방해 최소화
**문제**: 검안사의 기존 업무 프로세스에 변화를 주지 않으면서 OCR 서비스 추가

**해결책**:
- **Client-Server 구조**: 병원 컴퓨터의 client가 이미지를 전송 후 기존 "아이리더" 프로그램에 자동 적재
- **gRPC 통신**: 빠른 이미지 전송을 위한 gRPC 프로토콜 사용
- **권한 문제 해결**: 다양한 병원 환경에 맞는 배포 방식 (Python/Go)
- **응답 속도 최적화**: 1초 이내 응답으로 기존 프로세스 지연 최소화

**결과**: 기존 프로세스에 방해 없이 OCR 서비스 성공적 통합

## 시스템 아키텍처

### Client 프로그램
- **목적**: 기존 프로세스 방해 없이 OCR 서버로 이미지 전송
- **기술**: gRPC를 통한 고속 이미지 전송
- **환경 대응**: 다양한 병원 컴퓨터 환경에 맞는 배포 (Python/Go)
- **자동화**: 이미지 전송 후 기존 "아이리더" 프로그램에 자동 적재

### OCR Server
- **비동기 처리**: 이미지 수신 즉시 응답 후 백그라운드에서 OCR 처리
- **모델 서빙**: Triton Server를 통한 TrOCR 모델 고성능 서빙
- **GPU 활용**: 온프레미스 GPU 서버를 통한 고속 추론
- **고정 이미지 처리**: 검사 장비별 pixel 기반 조건문으로 Text Detection 생략

### 모니터링 시스템
- **Slack 알림**: 에러 발생 시 실시간 알림
- **작업 요약**: 하루 작업량 및 성공률 자동 보고
- **객체별 모니터링**: 각 기능별 독립적인 모니터링
- **로그 관리**: 깔끔한 로그 구조로 쉬운 문제 진단

## 핵심 최적화 포인트

### 1. Text Detection 생략
검사 결과 이미지가 고정된 구조를 가지고 있다는 특성을 활용:
- 검사 장비별 이미지 버전 및 페이지 구분
- Pixel 값 기반 조건문으로 영역 분할
- Text Recognition 단계에만 집중하여 처리 속도 향상

### 2. TrOCR 모델 선택
다양한 OCR 모델 비교 후 TrOCR 선택:
- **정확도**: 벤치마크에서 98% 정확도
- **실제 성능**: 숫자 인식 100% 정확도
- **한국어 지원**: 문자 인식은 단위 정보로 고정 위치 활용

### 3. 비동기 처리 구조
사용자 경험을 위한 응답 속도 최적화:
- 이미지 수신 즉시 응답 (1초 이내)
- 백그라운드에서 OCR 처리
- 상담 시점까지 충분한 처리 시간 확보

## 결과 및 성과
- **OCR 정확도**: 99% 달성
- **에러율**: 1% 미만의 안정적인 파이프라인 구축
- **처리 속도**: 1초 이내 응답으로 기존 프로세스 지연 최소화
- **유지보수 효율**: 코드 구조 개선으로 유지보수 효율 10배 증가
- **모니터링 비용**: 자동화를 통한 모니터링 시간 90% 감소

## 학습한 점
- 고정 이미지 구조를 활용한 OCR 최적화 방법
- 실시간 데이터 처리 파이프라인의 안정성 확보 방법
- 기존 프로세스와의 통합 시 사용자 경험 고려의 중요성
- 객체 지향 설계를 통한 유지보수성 향상
- 자동화된 모니터링 시스템의 구축 및 운영 방법