import $ from 'jquery' // 使用 expose-loader 暴露 $ 到 全局；

import 'bootstrapCss'

import Vue from 'vue'

import React from 'react'

import { x2, y2 } from './sthjs/b'

import { render } from 'react-dom'

import './sthjs/a.js'

import './index.css';

import './index.less'

import x from './x.js'

import './test-hmr'

console.log(y2)

let a = () => {
  console.log('arrow function')
};

a();

document.addEventListener('DOMContentLoaded', function () {
  let div = document.createElement('div');
  div.innerHTML = 'Hello World';
  document.body.appendChild(div);
  div = null;
});

/*!!!!! react code start */
let p2 = <p>这是一个 jsx 元素</p>;

render(p2, document.getElementById('root'));

/* react code end */

/*!!!!!! vue code start */
let components = {
  template: `<p @click="handler">{{content}}</p>`,
  data () {
    return {
      content: 'root-vue'
    }
  },
  methods: {
    handler () {
      console.log('the components was clicked')
    }
  }
};

let vm = new Vue(components);
vm.$mount('#root-vue');

/* vue code end*/

async function renderX(e) {
  let p = await import('./test-hmr')
  console.log(p)
  let getP = document.getElementById('px1');
  if (getP) return getP.innerText = p.p;
  let newP = document.createElement('p');
  newP.innerText = p.p;
  newP.id = 'px1';
  document.body.appendChild(newP);
}
renderX();
if (module.hot) {
  module.hot.accept('./test-hmr', renderX)
}
