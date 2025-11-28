---
title: "데이터 엔지니어링 기초"
date: "2025-07-28"
excerpt: "데이터 엔지니어링 기초"
category: "Engineering"
tags: ["MLOps", "System Design", "Designing Machine Learning Systems"]
---

> 프로덕션용 ML 시스템을 구축하려면 증가하는 데이터를 수집, 처리, 저장, 검색 및 처리하는 방벙ㅂ을 숙지해야 합니다.


> 시스템 관점의 데이터 엔지니어링을 더 자세히 알고 싶다면 마틴 클레프만의 "데이터 중심 애플리케이션 설계"를 읽어보기 바랍니다.

[데이터 중심 애플리케이션 설계](https://www.yes24.com/Product/Goods/59566585?pid=123487&cosemkid=go16406746660905354&utm_source=google_pc&utm_medium=cpc&utm_campaign=book_pc&utm_content=ys_240530_google_pc_cc_book_pc_12110%EB%8F%84%EC%84%9C2&utm_term=%EB%8D%B0%EC%9D%B4%ED%84%B0%EC%A4%91%EC%8B%AC%EC%95%A0%ED%94%8C%EB%A6%AC%EC%BC%80%EC%9D%B4%EC%85%98%EC%84%A4%EA%B3%84&gad_source=1&gad_campaignid=6762605740&gbraid=0AAAAAD79IrrCY3fi_PAlBFJx-I4dljLTE&gclid=Cj0KCQjwnJfEBhCzARIsAIMtfKLstWy3tDioWDUb09s9awYiLSzJGNye21AVOyIieRL-XkSoFprvOQYaArFnEALw_wcB)

# 데이터 소스
---

> ML 시스템은 다양한 소스에서 온 데이터로 작동합니다.
> 데이터마다 특성, 목적, 처리 방법이 다르며 데이터 소스를 파악하면 데이터를 보다 효율적으로 사용하는데 도움이 됩니다.

- user input data
- system-generated data



# 데이터 포맷
---

- JSON
- CSV (행 우선)
- Parquet (열 우선)

행 우선인 데이터에 행으로 접근하면 빠르고, 열 우선 데이터에 열로 접근하면 빠르다.


# 데이터 모델
---

데이터가 어떻게 표현되는지

## 관계형 모델 : 

> 관계형 모델에서는 데이터는 관계 (relation)로 구성되며 각 관계는 튜플의 집합입니다.

> 관계는 순서가 없습니다. 관계에서 행의 순서나 열의 순서를 섞더라도 여전히 동일한 관계입니다.

정규화하는 편이 좋다.

정규화를 통해 데이터 중복을 줄이고 데이터 무결성을 향상
다만, 데이터가 분산되어 관리되고 조인 비용 등이 증가.

> 관계형 데이터 모델을 기반으로 구축된 데이터베이스를 관계형 데이터베이스라고 합니다.

쿼리 언어. SQL.

> 주목해야 할 점은 SQL이 선언적 언어라는 사실입니다.
> 명령형 언어인 파이썬과 대비되죠.

선언적 언어 (Declarative Language) -> 무엇을 원하는지를 표현하는 언어 (시스템이 자동으로 최적화 수행)
명령형 언어 (Imperative Language) -> 어떻게 원하는 것을 달성할지를 표현하는 언어


## 선언적 데이터 시스템에서 선언적 ML 시스템으로 :

> 선언적 데이터 시스템이 성공한 데서 영감을 받은 많은 사람들은 선언적 ML을 기대해왔습니다.
> 선언적 ML 시스템을 사용하면 사용자는 피처의 스키마와 작업만 선언하면 됩니다.
> 그러면 시스템은 주어진 피처로 해당 작업을 수행하는데 가장 적합한 모델을 찾아냅ㄴ디ㅏ.

ALudwig, AutoML.

모델 개발 부분은 많이 추상화되는 중. 그렇게 어려운 작업이 아니다.


## NoSQL : 

스미카 관리에 대한 불만.

> 비관계형 모델의 주요 유형 두 가지는 문서 모델과 그래프 모델입니다.

- 문서 모델 
- 그래프 모델

> 데이터 모델에 따라 수행하기 쉬운 쿼리가 있고 어려운 쿼리가 있습니다.
> 따라서 애플리케이션에 적합한 데이터 모델을 선택하는 것이 바람직하죠.

- 정형 데이터 vs 비정형 데이터

정형 데이터는 스키마를 따른다.

> 정형 데이터를 저장하는 저장소를 데이터 웨어하우스라고 하며 비정형 데이터를 저장하는 저장소를 데이터 레이크라고 합니다.
> 데이터 레이크는 읿나적으로 처리 전 원시 데이터를 저장하는데 사용하며 데이터 웨어하우스는 사용 가능한 형식으로 처리된 데이터를 저장하는데 사용됩니다.

# 데이터 스토리지 엔진 및 처리
---

## 트랜잭션 처리와 분석 처리 :

transaction : 온갖 종류의 작업 
생성될 때 삽입되고 변경될 때 업데이트 되면 필요하지 않으면 삭제됨.

**OLTP (Online Transaction Processing)**

> 트랜잭션 데이터베이스는 온라인 트랜잭션을 처리하고 낮은 레이턴시와 고가용성 요구 사항을 충족하도록 설계됐습니다.

ACID (Atomicity, Consistency, Isolation, Durability)

### Atomicity(원자성) : 

> 트랜잭션의 모든 단계가 하나의 그룹으로서 성공적으로 완료되도록 보장합니다.

### Consistency(일관성) : 

> 들어오는 모든 트랜잭션이 미리 정의된 규칙을 따라야 함을 보장합니다.

### Isolation(격리성) : 

> 두 트랜잭션이 마치 격리된 것처럼 동시에 발생하도록 보장합니다.

### Durability(지속성) : 

> 트랜잭션이 커밋된 후에는 시스템 장애가 발생하더라도 커밋된 상태를 유지하도록 보장합니다.

트랜잭션 데이터베이스는 행 우선일 때가 많음 -> 분석에 적절하지 않을 수 있음

**OLAP (Online Analytical Processing)**
분석에 더 적절한 database. 열 조회에 최적화 됨.


요즘은 구분해서 이야기안함. 둘 다 지원하는 경우가 많아서.


## ETL: Extract, Transform, Load :

> ETL은 데이터를 범용 처리 및 원하는 모양과 포맷으로 집계함을 의미

<figure>
  <img src="./images/ETL.webp" alt="ETL Process" />
  <figcaption>
    출처: <a href="https://www.getdbt.com/blog/etl-vs-elt" target="_blank" rel="noopener noreferrer">https://www.getdbt.com/blog/etl-vs-elt</a>
  </figcaption>
</figure>


**ELT: Extract, Load, Transform**

> 데이터를 먼저 스토리지에 적재한 뒤 나중에 처리하는 프로세스

<figure>
  <img src="./images/ELT.webp" alt="ELT Process" />
  <figcaption>
    출처: <a href="https://www.getdbt.com/blog/etl-vs-elt" target="_blank" rel="noopener noreferrer">https://www.getdbt.com/blog/etl-vs-elt</a>
  </figcaption>
</figure>


# 데이터플로 모드
---

> 데이터가 한 프로세스에서 다른 프로세스로 전다로딜 때 데이터가 한 프로세스에서 다른 프로세스로 흐른다고 합니다.
> 즉, 데이터 플로가 생깁니다.

- 데이터베이스를 통한 데이터 전달
- 서비스를 통한 데이터 전달 (REST, RPC API에서 제공하는 요청)
- 실시간 전송을 통한 데이터 전달 (아파치 카프카, 아마존 키네시스)

