<template>
	<div class="home">
		Home
	</div>
</template>

<script setup lang="ts">
import {ref,onMounted} from 'vue'
import * as echarts from 'echarts';
import {$totalTypePrice} from '../api/roomType.ts';
// 房型销售信息
const totalTypePrice = ref([]);
const loadTotalTypePrice = async() => {
	const {success, data} = await $totalTypePrice();
	if(success) {
		totalTypePrice.value = data;
		showCharts();
	}
}
const showCharts = () => {
	// 基于准备好的dom，初始化echarts实例
	var myChart = echarts.init(document.querySelector('.home'));
	// 绘制图表
	myChart.setOption({
		title: {
			text: '房型销售额信息'
		},
		tooltip: {},
		xAxis: {
			data: totalTypePrice.value.map(r=>r.roomTypeName)
		},
		yAxis: {},
		series: [
			{
				name: '销量',
				type: 'bar',
				data: totalTypePrice.value.map(r=>r.totalMoney)
			}
		]
	});
}
onMounted(()=>{
	loadTotalTypePrice();
	
}) 
</script>

<style lang="scss" scoped>
.home {
	width: 98%;
	height: calc(100vh - 80px);
}
</style>