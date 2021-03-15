# react-cli

一个播种前端创建react模板的命令 (v1.2.1)

## 使用方法

```bash
# 默认最新代码
npm install -g https://github.com/BozhongFE/react-cli
# tag 形式安装
npm install -g https://github.com/BozhongFE/react-cli/#v1.2.1
react-cli <command> [options]
```

## 命令列表

```bash
react-cli init [项目名称]
```

## 支持类型

+ Router
+ Router History Mode
+ Less
+ Redux
+ Source 打包到 source 版本库 (选项 source, poco, not use)

## react-cli 开发版本日志
|#|版本号|日期|版本内容|
|---|---|---|---|
|#|1.0.0|2020111| v1.0.0 发布
|#|1.1.0|20210107| v1.1.0 增加history路由模式
|#|1.2.0|20210125| v1.2.0 source选项更改
|#|1.2.1|20210125| v1.2.1 更正模板下载地址


## react-template 开发版本日志
|#|日期|版本内容|
|---|---|---|
|#|2020111| v1.0.0 发布
|#|20201201| 更改less配置
|#|20201209| 修复模板引用文件无法使用相对路径
|#|20201209| postcss使用，fix poco域名问题
|#|20210106| routerHistoryMode
|#|20210118| vconsole使用，poco delete bzconfig，fix router选项 bug
|#|20210122| 支持ts可选链写法，babel升级为7版本
|#|20210125| cli source选项模板处理
|#|20210207| 使用 uglifyjs-webpack-plugin clean-webpack-plugin
|#|20210218| 使用 HardSourceWebpackPlugin，支持css module

## react-template 使用说明

### css module
- 创建css/less文件，需在tsx文件dom中使用才会自动生成对应的.d.ts文件
- 如遇已经生成了.d.ts文件，页面eslint报错无法找到模块，请尝试修改dom后再保存刷新