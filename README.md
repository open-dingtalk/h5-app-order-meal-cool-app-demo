# 订餐卡片 demo

本应用是基于内部订餐应用的一个简化和重写的 Demo，去除了数据库操作以及一些额外的业务逻辑，只保留了订餐流程的最小闭环。开发者可通过此仓库接触和了解开发酷应用的相关知识。

## 研发环境准备

1. 需要有一个钉钉注册企业，如果没有可以创建：https://oa.dingtalk.com/register_new.htm#/

2. 成为钉钉开发者，参考文档：https://developers.dingtalk.com/document/app/become-a-dingtalk-developer

3. 登录钉钉开放平台后台创建一个H5应用： https://open-dev.dingtalk.com/#/index

4. 配置应用

   配置开发管理，参考文档：https://developers.dingtalk.com/document/app/configure-orgapp

    - **此处配置“应用首页地址”需公网地址，若无公网ip，可使用钉钉内网穿透工具：**

      https://developers.dingtalk.com/document/resourcedownload/http-intranet-penetration

![image-20210706171740868](https://img.alicdn.com/imgextra/i4/O1CN01C9ta8k1L3KzzYEPiH_!!6000000001243-2-tps-953-517.png)

配置相关权限：https://developers.dingtalk.com/document/app/address-book-permissions

本demo使用接口相关权限：

- 成员信息读权限
- chat相关接口的管理权限
- chat相关接口的读取权限
- 企业内机器人发送消息权限

## demo应用配置

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
   
进入开发者后台-应用开发-企业内部开发-点击进入应用-基础信息-获取appKey、appSecret

2. frontEndHost
   启动前端应用后， 服务默认会启动在 127.0.0.1:9000 端口， frontEndHost 可以填写成 127.0.0.1:9000

3. callbackUrl
   卡片的回调地址， 启动后端应用后， 服务默认会启动在 127.0.0.1:7002 端口， callbackUrl 可以填写成 http://127.0.0.1:7002/api/demo/callback

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

## 启动

本项目分为前后端两个项目， 需要分别启动两个项目

```
.
├── back-end # 后端项目，nodejs构建
└── front-end # 前端项目，typescript构建

前后端安装依赖：npm install
后端启动命令：npm run dev
前端启动命令：npm run start
```


## 酷应用相关配置：（必要步骤）

在以下配置中，我们需要使用此应用的首页地址，应用首页地址配置参考文档：https://developers.dingtalk.com/document/app/configure-orgapp

接下来以首页地址为："http://my-card-demo.vaiwan.cn" 进行举例

1. 配置群机器人，参考文档：https://open.dingtalk.com/document/org/configure-push-settings
   
   此处群机器人，图标、名称和消息接收地址可自行定义，创建成功后可获得robotcode，robotcode会和appkey一致。
   
2. 配置群应用和群入口，参考文档：https://open.dingtalk.com/document/org/configure-the-basic-information-of-the-group-application

   此应用需配置一个群入口：在线订餐。头像和名称可自行定义，链接配置请参考下方

桌面端：
dingtalk://dingtalkclient/page/link?url=http%3A%2F%2Fmy-card-demo.vaiwan.cn%2Fcard-demo%2Fsend%3FopenConversationId%3D$DOUBLE_ENCCID$&pc_slide=true

移动端：
dingtalk://dingtalkclient/action/im_open_hybrid_panel?panelHeight=percent60&hybridType=online&pageUrl=http%3A%2F%2Fmy-card-demo.vaiwan.cn%2Fcard-demo%2Fsend%3FopenConversationId%3D$DOUBLE_ENCCID$

## 页面展示

机器人和群入口：

![](https://img.alicdn.com/imgextra/i4/O1CN01qwn2U01iHIIWZArfy_!!6000000004387-0-tps-810-1800.jpg)

订餐页面：

![](https://img.alicdn.com/imgextra/i4/O1CN01GbjDUM1gKNjaxuknK_!!6000000004123-0-tps-1080-2400.jpg)

订餐交互卡片：

![](https://img.alicdn.com/imgextra/i4/O1CN01n3nD0x2AAhqGLwtLv_!!6000000008163-0-tps-810-1800.jpg)


## 参考文档

获取token：https://open.dingtalk.com/document/orgapp-server/obtain-orgapp-token

chat相关： https://open.dingtalk.com/document/group/robots-send-interactive-cards

获取用户信息：https://open.dingtalk.com/document/orgapp-server/query-user-details



