import HabitTracker from '@/components/HabitTracker';

export default function HabitsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          📋 Habit Tracker
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          일상의 작은 습관들을 기록하고 시각화하여 꾸준함을 만들어보세요.
        </p>
      </div>
      
      <HabitTracker />
    </div>
  );
} 