import axios from 'axios';
const instance = axios.create({
	baseURL: 'https://pollstr-app.herokuapp.com/api/'
})

// TODO : refresh login
// instance.interceptors.response.use();