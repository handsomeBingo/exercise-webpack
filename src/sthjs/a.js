console.log($) // 无需导入，直接可以访问到全局下的 $

console.log($1);
console.log(_);


// decorator
function log(target) {
  console.log(target)
}

@log
class A {
  constructor() {
    this.test = 'test decorator'
  }
}

// class properties

class B {
  b = 1;
  x = 'test class properties';
}

let b = new B();
console.log(b.x)

// 3. async/await

async function getImg() {
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve('ok')
    }, 2000)
  })
}

getImg();

// 4. generator

function * gen() {
  yield 1;
  yield 2;
  yield 3;
  return 4;
}

let it = gen();
console.log(it.next());

for (let i of it) {
  console.log(i)
}
