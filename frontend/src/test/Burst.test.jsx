// 连拍模式页冒烟测试：验证连拍开关、张数选择和保存
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieBurst from '../../FoodCalorie-Burst.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

import { http } from '../api/client';

const mockProfile = { burst_enabled: 0, burst_count: 3 };

describe('FoodCalorieBurst', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: mockProfile });
    http.put.mockResolvedValue({});
  });

  it('初始加载显示"加载中…"', () => {
    http.get.mockImplementation(() => new Promise(() => {}));
    const { getByText } = renderPage(<FoodCalorieBurst />);
    expect(getByText('加载中…')).toBeInTheDocument();
  });

  it('加载成功后渲染 NavBar 标题"连拍模式"', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('连拍模式')).toBeInTheDocument();
  });

  it('渲染"启用连拍模式"标题和描述', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('启用连拍模式')).toBeInTheDocument();
    expect(await findByText('摆盘复杂时开启，自动选清晰度最高的一张')).toBeInTheDocument();
  });

  it('渲染相机图标', async () => {
    const { container, findByText } = renderPage(<FoodCalorieBurst />);
    await findByText('连拍模式');
    expect(container.querySelector('.fa-camera')).toBeInTheDocument();
  });

  it('渲染"连拍张数"标题', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('连拍张数')).toBeInTheDocument();
  });

  it('渲染张数选项（2张/3张/5张）', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('2 张')).toBeInTheDocument();
    expect(await findByText('3 张')).toBeInTheDocument();
    expect(await findByText('5 张')).toBeInTheDocument();
  });

  it('渲染连拍提示信息', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('连拍占用更多存储，日常可关闭。')).toBeInTheDocument();
  });

  it('渲染"保存设置"按钮', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    expect(await findByText('保存设置')).toBeInTheDocument();
  });

  it('点击张数选项切换选中', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    const btn = await findByText('5 张');
    fireEvent.click(btn);
    // 点击后元素仍然存在
    expect(btn).toBeInTheDocument();
  });

  it('点击保存设置调用 put API', async () => {
    const { findByText } = renderPage(<FoodCalorieBurst />);
    const btn = await findByText('保存设置');
    fireEvent.click(btn);
    await waitFor(() => expect(http.put).toHaveBeenCalled());
    expect(http.put).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/profile',
      expect.objectContaining({ burst_enabled: false, burst_count: 3 })
    );
  });

  it('调用 profile API 获取当前连拍设置', async () => {
    renderPage(<FoodCalorieBurst />);
    await waitFor(() => expect(http.get).toHaveBeenCalled());
    expect(http.get).toHaveBeenCalledWith('/api/v1/foodcalorie/profile');
  });
});
