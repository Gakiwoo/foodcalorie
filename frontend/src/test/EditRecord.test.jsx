// 编辑记录页冒烟测试：验证表单字段、餐次选择、保存功能
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieEditRecord from '../../FoodCalorie-EditRecord.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockRecord = {
  id: 1,
  food_name: '红烧牛肉面',
  meal_type: '午餐',
  calories: 520,
  protein_g: 28,
  carbs_g: 65,
  fat_g: 18,
  portion: '1 碗',
  record_time: '2026-08-26 12:30'
};

describe('FoodCalorieEditRecord', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockRecord });
    http.put.mockResolvedValue({});
  });

  it('带 id 参数时初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"编辑记录"和保存按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByText('编辑记录')).toBeInTheDocument();
    expect(await findByText('保存')).toBeInTheDocument();
  });

  it('渲染食物名称输入框（默认值"红烧牛肉面"）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('红烧牛肉面')).toBeInTheDocument();
  });

  it('渲染"餐次"标签和 Seg 选项（早餐/午餐/晚餐/加餐）', async () => {
    const { findByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByText('餐次')).toBeInTheDocument();
    expect(await findByText('早餐')).toBeInTheDocument();
    expect(await findByText('午餐')).toBeInTheDocument();
    expect(await findByText('晚餐')).toBeInTheDocument();
    expect(await findByText('加餐')).toBeInTheDocument();
  });

  it('渲染热量输入框（默认值 520）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('520')).toBeInTheDocument();
  });

  it('渲染蛋白质输入框（默认值 28）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('28')).toBeInTheDocument();
  });

  it('渲染碳水输入框（默认值 65）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('65')).toBeInTheDocument();
  });

  it('渲染脂肪输入框（默认值 18）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('18')).toBeInTheDocument();
  });

  it('渲染份量输入框（默认值"1 碗"）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('1 碗')).toBeInTheDocument();
  });

  it('渲染记录时间输入框（默认值"2026-08-26 12:30"）', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByDisplayValue('2026-08-26 12:30')).toBeInTheDocument();
  });

  it('渲染"保存修改"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    expect(await findByText('保存修改')).toBeInTheDocument();
  });

  it('无 id 参数时显示"缺少记录参数"', async () => {
    const { findByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit' });
    expect(await findByText('缺少记录参数')).toBeInTheDocument();
  });

  it('点击保存修改调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    const btn = await findByText('保存修改');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/records/1',
      expect.objectContaining({ food_name: '红烧牛肉面', calories: 520 })
    );
  });

  it('调用 records/:id API 获取记录详情', async () => {
    renderPage(<FoodCalorieEditRecord />, { route: '/edit?id=1' });
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/records/1');
  });
});
