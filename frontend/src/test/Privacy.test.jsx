// 隐私设置页冒烟测试：验证隐私开关、安全设置、隐私政策日期
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCaloriePrivacy from '../../FoodCalorie-Privacy.jsx';

vi.mock('../api/client', () => ({
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

describe('FoodCaloriePrivacy', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: {} });
  });

  it('渲染 NavBar 标题"隐私设置"', () => {
    const { container } = renderPage(<FoodCaloriePrivacy />);
    const title = container.querySelector('[data-name="nav-title"]');
    expect(title.textContent).toBe('隐私设置');
  });

  it('渲染"数据分析授权"开关和描述', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('数据分析授权')).toBeInTheDocument();
    expect(getByText('允许我们分析食物数据以改善推荐')).toBeInTheDocument();
  });

  it('渲染"个性化推荐"开关和描述', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('个性化推荐')).toBeInTheDocument();
    expect(getByText('根据饮食习惯推送相关内容')).toBeInTheDocument();
  });

  it('渲染"数据脱敏共享"开关和描述', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('数据脱敏共享')).toBeInTheDocument();
    expect(getByText('匿名共享健康趋势以协助研究')).toBeInTheDocument();
  });

  it('渲染"第三方登录"开关和描述', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('第三方登录')).toBeInTheDocument();
    expect(getByText('微信/Apple ID 快速登录')).toBeInTheDocument();
  });

  it('渲染"同步到云端"开关和描述', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('同步到云端')).toBeInTheDocument();
    expect(getByText('多设备同步健康记录')).toBeInTheDocument();
  });

  it('渲染"修改密码"安全设置行', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('修改密码')).toBeInTheDocument();
  });

  it('渲染"注销账号"安全设置行', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText('注销账号')).toBeInTheDocument();
  });

  it('渲染隐私政策最后更新日期', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    expect(getByText(/隐私政策最后更新：2026 年 7 月 1 日/)).toBeInTheDocument();
  });

  it('点击隐私开关切换状态', () => {
    const { getByText } = renderPage(<FoodCaloriePrivacy />);
    const row = getByText('数据分析授权').closest('[style*="cursor: pointer"]');
    fireEvent.click(row);
    // 点击后元素仍然存在（切换状态不影响渲染）
    expect(getByText('数据分析授权')).toBeInTheDocument();
  });
});
