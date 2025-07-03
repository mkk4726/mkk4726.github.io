// Google Analytics API를 사용한 조회수 서버
const { google } = require('googleapis');

// Google Analytics API 설정
const analytics = google.analytics('v3');
const analyticsData = google.analyticsdata('v1beta');

// 서비스 계정 키 (Google Cloud Console에서 다운로드)
const SERVICE_ACCOUNT_KEY = {
  // 실제 서비스 계정 키 정보를 여기에 입력
  // Google Cloud Console → IAM 및 관리 → 서비스 계정 → 키 생성
};

// Google Analytics API 인증
const auth = new google.auth.GoogleAuth({
  credentials: SERVICE_ACCOUNT_KEY,
  scopes: ['https://www.googleapis.com/auth/analytics.readonly']
});

// 조회수 가져오기 함수
async function getPageViews(pagePath) {
  try {
    const authClient = await auth.getClient();
    
    // Google Analytics 4 API 호출
    const response = await analyticsData.properties.runReport({
      auth: authClient,
      property: `properties/${process.env.GA4_PROPERTY_ID}`,
      requestBody: {
        dateRanges: [
          {
            startDate: '30daysAgo',
            endDate: 'today'
          }
        ],
        dimensions: [
          {
            name: 'pagePath'
          }
        ],
        metrics: [
          {
            name: 'screenPageViews'
          }
        ],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: pagePath
            }
          }
        }
      }
    });

    const rows = response.data.rows;
    if (rows && rows.length > 0) {
      return parseInt(rows[0].metricValues[0].value);
    }
    
    return 0;
  } catch (error) {
    console.error('Google Analytics API 오류:', error);
    return 0;
  }
}

// Express.js 서버 예시
const express = require('express');
const app = express();

app.use(express.json());

// 조회수 API 엔드포인트
app.post('/api/pageviews', async (req, res) => {
  try {
    const { url, title } = req.body;
    
    // URL에서 경로 추출
    const urlObj = new URL(url);
    const pagePath = urlObj.pathname;
    
    // Google Analytics에서 조회수 가져오기
    const views = await getPageViews(pagePath);
    
    res.json({ views });
  } catch (error) {
    console.error('API 오류:', error);
    res.status(500).json({ error: '조회수를 가져올 수 없습니다.' });
  }
});

// 정적 파일 서빙 (Jekyll 빌드 결과물)
app.use(express.static('_site'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`);
}); 