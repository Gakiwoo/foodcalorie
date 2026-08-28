// 首页冒烟测试：验证拍照卡片、今日记录列表、loading/empty 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieHome from '../../FoodCalorie-Home.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

import { http } from '../api/client';

const mockRecords = [
  { id: 1, food_name: '白米饭', calories: 200, protein_g: 4, record_time: '2026-08-26 12:30:00', meal_type: '午餐', image_url: null },
  { id: 2, food_name: '鸡胸肉', calories: 165, protein_g: 31, record_time: '2026-08-26 12:35:00', meal_type: '午餐', image_url: null }
];

describe('FoodCalorieHome', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染顶部导航（今日/食刻/设置图标）', () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { getByText, container } = renderPage(<FoodCalorieHome />);
    expect(getByText('今日')).toBeInTheDocument();
    expect(getByText('食刻')).toBeInTheDocument();
    expect(container.querySelector('.fa-gear')).toBeInTheDocument();
  });

  it('渲染拍照识别大卡（相机图标 + 标题 + 按钮）', () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { getByText, container } = renderPage(<FoodCalorieHome />);
    expect(container.querySelector('.fa-camera')).toBeInTheDocument();
    expect(getByText('拍照识别食物')).toBeInTheDocument();
    expect(getByText('一键识别热量与营养')).toBeInTheDocument();
    expect(getByText('拍照识别')).toBeInTheDocument();
  });

  it('渲染"今日记录"区块标题和"查看全部"链接', () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { getByText } = renderPage(<FoodCalorieHome />);
    expect(getByText('今日记录')).toBeInTheDocument();
    expect(getByText('查看全部')).toBeInTheDocument();
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {})); // 永不 resolve，保持 loading
    const { getByText } = renderPage(<FoodCalorieHome />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('空数据显示 EmptyState（"今天还没有记录" + 添加按钮）', async () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { findByText } = renderPage(<FoodCalorieHome />);
    expect(await findByText('今天还没有记录')).toBeInTheDocument();
    expect(await findByText('+ 添加记录')).toBeInTheDocument();
  });

  it('加载成功后渲染记录列表（食物名称 + 热量）', async () => {
    http.get.mockResolvedValue({ data: { list: mockRecords } });
    const { findByText } = renderPage(<FoodCalorieHome />);
    expect(await findByText('白米饭')).toBeInTheDocument();
    expect(await findByText('鸡胸肉')).toBeInTheDocument();
  });

  it('调用 records API 获取今日记录（pageSize=3）', async () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    renderPage(<FoodCalorieHome />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/records',
      expect.objectContaining({ pageSize: 3 })
    );
  });

  it('渲染底部导航栏', () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { container } = renderPage(<FoodCalorieHome />);
    expect(container.querySelector('[data-name="bottom-nav"]')).toBeInTheDocument();
  });
});
