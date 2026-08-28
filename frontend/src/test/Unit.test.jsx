// 单位设置页冒烟测试：验证热量单位、重量单位选择和保存
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieUnit from '../../FoodCalorie-Unit.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = { unit_calorie: 'kcal', unit_weight: 'g' };

describe('FoodCalorieUnit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieUnit />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"单位设置"', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('单位设置')).toBeInTheDocument();
  });

  it('渲染"热量单位"标题和换算提示', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('热量单位')).toBeInTheDocument();
    expect(await findByText('1 kcal ≈ 4.184 kJ')).toBeInTheDocument();
  });

  it('渲染热量单位选项（千卡 kcal / 千焦 kJ）', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('千卡 kcal')).toBeInTheDocument();
    expect(await findByText('千焦 kJ')).toBeInTheDocument();
  });

  it('渲染"重量单位"标题和换算提示', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('重量单位')).toBeInTheDocument();
    expect(await findByText('1 oz ≈ 28.35 g')).toBeInTheDocument();
  });

  it('渲染重量单位选项（克 g / 盎司 oz）', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('克 g')).toBeInTheDocument();
    expect(await findByText('盎司 oz')).toBeInTheDocument();
  });

  it('渲染"保存设置"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    expect(await findByText('保存设置')).toBeInTheDocument();
  });

  it('点击保存设置调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieUnit />);
    const btn = await findByText('保存设置');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ unit_calorie: 'kcal', unit_weight: 'g' })
    );
  });

  it('调用 profile API 获取当前单位设置', async () => {
    renderPage(<FoodCalorieUnit />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
