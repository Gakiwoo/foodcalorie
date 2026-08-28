// 404 页面冒烟测试：验证页面渲染、错误信息展示、返回首页按钮
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderPage } from './testUtils';
import FoodCalorieNotFound from '../../FoodCalorie-NotFound.jsx';

// mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

describe('FoodCalorieNotFound', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('渲染 404 错误码', () => {
    const { getByText } = renderPage(<FoodCalorieNotFound />);
    expect(getByText('404')).toBeInTheDocument();
  });

  it('渲染"页面未找到"标题', () => {
    const { container } = renderPage(<FoodCalorieNotFound />);
    // 页面内容中的标题（NavBar 也有相同文本，用 getAllByText 验证至少存在）
    const titles = container.querySelectorAll('span');
    const contentTitle = Array.from(titles).find(el => el.textContent === '页面未找到' && el.closest('[data-name="nav-title"]') === null);
    expect(contentTitle).toBeTruthy();
  });

  it('渲染错误提示信息', () => {
    const { getByText } = renderPage(<FoodCalorieNotFound />);
    expect(getByText(/你访问的页面不存在或已被移除/)).toBeInTheDocument();
  });

  it('渲染"返回首页"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieNotFound />);
    expect(getByText('返回首页')).toBeInTheDocument();
  });

  it('点击返回首页按钮导航到首页', () => {
    const { getByText } = renderPage(<FoodCalorieNotFound />);
    getByText('返回首页').click();
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('NavBar 显示"页面未找到"标题', () => {
    const { container } = renderPage(<FoodCalorieNotFound />);
    const navTitle = container.querySelector('[data-name="nav-title"]');
    expect(navTitle).toBeInTheDocument();
    expect(navTitle.textContent).toBe('页面未找到');
  });
});
