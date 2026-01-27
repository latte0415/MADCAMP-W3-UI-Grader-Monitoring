/** Run 정보 컴포넌트 */
import React from 'react';

const RunInfo = ({ runInfo }) => {
  if (!runInfo) {
    return <div>Run 정보를 불러오는 중...</div>;
  }

  const formatTime = (seconds) => {
    if (!seconds) return '-';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    } else if (minutes > 0) {
      return `${minutes}분 ${secs}초`;
    } else {
      return `${secs}초`;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return '#3b82f6';
      case 'completed':
        return '#10b981';
      case 'failed':
        return '#ef4444';
      case 'stopped':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="run-info">
      <h2>Run 정보</h2>
      <div className="info-grid">
        <div className="info-item">
          <label>Run ID:</label>
          <span className="run-id">{runInfo.id}</span>
        </div>
        <div className="info-item">
          <label>상태:</label>
          <span 
            className="status-badge"
            style={{ backgroundColor: getStatusColor(runInfo.status) }}
          >
            {runInfo.status}
          </span>
        </div>
        <div className="info-item">
          <label>Target URL:</label>
          <a href={runInfo.target_url} target="_blank" rel="noopener noreferrer">
            {runInfo.target_url}
          </a>
        </div>
        <div className="info-item">
          <label>Start URL:</label>
          <a href={runInfo.start_url} target="_blank" rel="noopener noreferrer">
            {runInfo.start_url}
          </a>
        </div>
        <div className="info-item">
          <label>생성 시간:</label>
          <span>{runInfo.created_at ? new Date(runInfo.created_at).toLocaleString('ko-KR') : '-'}</span>
        </div>
        <div className="info-item">
          <label>완료 시간:</label>
          <span>{runInfo.completed_at ? new Date(runInfo.completed_at).toLocaleString('ko-KR') : '-'}</span>
        </div>
        <div className="info-item">
          <label>실행 시간:</label>
          <span>{formatTime(runInfo.elapsed_seconds)}</span>
        </div>
      </div>
    </div>
  );
};

export default RunInfo;
