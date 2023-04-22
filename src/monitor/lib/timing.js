import getLastEvent from '../utils/getLastEvent';
import tracker from '../utils/tracker';
import onload from '../utils/onload';
import getSelector from '../utils/getSelector';
export function timing (params) {
  let FMP, LCP
  if (PerformanceObserver) {
    // 增加一个性能条目的观察者
    new PerformanceObserver((entryList, observer) => {
      console.log('entryList', entryList);
      let perfEntries = entryList.getEntries()
      FMP = perfEntries[0]
      observer.disconnect()
    }).observe({ entryTypes: ['element'] }) // 有意义的元素

    new PerformanceObserver((entryList, observer) => {
      let perfEntries = entryList.getEntries()
      LCP = perfEntries[0]
      observer.disconnect()
    }).observe({ entryTypes: ['largest-contentful-paint'] }) // 最大的元素

    new PerformanceObserver((entryList, observer) => {
      let lastEvent = getLastEvent() // 最后一个交互事件
      let paths = lastEvent ? (lastEvent.target || lastEvent.path || lastEvent.composedPath()) : ['']
      console.log('lastEvent', lastEvent.target);
      let firstInput = entryList.getEntries()[0]
      console.log('firstInput', firstInput);
      if (firstInput) {
        // processingStart 开始处理的时间 -startTime开始点击的时间 = 处理的延迟
        let inputDelay = firstInput.processingStart - firstInput.startTime
        let duration = firstInput.duration // 处理事件的时间
        if (inputDelay > 0 || duration > 0) {
          tracker.send({
            kind: 'experience', // 用户体验指标
            type: 'firstInputDelay', // 首次输入延迟
            inputDelay,
            duration,
            startTime: firstInput.startTime,
            selector: lastEvent ? getSelector(paths) : ''

          })
        }
      }

      observer.disconnect()
    }).observe({ type: 'first-input', buffered: true }) // 用户第一次交互
  }


  onload(function (params) {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart,
      } = performance.timing
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'timing',
        connectTime: connectEnd - connectStart,//连接时间
        ttfbTime: responseEnd - requestStart,// 首字节到达的时间
        responseTime: responseEnd - responseStart, // 响应的读取时间
        parseDOMTime: loadEventStart - domLoading, // DOM解析时间
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart,
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart, // 完整的加载时间
      })

      let FP = performance.getEntriesByName('first-paint')[0]
      let FCP = performance.getEntriesByName('first-contentful-paint')[0]
      console.log('FP', FP);
      console.log('FCP', FCP);
      console.log('FMP', FMP);
      console.log('LCP', LCP);

      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'paint',
        firstPaint: FP.startTime, // 首次开始绘制
        firstContentfulPaint: FCP.startTime, // 首次开始绘制内容
        firstMeaningfulPaint: FMP.startTime, // 有意义的元素开始绘制
        largestContentfulPaint: LCP.startTime // 最大内容绘制
      })
    }, 3000);
  })
}