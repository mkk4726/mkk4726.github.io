---
title: "의존성 주입 패턴으로 코드 품질 향상하기"
date: 2025-07-14
excerpt: "의존성 주입 패턴을 통해 코드의 결합도를 낮추고 테스트 용이성을 높이는 방법을 실제 예제와 함께 설명합니다."
category: "Data Science"
tags:
  - "python"
  - "design-pattern"
  - "dependency-injection"
  - "software-architecture"
  - "clean-code"
  - "testing"
public: true
---

# 배경

최근에 대화형 AI 챗봇 프로젝트를 개발하면서 겪었던 코드 구조의 문제점들과, 이를 의존성 주입 패턴으로 개선한 경험을 정리해보았습니다.

## 프로젝트 상황

- **FastAPI 기반 웹 애플리케이션**
- **OpenAI GPT 모델을 활용한 대화형 검색 시스템**
- **ChromaDB를 사용한 벡터 검색**
- **사용자별 대화 세션 관리**

## 겪었던 문제점들

### 1. 강한 결합 (Tight Coupling)
클래스들이 서로 너무 밀접하게 연결되어 있어서, 하나를 수정하면 다른 것들도 함께 수정해야 하는 상황이 발생했습니다.

### 2. 하드코딩된 설정
모델명, 데이터베이스 경로, API 키 등이 코드에 직접 작성되어 있어서 환경별로 설정을 바꾸기 어려웠습니다.

### 3. 테스트 어려움
각 컴포넌트를 독립적으로 테스트하기 어려워서, 전체 시스템을 실행해야만 테스트할 수 있었습니다.

# 관련 개념들 정리

## 강한 결합 (Tight Coupling) - 쉽게 이해하기

### 🏠 집 짓기 비유

**강한 결합의 예시:**
```python
# 문제가 있는 코드 - 강한 결합
class 집:
    def __init__(self):
        # 집이 직접 벽돌공장을 만들어서 벽돌을 가져옴
        self.벽돌공장 = 벽돌공장()
        self.벽돌 = self.벽돌공장.벽돌만들기()
        
        # 집이 직접 목수공장을 만들어서 문을 가져옴
        self.목수공장 = 목수공장()
        self.문 = self.목수공장.문만들기()
```

**문제점:**
- 집이 벽돌공장과 목수공장을 직접 알고 있어야 함
- 다른 재료(콘크리트, 알루미늄)로 바꾸려면 집 클래스를 수정해야 함
- 테스트할 때 진짜 공장 대신 가짜 공장을 사용하기 어려움

**해결책 - 느슨한 결합:**
```python
# 개선된 코드 - 느슨한 결합
class 집:
    def __init__(self, 벽돌제공자, 문제공자):
        # 외부에서 벽돌과 문을 받아옴
        self.벽돌 = 벽돌제공자.벽돌만들기()
        self.문 = 문제공자.문만들기()

# 사용할 때
집1 = 집(벽돌공장(), 목수공장())
집2 = 집(콘크리트공장(), 알루미늄공장())  # 쉽게 바꿀 수 있음!
```

### 실제 코드 예시

```python
# 강한 결합 - 문제가 있는 코드
class ChatBot:
    def __init__(self):
        # 직접 의존성을 생성
        self.llm = OpenAI(model="gpt-4")  # OpenAI에 강하게 결합
        self.database = ChromaDB(path="./db")  # ChromaDB에 강하게 결합
        self.scheduler = APScheduler()  # APScheduler에 강하게 결합

# 느슨한 결합 - 개선된 코드
class ChatBot:
    def __init__(self, llm_provider, database, scheduler):
        # 외부에서 의존성을 주입받음
        self.llm = llm_provider
        self.database = database
        self.scheduler = scheduler
```

## 하드코딩된 설정 - 왜 문제인가?

### 🍕 피자 주문 비유

**하드코딩된 설정의 문제:**
```python
# 문제가 있는 코드
class 피자집:
    def __init__(self):
        self.토핑 = "페퍼로니"  # 하드코딩!
        self.크기 = "라지"      # 하드코딩!
        self.가격 = 20000       # 하드코딩!

# 모든 피자가 똑같이 나옴 😞
피자1 = 피자집()  # 항상 페퍼로니 라지 20000원
피자2 = 피자집()  # 항상 페퍼로니 라지 20000원
```

