---
title: "Redis란?"
date: "2025-08-11"
excerpt: "Redis의 개념과 활용되는 사례에 대한 정리"
category: "Data Science"
tags: ["machine-learning", "statistics"]
---

- 인메모리 데이터 저장소: 데이터를 RAM에 저장해 마이크로초~밀리초 단위 응답을 제공
- 키-값 구조: 키로 빠르게 조회/갱신하는 단순하고 효율적인 데이터 모델
- 다양한 용도
  - 캐싱: 자주 조회되는 결과를 저장해 DB 부하와 지연시간을 줄임
  - 세션 관리: 로그인 세션/토큰 등 상태 정보를 TTL로 안전하게 관리
  - 메시지 큐: 비동기 작업 처리와 Producer-Consumer 패턴 구현
- NoSQL 데이터베이스: 스키마 유연성, 다양한 자료구조, 수평 확장 용이
- 오픈 소스: BSD 라이선스 기반으로 커뮤니티와 생태계가 활발




### TTL이란?

TTL(Time To Live)은 키에 설정하는 유효기간입니다. 만료 시간이 지나면 키는 자동으로 삭제됩니다.
- 설정: `SET key val EX <sec>` 또는 `PX <ms>`, `EXPIRE key <sec>`, `PEXPIRE key <ms>`
- 해제: `PERSIST key` (만료 제거)
- 조회: `TTL key`(초), `PTTL key`(ms). `-1`은 만료 없음, `-2`는 키 없음
- 동작: Redis는 지연(lazy) + 주기적(active) 스캔으로 키를 만료 처리
- 참고: 만료(expiration)는 시간 기반 삭제, eviction은 메모리 압박 시 정책에 따른 제거

```bash
SET token:123 abc EX 60   # 60초 후 만료
TTL token:123             # 남은 초 확인
PERSIST token:123         # 만료 제거
```

### 한 줄 요약

매우 빠른 in-memory data store로서, 캐시/세션/큐/순위표/레이트 리미팅 등 **실시간성**이 중요한 문제에 탁월합니다. 영속성과 고가용성 기능을 갖췄지만, 전통적인 RDBMS의 완전한 대체재는 아닙니다.


### 개요

Redis는 in-memory key-value data structure store로, 매우 낮은 지연시간과 높은 처리량을 제공하는 **캐시(Cache)**, **세션 저장소(Session Store)**, **메시지 브로커(Message Broker)** 용도로 널리 쓰입니다. 단일 스레드 기반 event loop로 동작하지만 I/O multiplexing을 활용해 고성능을 달성합니다. 원하는 경우 디스크에 영속화(RDB/AOF)도 지원합니다.

### 주요 특징
- **In-memory**: 메모리에 데이터를 보관해 마이크로초~밀리초 단위 응답
- **Rich data structures**: String, List, Set, Sorted Set(ZSet), Hash, Stream, HyperLogLog, Bitmap, Geospatial
- **TTL/Expiration**: key 단위 만료와 다양한 eviction 정책(LRU/LFU 등)
- **Persistence**: RDB(snapshot), AOF(append only) 또는 혼합 사용
- **Scalability/HA**: Replication, Sentinel(자동 failover), Cluster(16384 hash slots)
- **Atomic ops & Lua**: 단일 명령 원자성, `EVAL`을 통한 서버 측 Lua 스크립팅

### 핵심 자료구조 한눈에
- **String**: 카운터, 토큰, 플래그 등 단순 값 저장
- **Hash**: 사용자 프로필 같은 field-value 맵
- **List**: 큐/스택, 작업 대기열, 로그 버퍼
- **Set**: 고유 집합, 중복 제거, 교집합/합집합 연산
- **Sorted Set (ZSet)**: 점수 기반 정렬(리더보드, 순위표)
- **Stream**: 로그/이벤트 스트림, 소비자 그룹 기반 처리

### 대표 활용 시나리오
- **Cache**: DB 질의/렌더링 결과 캐싱, TTL과 invalidation 전략 결합
- **Session Store**: 웹 세션/인증 토큰 저장, 만료/연장 관리
- **Queue & Pub/Sub**: 간단한 작업 큐(List/BRPOP) 또는 실시간 메시징(Stream, Pub/Sub)
- **Rate Limiting**: 요청 빈도 제어(카운터, 토큰 버킷), 분산 락(`SET key val NX PX`)
- **Leaderboard/Ranking**: ZSet으로 상위 N, 스코어 범위 질의

### 운용 포인트
- **Persistence**: 
  - RDB: 주기적 스냅샷, 복구 빠름, 데이터 손실 가능성 있음(마지막 스냅샷 이후)
  - AOF: 모든 write 로그, 내구성 우수, 파일 커질 수 있어 리라이트 필요
- **Eviction 정책**: noeviction, allkeys-lru, allkeys-lfu 등 워크로드에 맞게 선택
- **Cluster**: 키 해시 슬롯 기반 샤딩. 멀티키 연산은 같은 슬롯(= 같은 hash tag)에서만 가능
- **모듈**: RediSearch(검색), RedisJSON(JSON 문서), RedisBloom(확률 자료구조), TimeSeries(시계열)

### 간단한 명령 예시

```bash
# String
SET page:home "rendered_html" EX 60
GET page:home

# List queue (producer/consumer)
LPUSH jobs "task-1"
BRPOP jobs 5

# Sorted Set leaderboard
ZADD leaderboard 100 user:alice 120 user:bob
ZREVRANGE leaderboard 0 1 WITHSCORES
```

### Python 예시(redis-py)

