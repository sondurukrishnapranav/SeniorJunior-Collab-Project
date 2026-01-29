import axios from 'axios';

const api = axios.create({
  baseURL: "https://seniorjunior-collab-project.onrender.com/",
});

export default api;
