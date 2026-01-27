/** 실시간 상태 컴포넌트 */
import React from 'react';

const RealtimeStatus = ({ isAutoRefresh, onToggleAutoRefresh, lastUpdateTime }) => {
  return (
    <div className="realtime-status">
      <div className="realtime-controls">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={isAutoRefresh}
            onChange={onToggleAutoRefresh}
          />
          <span>자동 새로고침</span>
        </label>
        {lastUpdateTime && (
          <span className="last-update">
            마지막 업데이트: {new Date(lastUpdateTime).toLocaleTimeString('ko-KR')}
          </span>
        )}
      </div>
    </div>
  );
};

export default RealtimeStatus;
