/**
 * 基础渲染测试
 * 验证 ReactAntCalls 组件的基本渲染行为，包括：
 * - 默认 className 是否正确应用
 * - 自定义 className 是否能正确合并
 * - children 内容是否正常渲染
 */
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ReactAntCalls from '../src';

describe('ReactAntCalls', () => {
  it('should render with default className', () => {
    render(<ReactAntCalls>hello</ReactAntCalls>);
    const el = screen.getByText('hello');
    expect(el).toBeInTheDocument();
    expect(el.closest('[data-component="react-ant-calls"]')).toBeInTheDocument();
  });

  it('should merge custom className', () => {
    const { container } = render(<ReactAntCalls className="custom-class">test</ReactAntCalls>);
    expect(container.firstChild).toHaveClass('react-ant-calls', 'custom-class');
  });

  it('should render children', () => {
    render(<ReactAntCalls>child content</ReactAntCalls>);
    expect(screen.getByText('child content')).toBeInTheDocument();
  });
});
