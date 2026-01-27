/** 그래프 시각화 컴포넌트 */
import React, { useEffect, useRef, useMemo } from 'react';
import cytoscape from 'cytoscape';

const GraphVisualization = ({ nodes, edges }) => {
  const containerRef = useRef(null);
  const cyRef = useRef(null);

  // 노드 인덱스 맵 생성 (엣지 리스트와 동일한 번호 사용)
  const nodeIndexMap = useMemo(() => {
    const map = {};
    (nodes || []).forEach((node, index) => {
      map[node.id] = index + 1;
    });
    return map;
  }, [nodes]);

  // URL에서 짧은 라벨 추출
  const getShortLabel = (url) => {
    if (!url) return '';
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      if (path && path !== '/') {
        const parts = path.split('/').filter(p => p);
        return parts.length > 0 ? parts[parts.length - 1] : path;
      }
      return urlObj.hostname || url;
    } catch {
      // URL 파싱 실패 시 경로 부분만 추출
      const match = url.match(/\/([^\/]+)\/?$/);
      return match ? match[1] : url.slice(-20);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !nodes || nodes.length === 0) return;

    // 기존 그래프 제거
    if (cyRef.current) {
      cyRef.current.destroy();
    }

    // 노드 데이터 준비
    const nodeElements = nodes.map((node, index) => {
      const shortLabel = getShortLabel(node.url_normalized || node.url);
      const nodeNum = nodeIndexMap[node.id] || index + 1;
      return {
        data: {
          id: node.id,
          label: `${nodeNum}`,
          fullLabel: shortLabel || node.id.substring(0, 8),
          url: node.url || node.url_normalized
        }
      };
    });

    // 엣지 데이터 준비 - source/target과 from_node_id/to_node_id 모두 지원
    const edgeElements = edges
      .filter(edge => {
        const src = edge.source || edge.from_node_id;
        const tgt = edge.target || edge.to_node_id;
        return src && tgt && nodeIndexMap[src] && nodeIndexMap[tgt];
      })
      .map(edge => {
        const src = edge.source || edge.from_node_id;
        const tgt = edge.target || edge.to_node_id;
        return {
          data: {
            id: edge.id,
            source: src,
            target: tgt,
            label: edge.intent_label || edge.action_type || '',
            actionType: edge.action_type,
            outcome: edge.outcome || (edge.success ? 'success' : 'fail')
          }
        };
      });

    if (nodeElements.length === 0) return;

    // Cytoscape 초기화
    const cy = cytoscape({
      container: containerRef.current,
      elements: [...nodeElements, ...edgeElements],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#3b82f6',
            'label': 'data(label)',
            'width': 50,
            'height': 50,
            'text-valign': 'center',
            'text-halign': 'center',
            'font-size': '14px',
            'font-weight': 'bold',
            'color': '#fff',
            'border-width': 2,
            'border-color': '#fff',
            'shape': 'ellipse'
          }
        },
        {
          selector: 'node:selected',
          style: {
            'background-color': '#2563eb',
            'border-color': '#1e40af',
            'border-width': 3
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#9ca3af',
            'target-arrow-color': '#9ca3af',
            'target-arrow-shape': 'triangle',
            'target-arrow-size': 8,
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '10px',
            'font-weight': '500',
            'text-background-color': '#fff',
            'text-background-opacity': 0.8,
            'text-background-padding': '2px',
            'text-border-width': 1,
            'text-border-color': '#e5e7eb',
            'text-rotation': 'autorotate',
            'text-margin-y': -15,
            'opacity': 0.7
          }
        },
        {
          selector: 'edge[outcome = "success"]',
          style: {
            'line-color': '#10b981',
            'target-arrow-color': '#10b981',
            'opacity': 0.9
          }
        },
        {
          selector: 'edge[outcome = "fail"], edge[outcome = "timeout"], edge[outcome = "blocked"]',
          style: {
            'line-color': '#ef4444',
            'target-arrow-color': '#ef4444',
            'opacity': 0.9
          }
        }
      ],
      layout: {
        name: 'breadthfirst',
        directed: true,
        spacingFactor: 1.5,
        padding: 30
      },
      minZoom: 0.1,
      maxZoom: 2
    });

    // 노드 클릭 이벤트
    cy.on('tap', 'node', (evt) => {
      const node = evt.target;
      const url = node.data('url');
      if (url) {
        window.open(url, '_blank');
      }
    });

    // 노드 호버 시 툴팁
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target;
      const fullLabel = node.data('fullLabel');
      if (fullLabel) {
        node.style('label', `${node.data('label')}\n${fullLabel}`);
      }
    });

    cy.on('mouseout', 'node', (evt) => {
      const node = evt.target;
      node.style('label', node.data('label'));
    });

    // 줌/팬 컨트롤
    cy.on('tap', 'core', () => {
      cy.fit(cy.elements(), 50);
    });

    // 초기 뷰 설정
    setTimeout(() => {
      cy.fit(cy.elements(), 50);
    }, 100);

    cyRef.current = cy;

    // 컴포넌트 언마운트 시 정리
    return () => {
      if (cyRef.current) {
        cyRef.current.destroy();
      }
    };
  }, [nodes, edges, nodeIndexMap]);

  return (
    <div className="graph-visualization">
      <h2>그래프 시각화</h2>
      <div 
        ref={containerRef} 
        style={{ 
          width: '100%', 
          height: '600px', 
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          backgroundColor: '#fafafa'
        }} 
      />
      <div className="graph-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#3b82f6' }}></span>
          <span>노드 (번호)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#10b981' }}></span>
          <span>성공 엣지</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ef4444' }}></span>
          <span>실패 엣지</span>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualization;
