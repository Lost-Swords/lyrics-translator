<template>
  <n-space vertical size="large" @click="handleMouseClick">
    <n-layout position="absolute">
      <n-layout-header>
        <n-space justify="center" :align="'center'" :size="50">
          <n-button size="large" @click="showPasteModal = true">{{ $t('button.importText') }}</n-button>
          <n-button @click="handleExportText" size="large">{{ $t('button.exportText') }}</n-button>
          <n-button @click="openLyricsEditor" size="large">{{ $t('button.lyricsEditor') }}</n-button>
          <n-switch size="large" v-model:value="isTranslate">
            <template #checked>{{ $t('change.translate') }}</template>
            <template #unchecked>{{ $t('change.lyrics') }}</template>
          </n-switch>
          <n-select class="select" v-model:value="translateApiName" :placeholder="$t('placeholder.wordTranslate')"
            :options="translateApiList" />
          <n-select class="select" v-model:value="$i18n.locale"   :options="$i18n.availableLocales.map(i => ({'label':i,'value':i }))" />
        </n-space>
      </n-layout-header>
      <n-layout-content class="content">
        <n-dynamic-input v-if="!isTranslate" @keyup="addLyricList" @select="handleTextSelected"
          v-model:value="lyricList" :placeholder="$t('placeholder.inputLyrics')" :min="1" />
        <n-dynamic-input v-else v-model:value="lyricList" :min="1">
          <template #default="{ index, value }">
            <div class="dynamic-input">
              <p v-if="lyricList[index]">
                {{ lyricList[index] }}
              </p>
              <p v-else class="empty-row">{{ $t('text.noText') }}</p>
              <br />
              <n-input v-model:value="translateList[index]" @keyup="focusNextInput"
                :placeholder="$t('placeholder.inputTranslate')" type="text" />
            </div>
          </template>
        </n-dynamic-input>
      </n-layout-content>
    </n-layout>
  </n-space>


  <n-modal v-model:show="showPasteModal" preset="dialog" :title="$t('modal.pasteLyrics')"
    :positive-text="$t('modal.ok')" :negative-text="$t('modal.cancel')" @positive-click="submitPaste">
    <n-input class="lyric-input" v-model:value="inputLyrics" type="textarea" :placeholder="$t('modal.placeholder')"
      style="height: 200px" />
    <drag-upload @drop-file="handleDragUpload"></drag-upload>
  </n-modal>
  <n-popover :show="showPopover" :x="x" :y="y" trigger="manual" v-text="translateResult" />
</template>
<script setup lang="ts">
import { textDownload, findTagInElement } from '../utils/utils'
import translateApis from '../utils/translate-util'
import dragUpload from './DragUpload.vue'
import { useMessage, useDialog } from 'naive-ui'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()
const lyricList = ref([''])
const translateList = ref([''])
const isTranslate = ref(false)
const fileList = ref([])
const dialog = useDialog()
const message = useMessage()
const showPasteModal = ref(false) //歌词粘贴框
const inputLyrics = ref('')
const x = ref(0)
const y = ref(0)
const showPopover = ref(false)
const translateResult = ref('')
const translateApiName = ref(null)
const translateApiList: Ref<Array<Object>> = ref([{ label: t("placeholder.closeTranslate"), value: null }])
let handleLock = false


//遍历添加翻译api
Object.entries(translateApis).forEach(([k, v]) => {
  translateApiList.value.push({
    label: v.name,
    value: v.name
  })
});

//递增歌词数组，并聚焦到下一个
async function addLyricList(value: {
  ctrlKey: any
  code: string
  target: HTMLElement
  srcElement: HTMLInputElement
}) {
  if (!value.ctrlKey || value.code !== 'Enter') {
    return
  }
  if (
    findTagInElement(value.target, 'data-key') ===
    (lyricList.value.length - 1).toString()
  ) {
    lyricList.value.push('')
    await nextTick()
  }
  let inputs = document.getElementsByTagName('input')
  for (var i = 0; i < inputs.length; i++) {
    if (value.srcElement == inputs[i]) {
      inputs[i + 1].focus()
      break
    }
  }
}

//拖拽歌词文本
function handleDragUpload(e: File) {
  let options = { file: { file: e } }
  uploadText(options)
  inputLyrics.value = ''
  showPasteModal.value = false
}

// 导入歌词
function inputlyrics(text: string) {
  let stringList = text
    ?.split('\n')
    .map((i: string) => i.replace(/[\n\r]+/g, ''))
    .filter((i: string) => i !== '')
  lyricList.value = stringList
}

//上传文本
function uploadText(options: { file: { file: any } }) {
  let selectedFile = options.file.file
  if (selectedFile) {
    let reader = new FileReader()

    reader.onload = function (e: any) {
      let fileContent = e.target.result // 文件内容
      inputlyrics(fileContent)
      fileList.value = []
    }
    reader.readAsText(selectedFile)
  }
}

//粘贴歌词
function submitPaste() {
  inputlyrics(inputLyrics.value)
  inputLyrics.value = ''
}

//回车触发焦点转移到下一个输出框
function focusNextInput(value: { code: string; srcElement: HTMLInputElement }) {
  if (value.code !== 'Enter') {
    return
  }
  let inputs = document.getElementsByTagName('input')
  for (var i = 0; i < inputs.length; i++) {
    if (value.srcElement == inputs[i]) {
      inputs[i + 1].focus()
      break
    }
  }
}

//导出歌词文本
function handleExportText() {
  if (lyricList.value.length <= 0) {
    message.warning('没有可以导出的文本')
    return
  }
  //检测是否存在空白行
  if (lyricList.value.some((r) => !r) || translateList.value.some((i) => !i)) {
    dialog.warning({
      title: '警告',
      content: '有空白行，确定导出？',
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
        exportText()
      },
    })
    return
  }
  exportText()
}

//处理歌词导出文本
function exportText() {
  let text = lyricList.value.reduce((text, current, index) => {
    let lyric = current ? current : ''
    let translate = translateList.value[index] ? translateList.value[index] : ''
    return text + '\n' + lyric + '\n' + translate + '\n'
  }, '歌词翻译\n')
  textDownload('lyricTranslator', text)
}

// 打开歌词制作器
function openLyricsEditor() {
  window.open('https://judes.me/lrc_editor/', '_blank')
}

function handleMouseClick(e: MouseEvent) {
  if (!translateApiName.value || showPopover.value) {
    showPopover.value = false
    handleLock = true
    setTimeout(() => handleLock = false, 500)
  }
}

async function handleTextSelected(e: Event) {
  //防止多次触发
  if (!translateApiName.value || showPopover.value || handleLock) {
    return
  }
  handleLock = true
  let element = e.target as HTMLInputElement
  x.value = element.getBoundingClientRect().left
  y.value = element.getBoundingClientRect().top
  showPopover.value = true
  translateResult.value = "正在翻译……"
  let translateApi = translateApis.find(i => i.name === translateApiName.value) ?? translateApis[0];
  translateResult.value = await translateApi.translate(
    element.value.substring(
      element.selectionStart as number,
      element.selectionEnd as number
    )
  )
  handleLock = false
}
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

.content {
  padding-top: 5%;
  width: 70%;
  margin: auto
}

.select {
  width: 150px;
}

.dynamic-input {
  display: flex;
  align-items: center;
  flex-direction: column;
  width: 100%;
}

.dynamic-input p {
  width: 100%;
}

.empty-row {
  color: #f70808
}

.lyric-input {
  height: 200px
}

@media (min-width: 1024px) {

  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}
</style>
