import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_IP,
    withCredentials:true
});

axiosInstance.interceptors.request.use(
    (config) => {
        const userLoginId = localStorage.getItem('user_login_id');
        if (userLoginId) {
            // console.log("12345678",userLoginId)
            config.headers['User-Login-Id'] = userLoginId;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;
