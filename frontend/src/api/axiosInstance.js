import axios from 'axios';

// The URL of your backend server
const BACKEND_URL = 'https://expensetracker-s79p.onrender.com/api';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // This is CRUCIAL for sending and receiving cookies
});

export default axiosInstance;