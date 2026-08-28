// 搜索页冒烟测试：验证搜索框、餐次筛选、空状态、搜索结果、排序切换
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieSearch from '../../FoodCalorie-Search.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { http } from '../api/client';

const mockSearchResults = [
  { id: 1, name: '鸡胸肉', category: '肉蛋', unit_desc: '100g', calories: 165, protein_g: 31, carbs_g: 0, fat_g: 3.6 },
  { id: 2, name: '鸡胸肉丸', category: '肉蛋', unit_desc: '100g', calories: 120, protein_g: 20, carbs_g: 5, fat_g: 2 }
];

describe('FoodCalorieSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: { list: [] } });
  });

  it('渲染返回按钮和搜索框', () => {
    const { container, getByPlaceholderText } = renderPage(<FoodCalorieSearch />);
    expect(container.querySelector('.fa-chevron-left')).toBeInTheDocument();
    expect(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）')).toBeInTheDocument();
  });

  it('渲染餐次筛选（全部/早餐/午餐/晚餐/加餐）', () => {
    const { getByText } = renderPage(<FoodCalorieSearch />);
    expect(getByText('全部')).toBeInTheDocument();
    expect(getByText('早餐')).toBeInTheDocument();
    expect(getByText('午餐')).toBeInTheDocument();
    expect(getByText('晚餐')).toBeInTheDocument();
    expect(getByText('加餐')).toBeInTheDocument();
  });

  it('初始空状态显示"输入关键词搜索食物库"', () => {
    const { getByText } = renderPage(<FoodCalorieSearch />);
    expect(getByText('输入关键词搜索食物库')).toBeInTheDocument();
  });

  it('初始空状态显示搜索图标', () => {
    const { container } = renderPage(<FoodCalorieSearch />);
    // 空状态区域有一个大的搜索图标
    const icons = container.querySelectorAll('.fa-magnifying-glass');
    expect(icons.length).toBeGreaterThanOrEqual(1);
  });

  it('输入关键词后调用 foods API 搜索', async () => {
    http.get.mockResolvedValue({ data: { list: mockSearchResults } });
    const { getByPlaceholderText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    await waitFor(() => {
      const calls = http.get.mock.calls.map((c) => c[0]);
      expect(calls).toContain('/api/v1/foodcalorie/foods');
    });
    const foodCall = http.get.mock.calls.find((c) => c[0] === '/api/v1/foodcalorie/foods');
    expect(foodCall[1]).toEqual(expect.objectContaining({ keyword: '鸡胸' }));
  });

  it('搜索结果显示"找到 N 条结果"', async () => {
    http.get.mockResolvedValue({ data: { list: mockSearchResults } });
    const { getByPlaceholderText, findByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    expect(await findByText('找到 2 条结果')).toBeInTheDocument();
  });

  it('搜索结果渲染食物名称和热量', async () => {
    http.get.mockResolvedValue({ data: { list: mockSearchResults } });
    const { getByPlaceholderText, findByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    expect(await findByText('鸡胸肉')).toBeInTheDocument();
    expect(await findByText('鸡胸肉丸')).toBeInTheDocument();
  });

  it('搜索结果显示排序切换按钮（默认排序）', async () => {
    http.get.mockResolvedValue({ data: { list: mockSearchResults } });
    const { getByPlaceholderText, findByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    expect(await findByText('默认排序')).toBeInTheDocument();
  });

  it('点击排序切换为"热量从低到高"', async () => {
    http.get.mockResolvedValue({ data: { list: mockSearchResults } });
    const { getByPlaceholderText, findByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    const sortBtn = await findByText('默认排序');
    fireEvent.click(sortBtn);
    expect(await findByText('热量从低到高')).toBeInTheDocument();
  });

  it('搜索无结果显示"没有找到「xxx」"', async () => {
    http.get.mockResolvedValue({ data: { list: [] } });
    const { getByPlaceholderText, findByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '不存在的食物' } });
    expect(await findByText(/没有找到「不存在的食物」/)).toBeInTheDocument();
  });

  it('搜索中显示"搜索中…"', async () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieSearch />);
    fireEvent.change(getByPlaceholderText('搜索食物（如：鸡胸肉、米饭）'), { target: { value: '鸡胸' } });
    // 等待防抖后显示 loading
    await waitFor(() => expect(getByText('搜索中…')).toBeInTheDocument());
  });
});
