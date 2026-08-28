// 我的收藏页冒烟测试：验证收藏列表、空状态、loading 状态、取消收藏
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieFavorites from '../../FoodCalorie-Favorites.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    del: vi.fn()
  }
}));

import { http } from '../api/client';

const mockFavorites = [
  { id: 1, type: 'recipe', ref_id: 101, title: '鸡胸肉沙拉', summary: '高蛋白低脂减脂餐', cover_icon: '🥗', calories: 185 },
  { id: 2, type: 'article', ref_id: 202, title: '减脂期怎么吃', summary: '科学饮食指南', cover_icon: '📄', calories: 0 }
];

describe('FoodCalorieFavorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockFavorites });
    http.del.mockResolvedValue({});
  });

  it('渲染 NavBar 标题"我的收藏"', () => {
    const { container } = renderPage(<FoodCalorieFavorites />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('我的收藏');
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieFavorites />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('空数据显示 EmptyState（"还没有收藏内容"）', async () => {
    http.get.mockResolvedValue({ data: [] });
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('还没有收藏内容')).toBeInTheDocument();
    expect(await findByText('去发现页逛逛')).toBeInTheDocument();
  });

  it('加载成功后渲染食谱收藏（鸡胸肉沙拉）', async () => {
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
  });

  it('加载成功后渲染文章收藏（减脂期怎么吃）', async () => {
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('减脂期怎么吃')).toBeInTheDocument();
  });

  it('食谱卡片显示"食谱"标签和热量', async () => {
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('食谱')).toBeInTheDocument();
    expect(await findByText(/185/)).toBeInTheDocument();
  });

  it('文章卡片显示"文章"标签', async () => {
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('文章')).toBeInTheDocument();
  });

  it('收藏卡片显示摘要', async () => {
    const { findByText } = renderPage(<FoodCalorieFavorites />);
    expect(await findByText('高蛋白低脂减脂餐')).toBeInTheDocument();
    expect(await findByText('科学饮食指南')).toBeInTheDocument();
  });

  it('每个收藏卡片有收藏图标（fa-bookmark）', async () => {
    const { container, findByText } = renderPage(<FoodCalorieFavorites />);
    await findByText('鸡胸肉沙拉');
    const bookmarks = container.querySelectorAll('.fa-bookmark');
    expect(bookmarks.length).toBeGreaterThanOrEqual(2);
  });

  it('调用 favorites API 获取收藏列表', async () => {
    renderPage(<FoodCalorieFavorites />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/favorites');
  });

  it('点击收藏图标调用取消收藏 API', async () => {
    const { container, findByText } = renderPage(<FoodCalorieFavorites />);
    await findByText('鸡胸肉沙拉');
    const firstBookmark = container.querySelector('[data-name="fav-card-1"] .fa-bookmark');
    fireEvent.click(firstBookmark);
    await waitFor(() => expect(http.del).toHaveBeenCalled());
    expect(http.del).toHaveBeenCalledWith(expect.stringContaining('/api/v1/foodcalorie/favorites?type=recipe&ref_id=101'));
  });
});
