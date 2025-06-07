// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const API_ENDPOINTS = {
  BASE: API_BASE_URL,
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    WALLET_LOGIN: `${API_BASE_URL}/api/auth/wallet-login`,
    USER_INFO: (address: string) => `${API_BASE_URL}/api/auth/user-info/${address}`,
    VALIDATOR_REGISTER: `${API_BASE_URL}/api/auth/validator-register`,
    VALIDATOR_LOGIN: `${API_BASE_URL}/api/auth/validator-login`,
    VALIDATOR_INFO: (address: string) => `${API_BASE_URL}/api/auth/validator-info/${address}`,
  },
  WEBSITES: {
    BASE: `${API_BASE_URL}/api/websites`,
    BY_ID: (id: string) => `${API_BASE_URL}/api/websites/${id}`,
    STATS: (id: string, timeframe: string) => `${API_BASE_URL}/api/websites/${id}/stats?timeframe=${timeframe}`,
    MARKETPLACE: `${API_BASE_URL}/api/websites/marketplace`,
  },
  CHECKS: {
    BASE: `${API_BASE_URL}/api/checks`,
    VALIDATOR_PERFORMANCE: `${API_BASE_URL}/api/checks/validator-performance`,
    VALIDATOR_STATS: `${API_BASE_URL}/api/checks/validator-stats`,
  },
  USERS: `${API_BASE_URL}/api/users`,
  ASSIGNMENTS: `${API_BASE_URL}/api/assignments`,
};

export default API_ENDPOINTS; 