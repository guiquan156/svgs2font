const Iconfont = require('../index');
const path = require('path');

const iconfont = new Iconfont();

iconfont.svgicons2svgfont().then((fontData) => {
  console.log('svgicons2svgfont success');

  const { destDir } = iconfont.options;

  iconfont.readFile(path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.svg`)).then(file => {
    return iconfont.svg2ttf(file);
  }).then(ttf => {
    console.log('ttf create success');

    return Promise.all([
      iconfont.ttf2eot(ttf),
      iconfont.ttf2woff(ttf),
      iconfont.ttf2woff2(ttf)
    ]);
  }).then((fonts) => {
    console.log('eot, woff, woff2 create success');

    fontData.base64 = fonts[2].toString('base64');
    return iconfont.createDemo(fontData);
  }).then(() => {
    console.log('demo created!');
  }).catch(err => {
    throw err;
  })
}).catch(err => {
  throw err;
});
