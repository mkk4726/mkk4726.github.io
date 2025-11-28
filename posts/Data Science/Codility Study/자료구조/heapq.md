---
title: "heapq 개념정리"
date: "2025-08-03"
excerpt: "heapq에 대한 설명과 어떻게 사용되는지 정리"
category: "Codility Study"
tags: ["코딩 테스트 합격자 되기", "Codility Study", "자료구조"]
---

# heapq와 우선순위 큐 (Priority Queue)

<figure>
  <img src="./images/heapq.png" alt="heapq 개념도" />
  <figcaption>heapq 그림</figcaption>
</figure>


## 1. heapq란?
Python의 내장 모듈로, **최소 힙(Min Heap)**을 구현하는 모듈입니다.

```python
import heapq

# 빈 힙 생성
heap = []

# 요소 추가
heapq.heappush(heap, 5)
heapq.heappush(heap, 2)
heapq.heappush(heap, 8)
heapq.heappush(heap, 1)

print(heap)  # [1, 2, 8, 5] - 최솟값이 루트에 위치
```

## 2. 기본 메서드들

### 요소 추가
```python
heapq.heappush(heap, item)  # 힙에 요소 추가
```

### 최솟값 제거 및 반환
```python
min_value = heapq.heappop(heap)  # 최솟값 제거하고 반환
```

### 리스트를 힙으로 변환
```python
numbers = [5, 2, 8, 1, 9]
heapq.heapify(numbers)  # 리스트를 힙으로 변환
print(numbers)  # [1, 2, 8, 5, 9]
```

### 최솟값 확인 (제거하지 않음)
```python
min_value = heap[0]  # 힙의 루트 노드 확인
```

## 3. 우선순위 큐 구현

### 기본 우선순위 큐
```python
import heapq

class PriorityQueue:
    def __init__(self):
        self.heap = []
    
    def push(self, item):
        heapq.heappush(self.heap, item)
    
    def pop(self):
        return heapq.heappop(self.heap)
    
    def peek(self):
        return self.heap[0] if self.heap else None
    
    def is_empty(self):
        return len(self.heap) == 0

# 사용 예시
pq = PriorityQueue()
pq.push(5)
pq.push(2)
pq.push(8)
pq.push(1)

print(pq.pop())  # 1 (가장 작은 값)
print(pq.pop())  # 2
```

### 튜플을 이용한 우선순위 큐
```python
# (우선순위, 데이터) 형태로 저장
pq = []
heapq.heappush(pq, (3, "task3"))
heapq.heappush(pq, (1, "task1"))
heapq.heappush(pq, (2, "task2"))

print(heapq.heappop(pq))  # (1, "task1") - 우선순위가 가장 높은 것
```

## 4. 최대 힙 구현

### 방법 1: 음수 변환
```python
# 최대 힙을 원할 때는 음수로 변환
numbers = [5, 2, 8, 1, 9]
max_heap = [-x for x in numbers]
heapq.heapify(max_heap)

# 최댓값 추출
max_value = -heapq.heappop(max_heap)
print(max_value)  # 9
```

### 방법 2: 튜플 사용
```python
# (-우선순위, 데이터) 형태
max_heap = []
heapq.heappush(max_heap, (-5, "task5"))
heapq.heappush(max_heap, (-2, "task2"))
heapq.heappush(max_heap, (-8, "task8"))

priority, task = heapq.heappop(max_heap)
print(f"우선순위: {-priority}, 작업: {task}")  # 우선순위: 8, 작업: task8
```

## 5. heapq를 사용하는 알고리즘들

### 5.1 다익스트라 알고리즘 (Dijkstra's Algorithm)
**목적**: 가중 그래프에서 최단 경로 찾기

```python
import heapq

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    pq = [(0, start)]
    
    while pq:
        current_dist, current_node = heapq.heappop(pq)
        
        if current_dist > distances[current_node]:
            continue
            
        for neighbor, weight in graph[current_node].items():
            distance = current_dist + weight
            
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(pq, (distance, neighbor))
    
    return distances
```

### 5.2 프림 알고리즘 (Prim's Algorithm)
**목적**: 최소 신장 트리(MST) 찾기

```python
def prim(graph, start):
    mst = []
    visited = set()
    pq = [(0, start, None)]  # (가중치, 노드, 부모)
    
    while pq:
        weight, node, parent = heapq.heappop(pq)
        
        if node in visited:
            continue
            
        visited.add(node)
        if parent is not None:
            mst.append((parent, node, weight))
        
        for neighbor, edge_weight in graph[node].items():
            if neighbor not in visited:
                heapq.heappush(pq, (edge_weight, neighbor, node))
    
    return mst
```

### 5.3 A* 알고리즘
**목적**: 휴리스틱을 사용한 최단 경로 찾기

