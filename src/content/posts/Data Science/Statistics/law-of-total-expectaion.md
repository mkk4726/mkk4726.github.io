---
title: "Law of total expectation"
date: "2025-07-23"
excerpt: "전체기대법칙에 대해 정리"
category: "Data Science"
tags: ["math"]
---

### 전체기대법칙, 진짜 생활 버전

> **핵심 아이디어**
> “전체 평균 = ‘각 상황별 평균’들을 **확률로 가중한 평균**”

---

#### 1. 마트 계산대 이야기로 직관 잡기

* 마트에는 \*\*빠른 계산대(셀프)\*\*와 **일반 계산대(직원)** 두 줄이 있다.
* 셀프 계산대를 선택할 확률 70 %, 일반 계산대는 30 %.
* 셀프에서 걸리는 평균 시간은 2분, 일반 계산대는 6분.
* “전체 줄 서기 평균 시간”은?

  * **조건부 평균**: 셀프 = 2분, 일반 = 6분
  * **가중 평균**: $2 \times 0.7 + 6 \times 0.3 = 3.2$ 분
  * 3.2 분이 **Law of Total Expectation** 결과다.  ([Wikipedia][1])

> 한 줄 요약 ― **“상황별 평균을 구한 뒤, 각 상황이 일어날 확률로 다시 한 번 평균을 내면 전체 평균이 된다.”**

---

#### 2. 공식을 뜯어보면

$$
\mathbb{E}[X] = \mathbb{E}\big[\;\mathbb{E}[X \mid Y]\;\big]
$$

* $X$: 알고 싶은 대상(줄 서는 시간).
* $Y$: 상황을 나누는 열쇠(선택한 계산대).
* $\mathbb{E}[X\mid Y]$: **“상황 Y 가 주어졌을 때 평균”** — 셀프면 2분, 일반이면 6분.
* $\mathbb{E}[\cdot]$: 그 값들을 **다시 평균** — 확률 0.7, 0.3으로 가중. ([Wikipedia][1])

---

#### 3. ‘3단 요리법’으로 기억하기

| 단계        | 해야 할 일                     | 결과        |
| --------- | -------------------------- | --------- |
| ① 상황 나누기  | 문제를 쉽게 쪼갤 변수·사건 $Y$ 고르기    | ‘셀프 / 일반’ |
| ② 상황별 기대값 | $\mathbb{E}[X\mid Y=y]$ 계산 | 2분, 6분    |
| ③ 가중 평균   | ②에 $P(Y=y)$ 곱해 다 더하기       | 3.2분      |

> **어디에 쓰나?**
>
> * 고객 세그먼트별 구매액 산정
>   - 보험료 예상(나이대·지역별)
>   - A/B 테스트 두 그룹 결과 합치기

---

#### 4. 트리 그림으로 그려 보기

```
                전체 고객
             /              \
        (70%)              (30%)
      셀프 계산대         일반 계산대
      평균 2분            평균 6분
```

* **아래층 평균**(2, 6)을 **위층 확률**(0.7, 0.3)로 끌어올려 **위층 평균**(3.2)을 만든다.
* 그래서 이 법칙을 \*\*Tower Rule(탑 규칙)\*\*이라고도 부른다. ([Mathematics Stack Exchange][2])

---

#### 5. ‘조건을 한 번 더 주어도 OK’

$$
\mathbb{E}\!\big[\;\mathbb{E}[X \mid Y,Z]\;\big]=\mathbb{E}[X]
$$

층을 **여러 층** 쌓아도, **맨 꼭대기**로 올라가면 언제나 $X$의 원래 평균. 
정보를 조금 알고(한 층 내려가고) 다시 모른 척(평균)해도, 결국 제자리다. ([The Book of Statistical Proofs][3])

---

#### 6. 한눈에 끝내는 기억 장치

> **“조건부 평균은 곧 ‘부분 평균표’,
> 그 표를 다시 평균내면 전체 평균표.”**

---

#### 7. 자주 묻는 Q\&A

| 질문                  | 답변                                                                |
| ------------------- | ----------------------------------------------------------------- |
| 왜 굳이 이렇게 돌려 계산?     | 복잡한 문제를 **작은 블록**으로 나눌 때 계산이 훨씬 쉽다.                               |
| 확률 대신 비율·가중치 써도 되나? | 총합이 1이면 어떤 가중치든 무방.                                               |
| 연속형 변수도 되나?         | 사건 합 대신 **적분**으로 바뀔 뿐 똑같이 성립한다. ([Everything Explained Today][4]) |

---

필요하면 **전체분산법칙**(Var 버전)이나 **베이지안 업데이트**에서의 활용 예도 이어서 보여줄 수 있다.

[1]: https://en.wikipedia.org/wiki/Law_of_total_expectation?utm_source=chatgpt.com "Law of total expectation"
[2]: https://math.stackexchange.com/questions/41536/intuitive-explanation-of-the-tower-property-of-conditional-expectation?utm_source=chatgpt.com "Intuitive explanation of the tower property of conditional expectation"
[3]: https://statproofbook.github.io/P/mean-tot.html?utm_source=chatgpt.com "Law of total expectation | The Book of Statistical Proofs"
[4]: https://everything.explained.today/Law_of_total_expectation/?utm_source=chatgpt.com "Law of total expectation explained"
