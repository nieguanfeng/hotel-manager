<template>
  <el-drawer
    v-if="showDrawer"
    v-model="drawer" size="30%" 
    :title="formData.guestId?'修改顾客':'添加顾客'" 
    direction="rtl" 
    :before-close="closeDrawer"
  >
    <el-form ref="formRef" style="max-width: 600px" :model="formData" status-icon :rules="rules" size="small"
      label-width="100px">
      <el-form-item label="身份证号" prop="identityId">
        <el-input v-model="formData.identityId" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="顾客姓名" prop="guestName">
        <el-input v-model="formData.guestName" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="顾客电话" prop="phone">
        <el-input v-model="formData.phone" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="房间类型" prop="roomTypeId">
        <el-select
          v-model="formData.roomTypeId"
          placeholder="请选择房间类型"
          size="small"
          @change="loadRoomList"
        > 
          <el-option
            v-for="item in roomTypeList"
            :key="item.roomTypeId"
            :label="item.roomTypeName"
            :value="item.roomTypeId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="房间号" prop="roomId">
        <el-select
          v-model.number="formData.roomId"
          placeholder="请选择房间号"
          size="small"
        >
          <el-option
            v-for="item in roomList"
            :key="item.roomId"
            :label="item.roomName"
            :value="item.roomId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="入住时间 " prop="resideDate">
        <el-date-picker
          v-model="formData.resideDate"
          autocomplete="off"
          type="datetime"
          placeholder="请选择入住时间"
        />
      </el-form-item>
      <el-form-item label="押金" prop="deposit">
        <el-input v-model.number="formData.deposit" autocomplete="off"/>
      </el-form-item>
      <el-form-item label="入住人数" prop="guestNum">
        <el-input v-model.number="formData.guestNum  " autocomplete="off"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">
          {{formData.guestId ?'修改':'添加'}}
        </el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, reactive, onMounted, watch, nextTick} from 'vue'
// 导入element-plus类型
import type { FormInstance,FormRules } from 'element-plus'
import {$add,$upd} from "../../api/guest.ts"
import {$list2} from "../../api/room.ts"
import {$allRoomTypeList} from "../../api/roomType.ts"
import { ElNotification } from 'element-plus'
import lodash from 'lodash'
interface Guest{
  gustId?: Number
  identityId: String
  guestName: String
  phone: String
  roomId: Number | String
  roomTypeId: Number | String
  resideDate: String
  deposit: Number | String
  guestNum: Number | String
}
interface RoomType {
  roomTypeId: Number
  roomTypeName: String
}
interface Room {
  roomId: Number,
  roomName: String
}

const emit = defineEmits(['sync-list', 'edit'])
// 定义一个表单
const formRef = ref<FormInstance>()

const formData = ref<Guest>({ 
  identityId: "",
  guestName: "",
  phone: "",
  roomId: "",
  roomTypeId: 0,
  resideDate: "",
  deposit: "",
  guestNum: ""
});
const cloneFormData = ref<Guest>({ 
  identityId: "",
  guestName: "",
  phone: "",
  roomId: "",
  roomTypeId: 0,
  resideDate: "",
  deposit: "",
  guestNum: ""
});
const roomTypeList = ref<RoomType[]>([])
const roomList = ref<Room[]>([{roomId:0, roomName:"请选择房间"}])
const drawer = ref(false);
const showDrawer = ref(false)

// 验证
const rules = reactive<FormRules<typeof formData>>({
  identityId: [{required: true, message:'输入身份证号'}],
  guestName: [{required: true, message:'输入顾客姓名'}],
  phone: [{required: true, message:'输入顾客电话'}],
  roomId: [{required: true, message:'请选择房间号'}],
  roomTypeId: [{required: true, message:'请选择房间类型'}],
  resideDate: [{required: true, message: '请选择入住时间'}],
  deposit: [{required: true, message: '请输入押金'}],
  guestNum: [{required: true, message: '请输入入住人数'}]
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let res = {};
      if(formData.value.guestId) {
        res = await $upd({
          ...formData.value,
          oldRoomId: cloneFormData.value.roomId
        })
      } else {
        res = await $add({
          ...formData.value,
          resideDate: new Date(formData.value.resideDate).getTime()
        })
        // 清空表单
        resetForm(formRef.value)
      }
            
      if(res.success) {
        ElNotification({
          title: "通知",
          message: res.msg,
          type: "success"
        })
        // 通知父组件，加载列表
        emit('sync-list')        
      } else {
        ElNotification({
          title: "通知",
          message: res.msg,
          type: "error"
        })
      }
    } else {
      return false;
    }
  })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  roomList.value = [{roomId:0, roomName:"请选择房间"}]
  if(formData.value.guestId) {
    formData.value = lodash.cloneDeep(cloneFormData.value)    
    return;
  }
  formData.value = { 
    identityId: "",
    guestName: "",
    phone: "",
    roomId: "",
    roomTypeId: 0,
    resideDate: "",
    deposit: "",
    guestNum: ""
  }
}

const closeDrawer = () => {
	drawer.value = false
	resetForm(formRef.value)
}
// 加载房间类型数据
const loadRoomTypeList = async() => {
	const {success, data} = await $allRoomTypeList()
	if(success) {
		roomTypeList.value = data || [];
    roomTypeList.value.unshift({roomTypeId: 0, roomTypeName: '请选择房间类型'})
	}
}
// 加载房间数据
const loadRoomList = async() => {
  if(formData.value.roomTypeId==0) {
    return;
  }
  formData.value.roomId = 0;
  const {success, msg, data} = await $list2({
    roomTypeId: formData.value.roomTypeId,
    guestId: formData.value.guestId
  })
  if(success) {
    roomList.value = data.map(r=>({roomId: r.roomId, roomName: r.roomId+"号房间"}));
    roomList.value.unshift({roomId:0, roomName:"请选择房间"})
    nextTick(()=>{
      formData.value.roomId = cloneFormData.value.roomId
    })
  } else {
    console.log(msg)
  }
}

watch(drawer,(newValue)=>{
  if(newValue) {
    showDrawer.value = true;
    if(formData.value.guestId) {
      cloneFormData.value = lodash.cloneDeep(formData.value)
    }
    if(formData.value.roomTypeId) {
      loadRoomList();
    }
  } else {
    setTimeout(()=>{
      showDrawer.value = false;
    },500)
  }
},{immediate: true})
onMounted(()=>{
  loadRoomTypeList()
})
// 暴漏成员
defineExpose({
  drawer,
  formData
});
</script>

<style lang="scss" scoped>
</style>