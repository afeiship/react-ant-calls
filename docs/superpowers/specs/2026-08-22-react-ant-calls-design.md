# react-ant-calls — Callable 弹窗库设计文档

> 日期：2026-08-22
> 状态：已获用户批准

## 1. 目标

将 `react-call-notes/src/calls` 中验证过的 callable 弹窗代码移植到 `packages/lib`，实现一个基于 `react-call` + `antd` 的可发布 npm 组件库：通过 `CallsProvider` + `useCalls` 以编程方式调用 alert / confirm / prompt / dialog / msg / notif。

## 2. 文件结构

```
packages/lib/src/
├── create-callable-modal.tsx   # 工厂：动画安全的 callable 弹窗
├── alert.tsx                   # Alert — 带类型图标的提示弹窗
├── confirm.tsx                 # Confirm — 确认/取消，返回 boolean
├── prompt.tsx                  # Prompt — 带输入框 + validator 校验
├── dialog.tsx                  # Dialog — 自定义内容/footer 的通用弹窗
├── msg.ts                      # antd message 轻量封装
├── notification.ts             # antd notification 轻量封装
├── index.tsx                   # 入口：CallsProvider / useCalls / 类型导出
└── style.scss                  # 保留（当前无自定义样式）
```

## 3. 核心工厂 `createCallableModal`

复用参考实现，逻辑保持一致：

- **入场**：挂载后 `setOpen(true)` → Modal 播放入场动画
- **退场**：`close(result)` 关闭 Modal → `afterClose` 时 `call.end(result)`（动画结束后才结束 call）
- **防重复**：`closingRef`（关闭中忽略重复触发）、`endedRef`（call.end 只触发一次）
- **update()**：react-call 更新 props 自动 re-render

```tsx
interface CallableModalApi<R> {
  open: boolean;
  close: (result: R) => void;
  afterClose: () => void;
}

createCallableModal<P, R>(
  render: FC<{ props: P; api: CallableModalApi<R> }>
): Callable<P, R>
```

## 4. 组件 API

### Alert
```tsx
interface AlertProps {
  title: string;
  content: string;
  okText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';  // 默认 'info'
}
// 返回 void；仅 OK 按钮
```

### Confirm
```tsx
interface ConfirmProps {
  title: string;
  content: string;
  okText?: string;
  cancelText?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}
// 返回 boolean：OK → true，Cancel → false
```

### Prompt
```tsx
interface PromptProps {
  title: string;
  content: string;
  initialValue?: string;
  placeholder?: string;
  okText?: string;
  cancelText?: string;
  validator?: (value: string) => true | string;  // 返回 true 通过，string 为错误信息
}
// 返回 string | null：确认 → 输入值，取消 → null
```

### Dialog
```tsx
interface DialogProps {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  okText?: string;
  cancelText?: string;
  width?: number;      // 默认 520
  closable?: boolean;  // 默认 true
}
// 返回 boolean；自定义 footer 中用 useDialogClose() 关闭并返回结果
```

### msg（封装 antd message）
```tsx
msg.success(text, duration?)
msg.error(text, duration?)
msg.info(text, duration?)
msg.warning(text, duration?)
```

### notif（封装 antd notification）
```tsx
notif.success(args: ArgsProps)
notif.error(args: ArgsProps)
notif.info(args: ArgsProps)
notif.warning(args: ArgsProps)
notif.open(args: ArgsProps)
notif.destroy(key?)
// 导出类型 NotificationArgs = ArgsProps
```

## 5. Provider 与 Hook

```tsx
export interface Calls {
  alert: Callable<AlertProps, void>;
  confirm: Callable<ConfirmProps, boolean>;
  prompt: Callable<PromptProps, string | null>;
  dialog: Callable<DialogProps, boolean>;
  msg: typeof msg;
  notif: typeof notif;
}

export function CallsProvider({ children }: { children: ReactNode }): ReactNode
// 挂载 Alert/Confirm/Prompt/Dialog 四个 callable 组件
// 通过 Context 提供 calls 对象

export function useCalls(): Calls
```

使用方式：
```tsx
<CallsProvider><App /></CallsProvider>

const { confirm } = useCalls();
const ok = await confirm({ title: '确认', content: '确定继续？' });
```

## 6. 去 Tailwind 化（与参考项目的关键差异）

参考项目使用 Tailwind utility classes。作为可发布 npm 库，不要求用户安装 Tailwind，因此改为：

- 图标颜色：内联 `style={{ color }}`（info #1677ff / success #52c41a / warning #faad14 / error #ff4d4f）
- 布局：内联样式 `display: flex, alignItems: flex-start, gap: 12`
- Alert cancel 隐藏：`cancelButtonProps={{ style: { display: 'none' } }}`

## 7. 依赖策略（peerDependencies）

```json
{
  "peerDependencies": {
    "react": "*",
    "react-dom": "*",
    "antd": "*",
    "@ant-design/icons": "*",
    "react-call": "^2.0.0",
    "classnames": "*"
  }
}
```
- 新增 peer：`antd`、`@ant-design/icons`、`react-call`（加上已有 `react`/`react-dom`/`classnames`）
- devDependencies 中保留 `react`/`react-dom`/`classnames` 用于本地测试与开发（peer 声明的包必须同时安装一份用于开发）

## 8. 出口文件（index.tsx）

`index.tsx` 内部定义 `CallsContext` / `CallsProvider` / `useCalls`，并作为库唯一入口导出所有内容：

```tsx
export { CallsProvider, useCalls } from './index';  // 注：由 index.tsx 自身定义后导出
export { Alert, type AlertProps } from './alert';
export { Confirm, type ConfirmProps } from './confirm';
export { Prompt, type PromptProps } from './prompt';
export { Dialog, type DialogProps, useDialogClose } from './dialog';
export { msg } from './msg';
export { notif, type NotificationArgs } from './notification';
export { createCallableModal, type CallableModalApi, type CallableModalRenderProps } from './create-callable-modal';
export * from 'react-call';  // 透传 Callable 类型
```

## 9. 现状替换

- `src/index.tsx` 当前的 class 组件 `ReactAntCalls` 被完全替换为上述出口
- `__tests__/01-basic.spec.tsx` 的 3 个旧测试删除，替换为对 CallsProvider / alert / confirm / prompt 的渲染 + 返回结果测试

## 10. 测试策略

用 vitest + @testing-library/react + jsdom：

1. **create-callable-modal 单元行为**：Alert 渲染标题/内容，确认后返回结果
2. **Provider 集成**：CallsProvider 下 useCalls 返回完整 API；alert 调用后 Modal 出现并可关闭
3. **结果返回**：confirm OK → true；cancel → false；prompt 输入 → 值；取消 → null
4. **msg / notif**：直接调用不抛错（依赖 antd 实例）

## 11. 验证标准

- [ ] `pnpm build` 通过（CJS + ESM + DTS）
- [ ] `pnpm test` 全部通过
- [ ] example 包中实际调用 alert/confirm/prompt 可正常工作