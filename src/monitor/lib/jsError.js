import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

export function injectJsError (params) {
  window.addEventListener('error', function (event) {
    console.log('injectJsError', event);
    let lastEvent = getLastEvent() // 最后一个交互事件
    console.log('lastEvent', lastEvent);
    let paths = lastEvent ? (lastEvent.path || lastEvent.composedPath()) : ['']

    if (event.target && (event.target.src || event.target.href)) {
      let log = {
        kind: 'stability', // 监控指标大类
        type: 'error', // 小类型，表示是一个错误
        errorType: 'resourceError', // 具体报错类型
        url: '', // 访问哪个路径
        message: event.message, // 报错信息
        filename: event.target.src || event.target.href, // 具体报错的文件
        tagName: event.target.tagName, // 报错的行和列
        // stack: getLines(event.error.stack),
        selector: lastEvent ? getSelector(paths) : '', //最后一个操作的元素
      }
      tracker.send(log, true)
    }

    let log = {
      kind: 'stability', // 监控指标大类
      type: 'error', // 小类型，表示是一个错误
      errorType: 'jsError', // 具体报错类型
      url: '', // 访问哪个路径
      message: event.message, // 报错信息
      filename: event.filename, // 具体报错的文件
      position: `${event.lineno}:${event.colno}`, // 报错的行和列
      stack: getLines(event.error.stack),
      selector: lastEvent ? getSelector(paths) : '', //最后一个操作的元素
    }
    tracker.send(log, true)
  }, true)

  // 未捕获的异常
  window.addEventListener('unhandledrejection', function (event) {
    console.log('unhandledrejection', event);
    let lastEvent = getLastEvent()
    let message;
    let filename
    let line = 0
    let column = 0
    let stack = ''
    if (typeof event.reason === 'string') {
      message = event.reason
    } else if (typeof event.reason === 'object') {
      // 是一个错误对象
      if (event.reason.stack) {
        let matchResult = event.reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
        filename = matchResult[1]
        line = matchResult[2]
        column = matchResult[3]
      }
      message = event.reason.message
      stack = getLines(event.reason.stack)
    }
    let paths = lastEvent.path || lastEvent.composedPath()
    let log = {
      kind: 'stability', // 监控指标大类
      type: 'error', // 小类型，表示是一个错误
      errorType: 'promiseError', // 具体报错类型
      url: '', // 访问哪个路径
      message, // 报错信息
      filename: filename, // 具体报错的文件
      position: `${line}:${column}`, // 报错的行和列
      stack,
      selector: lastEvent ? getSelector(paths) : '', //最后一个操作的元素
    }
    tracker.send(log, true)
  }, true)

  function getLines (stack) {
    return stack.split('\n')
      .slice(1)
      .map(item => item.replace(/^\s+at\s+/g, "")) // 替换空格开头中间是at空格结尾的字符串
      .join('^')
  }
}