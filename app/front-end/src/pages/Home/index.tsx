/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useCallback } from 'react';
import type { Moment } from 'moment';

import { toast$ } from 'dingtalk-jsapi/api/device/notification/toast';
import { _invoke } from 'dingtalk-jsapi/core';
import { Form, Input, DatePicker, Button, Typography } from 'dingtalk-design-desktop';
import axios from 'axios'
import { installCoolAppToGroup } from 'dingtalk-jsapi/plugin/coolAppSdk';
import { SendOutlined } from 'dd-icons';
import toConversationByOpenConversationId from 'dingtalk-jsapi/api/biz/chat/toConversationByOpenConversationId';
import confirm$ from 'dingtalk-jsapi/api/device/notification/confirm';

import styles from './index.module.less';
import { corpId, coolAppCode, clientId } from '../../services/config';


const Home: React.FC = () => {
  const [openConversationId] = useState(() => {
    const query = new URLSearchParams(location.search);
    return query.get('openConversationId') || '';
  })
  const [validateStatus, setValidateStatus] = React.useState<boolean>(false);
  const [form] = Form.useForm<{
    title: string;
    deadline: Moment;
    maximum: number;
  }>();

  const handleSubmit = React.useCallback(async () => {
    await form.validateFields();
    const { title, deadline, maximum } = form.getFieldsValue();
    axios.post('/api/demo/sendCard', {
      title,
      openConversationId,
      deadline: deadline.format('YYYY-MM-DD HH:mm'),
      maximum,
    }).then((res) => {
      toast$({
        text: '发送成功',
        icon: 'success',
      });
    }).catch((err) => {
      toast$({
        text: err.message,
      })
    })
  }, [form, openConversationId]);

  const handleChange = React.useCallback(() => {
    const value = form.getFieldsValue();
    if (value.deadline && value.maximum > 0 && value.title.trim()) {
      setValidateStatus(true);
    } else {
      setValidateStatus(false);
    }
  }, [form]);

  const onClick = useCallback(() => {
    installCoolAppToGroup({
      corpId, // 要安装酷应用的组织id
      coolAppCode, // 要安装的酷应用code
      clientId, // 酷应用归属的应用标识
    }).then(installResult => {
      if (installResult?.errorCode === '0' && installResult?.detail?.openConversationId) {
        confirm$({
          title: '安装成功',
          message: '是否跳转到对应群聊',
          buttonLabels: ['取消', '确定'],
        }).then(confirmResult => {
          if (confirmResult?.buttonIndex === 1) {
            toConversationByOpenConversationId({
              openConversationId: installResult?.detail?.openConversationId,
            });  
          }
        })
      }
    });
  }, []);

  return (
    <div className={styles.root}>
      <Typography.Title
        className={styles.title}
        level={3}
        style={{ padding: '20px 20px 10px' }}
      >
        健康餐预定
        <Button
          onClick={onClick}
          type="primary"
        >
          安装到其他群
          <SendOutlined className={styles.sendOut} />
        </Button>
      </Typography.Title>
      <Typography.Paragraph style={{ padding: '0 20px' }}>
        迈志豪健身餐预定
      </Typography.Paragraph>
      <div className={styles.form}>
        <Form
          name="basic"
          form={form}
          onFinish={handleSubmit}
          onChange={handleChange}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          <Form.Item
            label="文本内容（如：9月26日的订餐开始啦～）"
            name="title"
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="订餐提交截止时间"
            name="deadline"
            rules={[{ required: true }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" placeholder='选择时间' />
          </Form.Item>
          <Form.Item
            label="订餐提交数量最大值"
            name="maximum"
            rules={[{ required: true }]}
          >
            <Input type="number" />
          </Form.Item>
          <div className={styles.footer}>
            <Button disabled={!validateStatus} htmlType="submit" type="primary">确定</Button>
          </div>
          <div className={styles.footerGhost} />
        </Form>
      </div>
    </div>
  );
};

export default Home;
