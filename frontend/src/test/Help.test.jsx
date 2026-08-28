// 帮助反馈页冒烟测试：验证常见问题、意见反馈、联系客服
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieHelp from '../../FoodCalorie-Help.jsx';

vi.mock('../api/client', () => ({
  http: { get: vi.fn() }
}));

import { http } from '../api/client';

describe('FoodCalorieHelp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.get.mockResolvedValue({ data: {} });
  });

  it('渲染顶部标题"帮助与反馈"和返回按钮', () => {
    const { getByText, container } = renderPage(<FoodCalorieHelp />);
    expect(getByText('帮助与反馈')).toBeInTheDocument();
    expect(container.querySelector('.fa-chevron-left')).toBeInTheDocument();
  });

  it('渲染"常见问题"标题', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('常见问题')).toBeInTheDocument();
  });

  it('渲染 4 个常见问题', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('如何修改每日卡路里目标？')).toBeInTheDocument();
    expect(getByText('拍照识别不准怎么办？')).toBeInTheDocument();
    expect(getByText('如何导出我的健康数据？')).toBeInTheDocument();
    expect(getByText('更换手机后数据会丢失吗？')).toBeInTheDocument();
  });

  it('渲染"查看全部问题"链接', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('查看全部问题')).toBeInTheDocument();
  });

  it('渲染"意见反馈"标题', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('意见反馈')).toBeInTheDocument();
  });

  it('渲染反馈输入框（placeholder）', () => {
    const { getByPlaceholderText } = renderPage(<FoodCalorieHelp />);
    expect(getByPlaceholderText('请描述你遇到的问题或建议（选填）')).toBeInTheDocument();
  });

  it('渲染"联系方式"标签', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('联系方式')).toBeInTheDocument();
  });

  it('渲染"微信号 / 手机号（选填）"提示', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('微信号 / 手机号（选填）')).toBeInTheDocument();
  });

  it('渲染"提交反馈"按钮', () => {
    const { getByText } = renderPage(<FoodCalorieHelp />);
    expect(getByText('提交反馈')).toBeInTheDocument();
  });

  it('渲染"联系客服"卡片和工作时间', () => {
    const { getByText, container } = renderPage(<FoodCalorieHelp />);
    expect(getByText('联系客服')).toBeInTheDocument();
    expect(getByText('工作日 9:00-18:00 在线')).toBeInTheDocument();
    expect(container.querySelector('.fa-headset')).toBeInTheDocument();
  });

  it('在反馈输入框中输入文字', () => {
    const { getByPlaceholderText } = renderPage(<FoodCalorieHelp />);
    const textarea = getByPlaceholderText('请描述你遇到的问题或建议（选填）');
    fireEvent.change(textarea, { target: { value: '测试反馈内容' } });
    expect(textarea.value).toBe('测试反馈内容');
  });
});
