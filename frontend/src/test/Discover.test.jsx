// 发现页冒烟测试：验证搜索框、tab 切换、挑战横幅、内容列表、loading/empty 状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieDiscover from '../../FoodCalorie-Discover.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn()
  }
}));

import { http } from '../api/client';

const mockContents = [
  { id: 1, type: 'recipe', title: '鸡胸肉沙拉', summary: '高蛋白低脂减脂餐', cover_icon: '🥗', calories: 185, protein_g: 28 },
  { id: 2, type: 'article', title: '减脂期怎么吃', summary: '科学饮食指南', cover_icon: '📄', author: '营养师小王', views: 1024 }
];

describe('FoodCalorieDiscover', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: { list: mockContents } });
  });

  it('渲染顶部标题"发现"和通知图标', () => {
    const { container } = renderPage(<FoodCalorieDiscover />);
    // 顶部标题区域（非 BottomNav）
    const topTitle = Array.from(container.querySelectorAll('span')).find(
      (el) => el.textContent === '发现' && el.style.fontSize === '20px'
    );
    expect(topTitle).toBeInTheDocument();
    expect(container.querySelector('.fa-bell')).toBeInTheDocument();
  });

  it('渲染搜索框（placeholder="搜索食谱、减脂知识…"）', () => {
    const { getByPlaceholderText } = renderPage(<FoodCalorieDiscover />);
    expect(getByPlaceholderText('搜索食谱、减脂知识…')).toBeInTheDocument();
  });

  it('渲染 tab 切换（全部/食谱/文章）', () => {
    const { getByText } = renderPage(<FoodCalorieDiscover />);
    expect(getByText('全部')).toBeInTheDocument();
    expect(getByText('食谱')).toBeInTheDocument();
    expect(getByText('文章')).toBeInTheDocument();
  });

  it('渲染挑战横幅（"夏季轻食挑战"）', () => {
    const { getByText } = renderPage(<FoodCalorieDiscover />);
    expect(getByText('夏季轻食挑战')).toBeInTheDocument();
    expect(getByText('21 天打卡计划')).toBeInTheDocument();
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieDiscover />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染食谱卡片（鸡胸肉沙拉）', async () => {
    const { findByText } = renderPage(<FoodCalorieDiscover />);
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
  });

  it('加载成功后渲染文章卡片（减脂期怎么吃）', async () => {
    const { findByText } = renderPage(<FoodCalorieDiscover />);
    expect(await findByText('减脂期怎么吃')).toBeInTheDocument();
  });

  it('食谱卡片显示热量和蛋白', async () => {
    const { findByText } = renderPage(<FoodCalorieDiscover />);
    expect(await findByText(/185/)).toBeInTheDocument();
    expect(await findByText(/28/)).toBeInTheDocument();
  });

  it('文章卡片显示作者和阅读量', async () => {
    const { findByText } = renderPage(<FoodCalorieDiscover />);
    expect(await findByText(/营养师小王/)).toBeInTheDocument();
    expect(await findByText(/1024 阅读/)).toBeInTheDocument();
  });

  it('点击"食谱"tab 只显示食谱', async () => {
    const { getByText, queryByText, findByText } = renderPage(<FoodCalorieDiscover />);
    await findByText('鸡胸肉沙拉');
    fireEvent.click(getByText('食谱'));
    expect(getByText('鸡胸肉沙拉')).toBeInTheDocument();
    expect(queryByText('减脂期怎么吃')).not.toBeInTheDocument();
  });

  it('点击"文章"tab 只显示文章', async () => {
    const { getByText, queryByText, findByText } = renderPage(<FoodCalorieDiscover />);
    await findByText('鸡胸肉沙拉');
    fireEvent.click(getByText('文章'));
    expect(getByText('减脂期怎么吃')).toBeInTheDocument();
    expect(queryByText('鸡胸肉沙拉')).not.toBeInTheDocument();
  });

  it('空数据显示 EmptyState（"暂无内容"）', async () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { findByText } = renderPage(<FoodCalorieDiscover />);
    expect(await findByText('暂无内容')).toBeInTheDocument();
  });

  it('调用 contents API 获取内容列表', async () => {
    renderPage(<FoodCalorieDiscover />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/contents',
      expect.objectContaining({ pageSize: 50 })
    );
  });

  it('渲染底部导航栏（discover 激活）', () => {
    const { container } = renderPage(<FoodCalorieDiscover />);
    expect(container.querySelector('[data-name="bottom-nav"]')).toBeInTheDocument();
  });
});
