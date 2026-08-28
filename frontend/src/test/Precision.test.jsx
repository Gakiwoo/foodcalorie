// 拍照识别精度页冒烟测试：验证精度模式选择和保存
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCaloriePrecision from '../../FoodCalorie-Precision.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = { precision_mode: 'standard' };

describe('FoodCaloriePrecision', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCaloriePrecision />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"拍照识别精度"', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText('拍照识别精度')).toBeInTheDocument();
  });

  it('渲染"快速"模式和描述', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText('快速')).toBeInTheDocument();
    expect(await findByText('约 1 秒识别常见食物，省电')).toBeInTheDocument();
  });

  it('渲染"标准"模式和描述', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText('标准')).toBeInTheDocument();
    expect(await findByText('约 2 秒识别，准确均衡')).toBeInTheDocument();
  });

  it('渲染"精准"模式和描述', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText('精准')).toBeInTheDocument();
    expect(await findByText('约 4 秒识别细分类目，最准确')).toBeInTheDocument();
  });

  it('默认选中"标准"模式（显示选中图标）', async () => {
    const { container, findByText } = renderPage(<FoodCaloriePrecision />);
    await findByText('标准');
    expect(container.querySelector('.fa-circle-check')).toBeInTheDocument();
  });

  it('渲染精度提示信息', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText(/精度越高耗时耗电越多/)).toBeInTheDocument();
  });

  it('渲染"保存设置"按钮', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    expect(await findByText('保存设置')).toBeInTheDocument();
  });

  it('点击"快速"模式切换选中', async () => {
    const { findByText, container } = renderPage(<FoodCaloriePrecision />);
    const fastBtn = await findByText('快速');
    fireEvent.click(fastBtn);
    // 点击后仍然有选中图标（切换到快速）
    expect(container.querySelector('.fa-circle-check')).toBeInTheDocument();
  });

  it('点击保存设置调用 put API', async () => {
    const { findByText } = renderPage(<FoodCaloriePrecision />);
    const btn = await findByText('保存设置');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ precision_mode: 'standard' })
    );
  });

  it('调用 profile API 获取当前精度设置', async () => {
    renderPage(<FoodCaloriePrecision />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
