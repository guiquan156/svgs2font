
const fs = require('fs');
const path = require('path');

const SVGIcons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const ejs = require('ejs');

class Iconfont {

  constructor (options = {}) {
    const {
      fontName = 'iconfont', // demo中的fontFamily
      fontFileName = 'iconfont', // 生成文件的文件名，如iconfont.css
      cssPrefix = 'icon', // css样式名前缀
      className = 'iconfont', // 公用类名
      destDir = 'fonts',
      svgsPath = 'svgs',
      startUnicode = '\uE001',
      isCreateDemo = true,
      iconfontTplPath = path.resolve(__dirname, 'tmpls/iconfontTpl.css'),
      demoHtmlTplPath = path.resolve(__dirname, 'tmpls/demoTpl.html'),
      demoCssTplPath = path.resolve(__dirname, 'tmpls/demoTpl.css')
    } = options;

    this.options = {
      fontName, destDir, svgsPath, startUnicode, isCreateDemo,
      iconfontTplPath, demoHtmlTplPath, demoCssTplPath,
      fontFileName, cssPrefix, className
    };
  }

  async create () {
    const { isCreateDemo, destDir, fontFileName } = this.options;
    let fontData = await this.svgicons2svgfont();
    const svg = await this.readFile(path.resolve(destDir, `${fontFileName}.svg`));
    const ttf = await this.svg2ttf(svg);

    const fonts = await Promise.all([
      this.ttf2eot(ttf),
      this.ttf2woff(ttf),
      this.ttf2woff2(ttf)
    ]);

    if (isCreateDemo) {
      fontData = {
        ...fontData,
        options: this.options,
        base64: fonts[2].toString('base64')
      };
      this.createDemo(fontData);
    }
  }

  svgicons2svgfont () {
    const {fontName, destDir, svgsPath, startUnicode, fontFileName} = this.options;
    const fontStream = new SVGIcons2svgfont({
      fontName
    });
    const fontData = {
      fontName,
      glyphs: []
    };
    return new Promise((resolve, reject) => {
      fontStream.pipe(fs.createWriteStream(path.resolve(destDir, `${fontFileName}.svg`)))
        .on('finish', function () {
          resolve(fontData);
        })
        .on('error', function (err) {
          reject(err);
        });

        this.readDir(svgsPath).then(fileList => {
          fileList.forEach((file, index) => {
            const filePath = path.resolve(svgsPath, file);
            const glyph = fs.createReadStream(filePath);
            const unicode = this.unicodeAdd(startUnicode, index);
            glyph.metadata = {
              unicode: [unicode],
              name: `icon${index}`
            };
            fontData.glyphs.push({
              hex: unicode.charCodeAt(0).toString(16),
              name: glyph.metadata.name
            });
            fontStream.write(glyph);
          });
          fontStream.end();
        }).catch(err => {
          reject(err);
        });
    });
  }

  svg2ttf (svg) {
    const { destDir, fontFileName } = this.options;

    return new Promise((resolve, reject) => {
      const ttf = svg2ttf(svg, {});
      this.writeFile(path.resolve(destDir, `${fontFileName}.ttf`), ttf)
        .then(() => {
          resolve(ttf);
        }).catch(reject);
    });
  }

  ttf2eot (ttf) {
    const { destDir, fontFileName } = this.options;
    const filePath = path.resolve(destDir, `${fontFileName}.eot`);
    const eotBuff = Buffer.from(ttf2eot(ttf.buffer).buffer);

    return new Promise((resolve, reject) => {
      this.writeFile(filePath, eotBuff).then(() => {
        resolve(eotBuff);
      }).catch(reject);
    });
  }

  ttf2woff (ttf) {
    const { destDir, fontFileName } = this.options;
    const filePath = path.resolve(destDir, `${fontFileName}.woff`);
    const woffBuff = Buffer.from(ttf2woff(ttf.buffer).buffer);

    return new Promise((resolve, reject) => {
      this.writeFile(filePath, woffBuff).then(() => {
        resolve(woffBuff);
      }).catch(reject);
    });
  }

  ttf2woff2 (ttf) {
    const { destDir, fontFileName } = this.options;
    const filePath = path.resolve(destDir, `${fontFileName}.woff2`);
    const woff2Buff = Buffer.from(ttf2woff(ttf.buffer).buffer);

    return new Promise((resolve, reject) => {
      this.writeFile(filePath, woff2Buff).then(() => {
        resolve(woff2Buff);
      }).catch(reject);
    });
  }

  async createDemo (fontData) {
    const {
      destDir,
      iconfontTplPath,
      demoHtmlTplPath,
      demoCssTplPath,
      fontFileName
    } = this.options;

    const [
      iconfontTpl,
      demoHtmlTpl,
      demoCssTpl
    ] = await Promise.all([
      this.readFile(iconfontTplPath),
      this.readFile(demoHtmlTplPath),
      this.readFile(demoCssTplPath)
    ]);

    const iconfont = ejs.render(iconfontTpl, fontData);
    const demoHtml = ejs.render(demoHtmlTpl, fontData);
    const demoCss = ejs.render(demoCssTpl, fontData);

    return Promise.all([
      this.writeFile(path.resolve(destDir, `${fontFileName}.css`), iconfont, 'utf-8'),
      this.writeFile(path.resolve(destDir, 'demo.html'), demoHtml, 'utf-8'),
      this.writeFile(path.resolve(destDir, 'demo.css'), demoCss, 'utf-8')
    ]);
  }

  unicodeAdd (unicode, num) {
    const charCode = unicode.charCodeAt(0) + num;
    const result = String.fromCharCode(charCode);

    return result;
  }

  readDir (dirPath) {
    return new Promise(function (resolve, reject) {
      fs.readdir(dirPath, function (err, fileList) {
        if (err) return reject(err);
        resolve(fileList);
      });
    });
  }

  readFile (path, options = 'utf-8') {
    return new Promise(function (resolve, reject) {
      fs.readFile(path, options, function (err, content) {
        if (err) return reject(err);
        resolve(content);
      });
    });
  }

  writeFile (path, content, options) {
    return new Promise(function (resolve, reject) {
      fs.writeFile(path, content, options, function (err) {
        if (err) return reject(err);
        resolve();
      })
    });
  }
}

module.exports = Iconfont;
