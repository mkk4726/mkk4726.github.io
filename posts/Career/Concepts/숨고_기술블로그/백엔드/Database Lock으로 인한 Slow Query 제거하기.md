---
title: Database Lock으로 인한 Slow Query 제거하기
date:
excerpt: "동시성 보장을 유지하면서 Lock 대기를 줄여 Slow Query를 해소한 사례 정리"
category:
tags:
Done: false
---

# Database Lock으로 인한 Slow Query 제거하기

## 원문

- 발행일: 2025.03.11
- 링크: https://soomgo.team/blog/posts/67ced21811c820757515756f

## 한 줄 요약

숨고는 안심번호 매핑 로직에서 `with_for_update()`로 인한 대기를 줄이기 위해, 조건부 업데이트 기반 동시성 제어 방식으로 바꿔 Slow Query를 크게 줄였다.

## 문제 상황

- 안심번호는 한 유저에게만 배정돼야 한다.
- 기존에는 SQLAlchemy `with_for_update()`로 row lock을 걸어 일관성을 보장했다.
- 하지만 요청이 몰리면 대기 시간이 길어지고 Slow Query가 발생했다.

## 검토한 해결책

### 1. `skip_locked`

- MySQL 8.0 이상이면 `with_for_update(skip_locked=True)`를 쓸 수 있다.
- 다만 당시 숨고는 MySQL 5.7이라 바로 적용할 수 없었다.

### 2. Redis Lock

- Redis `SETNX` 기반 락도 검토했다.
- 하지만 외부 시스템 장애나 네트워크 이슈를 고려하면 운영 복잡도가 올라갈 수 있었다.

### 3. 조건부 업데이트

- 최종적으로 선택한 방식
- 흐름:
  - status가 `A`인 안심번호를 조회
  - `WHERE id = ? AND status = 'A'` 조건으로 업데이트
  - 먼저 성공한 트랜잭션만 할당 성공
  - 실패한 트랜잭션은 다시 조회 후 재시도

이 방식은 락 대기를 줄이면서도 동일 번호 중복 할당을 막을 수 있다.

## 결과

- Slack으로 올라오던 Slow Query 알림이 사라졌다.
- API 평균 응답 속도: `800ms -> 200ms`
- Slow Query 평균 응답 속도: `18초 이상 -> 400ms대`

## 이후 확장

- MySQL 8.0 업그레이드 이후에는 일부 로직에 `skip_locked`도 적용할 수 있게 됐다.
- 캐시 관련 API에는 Redis Lock 방식도 활용했다.

## 인상적인 포인트

- 락을 없애는 게 목적이 아니라, `문제에 맞는 더 싼 동시성 제어 방식`을 찾은 사례다.
- 외부 분산락을 바로 도입하지 않고, DB 내부에서 해결 가능한지 끝까지 검토한 점이 좋다.

