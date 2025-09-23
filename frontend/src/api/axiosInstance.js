import axios from 'axios';

// The URL of your backend server
const BACKEND_URL = 'https://expensetracker-s79p.onrender.com/api';
// const BACKEND_URL = 'http://localhost:4000/api';


const axiosInstance = axios.create({
  baseURL: BACKEND_URL,
  withCredentials: true, // This is CRUCIAL for sending and receiving cookies
});

export default axiosInstance;