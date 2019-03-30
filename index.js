
const fs = require('fs');
const path = require('path');

const SVGIcons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');

class Iconfont {

  constructor (options = {}) {
    const {
      fontName = 'iconfont',
      destDir = 'fonts',
      svgsPath = 'svgs',
      startUnicode = '\uE001'
    } = options;

    this.options = {
      fontName, destDir, svgsPath, startUnicode
    };
  }

  async create () {

  }

  svgicons2svgfont () {
    const {fontName, destDir, svgsPath, startUnicode} = this.options;
    const fontStream = new SVGIcons2svgfont({
      fontName
    });
    return new Promise((resolve, reject) => {
      fontStream.pipe(fs.createWriteStream(path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.svg`)))
        .on('finish', function () {
          resolve();
        })
        .on('error', function (err) {
          reject(err);
        });

        this.readDir(svgsPath).then(fileList => {
          fileList.forEach((file, index) => {
            const filePath = path.resolve(svgsPath, file);
            const glyph = fs.createReadStream(filePath);
            glyph.metadata = {
              unicode: [startUnicode],
              name: `icon${index}`
            };
            fontStream.write(glyph);
          });
          fontStream.end();
        }).catch(err => {
          reject(err);
        });
    });
  }

  svg2ttf (svg) {
    const {destDir} = this.options;

    return new Promise((resolve, reject) => {
      const ttf = svg2ttf(svg, {});
      this.writeFile(path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.ttf`), ttf)
        .then(() => {
          resolve(ttf);
        }).catch(reject);
    });
  }

  ttf2eot (ttf) {
    const { destDir } = this.options;
    const filePath = path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.eot`);
    const eotBuff = Buffer.from(ttf2eot(ttf.buffer).buffer);

    return this.writeFile(filePath, eotBuff);
  }

  ttf2woff (ttf) {
    const { destDir } = this.options;
    const filePath = path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.woff`);
    const eotBuff = Buffer.from(ttf2woff(ttf.buffer).buffer);

    return this.writeFile(filePath, eotBuff);
  }

  ttf2woff2 (ttf) {
    const { destDir } = this.options;
    const filePath = path.resolve(destDir, `${Iconfont.FONT_FILE_NAME}.woff2`);
    const eotBuff = Buffer.from(ttf2woff(ttf.buffer).buffer);

    return this.writeFile(filePath, eotBuff);
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

Iconfont.FONT_FILE_NAME = 'iconfont';

module.exports = Iconfont;
