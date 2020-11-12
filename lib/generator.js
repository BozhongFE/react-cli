const minimatch = require('minimatch');
const Metalsmith = require('metalsmith');
const Handlebars = require('handlebars');
const rm = require('rimraf').sync;
const fs = require('fs');
const path = require('path');

module.exports = function (metadata = {}, src, dest = '.') {
  if (!src) {
    return Promise.reject(new Error(`无效的source：${src}`));
  }

  return new Promise((resolve, reject) => {
    const metalsmith = Metalsmith(process.cwd())
      .metadata(metadata)
      .clean(false)
      .source(src)
      .destination(dest);

    // 判断下载的项目模板中是否有templates.ignore
    const ignoreFile = path.join(src, 'templates.ignore');

    if (fs.existsSync(ignoreFile)) {
      // 定义一个用于移除模板中被忽略文件的metalsmith插件
      metalsmith.use((files, metalsmith, done) => {
        const meta = metalsmith.metadata();
        // 先对ignore文件进行渲染，然后按行切割ignore文件的内容，拿到被忽略清单

        const ignoreText = Handlebars.compile(
          fs.readFileSync(ignoreFile).toString()
        )(meta);
        const ignoretxt = ignoreText.replace(/\n|\s|,$/g, '');
        const ignoreConfigs = JSON.parse(`[${ignoretxt}]`);
        ignoreConfigs.forEach((ignoreConf) => {
          ignoreConf.forEach((ignore) => {
            const { path: url, type } = ignore;
            if (type === 'write') {
              Handlebars.compile(
                fs.readFileSync(path.join(src, url)).toString()
              )(meta);
            }
            if (type === 'delete') {
              const isFile = /\.[a-zA-Z]+/.test(url);
              const filePaths = [];
              if (isFile) {
                filePaths.push(url);
              } else {
                (function getFiles(url) {
                  const list = fs.readdirSync(src + url);
                  list.forEach((file) => {
                    const filePath = `${url}/${file}`;
                    const isDir = fs.statSync(src + filePath).isDirectory();
                    isDir ? getFiles(filePath) : filePaths.push(filePath);
                  });
                })(url);
              }

              Object.keys(files).forEach((fileName) => {
                filePaths.forEach((ignorePattern) => {
                  if (minimatch(fileName, ignorePattern.substring(1))) {
                    delete files[fileName];
                  }
                });
              });
            }
          });
        });
        done();
      });
    }

    metalsmith
      .use((files, metalsmith, done) => {
        const meta = metalsmith.metadata();
        Object.keys(files).forEach((fileName) => {
          const t = files[fileName].contents.toString();
          files[fileName].contents = Buffer.from(Handlebars.compile(t)(meta));
        });
        done();
      })
      .build((err) => {
        rm(src);
        err ? reject(err) : resolve({ dest });
      });
  });
};
