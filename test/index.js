const Iconfont = require('../index');
const path = require('path');

const iconfont = new Iconfont();

iconfont.svgicons2svgfont().then(() => {
  console.log('svgicons2svgfont success');

  const { destDir } = iconfont.options;

  iconfont.readFile(path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.svg`)).then(file => {
    return iconfont.svg2ttf(file);
  }).then(ttf => {
    console.log('ttf create success');

    return Promise.all([
      iconfont.ttf2eot(ttf)
    ]);

  }).catch(err => {
    throw err;
  });











}).catch(err => {
  throw err;
});



