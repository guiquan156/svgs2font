
const fs = require('fs');
const path = require('path');

const SVGIcons2svgfont = require('svgicons2svgfont');
const svg2ttf = require('svg2ttf');
const ttf2eot = require('ttf2eot');
const ttf2woff = require('ttf2woff');
const ttf2woff2 = require('ttf2woff2');
const ejs = require('ejs');

class Svgs2font {

  constructor (options = {}) {
    const {
      fontName = 'iconfont', // demo中的fontFamily
      fontFileName = 'iconfont', // 生成文件的文件名，如iconfont.css
      cssPrefix = 'icon', // css样式名前缀
      className = 'iconfont', // 公用类名
      output = path.resolve(process.cwd(), 'fonts'), // 导出的目录
      svgsPath = path.resolve(process.cwd(), 'svgs'), // svg存放svg的目录
      startUnicode = '\uE600', // 没有指定unicode时，unicode的最小值
      isCreateDemo = true, // 是否同时创建demo
      iconfontTplPath = path.resolve(__dirname, 'tmpls/iconfontTpl.css'), // iconfont.css模板
      demoHtmlTplPath = path.resolve(__dirname, 'tmpls/demoTpl.html'), // demo.html模板(copy from ali iconfont)，一般不需要修改
      demoCssTplPath = path.resolve(__dirname, 'tmpls/demoTpl.css'), // demo.css模板(copy from ali iconfont)，一般不需要修改
      iconInfos = {}, // 设定iconfont对应的unicode，title，name；key为文件名，可以设置unicode、name（默认basename）、title（默认name，demo中显示）
      prependUnicode = false,
      fontStyle, fontWeight, fixedWidth, centerHorizontally, normalize,
      fontHeight, round, ascent, log = function () {}
    } = options;

    this.options = {
      fontName, output, svgsPath, startUnicode, isCreateDemo,
      iconfontTplPath, demoHtmlTplPath, demoCssTplPath,
      fontFileName, cssPrefix, className, iconInfos, prependUnicode
    };

    // options for svgicons2svgfont
    this.svgiconsOpt = {
      fontName, fontStyle, fontWeight, fixedWidth, centerHorizontally, normalize,
      fontHeight, round, ascent, log
    }
  }

