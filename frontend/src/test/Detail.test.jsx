// 详情页冒烟测试：验证记录详情渲染、营养成分、来源信息、删除确认弹窗、无 id 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieDetail from '../../FoodCalorie-Detail.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    del: vi.fn()
  }
}));

import { http } from '../api/client';

const mockRecord = {
  id: 1,
  food_name: '鸡胸肉沙拉',
  calories: 185,
  protein_g: 28,
  carbs_g: 10,
  fat_g: 5,
  fiber_g: 3,
  meal_type: '午餐',
  record_time: '2026-08-26 12:30:00',
  created_at: '2026-08-26T12:30:00Z',
  source: 'search',
  image_url: null
};

describe('FoodCalorieDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('带 id 参数时初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"记录详情"和编辑图标', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText, container } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('记录详情')).toBeInTheDocument();
    expect(container.querySelector('.fa-pen')).toBeInTheDocument();
  });

  it('加载成功后渲染食物名称和热量', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
    expect(await findByText('185')).toBeInTheDocument();
  });

  it('渲染营养成分区块（蛋白质/碳水/脂肪/膳食纤维）', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('营养成分')).toBeInTheDocument();
    expect(await findByText('蛋白质')).toBeInTheDocument();
    expect(await findByText('碳水')).toBeInTheDocument();
    expect(await findByText('脂肪')).toBeInTheDocument();
    expect(await findByText('膳食纤维')).toBeInTheDocument();
  });

  it('渲染营养数值（28g 蛋白 / 10g 碳水 / 5g 脂肪 / 3g 纤维）', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('28 g')).toBeInTheDocument();
    expect(await findByText('10 g')).toBeInTheDocument();
    expect(await findByText('5 g')).toBeInTheDocument();
    expect(await findByText('3g')).toBeInTheDocument();
  });

  it('渲染来源信息卡（食物库搜索）', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('食物库搜索')).toBeInTheDocument();
    expect(await findByText('数据来自食物库搜索添加')).toBeInTheDocument();
  });

  it('渲染删除记录和编辑按钮', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    expect(await findByText('删除记录')).toBeInTheDocument();
    // 有两个"编辑"相关：NavBar 的编辑图标 + 底部编辑按钮
    const editButtons = await findByText('编辑');
    expect(editButtons).toBeInTheDocument();
  });

  it('点击删除记录显示确认弹窗（role="dialog"）', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText, findByRole } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    const delBtn = await findByText('删除记录');
    fireEvent.click(delBtn);
    const dialog = await findByRole('dialog', { name: '删除记录确认' });
    expect(dialog).toBeInTheDocument();
    expect(await findByText('删除这条记录？')).toBeInTheDocument();
  });

  it('确认弹窗包含取消和删除按钮', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail?id=1' });
    fireEvent.click(await findByText('删除记录'));
    expect(await findByText('取消')).toBeInTheDocument();
    expect(await findByText('删除')).toBeInTheDocument();
  });

  it('无 id 参数时显示"记录不存在或已删除"', async () => {
    http.get.mockResolvedValue({ data: null });
    const { findByText } = renderPage(<FoodCalorieDetail />, { route: '/detail' });
    expect(await findByText('记录不存在或已删除')).toBeInTheDocument();
    expect(await findByText('返回记录页')).toBeInTheDocument();
  });

  it('调用 records/:id API 获取详情', async () => {
    http.get.mockResolvedValue({ data: mockRecord });
    renderPage(<FoodCalorieDetail />, { route: '/detail?id=42' });
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/records/42');
  });
});
