<template>
	<div class="role">
		<div class="search">
			<el-button type="primary" size="small" @click="editRef.drawer=true">添加</el-button>
		</div>
		<el-table :data="showRoles"  border style="width: 98%">
    <el-table-column prop="roleId" label="编号" width="180" />
    <el-table-column prop="roleName" label="名称" width="250" />
		<el-table-column label="操作">
      <template #default="scope">
        <el-button
					type="primary"
					size="small"
					@click="edit(scope.row.roleId)">
          编辑
        </el-button>
        <el-button
          type="danger"
					size="small"
          @click="del(scope.row.roleId)"
        >
          删除
        </el-button>
      </template>
    </el-table-column>
  </el-table>
	<div class="pagination">
		<el-pagination
			background
			v-model:current-page="currentPage"
			v-model:page-size="pageSize"
			:page-sizes="[5, 10, 15, 20]"
			:size="size"
			layout="total, sizes, prev, pager, next, jumper"
			:total="roles.length"
			@size-change="handleSizeChange"
			@current-change="handleCurrentChange"
    />
	</div>
	</div>
	<edit-role ref="editRef" @sync-list="loadRoles"></edit-role>
</template>

<script setup lang="ts">
import {ref, onMounted, computed} from 'vue'
import EditRole from '../../components/role/EditRole.vue';
import {$list,$getOne,$del} from '../../api/role.ts'
import type { ComponentSize } from 'element-plus'
import { ElMessageBox, ElNotification } from 'element-plus'

interface Role {
	roleId: Number
	roleName: String
}
// 定义编辑组件的ref
const editRef = ref(null);
const roles = ref<Role[]>([])
const currentPage = ref(1)
const pageSize = ref(10)
const size = ref<ComponentSize>('small')

const loadRoles = async() => {
	const {success, data} = await $list()
	if(success) {
		roles.value = data;
	}
}
const handleSizeChange = (val: number) => {
  pageSize.value = val
}
const handleCurrentChange = (val: number) => {
	currentPage.value = val
}
const edit = async (roleId:Number) => {
	const {success, msg, data} = await $getOne(roleId);
	if(success) {
		editRef.value.formData = data;
		editRef.value.drawer = true;		
	}
}
const del = async (roleId:Number) => {
	ElMessageBox.confirm('确定要删除该角色吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const {success, msg} =	await $del(roleId);
			if(success) {
				ElNotification({
					title: "通知",
					message: msg,
					type: "success"
				})
				loadRoles();
			} else {
				ElNotification({
					title: "通知",
					message: msg,
					type: "error"
				})
			}
    }).catch(() => {
		})
}

// 显示的列表
const showRoles = computed(()=>{
	return roles.value.slice((currentPage.value-1)*pageSize.value, currentPage.value*pageSize.value)
})
onMounted(()=>{
	loadRoles();
})
</script>

<style lang="scss" scoped>
.search {
	margin-bottom: 5px;
}
.pagination {
	width: 98%;
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
}
</style>