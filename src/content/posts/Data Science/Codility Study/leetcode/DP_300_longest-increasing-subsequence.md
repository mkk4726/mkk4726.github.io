---
title: "300. Longest Increasing Subsequence"
date: "2025-10-29"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [link](https://leetcode.com/problems/longest-increasing-subsequence/description/?envType=study-plan-v2&envId=top-100-liked)


# 문제

**300. Longest Increasing Subsequence**

Medium

Given an integer array `nums`, return the length of the longest strictly increasing subsequence.

**Example 1:**

```
Input: nums = [10,9,2,5,3,7,101,18]
Output: 4
Explanation: The longest increasing subsequence is [2,3,7,101], therefore the length is 4.
```

**Example 2:**

```
Input: nums = [0,1,0,3,2,3]
Output: 4
```

**Example 3:**

```
Input: nums = [7,7,7,7,7,7,7]
Output: 1
```

**Constraints:**

- `1 <= nums.length <= 2500`
- `-104 <= nums[i] <= 104`

**Follow up:** Can you come up with an algorithm that runs in `O(n log(n))` time complexity?

---

# 풀이

분명히 풀어봤던 문젠데 기억이 안나네...?
교재에 있던 문제인데

DP로 풀어야 할 것 같은데, 점화식이 잘 세워지지 않네

- 숫자가 점점 커져야 함
- 전후 관계는 유지

Input: nums = [10,9,2,5,3,7,101,18]

앞에서부터 해당 번호로 끝나는 LIS를 구함.
-> 현재의 최댓값은 max(그 전에 있는 값 중 지금 값보다 작은 값의 LIS + 1)

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        max_lfs = [1] * len(nums)

        for i in range(len(nums)):
            for j in range(i):
                if nums[j] < nums[i]:
                    max_lfs[i] = max(max_lfs[i], 1 + max_lfs[j])
        return max(max_lfs)
```

근데 이 풀이면 O(N^2)이란 말이지.
O(N log(N))으로는 어떻게 풀지?

---

# AI 풀이

O(n log n) 해결책은 **이진 탐색(Binary Search)**과 **Patience Sorting** 알고리즘을 활용합니다. 핵심 아이디어는 각 길이의 LIS에서 가능한 **가장 작은 마지막 원소**를 유지하는 것입니다.

## 알고리즘 설명

1. 배열을 순회하면서, 현재 원소를 처리합니다.
2. 이진 탐색으로 현재 원소가 들어갈 수 있는 위치를 찾습니다.
   - 현재 원소가 배열의 마지막 원소보다 크면 → 뒤에 추가
   - 그렇지 않으면 → 더 작은 원소로 교체 가능
3. 배열의 길이가 LIS의 길이가 됩니다.

예를 들어 `nums = [10,9,2,5,3,7,101,18]`을 처리하면:

```
i=0: [10]
i=1: [9]      # 9 < 10이므로 교체
i=2: [2]      # 2 < 9이므로 교체
i=3: [2, 5]   # 5 > 2이므로 추가
i=4: [2, 3]   # 3이 5보다 작으므로 교체 (더 작은 마지막 원소)
i=5: [2, 3, 7]  # 7 > 3이므로 추가
i=6: [2, 3, 7, 101]  # 101 > 7이므로 추가
i=7: [2, 3, 7, 18]  # 18이 101보다 작으므로 교체
```

최종 길이: 4

## 코드

```python
class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tail = []
        
        for num in nums:
            # 이진 탐색으로 num이 들어갈 위치 찾기
            left, right = 0, len(tail)
            
            while left < right:
                mid = (left + right) // 2
                if tail[mid] < num:
                    left = mid + 1
                else:
                    right = mid
            
            # 위치가 tail의 길이와 같으면 추가, 아니면 교체
            if left == len(tail):
                tail.append(num)
            else:
                tail[left] = num
        
        return len(tail)
```

또는 Python의 `bisect` 모듈을 사용하면 더 간결합니다:

```python
import bisect

class Solution:
    def lengthOfLIS(self, nums: List[int]) -> int:
        tail = []
        
        for num in nums:
            pos = bisect.bisect_left(tail, num)
            if pos == len(tail):
                tail.append(num)
            else:
                tail[pos] = num
        
        return len(tail)
```

## 시간 복잡도

- 시간 복잡도: O(n log n)
  - 각 원소당 이진 탐색: O(log n)
  - n개 원소 처리: O(n)
- 공간 복잡도: O(n)
  - 최악의 경우 모든 원소가 저장될 수 있음

## 참고

이 방법은 LIS의 **길이**만 구할 수 있고, 실제 LIS 수열을 구하려면 추가 로직이 필요합니다.

