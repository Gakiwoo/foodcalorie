// 组件测试渲染工具：包裹 MemoryRouter + UnitProvider，模拟页面运行环境
import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { UnitProvider } from '../ui/units.jsx';

export function renderPage(ui, { route = '/', state, ...options } = {}) {
  const entry = state ? { pathname: route, state } : route;
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <UnitProvider>{ui}</UnitProvider>
    </MemoryRouter>,
    options
  );
}
