#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const program = require('commander');

const pkg = require('./package.json');
const Iconfont = require('./index');

// todo 参数及说明
program
  .version(pkg.version)
  .option('-n, --fontName [fontName]', 'fontFamily name in css, default: iconfont')
  .option('-f --fontFileName [fontFileName]', 'filename of output file, default: iconfont')
  .option('-p --cssPrefix [cssPrefix]', 'css classname prefix, default: icon')
  .option('-C --className [className]', 'classname of common class for icon, default: iconfont')
  .option('-d --destDir [destDir]', 'the dest directory of output file, default: fonts')
  .option('-s --svgsPath [svgsPath]', 'the svgs source directory, default: svgs')
  .option('-u --startUnicode [startUnicode]', 'the start unicode of icons, default: \uE600')
  .option('-dm --isCreateDemo [isCreateDemo]', 'is create demo, default: true')
  .option('-c --configFile [configFile]', 'an config file to config')
  .parse(process.argv);

async function create () {
  let fileOpt = {};

  if (program.configFile) {
    const filePath = path.resolve(process.cwd(), program.configFile); // 相对于执行命令的目录
    fileOpt = require(filePath);
  }

  console.log(1, program.destDir);

  let options = {
    fontName: program.fontName || fileOpt.fontName,
    fontFileName: program.fontFileName || fileOpt.fontFileName,
    cssPrefix: program.cssPrefix || fileOpt.cssPrefix,
    className: program.className || fileOpt.className,
    destDir: program.destDir || fileOpt.destDir,
    svgsPath: program.svgsPath || fileOpt.svgsPath,
    startUnicode: program.startUnicode || fileOpt.startUnicode,
    isCreateDemo: program.isCreateDemo || fileOpt.isCreateDemo
  };

  console.log(options);

  const iconfont = new Iconfont(options);
  iconfont.create();
}

create();


