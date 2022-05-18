import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;
  /**
   * 这里加入这段是因为 egg 默认的安全策略，在 post 请求的时候如果不传递 token 会返回 403
   * 由于大部分新手用户不太了解这个机制，所以在本地和单测环境做了默认处理
   * 请注意，线上环境依旧会有该错误，需要手动开启
   * 如果想了解更多细节，请访问 https://eggjs.org/zh-cn/core/security.html#安全威胁-csrf-的防范
   */
  config.security = {
    csrf: false,
    // domainWhiteList: ['daily-login.dingtalk.test'],
  };

  config.demo = {
    appKey: `dingehqxoqour9kgyngk`,
    appSecret: `HAjqQph0t-_yfeX_bi0SxtLc77ahnO2Z8pz5yUHBD5FG63h_V_NMNSpHqvyICKiz`,
    frontEndHost: `my-card-demo-fe.vaiwan.cn`,
    callbackUrl: `http://my-card-demo.vaiwan.cn/api/demo/callback`,
  };

  return config;
};
