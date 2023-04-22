import tracker from '../utils/tracker';
export function injectXHR (params) {
  let XMLHttpRequest = window.XMLHttpRequest
  let oldOpen = XMLHttpRequest.prototype.open
  // 重写open方法
  XMLHttpRequest.prototype.open = function (method, url, async) {
    if (!url.match(/logstores/) && !url.match(/sockjs/)) {
      this.logData = { method, url, async }
    }

    // 原始的open方法
    return oldOpen.apply(this, arguments)
  }

  let oldSend = XMLHttpRequest.prototype.send

  XMLHttpRequest.prototype.send = function (body) {
    if (this.logData) {
      let startTime = Date.now() // 发送请求前
      let handler = (type) => (event) => {
        let duration = Date.now() - startTime
        let status = this.status // 200 500
        let statusText = this.statusText
        tracker.send({
          kind: 'stability', // 监控指标大类
          type: 'xhr', // 小类型，表示是一个错误
          eventType: type, // load error abort
          pathname: this.logData.url,
          status: status + '-' + statusText,
          duration,
          response: this.response ? JSON.stringify(this.response) : '',
          params: body || ''
        })
      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oldSend.apply(this, arguments)
  }
}