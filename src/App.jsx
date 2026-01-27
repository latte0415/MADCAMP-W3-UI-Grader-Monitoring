import { useState, useEffect, useCallback } from 'react';
import './App.css';
import RunInfo from './components/RunInfo';
import Dashboard from './components/Dashboard';
import GraphVisualization from './components/GraphVisualization';
import EdgeList from './components/EdgeList';
import WorkerStatus from './components/WorkerStatus';
import RealtimeStatus from './components/RealtimeStatus';
import { getRunMonitor, getRunGraph, getWorkersStatus, getRunWorkersStatus } from './services/api';

function App() {
  const [runId, setRunId] = useState('');
  const [inputRunId, setInputRunId] = useState('');
  const [monitorData, setMonitorData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [workersStatus, setWorkersStatus] = useState(null);
  const [runWorkersStatus, setRunWorkersStatus] = useState(null);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!runId) return;

    setLoading(true);
    setError(null);

    try {
      // 병렬로 모든 데이터 조회
      const [monitor, graph, workers, runWorkers] = await Promise.all([
        getRunMonitor(runId),
        getRunGraph(runId),
        getWorkersStatus(),
        getRunWorkersStatus(runId)
      ]);

      setMonitorData(monitor);
      setGraphData(graph);
      setWorkersStatus(workers);
      setRunWorkersStatus(runWorkers);
      setLastUpdateTime(new Date());
      
      // 디버깅: 워커 상태 응답 확인
      if (process.env.NODE_ENV === 'development') {
        console.log('워커 상태 응답:', workers);
        console.log('Run 워커 상태 응답:', runWorkers);
      }
    } catch (err) {
      console.error('데이터 조회 실패:', err);
      setError(err.response?.data?.detail || err.message || '데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [runId]);

  // 초기 로드 및 자동 새로고침
  useEffect(() => {
    if (!runId) return;

    fetchData();

    if (isAutoRefresh) {
      const interval = setInterval(() => {
        fetchData();
      }, 3000); // 3초마다 새로고침

      return () => clearInterval(interval);
    }
  }, [runId, isAutoRefresh, fetchData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputRunId.trim()) {
      setRunId(inputRunId.trim());
    }
  };

  const handleToggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>그래프 구축 모니터링</h1>
        <form onSubmit={handleSubmit} className="run-id-form">
          <input
            type="text"
            value={inputRunId}
            onChange={(e) => setInputRunId(e.target.value)}
            placeholder="Run ID를 입력하세요"
            className="run-id-input"
          />
          <button type="submit" className="submit-button">조회</button>
        </form>
      </header>

      {error && (
        <div className="error-message">
          오류: {error}
        </div>
      )}

      {loading && !monitorData && (
        <div className="loading">데이터를 불러오는 중...</div>
      )}

      {runId && monitorData && (
        <>
          <RealtimeStatus
            isAutoRefresh={isAutoRefresh}
            onToggleAutoRefresh={handleToggleAutoRefresh}
            lastUpdateTime={lastUpdateTime}
          />

          <div className="content-grid">
            <div className="left-column">
              <RunInfo runInfo={monitorData.run_info} />
              <Dashboard
                statistics={monitorData.statistics}
                pendingActions={monitorData.pending_actions}
                runMemory={monitorData.run_memory}
              />
            </div>

            <div className="right-column">
              <GraphVisualization
                nodes={graphData?.nodes || []}
                edges={graphData?.edges || []}
              />
              <EdgeList
                edges={graphData?.edges || []}
                nodes={graphData?.nodes || []}
              />
              <WorkerStatus
                workersStatus={workersStatus}
                runWorkersStatus={runWorkersStatus}
              />
            </div>
          </div>
        </>
      )}

      {!runId && (
        <div className="welcome-message">
          <p>Run ID를 입력하여 모니터링을 시작하세요.</p>
        </div>
      )}
    </div>
  );
}

export default App;
