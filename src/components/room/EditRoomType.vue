<template>
  <el-drawer 
    v-if="showDrawer"
    v-model="drawer" size="30%" 
    :title="formData.roomTypeId?'修改房型':'添加房型'" 
    direction="rtl" 
    :before-close="closeDrawer"
  >
    <el-form ref="formRef" style="max-width: 600px" :model="formData" status-icon :rules="rules" size="small"
      label-width="100px">
      <el-form-item label="房型名称" prop="roomTypeName">
        <el-input v-model="formData.roomTypeName" autocomplete="off" />
      </el-form-item>
      <el-form-item label="房型单价" prop="roomTypePrice">
        <el-input v-model.number="formData.roomTypePrice" autocomplete="off" />
      </el-form-item>
      <el-form-item label="床位数量" prop="bedNum">
        <el-input v-model.number="formData.bedNum" autocomplete="off" />
      </el-form-item>
      <el-form-item label="房型描述" prop="typeDescription">
        <!-- <el-input v-model="formData.typeDescription" autocomplete="off" /> -->
        <div style="border: 1px solid #ccc">
          <Toolbar
            style="border-bottom: 1px solid #ccc"
            :editor="editorRef"
            mode="default"
          />
          <Editor
            style="height: 300px; width: 100%;"
            v-model="formData.typeDescription"
            :defaultConfig="editorConfig"
            mode="default"
            @onCreated="handleCreated"
          />
        </div>        
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">
          {{formData.roomTypeId ?'修改房型':'添加房型'}}
        </el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, reactive, shallowRef, watch} from 'vue'
// 导入element-plus类型
import type { FormInstance,FormRules } from 'element-plus'
import {$add, $upd} from "../../api/roomType.ts"
import { ElNotification } from 'element-plus'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import '@wangeditor/editor/dist/css/style.css' // 引入 css


interface RoomType {
  roomTypeId?: Number
  bedNum: Number
  roomTypeName: String
  roomTypePrice: Number
  typeDescription: String
}

const emit = defineEmits(['sync-list'])
// 定义一个表单
const formRef = ref<FormInstance>()

const formData = ref<RoomType>({
  bedNum: 0,
  roomTypeName: "",
  roomTypePrice: 0,
  typeDescription: ""
});
const drawer = ref(false);
const showDrawer = ref(false)

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()
const editorConfig = { placeholder: '请输入内容...' }
const handleCreated = (editor:any) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}


const validateRoomTypePrice = (rule: any, value: any, callback: any) => {
  if (value !== '' && Number(value)<1) {
    callback(new Error('房型单价必须是大于0的整数'))
  } else {
    callback()
  }
}
const validateBedNum = (rule: any, value: any, callback: any) => {
  if (value !== '' && Number(value)<1) {
    callback(new Error('床位数是一个大于等于1的整数'))
  } else {
    callback()
  }
}
// 房型名称验证
const rules = reactive<FormRules<typeof formData>>({
  roomTypeName: [{required: true, message: '请输入房型', trigger: 'blur'}],
  roomTypePrice: [{required: true, message: '请输入房型价格'},{ validator: validateRoomTypePrice, trigger: 'blur'}],
  bedNum: [{required: true, message: '请输入床位数量'},{ validator: validateBedNum, trigger: 'blur' }]
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let res = {};
      if(formData.value.roomTypeId) {
        res  = await $upd(formData.value);        
      } else {
        res = await $add(formData.value);        
      }
      if(res.success) {
        ElNotification({
          title: "通知",
          message: res.msg,
          type: "success"
        })
        // 通知父组件，加载列表
        emit('sync-list')
        // 清空表单
        resetForm(formRef.value)
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
  if(formData.value.roomTypeId) {
    drawer.value = false;
  }
  formData.value = {
    bedNum: 0,
    roomTypeName: "",
    roomTypePrice: 0,
    typeDescription: ""
  }
}

const closeDrawer = () => {
	drawer.value = false
	resetForm(formRef.value)
}

watch(drawer, (newValue)=>{
  if(newValue) {
    showDrawer.value = true
  } else {
    setTimeout(()=>{
      showDrawer.value = false
    },500)
  }
})

// 暴漏成员
defineExpose({
  drawer,
  formData
});
</script>

<style lang="scss" scoped></style>