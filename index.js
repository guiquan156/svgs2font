
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
      destDir = path.resolve(process.cwd(), 'fonts'), // 导出的目录
      svgsPath = path.resolve(process.cwd(), 'svgs'), // svg存放svg的目录
      startUnicode = '\uE600', // 没有指定unicode时，unicode的最小值
      isCreateDemo = true, // 是否同时创建demo
      iconfontTplPath = path.resolve(__dirname, 'tmpls/iconfontTpl.css'), // iconfont.css模板
      demoHtmlTplPath = path.resolve(__dirname, 'tmpls/demoTpl.html'), // demo.html模板(copy from ali iconfont)，一般不需要修改
      demoCssTplPath = path.resolve(__dirname, 'tmpls/demoTpl.css'), // demo.css模板(copy from ali iconfont)，一般不需要修改
      iconInfos = {} // 设定iconfont对应的unicode，title，name；key为文件名，可以设置unicode、name（默认basename）、title（默认name，demo中显示）
    } = options;

    this.options = {
      fontName, destDir, svgsPath, startUnicode, isCreateDemo,
      iconfontTplPath, demoHtmlTplPath, demoCssTplPath,
      fontFileName, cssPrefix, className, iconInfos
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
    const {fontName, destDir, svgsPath, startUnicode, fontFileName, iconInfos} = this.options;
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

            if (!iconInfos[baseName]) return true; // 不存在，跳过在下面的循环处理

            const filePath = path.resolve(svgsPath, file);
            const glyph = fs.createReadStream(filePath);
            const info = iconInfos[baseName];

            glyph.metadata = {
              unicode: [info.unicode],
              name: info.name || baseName
            };
            fontData.glyphs.push({
              hex: info.unicode.charCodeAt(0).toString(16),
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
            const unicode = getUnicode();
            glyph.metadata = {
              unicode: [unicode],
              name: baseName
            };
            fontData.glyphs.push({
              hex: unicode.charCodeAt(0).toString(16),
              title: baseName,
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
