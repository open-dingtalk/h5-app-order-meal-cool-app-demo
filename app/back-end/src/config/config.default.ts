import { EggAppConfig, EggAppInfo, PowerPartial } from 'egg';

export type DefaultConfig = PowerPartial<EggAppConfig>;

export default (appInfo: EggAppInfo) => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security

  // add your config here

  config.midwayFeature = {
    // true 代表使用 midway logger
    // false 或者为空代表使用 egg-logger
    replaceEggLogger: true,
  };

  config.view = {
    mapping: {
      '.nj': 'nunjucks',
    },
    defaultViewEngine: 'nunjucks',
  };

  config.apiHost = 'https://api.dingtalk.com';

  return config;
};