**개선된 코드:**
```python
# 설정 파일 사용
class 피자설정:
    def __init__(self):
        self.기본토핑 = "페퍼로니"
        self.기본크기 = "라지"
        self.기본가격 = 20000

class 피자집:
    def __init__(self, 설정):
        self.토핑 = 설정.기본토핑
        self.크기 = 설정.기본크기
        self.가격 = 설정.기본가격

# 환경별로 다른 설정 사용 가능
개발설정 = 피자설정()
개발설정.기본토핑 = "치즈"  # 개발환경은 치즈

운영설정 = 피자설정()
운영설정.기본토핑 = "페퍼로니"  # 운영환경은 페퍼로니
```

### 실제 코드 예시

```python
# 하드코딩된 설정 - 문제가 있는 코드
class AI챗봇:
    def __init__(self):
        self.model = "gpt-4o-mini-2024-07-18"  # 하드코딩!
        self.api_key = "sk-1234567890abcdef"   # 하드코딩!
        self.db_path = "./db/chroma_db"        # 하드코딩!

# 개선된 코드 - 설정 파일 사용
import os
from pydantic import BaseSettings

class Settings(BaseSettings):
    model: str = "gpt-4o-mini-2024-07-18"
    api_key: str = ""
    db_path: str = "./db/chroma_db"
    
    class Config:
        env_file = ".env"  # 환경변수 파일에서 읽어옴

class AI챗봇:
    def __init__(self, settings: Settings):
        self.model = settings.model
        self.api_key = settings.api_key
        self.db_path = settings.db_path

# 사용
settings = Settings()
챗봇 = AI챗봇(settings)
```

## 의존성 주입 (Dependency Injection) - 핵심 개념

### 🎯 의존성 주입이란?

**의존성(Dependency)**: 객체가 동작하기 위해 필요한 다른 객체들
**주입(Injection)**: 외부에서 그 객체들을 제공해주는 것

### 🚗 자동차 비유

```python
# 의존성 주입 없이 - 문제가 있는 코드
class 자동차:
    def __init__(self):
        # 자동차가 직접 엔진을 만듦
        self.엔진 = 가솔린엔진()  # 가솔린엔진에 강하게 결합
        self.타이어 = 미쉐린타이어()  # 미쉐린타이어에 강하게 결합

# 문제점:
# 1. 전기차로 바꾸려면 자동차 클래스를 수정해야 함
# 2. 테스트할 때 진짜 엔진 대신 가짜 엔진을 사용할 수 없음
# 3. 다른 브랜드 타이어로 바꾸기 어려움

# 의존성 주입 사용 - 개선된 코드
class 자동차:
    def __init__(self, 엔진, 타이어):
        # 외부에서 엔진과 타이어를 받아옴
        self.엔진 = 엔진
        self.타이어 = 타이어

# 사용할 때
가솔린차 = 자동차(가솔린엔진(), 미쉐린타이어())
전기차 = 자동차(전기엔진(), 한국타이어())  # 쉽게 바꿀 수 있음!

# 테스트할 때
테스트차 = 자동차(가짜엔진(), 가짜타이어())  # 가짜 부품으로 테스트 가능!
```

### 실제 코드 예시

```python
# 의존성 주입 없이
class ChatBot:
    def __init__(self):
        self.llm = OpenAI(model="gpt-4")  # 직접 생성
        self.db = ChromaDB(path="./db")   # 직접 생성

# 의존성 주입 사용
class ChatBot:
    def __init__(self, llm_provider, database):
        self.llm = llm_provider  # 외부에서 주입
        self.database = database  # 외부에서 주입

# 사용할 때
챗봇1 = ChatBot(OpenAI(model="gpt-4"), ChromaDB(path="./db"))
챗봇2 = ChatBot(Anthropic(model="claude"), Pinecone(index="my-index"))

# 테스트할 때
테스트챗봇 = ChatBot(MockLLM(), MockDatabase())
```

## 팩토리 패턴 (Factory Pattern) - 객체 생산 공장

### 🏭 공장 비유

**팩토리 패턴이란?** 객체를 만드는 전용 공장을 따로 두는 패턴

