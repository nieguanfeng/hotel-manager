<template>
  <el-drawer
    v-model="drawer" size="30%" 
    :title="formData.id?'修改用户':'添加用户'" 
    direction="rtl" 
    :before-close="closeDrawer"
  >
    <el-form ref="formRef" style="max-width: 600px" :model="formData" status-icon :rules="rules" size="small"
      label-width="70px">
      <el-form-item label="账号" prop="username">
        <el-input v-model="formData.username" autocomplete="off" />
      </el-form-item>
      <el-form-item v-if="!formData.id" label="密码" prop="password">
        <el-input type="password" v-model="formData.password" autocomplete="off" />
      </el-form-item>
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" autocomplete="off" />
      </el-form-item>
      <el-form-item label="头像" prop="userPic">
        <el-upload
          class="avatar-uploader"
          action="http://127.0.0.1:9000/user/upload"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :on-success="uploadSuccess"
        >
          <img v-if="formData.userPic" :src="formData.userPic" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="角色" prop="roleId">
        <el-select
          v-model="formData.roleId"
          placeholder="请选择角色"
          size="small"
          style="width: 240px"
        >
          <el-option
            v-for="item in roleList"
            :key="item.roleId"
            :label="item.roleName"
            :value="item.roleId"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="电话" prop="phone">
        <el-input v-model="formData.phone" autocomplete="off" />
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
import {ref, reactive, onMounted, watch, nextTick} from 'vue'
// 导入element-plus类型
import type { FormInstance,FormRules } from 'element-plus'
import {$add, $upd} from "../../api/admin.ts"
import {$list } from "../../api/role.ts"
import { ElNotification } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import type { UploadProps } from 'element-plus'
import lodash from 'lodash'
interface User{
  id?: Number
  username: String
  password: String
  name: String
  phone: String
  userPic: String
  roleId: Number | String
}

const emit = defineEmits(['sync-list', 'edit'])
// 定义一个表单
const formRef = ref<FormInstance>()

const formData = ref<User>({ 
  username: "",
  password: "",
  name: "",
  phone: "",
  userPic: "",
  roleId: ""
});
const cloneFormData = ref<User>({ 
  username: "",
  password: "",
  name: "",
  phone: "",
  userPic: "",
  roleId: ""
});
const drawer = ref(false);
const showDrawer = ref(false)
// 角色列表
const roleList = ref([])

// 验证
const rules = reactive<FormRules<typeof formData>>({
  username: [{required: true, message:'请输入用户名称'}],
  password: [{required: true, message:'请输入密码'},{min: 6, message: '密码不能少于6位'}],
  name: [{required: true, message:'请输入姓名'}],
  phone: [{required: true, message:'请输入电话'}],
  roleId: [{required: true, message:'请选择角色', trigger: 'change'}]
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let res = {};
      if(formData.value.id) {
        res = await $upd({
          id: formData.value.id,
          username: formData.value.username,
          userPic: formData.value.userPic,
          roleId: formData.value.roleId,
          phone: formData.value.phone
        });
      } else {
        res = await $add(formData.value);
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
  if(formData.value.id) {
    formData.value = lodash.cloneDeep(cloneFormData.value)
    return;
  }
  formData.value = {
    username: "",
    password: "",
    name: "",
    phone: "",
    userPic: "",
    roleId: ""
  }
}

const closeDrawer = () => {
	drawer.value = false
	resetForm(formRef.value)
}

const loadRoleList = async() => {
	const {success, data} = await $list()
	if(success) {
		roleList.value = data;
	}
}
const beforeUpload: UploadProps['beforeUpload'] = (rawFile) => {
  const imgTypes = ["image/jpeg","image/gif","image/png"]
  if (!imgTypes.includes(rawFile.type)) { 
    ElNotification({
      title: "通知",
      message: "请上传jpg,gif,png格式的图片",
      type: "error"
    })   
    return false
  } else if (rawFile.size / 1024 / 1024 > 1) {
    ElNotification({
      title: "通知",
      message: "图片大小不能超过1MB",
      type: "error"
    })     
    return false
  }
  return true
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
onMounted(()=>{
  loadRoleList()
})

const uploadSuccess:UploadProps['onSuccess'] = (
  response,
  uploadFile
) =>{
  const {data, success, msg} = response;
  if(success) {
    ElNotification({
      title: "通知",
      message: "头像上传成功",
      type: "success"
    })
    // 获取头像地址
    formData.value.userPic = 'http://127.0.0.1:9000' + data.url;
  } else {
    ElNotification({
      title: "通知",
      message: "头像上传失败",
      type: "error"
    })
  }
}
// 暴漏成员
defineExpose({
  drawer,
  formData
});
</script>

<style lang="scss" scoped>
.avatar-uploader .avatar {
  width: 178px;
  height: 178px;
  display: block;
}
.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}
</style>