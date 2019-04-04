#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');

const pkg = require('./package.json');
const Svgs2font = require('./index');

program
  .version(pkg.version)
  .option('-f, --fontName [fontName]', 'fontFamily name in css, default: iconfont')
  .option('-F --fontFileName [fontFileName]', 'filename of output file, default: iconfont')
  .option('-p --cssPrefix [cssPrefix]', 'css classname prefix, default: icon')
  .option('-C --className [className]', 'classname of common class for icon, default: iconfont')
  .option('-o --output [output]', 'the dest directory of output file, default: fonts')
  .option('-s --svgsPath [svgsPath]', 'the svgs source directory, default: svgs')
  .option('-u --startUnicode [startUnicode]', 'the start unicode of icons, default: \uE600')
  .option('-dm --isCreateDemo [isCreateDemo]', 'is create demo, default: true')
  .option('-c --configFile [configFile]', 'an config file to config')

  .option('-i, --fontId [value]', 'the font id you want [fontname]')
  .option('-st, --style [value]', 'the font style you want')
  .option('-we, --weight [value]', 'the font weight you want')
  .option('-w, --fixedWidth', 'creates a monospace font of the width of the largest input icon')
  .option('-ch, --centerhorizontally', 'calculate the bounds of a glyph and center it horizontally')
  .option('-n, --normalize', 'normalize icons by scaling them to the height of the highest icon')
  .option('-h, --height [value]', 'the output font height [MAX(icons.height)] (icons will be scaled so the highest has this height)')
  .option('-r, --round [value]', 'setup the SVG path rounding [10e12]')
  .option('-d, --descent [value]', 'the font descent [0]')
  .option('-a, --ascent [value]', 'the font ascent [height - descent]')
  .option('-a, --prependUnicode', 'prefix files with their automatically allocated unicode code point')
  .option('-m, --metadata', 'content of the metadata tag')
  .parse(process.argv);

async function create () {
  let fileOpt = {};

  if (program.configFile) {
    const filePath = path.resolve(process.cwd(), program.configFile); // 相对于执行命令的目录
    fileOpt = require(filePath);
  }

  let options = {
    ...program,
    ...fileOpt
  };

  const svgs2font = new Svgs2font(options);
  svgs2font.create();
}

create();


