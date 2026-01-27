/** 통계 대시보드 컴포넌트 */
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Dashboard = ({ statistics, pendingActions, runMemory }) => {
  if (!statistics) {
    return <div>통계를 불러오는 중...</div>;
  }

  // 액션 타입별 분포 차트 데이터
  const actionTypeData = Object.entries(statistics.action_type_distribution || {}).map(([name, value]) => ({
    name,
    value
  }));

  // 엣지 결과 파이 차트 데이터
  const outcomeData = [
    { name: '성공', value: statistics.edge_outcomes?.success || 0 },
    { name: '실패', value: statistics.edge_outcomes?.fail || 0 }
  ];

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6'];

  // Pending Actions 목록 추출
  const pendingActionsList = pendingActions?.actions || pendingActions?.list || [];
  
  // Run Memory 데이터 추출
  const runMemoryData = runMemory?.memory || runMemory?.data || runMemory || {};

  return (
    <div className="dashboard">
      <h2>통계 대시보드</h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">노드 수</div>
          <div className="stat-value">{statistics.node_count || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">엣지 수</div>
          <div className="stat-value">{statistics.edge_count || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Pending Actions</div>
          <div className="stat-value">{pendingActions?.count || pendingActionsList.length || 0}</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Run Memory 키</div>
          <div className="stat-value">{runMemory?.key_count || Object.keys(runMemoryData).length || 0}</div>
        </div>
      </div>

      <div className="charts-grid">
        {actionTypeData.length > 0 && (
          <div className="chart-container">
            <h3>액션 타입별 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={actionTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {statistics.edge_outcomes && statistics.edge_outcomes.total > 0 && (
          <div className="chart-container">
            <h3>엣지 결과</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={outcomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {outcomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Pending Actions 상세 목록 */}
      <div className="detail-section">
        <h3>Pending Actions 상세</h3>
        {pendingActionsList.length > 0 ? (
          <div className="detail-table-container">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>인덱스</th>
                  <th>액션 타입</th>
                  <th>상세 정보</th>
                </tr>
              </thead>
              <tbody>
                {pendingActionsList.map((action, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{action.type || action.action_type || '-'}</td>
                    <td>
                      <pre className="detail-json">
                        {JSON.stringify(action, null, 2)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Pending Actions가 없습니다.</div>
        )}
      </div>

      {/* Run Memory 상세 정보 */}
      <div className="detail-section">
        <h3>Run Memory 상세</h3>
        {Object.keys(runMemoryData).length > 0 ? (
          <div className="detail-table-container">
            <table className="detail-table">
              <thead>
                <tr>
                  <th>키</th>
                  <th>값</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(runMemoryData).map(([key, value]) => (
                  <tr key={key}>
                    <td className="memory-key">{key}</td>
                    <td>
                      <pre className="detail-json">
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">Run Memory가 비어있습니다.</div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
