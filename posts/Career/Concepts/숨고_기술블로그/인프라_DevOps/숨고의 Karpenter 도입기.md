---
title: 숨고의 Karpenter 도입기
date:
excerpt: "Warm Pool과 CAS의 한계를 넘어 Karpenter를 도입한 DevOps 사례 정리"
category:
tags:
Done: false
---

# 숨고의 Karpenter 도입기

## 원문

- 발행일: 2024.04.11
- 링크: https://soomgo.team/blog/posts/6673bb8d52107866fb86a793

## 한 줄 요약

숨고는 Warm Pool과 CAS 기반 오토스케일링의 한계를 해결하기 위해 Karpenter를 도입했고, 속도·유연성·비용 측면에서 의미 있는 개선을 얻었다.

## 출발점

- Warm Pool을 쓰던 시기에 노드가 Ready된 뒤에도 스케줄링이 매끄럽지 않거나, 종료 시 Terminating 상태에서 빠져나오지 못하는 문제가 있었다.
- EKS 업그레이드 시 운영 부담도 있었다.
- 결국 `유동적인 트래픽을 더 유연하게 처리할 구조`가 필요했다.

## 검토한 대안

- CAS + Warm Pool
- Karpenter
- Ocean Controller

숨고는 여기서 Karpenter를 선택했다.

## 도입 목표

- CAS에서 Karpenter로 마이그레이션해 운영 오버헤드 감소
- 노드 생성 시간 단축
- 리소스 요구사항 변화에 더 유연한 대응
- 더 저렴한 노드 조합을 통한 비용 절감

## 검증 과정에서 본 포인트

- CAS 대비 스케일 속도:
  - CAS 약 `48초`
  - Karpenter 약 `37초`
- Karpenter는 Desired Size 0이어도 Provisioner 기반으로 노드 생성 가능
- Spot 인스턴스 사용과 다양한 인스턴스 타입 조합에 유연함
- NodeGroup 개념보다 `Limits`, `Taints`, `Provisioner` 설계가 중요

## 실제 운영에서 생긴 문제

### 비용 증가

- 초기에 Karpenter를 붙였더니 오히려 비용이 증가했다.
- 원인:
  - Taints 적용 이후 노드 여유 자원을 덜 공유하게 됨
  - 롤링 업데이트 때 노드가 과도하게 늘어남
  - CoreDNS drain 실패로 과도한 노드 유지

### 해결

- 중요 파드에 `do-not-evict` 어노테이션 적용
- 일부 중요 Deployment를 StatefulSet으로 전환
- 안정성 확보 후 Consolidation 활성화
- CoreDNS가 Karpenter 이벤트 대상이 되도록 설정 보완

## 최종 효과

- 노드 생성 시간 `50~60%` 감소
- Consolidation만으로 비용 약 `10%` 절감
- Spot 우선 적용 환경에서 비용 약 `50%` 절감
- 인스턴스 타입 선택 자유도가 높아짐
- 목적별 노드 격리가 쉬워짐
- ARM 전환 같은 후속 아키텍처 변화도 쉬워짐

## 인상적인 포인트

- 기술 도입기인데도 `도입 후 예상과 다르게 비용이 늘어난 구간`을 솔직하게 다뤄서 좋다.
- Karpenter 자체보다 `운영팀의 이해도와 세팅`이 효과를 좌우한다는 점이 핵심이다.

