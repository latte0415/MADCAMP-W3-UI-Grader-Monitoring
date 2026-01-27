/** 엣지 요약 리스트 컴포넌트 */
import React, { useState, useMemo } from 'react';

const EdgeList = ({ edges = [], nodes = [] }) => {
  const [expandedId, setExpandedId] = useState(null);

  const nodeMap = useMemo(
    () => Object.fromEntries(
      (nodes || []).map((n) => [n.id, n.url_normalized || n.url || n.id])
    ),
    [nodes]
  );

  // 노드 인덱스 맵 (그래프와 동일한 번호 사용)
  const nodeIndexMap = useMemo(() => {
    const map = {};
    (nodes || []).forEach((node, index) => {
      map[node.id] = index + 1;
    });
    return map;
  }, [nodes]);

  /** 전체 노드 URL의 공통 접두어. 경로 경계(/)에서 끊음 */
  const commonPrefix = useMemo(() => {
    const urls = Object.values(nodeMap).filter((u) => typeof u === 'string' && u.length > 0);
    if (!urls.length) return '';
    let pre = urls[0];
    for (let i = 1; i < urls.length; i++) {
      const u = urls[i];
      while (pre.length && !u.startsWith(pre)) pre = pre.slice(0, -1);
      if (!pre) return '';
    }
    const lastSlash = pre.lastIndexOf('/');
    if (lastSlash >= 0) return pre.slice(0, lastSlash + 1);
    return pre;
  }, [nodeMap]);

  const getUrlSuffix = (id) => {
    if (!id) return '-';
    const u = nodeMap[id];
    if (typeof u !== 'string') return id;
    const suffix = commonPrefix && u.startsWith(commonPrefix)
      ? u.slice(commonPrefix.length)
      : u;
    if (!suffix) return '/';
    return suffix.length > 50 ? suffix.slice(0, 47) + '...' : suffix;
  };

  const getActionDescription = (edge) => {
    const type = edge.action_type || '';
    const intent = edge.intent_label || '';
    const target = edge.action_target != null && String(edge.action_target).trim() !== ''
      ? String(edge.action_target)
      : null;
    const value = edge.action_value != null && String(edge.action_value).trim() !== ''
      ? String(edge.action_value)
      : null;

    const parts = [];
    if (intent) parts.push(intent);
    else if (type) parts.push(type);

    if (target) parts.push(`대상: ${target}`);
    if (value) parts.push(`"${value.length > 30 ? value.slice(0, 27) + '...' : value}"`);

    return parts.length ? parts.join(' · ') : (type || '-');
  };

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!edges.length) {
    return (
      <div className="edge-list-section">
        <h3>엣지 목록</h3>
        <div className="empty-state">엣지가 없습니다.</div>
      </div>
    );
  }

  return (
    <div className="edge-list-section">
      <h3>엣지 목록</h3>
      <div className="edge-list-container">
        <ul className="edge-list">
          {edges.map((edge, index) => {
            const id = edge.id || `edge-${index}`;
            const isSuccess = edge.success === true || edge.outcome === 'success';
            const isExpanded = expandedId === id;
            const src = edge.source || edge.from_node_id;
            const tgt = edge.target || edge.to_node_id;

            const srcNodeIndex = nodeIndexMap[src] || '?';
            const tgtNodeIndex = nodeIndexMap[tgt] || '?';

            return (
              <li key={id} className="edge-list-item">
                <div
                  className="edge-list-row"
                  onClick={() => toggleExpand(id)}
                  style={{ cursor: 'pointer' }}
                >
                  <span className="edge-index">{index + 1}</span>
                  <span className="edge-route">
                    {getUrlSuffix(src)} → {getUrlSuffix(tgt)}
                    <span className="edge-node-indices"> ({srcNodeIndex} → {tgtNodeIndex})</span>
                  </span>
                  <span className="edge-action-desc">{getActionDescription(edge)}</span>
                  <span className={`edge-outcome outcome-${isSuccess ? 'success' : 'fail'}`}>
                    {isSuccess ? '성공' : '실패'}
                  </span>
                  <span className="edge-expand">{isExpanded ? '▼' : '▶'}</span>
                </div>
                {isExpanded && (
                  <div className="edge-detail">
                    {edge.intent_label && (
                      <div className="edge-detail-row">
                        <span className="detail-label">의도:</span>
                        <span>{edge.intent_label}</span>
                      </div>
                    )}
                    {edge.action_type && (
                      <div className="edge-detail-row">
                        <span className="detail-label">타입:</span>
                        <span>{edge.action_type}</span>
                      </div>
                    )}
                    {edge.action_target != null && (
                      <div className="edge-detail-row">
                        <span className="detail-label">대상:</span>
                        <span>{String(edge.action_target)}</span>
                      </div>
                    )}
                    {edge.action_value != null && edge.action_value !== '' && (
                      <div className="edge-detail-row">
                        <span className="detail-label">값:</span>
                        <span>{String(edge.action_value)}</span>
                      </div>
                    )}
                    {edge.created_at && (
                      <div className="edge-detail-row">
                        <span className="detail-label">생성:</span>
                        <span>{edge.created_at}</span>
                      </div>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default EdgeList;
