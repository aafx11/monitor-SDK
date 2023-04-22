// gif图片上传没有跨域问题

let userAgent = require('user-agent')

let host = 'cn-guangzhou.log.aliyuncs.com'
let project = 'front-end-monitor'
let logstoreName = 'monitor-store'

function getExtraData () {
  return {
    title: document.title,
    url: location.url,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).name
  }
}

class SendTracker {
  constructor() {
    this.url = `https://${project}.${host}/logstores/${logstoreName}/track` // 上报路径
    this.xhr = new XMLHttpRequest()
  }
  send (data = {}) {
    let extraData = getExtraData()
    // let log = { ...extraData, ...data }
    let log = { ...extraData, ...data }
    let __logs__ = []

    let tempLog = {}
    for (const key in log) {
      tempLog[key] = String(log[key])
    }
    __logs__.push(tempLog)
    let requestBody = {
      __logs__,
      __source__: 'test'
    }
    console.log('requestBody', requestBody);
    // for (let key in log) {
    //   if (typeof log[key] === 'number') {
    //     log[key] = `${log[key]}`
    //   }
    // }

    let body = JSON.stringify(requestBody)
    this.xhr.open('POST', this.url, true) // true表示是否异步
    this.xhr.setRequestHeader('Content-Type', 'application/json') // 请求体类型
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') // 版本号
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) // 请求体大小

    this.xhr.onload = function (params) {
      console.log('xhr', this.xhr, params);
    }

    this.xhr.onerror = function (error) {
      console.log('error', error);
    }

    this.xhr.send(body)
  }
}

export default new SendTracker()