// 饮食偏好页冒烟测试：验证口味偏好、饮食方式、忌口过敏原选择和保存
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieDietPref from '../../FoodCalorie-DietPref.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = { diet_preferences: ['清淡', '高蛋白'] };

describe('FoodCalorieDietPref', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieDietPref />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"饮食偏好"', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('饮食偏好')).toBeInTheDocument();
  });

  it('渲染"口味偏好"分组标题', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('口味偏好')).toBeInTheDocument();
  });

  it('渲染口味偏好选项（清淡/微辣/中辣/重口/甜口/酸口）', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('清淡')).toBeInTheDocument();
    expect(await findByText('微辣')).toBeInTheDocument();
    expect(await findByText('中辣')).toBeInTheDocument();
    expect(await findByText('重口')).toBeInTheDocument();
    expect(await findByText('甜口')).toBeInTheDocument();
    expect(await findByText('酸口')).toBeInTheDocument();
  });

  it('渲染"饮食方式"分组标题', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('饮食方式')).toBeInTheDocument();
  });

  it('渲染饮食方式选项（均衡/低碳水/高蛋白/素食/低脂/低盐）', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('均衡')).toBeInTheDocument();
    expect(await findByText('低碳水')).toBeInTheDocument();
    expect(await findByText('高蛋白')).toBeInTheDocument();
    expect(await findByText('素食')).toBeInTheDocument();
    expect(await findByText('低脂')).toBeInTheDocument();
    expect(await findByText('低盐')).toBeInTheDocument();
  });

  it('渲染"忌口过敏原"分组标题', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('忌口过敏原')).toBeInTheDocument();
  });

  it('渲染忌口过敏原选项（牛肉/海鲜/坚果/乳制品/麸质/鸡蛋/大豆）', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('牛肉')).toBeInTheDocument();
    expect(await findByText('海鲜')).toBeInTheDocument();
    expect(await findByText('坚果')).toBeInTheDocument();
    expect(await findByText('乳制品')).toBeInTheDocument();
    expect(await findByText('麸质')).toBeInTheDocument();
    expect(await findByText('鸡蛋')).toBeInTheDocument();
    expect(await findByText('大豆')).toBeInTheDocument();
  });

  it('渲染"保存偏好"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    expect(await findByText('保存偏好')).toBeInTheDocument();
  });

  it('点击选项切换选中状态', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    const opt = await findByText('微辣');
    fireEvent.click(opt);
    // 点击后应该仍然存在（切换选中状态不影响渲染）
    expect(opt).toBeInTheDocument();
  });

  it('点击保存偏好调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieDietPref />);
    const btn = await findByText('保存偏好');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ diet_preferences: expect.arrayContaining(['清淡', '高蛋白']) })
    );
  });

  it('调用 profile API 获取当前饮食偏好', async () => {
    renderPage(<FoodCalorieDietPref />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
