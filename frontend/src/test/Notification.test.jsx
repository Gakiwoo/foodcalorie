// 通知设置页冒烟测试：验证通知开关、免打扰时段和保存
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieNotification from '../../FoodCalorie-Notification.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = {
  notif_record: 1,
  notif_goal: 1,
  notif_community: 0,
  notif_weekly: 1,
  notif_activity: 0,
  quiet_start: '22:00',
  quiet_end: '08:00'
};

describe('FoodCalorieNotification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieNotification />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"通知设置"', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('通知设置')).toBeInTheDocument();
  });

  it('渲染"记录提醒"开关和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('记录提醒')).toBeInTheDocument();
    expect(await findByText('到了饭点提醒记录饮食')).toBeInTheDocument();
  });

  it('渲染"目标达成提醒"开关和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('目标达成提醒')).toBeInTheDocument();
    expect(await findByText('达到每日目标热量时通知')).toBeInTheDocument();
  });

  it('渲染"社区互动"开关和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('社区互动')).toBeInTheDocument();
    expect(await findByText('点赞、评论、关注通知')).toBeInTheDocument();
  });

  it('渲染"每周报告"开关和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('每周报告')).toBeInTheDocument();
    expect(await findByText('每周日发送本周饮食总结')).toBeInTheDocument();
  });

  it('渲染"活动通知"开关和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('活动通知')).toBeInTheDocument();
    expect(await findByText('挑战活动、运营活动通知')).toBeInTheDocument();
  });

  it('渲染"免打扰时段"标题和提示', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('免打扰时段')).toBeInTheDocument();
    expect(await findByText('该时段内不推送通知')).toBeInTheDocument();
  });

  it('渲染免打扰时段时间输入框（22:00 至 08:00）', async () => {
    const { findByDisplayValue, findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByDisplayValue('22:00')).toBeInTheDocument();
    expect(await findByDisplayValue('08:00')).toBeInTheDocument();
    expect(await findByText('至')).toBeInTheDocument();
  });

  it('渲染"保存设置"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    expect(await findByText('保存设置')).toBeInTheDocument();
  });

  it('点击保存设置调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieNotification />);
    const btn = await findByText('保存设置');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ quiet_start: '22:00', quiet_end: '08:00' })
    );
  });

  it('调用 profile API 获取当前通知设置', async () => {
    renderPage(<FoodCalorieNotification />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
