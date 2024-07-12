import axios from 'axios'
import {baseURL_dev} from '../config/baseURL'
// 初始化一个axios对象
const instance = axios.create({
  baseURL: baseURL_dev,
  timeout: 30000
});

// 请求拦截器
instance.interceptors.request.use(function (config) {
    // 在发送请求之前做些什么
    config.headers['Cache-Control'] = 'no-cach'
	// 每次发请求之前，向请求头添加token信息
	config.headers['Authorization'] = "Bearer " + sessionStorage.getItem('token')
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 响应拦截器
instance.interceptors.response.use(function (response) {
    // 对响应数据做点什么
    return response;
}, function (error) {
	// 对响应错误做点什么
	return Promise.reject(error);
});


// get请求方法
export const $get = async(url:string, params:object={}) => {
  if(Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length==0) {
    let {data} = await instance.get(url);
    return data;
  } else {    
    let {data} = await instance.get(url, params);
    return data;
  }
}

// post请求方法
export const $post = async(url:string, params:object={}) =>{
	let {data} = await instance.post(url, params);
	return data;
}

// update请求方法
export const $put = async(url:string, params:Object={}) =>{
  let {data} = await instance.put(url, params);
  return data;
}

// delete请求方法
export const $delete = async(url:string, params:object={}) => {
  if(Object.prototype.toString.call(params) === '[object Object]' && Object.keys(params).length==0) {
    let {data} = await instance.delete(url);
    return data;
  } else {
    let {data} = await instance.delete(url, params);
    return data;    
  }
}