import {$get} from '../utils/request.ts'

// 所有状态列表
export const $list = async(params: Object={}) => await $get('/api/roomState/list', params);

// 没有入住状态的列表
export const $list2 = async(params: Object={}) => await $get('/api/roomState/list2', params);