// 今日页冒烟测试：验证汇总卡、宏量营养素、按餐次分组、loading/empty 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieToday from '../../FoodCalorie-Today.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

import { http } from '../api/client';

const mockStats = { total: 365, target: 1400, percent: 26, average: 365 };
const mockRecords = [
  { id: 1, food_name: '燕麦粥', calories: 180, protein_g: 6, carbs_g: 30, fat_g: 3, record_time: '2026-08-26 08:00:00', meal_type: '早餐' },
  { id: 2, food_name: '鸡胸肉沙拉', calories: 185, protein_g: 28, carbs_g: 10, fat_g: 5, record_time: '2026-08-26 12:30:00', meal_type: '午餐' }
];

function mockApi(stats = mockStats, list = mockRecords) {
  http.get.mockImplementation((path) => {
    if (path.includes('/stats')) return Promise.resolve({ data: stats });
    if (path.includes('/records')) return Promise.resolve({ data: { list } });
    return Promise.resolve({ data: {} });
  });
}

describe('FoodCalorieToday', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染 NavBar 标题"今日记录"', () => {
    mockApi();
    const { container } = renderPage(<FoodCalorieToday />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe('今日记录');
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieToday />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染汇总卡（目标 + 还可摄入 + 环形进度）', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieToday />);
    expect(await findByText(/目标/)).toBeInTheDocument();
    expect(await findByText(/还可摄入/)).toBeInTheDocument();
  });

  it('渲染宏量营养素卡（碳水/蛋白质/脂肪）', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieToday />);
    expect(await findByText('碳水')).toBeInTheDocument();
    expect(await findByText('蛋白质')).toBeInTheDocument();
    expect(await findByText('脂肪')).toBeInTheDocument();
  });

  it('空数据显示 EmptyState（"今天还没有记录"）', async () => {
    mockApi(mockStats, []);
    const { findByText } = renderPage(<FoodCalorieToday />);
    expect(await findByText('今天还没有记录')).toBeInTheDocument();
    expect(await findByText('+ 添加记录')).toBeInTheDocument();
  });

  it('加载成功后按餐次分组渲染记录（早餐/午餐）', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieToday />);
    expect(await findByText('早餐')).toBeInTheDocument();
    expect(await findByText('午餐')).toBeInTheDocument();
    expect(await findByText('燕麦粥')).toBeInTheDocument();
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
  });

  it('调用 stats 和 records 两个 API', async () => {
    mockApi();
    renderPage(<FoodCalorieToday />);
    await waitFor(() => {
      const calls = http.get.mock.calls.map((c) => c[0]);
      expect(calls).toContain('/api/v1/foodcalorie/records/stats');
      expect(calls).toContain('/api/v1/foodcalorie/records');
    });
  });

  it('渲染底部导航栏', async () => {
    mockApi();
    const { container, findByText } = renderPage(<FoodCalorieToday />);
    // 等待加载完成后底部导航才渲染
    await findByText(/目标/);
    expect(container.querySelector('[data-name="bottom-nav"]')).toBeInTheDocument();
  });
});
