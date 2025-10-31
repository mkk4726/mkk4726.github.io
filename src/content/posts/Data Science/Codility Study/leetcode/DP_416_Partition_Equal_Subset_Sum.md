---
title: "416. Partition Equal Subset Sum"
date: "2025-10-31"
excerpt: "DP 문제, Medium 난이도."
category: "Codility Study"
tags: ["leetcode"]
---

- [링크](https://leetcode.com/problems/partition-equal-subset-sum/description/?envType=study-plan-v2&envId=top-100-liked)

---

# 문제 정리

정수 배열 `nums`가 주어진다.

**목표:**
배열을 두 개의 subset으로 나눌 수 있는지 판단하라. 각 subset의 원소들의 합이 같아야 한다.
가능하면 `true`, 불가능하면 `false`를 반환한다.

## 예시

- Input: nums = [1,5,11,5]  
  Output: true  
  설명: [1, 5, 5]와 [11]로 나눌 수 있다 (합이 각각 11)

- Input: nums = [1,2,3,5]  
  Output: false  
  설명: 합이 같은 두 subset으로 나눌 수 없다

## 제약

- 1 <= nums.length <= 200
- 1 <= nums[i] <= 100

---

# 풀이

흠 어케 푸냐?

일단 큰 수로 정렬을 하고.
[1, 5, 5, 11]

큰 수부터 가능한지 구해볼까?
이거 좀 어렵네.



