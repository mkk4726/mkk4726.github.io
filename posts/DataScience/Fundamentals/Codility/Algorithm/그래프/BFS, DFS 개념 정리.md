---
title: BFS, DFS 개념 정리
date: 2026-02-27
excerpt: 그래프 탐색 기본 개념인 BFS, DFS 정리하기
category: Codility
tags:
  - 탐색
  - 그래프
Done: true
---
- [[DataScience/Fundamentals/Codility/Algorithm/그래프/그래프 기본 개념정리|그래프 기본 개념정리]]
- [[DataScience/Fundamentals/Codility/DataStructure/Queue, Stack 개념 및 구현 정리|Queue, Stack 개념 및 구현 정리]]

기본적인 알고리즘은 말로 설명할 수 있어야 함

---

키워드 정리
- 깊이 우선 탐색
    - 스택
    - 재귀
        - 재귀는 언어 런타임이 관리하는 **call stack**을 활용한 DFS의 implicit stack 구현이다.
    - backtracking
- 넓이 우선 탐색
    - 큐

---

# DFS

## 개념
> 한 경로를 끝까지 내려간 뒤, 더 이상 갈 수 없으면 되돌아와 다른 경로를 탐색하는 방법

![[DataScience/Fundamentals/Codility/Algorithm/그래프/images/Pasted image 20260417162836.png|672]]


## 구현

리스트로 스택 구현 가능
스택으로 구현한 DFS
```python
def dfs(graph, start):
    stack = [start]
    visited = set()

    while stack:
        node = stack.pop()
        if node in visited:
            continue

        visited.add(node)

        for next_node in graph[node]:
            stack.append(next_node)
```

방문처리를 어디서 해도 상관없음
```python
def dfs(graph, start):
    stack = [start]
    visited = set([start])  # 시작 노드도 바로 방문 처리

    while stack:
        node = stack.pop()
        print(node)  # 방문 처리 위치 (필요에 따라 변경)

        for next_node in graph[node]:
            if next_node not in visited:
                visited.add(next_node)   # 👉 push 시점에 방문 처리
                stack.append(next_node)
```


> **재귀 호출 자체가 call stack(호출 스택)** 위에서 동작하기 때문에 재귀로 DFS 구현 가능

```python
def dfs_recursive(graph, node, visited):
    visited.add(node)
    print(node)

    for next_node in graph[node]:
        if next_node not in visited:
            dfs_recursive(graph, next_node, visited)
```



---

# BFS

## 개념



## 구현

> 방문처리하는 부분 헷갈림

```python
from collections import deque

def bfs(graph, start):
    queue = deque([start])
    visited = set([start])

    while queue:
        node = queue.popleft()

        for next_node in graph[node]:
            if next_node not in visited:
                visited.add(next_node)
                queue.append(next_node)
```