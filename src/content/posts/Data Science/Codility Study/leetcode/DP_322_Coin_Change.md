---
title: "322. Coin Change"
date: "2025-10-30"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/coin-change/description/?envType=study-plan-v2&envId=top-100-liked)


---

# 문제 정리

정수 배열 `coins`와 정수 `amount`가 주어진다. 각 `coins[i]`는 서로 다른 동전의 단위며, 각 동전은 무한 개씩 사용할 수 있다.

**목표:**
`coins`에 있는 동전들로 합이 정확히 `amount`가 되도록 만들 때, 필요한 동전 개수의 최솟값을 구하라.
만들 수 없다면 -1을 반환한다.

## 예시

- Input: coins = [1,2,5], amount = 11  
  Output: 3  
  설명: 11 = 5 + 5 + 1

- Input: coins = [2], amount = 3  
  Output: -1

- Input: coins = [1], amount = 0  
  Output: 0

## 제약

- 1 <= coins.length <= 12
- 1 <= coins[i] <= 2³¹ - 1
- 0 <= amount <= 10⁴


---

# 풀이

이것도 그냥 단순한 dp 문제네. medium정도는 이제 쉽다.
항상 예외처리 신경쓰기! 범위보면서 test case 생각하기

내 풀이

예외처리 생각못해서 처음에 틀렸음 -> 라이브 코테라면 상관없겠지만(?) 주의하자.

```python
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        if amount == 0:
            return 0
        
        min_cnt_list = [-1] * (amount + 1)
        for coin in coins:
            if coin <= amount:
                min_cnt_list[coin] = 1
        
        def dp(amount):
            if min_cnt_list[amount] != -1:
                return min_cnt_list[amount]
            
            # 구할 수 없는 경우에 대한 처리가 안되고 있음
            min_cnt = 1e5
            for coin in coins:
                if amount - coin >= 0:
                    min_cnt = min(dp(amount - coin) + 1, min_cnt)    
                
            min_cnt_list[amount] = min_cnt
            return min_cnt
        
        answer = dp(amount)
        if answer == 1e5:
            return -1
        else:
            return answer
```


---

# AI 풀이

더 효율적인 풀이로, Top-down(재귀+메모이제이션) 대신 Bottom-up 방식의 DP(반복문)도 많이 사용됩니다. 불필요한 재귀 호출 없이 메모리와 시간이 모두 절약됩니다.

```python
from typing import List
class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for coin in coins:
            for x in range(coin, amount + 1):
                dp[x] = min(dp[x], dp[x - coin] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1
```

- `dp[x]`: 금액 x를 만들기 위한 최소 동전 개수
- dp[0]은 항상 0으로 시작(=동전 0개 필요)
- 각 동전에 대해 반복적으로 업데이트하며, 이전 값을 계속 참고
- 최종 답이 unreachable이면 -1 반환

