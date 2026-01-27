/** 워커 상태 모니터링 컴포넌트 */
import React, { useState } from 'react';

const WorkerStatus = ({ workersStatus, runWorkersStatus }) => {
  const [expandedWorkers, setExpandedWorkers] = useState(new Set());

  if (!workersStatus) {
    return <div>워커 상태를 불러오는 중...</div>;
  }

  // 디버깅: 실제 응답 구조 확인
  if (process.env.NODE_ENV === 'development') {
    console.log('워커 상태 응답:', workersStatus);
  }

  // 백엔드 응답 형식이 다를 수 있으므로 유연하게 처리
  // summary 또는 total 형식 모두 지원
  const summary = workersStatus.summary || workersStatus.total || {};
  
  // actors 또는 by_type 형식 모두 지원
  const actors = workersStatus.actors || workersStatus.by_type || {};
  
  // 처리 중인 작업 목록 추출
  const processingTasks = workersStatus.processing_tasks || workersStatus.processing || [];
  
  // 워커별 처리 중인 작업 그룹화
  const tasksByWorker = {};
  processingTasks.forEach((task) => {
    const workerId = task.worker_id || task.worker_name || 'unknown';
    if (!tasksByWorker[workerId]) {
      tasksByWorker[workerId] = [];
    }
    tasksByWorker[workerId].push(task);
  });

  const toggleWorker = (workerId) => {
    const newExpanded = new Set(expandedWorkers);
    if (newExpanded.has(workerId)) {
      newExpanded.delete(workerId);
    } else {
      newExpanded.add(workerId);
    }
    setExpandedWorkers(newExpanded);
  };

  return (
    <div className="worker-status">
      <h2>워커 상태</h2>
      
      <div className="worker-summary">
        <div className="summary-card">
          <div className="summary-label">대기 중인 작업</div>
          <div className="summary-value">{summary.total_enqueued || summary.waiting || summary.enqueued || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">지연된 작업</div>
          <div className="summary-value">{summary.total_delayed || summary.delayed || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">처리 중인 작업</div>
          <div className="summary-value">{summary.total_processing || summary.processing || processingTasks.length || 0}</div>
        </div>
        <div className="summary-card">
          <div className="summary-label">활성 워커</div>
          <div className="summary-value">{summary.total_workers || Object.keys(tasksByWorker).length || 0}</div>
        </div>
      </div>

      <div className="actor-status-list">
        <h3>워커 타입별 상태</h3>
        {Object.keys(actors).length > 0 ? (
          Object.entries(actors).map(([actorName, status]) => (
            <div key={actorName} className="actor-status-card">
              <div className="actor-name">{actorName}</div>
              <div className="actor-metrics">
                <div className="metric">
                  <span className="metric-label">대기:</span>
                  <span className="metric-value">{status.enqueued || status.waiting || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">지연:</span>
                  <span className="metric-value">{status.delayed || 0}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">처리 중:</span>
                  <span className="metric-value">{status.processing || 0}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">워커 타입 정보가 없습니다.</div>
        )}
      </div>

      {/* 처리 중인 작업 상세 목록 */}
      <div className="processing-tasks-section">
        <h3>현재 처리 중인 작업</h3>
        {processingTasks.length > 0 ? (
          <div className="processing-tasks-list">
            {Object.entries(tasksByWorker).map(([workerId, tasks]) => (
              <div key={workerId} className="worker-tasks-card">
                <div 
                  className="worker-tasks-header"
                  onClick={() => toggleWorker(workerId)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="worker-id">{workerId}</span>
                  <span className="task-count">({tasks.length}개 작업)</span>
                  <span className="expand-icon">
                    {expandedWorkers.has(workerId) ? '▼' : '▶'}
                  </span>
                </div>
                {expandedWorkers.has(workerId) && (
                  <div className="worker-tasks-detail">
                    {tasks.map((task, index) => (
                      <div key={index} className="task-item">
                        <div className="task-header">
                          <span className="task-type">{task.type || task.action_type || task.task_type || '작업'}</span>
                          {task.run_id && (
                            <span className="task-run-id">Run: {task.run_id}</span>
                          )}
                        </div>
                        <pre className="task-detail-json">
                          {JSON.stringify(task, null, 2)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">현재 처리 중인 작업이 없습니다.</div>
        )}
      </div>

      {/* Run 관련 워커 상태 */}
      {runWorkersStatus && (
        <div className="run-workers-status">
          <h3>이 Run과 관련된 워커</h3>
          {runWorkersStatus.related_workers && (
            <div className="related-workers-count">
              처리 중인 워커: {runWorkersStatus.related_workers.processing_count || 0}
            </div>
          )}
          {runWorkersStatus.workers && runWorkersStatus.workers.length > 0 && (
            <div className="related-workers-list">
              {runWorkersStatus.workers.map((worker, index) => (
                <div key={index} className="related-worker-card">
                  <div className="worker-info">
                    <span className="worker-id">{worker.worker_id || worker.worker_name || `워커 ${index + 1}`}</span>
                    <span className="worker-type">{worker.worker_type || '-'}</span>
                    <span className="worker-status-badge">{worker.status || '-'}</span>
                  </div>
                  {worker.current_task && (
                    <div className="worker-current-task">
                      <div className="task-label">현재 작업:</div>
                      <pre className="task-detail-json">
                        {JSON.stringify(worker.current_task, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WorkerStatus;
