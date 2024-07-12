import {$get, $post, $put, $delete} from '../utils/request.ts';

export const $list = async() => await $get('/api/resideState/list')