const Iconfont = require('../index');
const path = require('path');

const iconfont = new Iconfont({
  destDir: 'fonts',
  fontName: 'fontName',
  cssPrefix: 'cssPrefix',
  className: 'className',
  fontFileName: 'fontFileName'
});

iconfont.svgicons2svgfont().then((fontData) => {
  console.log('[test] svgicons2svgfont success');

  const { destDir } = iconfont.options;

  iconfont.readFile(path.resolve(destDir, `${iconfont.options.fontFileName}.svg`)).then(file => {
    return iconfont.svg2ttf(file);
  }).then(ttf => {
    console.log('[test] ttf create success');

    return Promise.all([
      iconfont.ttf2eot(ttf),
      iconfont.ttf2woff(ttf),
      iconfont.ttf2woff2(ttf)
    ]);
  }).then((fonts) => {
    console.log('[test] eot, woff, woff2 create success');

    fontData = {
      ...fontData,
      options: iconfont.options,
      base64: fonts[2].toString('base64'),
    }
    return iconfont.createDemo(fontData);
  }).then(() => {
    console.log('[test] demo created!');
    return iconfont.create();
  }).then(() => {
    console.log('[test] create method run success!!!!');
  }).catch(err => {
    throw err;
  })
}).catch(err => {
  throw err;
});
