// 记录页冒烟测试：验证汇总卡、日/周/月切换、记录列表分组、loading/empty 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieRecords from '../../FoodCalorie-Records.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

import { http } from '../api/client';

const mockStats = { total: 365, target: 1400, percent: 26, average: 365 };

// 本地时区"今天"（与组件 todayStr() 同口径）：mock 记录落在今天，
// 分组标题才会渲染"今天·M月D日"前缀；写死日期会在次日后的运行中恒失败
function localToday() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const today = localToday();

const mockRecords = [
  { id: 1, food_name: '燕麦粥', calories: 180, protein_g: 6, carbs_g: 30, fat_g: 3, record_time: `${today} 08:00:00`, meal_type: '早餐' },
  { id: 2, food_name: '鸡胸肉沙拉', calories: 185, protein_g: 28, carbs_g: 10, fat_g: 5, record_time: `${today} 12:30:00`, meal_type: '午餐' }
];

function mockApi(stats = mockStats, list = mockRecords) {
  http.get.mockImplementation((path) => {
    if (path.includes('/stats')) return Promise.resolve({ data: stats });
    if (path.includes('/records')) return Promise.resolve({ data: { list } });
    return Promise.resolve({ data: {} });
  });
}

describe('FoodCalorieRecords', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染 NavBar 标题"记录"', () => {
    mockApi();
    const { container } = renderPage(<FoodCalorieRecords />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title).toBeInTheDocument();
    expect(title.textContent).toBe('记录');
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieRecords />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染汇总卡（今日摄入 + 环形进度）', async () => {
    mockApi();
    const { findByText, container } = renderPage(<FoodCalorieRecords />);
    expect(await findByText(/今日摄入/)).toBeInTheDocument();
    expect(container.querySelector('[data-name="summary-card"]')).toBeInTheDocument();
  });

  it('渲染日/周/月切换 tab（role="tablist"）', async () => {
    mockApi();
    const { findByRole, findByText } = renderPage(<FoodCalorieRecords />);
    expect(await findByRole('tablist', { name: '记录范围切换' })).toBeInTheDocument();
    expect(await findByText('日')).toBeInTheDocument();
    expect(await findByText('周')).toBeInTheDocument();
    expect(await findByText('月')).toBeInTheDocument();
  });

  it('"日" tab 默认选中（aria-selected=true）', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieRecords />);
    const dayTab = (await findByText('日')).closest('[role="tab"]');
    expect(dayTab).toHaveAttribute('aria-selected', 'true');
  });

  it('空数据显示 EmptyState（"今天还没有记录"）', async () => {
    mockApi(mockStats, []);
    const { findByText } = renderPage(<FoodCalorieRecords />);
    expect(await findByText('今天还没有记录')).toBeInTheDocument();
    expect(await findByText('+ 添加记录')).toBeInTheDocument();
  });

  it('加载成功后渲染记录列表（按日期分组 + 食物名称）', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieRecords />);
    expect(await findByText('燕麦粥')).toBeInTheDocument();
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
  });

  it('分组标题显示"今天·M月D日"格式', async () => {
    mockApi();
    const { findByText } = renderPage(<FoodCalorieRecords />);
    // 今天的分组标题
    const header = await findByText(/今天·/);
    expect(header).toBeInTheDocument();
  });

  it('并行调用 stats 和 records 两个 API', async () => {
    mockApi();
    renderPage(<FoodCalorieRecords />);
    await waitFor(() => {
      const calls = http.get.mock.calls.map((c) => c[0]);
      expect(calls).toContain('/api/v1/foodcalorie/records/stats');
      expect(calls).toContain('/api/v1/foodcalorie/records');
    });
  });

  it('渲染底部导航栏（records 激活）', () => {
    mockApi();
    const { container } = renderPage(<FoodCalorieRecords />);
    expect(container.querySelector('[data-name="bottom-nav"]')).toBeInTheDocument();
  });
});
