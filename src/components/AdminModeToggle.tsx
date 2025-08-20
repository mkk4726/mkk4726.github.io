'use client';

import { useAdminMode } from '@/hooks/useAdminMode';

export default function AdminModeToggle() {
  const { isAdminMode, isLoading, enableAdminMode, disableAdminMode } = useAdminMode();

  if (isLoading) {
    return null; // 또는 로딩 스피너
  }

  return (
    <div className="flex items-center space-x-2">
      {isAdminMode ? (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-red-600 font-medium">
            🔒 관리자 모드
          </span>
          <button
            onClick={disableAdminMode}
            className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            title="관리자 모드 해제"
          >
            해제
          </button>
        </div>
      ) : (
        <button
          onClick={enableAdminMode}
          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          title="관리자 모드 활성화 (?admin=true)"
        >
          관리자
        </button>
      )}
    </div>
  );
}
