import axios from 'axios';

const api = axios.create({
   baseURL: "https://financas-web-19.onrender.com", // backend FastAPI
});

export default api;
