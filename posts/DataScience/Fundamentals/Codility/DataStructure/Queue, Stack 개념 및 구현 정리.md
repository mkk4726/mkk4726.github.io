---
title: 큐랑 스택 개념 및 구현 정리
date: 2026-02-12
excerpt: 큐, 스택 개념 및 구현 정리
category: Codility
tags:
  - Queue
  - Stack
Done: true
---
# Stack 

## 개념

FILO, 선입후출. 먼저 들어간게 나중에 나오는 것

## 구현

리스트 객체로 파이썬에서는 구현할 수 있음

```python
stack = []

# push
stack.append(1)
stack.append(2)
stack.append(3)

# pop
top = stack.pop()   # 3
```


---

# Queue

## 개념

FIFO. 선입선출.
먼저 들어간게 먼저 나옴.

## 구현

deque 객체로 구현할 수 있음

```python
from collections import deque

queue = deque()

# enqueue
queue.append(1)
queue.append(2)
queue.append(3)

# dequeue
front = queue.popleft()   # 1
```