```python
# 팩토리 없이 - 문제가 있는 코드
class 피자집:
    def __init__(self):
        # 피자집이 직접 재료를 준비
        self.도우 = 밀가루도우()
        self.소스 = 토마토소스()
        self.치즈 = 모짜렐라치즈()

# 문제점: 피자집이 재료 준비 방법을 모두 알아야 함

# 팩토리 패턴 사용 - 개선된 코드
class 재료공장:
    def 도우만들기(self):
        return 밀가루도우()
    
    def 소스만들기(self):
        return 토마토소스()
    
    def 치즈만들기(self):
        return 모짜렐라치즈()

class 피자집:
    def __init__(self, 재료공장):
        self.공장 = 재료공장
        self.도우 = self.공장.도우만들기()
        self.소스 = self.공장.소스만들기()
        self.치즈 = self.공장.치즈만들기()

# 사용
공장 = 재료공장()
피자집 = 피자집(공장)
```

### 실제 코드 예시

```python
# LLM Factory
class LLMFactory:
    def __init__(self, config):
        self.config = config
    
    def create_refine_llm(self):
        return OpenAI(
            model=self.config.get("refine_model", "gpt-4o-mini"),
            api_key=self.config.get("api_key")
        )
    
    def create_answer_llm(self):
        return OpenAI(
            model=self.config.get("answer_model", "gpt-4o"),
            api_key=self.config.get("api_key")
        )

# 사용
config = {"refine_model": "gpt-4o-mini", "answer_model": "gpt-4o"}
factory = LLMFactory(config)

refine_llm = factory.create_refine_llm()
answer_llm = factory.create_answer_llm()
```

## 싱글톤 패턴 (Singleton Pattern) - 하나만 존재하는 객체

### 👑 왕 비유

**싱글톤 패턴이란?** 클래스의 인스턴스가 하나만 존재하도록 보장하는 패턴

```python
# 일반적인 클래스 - 여러 인스턴스 생성 가능
class 일반사람:
    def __init__(self, 이름):
        self.이름 = 이름

사람1 = 일반사람("김철수")
사람2 = 일반사람("이영희")
print(사람1 is 사람2)  # False - 다른 객체

# 싱글톤 패턴 - 하나만 존재
class 왕:
    _instance = None  # 클래스 변수로 인스턴스 저장
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.이름 = "현재왕"
        return cls._instance

왕1 = 왕()
왕2 = 왕()
print(왕1 is 왕2)  # True - 같은 객체!
```

### 실제 코드 예시

```python
# 데이터베이스 연결 - 싱글톤 패턴
class DatabaseConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.connection = create_database_connection()
        return cls._instance
    
    def get_connection(self):
        return self.connection

# 사용
db1 = DatabaseConnection()
db2 = DatabaseConnection()
print(db1 is db2)  # True - 같은 연결 객체
```

## 프로토콜 (Protocol) - 인터페이스 정의

### 📋 계약서 비유

**프로토콜이란?** 객체가 어떤 메서드를 가져야 하는지 정의하는 "계약서"

```python
# 프로토콜 없이 - 문제가 있는 코드
class ChatBot:
    def __init__(self, llm):
        self.llm = llm
    
    def 대화하기(self, 메시지):
        # llm이 generate 메서드를 가지고 있다고 가정
        return self.llm.generate(메시지)  # 런타임에 에러 가능!

# 문제점: llm 객체가 generate 메서드가 없으면 에러 발생

# 프로토콜 사용 - 개선된 코드
from typing import Protocol

class LLMProvider(Protocol):
    """LLM 제공자는 반드시 generate 메서드를 가져야 함"""
    def generate(self, message: str) -> str:
        ...

class ChatBot:
    def __init__(self, llm: LLMProvider):  # 타입 힌트로 검증
        self.llm = llm
    
    def 대화하기(self, 메시지):
        return self.llm.generate(메시지)  # 안전!

# 사용
class OpenAI:
    def generate(self, message: str) -> str:
        return f"OpenAI: {message}"

class Anthropic:
    def generate(self, message: str) -> str:
        return f"Anthropic: {message}"

# 둘 다 LLMProvider 프로토콜을 만족하므로 사용 가능
챗봇1 = ChatBot(OpenAI())
챗봇2 = ChatBot(Anthropic())
```

### 실제 코드 예시