  async create () {
    const { isCreateDemo, output, fontFileName } = this.options;
    let fontData = await this.svgicons2svgfont(this.svgiconsOpt);
    const svg = await this.readFile(path.resolve(output, `${fontFileName}.svg`));
    const ttf = await this.svg2ttf(svg);

    const fonts = await Promise.all([
      this.ttf2eot(ttf.buffer),
      this.ttf2woff(ttf.buffer),
      this.ttf2woff2(ttf.buffer)
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
    const {fontName, output, svgsPath, startUnicode, fontFileName, iconInfos, prependUnicode} = this.options;
    const fontStream = new SVGIcons2svgfont({
      fontName
    });
    const prependReg = /(0x([1-9]|[a-e]){3})/i
    const fontData = {
      fontName,
      glyphs: []
    };
    return new Promise((resolve, reject) => {
      fontStream.pipe(fs.createWriteStream(path.resolve(output, `${fontFileName}.svg`)))
        .on('finish', function () {
          resolve(fontData);
        })
        .on('error', function (err) {
          reject(err);
        });

        this.readDir(svgsPath).then(fileList => {
          const unicordRecord = {}; // 记录已经被占用的unicode
          let curUnicode = startUnicode; // unicode记录当前位置
          const getUnicode = () => {
            while (true) {
              let _cur = curUnicode;
              curUnicode = this.unicodeAdd(curUnicode, 1); // 往后移一位
              if (!unicordRecord[_cur]) { // 不在iconInfos中，未被占用，返回这个unicode
                return _cur;
              }
            }
          };

          // 优先遍历iconInfos
          fileList = fileList.filter((file, index) => {
            const baseName = path.basename(file, '.svg');

            // 不存在或没有指定unicode，跳过在下面的循环处理
            if (!iconInfos[baseName] || !iconInfos[baseName].unicode) return true;

            const filePath = path.resolve(svgsPath, file);
            const glyph = fs.createReadStream(filePath);
            const info = iconInfos[baseName];
            const hex = info.unicode.charCodeAt(0).toString(16);

            if (prependUnicode) {
              let newName = baseName;
              if (prependReg.test(baseName)) {
                newName.replace(prependReg, info.unicode);
              } else {
                newName = `0x${hex}-${newName}`;
              }
              fs.renameSync(filePath, path.resolve(svgsPath, `${newName}.svg`));
            }

            glyph.metadata = {
              unicode: [info.unicode],
              name: info.name || baseName
            };
            fontData.glyphs.push({
              hex,
              title: info.title || info.name || baseName,
              name: glyph.metadata.name
            });
            fontStream.write(glyph);
            unicordRecord[info.unicode] = true;
            return false; // 已处理，下次遍历不循环
          });

          fileList.forEach((file, index) => {
            const filePath = path.resolve(svgsPath, file);
            const baseName = path.basename(file, '.svg');
            const glyph = fs.createReadStream(filePath);
            const unicode = (function () {
              if (prependUnicode) {
                if (prependReg.test(baseName)) {
                  let _hex = baseName.match(prependReg)(1).replace('0x', '');
                  return _hex.fromCharCode(parseInt(_hex, 16)); // 转为unicode
                } else {
                  let _uc = getUnicode();
                  let newName = `0x${_uc.charCodeAt(0).toString(16)}-${newName}`;
                  fs.renameSync(filePath, path.resolve(svgsPath, `${newName}.svg`));
                  return _uc;
                }
              } else {
                return getUnicode();
              }
            })();
            const iconInfo = iconInfos[baseName] || {};
            const hex = unicode.charCodeAt(0).toString(16);
            glyph.metadata = {
              unicode: [unicode],
              name: iconInfo.name || baseName
            };
            fontData.glyphs.push({
              hex,
              title: iconInfo.title || baseName,
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
    const { output, fontFileName } = this.options;

    return new Promise((resolve, reject) => {
      const ttf = svg2ttf(svg, {});
      this.writeFile(path.resolve(output, `${fontFileName}.ttf`), ttf.buffer)
        .then(() => {
          resolve(ttf);
        }).catch(reject);
    });
  }

  ttf2eot (ttfUint8Arr) {
    const { output, fontFileName } = this.options;
    const filePath = path.resolve(output, `${fontFileName}.eot`);
    const eotBuff = Buffer.from(ttf2eot(ttfUint8Arr).buffer);
    return new Promise((resolve, reject) => {
      this.writeFile(filePath, eotBuff).then(() => {
        resolve(eotBuff);
      }).catch(reject);
    });
  }

  ttf2woff (ttfUint8Arr) {
    const { output, fontFileName } = this.options;
    const filePath = path.resolve(output, `${fontFileName}.woff`);
    const woffBuff = Buffer.from(ttf2woff(ttfUint8Arr).buffer);

    return new Promise((resolve, reject) => {
      this.writeFile(filePath, woffBuff).then(() => {
        resolve(woffBuff);
      }).catch(reject);
    });
  }

  ttf2woff2 (ttfUint8Arr) {
    const { output, fontFileName } = this.options;
    const filePath = path.resolve(output, `${fontFileName}.woff2`);
    const woff2Buff = Buffer.from(ttf2woff2(ttfUint8Arr).buffer);

    return new Promise((resolve, reject) => {
      this.writeFile(filePath, woff2Buff).then(() => {
        resolve(woff2Buff);
      }).catch(reject);
    });
  }

  async createDemo (fontData) {
    const {
      output,
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
      this.writeFile(path.resolve(output, `${fontFileName}.css`), iconfont, 'utf-8'),
      this.writeFile(path.resolve(output, 'demo.html'), demoHtml, 'utf-8'),
      this.writeFile(path.resolve(output, 'demo.css'), demoCss, 'utf-8')
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

module.exports = Svgs2font;
