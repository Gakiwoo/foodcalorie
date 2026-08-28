// 周记录页冒烟测试：验证周汇总、每日记录列表
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieRecordsWeek from '../../FoodCalorie-RecordsWeek.jsx';

vi.mock('../api/client', () => ({
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

const mockStats = {
  total: 9800,
  average: 1400,
  percent: 71,
  reachedDays: 5,
  totalDays: 7,
  target: 1400,
  from: '2026-08-18',
  daily: {
    '2026-08-18': 1350,
    '2026-08-19': 1420,
    '2026-08-20': 1280,
    '2026-08-21': 1500,
    '2026-08-22': 1380,
    '2026-08-23': 0,
    '2026-08-24': 1470
  }
};

describe('FoodCalorieRecordsWeek', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockStats });
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"本周记录"', async () => {
    const { container, findByText } = renderPage(<FoodCalorieRecordsWeek />);
    await findByText('达标比例');
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('本周记录');
  });

  it('渲染达标比例 71%', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('71%')).toBeInTheDocument();
  });

  it('渲染"达标比例"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('达标比例')).toBeInTheDocument();
  });

  it('渲染"周总摄入"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('周总摄入')).toBeInTheDocument();
  });

  it('渲染"日均摄入"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('日均摄入')).toBeInTheDocument();
  });

  it('渲染"达标天数"标签和 5/7', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('达标天数')).toBeInTheDocument();
    expect(await findByText('5/7')).toBeInTheDocument();
  });

  it('渲染"周目标"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('周目标')).toBeInTheDocument();
  });

  it('渲染"本周记录"列表标题', async () => {
    const { container, findByText } = renderPage(<FoodCalorieRecordsWeek />);
    await findByText('达标比例');
    // 列表标题是 fontSize.xl + fontWeight.bold 的 span
    const titles = container.querySelectorAll('span');
    const listTitle = Array.from(titles).find(el =>
      el.textContent === '本周记录' &&
      el.style.fontSize &&
      el.style.fontWeight
    );
    expect(listTitle).toBeInTheDocument();
  });

  it('渲染 7 天的星期标签（周一到周日）', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('周一')).toBeInTheDocument();
    expect(await findByText('周二')).toBeInTheDocument();
    expect(await findByText('周三')).toBeInTheDocument();
    expect(await findByText('周四')).toBeInTheDocument();
    expect(await findByText('周五')).toBeInTheDocument();
    expect(await findByText('周六')).toBeInTheDocument();
    expect(await findByText('周日')).toBeInTheDocument();
  });

  it('渲染未记录日期的"未记录"状态', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsWeek />);
    expect(await findByText('未记录')).toBeInTheDocument();
  });

  it('调用 stats API 获取周统计数据', async () => {
    renderPage(<FoodCalorieRecordsWeek />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/records/stats',
      expect.objectContaining({ range: 'week' })
    );
  });
});
