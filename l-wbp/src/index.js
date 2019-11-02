import './index.css'
import './index.less'
import '@babel/polyfill'
// import $ from 'expose-loader?$!jquery'
// import $ from 'jquery'
import logo from './stars.jpeg' // file-loader 生成一张图片到 build 下，并且给图片路径后面拼接一段 hash

console.log($)
console.log(window.$)
console.log('zfpx')

let img = new Image()
img.src = logo
document.body.appendChild(img)

let fn = () => console.log('hahahahahahahahahhaha')

fn()

@log
class A {
  a = 1
}

function log(target) {
  console.log(target)
}

let obj = new A()
console.log(obj.a)

async function getImg() {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      console.log('hahahah')
    }, 2000)
  })
}
getImg()

function * gen() {
  yield 1;
  yield 2;
  yield 3;
}

let g = gen()
console.log(g.next())

console.log('aaa'.includes('a'))
