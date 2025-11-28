---
title: "python의 GIL에 대해서"
date: "2025-09-17"
excerpt: "Global Interpreter Lock에 대해 정리"
category: "Computer Science"
tags: ["python", "GIL"]
---

참고자료
- [1](https://only-wanna.tistory.com/entry/Python-Global-Interpreter-LockGIL%EC%9D%80-%EC%99%9C-%EB%8F%84%EC%9E%85%EB%90%90%EA%B3%A0-%EC%96%B4%EB%96%A4-%ED%8A%B9%EC%A7%95%EC%9D%B4-%EC%9E%88%EB%82%98%EC%9A%94)
- [2](https://news.hada.io/topic?id=23116)
- [3](https://labs.quansight.org/blog/scaling-asyncio-on-free-threaded-python)

---


파이썬에서 비동기, 멀티쓰레드 등을 구현하다보면 GIL이라는 키워드를 마주하게 된다.
GIL이란 뭘까?

# GIL (1) ?

> GIL은 파이썬에만 존재하는 독특한 개념으로 파이썬에서 멀티스레딩을 할 때 다수의 스레드가 동시에 파이썬 바이트 코드를 실행하지 못하게 막는 일종의 뮤텍스(Mutex)이다.

Global Interpreter Lock
> GIL은 문자 그대로 인터프리터에 대한 Lock이다.

<figure>
<img src="./images/GIL_그림1.png" alt="GIL" /><width="80%" />
<figcaption>GIL 예시 (1)</figcaption>
</figure>

Lock은 인터프리터가 여러 스레드를 병렬적으로 실행하지 않도록 막는다.
따라서 파이썬에서는 멀티 쓰레딩은 병렬적(Parallel)이 아닌 동시적(Concurrent)으로 실행됨.

# 인터프리터와 GIL의 관계

인터프리터는 프로그래밍 언어의 소스 코드를 한 줄씩 읽어서 즉시 실행하는 프로그램.
파이썬의 경우, 소스 코드를 바이트코드로 변환한 후 Python Virtual Machine(PVM)에서 실행하는 방식으로 작동.

여기서 문제가 발생. 여러 스레드가 동시에 파이썬 바이트코드를 실행하려고 하면, 메모리 관리나 객체 참조 카운팅 같은 중요한 작업들이 동시에 일어나면서 데이터 무결성 문제가 생길 수 있다.

예를 들어, 한 스레드가 객체를 삭제하려고 하는 순간 다른 스레드가 그 객체를 참조하려고 하면 예상치 못한 오류가 발생할 수 있다.

이런 문제를 방지하기 위해 파이썬은 GIL을 도입. GIL은 마치 도서관에서 한 번에 한 사람만 책을 빌릴 수 있도록 하는 것과 같다. 

여러 사람(스레드)이 도서관(파이썬 인터프리터)에 와도, 한 번에 한 사람만 책(파이썬 바이트코드)을 읽을 수 있도록 제한하는 것. 
이렇게 하면 데이터 무결성은 보장되지만, 여러 스레드가 있어도 실제로는 한 번에 하나의 스레드만 파이썬 코드를 실행하게 됨.

# GIL이 필요한 이유

<figure>
<img src="./images/ThreadMemory.png" alt="ThreadMemory" /><width="80%" />
<figcaption>ThreadMemory</figcaption>
</figure>

> 파이썬이 GIL를 도입한 이유는 멀티 스레드 환경에서 발생할 수 있는 Race Condition(경쟁 상태)를 방지하기 위함이다. 
> 그래서 GIL은 경쟁 상태를 방지하기 위해 도입된 Lock이라고 생각하면 된다.
> (참조 1)

**메모리 저장 위치:**
파이썬에서 생성되는 모든 객체들은 Heap 영역에 저장된다. Heap은 프로그램 실행 중에 동적으로 할당되는 메모리 영역으로, 여러 스레드가 공유할 수 있는 공간이다. 
반면 Stack 영역은 각 스레드마다 독립적으로 할당되는 메모리 공간이다. 

하지만 파이썬의 객체들은 모두 Heap에 저장되기 때문에, 여러 스레드가 같은 객체에 접근할 수 있어 Race Condition이 발생할 수 있다. 
( 파이썬의 메모리 관리 방법인 RC의 한계)


# 파이썬 메모리 관리 방법 : Reference Counting (RC)

파이썬은 메모리 관리를 위해 Reference Counting 방식을 사용.
이는 각 객체가 몇 개의 변수나 다른 객체에 의해 참조되고 있는지를 카운트하는 방식.

<figure>
<img src="./images/ReferenceCounting.png" alt="ReferenceCounting" /><width="80%" />
<figcaption>Reference Counting (RC)</figcaption>
</figure>

**Reference Counting의 작동 원리:**
- 객체가 생성되면 참조 카운트가 1이 됨
- 다른 변수가 그 객체를 참조하면 카운트가 증가
- 참조가 해제되면 카운트가 감소
- 참조 카운트가 0이 되면 자동으로 메모리에서 해제 (garbage collection)

**GIL과 Reference Counting의 관계:**
여러 스레드가 동시에 같은 객체의 참조 카운트를 수정하려고 하면 Race Condition이 발생할 수 있음.
예를 들어, 스레드 A가 참조 카운트를 읽고 증가시키려는 순간, 스레드 B가 같은 카운트를 읽고 감소시키면 데이터 불일치가 생긴다. 

GIL은 이런 문제를 방지하기 위해 한 번에 하나의 스레드만 파이썬 객체의 참조 카운트를 수정할 수 있도록 보장한다. 
이렇게 하면 Reference Counting의 안전성이 보장되지만, 동시에 멀티스레딩의 병렬 실행도 제한되는 것이다.

> 문제를 방지하려면, 자원 공유가 불가능 하도록 Mutex(뮤텍스)와 같은 Lock을 도입해야 한다.
> 하지만 파이썬의 모든 것은 객체(Heap 영역이라 공유 됨)이기에, 모두 Lock 하여 관리하는 것은 굉장히 비효율적이다. 
> 그래서 파이썬은 객체 단위 Lock 대신, 인터프리터 단위 Lock을 도입했고 그것이 바로 GIL이다.
> (참조 1)

# GIL이 없는 파이썬의 미래 (참조 2, 3 정리)

Python 3.14부터 도입된 free-threaded 빌드는 GIL을 제거하여 진정한 병렬 실행을 가능하게 했다. 이는 파이썬의 멀티스레딩 성능을 획기적으로 개선하는 중요한 변화다.

## GIL과 asyncio의 한계

기존 GIL 환경에서 asyncio는 다음과 같은 제약이 있었다:
- **단일 이벤트 루프 제한**: 각 스레드당 하나의 이벤트 루프만 실행 가능했고, GIL 때문에 여러 이벤트 루프를 병렬로 실행할 수 없었다.
- **CPU 집약적 작업의 병목**: CPU 집약적 작업을 별도 스레드로 분리해도 여전히 GIL을 획득하기 위해 경쟁해야 했다.
- **확장성 제한**: 멀티코어 환경에서 asyncio 애플리케이션의 성능 확장이 제한되었다.

## free-threaded 빌드의 핵심 개선사항

### 1. 스레드별 상태 관리

**기존 방식**: 전역 데이터 구조에 의존하여 GIL이 스레드 안전성을 보장
**새로운 방식**: 스레드별 독립적인 상태 관리로 잠금 없는 접근 가능

### 2. 작업 관리 최적화

**스레드별 원형 이중 연결 리스트**: 전역 WeakSet 대신 각 스레드가 독립적인 작업 리스트를 유지
- 약한 참조(weak reference) 제거로 성능 향상
- 잠금 경쟁 없이 작업 추가/제거 가능
- 참조 카운팅 오버헤드 완전 제거

### 3. 현재 작업 상태 개선

**스레드 상태에 저장**: "현재 작업"을 스레드 상태 구조체에 저장하여 빠른 접근 가능
- 딕셔너리 조회 없이 직접 접근
- 작업 전환 시 성능 향상

## 성능 벤치마크 결과

### TCP 성능 테스트

<figure>
<img src="./images/benchmark_1.png" alt="benchmark_1" /><width="80%" />
<figcaption>tcp benchmark</figcaption>
</figure>

- **단일 작업자**: 276 MB/s
- **6개 작업자**: GIL 빌드 532 MB/s → free-threaded 빌드 1455 MB/s (약 2.7배 향상)
- **12개 작업자**: GIL 빌드 698 MB/s → free-threaded 빌드 1924 MB/s (약 2.8배 향상)

### 웹 스크래핑 성능 (aiohttp 사용)

<figure>
<img src="./images/benchmark_2.png" alt="benchmark_2" /><width="80%" />
<figcaption>webscraping benchmark_2</figcaption>
</figure>

- **단일 작업자**: 12 stories/sec
- **12개 작업자**: GIL 빌드 35 stories/sec → free-threaded 빌드 80 stories/sec (약 2.3배 향상)

### 단일 스레드 성능도 개선
- pyperformance 벤치마크에서 10-20% 성능 향상
- 메모리 사용량 감소

## 미래 전망

이러한 변화로 인해 다음과 같은 새로운 가능성이 열렸다:

- **병렬 이벤트 루프**: 여러 이벤트 루프를 동시에 실행하여 멀티코어 활용 극대화
- **고성능 웹 서버**: FastAPI, aiohttp 등이 더욱 높은 성능으로 확장 가능
- **데이터 처리 파이프라인**: CPU 집약적 작업의 진정한 병렬 처리
- **분산 작업 큐**: 멀티스레드 환경에서 효율적인 작업 분산

free-threaded 파이썬은 asyncio의 새로운 시대를 열어주는 혁신적인 변화다.

# free-threaded가 가능해진 원리

GIL을 제거할 수 있게 된 핵심은 **Reference Counting의 문제를 해결**한 것이다. 기존에는 GIL이 Reference Counting의 Race Condition을 방지하는 역할을 했지만, 이제는 다른 방식으로 해결했다.

## 기존 GIL의 역할

GIL이 존재했던 이유는 파이썬의 Reference Counting 메모리 관리 방식 때문이었다:

```python
# 예시: 참조 카운트 증가/감소
obj = SomeObject()  # ref_count = 1
other = obj         # ref_count = 2 (GIL 보호 필요)
del obj            # ref_count = 1 (GIL 보호 필요)
del other          # ref_count = 0 → 메모리 해제 (GIL 보호 필요)
```

여러 스레드가 동시에 같은 객체의 참조 카운트를 수정하면 Race Condition이 발생할 수 있었다.

## free-threaded에서의 해결책

### 1. Per-Object Locking (객체별 잠금)

각 객체마다 개별적인 잠금을 사용하는 방식:

```python
# 각 객체가 자신만의 뮤텍스를 가짐
class PyObject:
    def __init__(self):
        self.ref_count = 1
        self.mutex = threading.Lock()  # 객체별 잠금
    
    def incref(self):
        with self.mutex:
            self.ref_count += 1
    
    def decref(self):
        with self.mutex:
            self.ref_count -= 1
            if self.ref_count == 0:
                self.dealloc()
```

### 2. Lock-Free Reference Counting

원자적 연산(atomic operations)을 사용하여 잠금 없이 참조 카운트를 관리:

```python
import threading

class PyObject:
    def __init__(self):
        self.ref_count = threading.AtomicInteger(1)  # 원자적 정수
    
    def incref(self):
        self.ref_count.fetch_add(1)  # 원자적 증가
    
    def decref(self):
        if self.ref_count.fetch_sub(1) == 1:  # 원자적 감소
            self.dealloc()
```

### 3. Biased Reference Counting

대부분의 참조가 단일 스레드에서 발생한다는 특성을 활용:

- **로컬 참조**: 스레드별 로컬 카운터 사용
- **글로벌 참조**: 여러 스레드에서 공유되는 경우에만 원자적 연산 사용

## 기술적 구현 세부사항

### 메모리 순서 보장
```c
// C 레벨에서의 원자적 연산
Py_ssize_t Py_INCREF(PyObject *op) {
    Py_ssize_t new_refcount = atomic_fetch_add(&op->ob_refcnt, 1) + 1;
    return new_refcount;
}
```

### 스레드 로컬 저장소 활용
```c
// 스레드별 상태 관리
typedef struct {
    PyObject *current_task;
    PyListObject *task_list;
} _PyThreadState;
```

## 성능 최적화

### 1. Lock Contention 감소
- 객체별 잠금으로 경쟁 범위 축소
- 핫스팟(hotspot) 객체에 대한 특별 처리

### 2. 메모리 오버헤드 최소화
- 잠금 구조체의 메모리 사용량 최적화
- 캐시 친화적인 데이터 구조 사용

### 3. 단일 스레드 성능 유지
- 단일 스레드 환경에서는 기존과 동일한 성능
- 멀티 스레드에서만 추가 오버헤드 발생

## 왜 이제 가능해졌나?

1. **하드웨어 발전**: 원자적 연산의 성능 향상
2. **컴파일러 최적화**: 더 효율적인 원자적 연산 코드 생성
3. **메모리 모델 개선**: 현대 CPU의 메모리 일관성 보장
4. **연구 성숙도**: Lock-free 프로그래밍 기법의 발전

이러한 기술적 발전으로 인해 GIL 없이도 안전하고 효율적인 멀티스레딩이 가능해졌다.