---
title: "Deadlock에 대한 정리"
date: "2025-08-17"
excerpt: "Deadlock은 뭐고 왜 발생하는가? OCR 프로젝트에서 발생한 문제도 같이 정리"
category: "Data Engineering"
tags: ["Deadlock"]
---

# Deadlock이란?

> Deadlock(교착상태)은 두 개 이상의 프로세스나 트랜잭션이 서로가 가진 리소스를 기다리면서 무한정 대기하는 상태를 말합니다.

<figure>
<img src="/post/DataEngineering/Deadlock.png" alt="Deadlock" width="80%" />
<figcaption>Deadlock 예시</figcaption>
</figure>

P1과 P2가 리소스 A, B 둘 다를 얻어야 한다고 가정할 때,
t1에 P1이 리소스를 A를 얻고 P2가 리소스 B를 얻었다면 t2때 P1은 리소스 B를, P2는 리소스 A를 기다리게 됩니다.
하지만 서로 원하는 리소스가 상대방에게 할당되어 있기 때문에 이 두 프로세스는 무한정 기다리게 되는데 이러한 상태을 DeadLock상태라고 합니다.

출처: https://jwprogramming.tistory.com/12 [개발자를 꿈꾸는 프로그래머:티스토리]

---

# Microsoft Datalocks guide

[링크](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide?view=sql-server-ver17)
내용이 자세하게 설명되어있는게 많네. 시간날 때 읽어보자.


A deadlock occurs when two or more tasks permanently block each other by each task having a lock on a resource that the other tasks are trying to lock. For example:
- Transaction A acquires a shared lock on row 1.
- Transaction B acquires a shared lock on row 2.
- Transaction A now requests an exclusive lock on row 2, and is blocked until transaction B finishes and releases the shared lock it has on row 2.
- Transaction B now requests an exclusive lock on row 1, and is blocked until transaction A finishes and releases the shared lock it has on row 1.

The SQL Server Database Engine deadlock monitor periodically checks for tasks that are in a deadlock. 
If the monitor detects a cyclic dependency, it chooses one of the tasks as a victim and terminates its transaction with an error.

[OCR 프로젝트](/posts/Self_Development/Career/Portfolio/ocr_pipeline)에서 발생한 에러 메세지가 이 부분에 해당하는구나.

This allows the other task to complete its transaction. 
The application with the transaction that terminated with an error can retry the transaction, which usually completes after the other deadlocked transaction finishes.

