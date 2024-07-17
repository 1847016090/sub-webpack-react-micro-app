import React, { Suspense, lazy, useState } from 'react'
import ClassComponent from '@/components/Class'

import smallImg from '@/assets/imgs/5kb.png'
import bigImg from '@/assets/imgs/22kb.png'

import { Demo1 } from '@/components'

const LazyDemo = lazy(() => import('@/components/LazyDemo')) // 使用import语法配合react的Lazy动态引入资源

// 上面配置了资源懒加载后,虽然提升了首屏渲染速度,但是加载到资源的时候会有一个去请求资源的延时,
// 如果资源比较大会出现延迟卡顿现象,可以借助link标签的rel属性prefetch与preload,link标签除了加载css之外也可以加载js资源,
// 设置rel属性可以规定link提前加载资源,但是加载资源后不执行,等用到了再执行。
// rel的属性值
// preload是告诉浏览器页面必定需要的资源,浏览器一定会加载这些资源。
// prefetch是告诉浏览器页面可能需要的资源,浏览器不一定会加载这些资源,会在空闲时加载。
// 对于当前页面很有必要的资源使用 preload ,对于可能在将来的页面中使用的资源使用 prefetch。
// prefetch
const PreFetchDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreFetchDemo" */
      /*webpackPrefetch: true*/
      '@/components/PreFetchDemo'
    )
)

// 在测试时发现只有js资源设置prefetch模式才能触发资源预加载,preload模式触发不了,
// css和图片等资源不管设置prefetch还是preload都不能触发,不知道是哪里没配置好。
// preload
const PreloadDemo = lazy(
  () =>
    import(
      /* webpackChunkName: "PreloadDemo" */
      /*webpackPreload: true*/
      '@/components/PreloadDemo'
    )
)

import '@/app.less'

function App() {
  const [count, setCounts] = useState('')
  const [show, setShow] = useState(false)
  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCounts(e.target.value)
  }
  // 点击事件中动态引入css, 设置show为true
  const onClick = () => {
    // import("./app.css");
    setShow(true)
  }

  const test = (data: number) => {
    console.log('data', data)
  }

  test(11)
  console.log('111', 111)
  return (
    <>
      <h2 onClick={onClick}>展示</h2>
      {/* show为true时加载LazyDemo组件 */}
      {show && (
        <>
          <Suspense fallback={null}>
            <LazyDemo />
          </Suspense>
          <Suspense fallback={null}>
            <PreloadDemo />
          </Suspense>
          <Suspense fallback={null}>
            <PreFetchDemo />
          </Suspense>
        </>
      )}
      <h2>webpack5-react-ts修改1111</h2>
      <ClassComponent />
      <img src={smallImg} alt='小于10kb的图片' />
      <img src={bigImg} alt='大于于10kb的图片' />
      <div className='smallImg'></div> {/* 小图片背景容器 */}
      <div className='bigImg'></div> {/* 大图片背景容器 */}
      <h2>组件</h2>
      <p>受控组件</p>
      <input type='text' value={count} onChange={onChange} />
      <br />
      <p>非受控组件</p>
      <input type='text' />
      <Demo1 />
    </>
  )
}
export default App
