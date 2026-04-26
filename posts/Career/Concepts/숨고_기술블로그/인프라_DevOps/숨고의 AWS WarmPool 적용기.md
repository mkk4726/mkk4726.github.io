---
title: 숨고의 AWS WarmPool 적용기
date:
excerpt: "트래픽 급증 시 스케일링 지연을 줄이기 위해 Warm Pool을 도입한 사례 정리"
category:
tags:
Done: false
---

# 숨고의 AWS WarmPool 적용기

## 원문

- 발행일: 2022.11.04
- 링크: https://soomgo.team/blog/posts/6673bb8e52107866fb86a7a3

## 한 줄 요약

숨고는 급격한 트래픽 증가 시 노드 준비 지연을 줄이기 위해, 정지 또는 최대 절전 상태의 인스턴스를 미리 확보해 두는 Warm Pool 방식을 선택했다.

## 배경

- 숨고는 트래픽이 유동적이다.
- 파드가 스케일아웃돼도 적절한 타이밍에 노드가 준비되지 않으면 서비스 안정성이 떨어질 수 있다.
- 따라서 `미리 준비된 노드`가 필요했다.

## Warm Pool이란

- EC2 Auto Scaling의 기능 중 하나
- 인스턴스를 `Stopped` 또는 `Hibernation` 상태로 미리 준비해 둔다.
- 완전히 새로 프로비저닝하는 것보다 더 빠르게 Running 상태로 전환할 수 있다.

## 왜 Karpenter가 아니라 Warm Pool이었나

- 숨고는 당시 최신 기술 도입보다 `안정성 향상`이 더 중요한 목표였다.
- 테스트 결과 Warm Pool이 Karpenter와 비슷하거나 더 빠른 속도로 스케일링될 수 있다고 판단했다.
- 운영 측면에서도 AWS 자체 기능인 Warm Pool이 관리 편의성이 높다고 봤다.

## 인상적인 포인트

- 나중에 숨고는 Karpenter도 도입했지만, 이 글 시점에는 Warm Pool이 더 실용적인 선택이었다.
- 즉, 숨고는 특정 기술을 일관되게 밀기보다 `당시의 환경과 운영 숙련도에 맞는 선택`을 했다고 볼 수 있다.

