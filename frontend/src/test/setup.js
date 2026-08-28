// Vitest 测试环境初始化：导入 jest-dom 匹配器（toBeInTheDocument 等）
import '@testing-library/jest-dom/vitest';

// jsdom 环境下 matchMedia 未实现，手动 mock 避免组件渲染时报错
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false
  });
}

// jsdom 环境下 ResizeObserver 未实现
if (typeof window !== 'undefined' && !window.ResizeObserver) {
  window.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}
