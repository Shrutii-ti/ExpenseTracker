import axios from 'axios';

// The URL of your backend server
const BACKEND_URL = 'http://localhost:4000';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // This is CRUCIAL for sending and receiving cookies
});

export default axiosInstance;