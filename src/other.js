import React from 'react'
import ReactDOM from 'react-dom'

import x from './x.js'
console.log(x.a)
console.log('the log output by other.js')

function getName() {
  console.log('hello world from multi-page wep app')
}

let h1 = <h1>这是使用动态链接库后的 h1</h1>

ReactDOM.render(h1, document.getElementById('root-other-page'))


