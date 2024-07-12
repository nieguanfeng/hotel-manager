import {$get, $post, $put, $delete} from '../utils/request.ts';

// 获取客户列表
export const $list = async(params: Object) => await $post('/api/guestRecord/list', params);

// 获取单个客户
export const $getOne = async (params: Object = {}) => await $post('/api/guestRecord/getOne', params);

// 结账
export const $checkOut = async(params: Object = {}) => $post('/api/guestRecord/checkOut', params)

// 添加客户
export const $add = async(params:Object={}) => await $post("/api/guestRecord/add", params)

// 更新客户
export const $upd = async(params:Object={}) => await $put("/api/guestRecord/update", params)

// 删除客户
export const $del = async(id: Number) => await $delete(`/api/guestRecord/del/${id}`);