```python
from typing import Protocol, List, Dict, Any

class Retriever(Protocol):
    """검색기 인터페이스"""
    def search(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        """쿼리로 문서를 검색"""
        ...

class ChromaRetriever:
    def search(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        # ChromaDB로 검색하는 실제 구현
        return [{"content": "검색된 문서", "score": 0.9}]

class PineconeRetriever:
    def search(self, query: str, max_results: int) -> List[Dict[str, Any]]:
        # Pinecone으로 검색하는 실제 구현
        return [{"content": "검색된 문서", "score": 0.8}]

# 둘 다 Retriever 프로토콜을 만족하므로 같은 방식으로 사용 가능
def search_documents(retriever: Retriever, query: str):
    return retriever.search(query, max_results=5)

# 사용
chroma_results = search_documents(ChromaRetriever(), "검색어")
pinecone_results = search_documents(PineconeRetriever(), "검색어")
```


# 의존성 주입 패턴으로 코드 품질 향상하기

## 개요

의존성 주입(Dependency Injection, DI)은 객체가 필요로 하는 의존성을 외부에서 제공받는 디자인 패턴입니다. 이 패턴을 통해 코드의 결합도를 낮추고, 테스트 용이성을 높이며, 유지보수성을 개선할 수 있습니다.

## 현재 코드의 문제점

### 1. 강한 결합 (Tight Coupling)

```python
# 문제가 있는 코드 예시
class MyApp:
    def __init__(self):
        self.app = FastAPI()
        # 직접 의존성 생성 - 강한 결합
        self.retriever = ChromadbRetriever("./db/chroma_db")
        self.scheduler = BackgroundScheduler(timezone="Asia/Seoul")
        self.llm = LLM_openai(model="gpt-4o-mini-2024-07-18")
```

**문제점:**
- 모든 의존성을 클래스 내부에서 직접 생성
- 다른 구현체로 교체하기 어려움
- 테스트 시 Mock 객체 주입 불가능

### 2. 하드코딩된 설정

```python
class ConversationalRetrievalChain:
    def __init__(self, retriever: ChromadbRetriever):
        # 하드코딩된 모델명들
        self.refine_llm = LLM_openai(model="gpt-4o-mini-2024-07-18", system_message="")
        self.answer_llm = LLM_openai(model="gpt-4o-2024-05-13", system_message="")
        self.lang_detect_llm = LLM_openai(model="gpt-4o-mini-2024-07-18", system_message="")
```

**문제점:**
- 모델명이 코드에 하드코딩됨
- 환경별 설정 변경 어려움
- 설정 관리의 중앙화 부족

## 의존성 주입 패턴 적용

### 1. 인터페이스 정의 (Protocol 사용)

먼저 의존성들의 인터페이스를 정의합니다:

```python
# interfaces/llm_provider.py
from typing import Protocol, List, Dict, Any

class LLMProvider(Protocol):
    """LLM 제공자 인터페이스"""
    def generate(self, user_message: str) -> str:
        """단일 메시지 생성"""
        ...
    
    def generate_with_chat_history(self, history: List, user_message: str) -> str:
        """채팅 히스토리와 함께 메시지 생성"""
        ...

class Retriever(Protocol):
    """검색기 인터페이스"""
    def get_docs_with_decomposition(self, query: str, max_k: int, threshold: float, lang: str) -> Dict[str, Any]:
        """쿼리 분해를 통한 문서 검색"""
        ...

class Scheduler(Protocol):
    """스케줄러 인터페이스"""
    def add_job(self, func, trigger, **kwargs):
        """작업 추가"""
        ...
    
    def get_job(self, job_id: str):
        """작업 조회"""
        ...
    
    def start(self):
        """스케줄러 시작"""
        ...
```

### 2. Factory 클래스들 생성

의존성 생성을 담당하는 Factory 클래스들을 만듭니다:

