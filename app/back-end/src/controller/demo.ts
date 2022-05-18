import {
  Inject,
  Controller,
  Provide,
  Post,
  Body,
  ALL,
} from '@midwayjs/decorator';
import { Context } from 'egg';
import { DemoService, SendCardRequset } from '../service/demo';

@Provide()
@Controller('/api/demo')
export class CardDemoController {
  @Inject()
  ctx: Context;

  @Inject()
  demoService: DemoService;

  @Post('/sendCard')
  async save(@Body(ALL) body: SendCardRequset): Promise<any> {
    return this.demoService.sendCard(body);
  }

  @Post('/callback')
  async postCallback(@Body(ALL) body): Promise<any> {
    console.log(JSON.stringify(body));
    const result = await this.demoService.handleCallback(body);
    return result;
  }
}
