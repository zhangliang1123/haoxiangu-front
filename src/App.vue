<script setup lang="ts"></script>

<template>
  <router-view />
</template>

<style>
:root {
  /* ===== 好香柚 设计 Token ===== */
  /* 品牌 / 主色 */
  --hx-brand: #f28c28;
  --hx-brand-dark: #d96f14;
  --hx-brand-light: #ffe8c2;

  /* 辅助色 */
  --hx-accent: #3a9d5d;
  --hx-accent-light: #e8f5ec;

  /* 背景 */
  --hx-bg-page: #fff8ec;
  --hx-bg-card: #ffffff;

  /* 文字 */
  --hx-text-main: #3d2b1f;
  --hx-text-secondary: #7a6a5a;

  /* 边框 */
  --hx-border: #ead9c2;

  /* 状态 / 反馈 */
  --hx-success: #3a9d5d;
  --hx-warning: #f4a261;
  --hx-error: #e5484d;
  --hx-info: #2a9d8f;

  /* 派生语义（兼容既有使用） */
  --hx-white: #ffffff;
  --hx-grey-1: #666;
  --hx-grey-2: #999;
  --hx-grey-3: #ccc;
  --hx-grey-line: #eee;
  --hx-grey-bg: #f8f8f8;

  /* ===== Element Plus 主题覆盖 ===== */
  --el-color-primary: #f28c28;
  --el-color-primary-light-3: #f7ab5d;
  --el-color-primary-light-5: #fbc38f;
  --el-color-primary-light-7: #fdd7b5;
  --el-color-primary-light-8: #ffe2cc;
  --el-color-primary-light-9: #fff0e2;
  --el-color-primary-dark-2: #d96f14;

  --el-color-success: #3a9d5d;
  --el-color-warning: #f4a261;
  --el-color-danger: #e5484d;
  --el-color-error: #e5484d;
  --el-color-info: #2a9d8f;

  --el-text-color-primary: #3d2b1f;
  --el-text-color-regular: #4a3a2d;
  --el-text-color-secondary: #7a6a5a;
  --el-text-color-placeholder: #999;

  --el-border-color: #ead9c2;
  --el-border-color-light: #f0e3cf;
  --el-border-color-lighter: #f5ead9;
  --el-border-color-extra-light: #faf3e7;

  --el-bg-color: #ffffff;
  --el-bg-color-page: #fff8ec;
  --el-fill-color-light: #fff8ec;
  --el-fill-color-lighter: #fff8ec;

  --el-menu-item-hover-fill: #fff8ec;
  --el-menu-hover-bg-color: #fff8ec;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  color: var(--hx-text-main);
  background-color: var(--hx-bg-page);
}
</style>
