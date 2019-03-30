const program = require('commander');
const pkg = require('./package.json');
const Iconfont = require('./index');

// todo 参数及说明
program
  .version(pkg.version)
  .option('')
  .parse(process.argv);

// todo 插入配置
const iconfont = new Iconfont({

});
