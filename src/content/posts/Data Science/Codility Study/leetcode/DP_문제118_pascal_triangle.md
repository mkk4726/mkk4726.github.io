---
title: "118. Pascal's Triangle"
date: "2025-10-28"
excerpt: "DP 문제, Easy 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/pascals-triangle/description/?envType=study-plan-v2&envId=top-100-liked)

# 문제

**118. Pascal's Triangle**  
**난이도:** Easy

정수 `numRows`가 주어졌을 때, Pascal's triangle의 첫 `numRows`개 행을 반환하세요.

Pascal's triangle에서 각 숫자는 바로 위의 두 숫자의 합입니다:

```
    1
   1 1
  1 2 1
 1 3 3 1
1 4 6 4 1
```

**예시 1:**
```
Input: numRows = 5
Output: [[1],[1,1],[1,2,1],[1,3,3,1],[1,4,6,4,1]]
```

**예시 2:**
```
Input: numRows = 1
Output: [[1]]
```

**제약조건:**
- 1 <= numRows <= 30


---

# 내 풀이

단순한 DP 문제입니다. 작은 문제로 어떻게 쪼갤 수 있는지만 생각하면 됐습니다.

**접근 방법:**
- 각 행의 첫 번째와 마지막 원소는 항상 1
- 중간 원소들은 이전 행의 인접한 두 원소의 합
- memoization을 사용해 중복 계산 방지

<figure>
  <img src="/post/Codility%20Study/leetcode/문제118.png" alt="Pascal's Triangle 문제 설명 이미지" style="max-width:100%;">
  <figcaption>LeetCode 118번 문제 스케치</figcaption>
</figure>

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        memo = {}
        memo[1] = [1]
        memo[2] = [1, 1]
        
        def dp(n):
            if n in memo:
                return memo[n]
            
            result = [0] * n
            result[0] = 1
            result[-1] = 1

            prev_result = dp(n-1)
            for i in range(1, n-1):
                result[i] = prev_result[i-1] + prev_result[i]

            memo[n] = result
            return result

        answer = []
        for i in range(numRows):
            answer.append(dp(i + 1))
        return answer
```

**시간복잡도:** O(numRows²)  
**공간복잡도:** O(numRows²)

---

# 더 나은 풀이

## Iterative 방식 (더 간단하고 효율적)

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        result = []
        
        for i in range(numRows):
            row = [1] * (i + 1)  # 각 행은 i+1개의 원소를 가짐
            
            # 중간 원소들 계산 (첫 번째와 마지막은 이미 1)
            for j in range(1, i):
                row[j] = result[i-1][j-1] + result[i-1][j]
            
            result.append(row)
        
        return result
```

## 공간 최적화 버전

```python
class Solution:
    def generate(self, numRows: int) -> List[List[int]]:
        result = []
        prev_row = []
        
        for i in range(numRows):
            curr_row = [1] * (i + 1)
            
            for j in range(1, i):
                curr_row[j] = prev_row[j-1] + prev_row[j]
            
            result.append(curr_row)
            prev_row = curr_row
        
        return result
```

**핵심 포인트:**
- Pascal's triangle의 각 원소는 이전 행의 인접한 두 원소의 합
- 첫 번째와 마지막 원소는 항상 1
- Iterative 방식이 recursive + memoization보다 더 직관적이고 효율적

