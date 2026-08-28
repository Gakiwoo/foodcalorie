// 个人信息页冒烟测试：验证表单字段、头像、保存按钮、loading 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieProfile from '../../FoodCalorie-Profile.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  },
  apiClient: vi.fn()
}));

import { http, apiClient } from '../api/client';

const mockProfile = {
  nickname: '测试用户',
  gender: '女',
  birthday: '1995-06-15',
  height_cm: 165,
  weight_kg: 55,
  goal_type: '减脂',
  target_calories: 1400
};

describe('FoodCalorieProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    apiClient.mockResolvedValue({ user: { nickname: '测试用户' } });
  });

  it('渲染 NavBar 标题"个人信息"和保存按钮', () => {
    const { container, getByText } = renderPage(<FoodCalorieProfile />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('个人信息');
    expect(getByText('保存')).toBeInTheDocument();
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieProfile />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染头像和"更换头像"', async () => {
    const { findByText, container } = renderPage(<FoodCalorieProfile />);
    expect(await findByText('更换头像')).toBeInTheDocument();
    expect(container.querySelector('.fa-user')).toBeInTheDocument();
  });

  it('渲染昵称输入框（值为"测试用户"）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    expect(await findByDisplayValue('测试用户')).toBeInTheDocument();
  });

  it('渲染性别选择（女/男）', async () => {
    const { findByText } = renderPage(<FoodCalorieProfile />);
    expect(await findByText('女')).toBeInTheDocument();
    expect(await findByText('男')).toBeInTheDocument();
  });

  it('渲染生日输入框（type="date"）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    expect(await findByDisplayValue('1995-06-15')).toBeInTheDocument();
  });

  it('渲染身高输入框（值为 165）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    expect(await findByDisplayValue('165')).toBeInTheDocument();
  });

  it('渲染体重输入框（值为 55）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    expect(await findByDisplayValue('55')).toBeInTheDocument();
  });

  it('渲染健康目标选择（减脂/保持/增肌）', async () => {
    const { findByText } = renderPage(<FoodCalorieProfile />);
    expect(await findByText('减脂')).toBeInTheDocument();
    expect(await findByText('保持')).toBeInTheDocument();
    expect(await findByText('增肌')).toBeInTheDocument();
  });

  it('渲染每日目标输入框（值为 1400）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    expect(await findByDisplayValue('1400')).toBeInTheDocument();
  });

  it('渲染底部"保存修改"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieProfile />);
    expect(await findByText('保存修改')).toBeInTheDocument();
  });

  it('调用 profile 和 auth/me 两个 API', async () => {
    renderPage(<FoodCalorieProfile />);
    await waitFor(() => {
      expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
      expect(apiClient).toHaveBeenCalledWith('/api/auth/me');
    });
  });

  it('修改昵称后输入框值更新', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieProfile />);
    const input = await findByDisplayValue('测试用户');
    fireEvent.change(input, { target: { value: '新昵称' } });
    expect(input.value).toBe('新昵称');
  });
});
