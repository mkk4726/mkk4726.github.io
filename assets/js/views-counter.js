// 조회수 카운터 JavaScript - 실제 API 호출 버전
document.addEventListener('DOMContentLoaded', function() {
  // 모든 조회수 카운터 요소 찾기
  const viewCounters = document.querySelectorAll('.views-counter');
  
  viewCounters.forEach(function(counter) {
    const url = counter.dataset.url;
    const title = counter.dataset.title;
    
    // 조회수 가져오기 (실제 API 호출)
    fetchPageViews(url, title, counter);
  });
});

// Google Analytics API를 통한 조회수 가져오기
async function fetchPageViews(url, title, counterElement) {
  try {
    // Google Analytics API 엔드포인트 (서버 사이드에서 처리 필요)
    const response = await fetch('/api/pageviews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        title: title
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      updateViewsDisplay(counterElement, data.views);
    } else {
      // API 호출 실패 시 대체 방법 사용
      fallbackViewsCounter(url, title, counterElement);
    }
  } catch (error) {
    console.log('API 호출 실패, 대체 방법 사용:', error);
    fallbackViewsCounter(url, title, counterElement);
  }
}

// 대체 방법: 로컬스토리지 + 세션 기반 조회수
function fallbackViewsCounter(url, title, counterElement) {
  const storageKey = `views_${url}`;
  const sessionKey = `session_${url}`;
  
  // 세션에서 이미 방문했는지 확인
  const hasVisited = sessionStorage.getItem(sessionKey);
  
  if (!hasVisited) {
    // 이 세션에서 처음 방문한 경우에만 조회수 증가
    let views = parseInt(localStorage.getItem(storageKey) || '0');
    views += 1;
    localStorage.setItem(storageKey, views.toString());
    sessionStorage.setItem(sessionKey, 'true');
    
    updateViewsDisplay(counterElement, views);
  } else {
    // 이미 방문한 경우 기존 조회수 표시
    const views = parseInt(localStorage.getItem(storageKey) || '0');
    updateViewsDisplay(counterElement, views);
  }
}

// 화면에 조회수 표시
function updateViewsDisplay(counterElement, views) {
  const countElement = counterElement.querySelector('.views-count');
  if (countElement) {
    countElement.textContent = views.toLocaleString();
  }
}

// Google Analytics 이벤트 추적
function trackPageView(url, title) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: title,
      page_location: url
    });
  }
}

// 페이지 방문 시 Google Analytics 추적
document.addEventListener('DOMContentLoaded', function() {
  const currentUrl = window.location.href;
  const currentTitle = document.title;
  trackPageView(currentUrl, currentTitle);
});

// 홈 전체/오늘 뷰 표시
function updateHomeViews() {
  // 전체 포스트의 .views-counter를 모두 찾음
  const postCounters = document.querySelectorAll('.main-content .views-counter');
  let total = 0;
  let today = 0;
  const todayStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  postCounters.forEach(function(counter) {
    // 각 포스트별 조회수(로컬스토리지 기반)
    const url = counter.dataset.url;
    const storageKey = `views_${url}`;
    const views = parseInt(localStorage.getItem(storageKey) || '0');
    total += views;

    // 오늘 날짜별 조회수(로컬스토리지에 별도 저장 필요)
    const todayKey = `views_${url}_${todayStr}`;
    const todayViews = parseInt(localStorage.getItem(todayKey) || '0');
    today += todayViews;
  });

  const totalElem = document.getElementById('total-views');
  const todayElem = document.getElementById('today-views');
  if (totalElem) totalElem.textContent = total.toLocaleString();
  if (todayElem) todayElem.textContent = today.toLocaleString();
}

document.addEventListener('DOMContentLoaded', function() {
  setTimeout(updateHomeViews, 800); // 조회수 렌더 후 집계
}); 