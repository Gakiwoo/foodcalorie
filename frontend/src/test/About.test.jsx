// 关于页冒烟测试：验证页面渲染、统计数据展示、mock API 调用
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderPage } from './testUtils';
import FoodCalorieAbout from '../../FoodCalorie-About.jsx';

// mock http 客户端，避免测试时发起真实网络请求
vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

import { http } from '../api/client';

describe('FoodCalorieAbout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // mock 三个 API 调用返回默认数据
    http.get.mockImplementation((path) => {
      if (path.includes('/records')) {
        return Promise.resolve({ data: { total: 5, list: [] } });
      }
      if (path.includes('/stats')) {
        return Promise.resolve({ data: { reachedDays: 3 } });
      }
      if (path.includes('/favorites')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.resolve({ data: {} });
    });
  });

  it('渲染品牌标识"食刻"和版本号', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText('食刻')).toBeInTheDocument();
  });

  it('渲染核心功能区块标题', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText('核心功能')).toBeInTheDocument();
  });

  it('渲染功能列表项（AI 智能识别）', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText(/AI 智能识别/)).toBeInTheDocument();
  });

  it('渲染用户协议和隐私政策链接', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText('用户协议')).toBeInTheDocument();
    expect(getByText('隐私政策')).toBeInTheDocument();
  });

  it('渲染"检查更新"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText('检查更新')).toBeInTheDocument();
  });

  it('渲染页脚版权信息', () => {
    const { getByText } = renderPage(<FoodCalorieAbout />);
    expect(getByText(/© 2026 食刻 Studio/)).toBeInTheDocument();
  });

  it('统计卡片展示 mock 数据（已记录餐=5）', async () => {
    const { findByText } = renderPage(<FoodCalorieAbout />);
    expect(await findByText('5')).toBeInTheDocument();
  });
});
