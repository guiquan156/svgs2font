const Iconfont = require('../index');

const iconfont = new Iconfont();

iconfont.svgicons2svgfont().then(() => {
  console.log('svgicons2svgfont success');
}).catch(err => {
  throw err;
});
