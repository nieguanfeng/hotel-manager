<template>
  <el-drawer
    v-if="showDrawer"
    v-model="drawer" size="30%" 
    :title="formData.id?'修改房间':'添加房间'" 
    direction="rtl" 
    :before-close="closeDrawer"
  >
    <el-form ref="formRef" style="max-width: 600px" :model="formData" status-icon :rules="rules" size="small"
      label-width="100px">
      <el-form-item label="房间号" prop="roomId">
        <div style="display: flex;flex-wrap: nowrap;">
          <el-input v-model.number="formData.roomId" autocomplete="off" style="width:350px"/>
          <span style="color: red;margin-left:10px">(目前最大房间号是:{{ maxRoomId }})</span>
        </div>
      </el-form-item>
      <el-form-item label="房间描述" prop="description">
        <div style="border: 1px solid #ccc">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            mode="default"
          />
          <Editor
            style="height: 300px; width: 100%;"
            v-model="formData.description"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
          />
        </div>        
      </el-form-item>
      <el-form-item label="房间类型" prop="roomTypeId">
        <el-select
          v-model.number="formData.roomTypeId"
          placeholder="请选择角色"
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
      </el-form-item>
      <el-form-item label="房间状态" prop="roomStateId">
        <el-select
          v-model.number="formData.roomStateId"
          placeholder="请选择角色"
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
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">
          {{formData.id ?'修改':'添加'}}
        </el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, reactive,shallowRef, onMounted, watch} from 'vue'
// 导入element-plus类型
import type { FormInstance,FormRules } from 'element-plus'
import {$maxRoomId,$add,$upd,$getOne} from "../../api/room.ts"
import {$allRoomTypeList} from "../../api/roomType.ts"
import {$list2 as $roomStateList} from "../../api/roomState.ts"
import { ElNotification } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import lodash from 'lodash'
interface Room{
  id?: Number
  roomId: Number
  roomStateId: Number
  roomTypeId: Number
  description: String
}

const emit = defineEmits(['sync-list', 'edit'])
// 定义一个表单
const formRef = ref<FormInstance>()

const formData = ref<Room>({ 
  roomId: 0,  
  roomStateId: 0,
  roomTypeId: 0,
  description: ""
});
const cloneFormData = ref<Room>({ 
  roomId: 0,  
  roomStateId: 0,
  roomTypeId: 0,
  description: ""
});
const drawer = ref(false);
const showDrawer = ref(false)
const operate = ref<String>("")
// 房间类型列表
const roomTypeList = ref([])
// 房间状态列表
const roomStateList = ref([])
const maxRoomId = ref<Number>(0)

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const editorConfig = { placeholder: '请输入内容...' }
const handleCreated = (editor:any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}
const hasExistsRoom = async(rule: any, value: any, callback: any) => {
  if (value !== '' && formData.value.id!=value) {
    const {success, data} = await $getOne({roomId: value});
    if(success && data!=null) {
      callback(new Error('该房间已经存在,请重新修改房间号'))
    }
  } else {
    callback()
  }
}
// 验证
const rules = reactive<FormRules<typeof formData>>({
  roomId: [{required: true, message:'请输入房间号'},{validator: hasExistsRoom, trigger: 'blur'}],
  roomTypeId: [{required: true, message:'请选择房间类型'}],
  roomStateId: [{required: true, message:'请选择房间状态'}]
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let res = {};
      if(formData.value.id) {
        res = await $upd(formData.value);
      } else {
        res = await $add(formData.value);
        // 清空表单
        resetForm(formRef.value)
      }
            
      if(res.success) {
        getMaxRoomId()
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
  if(formData.value.id) {
    formData.value = lodash.cloneDeep(cloneFormData.value)
    return;
  }
  formData.value = {
    roomId: maxRoomId.value + 1,  
    roomStateId: 0,
    roomTypeId: 0,
    description: ""
  }
}

const closeDrawer = () => {
	drawer.value = false
	resetForm(formRef.value)
}

const loadRoomTypeList = async() => {
	const {success, data} = await $allRoomTypeList()
	if(success) {
		roomTypeList.value = data;
    roomTypeList.value.unshift({roomTypeId: 0, roomTypeName: '请选择房间类型'})
	}
}

const loadRoomStateList = async() => {
	const {success, data} = await $roomStateList()
	if(success) {
		roomStateList.value = data;
    roomStateList.value.unshift({roomStateId: 0, roomStateName:'请选择房间状态'})
	}
}

const getMaxRoomId = async() => {
  const {success, msg, data} = await $maxRoomId();
  if(success) {
    maxRoomId.value = data;
    if(operate.value=='add') {
      formData.value.roomId = data + 1;
    }
  } else {
    console.log(msg)
  }
}

watch(drawer,(newValue)=>{
  if(newValue) {
    showDrawer.value = true;
    if(formData.value.id) {
      cloneFormData.value = lodash.cloneDeep(formData.value)
    }
  } else {
    setTimeout(()=>{
      showDrawer.value = false;
    },500)
  }
},{immediate: true})
watch(operate,(newValue)=>{
  if(newValue=='add') {
    getMaxRoomId()
    formData.value = { 
      roomId: maxRoomId.value + 1,  
      roomStateId: 0,
      roomTypeId: 0,
      description: ""
    }
  }
})
onMounted(()=>{
  loadRoomTypeList()
  loadRoomStateList()
  getMaxRoomId()
})
// 暴漏成员
defineExpose({
  drawer,
  formData,
  operate
});
</script>

<style lang="scss" scoped>
</style>