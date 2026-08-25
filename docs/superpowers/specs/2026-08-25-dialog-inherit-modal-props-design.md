# Dialog 组件默认继承 antd ModalProps

## 背景

`packages/lib/src/dialog.tsx` 当前定义了一个窄自定义接口 `DialogProps`（`title`、`children`、`footer`、`okText`、`cancelText`、`width`、`closable`），没有利用 antd `Modal` 的完整能力。用户希望 `Dialog` 的 props 默认继承 antd `ModalProps`，从而直接支持 `centered`、`okButtonProps`、`maskClosable`、`classNames` 等全部 Modal 属性。

## 目标

- 让 `DialogProps` 直接 `extends ModalProps`。
- 保持 `Dialog(...)` 的 `Promise<boolean>` 调用语义：OK → `true`，Cancel/关闭 → `false`。
- 仅改动 `packages/lib/src/dialog.tsx`，不破坏现有 `CallsProvider` / `useCalls` 注册方式。

## 设计决策

### 1. 方案选择

在三种方案中选择了**方案 3**：

> `DialogProps extends ModalProps`，运行时强制覆盖 `open` / `onOk` / `onCancel` / `afterClose`，用户传入的这些属性不生效。

理由：
- 类型上最直接，满足“属性默认继承 ModalProps”的直觉。
- 代码最少，只需把 `props` 展开到 `Modal` 后再覆盖受控属性。
- 弹窗的打开、关闭、Promise resolve 必须由 `createCallableModal` 统一管理，不可让用户覆盖。

### 2. Props 定义

```tsx
import type { ModalProps } from 'antd';

export interface DialogProps extends ModalProps {}
```

- `title` 从必填变为可选，与 antd Modal 一致；现有调用仍合法。
- `children` 通过 `ModalProps['children']` 支持。
- `okText` / `cancelText` 不再硬编码默认值，交给 antd Modal 自身或用户传入。

### 3. 受控属性覆盖

```tsx
import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import { createContext, useContext } from 'react';
import { createCallableModal } from './create-callable-modal';

export interface DialogProps extends ModalProps {}

const DialogCloseContext = createContext<(result: boolean) => void>(() => {});

export function useDialogClose() {
  return useContext(DialogCloseContext);
}

export const Dialog = createCallableModal<DialogProps, boolean>(
  ({ props, api }) => (
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

覆盖规则：

| 属性 | 来源 | 说明 |
| --- | --- | --- |
| `open` | `api.open` | callable 控制显隐 |
| `onOk` | `() => api.close(true)` | 点击 OK 返回 `true` |
| `onCancel` | `() => api.close(false)` | 点击 Cancel/关闭/Esc/mask 返回 `false` |
| `afterClose` | `api.afterClose` | 动画结束后 resolve Promise |

用户传入的 `onOk` / `onCancel` / `afterClose` 不生效，这是方案 3 的已知约定。

### 4. `useDialogClose`

保留 `useDialogClose()` hook，供 `children` 内部通过 `api.close(boolean)` 手动关闭弹窗，不改动签名。

### 5. 注册与导出

`packages/lib/src/index.tsx` 中的 `Calls` 接口与 `CallsProvider` 不需要改动，`DialogProps` 的类型导出也保持不变：

```tsx
export type { DialogProps } from './dialog';
```

由于 `DialogProps` 扩展为 `ModalProps`，`Calls['dialog']` 自动变为 `Callable<DialogProps, boolean, {}>`。

## 验证方式

1. `pnpm -C packages/lib build` 成功，dist 产物无 `React is not defined` 问题。
2. `pnpm -C packages/example dev` 启动后现有 `Dialog` 调用正常。
3. 在示例中新增一个传入 `width`、`centered`、`okButtonProps` 等 `ModalProps` 的用例，确认透传生效。
4. 验证点 OK 返回 `true`、点 Cancel 返回 `false` 的 Promise 行为不变。

## 影响范围

- 仅修改 `packages/lib/src/dialog.tsx`。
- 对现有调用方无破坏：原有 `Dialog({ title, children })` 调用仍然合法。
- 新调用方可传入任意 antd `ModalProps` 属性（除被覆盖的受控属性外）。
