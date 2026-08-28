// 数据导出页冒烟测试：验证时间范围、格式选择、导出按钮
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieDataExport from '../../FoodCalorie-DataExport.jsx';

vi.mock('../api/client', () => ({
  apiClient: vi.fn(),
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

describe('FoodCalorieDataExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: {} });
  });

  it('渲染 NavBar 标题"数据导出"', () => {
    const { container } = renderPage(<FoodCalorieDataExport />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('数据导出');
  });

  it('渲染"导出时间范围"标题', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText('导出时间范围')).toBeInTheDocument();
  });

  it('渲染时间范围选项（全部/近一月/近一周/今日）', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText('全部')).toBeInTheDocument();
    expect(getByText('近一月')).toBeInTheDocument();
    expect(getByText('近一周')).toBeInTheDocument();
    expect(getByText('今日')).toBeInTheDocument();
  });

  it('渲染"导出格式"标题', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText('导出格式')).toBeInTheDocument();
  });

  it('渲染格式选项（CSV/JSON）', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText('CSV（Excel 可用）')).toBeInTheDocument();
    expect(getByText('JSON（程序对接）')).toBeInTheDocument();
  });

  it('渲染导出内容提示信息', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText(/导出包含：食物名称/)).toBeInTheDocument();
  });

  it('默认显示"导出并下载 CSV"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    expect(getByText('导出并下载 CSV')).toBeInTheDocument();
  });

  it('切换到 JSON 格式后按钮显示"导出 JSON"', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    fireEvent.click(getByText('JSON（程序对接）'));
    expect(getByText('导出 JSON')).toBeInTheDocument();
  });

  it('切换时间范围到"近一月"', () => {
    const { getByText } = renderPage(<FoodCalorieDataExport />);
    fireEvent.click(getByText('近一月'));
    // 切换后按钮仍然存在
    expect(getByText('导出并下载 CSV')).toBeInTheDocument();
  });
});
