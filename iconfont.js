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
  .option('-c --className [className]', 'classname of common class for icon, default: iconfont')
  .option('-d --destDir [destDir]', 'the dest directory of output file, default: fonts')
  .option('-s --svgsPath [svgsPath]', 'the svgs source directory, default: svgs')
  .option('-u --startUnicode [startUnicode]', 'the start unicode of icons, default: \uE600')
  .option('-dm --isCreateDemo [isCreateDemo]', 'is create demo, default: true')
  .option('-o --optionsFile [optionsFile]', 'an options file to config')
  .parse(process.argv);

async function create () {
  let fileOpt = {};
  let options = {
    fontName: program.fontName,
    fontFileName: program.fontFileName,
    cssPrefix: program.cssPrefix,
    className: program.className,
    destDir: program.destDir,
    svgsPath: program.svgsPath,
    startUnicode: program.startUnicode,
    isCreateDemo: program.isCreateDemo
  };

  if (program.optionsFile) {
    const filePath = path.resolve(process.cwd(), program.optionsFile); // 相对于执行命令的目录
    fileOpt = require(filePath);
    options = {
      ...fileOpt,
      ...options // 命令行的优先级较高
    };
  }

  console.log(options)

  const iconfont = new Iconfont(options);
  iconfont.create();
}

create();


