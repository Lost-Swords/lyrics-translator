// import all json files
const localesFile = import.meta.glob('./*.json', { eager: true })


const localesMsg: Record<string, any> = {}

for (let path in localesFile) {
  const moduleName = path.split('/').pop()?.replace('.json', '') || path
  localesMsg[moduleName] = localesFile[path]
}

export default localesMsg
