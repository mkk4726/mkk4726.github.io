'use client';

import { useState, useMemo } from 'react';

interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

interface HabitCheck {
  habitId: string;
  date: string;
  checked: boolean;
}

interface HabitVisualizationProps {
  habits: Habit[];
  habitChecks: HabitCheck[];
}

interface VisualizationDay {
  date: string;
  checked: boolean;
}

export default function HabitVisualization({ habits, habitChecks }: HabitVisualizationProps) {
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ day: VisualizationDay; x: number; y: number; habitName: string } | null>(null);

  // 선택된 습관의 데이터 생성
  const visualizationData = useMemo(() => {
    if (!selectedHabit) return [];

    const habit = habits.find(h => h.id === selectedHabit);
    if (!habit) return [];

    const startDate = new Date(habit.createdAt);
    const endDate = new Date();
    const data: VisualizationDay[] = [];

    // 습관 생성일부터 오늘까지의 모든 날짜 생성
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const check = habitChecks.find(
        check => check.habitId === selectedHabit && check.date === dateStr
      );
      
      data.push({
        date: dateStr,
        checked: check?.checked || false
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return data;
  }, [selectedHabit, habits, habitChecks]);

  // 데이터를 주별로 그룹화
  const weeks = useMemo(() => {
    if (visualizationData.length === 0) return [];

    const weekData: VisualizationDay[][] = [];
    let currentWeek: VisualizationDay[] = [];
    
    visualizationData.forEach((day, index) => {
      const dayOfWeek = new Date(day.date).getDay();
      
      // 첫 번째 날이 일요일이 아니면 빈 셀로 채우기
      if (index === 0 && dayOfWeek !== 0) {
        for (let i = 0; i < dayOfWeek; i++) {
          currentWeek.push({ date: '', checked: false });
        }
      }
      
      currentWeek.push(day);
      
      // 토요일이거나 마지막 날이면 주 완성
      if (dayOfWeek === 6 || index === visualizationData.length - 1) {
        // 마지막 주가 토요일로 끝나지 않으면 빈 셀로 채우기
        while (currentWeek.length < 7) {
          currentWeek.push({ date: '', checked: false });
        }
        weekData.push(currentWeek);
        currentWeek = [];
      }
    });

    return weekData;
  }, [visualizationData]);

  // 월 라벨 계산
  const monthLabels = useMemo(() => {
    const labels: { month: string; startWeek: number }[] = [];
    let currentMonth = '';
    
    weeks.forEach((week, weekIndex) => {
      const firstValidDay = week.find(day => day.date !== '');
      if (firstValidDay) {
        try {
          const date = new Date(firstValidDay.date);
          const monthName = date.toLocaleDateString('ko-KR', { month: 'short' });
          
          if (monthName !== currentMonth) {
            labels.push({ month: monthName, startWeek: weekIndex });
            currentMonth = monthName;
          }
        } catch {
          // 잘못된 날짜 형식은 무시
        }
      }
    });

    return labels;
  }, [weeks]);

  // 요일 라벨
  const weekdays = ['일', '월', '화', '수', '목', '금', '토'];

  const handleMouseEnter = (day: VisualizationDay, event: React.MouseEvent) => {
    if (day.date && selectedHabit) {
      const habit = habits.find(h => h.id === selectedHabit);
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      setTooltip({
        day,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
        habitName: habit?.name || ''
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip(null);
  };

  // 통계 계산
  const stats = useMemo(() => {
    if (!selectedHabit || visualizationData.length === 0) {
      return { totalDays: 0, completedDays: 0, completionRate: 0, currentStreak: 0, longestStreak: 0 };
    }

    const totalDays = visualizationData.length;
    const completedDays = visualizationData.filter(day => day.checked).length;
    const completionRate = Math.round((completedDays / totalDays) * 100);

    // 현재 스트릭 계산 (오늘부터 거꾸로)
    let currentStreak = 0;
    for (let i = visualizationData.length - 1; i >= 0; i--) {
      if (visualizationData[i].checked) {
        currentStreak++;
      } else {
        break;
      }
    }

    // 최장 스트릭 계산
    let longestStreak = 0;
    let tempStreak = 0;
    for (const day of visualizationData) {
      if (day.checked) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    return { totalDays, completedDays, completionRate, currentStreak, longestStreak };
  }, [selectedHabit, visualizationData]);

  const selectedHabitData = habits.find(h => h.id === selectedHabit);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
        📈 습관 시각화
      </h2>

      {habits.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          시각화할 습관이 없습니다.
        </div>
      ) : (
        <>
          {/* 습관 선택 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              시각화할 습관을 선택하세요:
            </label>
            <select
              value={selectedHabit || ''}
              onChange={(e) => setSelectedHabit(e.target.value || null)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="">습관을 선택하세요</option>
              {habits.map(habit => (
                <option key={habit.id} value={habit.id}>
                  {habit.name}
                </option>
              ))}
            </select>
          </div>

          {selectedHabit && selectedHabitData && (
            <>
              {/* 통계 */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {stats.totalDays}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">총 일수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {stats.completedDays}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">완료 일수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {stats.completionRate}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">완료율</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {stats.currentStreak}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">현재 연속</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {stats.longestStreak}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">최장 연속</div>
                </div>
              </div>

              {/* 잔디밭 시각화 */}
              <div className="relative overflow-x-auto">
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

                  {/* 시각화 격자 */}
                  <div className="flex gap-[2px]">
                    {weeks.map((week, weekIndex) => (
                      <div key={weekIndex} className="flex flex-col gap-[2px]">
                        {week.map((day, dayIndex) => (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className={`w-3 h-3 rounded-sm cursor-pointer transition-all duration-200 hover:ring-2 hover:ring-gray-400 dark:hover:ring-gray-500 ${
                              day.date
                                ? day.checked
                                  ? 'bg-green-500 dark:bg-green-500'
                                  : 'bg-gray-100 dark:bg-gray-700'
                                : 'bg-transparent'
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
                    <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-700" />
                    <div className="w-3 h-3 rounded-sm bg-green-500 dark:bg-green-500" />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    More
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

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
            {tooltip.habitName}
          </div>
          <div>
            {(() => {
              try {
                return new Date(tooltip.day.date).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                });
              } catch {
                return tooltip.day.date;
              }
            })()}
          </div>
          <div>
            {tooltip.day.checked ? '✅ 완료' : '❌ 미완료'}
          </div>
        </div>
      )}
    </div>
  );
} 