---
title: 숨고의 MSA Architecture를 위한 프레임워크 Soomgo-py
date:
excerpt: "숨고가 내부 MSA 개발을 위해 만든 프레임워크 Soomgo-py 정리"
category:
tags:
Done: false
---

# 숨고의 MSA Architecture를 위한 프레임워크 Soomgo-py

## 원문

- 발행일: 2020.11.02
- 링크: https://soomgo.team/blog/posts/6673bb8a52107866fb86a765

## 한 줄 요약

숨고는 반복되는 API 구현 패턴과 프로젝트 초기 세팅 비용을 줄이기 위해, Falcon 기반의 내부 프레임워크 `Soomgo-py`를 만들었다.

## 만든 이유

- 서비스별 중복 코드와 모듈이 많았다.
- 새 프로젝트를 열 때마다 New Relic, bugsnag, docker, k8s, black, flake8 같은 공통 설정을 반복해야 했다.
- 레거시 모델 관리도 별도 부담이었다.

## 핵심 아이디어

- Rule of Three 관점에서, 반복되는 API 요청/응답 패턴을 프레임워크로 추상화했다.
- Django의 CBV와 유사한 사용성을 지향했다.
- 예를 들어 `CreateResource`를 상속하고 속성만 선언해 리소스 생성 API를 구현할 수 있게 했다.

## 장점

### 사용성

- 문서화
- 샘플 코드
- 익숙한 메서드 패턴

으로 러닝 커브를 줄였다.

### 확장성

- WSGI 서버를 설정값으로 바꿔 Gunicorn / Uvicorn 같은 실행 환경을 유연하게 선택할 수 있도록 설계했다.

### 재사용성

- DB connection polling
- Cursor / Offset pagination
- logging

같은 공통 모듈을 기본 제공했다.

## 인상적인 포인트

- 이 글은 숨고가 일찍부터 `내부 플랫폼화`를 고민했다는 증거다.
- 나중의 아키텍처 글과 연결해서 보면, Soomgo-py는 MSA를 실무적으로 굴리기 위한 생산성 기반이었다고 볼 수 있다.

