// 设置页冒烟测试：验证账号卡片、设置分组、退出登录
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieSettings from '../../FoodCalorie-Settings.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

vi.mock('../api/auth', () => ({
  fetchMe: vi.fn(),
  logout: vi.fn()
}));

import { http } from '../api/client';
import { fetchMe, logout } from '../api/auth';

const mockProfile = {
  target_calories: 1400,
  unit_calorie: 'kcal',
  precision_mode: 'standard',
  burst_enabled: 0,
  notif_record: 1,
  notif_goal: 0
};

describe('FoodCalorieSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockImplementation((path) => {
      if (path.includes('/profile')) return Promise.resolve({ data: mockProfile });
      if (path.includes('/records')) return Promise.resolve({ data: { total: 42, list: [] } });
      return Promise.resolve({ data: {} });
    });
    fetchMe.mockResolvedValue({ nickname: '测试用户' });
    logout.mockResolvedValue({});
  });

  it('渲染 NavBar 标题"设置"', () => {
    const { container } = renderPage(<FoodCalorieSettings />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('设置');
  });

  it('渲染账号卡片（昵称"测试用户"+查看个人主页）', async () => {
    const { findByText, container } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('测试用户')).toBeInTheDocument();
    expect(await findByText('查看个人主页')).toBeInTheDocument();
    expect(container.querySelector('[data-name="account-card"]')).toBeInTheDocument();
  });

  it('渲染"我的记录"卡片（42 条记录）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('我的记录')).toBeInTheDocument();
    expect(await findByText('42 条记录')).toBeInTheDocument();
  });

  it('渲染"目标与偏好"分组标题', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('目标与偏好')).toBeInTheDocument();
  });

  it('渲染"每日目标热量"设置项', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('每日目标热量')).toBeInTheDocument();
  });

  it('渲染"饮食偏好"设置项', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('饮食偏好')).toBeInTheDocument();
  });

  it('渲染"单位设置"设置项（显示千卡(kcal)）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('单位设置')).toBeInTheDocument();
    expect(await findByText('千卡(kcal)')).toBeInTheDocument();
  });

  it('渲染"识别设置"分组标题', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('识别设置')).toBeInTheDocument();
  });

  it('渲染"拍照识别精度"设置项（显示标准）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('拍照识别精度')).toBeInTheDocument();
    expect(await findByText('标准')).toBeInTheDocument();
  });

  it('渲染"连拍模式"设置项（显示已关闭）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('连拍模式')).toBeInTheDocument();
    expect(await findByText('已关闭')).toBeInTheDocument();
  });

  it('渲染"通知"分组标题', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('通知')).toBeInTheDocument();
  });

  it('渲染"每日打卡提醒"设置项（显示开）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('每日打卡提醒')).toBeInTheDocument();
    expect(await findByText('开')).toBeInTheDocument();
  });

  it('渲染"摄入超标提醒"设置项（显示关）', async () => {
    const { findByText } = renderPage(<FoodCalorieSettings />);
    expect(await findByText('摄入超标提醒')).toBeInTheDocument();
    expect(await findByText('关')).toBeInTheDocument();
  });

  it('渲染"通用"分组标题', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('通用')).toBeInTheDocument();
  });

  it('渲染通用设置项（隐私设置/帮助反馈/关于食刻）', () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    expect(getByText('隐私设置')).toBeInTheDocument();
    expect(getByText('帮助反馈')).toBeInTheDocument();
    expect(getByText('关于食刻')).toBeInTheDocument();
  });

  it('渲染"退出登录"按钮', () => {
    const { getByText, container } = renderPage(<FoodCalorieSettings />);
    expect(getByText('退出登录')).toBeInTheDocument();
    expect(container.querySelector('[data-name="logout-card"]')).toBeInTheDocument();
  });

  it('点击退出登录调用 logout API', async () => {
    const { getByText } = renderPage(<FoodCalorieSettings />);
    fireEvent.click(getByText('退出登录'));
    await waitFor(() => expect(logout).toHaveBeenCalled());
  });

  it('调用 profile、fetchMe、records 三个 API', async () => {
    renderPage(<FoodCalorieSettings />);
    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
      expect(fetchMe).toHaveBeenCalled();
      expect(http.get).toHaveBeenCalledWith(
        '/api/v1/foodcalorie/records',
        expect.objectContaining({ pageSize: 1 })
      );
    });
  });
});
