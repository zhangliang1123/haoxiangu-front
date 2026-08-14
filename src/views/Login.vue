<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2>好香哟 - 家庭点餐</h2>
      </template>
      <el-form :model="loginForm" label-width="100px">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="登录" name="login">
            <el-form-item label="手机号">
              <el-input v-model="loginForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" show-password />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" style="width: 100%" :loading="authStore.loading" @click="handleLogin">
                登录
              </el-button>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="注册" name="register">
            <el-form-item label="手机号">
              <el-input v-model="registerForm.phone" placeholder="请输入手机号" />
            </el-form-item>
            <el-form-item label="密码">
              <el-input v-model="registerForm.password" type="password" placeholder="请输入密码（至少6位）" show-password />
            </el-form-item>
            <el-form-item label="确认密码">
              <el-input v-model="registerForm.confirmPassword" type="password" placeholder="请再次输入密码" show-password />
            </el-form-item>
            <el-divider content-position="left">家庭设置（可选）</el-divider>
            <el-form-item label="家庭操作">
              <el-radio-group v-model="registerForm.familyAction">
                <el-radio value="none">暂不设置</el-radio>
                <el-radio value="create">创建家庭</el-radio>
                <el-radio value="join">加入家庭</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item v-if="registerForm.familyAction === 'create'" label="家庭名称">
              <el-input v-model="registerForm.familyName" placeholder="请输入家庭名称" />
            </el-form-item>
            <el-form-item v-if="registerForm.familyAction === 'join'" label="家庭ID">
              <el-input v-model="registerForm.familyId" placeholder="请输入家庭ID" />
            </el-form-item>
            <el-form-item>
              <el-button type="success" style="width: 100%" :loading="authStore.loading" @click="handleRegister">
                注册
              </el-button>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useFamilyStore } from '@/stores/family'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const familyStore = useFamilyStore()

const activeTab = ref('login')

const loginForm = ref({
  phone: '',
  password: ''
})

const registerForm = ref({
  phone: '',
  password: '',
  confirmPassword: '',
  familyAction: 'none' as 'none' | 'create' | 'join',
  familyName: '',
  familyId: ''
})

const handleLogin = async () => {
  if (!loginForm.value.phone || !loginForm.value.password) {
    ElMessage.warning('请填写完整信息')
    return
  }

  try {
    const res = await authStore.login(loginForm.value)
    if (res.user.familyId) {
      await familyStore.loadFamily(res.user.familyId)
    }
    ElMessage.success('登录成功')
    router.push('/recipes')
  } catch {
    // 错误信息已由请求拦截器统一提示
  }
}

const handleRegister = async () => {
  if (!registerForm.value.phone || !registerForm.value.password || !registerForm.value.confirmPassword) {
    ElMessage.warning('请填写完整信息')
    return
  }
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('两次密码输入不一致')
    return
  }
  if (registerForm.value.familyAction === 'create' && !registerForm.value.familyName) {
    ElMessage.warning('请输入家庭名称')
    return
  }
  if (registerForm.value.familyAction === 'join' && !registerForm.value.familyId) {
    ElMessage.warning('请输入家庭ID')
    return
  }

  try {
    const res = await authStore.register({
      phone: registerForm.value.phone,
      password: registerForm.value.password,
      familyAction: registerForm.value.familyAction === 'none' ? undefined : registerForm.value.familyAction,
      familyName: registerForm.value.familyName || undefined,
      familyId: registerForm.value.familyId || undefined
    })

    if (res.user.familyId) {
      await familyStore.loadFamily(res.user.familyId)
    }

    if (res.familyId) {
      ElMessage.success(`注册成功！您的家庭ID是：${res.familyId}`)
    } else {
      ElMessage.success('注册成功！')
    }

    activeTab.value = 'login'
    loginForm.value.phone = registerForm.value.phone
    loginForm.value.password = ''
  } catch {
    // 错误信息已由请求拦截器统一提示
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 500px;
}

.login-card h2 {
  margin: 0;
  text-align: center;
  color: #333;
}
</style>
