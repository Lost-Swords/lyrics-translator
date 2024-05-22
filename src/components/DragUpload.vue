<template>
	<div class="cover fullScreenUpload flex"
	v-if="showDrag"
	@dragleave="() => { showDrag = false }"
	@drop="dropFile"
	@dragover="(e) => { e.preventDefault() }">

	</div>
</template>

<script setup lang="ts">
import { ref,onMounted,onBeforeUnmount } from "vue"
const emits = defineEmits(['dropFile'])
let showDrag = ref(false)
const dropFile = (e: any) => {
	e.preventDefault();
	showDrag.value = false;
	emits('dropFile',e.dataTransfer.files[0],e)
}
onMounted(()=>{
	document.ondragenter = () => {
			showDrag.value = true;
	}
})
onBeforeUnmount(()=>{
	document.ondragenter = null;
})
</script>
<style scoped >
.flex {
	display: flex;
	align-items: center;
	justify-content: center;
}
.cover {
	position: absolute;
	left: 0;
	top: 0;
	bottom: 0;
	right: 0;
}
.fullScreenUpload {
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 10;
}
.dragUploadText {
		background-color: rgba(255, 255, 255, 0.9);
		border-radius: 20px;
		padding: 14px 20px;
		pointer-events: none;
		font-weight: 700;
		font-size: 40px;
		color: #6B57FF;
}
</style>
