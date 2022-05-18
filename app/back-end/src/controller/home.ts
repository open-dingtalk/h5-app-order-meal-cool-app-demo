import { Controller, Get, Provide, Inject, App, Config } from '@midwayjs/decorator';
import { Context, Application } from 'egg';
import { DefaultConfig } from '../config/config.default';

@Provide()
@Controller('/')
export class HomeController {
  @Inject()
  ctx: Context;

  @Config('demo')
  demo: DefaultConfig['demo'];

  @App()
  app: Application;

  @Get('/')
  async index() {
    this.ctx.redirect('/card-demo/send');
  }

  @Get('/card-demo/*')
  async cardDemo() {
    await this.ctx.render('cardDemo.nj', {
      env: this.app.getEnv(),
      frontEndHost: this.demo.frontEndHost,
      icon: 'https://static.dingtalk.com/media/lALPDfYH2JPZxdbNBADNBAA_1024_1024.png',
    });
  }
}
