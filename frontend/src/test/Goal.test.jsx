// 目标设置页冒烟测试：验证健康目标选择、目标热量输入、保存功能
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieGoal from '../../FoodCalorie-Goal.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = { goal_type: '减脂', target_calories: 1400 };

describe('FoodCalorieGoal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieGoal />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"目标设置"', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('目标设置')).toBeInTheDocument();
  });

  it('渲染"健康目标"标题', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('健康目标')).toBeInTheDocument();
  });

  it('渲染三个目标选项（减脂/保持/增肌）', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('减脂')).toBeInTheDocument();
    expect(await findByText('保持')).toBeInTheDocument();
    expect(await findByText('增肌')).toBeInTheDocument();
  });

  it('渲染目标描述（控制热量缺口/维持当前体重/高蛋白+适度热量盈余）', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('控制热量缺口，稳步下降')).toBeInTheDocument();
    expect(await findByText('维持当前体重与状态')).toBeInTheDocument();
    expect(await findByText('高蛋白 + 适度热量盈余')).toBeInTheDocument();
  });

  it('默认选中"减脂"目标（显示选中图标）', async () => {
    const { container, findByText } = renderPage(<FoodCalorieGoal />);
    await findByText('减脂');
    expect(container.querySelector('.fa-circle-check')).toBeInTheDocument();
  });

  it('渲染"每日目标热量"标题和范围提示', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('每日目标热量')).toBeInTheDocument();
    expect(await findByText(/范围 800-6000 kcal/)).toBeInTheDocument();
  });

  it('目标热量输入框显示默认值 1400', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieGoal />);
    expect(await findByDisplayValue('1400')).toBeInTheDocument();
  });

  it('渲染"kcal / 天"单位标签', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('kcal / 天')).toBeInTheDocument();
  });

  it('渲染"保存目标"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    expect(await findByText('保存目标')).toBeInTheDocument();
  });

  it('点击"保持"目标切换选中状态', async () => {
    const { findByText, container } = renderPage(<FoodCalorieGoal />);
    const keepBtn = await findByText('保持');
    fireEvent.click(keepBtn);
    // 点击后应该仍然有选中图标（切换到保持）
    expect(container.querySelector('.fa-circle-check')).toBeInTheDocument();
  });

  it('修改目标热量输入框值', async () => {
    const { findByDisplayValue } = renderPage(<FoodCalorieGoal />);
    const input = await findByDisplayValue('1400');
    fireEvent.change(input, { target: { value: '1600' } });
    expect(input.value).toBe('1600');
  });

  it('点击保存目标调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieGoal />);
    const btn = await findByText('保存目标');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ goal_type: '减脂', target_calories: 1400 })
    );
  });

  it('调用 profile API 获取当前目标设置', async () => {
    renderPage(<FoodCalorieGoal />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
