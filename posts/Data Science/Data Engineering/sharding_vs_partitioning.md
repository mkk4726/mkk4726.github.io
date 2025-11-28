---
title: "sharding vs partitioning"
date: "2025-08-05"
excerpt: "DB관리할 때 sharding과 partitioning의 차이에 대한 개념 정리"
category: "Data Science"
tags: ["DataBase"]
---

참고한 글

[링크드인 게시물 - Ashish Pratap Singh](https://www.linkedin.com/posts/ashishps1_sharding-vs-partitioning-whats-the-difference-activity-7344586520755912704-M_pm/?utm_source=share&utm_medium=member_android&rcm=ACoAADafY9YBl0pYjiYslOSavtyIuLdy1Q7QDOo)


<figure>
  <img src="./images/sharding_vs_partitioning.gif" alt="Sharding vs Partitioning 차이점" />
  <figcaption>Sharding vs Partitioning</figcaption>
</figure>


| 구분 | Partitioning | Sharding |
|------|-------------|----------|
| **범위** | 단일 서버 내 | 여러 서버 간 |
| **목적** | 성능 최적화 | 수평적 확장 |
| **복잡도** | 상대적으로 단순 | 복잡한 분산 시스템 |
| **사용 시기** | 단일 머신 내 최적화 | 단일 머신 한계 초과 시 |

# 1. Partitioning이란?

> 하나의 큰 테이블을 더 작은 청크(파티션)로 나누는 것

- 목적: 성능 향상과 유지보수 단순화
- 특징:
    - **논리적으로는 하나의 테이블**: 개발자가 쿼리할 때는 마치 하나의 테이블처럼 사용 (파티션을 신경 쓸 필요 없음)
    - **물리적으로는 여러 파일로 분산**: 실제로는 각 파티션이 별도의 파일/세그먼트로 저장됨
    - 쿼리 성능 향상 (특정 파티션만 스캔)
    - 데이터 관리 용이성 (오래된 파티션 삭제 등)

```sql
-- 파티셔닝된 테이블을 조회할 때
SELECT * FROM logs WHERE log_date >= '2024-01-01';

-- 개발자는 마치 하나의 테이블을 조회하는 것처럼 사용
-- 하지만 DB 엔진은 내부적으로 2024년 파티션만 스캔함
```

파티셔닝은 대부분의 현대적인 DBMS에서 지원하는 기능

- 지원하는 DBMS
  - **MySQL**: Range, List, Hash, Key 파티셔닝 지원
  - **PostgreSQL**: Range, List, Hash 파티셔닝 지원
  - **Oracle**: Range, List, Hash, Composite 파티셔닝 지원
  - **SQL Server**: Range, List, Hash 파티셔닝 지원
  - **BigQuery**: Date, Integer Range 파티셔닝 지원
  - **Snowflake**: 다양한 파티셔닝 전략 지원

- 지원하지 않는 DBMS
  - **SQLite**: 기본적으로 파티셔닝 미지원
  - **일부 NoSQL DB**: 파티셔닝 대신 샤딩 개념 사용


MySQL 파티셔닝 예시

```sql
-- 월별 Range 파티셔닝
CREATE TABLE logs (
    id INT,
    log_date DATE,
    message TEXT
) PARTITION BY RANGE (YEAR(log_date) * 100 + MONTH(log_date)) (
    PARTITION p202401 VALUES LESS THAN (202402),
    PARTITION p202402 VALUES LESS THAN (202403),
    PARTITION p202403 VALUES LESS THAN (202404),
    PARTITION p_future VALUES LESS THAN MAXVALUE
);
```

# 2. Sharding이란?

> 데이터를 여러 데이터베이스 서버에 분산 배치

- 목적: 수평적 확장(horizontal scaling)을 통한 대용량 처리
- 특징:
    - 각 서버(샤드)가 전체 데이터셋의 일부를 보유
    - 단일 머신의 한계를 넘어서는 확장성 제공
    - 복잡한 분산 시스템 관리 필요


예시

```sql
-- 샤딩된 환경에서 사용자 조회
-- 사용자 ID를 4로 나눈 나머지로 샤드 결정
shard_number = user_id % 4

-- 사용자 ID가 123인 경우: 123 % 4 = 3 → shard_3에서 조회
SELECT * FROM users WHERE user_id = 123;
-- 실제로는 shard_3 서버에서 실행됨
```


## 수평적 확장(Horizontal Scaling)이란?

> 수평적 확장은 "더 많은 서버를 추가"하는 방식으로 시스템을 확장하는 것을 의미

### 수직적 확장 vs 수평적 확장

| 구분 | 수직적 확장 (Vertical Scaling) | 수평적 확장 (Horizontal Scaling) |
|------|-------------------------------|----------------------------------|
| **방식** | 기존 서버의 성능을 향상 | 새로운 서버를 추가 |
| **예시** | CPU 4코어 → 16코어, RAM 8GB → 64GB | 서버 1대 → 서버 10대 |
| **장점** | 구현이 단순 | 무제한 확장 가능 |
| **단점** | 물리적 한계 존재, 비용 증가 | 복잡한 분산 시스템 관리 필요 |

### 샤딩에서의 수평적 확장

```
초기 상태: 서버 1대 (모든 데이터 보유)
├── 사용자 1~1000
├── 사용자 1001~2000
└── 사용자 2001~3000

샤딩 후: 서버 3대 (데이터 분산)
├── 서버1: 사용자 1~1000
├── 서버2: 사용자 1001~2000
└── 서버3: 사용자 2001~3000

더 많은 사용자가 늘어나면:
├── 서버1: 사용자 1~1000
├── 서버2: 사용자 1001~2000
├── 서버3: 사용자 2001~3000
├── 서버4: 사용자 3001~4000  ← 새로 추가
└── 서버5: 사용자 4001~5000  ← 새로 추가
```

### RDBMS
- **MySQL**: ProxySQL, MySQL Router 등 미들웨어 필요
- **PostgreSQL**: 기본 버전은 샤딩 미지원
- **Oracle**: RAC는 있지만 샤딩과는 다름
- **SQL Server**: 기본 버전은 샤딩 미지원


# 3. 샤딩 구현 방법

샤딩은 DBMS에서 직접 지원하는 경우가 적어서, 다양한 방법으로 구현해야 합니다.

## 3.1 DBMS별 샤딩 지원 현황

### 내장 샤딩 지원 DBMS
- **MongoDB**: 자동 샤딩 지원 (shard key 기반)
- **Cassandra**: 파티션 키 기반 샤딩
- **Redis Cluster**: 해시 슬롯 기반 샤딩
- **Elasticsearch**: 인덱스 기반 샤딩

### 샤딩 미지원 DBMS (수동 구현 필요)
- **MySQL**: ProxySQL, MySQL Router 등 미들웨어 필요
- **PostgreSQL**: 기본 버전은 샤딩 미지원 (Citus 확장으로 가능)
- **Oracle**: RAC는 있지만 샤딩과는 다름
- **SQL Server**: 기본 버전은 샤딩 미지원

## 3.2 샤딩 구현 방식

### 1. 애플리케이션 레벨 샤딩
- **개념**: 개발자가 직접 애플리케이션 코드에서 샤딩 로직을 구현
- **방식**: 사용자 ID나 다른 키를 기반으로 어떤 샤드에 접근할지 결정
- **장점**: 완전한 제어 가능, 세밀한 튜닝 가능
- **단점**: 개발 복잡도 증가, 유지보수 부담

### 2. 미들웨어를 통한 샤딩
- **개념**: 데이터베이스와 애플리케이션 사이에 중간 계층을 두어 샤딩 처리
- **방식**: 쿼리를 받아서 적절한 샤드로 라우팅
- **장점**: 애플리케이션 코드 변경 최소화, 전문적인 샤딩 관리
- **단점**: 추가적인 인프라 복잡도, 성능 오버헤드

### 3. 클라우드 서비스 활용
- **개념**: 클라우드 제공업체가 관리하는 샤딩 서비스 사용
- **방식**: 설정만으로 자동 샤딩 구성
- **장점**: 관리 부담 최소화, 자동 확장
- **단점**: 벤더 종속성, 비용 증가

## 3.3 샤딩 전략

### Hash 기반 샤딩
- **개념**: 데이터의 해시값을 기반으로 샤드 결정
- **특징**: 데이터가 균등하게 분산됨
- **예시**: 사용자 ID를 해시해서 샤드 번호 결정

### Range 기반 샤딩
- **개념**: 데이터의 범위를 기반으로 샤드 결정
- **특징**: 범위 쿼리 성능이 좋음
- **예시**: 날짜별, ID 범위별로 샤드 할당

### Directory 기반 샤딩
- **개념**: 매핑 테이블을 사용해서 샤드 결정
- **특징**: 유연한 샤드 할당 가능
- **예시**: 특정 사용자를 특정 샤드에 고정 배치

## 3.4 샤딩 시 고려사항

### 장점
- 무제한 수평적 확장 가능
- 각 샤드별 독립적인 성능 최적화
- 장애 격리 (한 샤드 장애가 전체에 영향 없음)

### 단점
- 복잡한 분산 시스템 관리
- 크로스 샤드 쿼리의 성능 이슈
- 데이터 일관성 보장의 어려움
- 트랜잭션 관리의 복잡성
