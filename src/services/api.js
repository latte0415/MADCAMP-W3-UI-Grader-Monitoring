/** API 서비스 레이어 */
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Run 모니터링 데이터 조회
 * @param {string} runId - Run ID
 * @returns {Promise} 모니터링 데이터
 */
export const getRunMonitor = async (runId) => {
  const response = await api.get(`/api/runs/${runId}/monitor`);
  return response.data;
};

/**
 * Run 그래프 데이터 조회
 * @param {string} runId - Run ID
 * @returns {Promise} 그래프 데이터
 */
export const getRunGraph = async (runId) => {
  const response = await api.get(`/api/runs/${runId}/graph`);
  return response.data;
};

/**
 * 전체 워커 상태 조회
 * @returns {Promise} 워커 상태 데이터
 */
export const getWorkersStatus = async () => {
  const response = await api.get('/api/workers/status');
  return response.data;
};

/**
 * 특정 run_id와 관련된 워커 상태 조회
 * @param {string} runId - Run ID
 * @returns {Promise} 워커 상태 데이터
 */
export const getRunWorkersStatus = async (runId) => {
  const response = await api.get(`/api/workers/status/${runId}`);
  return response.data;
};

export default api;
