// 登录页冒烟测试：验证页面渲染、表单元素存在、按钮交互
import React from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieLogin from '../../FoodCalorie-Login.jsx';

describe('FoodCalorieLogin', () => {
  it('渲染登录表单（邮箱/密码输入框 + 登录按钮）', () => {
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieLogin />);
    expect(getByPlaceholderText('请输入邮箱地址')).toBeInTheDocument();
    expect(getByPlaceholderText('请输入密码')).toBeInTheDocument();
    expect(getByText('登 录')).toBeInTheDocument();
  });

  it('渲染品牌标识"食刻"和副标题', () => {
    const { getByText } = renderPage(<FoodCalorieLogin />);
    expect(getByText('食刻')).toBeInTheDocument();
    expect(getByText('记录每一餐，健康每一天')).toBeInTheDocument();
  });

  it('渲染微信登录按钮和注册链接', () => {
    const { getByText } = renderPage(<FoodCalorieLogin />);
    expect(getByText('微信一键登录')).toBeInTheDocument();
    expect(getByText('立即注册')).toBeInTheDocument();
  });

  it('空表单点击登录显示错误提示', () => {
    const { getByText } = renderPage(<FoodCalorieLogin />);
    fireEvent.click(getByText('登 录'));
    expect(getByText('请输入邮箱和密码')).toBeInTheDocument();
  });

  it('密码显示/隐藏切换', () => {
    const { getByPlaceholderText, container } = renderPage(<FoodCalorieLogin />);
    const pwdInput = getByPlaceholderText('请输入密码');
    expect(pwdInput.type).toBe('password');
    const eyeIcon = container.querySelector('.fa-eye');
    fireEvent.click(eyeIcon);
    expect(pwdInput.type).toBe('text');
  });
});
