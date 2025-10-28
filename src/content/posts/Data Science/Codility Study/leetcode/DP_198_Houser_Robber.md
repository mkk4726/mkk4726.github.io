---
title: "198. Houser Robber"
date: "2025-10-28"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/house-robber/description/?envType=study-plan-v2&envId=top-100-liked)

# 문제

길을 따라 있는 집들을 털 계획을 세우고 있는 전문 강도입니다. 각 집에는 일정한 금액의 돈이 숨겨져 있으며, 인접한 집들에 보안 시스템이 연결되어 있어 같은 밤에 두 개의 인접한 집을 털면 자동으로 경찰에 신고됩니다.

각 집의 돈의 양을 나타내는 정수 배열 `nums`가 주어졌을 때, 경찰에 신고되지 않고 오늘 밤 털 수 있는 최대 금액을 반환하세요.

## 예시

**예시 1:**
```
Input: nums = [1,2,3,1]
Output: 4
Explanation: 집 1 (돈 = 1)과 집 3 (돈 = 3)을 털어서 총 1 + 3 = 4
```

**예시 2:**
```
Input: nums = [2,7,9,3,1]
Output: 12
Explanation: 집 1 (돈 = 2), 집 3 (돈 = 9), 집 5 (돈 = 1)을 털어서 총 2 + 9 + 1 = 12
```

## 제약 조건

- `1 <= nums.length <= 100`
- `0 <= nums[i] <= 400`

---

# 풀이

문제 구조랑 풀이 자체가 어렵진 않네.
처음부터 최적의 값을 찾아나가는 문제.

현재의 최적은 (현재 값 + 2칸 전에서의 최적값 or 1칸 전에서의 최적값)
이런 구조.

> 항상 예외조건 생각해보기!!

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        best_results = [0] * len(nums)
        # 예외조건 떠올리는거 잊지말기!!
        if len(nums) == 1:
            return nums[0]
        elif len(nums) == 2:
            return max(nums[0], nums[1])

        best_results[0] = nums[0]
        best_results[1] = max(nums[0], nums[1])

        for i in range(2, len(nums)):
            best_results[i] = max(nums[i] + best_results[i-2], best_results[i-1])

        return best_results[-1]
```

# AI가 제안하는 더 나은 풀이

위의 풀이는 O(n) 공간 복잡도를 사용합니다. 하지만 실제로는 이전 두 값만 필요하므로 O(1) 공간으로 최적화할 수 있습니다.

## 공간 복잡도 최적화 풀이

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        if len(nums) == 1:
            return nums[0]
        elif len(nums) == 2:
            return max(nums[0], nums[1])
        
        # 이전 두 값만 추적
        prev2 = nums[0]  # 2칸 전 최적값
        prev1 = max(nums[0], nums[1])  # 1칸 전 최적값
        
        for i in range(2, len(nums)):
            current = max(nums[i] + prev2, prev1)
            prev2 = prev1
            prev1 = current
        
        return prev1
```

## 재귀 + 메모이제이션 풀이

```python
class Solution:
    def rob(self, nums: List[int]) -> int:
        memo = {}
        
        def dp(i):
            if i in memo:
                return memo[i]
            
            if i < 0:
                return 0
            if i == 0:
                return nums[0]
            if i == 1:
                return max(nums[0], nums[1])
            
            memo[i] = max(dp(i-1), dp(i-2) + nums[i])
            return memo[i]
        
        return dp(len(nums) - 1)
```

## 핵심 아이디어

1. **상태 정의**: `dp[i]` = i번째 집까지 고려했을 때 털 수 있는 최대 금액
2. **점화식**: `dp[i] = max(dp[i-1], dp[i-2] + nums[i])`
   - `dp[i-1]`: 현재 집을 털지 않는 경우
   - `dp[i-2] + nums[i]`: 현재 집을 털는 경우 (i-1번째 집은 털 수 없음)
3. **공간 최적화**: 이전 두 값만 필요하므로 변수 두 개로 충분

