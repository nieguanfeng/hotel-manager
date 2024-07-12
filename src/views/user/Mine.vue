<template>
	<div class="mine">
		<div class="left">
			<el-image v-if="loginUser.avatar!=''" :src="loginUser.avatar" fit="cover" />
			<el-image v-else :src="emptyPicUrl" fit="cover" />
		</div>
		<div class="right">
			<p>账号:{{ loginUser.loginId }}</p>
			<p>姓名:{{ loginUser.userName }}</p>
			<p>角色:{{ loginUser.roleName }}</p>
			<p>电话:{{ loginUser.phone }}</p>
		</div>
	</div>
</template>

<script setup lang="ts">
	import {computed} from "vue"
	import useUser from "../../store/user.ts"

	let userStore = useUser();
	const loginUser = computed(()=>{
		const user = userStore.user;
		return {
			loginId: user.username,
			userName: user.name,
			roleName: user.role.roleName,
			avatar: user.userPic,
			phone: user.phone
		}
	})
	const emptyPicUrl = "images/female.png"
</script>

<style lang="scss" scoped>
.mine {
	display: flex;
	.left {
		width: 200px;
		height: 200px;
		img {
			width: 100%;
		}
	}
	.right {
		margin-left: 10px;
		p{
			margin: 10px 0;
			font-size: 20px;
			&:last-child {
				margin-bottom: 0;
			}
		}
	}
}
</style>