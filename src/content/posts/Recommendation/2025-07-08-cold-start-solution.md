---
title: "Cold Start 해결 방법에 대한 고민"
date: "2025-07-08"
excerpt: "사이드프로젝트에서 진행한 cold start 해결방안과 데이터의 한계점 극복 고민"
category: "Recommendation"
tags: ["사이드프로젝트정리", "추천시스템"]
---

# 배경

모두의 연구소에서 "쩝쩝LAB"이라는 이름으로 진행한 사이드 프로젝트에 대한 정리입니다.
맛집 추천 시스템을 구현하고 있습니다.

여러 과제 중 Cold Start를 어떻게 해결할지에 대해 논의한 내용들을 정리해봤습니다.

# Cold Start Problem이란?

> 사용자나 아이템에 대한 정보가 없거나 희소한 문제

이 중에서 유저에 대한 cold start 문제를 어떻게 풀지에 대해 고민하고 있습니다.


*<small>같이 사이즈 프로젝트를 하는 '이윤선'님의 분석 결과를 참고해 정리헀습니다.</small>*


# 기본적인 추천의 컨셉

> Popularity Model에서 Context를 반영하여, 유저가 만족할만한 음식을 추천해주고 싶다.   

콜드 유저에게 인기도 기반 추천을 내주는 것처럼, 계절과 날씨를 고려해 추천을 내주면 좋을 것 같다는 아이디어입니다.

(예시)
| 상황 | 유저의 생각 | 추천 가능 음식 |
| --- | --- | --- |
| 맑고 청명한 날 | “밖에 나가서 먹고 싶어” | 샌드위치, 김밥, 분식 |
| 흐리고 습한 날 | “뭔가 시원한 게 땡긴다” | 냉면, 물회, 아이스커피 |
| 비 올 것 같은 날 | “집에 일찍 가고 싶어” | 국물 요리, 칼국수, 해장국 |
| 겨울철 | “대게가 제철이네?” | 대게찜, 어탕국수, 전골류 |

계졀 날씨 데이터를 모델에 포함시켜야 하는 이유로 3가지를 제시했습니다.


- 왜 계절 날씨 데이터를 모델에 포함해야 할까?
    - 개인화 추천 강화
        → 동일한 유저도 날씨에 따라 선택이 달라짐
        → ‘유저 + 날씨’ 조합 기반의 더 똑똑한 추천 가능
        
    - 모델의 정밀도 향상
        → 기존 모델에 컨텍스트 데이터를 추가함으로써 예측 정확도 향상
    
    - Cold Start 상황에서도 강력한 보완
        → 유저 정보가 없을 때도, **그날의 날씨 + 인기 메뉴**로 합리적인 추천 가능


여기에 추가로 저는 추천의 근거를 제시해줄 수 있기 때문에, 사용자가 추천의 결과를 더 신뢰할 수 있을 것이라고 생각합니다.


# 구현상황에서의 문제점, 데이터의 한계

사용하고 있는 데이터는 카카오맵을 크롤링하여 만든 데이터입니다.
카카오맵에 있는 리뷰는 사용자가 서비스를 이용한 후에 바로 작성하는게 아니기 때문에, 작성 시점과 실제 사용한 시점이 다릅니다.
따라서 사용한 시점의 날씨를 알 수 없다는 문제가 있습니다.

이를 확인하기 위한 EDA 결과를 발표자님께서 발표해주셨습니다.

> 리뷰 날짜와 방문날짜가 같다는 가정을 타당하게 만들기 위한 방법

# 리뷰어 중에 매일 리뷰를 쓰는 사람만 고르자

> 작성한 리뷰들의 일자의 차이가 평균적으로 1일정도 나는 유저, 즉 매일 리뷰를 작성하는 리뷰어들을 통해 데이터를 통해 이를 해결하자

즉 리뷰 날짜와 방문날짜가 같다고 추정되는 유저만 필터링하는 방법을 선택합니다.
이렇게 되면 데이터의 한계를 어느정도는 극복할 수 있습니다.