```python
def a_star(graph, start, goal, heuristic):
    pq = [(0, start, [start])]  # (f_score, node, path)
    g_score = {start: 0}
    f_score = {start: heuristic(start, goal)}
    
    while pq:
        current_f, current, path = heapq.heappop(pq)
        
        if current == goal:
            return path
            
        for neighbor, weight in graph[current].items():
            tentative_g = g_score[current] + weight
            
            if neighbor not in g_score or tentative_g < g_score[neighbor]:
                g_score[neighbor] = tentative_g
                f_score[neighbor] = tentative_g + heuristic(neighbor, goal)
                heapq.heappush(pq, (f_score[neighbor], neighbor, path + [neighbor]))
    
    return None
```

### 5.4 허프만 코딩 (Huffman Coding)
**목적**: 데이터 압축을 위한 가변 길이 인코딩

```python
from collections import Counter

def huffman_coding(text):
    # 빈도수 계산
    freq = Counter(text)
    
    # 힙에 모든 문자 추가
    heap = [[freq[char], char] for char in freq]
    heapq.heapify(heap)
    
    # 허프만 트리 구성
    while len(heap) > 1:
        left = heapq.heappop(heap)
        right = heapq.heappop(heap)
        
        # 새로운 노드 생성
        new_node = [left[0] + right[0], left, right]
        heapq.heappush(heap, new_node)
    
    return heap[0]  # 루트 노드
```

### 5.5 Top K 문제
**목적**: 배열에서 상위 K개의 요소 찾기

```python
def find_top_k(nums, k):
    # 최소 힙을 사용해서 상위 K개 유지
    heap = []
    
    for num in nums:
        heapq.heappush(heap, num)
        if len(heap) > k:
            heapq.heappop(heap)  # 가장 작은 값 제거
    
    return sorted(heap, reverse=True)  # 내림차순 정렬

# 사용 예시
nums = [3, 2, 1, 5, 6, 4]
print(find_top_k(nums, 2))  # [6, 5] - 상위 2개
```

### 5.6 중간값 찾기 (Median)
**목적**: 스트리밍 데이터에서 중간값 유지

```python
class MedianFinder:
    def __init__(self):
        self.max_heap = []  # 왼쪽 절반 (최대 힙)
        self.min_heap = []  # 오른쪽 절반 (최소 힙)
    
    def addNum(self, num):
        # 최대 힙에 추가
        heapq.heappush(self.max_heap, -num)
        
        # 균형 맞추기
        if self.max_heap and self.min_heap and -self.max_heap[0] > self.min_heap[0]:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        
        # 크기 균형 맞추기
        if len(self.max_heap) > len(self.min_heap) + 1:
            val = -heapq.heappop(self.max_heap)
            heapq.heappush(self.min_heap, val)
        elif len(self.min_heap) > len(self.max_heap):
            val = heapq.heappop(self.min_heap)
            heapq.heappush(self.max_heap, -val)
    
    def findMedian(self):
        if len(self.max_heap) > len(self.min_heap):
            return -self.max_heap[0]
        return (-self.max_heap[0] + self.min_heap[0]) / 2
```

### 5.7 병합 K개 정렬된 리스트
**목적**: K개의 정렬된 리스트를 하나로 병합

```python
def merge_k_sorted_lists(lists):
    pq = []
    result = []
    
    # 각 리스트의 첫 번째 요소를 힙에 추가
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(pq, (lst[0], i, 0))
    
    while pq:
        val, list_idx, element_idx = heapq.heappop(pq)
        result.append(val)
        
        # 다음 요소가 있으면 힙에 추가
        if element_idx + 1 < len(lists[list_idx]):
            heapq.heappush(pq, (lists[list_idx][element_idx + 1], list_idx, element_idx + 1))
    
    return result
```

## 6. 시간복잡도
- **삽입**: O(log n)
- **삭제**: O(log n)
- **최솟값 확인**: O(1)
- **힙 생성**: O(n)

## 7. 코딩테스트 팁

### 자주 사용되는 패턴
```python
# 1. 최소값/최대값 유지
min_heap = []
max_heap = []

# 2. 우선순위와 함께 데이터 저장
pq = [(priority, data)]

# 3. 여러 정보를 튜플로 저장
pq = [(cost, node, path)]

# 4. 음수 변환으로 최대 힙 구현
max_heap = [-x for x in numbers]
```

### 주의사항
1. **튜플 비교**: 첫 번째 요소부터 순서대로 비교
2. **같은 우선순위**: 두 번째 요소로 구분
3. **최대 힙**: 음수 변환 또는 `(-priority, data)` 형태
4. **중복 방문**: 방문 체크 필수 (다익스트라 등)

**핵심 포인트:**
- `heapq`는 **최소 힙**을 구현
- **우선순위 큐**의 기본 구현체
- **그래프 알고리즘**에서 필수적
- **실시간 데이터 처리**에 유용
- **메모리 효율적**인 자료구조 