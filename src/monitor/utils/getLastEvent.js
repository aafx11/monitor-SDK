let lastEvent;

const eventTypeList = [
  'click',
  'touchstart',
  'mousedown',
  'keydown',
  'mouseover'
]

eventTypeList.forEach(eventType => {
  document.addEventListener(eventType, (event) => {
    lastEvent = event
  },{
    capture:true, // 捕获阶段执行
    passive:true, // 默认不阻止默认事件
  })
})

export default function () {
  return lastEvent
}