import { Md5 } from "ts-md5";
import axios from 'axios';
import axiosRetry from 'axios-retry';
import translateKeys  from './translate-keys.json'




interface TranslateApi extends TrasnlateParam  {
	translate(words: string) : Promise<string>
}






const errorMap: {[k: string]: string} = {
  '52001': '请求超时',
  '52002': '系统错误',
  '52003': '未授权用户',
  '54003': '访问频率受限制',
  '58002': '服务器关闭',
  '54001': '签名错误'
}

const  from = "auto";
const  to = "zh";
axiosRetry(axios, { retries: 3 });
axios.defaults.baseURL = "/backend"
const   baiduTranslate : TranslateApi  = {
  translate: async function (words)   {
    const appid = this.appId??'';
    const appSected = this.key;
    const salt = Math.random()
    const sign = Md5.hashStr(appid + words + salt + appSected);
    const options = {
      url: this.url,
      method: "get",
      params: {
        q: words.toString(),
        from,
        to,
        appid,
        salt,
        sign
      }
    };
    try {
      let data =(await axios.request(options)).data;
      if(data.error_code) {
        return errorMap[data.error_code] || '异常错误'
      } else {
        return data.trans_result[0].dst
      }
    }catch {
      return "网络异常"
    }
  },
  ...translateKeys.baidu
}

const  deeplTranslate : TranslateApi  = {
  translate: async function (words) {
    const options = {
      url: this.url,
      method: "get",
      headers: {
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
      params: {
        "auth_key": this.key,
        "text": words.toString(),
        "target_lang":"ZH",
      }
    }
    try {
      let data =(await axios.request(options)).data;
      return data.translations[0].text
    }catch {
      return "网络异常"
    }
  },
  ...translateKeys.deepl
}

const translateApis: TranslateApi[] = [baiduTranslate,deeplTranslate];

export default  translateApis;
