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

The [svgicons2svgfont](https://github.com/nfroidure/svgicons2svgfont#svgicons2svgfontoptions) are available:

- options.fontName (required)
- options.fontWeight
- options.fontStyle
- options.fixedWidth
- options.centerHorizontally
- options.normalize
- options.fontHeight
- options.round
- options.descent
- options.metadata
- options.log


#### other options

use ```svgs2font -h``` to show all options;

```
  -V  --version                      output the version number
  -f  --fontName [fontName]', 'fontFamily name in css, default: iconfont
  -F  --fontFileName [fontFileName]', 'filename of output file, default: iconfont
  -p  --cssPrefix [cssPrefix]', 'css classname prefix, default: icon
  -C  --className [className]', 'classname of common class for icon, default: iconfont
  -o  --output [output]', 'the dest directory of output file, default: fonts
  -s  --svgsPath [svgsPath]', 'the svgs source directory, default: svgs
  -u  --startUnicode [startUnicode]', 'the start unicode of icons, default: \uE600
  -dm --isCreateDemo [isCreateDemo]', 'is create demo, default: true
  -c  --configFile [configFile]', 'an config file to config
  -i  --fontId [value]', 'the font id you want [fontname]
  -st --style [value]', 'the font style you want
  -we --weight [value]', 'the font weight you want
  -w  --fixedWidth', 'creates a monospace font of the width of the largest input icon
  -ch --centerhorizontally', 'calculate the bounds of a glyph and center it horizontally
  -n  --normalize', 'normalize icons by scaling them to the height of the highest icon
  -h  --height [value]', 'the output font height [MAX(icons.height)] (icons will be scaled so the highest has this height)
  -r  --round [value]', 'setup the SVG path rounding [10e12]
  -d  --descent [value]', 'the font descent [0]
  -a  --ascent [value]', 'the font ascent [height - descent]
  -a  --prependUnicode', 'prefix files with their automatically allocated unicode code point
  -m  --metadata', 'content of the metadata tag
```

### use in node

```
const Svgs2font = require('svgs2font');
const options = {}; // same with the exports of iconfont.config.js
const svgs2font = new Svg2font(options);
svgs2font.create();
```
