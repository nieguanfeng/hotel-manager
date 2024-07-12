<template>
	<div class="setpwd">
		<el-form ref="formRef" :model="formData" status-icon :rules="rules" size="small"
      label-width="100px">
			<el-form-item label="旧密码" prop="oldPwd">
        <el-input type="password" v-model="formData.oldPwd" autocomplete="off" />
      </el-form-item>
      <el-form-item label="新密码" prop="newPwd">
        <el-input type="password" v-model="formData.newPwd" autocomplete="off" />
      </el-form-item>
			<el-form-item label="确认密码" prop="confirmPwd">
        <el-input type="password" v-model="formData.confirmPwd" autocomplete="off" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)">
          修改密码
        </el-button>
      </el-form-item>
    </el-form>
	</div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue'
import {$resetPwd} from "../../api/admin.ts"
import { ElNotification } from 'element-plus'
import useStore from "../../store/user.ts"
import type { FormInstance,FormRules } from 'element-plus'

const userStore = useStore();
// 定义一个表单
const formRef = ref<FormInstance>()
const formData = ref({ 
	id: userStore.user.id,
  oldPwd: "",
	newPwd: "",
	confirmPwd: ""
});


const checkConfirmPwd = (rule: any, value: any, callback: any) => {
  if (value !== formData.value.newPwd) {
    callback(new Error("新密码与确认密码不一致"))
  } else {
    callback()
  }
}
// 验证
const rules = reactive<FormRules<typeof formData>>({
	oldPwd: [
	  {required: true, message: "请输入旧密码"},
		{min: 6, message: "旧密码不能少于6位"}
	],
  newPwd: [		
		{required: true, message: "请输入新密码"},
		{min: 6, message: "新密码不能少于6位"}
	],
	confirmPwd: [	
		{required: true, message: "请输入确认密码"},
		{min: 6, message: "确认密码不能少于6位"},  
		{
			validator: checkConfirmPwd,
			trigger: 'change'
		}
	]
})
// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
	if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
			const {success, msg} = await $resetPwd(formData.value)
			if(success) {
				ElNotification({
          title: "通知",
          message: msg,
          type: "success"
        })
			} else {
				ElNotification({
          title: "通知",
          message: msg,
          type: "error"
        })
			}
		} else {
			return false;
		}
	})
}

</script>

<style lang="scss" scoped>
.setpwd {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100vw;
	height: 100vh;
	.el-form {
		width: 300px;
	}
}
</style>