```python
import redis

client = redis.Redis(host="localhost", port=6379, decode_responses=True)

# cache set/get with TTL
client.set("user:42:profile", "{\\"name\\": \\\"Alice\\\"}", ex=300)
profile = client.get("user:42:profile")

# rate limiting (simple counter)
key = "rl:ip:203.0.113.1:60s"
pipe = client.pipeline()
pipe.incr(key)
pipe.expire(key, 60)
count, _ = pipe.execute()
if count > 100:
    print("Too many requests")

# leaderboard
client.zadd("leaderboard", {"user:alice": 100, "user:bob": 120})
top = client.zrevrange("leaderboard", 0, 9, withscores=True)
print(top)
```

### 언제 피할까?
- 강한 트랜잭션 일관성과 복잡한 조인/쿼리가 필요한 경우(전통 RDBMS 권장)
- 대용량 장기 보관의 주 데이터베이스로 쓰기에는 비용/내구성 트레이드오프 고려 필요




## Redis, 이러한 프로젝트에 적용하시면 유용합니다.

인메모리 데이터베이스로 작동하는 Redis는 데이터를 빠르게 처리하며 실시간 응답이 중요한 프로젝트에서 뛰어난 성능을 발휘하는데요, Redis를 활용하면 좋은 대표적인 프로젝트를 4가지로 정리해 보았습니다.

 

### 세션 관리
Redis는 사용자 세션 데이터를 메모리에 저장하여 빠르고 효율적인 세션 관리를 지원합니다.

사용자 인증 속도 향상: 로그인 시 사용자 데이터를 즉각적으로 조회할 수 있어 인증 속도를 크게 높입니다.
세션 만료 관리: TTL(Time to Live)을 설정해 불필요한 데이터가 메모리를 차지하지 않도록 자동으로 만료시킵니다. 이를 통해 메모리 사용을 효율적으로 관리할 수 있습니다.
다중 서버 환경 지원: Redis를 중앙 세션 저장소로 사용하면 여러 웹 서버 간 세션 데이터를 쉽게 공유할 수 있어 로드밸런싱 환경에서도 안정적인 세션 관리가 가능합니다.
 

### 캐싱 시스템
Redis는 자주 조회되는 데이터를 메모리에 캐싱 하여 데이터베이스의 부하를 줄이고 빠른 응답 속도를 제공합니다.

읽기 부하 분산: 제품 정보, 페이지 콘텐츠 같은 고빈도 읽기 요청을 Redis에 캐싱 해 데이터베이스의 읽기 부하를 감소시킵니다.
복잡한 연산 속도 향상: 상품 추천이나 검색 결과처럼 계산이 많은 데이터를 Redis에 저장해 클라이언트 요청 시 빠르게 반환할 수 있습니다.
만료 정책 지원: 캐싱 데이터에 TTL을 설정해 오래된 데이터를 자동으로 제거, 최신 상태를 유지할 수 있습니다.
 

### 실시간 분석
실시간 데이터 처리가 중요한 환경에서 빠른 데이터 조회와 집계 기능을 제공합니다.

대시보드 업데이트: 트래픽, 사용자 행동 데이터 같은 정보를 Redis에 저장해 실시간으로 대시보드에 반영할 수 있습니다.
실시간 통계 계산: Redis의 Sorted Set이나 Hash 구조를 활용해 사용자 활동 집계나 순위 계산을 즉시 처리할 수 있습니다.
이벤트 처리: 실시간으로 발생하는 이벤트 데이터를 저장하고 처리해 이상 징후 탐지, 트랜잭션 모니터링 같은 시스템에 활용됩니다.
 

### 메시지 큐
Redis의 Pub/Sub 기능은 실시간 메시지 전송과 수신을 간단하고 효율적으로 처리합니다.

실시간 알림 시스템: Redis를 활용하면 이메일 알림, 푸시 알림을 실시간으로 전송할 수 있습니다.
채팅 애플리케이션: 사용자 간 메시지를 Redis를 통해 즉시 전달해 끊김 없는 실시간 채팅 환경을 구현할 수 있습니다.
스트리밍 데이터 관리: Redis Streams 기능을 사용하면 실시간으로 데이터 스트리밍을 관리하고, 여러 소비자(Consumer)에게 데이터를 분배할 수 있어 확장성이 뛰어납니다.
Redis는 인 메모리 데이터베이스로서 뛰어난 데이터 처리 능력을 자랑합니다. 높은 처리량과 영속성 옵션 덕분에 세션 관리, 캐싱 시스템, 실시간 분석, 메시지 큐와 같은 프로젝트에서 활용하면 더욱 효과적인 결과를 얻을 수 있습니다. 이어지는 내용에서는 Redis를 더욱 효과적으로 활용하는 방법에 대해 알아보겠습니다.

 

### Redis를 사용하기 좋은 경우

- 세션 관리: 로그인 세션/토큰을 빠르게 조회하고 TTL로 자동 만료가 필요할 때
- 캐싱 시스템: 자주 조회되는 데이터로 DB 부하를 줄이고 응답 시간을 단축해야 할 때
- 실시간 분석: 대시보드/통계/활동 집계를 ms~s 단위로 갱신해야 할 때
- 메시지 큐·스트리밍: 간단한 작업 큐나 실시간 알림/채팅/이벤트 스트림이 필요할 때
- 레이트 리미팅·쿼터: 사용자/ IP별 요청 빈도 제한을 원자 카운터+TTL로 구현할 때
- 랭킹·순위표: 점수 기반 상위 N, 범위 질의가 잦을 때(ZSet 적합)
- 임시 데이터: OTP/인증코드/단기 캐시 등 만료가 명확한 데이터를 다룰 때
- 초저지연 읽기: DB 앞단 캐시 계층으로 p95 응답 시간을 낮춰야 할 때
