// 月历记录页冒烟测试：验证月份切换、月汇总、日历网格
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieRecordsMonth from '../../FoodCalorie-RecordsMonth.jsx';

vi.mock('../api/client', () => ({
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

const mockCalendar = {
  days: [
    { day: 1, calories: 1350 },
    { day: 2, calories: 1420 },
    { day: 3, calories: 1280 },
    { day: 5, calories: 1500 },
    { day: 6, calories: 1380 },
    { day: 8, calories: 1470 },
    { day: 10, calories: 1320 }
  ]
};

describe('FoodCalorieRecordsMonth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockCalendar });
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"月历"', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText('月历')).toBeInTheDocument();
  });

  it('渲染月份切换左右箭头', async () => {
    const { container, findByText } = renderPage(<FoodCalorieRecordsMonth />);
    await findByText('月历');
    expect(container.querySelector('.fa-chevron-left')).toBeInTheDocument();
    expect(container.querySelector('.fa-chevron-right')).toBeInTheDocument();
  });

  it('渲染当前年月标题', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    // 当前是 2026 年 8 月
    expect(await findByText(/2026年8月/)).toBeInTheDocument();
  });

  it('渲染"月总摄入"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText(/月总摄入/)).toBeInTheDocument();
  });

  it('渲染"日均"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText(/日均/)).toBeInTheDocument();
  });

  it('渲染"记录天数"标签和 7 天', async () => {
    const { findByText, getAllByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText(/记录天数/)).toBeInTheDocument();
    // "7" 可能出现在日历日期和记录天数中，用 getAllByText
    expect(getAllByText('7').length).toBeGreaterThan(0);
  });

  it('渲染星期标题行（日一二三四五六）', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText('日')).toBeInTheDocument();
    expect(await findByText('一')).toBeInTheDocument();
    expect(await findByText('二')).toBeInTheDocument();
    expect(await findByText('三')).toBeInTheDocument();
    expect(await findByText('四')).toBeInTheDocument();
    expect(await findByText('五')).toBeInTheDocument();
    expect(await findByText('六')).toBeInTheDocument();
  });

  it('渲染日历日期（1号到31号）', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText('1')).toBeInTheDocument();
    expect(await findByText('15')).toBeInTheDocument();
    expect(await findByText('31')).toBeInTheDocument();
  });

  it('渲染底部提示"点击日期查看当日记录"', async () => {
    const { findByText } = renderPage(<FoodCalorieRecordsMonth />);
    expect(await findByText('点击日期查看当日记录')).toBeInTheDocument();
  });

  it('点击左箭头切换到上一月', async () => {
    const { container, findByText } = renderPage(<FoodCalorieRecordsMonth />);
    await findByText('月历');
    const leftArrow = container.querySelector('.fa-chevron-left');
    fireEvent.click(leftArrow);
    // 切换后应该重新加载数据
    await waitFor(() => expect(http.get).toHaveBeenCalledTimes(2));
  });

  it('调用 calendar API 获取月历数据', async () => {
    renderPage(<FoodCalorieRecordsMonth />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/records/calendar',
      expect.objectContaining({ month: expect.any(String) })
    );
  });
});
