<template>
  <div class="room">
    <div class="search">
			<span>房型:</span>
			<el-select
          v-model="roomTypeId"
          placeholder="请选择房型"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in roomTypeList"
            :key="item.roomTypeId"
            :label="item.roomTypeName"
            :value="item.roomTypeId"
          />
        </el-select>
        <span class="ml10">房间状态:</span>
        <el-select
            v-model="roomStateId"
            placeholder="请选择房型"
            size="small"
            style="width: 240px"
          >
            <el-option
              v-for="item in roomStateList"
              :key="item.roomStateId"
              :label="item.roomStateName"
              :value="item.roomStateId"
            />
        </el-select>
			<el-button style="margin-left:10px;" type="success" size="small" @click="loadList">查询</el-button>
			<el-button style="margin-left:10px;"  size="small" @click="resetCondition">重置</el-button>
			<el-button style="margin-left:10px;" type="success" size="small" @click="exportExcel">导出Excel</el-button>
			<el-button type="primary" size="small" @click="add">添加</el-button>
		</div>
		<el-table :data="roomList" border style="width: 98%">
			<el-table-column prop="roomId" label="房间号" width="100" />
      <el-table-column prop="roomType.roomTypeName" label="房型" width="150" />
      <el-table-column prop="roomType.roomTypePrice" label="价格" width="100" />
      <el-table-column prop="roomType.bedNum" label="床位" width="180" />
			<el-table-column prop="roomState.roomStateName" label="状态" width="100" />
			
			<el-table-column label="操作">
				<template #default="scope">
					<el-button type="primary" size="small" @click="edit(scope.row.roomId)">
						编辑
					</el-button>
					<el-button v-if="scope.row.roomState.roomStateId!=2" type="danger" size="small" @click="del(scope.row.roomId)">
						删除
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination">
			<el-pagination background v-model:current-page="currentPage" v-model:page-size="pageSize"
				:page-sizes="[5, 10, 15, 20]" :size="size" layout="total, sizes, prev, pager, next, jumper"
				:total="roomTotal" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>
  </div>
  <edit-room ref="editRoomRef" @sync-list="loadList" @edit="edit"></edit-room>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick} from 'vue'
import EditRoom from "../../components/room/EditRoom.vue"
import {$list,$getOne,$del} from '../../api/room.ts'
import {$allRoomTypeList} from '../../api/roomType.ts'
import {$list as $roomStateList} from '../../api/roomState.ts'
import { ElMessageBox,ElNotification } from 'element-plus'
import type { ComponentSize } from 'element-plus'
import {xlsx} from '../../utils/xlsx.js'

interface RoomType {
  roomTypeId: Number
  roomTypeName: String
}

interface RoomState {
  roomStateId: Number
  roomStateName: String
}

const editRoomRef = ref(null)
const roomList = ref([]);
const roomTotal = ref<Number>(0)
const currentPage = ref<Number>(1)
const pageSize = ref<Number>(5)
const size = ref<ComponentSize>('small')
const roomTypeId = ref<Number>(0)
const roomTypeList = ref<RoomType[]>([])
const roomStateId = ref<Number>(0)
const roomStateList = ref<RoomState[]>([])

const resetCondition = () => {
  roomTypeId.value = 0;
  roomStateId.value = 0;
}
const handleSizeChange = (val: Number) => {
	pageSize.value = val;
	loadList();
}
const handleCurrentChange = (val: Number) => {
	currentPage.value = val;
	loadList();
}

const loadList = async() => {
  const { success, msg, data: { total, records } } = await $list({
    roomTypeId: roomTypeId.value>0?roomTypeId.value:null,
    roomStateId: roomStateId.value>0?roomStateId.value:null,
    current: currentPage.value,
    size: pageSize.value
  });
  if(success) {
    roomList.value = records;
    roomTotal.value = total;
  } else {
    ElNotification({
			title: "通知",
			message: msg, 
			type: "error"
		})
  }
}
const loadRoomTypeList = async() => {
  const {success, data} = await $allRoomTypeList();
  if(success) {
    roomTypeList.value = data;
    roomTypeList.value.unshift({roomTypeId:0, roomTypeName: '请选择房间类型'})
  }
}
const loadRoomStateList = async() => {
  const {success, data} = await $roomStateList();
  console.log(data)
  if(success) {
    roomStateList.value = data;
    roomStateList.value.unshift({roomStateId:0, roomStateName: '请选择房间状态'})
  }
}
const add = () => {
	editRoomRef.value.operate = 'add'
	editRoomRef.value.drawer = true;
}
const edit = async (roomId: Number) => {
	editRoomRef.value.operate = 'edit'
	const {success, data} = await $getOne({roomId});
	if(success) {		
		editRoomRef.value.formData = data;
		editRoomRef.value.formData.id = roomId;
		editRoomRef.value.drawer = true;
	}
}
const del = async (roomId: Number) => {
	ElMessageBox.confirm('确定要删除该房间吗?',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			const { success, msg } = await $del(roomId);
			if (success) {
				ElNotification({
					title: "通知",
					message: msg,
					type: "success"
				})
				loadList();
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
const exportExcel = () => {
	let data = roomList.value.map(r=>{
		// 数据
		return {
			roomId: r.roomId,
			roomTypeName: r.roomType.roomTypeName,
			roomTypePrice: r.roomType.roomTypePrice,
			bedNum: r.roomType.bedNum,
			roomStateName: r.roomState.roomStateName
		}
	})
	// 表头
	let head = {
		roomId: "房间号",
		roomTypeName: "房间类型",
		roomTypePrice: "房间价格",
		bedNum: "床位数量",
		roomStateName: "房间状态"
	}
	xlsx(data, head, "房间信息");
}
onMounted(()=>{
  loadList();
  loadRoomTypeList();
  loadRoomStateList();
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
  .ml10 {
    margin-left: 10px;
  }
}
.pagination {
	width: 98%;
	margin-top: 10px;
	display: flex;
	justify-content: flex-end;
}  
</style>