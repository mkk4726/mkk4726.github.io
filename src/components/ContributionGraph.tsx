'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { ContributionDay } from '@/lib/posts';

interface ContributionGraphProps {
  allYearData: { [year: number]: ContributionDay[] };
  availableYears: number[];
  title?: string;
}

export default function ContributionGraph({ allYearData, availableYears, title = "포스트 활동" }: ContributionGraphProps) {
  const [tooltip, setTooltip] = useState<{ day: ContributionDay; x: number; y: number } | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(availableYears[0] || new Date().getFullYear());
  const containerRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLDivElement>(null);

  // 선택된 연도의 데이터 가져오기
  const data = useMemo(() => allYearData[selectedYear] || [], [allYearData, selectedYear]);

  // 연도 변경시 처리
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
  };

  // 오늘로 스크롤하는 함수
  const scrollToToday = () => {
    if (todayRef.current && containerRef.current) {
      const container = containerRef.current;
      const todayElement = todayRef.current;
      
      // 오늘 날짜 요소의 위치 계산
      const containerRect = container.getBoundingClientRect();
      const todayRect = todayElement.getBoundingClientRect();
      
      // 가로 스크롤 위치 계산 (오늘 날짜가 중앙에 오도록)
      const scrollLeft = container.scrollLeft + (todayRect.left - containerRect.left) - (containerRect.width / 2) + (todayRect.width / 2);
      
      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth'
      });
    }
  };

  // 컴포넌트 마운트 및 연도 변경 시 자동 스크롤
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    if (selectedYear === currentYear) {
      // 약간의 지연 후 스크롤 (DOM 렌더링 완료 후)
      const timer = setTimeout(() => {
        scrollToToday();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [selectedYear, data]);

  // 데이터가 없는 경우 처리
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
          포스트 데이터가 없습니다.
        </div>
      </div>
    );
  }

  // 색상 레벨에 따른 클래스 매핑
  const getLevelClass = (level: number) => {
    switch (level) {
      case 0: return 'bg-gray-100 dark:bg-gray-800';
      case 1: return 'bg-green-200 dark:bg-green-900';
      case 2: return 'bg-green-300 dark:bg-green-700';
      case 3: return 'bg-green-400 dark:bg-green-600';
      case 4: return 'bg-green-500 dark:bg-green-500';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  // 요일 라벨
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  // 데이터를 주별로 그룹화
  const weeks: ContributionDay[][] = [];
  let currentWeek: ContributionDay[] = [];
  
  data.forEach((day, index) => {
    if (!day.date) return; // 빈 날짜 건너뛰기
    
    const dayOfWeek = new Date(day.date).getDay();
    
    // 첫 번째 날이 일요일이 아니면 빈 셀로 채우기
    if (index === 0 && dayOfWeek !== 0) {
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
    }
    
    currentWeek.push(day);
    
    // 토요일이거나 마지막 날이면 주 완성
    if (dayOfWeek === 6 || index === data.length - 1) {
      // 마지막 주가 토요일로 끝나지 않으면 빈 셀로 채우기
      while (currentWeek.length < 7) {
        currentWeek.push({ date: '', count: 0, level: 0 });
      }
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // 월 라벨 계산
  const monthLabels: { month: string; startWeek: number }[] = [];
  let currentMonth = '';
  
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(day => day.date !== '');
    if (firstValidDay) {
      try {
        const date = new Date(firstValidDay.date);
        const monthName = date.toLocaleDateString('ko-KR', { month: 'short' });
        
        if (monthName !== currentMonth) {
          monthLabels.push({ month: monthName, startWeek: weekIndex });
          currentMonth = monthName;
        }
      } catch {
        // 잘못된 날짜 형식은 무시
      }
    }
  });

  const handleMouseEnter = (day: ContributionDay, event: React.MouseEvent) => {
    if (day.date) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        day,
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // 오늘 날짜 확인 함수
  const isToday = (date: string) => {
    if (!date) return false;
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  };

  const totalPosts = data.reduce((sum, day) => sum + day.count, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {selectedYear}년 총 <span className="font-semibold text-green-600 dark:text-green-400">{totalPosts}개</span>의 포스트
          </p>
        </div>
        
        {/* 연도 선택 드롭다운 및 오늘로 이동 버튼 */}
        <div className="flex items-center gap-2">
          {/* 오늘로 이동 버튼 */}
          {selectedYear === new Date().getFullYear() && (
            <button
              onClick={scrollToToday}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              title="오늘로 이동"
            >
              📅 오늘
            </button>
          )}
          
          {availableYears.length > 0 && (
            <select
              value={selectedYear}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="relative overflow-x-auto" ref={containerRef}>
        {/* 월 라벨 */}
        <div className="flex mb-2" style={{ marginLeft: '20px' }}>
          {monthLabels.map((label, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 pr-2"
              style={{ 
                marginLeft: index === 0 ? 0 : `${(label.startWeek - (monthLabels[index - 1]?.startWeek || 0)) * 12 - 12}px`,
                minWidth: '20px'
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        <div className="flex">
          {/* 요일 라벨 */}
          <div className="flex flex-col mr-2">
            {weekdays.map((day, index) => (
              <div
                key={day}
                className={`h-3 flex items-center text-xs text-gray-600 dark:text-gray-400 ${
                  index % 2 === 1 ? '' : 'opacity-0'
                }`}
                style={{ marginBottom: '2px' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* contribution 격자 */}
          <div className="flex gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    ref={isToday(day.date) ? todayRef : null}
                    className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 ${
                      day.date ? getLevelClass(day.level) : 'bg-transparent'
                    } ${
                      isToday(day.date) ? 'ring-2 ring-blue-500 dark:ring-blue-400 ring-offset-1 ring-offset-white dark:ring-offset-gray-800' : ''
                    }`}
                    onMouseEnter={(e) => handleMouseEnter(day, e)}
                    onMouseLeave={handleMouseLeave}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 범례 */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-600 dark:text-gray-400">
            Less
          </div>
          <div className="flex items-center gap-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={`w-3 h-3 rounded-sm ${getLevelClass(level)}`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            More
          </div>
        </div>
      </div>

      {/* 툴팁 */}
      {tooltip && (
        <div
          className="fixed z-50 bg-gray-900 dark:bg-gray-700 text-white text-xs p-2 rounded shadow-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="font-medium">
            {(() => {
              try {
                const dateStr = new Date(tooltip.day.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                });
                return isToday(tooltip.day.date) ? `🌟 ${dateStr} (오늘)` : dateStr;
              } catch {
                return tooltip.day.date;
              }
            })()}
          </div>
          <div>
            {tooltip.day.count > 0 
              ? `${tooltip.day.count}개의 포스트` 
              : '포스트 없음'
            }
          </div>
        </div>
      )}
    </div>
  );
} 