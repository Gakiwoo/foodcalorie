// 食谱详情页冒烟测试：验证食谱内容、营养成分、食材步骤、收藏功能
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieRecipe from '../../FoodCalorie-Recipe.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    del: vi.fn()
  }
}));

import { http } from '../api/client';

const mockRecipe = {
  id: 101,
  title: '鸡胸肉沙拉',
  summary: '高蛋白低脂减脂餐',
  body: '这是食谱正文',
  author: '营养师小王',
  views: 512,
  cover_icon: '🥗',
  type: 'recipe',
  calories: 185,
  protein_g: 28,
  carbs_g: 10,
  fat_g: 5,
  ingredients: ['鸡胸肉 100g', '生菜 50g', '橄榄油 5ml', '黑胡椒适量'],
  steps: ['鸡胸肉切块，用黑胡椒腌制 10 分钟', '平底锅少油煎至两面金黄', '生菜洗净铺底，放上煎好的鸡胸肉', '淋上少许橄榄油即可']
};

describe('FoodCalorieRecipe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockImplementation((path) => {
      if (path.includes('/contents/')) return Promise.resolve({ data: mockRecipe });
      if (path.includes('/favorites')) return Promise.resolve({ data: [] });
      return Promise.resolve({ data: {} });
    });
    http.post.mockResolvedValue({});
    http.del.mockResolvedValue({});
  });

  it('带 id 参数时初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"食谱"和收藏图标', async () => {
    const { findByText, container } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('食谱')).toBeInTheDocument();
    expect(container.querySelector('.fa-bookmark')).toBeInTheDocument();
  });

  it('加载成功后渲染食谱标题"鸡胸肉沙拉"', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('鸡胸肉沙拉')).toBeInTheDocument();
  });

  it('渲染食谱摘要"高蛋白低脂减脂餐"', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('高蛋白低脂减脂餐')).toBeInTheDocument();
  });

  it('渲染作者和阅读量', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText(/营养师小王/)).toBeInTheDocument();
    expect(await findByText(/512 阅读/)).toBeInTheDocument();
  });

  it('渲染营养成分（热量 185/蛋白质 28/碳水 10/脂肪 5）', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('185')).toBeInTheDocument();
    expect(await findByText('28')).toBeInTheDocument();
    expect(await findByText('10')).toBeInTheDocument();
    expect(await findByText('5')).toBeInTheDocument();
  });

  it('渲染"所需食材"标题和食材列表', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('所需食材')).toBeInTheDocument();
    expect(await findByText('鸡胸肉 100g')).toBeInTheDocument();
    expect(await findByText('生菜 50g')).toBeInTheDocument();
  });

  it('渲染"烹饪步骤"标题和步骤列表', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    expect(await findByText('烹饪步骤')).toBeInTheDocument();
    expect(await findByText(/鸡胸肉切块/)).toBeInTheDocument();
    expect(await findByText(/平底锅少油煎/)).toBeInTheDocument();
  });

  it('无 id 参数时显示"内容不存在或已删除"', async () => {
    const { findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe' });
    expect(await findByText('内容不存在或已删除')).toBeInTheDocument();
  });

  it('调用 contents/:id API 获取食谱详情', async () => {
    renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/contents/101');
  });

  it('点击收藏图标调用收藏 API', async () => {
    const { container, findByText } = renderPage(<FoodCalorieRecipe />, { route: '/recipe?id=101' });
    await findByText('鸡胸肉沙拉');
    const bookmarkIcon = container.querySelector('.fa-bookmark');
    fireEvent.click(bookmarkIcon);
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/favorites',
      expect.objectContaining({ type: 'recipe', ref_id: 101 })
    );
  });
});
