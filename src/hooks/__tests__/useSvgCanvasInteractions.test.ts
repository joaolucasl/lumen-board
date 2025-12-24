import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSvgCanvasInteractions } from '../useSvgCanvasInteractions';
import type { SceneState, Tool } from '../../types';
import { INITIAL_STATE } from '../../constants';

describe('useSvgCanvasInteractions - No Select Attribute', () => {
  const createMockArgs = () => {
    const scene: SceneState = { 
      ...INITIAL_STATE,
      elements: {
        'el-1': {
          id: 'el-1',
          type: 'custom',
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          rotation: 0,
          opacity: 1,
          locked: false,
          backgroundColor: '#ffffff',
          strokeColor: '#000000',
          strokeWidth: 2,
          componentType: 'TestComponent',
          props: {}
        }
      }
    };
    
    const svgRef = { current: null } as React.RefObject<SVGSVGElement>;
    const selectedIds: string[] = []; // Start with no selection
    const activeTool: Tool = 'pointer';
    const keepToolActive = false;
    const snapToGrid = false;
    
    const onUpdateScene = vi.fn();
    const onSelect = vi.fn();
    const onToolChange = vi.fn();

    return {
      svgRef,
      scene,
      selectedIds,
      activeTool,
      keepToolActive,
      snapToGrid,
      onUpdateScene,
      onSelect,
      onToolChange
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should select element when clicking on element container', () => {
    const args = createMockArgs();
    const { result } = renderHook(() => useSvgCanvasInteractions(args));

    // Create a mock event target that represents the element container
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-element-id', 'el-1');
    
    const mockEvent = {
      clientX: 150,
      clientY: 150,
      target: mockElement,
      pointerId: 1,
      shiftKey: false
    } as unknown as React.PointerEvent;

    // Mock screenToWorld to return world coordinates
    result.current.screenToWorld = vi.fn().mockReturnValue({ x: 150, y: 150 });

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    // Element should be selected
    expect(args.onSelect).toHaveBeenCalledWith(['el-1']);
  });

  it('should NOT select element when clicking on element with data-lumen-no-select', () => {
    const args = createMockArgs();
    const { result } = renderHook(() => useSvgCanvasInteractions(args));

    // Create a mock button with no-select attribute inside the element
    const mockButton = document.createElement('button');
    mockButton.setAttribute('data-lumen-no-select', 'true');
    
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-element-id', 'el-1');
    mockElement.appendChild(mockButton);
    
    const mockEvent = {
      clientX: 150,
      clientY: 150,
      target: mockButton,
      pointerId: 1,
      shiftKey: false
    } as unknown as React.PointerEvent;

    // Mock screenToWorld to return world coordinates
    result.current.screenToWorld = vi.fn().mockReturnValue({ x: 150, y: 150 });

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    // Element should NOT be selected
    expect(args.onSelect).not.toHaveBeenCalled();
  });

  it('should NOT select element when clicking on nested element with data-lumen-no-select', () => {
    const args = createMockArgs();
    const { result } = renderHook(() => useSvgCanvasInteractions(args));

    // Create nested structure: element > div > button[no-select]
    const mockButton = document.createElement('button');
    mockButton.setAttribute('data-lumen-no-select', 'true');
    
    const mockInnerDiv = document.createElement('div');
    mockInnerDiv.appendChild(mockButton);
    
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-element-id', 'el-1');
    mockElement.appendChild(mockInnerDiv);
    
    const mockEvent = {
      clientX: 150,
      clientY: 150,
      target: mockButton,
      pointerId: 1,
      shiftKey: false
    } as unknown as React.PointerEvent;

    // Mock screenToWorld to return world coordinates
    result.current.screenToWorld = vi.fn().mockReturnValue({ x: 150, y: 150 });

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    // Element should NOT be selected
    expect(args.onSelect).not.toHaveBeenCalled();
  });

  it('should still allow selection on other parts of element with no-select children', () => {
    const args = createMockArgs();
    const { result } = renderHook(() => useSvgCanvasInteractions(args));

    // Create element with a no-select button
    const mockButton = document.createElement('button');
    mockButton.setAttribute('data-lumen-no-select', 'true');
    
    const mockTitle = document.createElement('h3');
    mockTitle.textContent = 'Title';
    
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-element-id', 'el-1');
    mockElement.appendChild(mockButton);
    mockElement.appendChild(mockTitle);
    
    // Click on the title (not the button)
    const mockEvent = {
      clientX: 150,
      clientY: 150,
      target: mockTitle,
      pointerId: 1,
      shiftKey: false
    } as unknown as React.PointerEvent;

    // Mock screenToWorld to return world coordinates
    result.current.screenToWorld = vi.fn().mockReturnValue({ x: 150, y: 150 });

    act(() => {
      result.current.handlePointerDown(mockEvent);
    });

    // Element should be selected when clicking on non-no-select part
    expect(args.onSelect).toHaveBeenCalledWith(['el-1']);
  });
});
