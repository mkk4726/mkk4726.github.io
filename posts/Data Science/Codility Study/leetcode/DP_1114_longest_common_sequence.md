---
title: "1114. Longest Common Sequence"
date: "2025-11-24"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/longest-common-subsequence/description/)

---

# 문제 설명

1143. Longest Common Subsequence

**난이도:** Medium

두 문자열 `text1`과 `text2`가 주어졌을 때, 이들의 최장 공통 부분 수열(Longest Common Subsequence, LCS)의 길이를 반환하라. 공통 부분 수열이 없으면 0을 반환한다.

문자열의 *부분 수열(subsequence)*은 원래 문자열에서 일부 문자(없을 수도 있음)를 삭제하되, 남아있는 문자의 상대적인 순서는 변경하지 않고 생성한 새로운 문자열이다.
예를 들어, "ace"는 "abcde"의 부분 수열이다.

두 문자열의 *공통 부분 수열(common subsequence)*은 두 문자열 모두의 부분 수열인 문자열이다.

**예시 1:**
```
입력: text1 = "abcde", text2 = "ace"
출력: 3
설명: 최장 공통 부분 수열은 "ace"이며, 길이는 3이다.
```

**예시 2:**
```
입력: text1 = "abc", text2 = "abc"
출력: 3
설명: 최장 공통 부분 수열은 "abc"이며, 길이는 3이다.
```

**예시 3:**
```
입력: text1 = "abc", text2 = "def"
출력: 0
설명: 공통 부분 수열이 없으므로, 결과는 0이다.
```

---

# 문제 풀이

점화식 세우기

- LCS(0, 0) = 0
- LCS(i, j) = LCS(i-1, j-1) + 1 if text1[i] == text2[j]
- LCS(i, j) = max(LCS(i-1, j), LCS(i, j-1)) if text1[i] != text2[j]

같은 문자가 있으면 추가하기

DP 테이블을 2차원 배열로 구현한다.

```python
def longestCommonSubsequence(text1: str, text2: str) -> int:
    m, n = len(text1), len(text2)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    
    return dp[m][n]
```

> 주의해야하는 점! 문자가 같으면 i-1, j-1에 +1을 한다는 점. i, j-1에 +1을 하는게 아니라.