```python
# factories/llm_factory.py
from typing import Dict
from utils.llm_providers import LLM_openai
from interfaces.llm_provider import LLMProvider

class LLMFactory:
    """LLM 인스턴스 생성을 담당하는 Factory"""
    
    def __init__(self, config: Dict[str, str]):
        self.config = config
    
    def create_refine_llm(self) -> LLMProvider:
        """정제용 LLM 생성"""
        return LLM_openai(
            model=self.config.get("refine_model", "gpt-4o-mini-2024-07-18"),
            system_message=""
        )
    
    def create_answer_llm(self) -> LLMProvider:
        """답변용 LLM 생성"""
        return LLM_openai(
            model=self.config.get("answer_model", "gpt-4o-2024-05-13"),
            system_message=""
        )
    
    def create_lang_detect_llm(self) -> LLMProvider:
        """언어 감지용 LLM 생성"""
        return LLM_openai(
            model=self.config.get("lang_detect_model", "gpt-4o-mini-2024-07-18"),
            system_message=get_lang_detect_message(type="system")
        )

# factories/retriever_factory.py
from chains.custom_retriever import ChromadbRetriever
from interfaces.retriever import Retriever

class RetrieverFactory:
    """검색기 인스턴스 생성을 담당하는 Factory"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
    
    def create_retriever(self) -> Retriever:
        """검색기 생성"""
        return ChromadbRetriever(self.db_path)
```

### 3. 설정 관리 개선

중앙화된 설정 관리를 위해 Pydantic을 사용합니다:

```python
# config/settings.py
from pydantic import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    """애플리케이션 설정"""
    
    # LLM 설정
    refine_model: str = "gpt-4o-mini-2024-07-18"
    answer_model: str = "gpt-4o-2024-05-13"
    lang_detect_model: str = "gpt-4o-mini-2024-07-18"
    
    # 데이터베이스 설정
    chroma_db_path: str = "./db/chroma_db"
    
    # 스케줄러 설정
    timezone: str = "Asia/Seoul"
    
    # API 설정
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    class Config:
        env_file = ".env"
        case_sensitive = False

# 전역 설정 인스턴스
settings = Settings()
```

### 4. 의존성 컨테이너 생성

의존성들을 관리하는 컨테이너를 만듭니다:

```python
# di/container.py
from typing import Dict
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler

from factories.llm_factory import LLMFactory
from factories.retriever_factory import RetrieverFactory
from config.settings import settings

class DependencyContainer:
    """의존성 주입 컨테이너"""
    
    def __init__(self):
        self._services: Dict[str, object] = {}
        self._factories: Dict[str, object] = {}
        self._setup_factories()
    
    def _setup_factories(self):
        """Factory 초기화"""
        self._factories["llm"] = LLMFactory({
            "refine_model": settings.refine_model,
            "answer_model": settings.answer_model,
            "lang_detect_model": settings.lang_detect_model
        })
        self._factories["retriever"] = RetrieverFactory(settings.chroma_db_path)
    
    def get_retriever(self):
        """검색기 인스턴스 반환 (싱글톤 패턴)"""
        if "retriever" not in self._services:
            self._services["retriever"] = self._factories["retriever"].create_retriever()
        return self._services["retriever"]
    
    def get_scheduler(self):
        """스케줄러 인스턴스 반환 (싱글톤 패턴)"""
        if "scheduler" not in self._services:
            scheduler = BackgroundScheduler(timezone=settings.timezone)
            scheduler.start()
            self._services["scheduler"] = scheduler
        return self._services["scheduler"]
    
    def get_llm_factory(self):
        """LLM Factory 반환"""
        return self._factories["llm"]
    
    def reset(self):
        """테스트용 리셋 메서드"""
        self._services.clear()

# 전역 컨테이너 인스턴스
container = DependencyContainer()
```

### 5. 리팩토링된 MyApp 클래스

의존성 주입을 적용한 MyApp 클래스:

```python
# app.py (리팩토링 후)
from fastapi import FastAPI
from di.container import container
from interfaces.retriever import Retriever
from interfaces.scheduler import Scheduler

class MyApp:
    """의존성 주입이 적용된 메인 애플리케이션 클래스"""
    
    def __init__(self, 
                 retriever: Retriever = None,
                 scheduler: Scheduler = None):
        self.app = FastAPI()
        
        # 의존성 주입
        self.retriever = retriever or container.get_retriever()
        self.scheduler = scheduler or container.get_scheduler()
        
        # 사용자별 세션 관리
        self.user_conversations: Dict[str, ConversationalRetrievalChain] = {}
        
        # 구글 스프레드시트 연동
        self.sheet = None
        self.setup_events()
    
    def setup_events(self):
        """이벤트 설정"""
        select_sheet(self)
        self.scheduler.add_job(
            select_sheet, "cron", hour=0, minute=0, 
            args=[self], id="create new sheet"
        )
    
    def get_conversation_chain(self, user_id: str) -> ConversationalRetrievalChain:
        """사용자별 대화 체인 반환"""
        if user_id not in self.user_conversations:
            self.user_conversations[user_id] = ConversationalRetrievalChain(
                retriever=self.retriever
            )
        return self.user_conversations[user_id]

# 테스트용 팩토리 함수
def create_app(retriever=None, scheduler=None) -> MyApp:
    """애플리케이션 인스턴스 생성 (테스트용)"""
    return MyApp(retriever=retriever, scheduler=scheduler)

# 애플리케이션 인스턴스 생성
myapp = create_app()
```

