<template>
  <el-drawer 
    v-if="showDrawer"
    v-model="drawer" size="30%" 
    :title="formData.roleId?'修改角色':'添加角色'" 
    direction="rtl" 
    :before-close="closeDrawer"
  >
    <el-form ref="formRef" style="max-width: 600px" :model="formData" status-icon :rules="rules" size="small"
      label-width="70px">
      <el-form-item label="角色名称" prop="roleName">
        <el-input v-model="formData.roleName" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">
          {{formData.roleId ?'修改角色':'添加角色'}}
        </el-button>
        <el-button @click="resetForm(formRef)">取消</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<script setup lang="ts">
import {ref, reactive, watch} from 'vue'
// 导入element-plus类型
import type { FormInstance,FormRules } from 'element-plus'
import {$add, $upd} from "../../api/role.ts"
import { ElNotification } from 'element-plus'
const emit = defineEmits(['sync-list'])
// 定义一个表单
const formRef = ref<FormInstance>()

const formData = ref({
  roleName: ""
});
const drawer = ref(false);
const showDrawer = ref(false)

// 角色名称
const validateRoleName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入角色名称'))
  } else {
    callback()
  }
}

// 登录验证
const rules = reactive<FormRules<typeof formData>>({
  roleName: [{ validator: validateRoleName, trigger: 'blur' }],
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      let res = {};
      if(formData.value.roleId) {
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
  if(formData.value.roleId) {
    drawer.value = false;
  }
  formData.value = {
    roleName: ''
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