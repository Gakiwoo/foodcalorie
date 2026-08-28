// 注册页冒烟测试：验证页面渲染、表单元素、校验提示
import React from 'react';
import { describe, it, expect } from 'vitest';
import { fireEvent } from '@testing-library/react';
import { renderPage } from './testUtils';
import FoodCalorieRegister from '../../FoodCalorie-Register.jsx';

describe('FoodCalorieRegister', () => {
  it('渲染注册表单（邮箱/密码/确认密码 + 注册按钮）', () => {
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieRegister />);
    expect(getByPlaceholderText('请输入邮箱地址')).toBeInTheDocument();
    expect(getByPlaceholderText('设置密码（6-20 位字母数字）')).toBeInTheDocument();
    expect(getByPlaceholderText('再次输入密码')).toBeInTheDocument();
    expect(getByText('注册并登录')).toBeInTheDocument();
  });

  it('渲染返回按钮和标题"注册账号"', () => {
    const { getByText, container } = renderPage(<FoodCalorieRegister />);
    expect(getByText('注册账号')).toBeInTheDocument();
    expect(container.querySelector('.fa-chevron-left')).toBeInTheDocument();
  });

  it('空表单点击注册显示"请输入邮箱地址"', () => {
    const { getByText } = renderPage(<FoodCalorieRegister />);
    fireEvent.click(getByText('注册并登录'));
    expect(getByText('请输入邮箱地址')).toBeInTheDocument();
  });

  it('无效邮箱格式显示校验错误', () => {
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieRegister />);
    fireEvent.change(getByPlaceholderText('请输入邮箱地址'), { target: { value: 'invalid-email' } });
    fireEvent.click(getByText('注册并登录'));
    expect(getByText('请输入有效的邮箱地址')).toBeInTheDocument();
  });

  it('密码少于 6 位显示校验错误', () => {
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieRegister />);
    fireEvent.change(getByPlaceholderText('请输入邮箱地址'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('设置密码（6-20 位字母数字）'), { target: { value: '123' } });
    fireEvent.click(getByText('注册并登录'));
    expect(getByText('密码至少 6 位字符')).toBeInTheDocument();
  });

  it('两次密码不一致显示校验错误', () => {
    const { getByPlaceholderText, getByText } = renderPage(<FoodCalorieRegister />);
    fireEvent.change(getByPlaceholderText('请输入邮箱地址'), { target: { value: 'test@example.com' } });
    fireEvent.change(getByPlaceholderText('设置密码（6-20 位字母数字）'), { target: { value: 'password123' } });
    fireEvent.change(getByPlaceholderText('再次输入密码'), { target: { value: 'different' } });
    fireEvent.click(getByText('注册并登录'));
    expect(getByText('两次输入的密码不一致')).toBeInTheDocument();
  });

  it('渲染"去登录"链接', () => {
    const { getByText } = renderPage(<FoodCalorieRegister />);
    expect(getByText('去登录')).toBeInTheDocument();
  });
});
