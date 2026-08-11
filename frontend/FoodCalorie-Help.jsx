import React from 'react';
import html from './FoodCalorie-Help.html?raw';

// 画布同步页面：HTML 由 .mastergo/design/200862263389388/M/ 复制而来，?raw 直接嵌入，
// 样式与画布 100% 一致，data-name 保留，可被全局点击跳转委托捕获。
export default function FoodCalorieHelp() {
  return (
    <div
      data-name="FoodCalorie-Help"
      style={{
        width: '375px',
        minHeight: '812px',
        overflow: 'hidden'
      }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
