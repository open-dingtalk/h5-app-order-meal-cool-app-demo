import { Provide, Inject, Config } from '@midwayjs/decorator';
import { Context } from 'egg';
import { DefaultConfig } from '../config/config.default';
import axios from 'axios';
import { CardStoreService, CardInfo } from './cardStore';
import {
  TemplateService,
  CALLBACK_TYPE,
  SECTION_TYPE,
  DISLIKED_ICON,
  DISLIKE_ICON,
  LIKED_ICON,
  LIKE_ICON,
} from './template';

export interface SendCardRequset {
  title: string;
  deadline: string;
  maximum: number;
  openConversationId: string;
}

interface ICardPrivateData {
  outTrackId: string;
  corpId: string;
  value: string;
  userId: string;
}

interface ICardPrivateDataValue {
  cardPrivateData: {
    actionIds: string[];
    params: {
      [key: string]: {
        index: number;
        value: string;
      };
    } & {
      type: 'select';
    };
  };
}

@Provide()
export class DemoService {
  @Inject()
  ctx: Context;

  @Config('demo')
  demo: DefaultConfig['demo'];

  @Config('apiHost')
  apiHost: string;

  @Inject()
  templateService: TemplateService;

  @Inject()
  cardStoreService: CardStoreService;

  async handleCallback(request: ICardPrivateData) {
    // 回调的相关上下文
    const data: ICardPrivateDataValue = JSON.parse(request.value);

    // 根据 outTrackId 从 DB 里面取对应的卡片数据
    const cardInfo = await this.cardStoreService.getCardInfo(
      request.outTrackId // cardBizId
    );

    // data 为用户所触发的动作相关上下文。其中 data.cardPrivateData.actionIds[0] 为具体触发交互的组件 ID
    const actionId = data.cardPrivateData.actionIds[0];

    // 如果当前的动作是修改取餐地点，则处理取餐地点的相关逻辑，并返回最新数据
    if (actionId === CALLBACK_TYPE.LOCATION) {
      // 对于修改取餐地点的动作，data.cardPrivateData.params 会包含当前所选中的最新取餐地点，
      // 数据格式为 { [componentId]: { index: number } }
      // 需要通过 componentId 来取到对应的数据，在这里 componentId 则是 actionId
      return this.handleSelectLocation(
        request.outTrackId,
        cardInfo,
        request.userId,
        data.cardPrivateData.params[actionId]
      );
    }

    // 如果当前的动作是修改菜品，则处理菜品的相关逻辑，并返回最新数据
    if (actionId === CALLBACK_TYPE.MENU) {
      // 对于修改菜品的动作，data.cardPrivateData.params 会包含当前所选中的最新菜品，
      // 数据格式为 { [componentId]: { index: number } }
      // 需要通过 componentId 来取到对应的数据，在这里 componentId 则是 actionId
      return this.handleSelectDishes(
        request.outTrackId,
        cardInfo,
        request.userId,
        data.cardPrivateData.params[actionId]
      );
    }

    // 如果当前的动作是提交订餐，则处理订餐的相关逻辑，并返回最新数据
    if (actionId === CALLBACK_TYPE.ORDER) {
      return this.handleSubmitOrder(
        request.outTrackId,
        cardInfo,
        request.userId
      );
    }

    // 如果当前的动作是给餐厅点赞，则处理点赞的逻辑，并返回最新数据
    if (actionId === CALLBACK_TYPE.LIKE) {
      return this.handleLike(request.outTrackId, cardInfo, request.userId);
    }

    // 如果当前的动作是给餐厅点踩，则处理点踩的逻辑，并返回最新数据
    if (actionId === CALLBACK_TYPE.DISLIKE) {
      return this.handleDislike(request.outTrackId, cardInfo, request.userId);
    }
  }

  // 处理提交订餐
  async handleSubmitOrder(
    outTrackId: string,
    cardInfo: CardInfo,
    userId: string
  ) {
    // 更新 DB 数据，记录当前用户的订餐信息
    const newCardInfo = await this.cardStoreService.orderMenu(cardInfo, userId);

    // 对于订餐成功的用户，在界面上直接隐藏订餐选项相关的内容，防止二次下单
    // 隐藏卡片上的内容目前可以通过 deleteMap 来实现，通过 componentId 的维度
    // 来隐藏组件。当值为 1 时表示隐藏，非1时表示不隐藏
    const deleteMap = {
      [SECTION_TYPE.LOCATION]: 1,
      [SECTION_TYPE.MENU]: 1,
      [SECTION_TYPE.ORDER]: 1,
      [CALLBACK_TYPE.ORDER]: 1,
    };

    // 由于订餐数量发生变化，需要更新 cardData 里面的订餐数量等数据，这里
    // 根据最新的数据生成最新的卡片模板 JSON 结构
    const newCardData = JSON.stringify(
      this.templateService.genCardData(newCardInfo)
    );

    // 除了需要在回调里面返回最新数据之外，还需要同时更新卡片数据，让所有人看到的数据都是最新的
    this.updateCard(outTrackId, newCardData);

    return {
      outTrackId: outTrackId,
      cardOptions: {
        updatePrivateDataByKey: true,
        updateCardDataByKey: true,
      },
      cardData: {
        cardParamMap: {
          sys_full_json_obj: newCardData,
        },
      },
      userPrivateData: {
        cardParamMap: {
          sys_full_json_obj: JSON.stringify({
            deleteMap: deleteMap,
          }),
        },
      },
    };
  }

