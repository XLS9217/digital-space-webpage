import axios from 'axios';

const request = axios.create({
    baseURL: 'http://172.16.16.246:9101/api'
});

export default request;
