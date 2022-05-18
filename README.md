# 订餐卡片 demo

本应用是基于内部订餐应用的一个简化和重写的 Demo，去除了数据库操作以及一些额外的业务逻辑，只保留了订餐流程的最小闭环。开发者可通过此仓库接触和了解开发酷应用的相关知识。

# 开发

## 启动

本项目分为前后端两个项目， 需要分别启动两个项目

```
.
├── back-end # 后端项目
└── front-end # 前端项目
```

## 应用配置

启动后端应用需要配置以下内容

```ts
// app/back-end/src/config/config.local.ts

config.demo = {
  appKey: '填写你的appKey',
  appSecret: '填写你的appSecret',
  frontEndHost: '填写前端资源host',
  callbackUrl: '填写用户点击卡片的回调地址',
};

```

1. appKey 和 appSecret 
调用服务端API获取应用资源时，需要通过access_token来鉴权调用者身份进行授权。我们需要通过 AppKey 和 AppSecret 来获取企业内部应用的 access_token：https://open.dingtalk.com/document/orgapp-server/obtain-orgapp-token

根据以上文档， 我们可以获取到应用的 appKey 和 appSecret 

2. frontEndHost
启动前端应用后， 服务默认会启动在 127.0.0.1:9000 端口， frontEndHost 可以填写成 127.0.0.1:9000

3. callbackUrl
卡片的回调地址， 启动后端应用后， 服务默认会启动在 127.0.0.1:7002 端口， callbackUrl 可以填写成 http://127.0.0.1:7002/api/demo/callback

## 接口权限
调用服务端接口前需要申请权限。开发者可以在开发者后台的权限管理模块中申请对应的权限

获取token：https://open.dingtalk.com/document/orgapp-server/obtain-orgapp-token
chat相关： https://open.dingtalk.com/document/group/robots-send-interactive-cards
获取用户信息：https://open.dingtalk.com/document/orgapp-server/query-user-details

## 内网穿透

由于卡片回调需要一个公网能访问的地址， 所以为了在能在本地开发时调试回调接口， 可以配置一下内网穿透

具体文档可见：https://open.dingtalk.com/document/resourcedownload/http-intranet-penetration

服务端映射：./ding -config=./ding.cfg -subdomain={服务端域名} 7002

前端资源映射：./ding -config=./ding.cfg -subdomain={前端域名} 9000

完成后需要替换应用的配置

例子：
```
./ding -config=./ding.cfg -subdomain=my-card-demo 7002

./ding -config=./ding.cfg -subdomain=my-card-demo-fe 9000

frontEndHost: my-card-demo-fe.vaiwan.com

callbackUrl: http://my-card-demo.vaiwan.com/api/demo/callback

```

然后在酷应用群扩展中配置对应链接, 将应用安装到群中

桌面端：
dingtalk://dingtalkclient/page/link?url=http%3A%2F%2Fmy-card-demo.vaiwan.com%2Fcard-demo%2Fsend%3FopenConversationId%3D$DOUBLE_ENCCID$&pc_slide=true

移动端：
dingtalk://dingtalkclient/action/im_open_hybrid_panel?panelHeight=percent60&hybridType=online&pageUrl=http%3A%2F%2Fmy-card-demo.vaiwan.com%2Fcard-demo%2Fsend%3FopenConversationId%3D$DOUBLE_ENCCID$

