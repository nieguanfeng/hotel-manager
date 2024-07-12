import {$get, $post, $put, $delete} from '../utils/request.ts'
// 返回角色列表
export const $list = async() => $get("/api/role/list")

// 获取单个角色
export const $getOne = async(id: Number) => $get(`/api/role/getOne?roleId=${id}`)

// 添加角色
export const $add = async(params:Object={}) => await $post("/api/role/add", params)

// 更新角色
export const $upd = async(params:Object={}) => await $put("/api/role/update", params)

// 删除角色
export const $del = async(id: Number) => await $delete(`/api/role/del/${id}`);