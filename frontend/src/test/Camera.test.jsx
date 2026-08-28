// 拍照识别页冒烟测试：验证取景器、工具栏、快门按钮
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderPage } from './testUtils';
import FoodCalorieCamera from '../../FoodCalorie-Camera.jsx';

vi.mock('../api/client', () => ({
  upload: { post: vi.fn() },
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

describe('FoodCalorieCamera', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: {} });
  });

  it('渲染 NavBar 标题"拍照识别"和闪光灯图标', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('拍照识别');
    expect(container.querySelector('[data-name="nav-flash"]')).toBeInTheDocument();
  });

  it('渲染取景器区域', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="viewfinder"]')).toBeInTheDocument();
  });

  it('渲染对焦框', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="focus-frame"]')).toBeInTheDocument();
  });

  it('渲染对焦框内的相机图标', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="focus-icon"]')).toBeInTheDocument();
  });

  it('渲染"对准食物"提示文字', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="focus-text"]').textContent).toBe('对准食物');
  });

  it('渲染取景器底部提示文字', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="hint-text"]').textContent).toContain('将食物放入框内');
  });

  it('渲染底部工具栏', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="toolbar"]')).toBeInTheDocument();
  });

  it('渲染相册按钮', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="btn-gallery"]')).toBeInTheDocument();
  });

  it('渲染快门按钮', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="shutter"]')).toBeInTheDocument();
    expect(container.querySelector('[data-name="shutter-inner"]')).toBeInTheDocument();
  });

  it('渲染切换摄像头按钮', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    expect(container.querySelector('[data-name="btn-flip"]')).toBeInTheDocument();
  });

  it('渲染隐藏的 file input', () => {
    const { container } = renderPage(<FoodCalorieCamera />);
    const input = container.querySelector('input[type="file"]');
    expect(input).toBeInTheDocument();
    expect(input.accept).toBe('image/*');
  });
});