### 6. 리팩토링된 ConversationalRetrievalChain 클래스

의존성 주입을 적용한 체인 클래스:

```python
# chains/main_chain.py (리팩토링 후)
from interfaces.retriever import Retriever
from factories.llm_factory import LLMFactory
from di.container import container

class ConversationalRetrievalChain:
    """의존성 주입이 적용된 대화형 검색 체인"""
    
    def __init__(self, 
                 retriever: Retriever,
                 llm_factory: LLMFactory = None):
        self.retriever = retriever
        
        # Factory를 통한 의존성 생성
        factory = llm_factory or container.get_llm_factory()
        self.refine_llm = factory.create_refine_llm()
        self.answer_llm = factory.create_answer_llm()
        self.lang_detect_llm = factory.create_lang_detect_llm()
        
        # 체커 체인들
        self.checker_runnable_executor = get_combined_checker_chain(
            model_name=settings.lang_detect_model
        )
        self.checker_reservation_runnable_executor = get_combined_checker_chain_reservation(
            model_name=settings.lang_detect_model
        )
        
        self.chat_history = []
    
    def process_query(self, user_message: str, user_id: str) -> str:
        """사용자 쿼리 처리"""
        # 언어 감지
        detected_lang = self.detect_language(user_message)
        
        # 문서 검색
        docs = self.retriever.get_docs_with_decomposition(
            query=user_message,
            max_k=5,
            threshold=0.7,
            lang=detected_lang
        )
        
        # 답변 생성
        response = self.generate_response(user_message, docs)
        
        # 히스토리 업데이트
        self.update_chat_history(user_message, response)
        
        return response
```

## 테스트 용이성 향상

### 1. Mock 객체를 사용한 단위 테스트

```python
# tests/test_myapp.py
import pytest
from unittest.mock import Mock, MagicMock
from app import create_app

class TestMyApp:
    """MyApp 클래스 테스트"""
    
    def test_app_initialization_with_mocks(self):
        """Mock 객체를 사용한 초기화 테스트"""
        # Mock 객체 생성
        mock_retriever = Mock()
        mock_scheduler = Mock()
        
        # 의존성 주입으로 앱 생성
        app = create_app(retriever=mock_retriever, scheduler=mock_scheduler)
        
        # 검증
        assert app.retriever == mock_retriever
        assert app.scheduler == mock_scheduler
        assert isinstance(app.app, FastAPI)
    
    def test_conversation_chain_creation(self):
        """대화 체인 생성 테스트"""
        mock_retriever = Mock()
        app = create_app(retriever=mock_retriever)
        
        # 사용자별 체인 생성
        chain = app.get_conversation_chain("user123")
        
        assert chain is not None
        assert chain.retriever == mock_retriever

# tests/test_conversational_chain.py
class TestConversationalRetrievalChain:
    """ConversationalRetrievalChain 클래스 테스트"""
    
    def test_chain_initialization_with_mock_factory(self):
        """Mock Factory를 사용한 초기화 테스트"""
        mock_retriever = Mock()
        mock_factory = Mock()
        
        # Mock LLM 인스턴스들
        mock_refine_llm = Mock()
        mock_answer_llm = Mock()
        mock_lang_detect_llm = Mock()
        
        mock_factory.create_refine_llm.return_value = mock_refine_llm
        mock_factory.create_answer_llm.return_value = mock_answer_llm
        mock_factory.create_lang_detect_llm.return_value = mock_lang_detect_llm
        
        # 체인 생성
        chain = ConversationalRetrievalChain(
            retriever=mock_retriever,
            llm_factory=mock_factory
        )
        
        # 검증
        assert chain.retriever == mock_retriever
        assert chain.refine_llm == mock_refine_llm
        assert chain.answer_llm == mock_answer_llm
        assert chain.lang_detect_llm == mock_lang_detect_llm
```

