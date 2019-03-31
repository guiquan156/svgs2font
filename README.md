# iconfont


### Install
```
[sudo] npm install -g svgs2font
```

### CLI

#### usage
```
  svgs2font --configFile iconfont.config.js
```

#### iconfont.config.js

```js
module.exports = {
  destDir: 'test/fonts/dest1', // output directory, default: fonts
  svgsPath: 'test/svgs', // svgs source, default: svgs
  fontName: 'fontName', // font family name, default: iconfont
  cssPrefix: 'cssPrefix', // css class prefix, default: icon
  className: 'className', // common class name, default: iconfont
  fontFileName: 'fontFileName', // output file name, default: iconfont
  iconInfos: { // the info of icons, default: {}
    'Dollar2': {
      unicode: '\uE002', // specify the unicode of icon
      name: 'dollar2', // icon name, default: svg files name
      title: '美元' // icon title, it will show in demo, default: icon name
    },
    'check-circle': {
      unicode: '\uE013',
      name: 'checkCircle',
      title: '检查圆形'
    }
  }
}
```

#### other options

use ```svgs2font -h``` to show all options;

```
  -V  --version                      output the version number
  -n  --fontName [fontName]          fontFamily name in css, default: iconfont
  -f  --fontFileName [fontFileName]   filename of output file, default: iconfont
  -p  --cssPrefix [cssPrefix]         css classname prefix, default: icon
  -C  --className [className]         classname of common class for icon, default: iconfont
  -d  --destDir [destDir]             the dest directory of output file, default: fonts
  -s  --svgsPath [svgsPath]           the svgs source directory, default: svgs
  -u  --startUnicode [startUnicode]   the start unicode of icons, default: 
  -dm --isCreateDemo [isCreateDemo]  is create demo, default: true
  -c  --configFile [configFile]       an config file to config
  -h  --help                         output usage information
```

### use in node

```
const Svgs2font = require('svgs2font');
const options = {}; // same with the exports of iconfont.config.js
const svgs2font = new Svg2font(options);
svgs2font.create();
```
