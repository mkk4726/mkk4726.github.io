---
title: "링크드인에서 공유된 Data Pipeline 구조 정리"
date: "2025-08-05"
excerpt: "링크드인에서 공유된 Data Pipeline 참고해서 그림 그려보고, 이해하는 과정"
category: "Data Science"
tags: ["Data Pipeline"]
---

참고한 글
- [링크드인 - Aurimas Griclunas](https://www.linkedin.com/posts/aurimas-griciunas_ai-machinelearning-dataengineering-activity-7355922071824011264-xe3s/?utm_source=share&utm_medium=member_android&rcm=ACoAADafY9YBl0pYjiYslOSavtyIuLdy1Q7QDOo)

<figure>
  <img src="/post/DataScience/Datapipeline_linkedin.gif" alt="Data Pipeline LinkedIn" />
  <figcaption>Data Pipeline LinkedIn</figcaption>
</figure>

# 원본 글 정리

## ML 시스템의 Data Pipeline 구조

ML 시스템에서 **Data Quality와 Integrity**를 보장하는 것은 매우 중요합니다. 특히 ML Training 및 Inference Pipeline의 upstream에서 이를 확보해야 하며, downstream 시스템에서 이를 시도하면 대규모 작업 시 불가피한 실패를 야기할 수 있습니다.

Data Lake 또는 LakeHouse layer에서 수행해야 할 작업이 많습니다. 아래는 production-grade end-to-end data flow의 예시 아키텍처입니다.

## Data Flow 단계별 설명

### 1. Schema 관리
- Schema changes는 version control에서 구현
- 승인 후 Applications, Databases, 중앙 Data Contract Registry에 푸시
- Applications는 생성된 Data를 Kafka Topics로 전송

### 2. Data 수집
- **2단계**: Application Services에서 직접 발생하는 Events
  - IoT Fleets 및 Website Activity Tracking 포함
- **2.1단계**: CDC streams을 위한 Raw Data Topics

### 3. Data 검증 및 처리
- **3단계**: Flink Application(s)이 Raw Data streams을 소비하고 Contract Registry의 schemas에 대해 검증
- **4단계**: contract를 충족하지 않는 Data는 Dead Letter Topic으로 전송
- **5단계**: contract를 충족하는 Data는 Validated Data Topic으로 전송
- **6단계**: Validated Data Topic의 Data는 추가 Validation을 위해 object storage로 전송

### 4. Data Warehouse 및 변환
- **7단계**: Object Storage의 Data는 schedule에 따라 Data Contracts의 추가 SLAs에 대해 검증되고, analytical purposes를 위해 transformed 및 modeled되어 Data Warehouse로 전송

### 5. Feature Store 및 ML Pipeline
- **8단계**: Modeled 및 Curated data는 추가 Feature Engineering을 위해 Feature Store System으로 전송
- **8.1단계**: Real Time Features는 Validated Data Topic(5단계)에서 직접 Feature Store로 ingested
  - SLA checks가 어려워 Data Quality 보장이 복잡함
- **9단계**: High Quality Data는 ML Training Pipelines에서 사용
- **10단계**: 동일한 Data는 Inference에서 Feature Serving에 사용

## 주의사항

ML Systems는 Data Drift와 Concept Drift와 같은 다른 Data 관련 문제로 고통받습니다. 이는 silent failures이며 monitoring할 수 있지만 Data Contract에 포함할 수 없습니다.

---

*이 구조는 LLM 기반 시스템에서도 사용할 수 있습니다.*



# CDC streams?

> CDC(Change Data Capture) Stream은 데이터베이스의 변경사항(INSERT, UPDATE, DELETE)을 실시간으로 감지하고 스트리밍하는 기술입니다.


데이터 동기화에 사용되는 개념?
- [실시간 데이터 동기화 아키텍처: Kafka & CDC 기반 설계 경험](https://velog.io/@isntkyu/AWS-DMS-%EB%B3%80%EA%B2%BD-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%BA%A1%EC%B2%98CDC%EC%99%80-Kafka%EB%A5%BC-%ED%99%9C%EC%9A%A9%ED%95%9C-%EC%8B%A4%EC%8B%9C%EA%B0%84-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%8A%A4%ED%8A%B8%EB%A6%AC%EB%B0%8D-%EC%95%84%ED%82%A4%ED%85%8D%EC%B2%98-%EC%84%A4%EA%B3%84)



# Kafka?

> Apache Kafka는 고성능 분산 스트리밍 플랫폼입니다. 실시간 데이터 파이프라인과 스트리밍 애플리케이션을 구축하기 위한 오픈소스 플랫폼입니다.


핵심 개념:
- Producer: 데이터를 Kafka로 전송하는 애플리케이션
- Consumer: Kafka에서 데이터를 읽어가는 애플리케이션
- Topic: 데이터가 저장되는 카테고리 (메시지 큐와 유사)
- Broker: Kafka 서버 (클러스터로 구성)
- Partition: Topic을 여러 개로 나눈 단위 (병렬 처리)


