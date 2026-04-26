---
title: Kubernetes 환경 CD 개선하기
date:
excerpt: "Manifest 분리와 GitOps, ArgoCD 도입을 통해 CD 체계를 개선한 사례 정리"
category:
tags:
Done: false
---

# Kubernetes 환경 CD 개선하기

## 원문

- 원제: Kubernetes 환경 CD(Continuous Deployment) 개선하기
- 발행일: 2020.12.18
- 링크: https://soomgo.team/blog/posts/6673bb8d52107866fb86a796

## 한 줄 요약

숨고는 애플리케이션 코드와 Kubernetes manifest를 분리하고, ArgoCD 기반 GitOps 흐름으로 CD를 재구성했다.

## 기존 문제

- 앱 코드와 manifest가 같은 저장소에 있었다.
- 그 결과:
  - manifest만 바뀌어도 컨테이너 빌드가 필요
  - 여러 앱의 설정이 흩어져 관리가 어려움
  - 코드 변경 로그와 설정 변경 로그가 뒤섞임
  - 너무 많은 사람이 프로덕션 설정을 바꿀 수 있음
- Bitbucket Pipeline 기반 기존 배포는 적용 성공/실패 모니터링도 약했다.

## 개선 방향

### 1. Manifest 저장소 분리

- 통합 manifest repository를 만들고 Helm chart로 구조화했다.

### 2. GitOps 도입

- Kubernetes 상태 변경의 단일 출처를 Git으로 통일했다.
- 사람이 직접 `kubectl`을 치는 대신 Git commit이 배포를 트리거하도록 설계했다.

### 3. ArgoCD 연동

- 환경별 branch, directory, values 파일 기준으로 sync
- ArgoCD와 notifications를 이용해 상태 모니터링과 Slack 알림까지 붙였다

### 4. Application repo와 연결

- 앱 저장소 pipeline은 빌드를 담당
- 빌드 후 manifest repo의 이미지 태그를 갱신하고 commit/push
- ArgoCD가 이를 감지해 배포

## 결과

- 앱 저장소와 설정 저장소가 완전히 분리됨
- GitOps 적용 완료
- 배포 상태 모니터링이 개선됨
- Production 권한 관리도 더 안정적으로 바뀜

## 인상적인 포인트

- 2020 시점에 이미 `배포 구조 = 코드 구조 + 권한 구조 + 관찰 가능성`으로 보고 있었다는 점이 좋다.
- 단순 툴 교체가 아니라 배포 책임의 경계를 다시 그은 사례다.

