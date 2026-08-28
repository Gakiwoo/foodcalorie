// 挑战页冒烟测试：验证挑战信息、任务列表、打卡进度、参与/打卡按钮
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieChallenge from '../../FoodCalorie-Challenge.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { http } from '../api/client';

const mockChallenge = {
  id: 1,
  name: '夏季轻食挑战',
  start_date: '2026-08-01',
  end_date: '2026-08-21',
  participants: 128,
  completed: 56,
  joined: false,
  check_in_days: 0,
  streak_days: 0,
  tasks: [
    { name: '每日打卡', target: 21, points: 10 },
    { name: '连续打卡', target: 7, points: 20 },
    { name: '分享挑战', target: 1, points: 30 }
  ]
};

describe('FoodCalorieChallenge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: [mockChallenge] });
    http.post.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieChallenge />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"夏季轻食挑战"和分享图标', async () => {
    const { findByText, container } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('夏季轻食挑战')).toBeInTheDocument();
    expect(container.querySelector('.fa-share-nodes')).toBeInTheDocument();
  });

  it('渲染挑战头部横幅（21天打卡计划+挑战名称+描述）', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('21 天打卡计划')).toBeInTheDocument();
    expect(await findByText('健康饮食 21 天，赢专属徽章')).toBeInTheDocument();
  });

  it('渲染挑战头部奖牌图标', async () => {
    const { container, findByText } = renderPage(<FoodCalorieChallenge />);
    await findByText('夏季轻食挑战');
    expect(container.querySelector('.fa-medal')).toBeInTheDocument();
  });

  it('渲染活动信息卡（活动时间+参与人数+已完成）', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('活动时间')).toBeInTheDocument();
    expect(await findByText('参与人数')).toBeInTheDocument();
    expect(await findByText('已完成')).toBeInTheDocument();
  });

  it('渲染活动时间"2026-08-01-2026-08-21"', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('2026-08-01-2026-08-21')).toBeInTheDocument();
  });

  it('渲染参与人数 128', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('128')).toBeInTheDocument();
  });

  it('渲染"我的任务"标题和任务列表', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('我的任务')).toBeInTheDocument();
    expect(await findByText('每日打卡')).toBeInTheDocument();
    expect(await findByText('连续打卡')).toBeInTheDocument();
    expect(await findByText('分享挑战')).toBeInTheDocument();
  });

  it('渲染任务积分（+10 积分/+20 积分/+30 积分）', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('+10 积分')).toBeInTheDocument();
    expect(await findByText('+20 积分')).toBeInTheDocument();
    expect(await findByText('+30 积分')).toBeInTheDocument();
  });

  it('渲染"打卡进度"标题和进度条', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('打卡进度')).toBeInTheDocument();
    // 未加入状态下显示提示文字
    expect(await findByText('加入挑战即可开始打卡')).toBeInTheDocument();
  });

  it('未加入挑战时显示"立即参与挑战"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('立即参与挑战')).toBeInTheDocument();
  });

  it('已加入挑战时显示"今日打卡 +10"按钮', async () => {
    http.get.mockResolvedValue({ data: [{ ...mockChallenge, joined: true, check_in_days: 5 }] });
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('今日打卡 +10')).toBeInTheDocument();
  });

  it('点击"立即参与挑战"调用 join API', async () => {
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    const btn = await findByText('立即参与挑战');
    fireEvent.click(btn);
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post).toHaveBeenCalledWith('/api/v1/foodcalorie/challenges/1/join');
  });

  it('点击"今日打卡"调用 checkin API', async () => {
    http.get.mockResolvedValue({ data: [{ ...mockChallenge, joined: true }] });
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    const btn = await findByText('今日打卡 +10');
    fireEvent.click(btn);
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post).toHaveBeenCalledWith('/api/v1/foodcalorie/challenges/1/checkin');
  });

  it('无挑战时显示"暂无进行中的挑战"', async () => {
    http.get.mockResolvedValue({ data: [] });
    const { findByText } = renderPage(<FoodCalorieChallenge />);
    expect(await findByText('暂无进行中的挑战')).toBeInTheDocument();
  });

  it('调用 challenges API 获取挑战列表', async () => {
    renderPage(<FoodCalorieChallenge />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/challenges');
  });
});