  // 处理选择菜品
  async handleSelectDishes(
    outTrackId: string,
    cardInfo: CardInfo,
    userId: string,
    params: { index: number }
  ) {
    // 更新 DB 数据，记录当前用户的最新菜品
    const newCardInfo = await this.cardStoreService.updateMenu(
      cardInfo,
      userId,
      params.index
    );

    // replaceMap 用来更新卡片上某些组件的内容，这里是用来更新菜品所选中的选项
    const replaceMap = {
      [CALLBACK_TYPE.MENU]: {
        currentIndex: params.index,
      },
    };

    // 如果当前用户已经有设置过取餐地点的话，那这时候也需要把之前选择的餐品选项同时返回回去
    if (typeof newCardInfo.order.byId[userId]?.location !== 'undefined') {
      replaceMap[CALLBACK_TYPE.LOCATION] = {
        currentIndex: newCardInfo.order.byId[userId].location,
      };
    }

    // 在回调里面返回最新的卡片数据，这时候就能完成卡片界面的更新
    return {
      outTrackId: outTrackId,
      cardOptions: {
        updatePrivateDataByKey: true,
        updateCardDataByKey: true,
      },
      // 当前操作没有更新 cardData ，所以这里不用传相关字段
      cardData: {
        cardParamMap: {},
      },
      // 针对当前用户设置用户的私有数据
      userPrivateData: {
        cardParamMap: {
          // 目前对于非字符串类型的数据，都需要放到 sys_full_json_obj 字段内。因此 replaceMap 需要放到这里
          sys_full_json_obj: JSON.stringify({
            replaceMap: replaceMap,
          }),
        },
      },
    };
  }

  // 处理选择取餐地点
  async handleSelectLocation(
    outTrackId: string,
    cardInfo: CardInfo,
    userId: string,
    params: { index: number }
  ) {
    // 更新 DB 数据，记录当前用户的最新取餐地点
    const newCardInfo = await this.cardStoreService.updateLocation(
      cardInfo,
      userId,
      params.index
    );

    // replaceMap 用来更新卡片上某些组件的内容，这里是用来更新取餐地点所选中的选项
    const replaceMap = {
      [CALLBACK_TYPE.LOCATION]: {
        currentIndex: params.index,
      },
    };

    // 如果当前用户已经有设置过餐品的话，那这时候也需要把之前选择的餐品选项同时返回回去
    if (typeof newCardInfo.order.byId[userId]?.menu !== 'undefined') {
      replaceMap[CALLBACK_TYPE.MENU] = {
        currentIndex: newCardInfo.order.byId[userId].menu,
      };
    }

    // 在回调里面返回最新的卡片数据，这时候就能完成卡片界面的更新
    return {
      outTrackId: outTrackId,
      cardOptions: {
        updatePrivateDataByKey: true,
        updateCardDataByKey: true,
      },
      // 当前操作没有更新 cardData ，所以这里不用传相关字段
      cardData: {
        cardParamMap: {},
      },
      // 针对当前用户设置用户的私有数据
      userPrivateData: {
        cardParamMap: {
          // 目前对于非字符串类型的数据，都需要放到 sys_full_json_obj 字段内。因此 replaceMap 需要放到这里
          sys_full_json_obj: JSON.stringify({
            replaceMap: replaceMap,
          }),
        },
      },
    };
  }

