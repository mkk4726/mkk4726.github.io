---
title: 숨고 React Native 앱에서 CodePush 업데이트 전송 시간 줄인 경험
date:
excerpt: "CodePush 번들 비대화 원인을 찾아 업데이트 전송 시간을 줄인 사례 정리"
category:
tags:
Done: false
---

# 숨고 React Native 앱에서 CodePush 업데이트 전송 시간 줄인 경험

## 원문

- 발행일: 2023.12.06
- 링크: https://soomgo.team/blog/posts/6673bb8c52107866fb86a78b

## 한 줄 요약

숨고는 CodePush 번들이 과도하게 커진 원인을 추적해 Source map 포함 문제와 Hermes 설정 문제를 바로잡고, 다운로드 시간과 실패율을 크게 낮췄다.

## 결과

- CodePush 번들 용량: `14MB -> 8MB`
- 평균 다운로드 시간: `7초 -> 4초`
- 개선 폭: 약 `43%`
- Mandatory 업데이트 기준 롤백 발생률도 `4.5% -> 0.4%`로 크게 낮아졌다.

## 문제의 원인

### 1. Source map이 번들에 포함됨

- 프로덕션 CodePush 번들을 열어보니 `40MB` 규모의 Source map 파일이 함께 들어 있었다.
- 원인은 버그 리포팅 도구 가이드에 따라 CodePush 디렉토리 안에 Source map을 생성하도록 해둔 오래된 설정이었다.
- `appcenter-cli`는 해당 디렉토리의 파일을 그대로 zip에 포함시키기 때문에 번들이 비대해졌다.

### 2. Hermes 컴파일 누락 가능성

- React Native 0.71 이상 + Hermes 사용 환경에서 `appcenter-cli`가 Hermes 활성화 여부를 제대로 감지하지 못할 수 있었다.
- 이 경우 배포 번들이 바이트코드가 아니라 minified JS 상태로 들어가며 성능과 구성 일관성에 문제가 생긴다.

## 해결 방법

- Source map이 CodePush 번들에 포함되지 않도록 명령과 경로를 수정
- Hermes 사용 프로젝트에서는 `appcenter-cli`에 명시적으로 `--use-hermes` 옵션 적용

## 인상적인 포인트

- 겉으로는 "다운로드가 느리다"는 현상이었지만, 실제 원인은 오래된 빌드 설정이었다.
- 배포 아티팩트를 직접 열어보며 원인을 확인한 과정이 좋다.
- 이후 `AppCenter 없이 React Native CodePush 배포하기`로 이어지는 문제의식도 여기서 출발한 것으로 보인다.

