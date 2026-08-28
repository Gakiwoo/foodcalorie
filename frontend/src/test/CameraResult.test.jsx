// 拍照识别结果页冒烟测试：验证识别结果、营养数据、确认添加
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, waitFor } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieCameraResult from '../../FoodCalorie-CameraResult.jsx';

vi.mock('../api/client', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { http } from '../api/client';

const mockCandidates = [
  {
    id: 1,
    name: '红烧牛肉面',
    category: '主食',
    calories: 520,
    protein_g: 28,
    carbs_g: 65,
    fat_g: 18,
    confidence: 0.92,
    unit_desc: '1碗',
    ingredients: ['牛肉', '面条', '青菜', '葱花']
  },
  {
    id: 2,
    name: '番茄鸡蛋面',
    category: '主食',
    calories: 380,
    protein_g: 18,
    carbs_g: 55,
    fat_g: 10,
    confidence: 0.75,
    unit_desc: '1碗'
  }
];

describe('FoodCalorieCameraResult', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: {} });
    http.post.mockResolvedValue({});
  });

  it('无候选数据时显示"请先拍照识别"和"去拍照"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, { route: '/camera-result' });
    expect(getByText('请先拍照识别')).toBeInTheDocument();
    expect(getByText('去拍照')).toBeInTheDocument();
  });

  it('渲染 NavBar 标题"识别结果"和分享图标', () => {
    const { container } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('识别结果');
    expect(container.querySelector('.fa-share-nodes')).toBeInTheDocument();
  });

  it('渲染食物名称"红烧牛肉面"', () => {
    const { getAllByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getAllByText('红烧牛肉面').length).toBeGreaterThan(0);
  });

  it('渲染"AI 智能识别"标签', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('AI 智能识别')).toBeInTheDocument();
  });

  it('渲染置信度 92%', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('92%')).toBeInTheDocument();
  });

  it('渲染餐次"午餐"和类别"主食"', () => {
    const { getAllByText, container } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getAllByText('午餐').length).toBeGreaterThan(0);
    // 类别"主食"可能与其他文本在同一元素中，用 textContent 匹配
    const hasCategory = Array.from(container.querySelectorAll('span')).some(
      el => el.textContent && el.textContent.includes('主食')
    );
    expect(hasCategory).toBe(true);
  });

  it('渲染份量选择器（1 份）', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('1 份')).toBeInTheDocument();
  });

  it('渲染"其他候选"折叠区域', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('其他候选')).toBeInTheDocument();
  });

  it('渲染"营养数据"标题', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('营养数据')).toBeInTheDocument();
  });

  it('渲染营养数据（热量 520/蛋白质 28/碳水 65/脂肪 18）', () => {
    const { container } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    // 营养数据数字可能与单位在同一元素中，用 textContent 匹配
    const text = container.textContent;
    expect(text).toContain('520');
    expect(text).toContain('28');
    expect(text).toContain('65');
    expect(text).toContain('18');
  });

  it('渲染"AI 检测食材"标题和食材数量', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('AI 检测食材')).toBeInTheDocument();
    expect(getByText('4 种')).toBeInTheDocument();
  });

  it('渲染食材标签（牛肉/面条/青菜/葱花）', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('牛肉')).toBeInTheDocument();
    expect(getByText('面条')).toBeInTheDocument();
    expect(getByText('青菜')).toBeInTheDocument();
    expect(getByText('葱花')).toBeInTheDocument();
  });

  it('渲染"重新拍照"和"确认添加"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    expect(getByText('重新拍照')).toBeInTheDocument();
    expect(getByText('确认添加')).toBeInTheDocument();
  });

  it('点击确认添加调用 records API', async () => {
    const { getByText } = renderPage(<FoodCalorieCameraResult />, {
      route: '/camera-result',
      state: { candidates: mockCandidates }
    });
    fireEvent.click(getByText('确认添加'));
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post).toHaveBeenCalledWith(
      '/api/v1/foodcalorie/records',
      expect.objectContaining({ food_name: '红烧牛肉面', source: 'AI识别' })
    );
  });
});
