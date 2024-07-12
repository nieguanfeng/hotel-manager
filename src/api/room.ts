import {$get, $post, $put, $delete} from '../utils/request.ts'

// 获取房间列表
export const $list = async(params:Object={}) => await $post('/api/room/list', params)

// 获更具房间类型取可以入住的房间列表
export const $list2 = async(params:Object={}) => await $post('/api/room/roomByTypeId', params)

// 获取一个房型
export const $getOne = async (params: Object = {}) => await $post('/api/room/getOne', params);

export const $maxRoomId = async() => await $get('/api/room/maxRoomId');

// 添加房间
export const $add = async(params: Object = {}) => await $post('/api/room/add', params);

// 更新房间
export const $upd = async(params: Object = {}) => await $put('/api/room/update', params);

// 删除房间
export const $del = async (id:Number) => await $delete(`/api/room/del/${id}`);