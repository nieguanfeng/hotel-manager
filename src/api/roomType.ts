import {$get,$post,$put, $delete} from '../utils/request.ts'

// 获取房型列表
export const $list = async (params: Object = {}) => await $post("/api/roomType/list", params);

// 获取房型列表
export const $allRoomTypeList = async () => await $get("/api/roomType/list");

// 获取一个房型
export const $getOne = async (params: Object = {}) => await $post('/api/roomType/getOne', params);

// 添加房型
export const $add = async(params: Object = {}) => await $post('/api/roomType/add', params);

// 更新房型
export const $upd = async(params: Object = {}) => await $put('/api/roomType/update', params);

// 删除房型
export const $del = async (id:Number) => await $delete(`/api/roomType/del/${id}`);

// 返回销售信息
export const $totalTypePrice = async()=> await $get('/api/roomType/totalTypePrice');