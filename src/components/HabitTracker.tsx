'use client';

import { useState, useEffect } from 'react';
import HabitVisualization from './HabitVisualization';

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

export default function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitChecks, setHabitChecks] = useState<HabitCheck[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);

  // 색상 옵션
  const colorOptions = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#6b7280', // gray
  ];

  // localStorage에서 데이터 로드
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHabits = localStorage.getItem('habits');
      const savedChecks = localStorage.getItem('habitChecks');
      
      if (savedHabits) {
        setHabits(JSON.parse(savedHabits));
      }
      
      if (savedChecks) {
        setHabitChecks(JSON.parse(savedChecks));
      }
    }
  }, []);

  // 데이터 저장
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habits', JSON.stringify(habits));
    }
  }, [habits]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('habitChecks', JSON.stringify(habitChecks));
    }
  }, [habitChecks]);

  // 새 습관 추가
  const addHabit = () => {
    if (newHabitName.trim()) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: newHabitName.trim(),
        color: colorOptions[Math.floor(Math.random() * colorOptions.length)],
        createdAt: new Date().toISOString().split('T')[0],
      };
      setHabits([...habits, newHabit]);
      setNewHabitName('');
      setIsAddingHabit(false);
    }
  };

  // 습관 삭제
  const deleteHabit = (habitId: string) => {
    setHabits(habits.filter(h => h.id !== habitId));
    setHabitChecks(habitChecks.filter(check => check.habitId !== habitId));
  };

  // 체크 토글
  const toggleCheck = (habitId: string, date: string) => {
    const existingCheck = habitChecks.find(
      check => check.habitId === habitId && check.date === date
    );

    if (existingCheck) {
      setHabitChecks(
        habitChecks.map(check =>
          check.habitId === habitId && check.date === date
            ? { ...check, checked: !check.checked }
            : check
        )
      );
    } else {
      setHabitChecks([
        ...habitChecks,
        { habitId, date, checked: true }
      ]);
    }
  };

  // 특정 습관의 특정 날짜 체크 상태 확인
  const isChecked = (habitId: string, date: string) => {
    const check = habitChecks.find(
      check => check.habitId === habitId && check.date === date
    );
    return check?.checked || false;
  };

  // 최근 7일 날짜 생성
  const getRecentDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const recentDates = getRecentDates();

  return (
    <div className="space-y-6">
      {/* 습관 추가 섹션 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📝 습관 관리
        </h2>
        
        {!isAddingHabit ? (
          <button
            onClick={() => setIsAddingHabit(true)}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
          >
            + 새 습관 추가
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              placeholder="새로운 습관을 입력하세요"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            />
            <button
              onClick={addHabit}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
            >
              추가
            </button>
            <button
              onClick={() => {
                setIsAddingHabit(false);
                setNewHabitName('');
              }}
              className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              취소
            </button>
          </div>
        )}
      </div>

      {/* 습관 트래커 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          📊 최근 7일 기록
        </h2>

        {habits.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            아직 등록된 습관이 없습니다. 첫 번째 습관을 추가해보세요!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    습관
                  </th>
                  {recentDates.map(date => (
                    <th key={date} className="text-center py-3 px-2 font-medium text-gray-700 dark:text-gray-300">
                      <div className="text-xs">
                        {new Date(date).toLocaleDateString('ko-KR', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(date).toLocaleDateString('ko-KR', { 
                          weekday: 'short' 
                        })}
                      </div>
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody>
                {habits.map(habit => (
                  <tr key={habit.id} className="border-t border-gray-200 dark:border-gray-600">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: habit.color }}
                        />
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {habit.name}
                        </span>
                      </div>
                    </td>
                    {recentDates.map(date => (
                      <td key={date} className="text-center py-3 px-2">
                        <button
                          onClick={() => toggleCheck(habit.id, date)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            isChecked(habit.id, date)
                              ? 'border-green-500 bg-green-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-green-400'
                          }`}
                        >
                          {isChecked(habit.id, date) && '✓'}
                        </button>
                      </td>
                    ))}
                    <td className="text-center py-3 px-4">
                      <button
                        onClick={() => deleteHabit(habit.id)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                        title="습관 삭제"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 습관 시각화 */}
      <HabitVisualization habits={habits} habitChecks={habitChecks} />
    </div>
  );
} 