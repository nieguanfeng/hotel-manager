<template>
  <div class="login">
    <div class="box">
      <h2>酒店信息管理平台</h2>
      <el-form 
        ref="formRef" 
        style="max-width: 600px" 
        :model="formData" 
        status-icon 
        :rules="rules"
        size="small"
        label-width="40px"      
      >
        <el-form-item label="账号" prop="loginName">
          <el-input v-model="formData.loginName" />
        </el-form-item>
        <el-form-item label="密码" prop="loginPwd">
          <el-input v-model="formData.loginPwd" type="password" autocomplete="off" />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="submitForm(formRef)">
            登录
          </el-button>
          <el-button @click="resetForm(formRef)">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
// 导入组合式api
import { reactive, ref } from 'vue'
// 导入路由器
import {useRouter} from 'vue-router'
// 导入element-plus类型
import type { FormInstance, FormRules } from 'element-plus'
import {$login, $getOne} from '../api/admin'
import useStore from "../store/user.ts"

const router = useRouter();

// 定义一个表单
const formRef = ref<FormInstance>()

const formData = reactive({
  loginName: "",
  loginPwd: ""
});

let userStore = useStore();
// 验证账号
const validateloginName = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入账号'))
  } else {
    callback()
  }
}

// 验证密码
const validateLoginPwd = (rule: any, value: any, callback: any) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else {
    callback()
  }
}

// 登录验证
const rules = reactive<FormRules<typeof formData>>({
  loginName: [{ validator: validateloginName, trigger: 'blur' }],
  loginPwd: [{ validator: validateLoginPwd, trigger: 'blur' }],
})

// 提交表单
const submitForm = (formEl: FormInstance | undefined) =>  {
  if (!formEl) return
  formEl.validate(async (valid) => {
    if (valid) {
      const res = await $login({
        username: formData.loginName,
        password: formData.loginPwd
      });
      if(res) {
        let {success,data} = await $getOne({username: formData.loginName})
        if(success) {
          userStore.setUser({
            ...data
          });
          // 将用户信息存储到浏览器缓存
          // sessionStorage.setItem("user", JSON.stringify(data))
          router.push("/index")
        }
      }
    } else {
      return false;
    }
  })
}

// 重置表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}
</script>

<style lang="scss" scoped>
.login {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(to bottom, #142334, #6894C7);
  display: flex;
  justify-content: center;
  align-items: center;

  .box {
    width: 400px;
    height: 200px;
    border: 1px solid #fff;
    padding: 20px;
    h2 {
      color: #fff;
      font-size: 20px;
      text-align: center;
      margin-bottom: 20px;
    }
    ::v-deep .el-form-item__label {
      color: #fff;
    }
  }
}
</style>