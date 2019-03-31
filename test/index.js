const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const mocha = require('mocha');
const { assert } = require('chai');

const Iconfont = require('../index');
const command = require('../iconfont');

const iconfont = new Iconfont({
  destDir: 'test/fonts/dest1',
  svgsPath: 'test/svgs',
  fontName: 'fontName',
  cssPrefix: 'cssPrefix',
  className: 'className',
  fontFileName: 'fontFileName',
  iconInfos: {
    'Dollar2': {
      unicode: '\uE002',
      name: 'dollar2',
      title: '美元'
    },
    'check-circle': {
      unicode: '\uE013',
      name: 'checkCircle',
      title: '检查圆形'
    }
  }
});

const clearDir = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  files.forEach(file => {
    fs.unlinkSync(path.resolve(dirPath, file));
  });
};

const toArrayBuffer = (buffer) => {
  const ab = new ArrayBuffer(buffer.length);
  const view = new Uint8Array(ab);
  for (let i = 0; i < buffer.length; i++) {
    view[i] = buffer[i];
  }
  return ab;
}

describe('iconfont', function () {
  const { destDir, fontFileName } = iconfont.options;
  let fontData = {};
  clearDir(destDir);

  describe('#svgicons2svgfont()', function () {
    it('should create an svgfont file and return fontData', async function () {
      try {
        fontData = await iconfont.svgicons2svgfont();
        assert.typeOf(fontData, 'object');
        assert.typeOf(fontData.fontName, 'string');
        assert.typeOf(fontData.glyphs, 'array');
        const content = await iconfont.readFile(path.resolve(destDir, `${fontFileName}.svg`));
        assert.typeOf(content, 'string');
        return Promise.resolve();
      } catch (err) {
        return Promise.reject(err);
      }
    });
  });

  describe('#svg2ttf', function () {
    it('should create an ttf file', function (done, fail) {
      const svgFont = fs.readFileSync(path.resolve(destDir, `${fontFileName}.svg`), 'utf-8');
      iconfont.svg2ttf(svgFont).then((ttf) => {
        done();
      }).catch((err) => {
        fail(err);
      });
    });
  });

  describe('#ttf2eot(), #ttf2woff(), #ttf2woff2()', function () {
    it('should create eot file by ttf', function () {
      const buf = fs.readFileSync(path.resolve(destDir, `${fontFileName}.ttf`));
      const ttf = new Uint8Array(buf);
      return iconfont.ttf2eot(ttf);
    });
    it('should create woff file by ttf', function () {
      const buf = fs.readFileSync(path.resolve(destDir, `${fontFileName}.ttf`));
      const ttf = new Uint8Array(buf);
      return iconfont.ttf2woff(ttf);
    });
    it('should create woff2 file by ttf', function () {
      const buf = fs.readFileSync(path.resolve(destDir, `${fontFileName}.ttf`));
      const ttf = new Uint8Array(buf);
      return iconfont.ttf2woff2(ttf);
    });
  });
  describe('#createDemo', function () {
    it('should create demo', function () {
      const woff2 = fs.readFileSync(path.resolve(destDir, `${fontFileName}.woff2`));
      fontData = {
        ...fontData,
        options: iconfont.options,
        base64: woff2.toString('base64')
      };
      return iconfont.createDemo(fontData);
    })
  });

  describe('#create', function () {
    it('should create all fonts file and demo', function () {
      clearDir(destDir);
      return iconfont.create();
    });
  });
});
