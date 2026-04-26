---
title: AppCenter 없이 React Native CodePush 배포하기
date:
excerpt: "AppCenter 종료와 성능 병목에 대응해 CodePush 인프라를 단순화한 모바일 배포 사례 정리"
category:
tags:
Done: false
---

# AppCenter 없이 React Native CodePush 배포하기

## 원문

- 발행일: 2025.05.07
- 링크: https://soomgo.team/blog/posts/67846d14271b0f4d3124ffb4

## 한 줄 요약

숨고는 AppCenter의 느린 응답과 2025년 3월 31일 서비스 종료에 대응하기 위해, CodePush 업데이트 확인과 번들 배포 구조를 직접 재구성했다.

## 문제

- 앱 실행 시 CodePush 업데이트 확인이 끝나야 서비스에 진입할 수 있었다.
- AppCenter API 응답 시간은 P90 기준 `1.5초`, 번들 다운로드는 P90 기준 `15초` 수준이었다.
- 여기에 AppCenter 서비스 종료가 `2025년 3월 31일`로 예고됐다.

## 1단계: AppCenter 응답 캐싱

- CodePush 라이브러리의 업데이트 확인 동작을 분석했다.
- `updateChecker` 옵션을 추가해 기본 조회 함수를 대체할 수 있게 만들었다.
- AppCenter 응답 JSON과 번들을 `AWS S3 + CloudFront`에 캐싱해 앱이 빠른 인프라에서 직접 조회하게 했다.

### 효과

- 업데이트 확인: `1.5초 -> 0.3초`
- 번들 다운로드: `15초 -> 3초`
- 평균 번들 다운로드: `7초 -> 0.9초`

## 2단계: AppCenter 제거

- 결국 캐싱조차 중간 단계일 뿐이라 보고 AppCenter 의존을 완전히 제거했다.
- `appcenter-cli`를 그대로 쓰지 않고, 필요한 번들 생성 기능만 발췌해 내부 Node 스크립트로 재구성했다.
- 업데이트 확인용 JSON도 직접 생성했다.

### 직접 관리한 정보

- `enabled`
- `mandatory`
- `package_hash`
- `target_binary_range`
- `download_url`

### 추가 구현

- 필수 업데이트 판단 로직
- 빠른 롤백
- GitHub Actions를 통한 배포 정보 변경 UI

## 결과

- AppCenter 배포 후 별도 캐시 갱신 단계를 제거
- 배포 명령 한 번으로 배포 완료
- 치명적 문제 발생 시 빠른 롤백 가능
- AppCenter 장애와 종료 리스크에서 벗어남
- 하루 여러 번, 월 `30회` 수준의 스몰 릴리즈에도 잘 맞는 구조를 확보

## 인상적인 포인트

- 느린 외부 서비스를 다른 솔루션으로 갈아타기 전에, `정확히 어떤 동작이 필요한지` 먼저 분해해 본 점이 좋다.
- 결국 "대체 서비스 도입"이 아니라 `필요 기능만 남긴 단순한 자체 구조`로 갔다.
- 모바일 배포에서도 인프라, 라이브러리 내부 동작, 운영 자동화가 함께 묶여 있다는 걸 잘 보여준다.

