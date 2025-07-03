// 조회수 카운터 JavaScript
document.addEventListener('DOMContentLoaded', function() {
  // 모든 조회수 카운터 요소 찾기
  const viewCounters = document.querySelectorAll('.views-counter');
  
  viewCounters.forEach(function(counter) {
    const url = counter.dataset.url;
    const title = counter.dataset.title;
    
    // 로컬 스토리지에서 조회수 가져오기 (임시 구현)
    const storageKey = `views_${url}`;
    let views = localStorage.getItem(storageKey);
    
    if (!views) {
      // 처음 방문한 경우 랜덤 조회수 생성 (실제로는 API에서 가져와야 함)
      views = Math.floor(Math.random() * 100) + 1;
      localStorage.setItem(storageKey, views);
    }
    
    // 조회수 증가 (페이지 방문 시)
    views = parseInt(views) + 1;
    localStorage.setItem(storageKey, views);
    
    // 화면에 조회수 표시
    const countElement = counter.querySelector('.views-count');
    if (countElement) {
      countElement.textContent = views.toLocaleString();
    }
  });
});

// Google Analytics 이벤트 추적 (선택사항)
function trackPageView(url, title) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'page_view', {
      page_title: title,
      page_location: url
    });
  }
} 