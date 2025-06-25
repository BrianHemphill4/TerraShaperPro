import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToolPalette, type ToolType } from '../ToolPalette';

describe('ToolPalette', () => {
  const mockOnToolChange = jest.fn();
  const mockOnSave = jest.fn();
  const mockOnToggleCollapse = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all tools', () => {
    render(<ToolPalette />);
    
    expect(screen.getByText('Select / Move')).toBeInTheDocument();
    expect(screen.getByText('Polygon Mask')).toBeInTheDocument();
    expect(screen.getByText('Brush Mask')).toBeInTheDocument();
    expect(screen.getByText('Freehand Pen')).toBeInTheDocument();
    expect(screen.getByText('Move Tool')).toBeInTheDocument();
  });

  it('shows active tool state', () => {
    render(<ToolPalette activeTool="mask-brush" />);
    
    const brushTool = screen.getByTestId('tool-mask-brush');
    expect(brushTool).toHaveClass('bg-primary');
  });

  it('calls onToolChange when tool is clicked', async () => {
    render(<ToolPalette onToolChange={mockOnToolChange} />);
    
    const polygonTool = screen.getByTestId('tool-mask-polygon');
    await userEvent.click(polygonTool);
    
    expect(mockOnToolChange).toHaveBeenCalledWith('mask-polygon');
  });

  it('responds to keyboard shortcuts', () => {
    render(<ToolPalette onToolChange={mockOnToolChange} />);
    
    // Test 'B' for brush tool
    fireEvent.keyDown(window, { key: 'b' });
    expect(mockOnToolChange).toHaveBeenCalledWith('mask-brush');
    
    // Test 'M' for polygon mask
    fireEvent.keyDown(window, { key: 'M' });
    expect(mockOnToolChange).toHaveBeenCalledWith('mask-polygon');
    
    // Test Escape for select tool
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(mockOnToolChange).toHaveBeenCalledWith('select');
  });

  it('does not respond to shortcuts when typing in input', () => {
    render(
      <div>
        <input data-testid="text-input" />
        <ToolPalette onToolChange={mockOnToolChange} />
      </div>
    );
    
    const input = screen.getByTestId('text-input');
    input.focus();
    
    fireEvent.keyDown(input, { key: 'b' });
    expect(mockOnToolChange).not.toHaveBeenCalled();
  });

  it('handles save with Cmd+S', () => {
    render(<ToolPalette onSave={mockOnSave} />);
    
    fireEvent.keyDown(window, { key: 's', metaKey: true });
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('shows save button state correctly', () => {
    const { rerender } = render(
      <ToolPalette hasUnsavedChanges={false} />
    );
    
    const saveButton = screen.getByTestId('save-button');
    expect(saveButton).toBeDisabled();
    expect(screen.getByText('Saved')).toBeInTheDocument();
    
    rerender(<ToolPalette hasUnsavedChanges={true} />);
    expect(saveButton).not.toBeDisabled();
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(saveButton).toHaveClass('animate-pulse');
  });

  it('calls onSave when save button is clicked', async () => {
    render(
      <ToolPalette 
        hasUnsavedChanges={true} 
        onSave={mockOnSave} 
      />
    );
    
    const saveButton = screen.getByTestId('save-button');
    await userEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalled();
  });

  it('toggles collapse state', async () => {
    render(<ToolPalette onToggleCollapse={mockOnToggleCollapse} />);
    
    const toggleButton = screen.getByLabelText('Collapse tool palette');
    await userEvent.click(toggleButton);
    
    expect(mockOnToggleCollapse).toHaveBeenCalled();
  });

  it('renders collapsed state correctly', () => {
    render(<ToolPalette isCollapsed={true} />);
    
    // Tool names should not be visible when collapsed
    expect(screen.queryByText('Select / Move')).not.toBeInTheDocument();
    expect(screen.queryByText('Polygon Mask')).not.toBeInTheDocument();
    
    // But icons should still be present
    expect(screen.getByTestId('tool-select')).toBeInTheDocument();
    expect(screen.getByTestId('tool-mask-polygon')).toBeInTheDocument();
  });

  it('shows tooltips on hover', async () => {
    render(<ToolPalette />);
    
    const selectTool = screen.getByTestId('tool-select');
    fireEvent.mouseEnter(selectTool);
    
    await waitFor(() => {
      expect(screen.getByText('Select / Move')).toBeInTheDocument();
      expect(screen.getByText('Select and move existing masks')).toBeInTheDocument();
      expect(screen.getByText('Press S')).toBeInTheDocument();
    });
  });

  it('shows context help when expanded', () => {
    render(<ToolPalette isCollapsed={false} />);
    
    expect(screen.getByText('Modifier Keys:')).toBeInTheDocument();
    expect(screen.getByText('• Shift = Constrain angle')).toBeInTheDocument();
    expect(screen.getByText('• Alt = Subtract region')).toBeInTheDocument();
  });

  it('hides context help when collapsed', () => {
    render(<ToolPalette isCollapsed={true} />);
    
    expect(screen.queryByText('Modifier Keys:')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<ToolPalette className="test-custom-class" />);
    
    const palette = screen.getByText('Tools').closest('div')?.parentElement;
    expect(palette).toHaveClass('test-custom-class');
  });

  it('shows keyboard shortcuts in UI', () => {
    render(<ToolPalette />);
    
    expect(screen.getByText('S')).toBeInTheDocument(); // Select tool
    expect(screen.getByText('M')).toBeInTheDocument(); // Polygon mask
    expect(screen.getByText('B')).toBeInTheDocument(); // Brush
    expect(screen.getByText('P')).toBeInTheDocument(); // Pen
    expect(screen.getByText('V')).toBeInTheDocument(); // Move
  });
});