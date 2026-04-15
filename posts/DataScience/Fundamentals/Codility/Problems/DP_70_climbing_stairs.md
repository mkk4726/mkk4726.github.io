---
title: "70. Climbing Stairs"
date: 2025-10-25
excerpt: "DP 문제, Easy 난이도."
category: "Codility Study"
tags:
  - "leetcode"
Done: true
---

- [leetcode 문제 70](https://leetcode.com/problems/climbing-stairs/?envType=study-plan-v2&envId=top-100-liked)

# 문제

You are climbing a staircase. It takes n steps to reach the top.

Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

Example 1:

Input: n = 2
Output: 2
Explanation: There are two ways to climb to the top.
1. 1 step + 1 step
2. 2 steps
Example 2:

Input: n = 3
Output: 3
Explanation: There are three ways to climb to the top.
1. 1 step + 1 step + 1 step
2. 1 step + 2 steps
3. 2 steps + 1 step
 

Constraints:

1 <= n <= 45

# 문제 풀이

단순한 DP 문제.
큰 문제를 작은 문제로 쪼갤 수 있어야 함.

동적 계획법을 효율적으로 사용할 수 있는 조건
- 큰 문제를 작은 문제로 나누었을 때 동일한 작은 문제가 반복해서 등장해야 함
- 큰 문제의 해결책은 작은 문제의 합으로 구성할 수 있어야 함

<figure>
  <img src="./images/문제70.png" alt="Climbing Stairs 문제 설명 이미지" style="max-width:100%;">
  <figcaption>LeetCode 70번 - Climbing Stairs 문제 개념도</figcaption>
</figure>

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        step_cnt_list = [-1] * (n + 1)
        step_cnt_list[0] = 0
        step_cnt_list[1] = 1
        step_cnt_list[2] = 2

        def get_cnt(n:int) -> int:
            if step_cnt_list[n] != -1:
                return step_cnt_list[n]
            max_cnt = max(get_cnt(n-2) + 1, get_cnt(n-1) + 1)
            step_cnt_list[n] = max_cnt
            return max_cnt

        return get_cnt(n)
```

> 처음 풀었던 풀이는 틀렸음. max가 아니라 더 해줘야 함. 
> 최대로 걸리는 경우가 아니라, 경우의 수를 구하는 문제니까
> n = 0일때 0으로 정의한 것도 문제 풀이와는 맞지 않음 (직관적이지 않음)

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        step_cnt_list = [-1] * (n + 1)

        step_cnt_list[1] = 1
        step_cnt_list[2] = 2

        def get_cnt(n:int) -> int:
            if step_cnt_list[n] != -1:
                return step_cnt_list[n]
            cnt = get_cnt(n-2) + get_cnt(n-1)
            step_cnt_list[n] = cnt
            return cnt

        return get_cnt(n)
```

다른 풀이도 있다는 것도 참고하자.
내가 푼 방식은 bottom - up / top - bottom으로도 풀 수 있음

---

# GPT 설명

## 🧠 1️⃣ 동적 계획법(DP)의 기본 아이디어

DP는 “큰 문제를 작은 문제로 나누어 푸는” 방법이에요.
즉, **“중복되는 하위 문제(subproblem)”**가 있을 때 이를 **저장(기억)** 해두고 재사용합니다.

예를 들어 `climbStairs(n)`을 구하려면,

```
climbStairs(n) = climbStairs(n-1) + climbStairs(n-2)
```

인데, `climbStairs(n-1)`을 계산하려면 또 그 내부에서 `climbStairs(n-2)`를 부르기 때문에 중복이 생기죠.

---

## 🪜 2️⃣ Top-Down (탑다운, “위에서 아래로”)

> ✅ “큰 문제를 먼저 해결하면서, 그 과정에서 작은 문제를 재귀적으로 호출하는 방식”

### 💡 동작 원리

* 문제를 재귀로 나누면서, 이미 계산한 결과는 **메모이제이션(memoization)** 으로 저장.
* 즉, **필요할 때 계산하고, 저장해두는** “지연 계산(lazy evaluation)” 방식.

### 🧩 예시

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        memo = {}
        
        def dp(n):
            if n in memo:
                return memo[n]
            if n <= 2:
                return n
            memo[n] = dp(n-1) + dp(n-2)
            return memo[n]
        
        return dp(n)
```

### 🧮 동작 흐름 예시 (`n=5`)

```
dp(5)
 ├─ dp(4)
 │   ├─ dp(3)
 │   │   ├─ dp(2) = 2
 │   │   └─ dp(1) = 1
 │   └─ dp(2) (이미 계산됨 → 메모 사용)
 └─ dp(3) (이미 계산됨 → 메모 사용)
```

➡ 계산 중간결과를 `memo`에 저장해서 중복 계산을 피함.

### ⚙️ 특징

| 항목    | 설명                                     |
| ----- | -------------------------------------- |
| 계산 순서 | 큰 문제 → 작은 문제 (재귀)                      |
| 구현 형태 | 재귀 함수 + 메모 딕셔너리                        |
| 장점    | 구현이 직관적, 코드 짧음                         |
| 단점    | 재귀 호출 스택이 깊어질 수 있음 (Stack Overflow 위험) |
| 복잡도   | 시간 O(n), 공간 O(n) (메모 + 재귀 스택)          |

---

## 🧩 3️⃣ Bottom-Up (바텀업, “아래에서 위로”)

> ✅ “가장 작은 문제부터 차근차근 쌓아올리는 방식”

### 💡 동작 원리

* **기저 상태(base case)**부터 시작해서, 차례로 더 큰 문제를 계산.
* 모든 하위 문제를 **명시적으로 저장하는 배열(dp table)** 을 사용.

### 🧩 예시

```python
class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        
        for i in range(3, n + 1):
            dp[i] = dp[i-1] + dp[i-2]
        
        return dp[n]
```

### 🧮 동작 흐름 (`n=5`)

```
dp[1] = 1
dp[2] = 2
dp[3] = dp[2] + dp[1] = 3
dp[4] = dp[3] + dp[2] = 5
dp[5] = dp[4] + dp[3] = 8
```

➡ 작은 문제부터 순서대로 계산하므로, 재귀 필요 X

### ⚙️ 특징

| 항목    | 설명                     |
| ----- | ---------------------- |
| 계산 순서 | 작은 문제 → 큰 문제 (반복문)     |
| 구현 형태 | 반복문 + 배열               |
| 장점    | 스택 사용 X → 메모리 안정적      |
| 단점    | 초기화 과정 필요, 코드 조금 더 길어짐 |
| 복잡도   | 시간 O(n), 공간 O(n)       |

---

## 🧠 4️⃣ 공간 최적화 (Bottom-Up 확장)

Bottom-Up 방식은 `dp[i]`가 `dp[i-1]`, `dp[i-2]`만 필요하므로,
배열을 쓰지 않고 변수 2개로 대체할 수 있습니다.

```python
prev2, prev1 = 1, 2
for _ in range(3, n + 1):
    prev2, prev1 = prev1, prev1 + prev2
return prev1
```

➡ 시간 O(n), 공간 O(1)

---

## 🧭 5️⃣ Top-Down vs Bottom-Up 비교 정리

| 구분     | Top-Down        | Bottom-Up    |
| ------ | --------------- | ------------ |
| 계산 순서  | 큰 문제 → 작은 문제    | 작은 문제 → 큰 문제 |
| 구현 방식  | 재귀 + 메모이제이션     | 반복문 + 테이블    |
| 저장 구조  | 딕셔너리 or 배열      | 배열           |
| 직관성    | 직관적 (수학식 그대로)   | 절차적 (반복문 중심) |
| 메모리 사용 | 재귀 스택 포함 → 더 큼  | 더 작음         |
| 속도     | 약간 느릴 수 있음      | 보통 더 빠름      |
| 예시     | 피보나치, DFS 기반 문제 | DP 테이블 기반 문제 |

---

## 🪄 요약

* **Top-Down** : “필요할 때 계산한다” (재귀적으로 호출하며 저장)
* **Bottom-Up** : “미리 계산해둔다” (기저 상태부터 반복문으로)
