<template>
  <div class="live-in">
    <div class="search">
			<span>顾客姓名:</span>
			<el-input v-model.trim="guestName" placeholder="请输入顾客姓名" style="width:240px" size="small"/>
			<span class="ml10">状态:</span>
			<el-select
				v-model="resideStateId"
				placeholder="请选择状态"
				style="width: 240px"
				size="small"
			> 
				<el-option
					v-for="item in resideStateList"
					:key="item.resideStateId"
					:label="item.resideStateName"
					:value="item.resideStateId"
				/>
			</el-select>
			<el-button style="margin-left:10px;" type="success" size="small" @click="loadList">查询</el-button>
			<el-button style="margin-left:10px;"  size="small" @click="resetCondition">重置</el-button>
			<el-button style="margin-left:10px;" type="success" size="small" @click="exportExcel">导出Excel</el-button>
			<el-button type="primary" size="small" @click="add">添加</el-button>
		</div>
    <el-table :data="liveInlist" border style="width: 98%">
			<el-table-column prop="guestId" label="顾客ID" width="100" />
      <el-table-column prop="guestName" label="顾客名称" width="150" />
      <el-table-column prop="identityId" label="身份证号" width="250" />
			<el-table-column prop="phone" label="电话" width="180" />
			<el-table-column prop="roomTypeName" label="房型" width="150" />
			<el-table-column prop="roomId" label="房间号" width="150" />
			<el-table-column prop="guestNum" label="入住人数" width="250" />
			<el-table-column prop="resideStateName" label="入住状态" width="100" />
			<el-table-column prop="deposit" label="押金" width="150" />
			<el-table-column prop="totalMoney" label="总金额" width="150" />
      <el-table-column prop="resideDate" label="入住日期" width="200" />     
			<el-table-column prop="leaveDate" label="离开日期" width="200" />
			<el-table-column label="操作">
				<template #default="scope">
					<el-button v-if="scope.row.resideStateId==1" type="primary" size="small" @click="edit(scope.row.guestId)">
						编辑
					</el-button>
					<el-button  v-if="scope.row.resideStateId==1" type="warning" size="small" @click="checkOut(scope.row.guestId)">
						结账
					</el-button>
					<el-button v-if="scope.row.resideStateId==2" type="danger" size="small" @click="del(scope.row.guestId)">
						删除
					</el-button>
				</template>
			</el-table-column>
		</el-table>
		<div class="pagination">
			<el-pagination background v-model:current-page="currentPage" v-model:page-size="pageSize"
				:page-sizes="[5, 10, 15, 20]" :size="size" layout="total, sizes, prev, pager, next, jumper"
				:total="liveInTotal" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
		</div>
  </div>
	<edit-custom ref="editCustomRef" @sync-list="loadList"></edit-custom>
</template>

<script setup lang="ts">
import {ref,onMounted} from 'vue'
import EditCustom from '../../components/custom/EditCustom.vue'
import {ElMessage,ElMessageBox,ElNotification } from 'element-plus'
import {$list as $resideStateList} from '../../api/resideState.ts'
import {$list, $getOne, $checkOut, $del} from '../../api/guest.ts'
import {xlsx} from '../../utils/xlsx.js'

interface ResideState {
	resideStateId: Number
	resideStateName: String
}
interface LiveIn {
	guestId: Number,
	guestName: String,
	identityId: String,
	phone: String,
	roomTypeName: String,
	roomId: Number | String,
	guestNum: Number | String,
	resideStateName: String,
	deposit:  Number | String,
	totalMoney:  Number | String,
	resideDate: String,
	leaveDate: String
}
const liveInlist = ref<LiveIn[]>([]);
const liveInTotal = ref<Number>(0)
const currentPage = ref<Number>(1)
const pageSize = ref<Number>(5)
const editCustomRef = ref(null)
// 状态
const resideStateId = ref(0)
// 顾客姓名
const guestName = ref<String>(null)
const resideStateList = ref<ResideState[]>([])
const resetCondition = () => {
	resideStateId.value = 0;
	guestName.value = null
}
const exportExcel = () => {
	let data = liveInlist.value.map(r=>{
		// 数据
		return {
			guestId: r.guestId,
			guestName: r.guestName,
			identityId: r.identityId,
			phone: r.phone,
			roomTypeName: r.roomTypeName,
			roomId: r.roomId,
			guestNum: r.guestNum,
			resideStateName: r.resideStateName,
			deposit: r.deposit,
			totalMoney: r.totalMoney,
			resideDate: r.resideDate,
			leaveDate: r.leaveDate
		}
	})
	// 表头
	let head = {
		guestId: "顾客ID",
		guestName: "顾客名称",
		identityId: "身份证号",
		phone: "顾客电话",
		roomTypeName: "房间类型",
		roomId: "房间号",
		guestNum: "顾客人数",
		resideStateName: "入住状态",
		deposit: "押金",
		totalMoney: "房间价格",
		resideDate: "入驻日期",
		leaveDate: "离开日期"
	}
	xlsx(data, head, "入住信息");
}
const add = () => {
	editCustomRef.value.drawer = true;
}
const edit = async (guestId: Number) => {
	// editCustomRef.value.operate = 'edit'
	const {success, data} = await $getOne({guestId});
	if(success) {		
		editCustomRef.value.formData = data;
		editCustomRef.value.drawer = true;
	}
}
const checkOut = async(guestId: Number) => {
	ElMessageBox.confirm('确定要结账吗?',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			const {success, data:{totalMoney}} = await $checkOut({guestId});
			if(success) {
				ElMessage({
					message: '结账成功，结账金额为:'+totalMoney,
					type: 'success'
				})
				loadList()
			} else {
				ElMessage({
					message: '结账失败',
					type: 'error'
				})
			}
		}).catch(() => {
		})
}
const del = async (guestId: Number) => {
	ElMessageBox.confirm('确定要删除该房间吗?',
		'提示',
		{
			confirmButtonText: '确定',
			cancelButtonText: '取消',
			type: 'warning',
		}).then(async () => {
			const { success, msg } = await $del(guestId);
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

const handleSizeChange = (val: Number) => {
	pageSize.value = val;
	loadList();
}
const handleCurrentChange = (val: Number) => {
	currentPage.value = val;
	loadList();
}
// 加载客户列表
const loadList = async() => {
  const { success, msg, data: { total, records } } = await $list({
		resideStateId:resideStateId.value!=0?resideStateId.value:null,
		guestName:guestName.value,
    current: currentPage.value,
    size: pageSize.value
  });
  if(success) {
    liveInlist.value = records;
    liveInTotal.value = total;
  } else {
    ElNotification({
			title: "通知",
			message: msg, 
			type: "error"
		})
  }
}
const loadResideStateList = async() => {
	const {success, data} = await $resideStateList()
	console.log(data)
	if(success) {
		resideStateList.value = data;
    resideStateList.value.unshift({resideStateId: 0, resideStateName: '请选择房间状态'})
	}
}

onMounted(()=>{
  loadList();
	loadResideStateList();
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