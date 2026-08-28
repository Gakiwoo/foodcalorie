// 文章详情页冒烟测试：验证文章内容、收藏功能、loading/不存在状态
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieArticle from '../../FoodCalorie-Article.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn()
  }
}));

import { http } from '../api/client';

const mockArticle = {
  id: 202,
  title: '减脂期怎么吃',
  summary: '科学饮食指南',
  body: '这是一篇关于减脂期饮食的文章内容。\n\n第一点：控制总热量摄入。\n第二点：保证蛋白质摄入。\n第三点：多吃蔬菜水果。',
  author: '营养师小王',
  views: 1024,
  cover_icon: '📄',
  type: 'article'
};

describe('FoodCalorieArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockImplementation((path) => {
      if (path.includes('/contents/')) return Promise.resolve({ data: mockArticle });
      if (path.includes('/favorites')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    http.post.mockResolvedValue({});
    http.del.mockResolvedValue({});
  });

  it('带 id 参数时初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"文章"和收藏图标', async () => {
    const { findByText, container } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    expect(await findByText('文章')).toBeInTheDocument();
    expect(container.querySelector('.fa-bookmark')).toBeInTheDocument();
  });

  it('加载成功后渲染文章标题"减脂期怎么吃"', async () => {
    const { findByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    expect(await findByText('减脂期怎么吃')).toBeInTheDocument();
  });

  it('渲染文章作者和阅读量', async () => {
    const { findByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    expect(await findByText(/营养师小王/)).toBeInTheDocument();
    expect(await findByText(/1024 阅读/)).toBeInTheDocument();
  });

  it('渲染文章正文内容', async () => {
    const { findByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    expect(await findByText(/控制总热量摄入/)).toBeInTheDocument();
    expect(await findByText(/保证蛋白质摄入/)).toBeInTheDocument();
  });

  it('无 id 参数时显示"内容不存在或已删除"', async () => {
    const { findByText } = renderPage(<FoodCalorieArticle />, { route: '/article' });
    expect(await findByText('内容不存在或已删除')).toBeInTheDocument();
  });

  it('调用 contents/:id API 获取文章详情', async () => {
    renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/contents/202');
  });

  it('调用 favorites API 检查收藏状态', async () => {
    renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    await waitFor(() => {
      const favCalls = http.get.mock.calls.filter((c) => c[0].includes('/favorites'));
      expect(favCalls.length).toBeGreaterThan(0);
    });
  });

  it('点击收藏图标调用收藏 API', async () => {
    const { container, findByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    await findByText('减脂期怎么吃');
    const bookmarkIcon = container.querySelector('.fa-bookmark');
    fireEvent.click(bookmarkIcon);
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/favorites',
      expect.objectContaining({ type: 'article', ref_id: 202 })
    );
  });

  it('已收藏状态下点击收藏图标调用取消收藏 API', async () => {
    // mock favorites 返回已收藏
    http.get.mockImplementation((path) => {
      if (path.includes('/contents/')) return Promise.resolve({ data: mockArticle });
      if (path.includes('/favorites')) return Promise.resolve({ data: [{ ref_id: 202, type: 'article' }] });
      return Promise.resolve({ data: {} });
    });
    const { container, findByText } = renderPage(<FoodCalorieArticle />, { route: '/article?id=202' });
    await findByText('减脂期怎么吃');
    // 等待收藏状态加载完成
    await waitFor(() => {
      const bookmarkIcon = container.querySelector('.fa-bookmark');
      expect(bookmarkIcon.style.color).toBe('rgb(52, 199, 89)');
    });
    const bookmarkIcon = container.querySelector('.fa-bookmark');
    fireEvent.click(bookmarkIcon);
    await waitFor(() => expect(http.del).toHaveBeenCalled());
    expect(http.del).toHaveBeenCalledWith(expect.stringContaining('/api/v1/foodcalorie/favorites?type=article&ref_id=202'));
  });
});