### 2. 통합 테스트

```python
# tests/test_integration.py
import pytest
from di.container import container

class TestIntegration:
    """통합 테스트"""
    
    def setup_method(self):
        """테스트 전 컨테이너 리셋"""
        container.reset()
    
    def test_container_dependency_resolution(self):
        """컨테이너 의존성 해결 테스트"""
        retriever = container.get_retriever()
        scheduler = container.get_scheduler()
        llm_factory = container.get_llm_factory()
        
        assert retriever is not None
        assert scheduler is not None
        assert llm_factory is not None
        
        # 싱글톤 패턴 검증
        retriever2 = container.get_retriever()
        assert retriever is retriever2
```

## 환경별 설정 관리

### 1. 환경 변수 설정

```bash
# .env.development
REFINE_MODEL=gpt-4o-mini-2024-07-18
ANSWER_MODEL=gpt-4o-2024-05-13
LANG_DETECT_MODEL=gpt-4o-mini-2024-07-18
CHROMA_DB_PATH=./db/chroma_db_dev
TIMEZONE=Asia/Seoul
API_HOST=0.0.0.0
API_PORT=8000
```

```bash
# .env.production
REFINE_MODEL=gpt-4o-2024-05-13
ANSWER_MODEL=gpt-4o-2024-05-13
LANG_DETECT_MODEL=gpt-4o-mini-2024-07-18
CHROMA_DB_PATH=/data/chroma_db_prod
TIMEZONE=Asia/Seoul
API_HOST=0.0.0.0
API_PORT=80
```

### 2. 설정 로딩 개선

```python
# config/settings.py (개선된 버전)
import os
from pydantic import BaseSettings
from typing import Dict

class Settings(BaseSettings):
    """환경별 설정 관리"""
    
    # 환경 설정
    environment: str = "development"
    
    # LLM 설정
    refine_model: str = "gpt-4o-mini-2024-07-18"
    answer_model: str = "gpt-4o-2024-05-13"
    lang_detect_model: str = "gpt-4o-mini-2024-07-18"
    
    # 데이터베이스 설정
    chroma_db_path: str = "./db/chroma_db"
    
    # 스케줄러 설정
    timezone: str = "Asia/Seoul"
    
    # API 설정
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    
    class Config:
        env_file = f".env.{os.getenv('ENVIRONMENT', 'development')}"
        case_sensitive = False

settings = Settings()
```

## 장점과 효과

### 1. 테스트 용이성
- Mock 객체를 쉽게 주입할 수 있음
- 단위 테스트와 통합 테스트 분리 가능
- 테스트 격리 보장

### 2. 유연성
- 런타임에 다른 구현체로 교체 가능
- 새로운 LLM 제공자 추가 용이
- 설정 변경 시 코드 수정 불필요

### 3. 유지보수성
- 중앙화된 설정 관리
- 명확한 의존성 관계
- 단일 책임 원칙 준수

### 4. 확장성
- 새로운 기능 추가 시 기존 코드 영향 최소화
- 플러그인 아키텍처 구현 가능
- 마이크로서비스 전환 용이

## 결론

의존성 주입 패턴을 적용함으로써 코드의 품질을 크게 향상시킬 수 있습니다. 특히:

1. **결합도 감소**: 클래스 간의 의존성이 명시적으로 관리됨
2. **테스트 용이성**: Mock 객체 주입으로 격리된 테스트 가능
3. **설정 관리**: 중앙화된 설정으로 환경별 관리 용이
4. **확장성**: 새로운 기능 추가 시 기존 코드 영향 최소화

이러한 패턴은 대규모 프로젝트에서 특히 유용하며, 코드의 장기적인 유지보수성을 보장합니다.

## 참고 자료

- [Python Protocol Classes](https://docs.python.org/3/library/typing.html#protocols)
- [Pydantic Settings Management](https://pydantic-docs.helpmanual.io/usage/settings/)
- [FastAPI Dependency Injection](https://fastapi.tiangolo.com/tutorial/dependencies/)
- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) 
