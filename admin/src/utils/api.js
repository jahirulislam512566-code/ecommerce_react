import axios from 'axios';

// 1. Initialize Axios Instance
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// 2. Request Interceptor: Inject Authentication State Metadata
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Ensure config.headers exists safely without breaking the Axios headers prototype instance
      if (!config.headers) {
        config.headers = {};
      }
      
      const cleanToken = token.trim(); // Clean whitespace once to save processing cycles
      
      // Inject variations to satisfy strict Bearer checks and exact custom middleware lookups
      config.headers['Authorization'] = `Bearer ${cleanToken}`;
      config.headers['token'] = cleanToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Response Interceptor: Catch Broken or Forbidden Session States
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Catch BOTH 401 (Expired/Missing) and 403 (Forbidden/Not Admin Role) statuses
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn(`Auth failure standard (${error.response.status}) met. Evicting local cached token...`);
      
      // Wipe the invalid or non-admin token so they can re-authenticate
      localStorage.removeItem('token');
      
      // Seamless layout flip back to login via a window reload sequence
      window.location.reload(); 
    }
    return Promise.reject(error);
  }
);

export default apiClient;