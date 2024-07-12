import {defineStore} from 'pinia'
// import Cookies from 'js-cookie'//使用cookies存储的使用要下载依赖

// const cookiesStorage: Storage = {
//   setItem (key, state) {
//     return Cookies.set('accessToken', state.accessToken, { expires: 3 })
//   },
//   getItem (key) {
//     return JSON.stringify({
//       accessToken: Cookies.getJSON('accessToken'),
//     })
//   },
// }
export default defineStore('user',{
  persist: {
    enabled: true,
    strategies: [
      { storage: sessionStorage, paths: ['user'] },
      { storage: localStorage, paths: ['user'] }
    ],
  },
  state: ()=> {
    return {
      user: {
        
      }
    }
  },
  getters: {
    getUser() {
      return this.user;
    }
  },
  actions: {
    setUser(user:Object){
      this.user = user
    },
    clearUser() {
      localStorage.clear();
      sessionStorage.clear();
      this.user = {
        
      }
    }
  }
},{
  // 对模块数据进行持久化存储
  persist: true
})