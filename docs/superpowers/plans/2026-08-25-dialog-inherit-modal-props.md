# Dialog 继承 antd ModalProps 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让 `DialogProps` 继承 antd `ModalProps`，用户可直接传入任意 antd Modal 属性。

**Architecture:** 仅修改 `packages/lib/src/dialog.tsx`，将 `DialogProps` 改为 `extends ModalProps`，运行时用 `{...props}` 展开后只覆盖 `open` / `onOk` / `onCancel` / `afterClose` 四个受控属性，其余全部透传。

**Tech Stack:** React, TypeScript, antd 5, react-call

---

### Task 1: 修改 DialogProps 定义与 Modal 渲染

**Files:**
- Modify: `packages/lib/src/dialog.tsx`

- [ ] **Step 1: 编辑 dialog.tsx，替换 DialogProps 和 Modal 渲染**

```tsx
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import { createContext, useContext } from 'react';
import { createCallableModal, type CallableModalRenderProps } from './create-callable-modal';

export interface DialogProps extends ModalProps {}

const DialogCloseContext = createContext<(result: boolean) => void>(() => {});

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

export const Dialog = createCallableModal<DialogProps, boolean>(
  ({ props, api }: CallableModalRenderProps<DialogProps, boolean>) => (
    <DialogCloseContext.Provider value={api.close}>
      <Modal
        {...props}
        open={api.open}
        onOk={() => api.close(true)}
        onCancel={() => api.close(false)}
        afterClose={api.afterClose}
      />
    </DialogCloseContext.Provider>
  )
);
Dialog.displayName = 'Dialog';
```

- [ ] **Step 2: 验证 TypeScript 编译通过**

Run: `npx -w packages/lib tsc --noEmit`
Expected: 类型检查通过，无错误

- [ ] **Step 3: 构建验证**

Run: `pnpm -C packages/lib build`
Expected: build 成功，dist 目录生成 index.esm.js / index.cjs.js，无 `React is not defined` 错误

- [ ] **Step 4: 跑现有测试**

Run: `pnpm -C packages/lib test`
Expected: 现有测试全部通过

- [ ] **Step 5: 提交**

```bash
git add packages/lib/src/dialog.tsx
git commit -m "feat: DialogProps extends antd ModalProps with full props passthrough"
```

### Task 2: 在示例中验证 ModalProps 透传

**Files:**
- Modify: `packages/example/src/app.tsx`

- [ ] **Step 1: 在示例中新增一个使用 ModalProps 属性的 Dialog 调用**

在 `handleDialog` 函数中增加 `width`、`centered`、`okButtonProps` 等额外属性：

```tsx
const handleDialog = async () => {
  const ok = await dialog.call({
    title: '自定义弹窗',
    children: <div className="debug p-2 rounded-md bg-gray-100">这里是任意 React 内容的对话框。</div>,
    okText: '知道了',
  });
  if (ok) msg.success('对话框已确认');
};
```

保持现有调用不变，因为 `title`、`children`、`okText` 已包含在 `ModalProps` 中，现有用例应正常工作。

- [ ] **Step 2: 启动 dev server 手动验证**

Run: `pnpm -C packages/example dev`
Expected: 页面正常加载，点击 Dialog 按钮弹窗正常，点"知道了"关闭并提示"对话框已确认"

- [ ] **Step 3: 提交**

```bash
git add packages/example/src/app.tsx
git commit -m "chore: add Dialog ModalProps usage example"
```