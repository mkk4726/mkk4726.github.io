---
title: "279. Perfect Squares"
date: "2025-10-28"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/perfect-squares/?envType=study-plan-v2&envId=top-100-liked)

# 문제

정수 n이 주어졌을 때, n을 완전제곱수들의 합으로 나타낼 때 필요한 최소 개수를 반환하라.

완전제곱수는 어떤 정수의 제곱인 정수이다. 예를 들어, 1, 4, 9, 16은 완전제곱수이지만 3과 11은 아니다.

## 예시

**예시 1:**
- Input: n = 12
- Output: 3
- Explanation: 12 = 4 + 4 + 4

**예시 2:**
- Input: n = 13  
- Output: 2
- Explanation: 13 = 4 + 9

## 제약사항

- 1 <= n <= 10^4


# 풀이

유형은 눈에 들어오는데 점화식이 바로 세워지진 않네.

<figure>
  <img src="/post/Codility%20Study/leetcode/문제279.png" alt="문제 스케치" style="max-width:100%;">
  <figcaption>LeetCode 279번. 문제 스케치</figcaption>
</figure>

```python
class Solution:
    def numSquares(self, n: int) -> int:
        cnt_list = [0] * (n + 1)

        # square -> cnt 1
        for i in range(1, n+1):
            tmp = i ** 2
            if tmp > n:
                break
            cnt_list[tmp] = 1

        def find_cnt(n):
            if cnt_list[n] != 0:
                return cnt_list[n]

            min_count = n
            for i in range(1, n+1):
                tmp = i ** 2
                if tmp > n:
                    break
                min_count = min(min_count, find_cnt(n - tmp))
            cnt_list[n] = min_count + 1
            return cnt_list[n]
        
        return find_cnt(n)
```

# AI가 제안하는 풀이

## 접근 방법

이 문제는 전형적인 Dynamic Programming 문제입니다. 각 숫자 i에 대해 최소 완전제곱수 개수를 구하는 방식으로 해결할 수 있습니다.

핵심 아이디어:
- dp[i] = 숫자 i를 만들기 위한 최소 완전제곱수 개수
- dp[i] = min(dp[i], dp[i - j²] + 1) for all j where j² ≤ i

## 최적화된 풀이

```python
class Solution:
    def numSquares(self, n: int) -> int:
        # dp[i] = 숫자 i를 만들기 위한 최소 완전제곱수 개수
        dp = [float('inf')] * (n + 1)
        dp[0] = 0  # 0을 만들기 위한 완전제곱수 개수는 0개
        
        # 1부터 n까지 각 숫자에 대해 최소 개수 계산
        for i in range(1, n + 1):
            # i보다 작거나 같은 모든 완전제곱수에 대해 확인
            j = 1
            while j * j <= i:
                dp[i] = min(dp[i], dp[i - j * j] + 1)
                j += 1
        
        return dp[n]
```

## 시간복잡도 분석

- 시간복잡도: O(n * √n) - 각 숫자 i에 대해 √i개의 완전제곱수를 확인
- 공간복잡도: O(n) - dp 배열 사용

## 추가 최적화 (BFS 접근법)

```python
class Solution:
    def numSquares(self, n: int) -> int:
        from collections import deque
        
        # 완전제곱수들 미리 계산
        squares = [i * i for i in range(1, int(n ** 0.5) + 1)]
        
        queue = deque([(n, 0)])  # (남은 수, 사용한 완전제곱수 개수)
        visited = {n}
        
        while queue:
            num, count = queue.popleft()
            
            if num == 0:
                return count
            
            for square in squares:
                if square > num:
                    break
                next_num = num - square
                if next_num not in visited:
                    visited.add(next_num)
                    queue.append((next_num, count + 1))
        
        return -1
```

BFS 접근법은 최단 경로를 찾는 문제로 해석하여 더 효율적일 수 있습니다.