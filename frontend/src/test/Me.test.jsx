// 我的页冒烟测试：验证个人资料卡、今日摄入、快捷入口、设置列表
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieMe from '../../FoodCalorie-Me.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

vi.mock('../api/auth', () => ({
  fetchMe: vi.fn()
}));

import { http } from '../api/client';
import { fetchMe } from '../api/auth';

const mockUser = { nickname: '测试用户', email: 'test@example.com', streak: 7 };
const mockStats = { total: 365, target: 1400, percent: 26 };

describe('FoodCalorieMe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockStats });
    fetchMe.mockResolvedValue(mockUser);
  });

  it('渲染个人资料卡片（头像+昵称+简介）', async () => {
    const { findByText, container } = renderPage(<FoodCalorieMe />);
    expect(await findByText('测试用户')).toBeInTheDocument();
    expect(container.querySelector('[data-name="avatar"]')).toBeInTheDocument();
  });

  it('渲染用户简介"已坚持健康饮食 7 天"', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    expect(await findByText(/已坚持健康饮食 7 天/)).toBeInTheDocument();
  });

  it('渲染今日摄入卡片（已摄入/目标/剩余）', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    expect(await findByText('今日摄入')).toBeInTheDocument();
    expect(await findByText('查看详情')).toBeInTheDocument();
  });

  it('今日摄入显示已摄入 365 kcal', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    expect(await findByText('365')).toBeInTheDocument();
  });

  it('今日摄入显示目标 1400 kcal', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    expect(await findByText('1400')).toBeInTheDocument();
  });

  it('今日摄入显示剩余 1035 kcal', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    expect(await findByText('1035')).toBeInTheDocument();
  });

  it('渲染快捷入口网格（我的记录/目标设置/我的收藏/数据导出）', () => {
    const { getByText } = renderPage(<FoodCalorieMe />);
    expect(getByText('我的记录')).toBeInTheDocument();
    expect(getByText('目标设置')).toBeInTheDocument();
    expect(getByText('我的收藏')).toBeInTheDocument();
    expect(getByText('数据导出')).toBeInTheDocument();
  });

  it('渲染设置列表（通知设置/隐私设置/帮助反馈/关于我们）', () => {
    const { getByText } = renderPage(<FoodCalorieMe />);
    expect(getByText('通知设置')).toBeInTheDocument();
    expect(getByText('隐私设置')).toBeInTheDocument();
    expect(getByText('帮助反馈')).toBeInTheDocument();
    expect(getByText('关于我们')).toBeInTheDocument();
  });

  it('关于我们显示版本号', async () => {
    const { findByText } = renderPage(<FoodCalorieMe />);
    // APP_VERSION 是从 version.js 导入的，应该显示版本号
    const versionEl = await findByText(/^\d+\.\d+\.\d+$/);
    expect(versionEl).toBeInTheDocument();
  });

  it('调用 fetchMe 和 stats API', async () => {
    renderPage(<FoodCalorieMe />);
    await waitFor(() => {
      expect(fetchMe).toHaveBeenCalled();
      expect(http.get).toHaveBeenCalledWith(
        '/api/v1/foodcalorie/records/stats',
        expect.objectContaining({ range: 'day' })
      );
    });
  });

  it('渲染底部导航栏（me 激活）', () => {
    const { container } = renderPage(<FoodCalorieMe />);
    expect(container.querySelector('[data-name="bottom-nav"]')).toBeInTheDocument();
  });
});
