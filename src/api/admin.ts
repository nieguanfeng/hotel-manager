import { $post, $get, $put, $delete } from '../utils/request'
import { ElNotification } from 'element-plus'

// 登录方法
export const $login = async (params: object) => {
	const { success, msg, token } = await $post('/api/auth/login', params)
	if (success) {
		// 登录成功后，将token信息保存到浏览器缓存中
		sessionStorage.setItem("token", token);
		ElNotification({
			title: "通知",
			message: msg,
			type: "success"
		})
		return true;
	} else {
		ElNotification({
			title: "通知",
			message: msg,
			type: "error"
		})
		return false;
	}
}

// 退出系统
export const $logout = async () => {
	const { success, msg } = await $get('/api/auth/logout')
	if (success) {
		ElNotification({
			title: "通知",
			message: msg,
			type: "success"
		})
	} else {
		ElNotification({
			title: "通知",
			message: msg,
			type: "error"
		})
	}
	return {success}
}

// 获取用户列表
export const $list = async (params: Object = {}) => await $post("/api/user/list", params);

// 获取一个用户
export const $getOne = async (params: Object = {}) => await $post('/api/user/getOne', params);

// 添加账户
export const $add = async(params: Object = {}) => await $post('/api/user/add', params);

// 更新用户
export const $upd = async(params: Object = {}) => await $put('/api/user/update', params);

// 重置密码
export const $resetPwd = async(params: Object ={}) => await $post('/api/user/resetPwd', params);

// 删除用户
export const $del = async (params: Object = {}) => await $post('/api/user/del', params);