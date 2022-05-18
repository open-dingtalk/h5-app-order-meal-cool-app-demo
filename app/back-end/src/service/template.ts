import { Provide, Inject, Config } from '@midwayjs/decorator';
import { Context } from 'egg';
import { CardInfo } from './cardStore';
import { DefaultConfig } from '../config/config.default';

export const ORDER_STATUS = {
  opening: 0,
  completed: 1,
};

export const CALLBACK_TYPE = {
  LOCATION: 'select_1647330167899',
  MENU: 'select_1647330112516',
  ORDER: 'button_1647330333211',
  LIKE: 'button_1652081961181',
  DISLIKE: 'button_1652081961190',
};

export const SECTION_TYPE = {
  MENU: 'section_1651656851297',
  LOCATION: 'section_1651656851307',
  ORDER: 'action_1651656851297',
};

export const DEFAULT_AVATAR = '@lALPDsekDPtyqYrMyMzI';

export const LIKE_ICON = '@lALPDtJMiOlXqC3MyMzI';
export const LIKED_ICON = '@lALPDsQWjlZCM_3MyMzI';

export const DISLIKE_ICON = '@lALPDtJMiOmduYLMyMzI';
export const DISLIKED_ICON = '@lALPDs6_CkQ-fRXMyMzI';

export const MENU = [
  {
    value: '1',
    name: '🐔 鸡肉',
  },
  {
    value: '2',
    name: '🥩 牛肉',
  },
];

@Provide()
export class TemplateService {
  @Inject()
  ctx: Context;

  @Config('demo')
  demo: DefaultConfig['demo'];

  genCardData = (options: CardInfo) => {
    const card = {
      config: {
        autoLayout: true,
        enableForward: false,
      },
      header: {
        title: {
          type: 'text',
          text: '订餐',
          color: 'common_green1_color',
        },
        logo: '@lALPDrz7jNRJdJE4OA',
      },
      contents: [],
    };

    // banner 图
    card.contents.push({
      type: 'image',
      image: '@lALPDfYH0aWc_a3NAljNAyA',
      ratio: '16:9',
      id: 'image_1651656851296',
    });

    // 标题部分
    card.contents.push({
      type: 'section',
      fields: {
        list: [
          {
            type: 'text',
            text: options.title,
            id: 'text_1651753061097',
          },
        ],
      },
      id: 'section_1651753061097',
    });

    card.contents.push({
      type: 'markdown',
      text: '套餐内容：*西兰花、胡萝卜、鸡蛋、荞麦面、玉米、莴笋、紫薯*',
      id: 'markdown_1651656851296',
    });

    card.contents.push({
      type: 'markdown',
      text: `<font color=common_level3_base_color>订餐截止时间${options.deadline}</font>`,
      id: 'markdown_1651656851411',
    });

    if (options.status === ORDER_STATUS.opening) {
      // 主菜
      card.contents.push({
        type: 'section',
        content: {
          type: 'text',
          text: '主菜选择：',
          id: 'text_1651656851296',
        },
        extra: {
          type: 'select',
          options: MENU.map(item => ({
            label: {
              type: 'text',
              text: item.name,
            },
            value: item.value,
          })),
          placeholder: {
            type: 'text',
            text: '请选择',
            id: 'text_1651656851372',
          },
          id: CALLBACK_TYPE.MENU,
        },
        id: SECTION_TYPE.MENU,
      });

      // 取餐位置
      card.contents.push({
        type: 'section',
        content: {
          type: 'text',
          text: '取餐地点：',
          id: 'text_1651656851376',
        },
        extra: {
          type: 'select',
          options: [
            {
              label: {
                type: 'text',
                text: '5号楼取餐点',
                id: 'text_1651656851301',
              },
              value: '1',
            },
            {
              label: {
                type: 'text',
                text: '10号楼取餐点',
                id: 'text_1651656851334',
              },
              value: '2',
            },
            {
              label: {
                type: 'text',
                text: '餐厅服务台',
                id: 'text_1651656851298',
              },
              value: '3',
            },
          ],
          placeholder: {
            type: 'text',
            text: '请选择',
            id: 'text_1651656851390',
          },
          id: CALLBACK_TYPE.LOCATION,
        },
        id: SECTION_TYPE.LOCATION,
      });

      // 预定
      if (options.maximum > options.order.allId.length) {
        card.contents.push({
          type: 'action',
          actions: [
            {
              type: 'button',
              label: {
                type: 'text',
                text: '一键预定',
                id: 'text_1651656851370',
              },
              actionType: 'request',
              status: 'primary',
              id: CALLBACK_TYPE.ORDER,
            },
          ],
          id: SECTION_TYPE.ORDER,
        });
      }
    }

    card.contents.push({
      type: 'divider',
      id: 'divider_1651656851297',
    });

    card.contents.push({
      type: 'markdown',
      text: `**健康餐已预定：${options.order.allId.length}/${options.maximum} 份**`,
      id: 'markdown_1651656851297',
    });

    options.order.allId
      .slice()
      .reverse()
      .slice(0, 5)
      .forEach(uid => {
        const order = options.order.byId[uid];
        const menu = MENU[order.menu] || MENU[0];
        card.contents.push({
          type: 'markdown',
          text: `<font color=common_level3_base_color>${
            order.profile?.name || uid
          } ${menu.name}套餐</font>`,
          icon: order.profile?.avatar || DEFAULT_AVATAR,
          id: 'markdown_1651656851311',
        });
      });

    if (options.status === ORDER_STATUS.completed) {
      card.contents.push(
        {
          type: 'divider',
          id: 'divider_1652081918795',
        },
        {
          type: 'text',
          text: '您对这次的订餐满意吗？',
          id: 'text_1652081920011',
        },
        {
          type: 'action',
          actions: [
            {
              type: 'button',
              label: {
                type: 'text',
                text: `满意（${options.like.allId.length}）`,
                id: 'text_1652081961181',
              },
              icon: LIKE_ICON,
              actionType: 'request',
              status: 'primary',
              id: CALLBACK_TYPE.LIKE,
            },
            {
              type: 'button',
              label: {
                type: 'text',
                text: `不满意（${options.dislike.allId.length}）`,
                id: 'text_1652081961231',
              },
              actionType: 'request',
              icon: DISLIKE_ICON,
              status: 'warning',
              id: CALLBACK_TYPE.DISLIKE,
            },
          ],
          id: 'action_1652081961181',
        }
      );
    }
    return card;
  };
}
