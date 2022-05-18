import { EggPlugin } from 'egg';
export default {
  static: false,
  nunjucks: {
    enable: true,
    package: 'egg-view-nunjucks',
  },
} as EggPlugin;
