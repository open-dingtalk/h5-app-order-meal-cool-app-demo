import { Provide, Inject } from '@midwayjs/decorator';
import { Context } from 'egg';
import { DemoService } from './demo';

export interface SendCardRequset {
  title: string;
  deadline: string;
  maximum: number;
  openConversationId: string;
}

interface GenericeCollection<Key extends string, Value> {
  byId: Record<Key, Value>;
  allId: Key[];
}

export interface CardInfo extends SendCardRequset {
  traceId: string;
  status: typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
  order: GenericeCollection<
    string,
    {
      menu?: number;
      location?: number;
      profile?: {
        name: string;
        avatar: string;
      };
    }
  >;
  like: GenericeCollection<string, boolean>;
  dislike: GenericeCollection<string, boolean>;
}

const ORDER_STATUS = {
  opening: 0,
  completed: 1,
};

const cardStore = new Map<string, CardInfo>();

@Provide()
export class CardStoreService {
  @Inject()
  ctx: Context;

  @Inject()
  demoService: DemoService;

  saveCard = async (request: SendCardRequset) => {
    const traceId = `demo-${Date.now()}`;
    const card: CardInfo = Object.assign(
      {
        traceId,
        status: ORDER_STATUS.opening,
        order: {
          byId: {},
          allId: [],
        },
        like: {
          byId: {},
          allId: [],
        },
        dislike: {
          byId: {},
          allId: [],
        },
      },
      request
    );
    this.updateStatus(card);
    cardStore.set(traceId, card);
    return card;
  };

  async updateStatus(cache: CardInfo) {
    if (
      cache.status === ORDER_STATUS.opening &&
      (Date.now() > Date.parse(cache.deadline) ||
        cache.order.allId.length >= cache.maximum)
    ) {
      cache.status = ORDER_STATUS.completed;
    }
  }

  async updateLocation(cache: CardInfo, uid: string, value: number) {
    if (!cache.order.byId[uid]) {
      cache.order.byId[uid] = {};
    }
    cache.order.byId[uid].location = value;
    return cache;
  }
  async updateMenu(cache: CardInfo, uid: string, value: number) {
    if (!cache.order.byId[uid]) {
      cache.order.byId[uid] = {};
    }
    cache.order.byId[uid].menu = value;
    return cache;
  }
  async orderMenu(cache: CardInfo, uid: string) {
    if (cache.order.allId.includes(uid)) {
      throw Error('每个用户只能预定一份');
    }
    if (cache.order.allId.length >= cache.maximum) {
      throw Error('已售罄');
    }
    const profile = await this.demoService.getUserProfile(uid);
    cache.order.byId[uid] = Object.assign(cache.order.byId[uid] || {}, {
      profile,
    });
    cache.order.allId.push(uid);

    if (
      Date.now() > Date.parse(cache.deadline) ||
      cache.order.allId.length >= cache.maximum
    ) {
      cache.status = ORDER_STATUS.completed;
    }

    return cache;
  }

  async triggerLike(cache: CardInfo, uid: string, key: string) {
    console.log(`key----`, key);
    const anotherKey = key === 'like' ? 'dislike' : 'like';
    if (cache[key].allId.includes(uid)) {
      cache[key].allId = cache[key].allId.filter(id => id !== uid);
      delete cache[key].byId[uid];
    } else {
      cache[key].allId.push(uid);
      cache[key].byId[uid] = true;
      if (cache[anotherKey].allId.includes(uid)) {
        cache[anotherKey].allId = cache[anotherKey].allId.filter(
          id => id !== uid
        );
        delete cache[anotherKey].byId[uid];
      }
    }
  }

  async updateLike(cache: CardInfo, uid: string) {
    this.triggerLike(cache, uid, 'like');
    return cache;
  }

  async updateDislike(cache: CardInfo, uid: string) {
    this.triggerLike(cache, uid, 'dislike');
    return cache;
  }

  isUserLike(cache: CardInfo, uid: string) {
    return cache.like.allId.includes(uid);
  }

  isUserDislike(cache: CardInfo, uid: string) {
    return cache.dislike.allId.includes(uid);
  }

  getCardInfo = async (id: string): Promise<CardInfo> => {
    return cardStore.get(id);
  };
}
