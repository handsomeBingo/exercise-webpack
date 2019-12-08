import $ from 'jquery' // 使用 expose-loader 暴露 $ 到 全局；

import Vue from 'vue'

import React from 'react'
import { render } from 'react-dom'

import './sthjs/a.js'
import './sthjs/b.js'

import './index.css';

import './index.less'

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
