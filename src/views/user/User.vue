<template>
	<div class="user">
		<div class="search">
			<span>角色:</span>
			<el-select
          v-model="roleId"
          placeholder="请选择用户角色"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in allRoleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
			<el-button style="margin-left:10px;" type="success" size="small" @click="queryUser">查询</el-button>
			<el-button style="margin-left:10px;"  size="small" @click="roleId=null">重置</el-button>
			<el-button type="primary" size="small" @click="add">添加</el-button>
		</div>
		<el-table :data="userList"  border style="width: 98%">
			<el-table-column prop="id" label="编号" width="180" />
			<el-table-column prop="username" label="用户名" width="250" />
			<el-table-column prop="userPic" label="头像" width="250">
				<template #default="scope">
					<el-image v-if="scope.row.userPic!=''" style="width: 50px; height: 50px" :src="scope.row.userPic" fit="cover" />
					<el-image v-else style="width: 50px; height: 50px" :src="emptyPicUrl" fit="cover" />
				</template>
			</el-table-column>
			<el-table-column prop="role.roleName" label="角色名称" width="250" />
			<el-table-column prop="phone" label="联系电话" width="250" />
			<el-table-column label="操作">
				<template #default="scope">
					<el-button
						type="primary"
						size="small"
						@click="edit(scope.row.id)">
						编辑
					</el-button>
					<el-button
						type="danger"
						size="small"
						@click="del(scope.row.id, scope.row.userPic)"
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
				:total="userTotal"
				@size-change="handleSizeChange"
				@current-change="handleCurrentChange"
			/>
		</div>
	</div>
	<edit-user ref="editRef" @sync-list="loadUser" @edit="edit"></edit-user>
</template>

<script setup lang="ts">
import {ref, onMounted} from 'vue'
import type {ComponentSize} from 'element-plus'
import EditUser from "../../components/user/EditUser.vue"
import { ElMessageBox, ElNotification } from 'element-plus'
import {$list, $getOne, $del} from "../../api/admin.ts"
import {$list as $roleList} from "../../api/role.ts"

interface User {
	id: Number
	username: String
	password: String
	userPic: String
	roleId: Number
}
interface Role {
	roleId: Number
	roleName: String
}
const editRef = ref(null)
const currentPage = ref<Number>(1)
const pageSize = ref<Number>(5)
const userTotal = ref<Number>(0)
const size = ref<ComponentSize>('small')
const userList = ref<User[]>([])
const allRoleList = ref<Role[]>([])
const roleId = ref(0)
const emptyPicUrl = "images/female.png"

const handleSizeChange = (val: Number) => {
	pageSize.value = val;
	loadUser();
}
const handleCurrentChange = (val: Number) => {
	currentPage.value = val;
	loadUser();
}
const add = () => {
	editRef.value.formData = {
		username: "",
		password: "",
		name: "",
		phone: "",
		userPic: "",
		roleId: ""
	}
	editRef.value.drawer = true
}
const edit = async (id: Number) => {
	const {success, msg, data} = await $getOne({id});
	if(success) {		
		editRef.value.formData = data;
		editRef.value.drawer = true;
	} else {
		ElNotification({
			title: "通知",
			message: msg,
			type: "error"
		})
	}
}
const del = (id:Number,userPic:String) => {
	ElMessageBox.confirm('确定要删除该用户吗?',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      const {success, msg} =	await $del({id, userPic});
			if(success) {
				ElNotification({
					title: "通知",
					message: msg,
					type: "success"
				})
				loadUser();
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
const loadUser = async() => {
	const {success, msg, data:{total,records}} = await $list({
		roleId: roleId.value==0?null:roleId.value,
		current: currentPage.value,
		size: pageSize.value
	})
	if(success) {
		userTotal.value = total; 
		userList.value = records;
	}else{
		ElNotification({
			title: "通知",
			message: msg,
			type: "error"
		})
	}
}
const loadRole = async() => {
	const {success, data} = await $roleList()
	if(success) {
		allRoleList.value = data;
		allRoleList.value.unshift({roleId: 0, roleName:'请选择用户角色'})
	}
}
const queryUser =  () => loadUser()
onMounted(()=>{
	loadUser()	
	loadRole()
})
</script>

<style lang="scss" scoped>
.search {
	margin-bottom: 5px;
	span{
		font-size: 12px;
		color: #666;
		margin-right: 10px;
	}
}
.pagination {
	width: 98%;
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
}
</style>