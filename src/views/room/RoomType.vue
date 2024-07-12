<template>
	<div class="room-type">
		<div class="search">
			<el-button type="primary" size="small" @click="add">添加</el-button>
		</div>
		<el-table :data="roomTypeList" border style="width: 98%">
			<el-table-column prop="roomTypeId" label="房型ID" width="180" />
			<el-table-column prop="roomTypeName" label="房型名称" width="250" />
			<el-table-column prop="roomTypePrice" label="房型单价" width="250" />
			<el-table-column prop="bedNum" label="房型号" width="250" />
			<el-table-column prop="typeDescription" label="类型描述" width="250" />
			<el-table-column prop="typeTotalMoney" label="类型总计" width="250" />
			<el-table-column label="操作">
				<template #default="scope">
					<el-button type="primary" size="small" @click="edit(scope.row.roomTypeId)">
						编辑
					</el-button>
					<el-button type="danger" size="small" @click="del(scope.row.roomTypeId)">
						删除
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination">
			<el-pagination background v-model:current-page="currentPage" v-model:page-size="pageSize"
				:page-sizes="[5, 10, 15, 20]" :size="size" layout="total, sizes, prev, pager, next, jumper"
				:total="roomTypeTotal" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>
	</div>
	<edit-room-type ref="editRoomTypeRef" @sync-list="loadRoomType" @edit="edit"></edit-room-type>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { $list, $getOne, $del } from '../../api/roomType.ts'
import EditRoomType from '../../components/room/EditRoomType.vue'
import { ElMessageBox,ElNotification } from 'element-plus'
import type { ComponentSize } from 'element-plus'

const editRoomTypeRef = ref(null)
// 房型列表
const roomTypeList = ref([]);
const currentPage = ref<Number>(1)
const pageSize = ref<Number>(5)
const roomTypeTotal = ref<Number>(0)
const size = ref<ComponentSize>('small')

const handleSizeChange = (val: Number) => {
	pageSize.value = val;
	loadRoomType();
}
const handleCurrentChange = (val: Number) => {
	currentPage.value = val;
	loadRoomType();
}

const loadRoomType = async () => {
	const { success, msg, data: { total, records } } = await $list({
		current: currentPage.value,
		size: pageSize.value
	});
	if (success) {
		roomTypeList.value = records;
		roomTypeTotal.value = total;
	} else {
		ElNotification({
			title: "通知",
			message: msg,
			type: "error"
		})
	}
}
const add = () => {
	editRoomTypeRef.value.drawer = true;
}
const edit = async (roomTypeId: Number) => {
	const {success, data} = await $getOne({roomTypeId});
	if(success) {
		editRoomTypeRef.value.formData = data;
		editRoomTypeRef.value.drawer = true;
	}
}
const del = async (roomTypeId: Number) => {
	ElMessageBox.confirm('确定要删除该角色吗?',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			const { success, msg } = await $del(roomTypeId);
			if (success) {
				ElNotification({
					title: "通知",
					message: msg,
					type: "success"
				})
				loadRoomType();
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
onMounted(() => {
	loadRoomType();
})
</script>

<style lang="scss" scoped>
.pagination {
	width: 98%;
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
}
</style>