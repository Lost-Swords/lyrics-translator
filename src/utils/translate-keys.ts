
export interface TrasnlateParam  {
	name: string
	appId?: string;
	key: string;
	host: string;
	url: string;
}


interface TranslateApiMap  {
	[k: string]: TrasnlateParam
}

const baidu:TrasnlateParam  = {
	name: 'baidu',
	appId: '20200730000529751',
	key: 'lkjooeJUgW0spOctSbZb',
	host: 'https://fanyi-api.baidu.com',
	url: '/api/trans/vip/translate'
}

const deepl:TrasnlateParam  = {
	name: 'deepl',
	key: 'a0d77a3d-878d-455f-a374-73f65979bfe2:fx',
	host: 'https://api-free.deepl.com',
	url: '/v2/translate'
}


export const translateApis:TranslateApiMap = {
	baidu
}