## 启动项目

``` bash
npm start
```

## 使用安装酷应用到群功能
首先，访问钉钉开发者后台 https://open-dev.dingtalk.com/ 将你组织的 CorpId 填到 app/front-end/src/services/config.ts 的 corpId

接着，在钉钉开发者后台的「应用开发」找到你想要安装的应用，将酷应用归属的应用标识、酷应用编码分别填到 app/front-end/src/services/config.ts 的 clientId 和 coolAppCode

最后执行 `npm start` 启动项目，在钉钉移动端访问 http://[你的ip]:9000 即可体验安装酷应用到群功能