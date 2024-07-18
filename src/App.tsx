import React, { useEffect, useState } from 'react'
import type { EventCenterForMicroApp } from '@micro-zoe/micro-app'
import '@/app.less'

function App() {
  const [state, setState] = useState<{ content: string }>({ content: '' })

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ma: EventCenterForMicroApp = (window as any).microApp
    const listener = (data: { content: string }) => {
      console.log('来自主应用的数据', data)
      setState(data)
    }
    const globalListener = (data: { content: string }) => {
      console.log('==React子应用接收全局数据', data)
      setState(data)
    }
    ma.addDataListener(listener, true)
    ma.addGlobalDataListener(globalListener)
  }, [])
  const onSendParent = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ma: EventCenterForMicroApp = (window as any).microApp
    ma.forceDispatch({
      content: '我是React子应用发送的消息！！！！'
    })
  }
  return (
    <div>
      我是 React 子应用 <button onClick={onSendParent}>向父应用发送消息</button>
      {state.content && (
        <div style={{ color: 'red' }}>
          <div>{state.content}</div>
        </div>
      )}
    </div>
  )
}
export default App
