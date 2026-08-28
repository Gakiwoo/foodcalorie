// 添加记录页冒烟测试：验证搜索框、餐次筛选、常见食物列表、选择交互、自定义添加
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieAddFood from '../../FoodCalorie-AddFood.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { http } from '../api/client';

describe('FoodCalorieAddFood', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: { list: [] } });
  });

  it('渲染 NavBar 标题"添加记录"和保存勾选图标', () => {
    const { container } = renderPage(<FoodCalorieAddFood />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('添加记录');
    expect(container.querySelector('[data-name="nav-save-check"]')).toBeInTheDocument();
  });

  it('渲染搜索框（placeholder="搜索食物名称"）', () => {
    const { getByPlaceholderText } = renderPage(<FoodCalorieAddFood />);
    expect(getByPlaceholderText('搜索食物名称')).toBeInTheDocument();
  });

  it('渲染餐次筛选（全部/早餐/午餐/晚餐/加餐）', () => {
    const { getByText } = renderPage(<FoodCalorieAddFood />);
    expect(getByText('全部')).toBeInTheDocument();
    expect(getByText('早餐')).toBeInTheDocument();
    expect(getByText('午餐')).toBeInTheDocument();
    expect(getByText('晚餐')).toBeInTheDocument();
    expect(getByText('加餐')).toBeInTheDocument();
  });

  it('初始显示"常见食物"标题和数量', () => {
    const { getByText } = renderPage(<FoodCalorieAddFood />);
    expect(getByText('常见食物')).toBeInTheDocument();
    expect(getByText('共 6 种')).toBeInTheDocument();
  });

  it('渲染 6 种常见食物（香蕉/全麦面包/鸡胸肉等）', () => {
    const { getByText } = renderPage(<FoodCalorieAddFood />);
    expect(getByText('香蕉')).toBeInTheDocument();
    expect(getByText('全麦面包')).toBeInTheDocument();
    expect(getByText('鸡胸肉')).toBeInTheDocument();
    expect(getByText('燕麦片')).toBeInTheDocument();
    expect(getByText('希腊酸奶')).toBeInTheDocument();
    expect(getByText('苹果')).toBeInTheDocument();
  });

  it('点击食物卡片选中，底部显示"已选 1 项"', () => {
    const { getByText } = renderPage(<FoodCalorieAddFood />);
    fireEvent.click(getByText('香蕉'));
    expect(getByText('已选 1 项')).toBeInTheDocument();
  });

  it('选中食物后底部显示总热量', () => {
    const { getByText, container } = renderPage(<FoodCalorieAddFood />);
    fireEvent.click(getByText('香蕉'));
    // 底部 sticky 栏中的热量显示
    const bottomBar = container.querySelector('[style*="sticky"]');
    expect(bottomBar.textContent).toContain('89');
  });

  it('渲染"没找到？自定义添加"区域', () => {
    const { getByText } = renderPage(<FoodCalorieAddFood />);
    expect(getByText('没找到？自定义添加')).toBeInTheDocument();
  });

  it('点击自定义添加展开输入框（食物名称 + 热量 + 添加按钮）', () => {
    const { getByText, getByPlaceholderText } = renderPage(<FoodCalorieAddFood />);
    fireEvent.click(getByText('没找到？自定义添加'));
    expect(getByPlaceholderText('食物名称')).toBeInTheDocument();
    expect(getByPlaceholderText('热量 kcal')).toBeInTheDocument();
    expect(getByText('添加')).toBeInTheDocument();
  });

  it('渲染底部"保存记录"按钮', () => {
    const { container } = renderPage(<FoodCalorieAddFood />);
    expect(container.querySelector('[data-name="save-records-btn"]')).toBeInTheDocument();
    expect(getByText_safe(container, '保存记录')).toBeInTheDocument();
  });

  it('未选中食物时保存按钮半透明（opacity 0.5）', () => {
    const { container } = renderPage(<FoodCalorieAddFood />);
    const btn = container.querySelector('[data-name="save-records-btn"]');
    expect(btn.style.opacity).toBe('0.5');
  });
});

// 辅助函数：避免 getByText 重复匹配
function getByText_safe(container, text) {
  return Array.from(container.querySelectorAll('span, div, button')).find((el) => el.textContent === text);
}
