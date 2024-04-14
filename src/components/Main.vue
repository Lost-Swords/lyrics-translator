<template>
  <n-space vertical size="large">
    <n-layout position="absolute">
      <n-layout-header>
        <n-space justify="center" :align="'center'" :size="50">
          <n-button size="large" @click="showPasteModal = true">粘贴文本</n-button>
          <n-upload
            ref="upload"
            :default-upload="false"
            accept=".txt"
            @change="textUpload"
            :show-file-list="false"
            v-model:file-list="fileList"
          >
            <n-button size="large">导入文本</n-button>
          </n-upload>
          <n-button @click="handleTextExport" size="large">导出文本</n-button>
          <n-button @click="openLyricsEditor" size="large">歌词制作器</n-button>
          <n-switch size="large" v-model:value="isTranslate">
            <template #checked> 翻译 </template>
            <template #unchecked> 歌词 </template>
          </n-switch>
        </n-space>
      </n-layout-header>
      <n-layout-content style="padding-top: 5%; width: 70%; margin: auto">
        <n-dynamic-input
          v-if="!isTranslate"
          @keyup="lyricListAdd"
          v-model:value="lyricList"
          placeholder="请输入歌词"
          :min="1"
        />
        <n-dynamic-input v-else v-model:value="lyricList" :min="1">
          <template #default="{ index, value }">
            <div style="display: flex; align-items: center; flex-direction: column; width: 100%">
              <p v-if="lyricList[index]" style="width: 100%">
                {{ lyricList[index] }}
              </p>
              <p v-else style="width: 100%; color: #f70808">该行无文本</p>
              <br>
              <n-input
                v-model:value="translateList[index]"
                @keyup="focusNextInput"
                placeholder="请输入翻译"
                type="text"
              />
            </div>
          </template>
        </n-dynamic-input>
      </n-layout-content>
    </n-layout>
  </n-space>
  <n-modal
    v-model:show="showPasteModal"
    preset="dialog"
    title="粘贴歌词文本"
    positive-text="确认"
    negative-text="取消"
    @positive-click="pasteSubmit"
  >
  <n-input
      v-model:value="inputLyrics"
      type="textarea"
      placeholder="请在这里粘贴歌词"
      style="height: 200px;"
    />
  </n-modal>
</template>
<script setup lang="ts">
import { textDownload, findRootNodeWithElement } from '../utils/utils'
import { useMessage, useDialog } from 'naive-ui'
const lyricList = ref(['']);
const translateList = ref(['']);
const isTranslate = ref(false);
const fileList = ref([]);
const dialog = useDialog();
const message = useMessage();
const showPasteModal = ref(false);//歌词粘贴框
const inputLyrics = ref('');

//递增歌词数组，并聚焦到下一个
async function lyricListAdd(value: { ctrlKey: any; code: string; target: HTMLElement; srcElement: HTMLInputElement; }) {
  if (!value.ctrlKey || value.code !== 'Enter') {
    return;
  }
  if (
    findRootNodeWithElement(value.target, 'data-key') ===
    (lyricList.value.length - 1).toString()
  ) {
    lyricList.value.push('');
    await nextTick();
  }
  let inputs = document.getElementsByTagName('input');
  for (var i = 0; i < inputs.length; i++) {
    if (value.srcElement == inputs[i]) {
      inputs[i + 1].focus();
      break;
    }
  }
}

// 导入歌词
function lyricsInput(text: string ) {
  let stringList = text?.split('\n').map((i: string) => i.replace(/[\n\r]+/g, '')).filter((i: string) => i !== '');
  lyricList.value = stringList;
}

//上传文本
function textUpload(options: { file: { file: any; }; }) {
  let selectedFile = options.file.file;
  if (selectedFile) {
    let reader = new FileReader();

    reader.onload = function (e:any ) {
      let fileContent = e.target.result ;// 文件内容
      lyricsInput(fileContent);
      fileList.value = [];
    }
    reader.readAsText(selectedFile);
  }
}

//粘贴歌词
function pasteSubmit() {
  lyricsInput(inputLyrics.value);
  inputLyrics.value="";
}

//回车触发焦点转移到下一个输出框
function focusNextInput(value: { code: string; srcElement: HTMLInputElement; }) {
  if (value.code !== 'Enter') {
    return
  }
  let inputs = document.getElementsByTagName('input')
  for (var i = 0; i < inputs.length; i++) {
    if (value.srcElement == inputs[i]) {
      inputs[i + 1].focus();
      break;
    }
  }
}

//导出歌词文本
function handleTextExport() {
  if (lyricList.value.length <= 0) {
    message.warning("没有可以导出的文本")
    return;
  }
  //检测是否存在空白行
  if (lyricList.value.some((r) => !r) || translateList.value.some((i) => !i)) {
    dialog.warning({
      title: '警告',
      content: '有空白行，确定导出？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        textExport();
      },
    })
    return
  }
  textExport();
}

//处理歌词导出文本
function textExport() {
  let text = lyricList.value.reduce((text, current, index) => {
    let lyric = current ? current : ''
    let translate = translateList.value[index] ? translateList.value[index] : ''
    return text + '\n' + lyric + '\n' + translate + '\n'
  }, '歌词翻译\n')
  textDownload('lyricTranslator', text);
}

// 打开歌词制作器
function openLyricsEditor() {
  window.open("https://judes.me/lrc_editor/",'_blank')
}
watch(
  () => lyricList.value,
  (value, prevCount) => {
    /* ... */
  }
)
</script>
<style scoped>
h1 {
  font-weight: 500;
  font-size: 2.6rem;
  position: relative;
  top: -10px;
}

h3 {
  font-size: 1.2rem;
}

.greetings h1,
.greetings h3 {
  text-align: center;
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