  async handleLike(outTrackId: string, cardInfo: CardInfo, userId: string) {
    // 更新 DB 的点赞数据
    const newCardInfo = await this.cardStoreService.updateLike(
      cardInfo,
      userId
    );

    // 由于点赞数量发生变化，需要更新 cardData 里面的数据，这里生成最新的卡片模板 JSON 结构
    const newCardData = JSON.stringify(
      this.templateService.genCardData(newCardInfo)
    );

    // 根据当前用户有没有点过按钮，来替换按钮上所要显示的 icon 。当用户未点过赞时，
    // 替换点赞按钮图标为“已点赞”，同时替换反对按钮图标为“未反对”
    const replaceMap = {
      [CALLBACK_TYPE.LIKE]: {
        icon: this.cardStoreService.isUserLike(newCardInfo, userId)
          ? LIKED_ICON
          : LIKE_ICON,
      },
      [CALLBACK_TYPE.DISLIKE]: {
        icon: this.cardStoreService.isUserDislike(newCardInfo, userId)
          ? DISLIKED_ICON
          : DISLIKE_ICON,
      },
    };

    // 除了需要在回调里面返回最新数据之外，还需要同时更新卡片数据，让所有人看到的数据都是最新的
    this.updateCard(outTrackId, newCardData);

    return {
      outTrackId: outTrackId,
      cardOptions: {
        updatePrivateDataByKey: true,
        updateCardDataByKey: true,
      },
      cardData: {
        cardParamMap: {
          sys_full_json_obj: newCardData,
        },
      },
      userPrivateData: {
        cardParamMap: {
          sys_full_json_obj: JSON.stringify({
            replaceMap: replaceMap,
          }),
        },
      },
    };
  }

  async handleDislike(outTrackId: string, cardInfo: CardInfo, userId: string) {
    // 更新 DB 的点赞数据
    const newCardInfo = await this.cardStoreService.updateDislike(
      cardInfo,
      userId
    );

    // 由于点赞数量发生变化，需要更新 cardData 里面的数据，这里生成最新的卡片模板 JSON 结构
    const newCardData = JSON.stringify(
      this.templateService.genCardData(newCardInfo)
    );

    // 为当前用户替换满意按钮图标为“已点赞”，同时替换不满意按钮图标为“未反对”
    const replaceMap = {
      [CALLBACK_TYPE.LIKE]: {
        icon: this.cardStoreService.isUserLike(newCardInfo, userId)
          ? LIKED_ICON
          : LIKE_ICON,
      },
      [CALLBACK_TYPE.DISLIKE]: {
        icon: this.cardStoreService.isUserDislike(newCardInfo, userId)
          ? DISLIKED_ICON
          : DISLIKE_ICON,
      },
    };

    // 除了需要在回调里面返回最新数据之外，还需要同时更新卡片数据，让所有人看到的数据都是最新的
    this.updateCard(outTrackId, newCardData);

    return {
      outTrackId: outTrackId,
      cardOptions: {
        updatePrivateDataByKey: true,
        updateCardDataByKey: true,
      },
      cardData: {
        cardParamMap: {
          sys_full_json_obj: newCardData,
        },
      },
      userPrivateData: {
        cardParamMap: {
          sys_full_json_obj: JSON.stringify({
            replaceMap: replaceMap,
          }),
        },
      },
    };
  }

  async updateCard(id: string, newCardData: any) {
    const cardInfo = await this.cardStoreService.getCardInfo(id);

    const access_token = await this.getToken();

    const data = {
      cardBizId: cardInfo.traceId,
      cardData: newCardData,
    };

    const result = await axios.put(
      `${this.apiHost}/v1.0/im/robots/interactiveCards`,
      data,
      {
        headers: {
          'x-acs-dingtalk-access-token': access_token,
        },
      }
    );

    return !!result;
  }

  async sendCard(request: SendCardRequset) {
    const cardInfo = await this.cardStoreService.saveCard(request);
    const access_token = await this.getToken();
    const body = {
      cardTemplateId: 'StandardCard',
      openConversationId: request.openConversationId,
      cardBizId: cardInfo.traceId,
      robotCode: 'dingehqxoqour9kgyngk',
      cardData: JSON.stringify(this.templateService.genCardData(cardInfo)),
      callbackUrl: this.demo.callbackUrl,
    };

    const result = await axios.post(
      `${this.apiHost}/v1.0/im/v1.0/robot/interactiveCards/send`,
      body,
      {
        headers: {
          'x-acs-dingtalk-access-token': access_token,
        },
      }
    );
    return !!result;
  }

  async getToken() {
    const res = await axios.get<{
      access_token: string;
    }>(
      `https://oapi.dingtalk.com/gettoken?appkey=${this.demo.appKey}&appsecret=${this.demo.appSecret}`
    );

    return res.data.access_token;
  }

  async getUserProfile(uid: string) {
    const access_token = await this.getToken();
    const result = await axios.post(
      `https://oapi.dingtalk.com/topapi/v2/user/get?access_token=${access_token}`,
      {
        language: 'zh_CN',
        userid: uid,
      },
      {
        headers: {
          'x-acs-dingtalk-access-token': access_token,
        },
      }
    );
    return result.data.result;
  }
}
