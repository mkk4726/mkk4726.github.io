---
title: Swagger와 Redoc을 이용한 API 문서 자동화하기
date:
excerpt: "Soomgo-py의 Auto-Docs 기능을 중심으로 API 문서 자동화 방식을 정리한 글"
category:
tags:
Done: false
---

# Swagger와 Redoc을 이용한 API 문서 자동화하기

## 원문

- 발행일: 2020.12.09
- 링크: https://soomgo.team/blog/posts/6673bb8f52107866fb86a7af

## 한 줄 요약

숨고는 Soomgo-py에 Auto-Docs 기능을 추가해, 개발자가 문서용 코드를 따로 쓰지 않아도 Swagger / ReDoc 기반 API 문서를 자동 생성하도록 만들었다.

## 목적

- 문서화를 수작업으로 하면 개발자 리소스가 많이 든다.
- 문서화 비용을 줄이고, 개발자는 비즈니스 로직에 더 집중하게 하려는 목적이다.

## 사용한 구성

- Swagger UI
- ReDoc
- OpenAPI Specification
- `apispec`
- Marshmallow plugin

## 구현 방식

- Swagger UI와 ReDoc용 HTML 리소스를 별도 제공
- `APISpec`를 초기화해 OpenAPI 스펙을 구성
- 라우트를 순회하며 `/openapi.json`을 자동 생성
- 필요한 경우 리소스 내부 `OpenAPI` 클래스에서
  - tags
  - summary
  - parameters
  - security
  - responses
  - description
  를 커스터마이징할 수 있게 했다

## 인상적인 포인트

- 문서 자동화도 결국 내부 프레임워크의 기능으로 흡수했다는 점이 좋다.
- 이 시기 숨고 기술 조직이 `반복 작업 자동화`를 얼마나 중요하게 봤는지 잘 드러난다.

