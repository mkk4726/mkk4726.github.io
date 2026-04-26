---
title: 데이터 수집 최적화로 New Relic 비용 50% 절감하기
date:
excerpt: "관측 데이터 수집 범위를 조정해 New Relic 비용을 크게 줄인 사례 정리"
category:
tags:
Done: false
---

# 데이터 수집 최적화로 New Relic 비용 50% 절감하기

## 원문

- 발행일: 2022.10.27
- 링크: https://soomgo.team/blog/posts/6673bb8a52107866fb86a769

## 한 줄 요약

숨고는 New Relic의 관측 가치를 유지하면서도, 수집 주기와 수집 대상 환경을 정교하게 줄여 비용을 `50% 이상` 절감했다.

## 핵심 문제

- Kubernetes 기반 운영 환경에서 New Relic 데이터 수집량이 많아지며 비용 부담이 커졌다.
- 단순히 끄는 것이 아니라, 관측 품질을 유지한 채 줄이는 방법이 필요했다.

## 적용한 방법

### 1. `lowDataMode`와 interval 조정

- Helm 버전을 올린 뒤 `lowDataMode`를 켰다.
- 기본 30초 interval은 너무 길다고 판단해 `10초`로 조정했다.
- 비용과 감지 속도 사이에서 균형을 택한 셈이다.

### 2. 불필요한 namespace 제외

- 숨고 서비스가 아닌 네임스페이스에는 `newrelic.com/scrape=false`를 붙여 수집 대상을 줄였다.

### 3. 운영 환경 외 APM 데이터 드랍

- NRQL 드랍 룰을 사용해 test, undefined 등 운영 외 환경의 메트릭을 일괄 제외했다.

## 결과

- New Relic 데이터 사용량 `50% 이상` 감소
- 운영 비용도 이에 비례해 `50% 이상` 절감

## 인상적인 포인트

- 비용 최적화 글이지만, 단순 절감보다 `관측 품질을 어디까지 유지할 것인가`에 대한 판단이 핵심이다.
- Observability와 Monitoring을 구분해 사고하는 점도 인상적이다.

