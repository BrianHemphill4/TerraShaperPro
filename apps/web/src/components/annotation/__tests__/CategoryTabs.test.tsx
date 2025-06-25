import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CategoryTabs } from '../CategoryTabs';
import { useMaskStore } from '@/stores/useMaskStore';
import { useSceneStore } from '@/stores/useSceneStore';
import { ANNOTATION_CATEGORIES, CATEGORY_SHORTCUTS } from '@terrashaper/shared';

// Mock the stores
jest.mock('@/stores/useMaskStore');
jest.mock('@/stores/useSceneStore');

const mockUseMaskStore = useMaskStore as jest.MockedFunction<typeof useMaskStore>;
const mockUseSceneStore = useSceneStore as jest.MockedFunction<typeof useSceneStore>;

describe('CategoryTabs', () => {
  const mockSetDrawingCategory = jest.fn();
  const mockGetMasksByCategory = jest.fn();
  const mockOnCategoryChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseMaskStore.mockReturnValue({
      masks: [],
      drawingCategory: 'Plants & Trees',
      setDrawingCategory: mockSetDrawingCategory,
      getMasksByCategory: mockGetMasksByCategory,
    } as any);

    mockUseSceneStore.mockReturnValue({
      selectedSceneId: 'scene-123',
    } as any);

    mockGetMasksByCategory.mockReturnValue([]);
  });

  it('renders all category tabs', () => {
    render(<CategoryTabs />);
    
    ANNOTATION_CATEGORIES.forEach(category => {
      expect(screen.getByText(category)).toBeInTheDocument();
    });
  });

  it('shows active state for current drawing category', () => {
    render(<CategoryTabs />);
    
    const activeTab = screen.getByText('Plants & Trees').closest('button');
    expect(activeTab).toHaveStyle({ borderBottomWidth: '2px' });
  });

  it('displays mask count for each category', () => {
    mockGetMasksByCategory.mockImplementation((sceneId, category) => {
      if (category === 'Plants & Trees') return [{}, {}, {}]; // 3 masks
      if (category === 'Hardscape') return [{}]; // 1 mask
      return [];
    });

    render(<CategoryTabs />);
    
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('changes category on click', async () => {
    render(<CategoryTabs onCategoryChange={mockOnCategoryChange} />);
    
    const hardscapeTab = screen.getByText('Hardscape');
    await userEvent.click(hardscapeTab);
    
    expect(mockSetDrawingCategory).toHaveBeenCalledWith('Hardscape');
    expect(mockOnCategoryChange).toHaveBeenCalledWith('Hardscape');
  });

  it('responds to keyboard shortcuts', () => {
    render(<CategoryTabs onCategoryChange={mockOnCategoryChange} />);
    
    // Test Alt+2 for Mulch & Rocks
    fireEvent.keyDown(window, { key: '2', altKey: true });
    
    expect(mockSetDrawingCategory).toHaveBeenCalledWith('Mulch & Rocks');
    expect(mockOnCategoryChange).toHaveBeenCalledWith('Mulch & Rocks');
  });

  it('navigates with Alt+Arrow keys', () => {
    render(<CategoryTabs onCategoryChange={mockOnCategoryChange} />);
    
    // Navigate right
    fireEvent.keyDown(window, { key: 'ArrowRight', altKey: true });
    expect(mockSetDrawingCategory).toHaveBeenCalledWith('Mulch & Rocks');
    
    // Update mock to reflect new category
    mockUseMaskStore.mockReturnValue({
      ...mockUseMaskStore(),
      drawingCategory: 'Mulch & Rocks',
    } as any);
    
    // Navigate left
    fireEvent.keyDown(window, { key: 'ArrowLeft', altKey: true });
    expect(mockSetDrawingCategory).toHaveBeenCalledWith('Plants & Trees');
  });

  it('shows dropdown menu on hover', async () => {
    render(<CategoryTabs />);
    
    const tab = screen.getByText('Plants & Trees').closest('.group');
    const moreButton = tab?.querySelector('button[class*="absolute"]');
    
    expect(moreButton).toHaveClass('opacity-0');
    
    if (tab) {
      fireEvent.mouseEnter(tab);
      await waitFor(() => {
        expect(moreButton).toHaveClass('group-hover:opacity-100');
      });
    }
  });

  it('shows tooltips with keyboard shortcuts', async () => {
    render(<CategoryTabs />);
    
    const tab = screen.getByText('Plants & Trees');
    fireEvent.mouseEnter(tab);
    
    await waitFor(() => {
      expect(screen.getByText('Switch to Plants & Trees')).toBeInTheDocument();
      expect(screen.getByText('Alt+1 or Alt+←/→')).toBeInTheDocument();
    });
  });

  it('applies opacity when category is hidden', async () => {
    render(<CategoryTabs />);
    
    // Click dropdown for Plants & Trees
    const tab = screen.getByText('Plants & Trees').closest('.group');
    const moreButton = tab?.querySelector('button[class*="absolute"]') as HTMLElement;
    
    await userEvent.click(moreButton);
    
    // Click hide option
    const hideOption = screen.getByText('Hide Plants & Trees');
    await userEvent.click(hideOption);
    
    // Check that the tab has opacity
    const tabButton = screen.getByText('Plants & Trees').closest('button');
    expect(tabButton).toHaveClass('opacity-50');
  });

  it('prevents event propagation on dropdown trigger', async () => {
    render(<CategoryTabs onCategoryChange={mockOnCategoryChange} />);
    
    const tab = screen.getByText('Plants & Trees').closest('.group');
    const moreButton = tab?.querySelector('button[class*="absolute"]') as HTMLElement;
    
    await userEvent.click(moreButton);
    
    // Category should not have changed
    expect(mockOnCategoryChange).not.toHaveBeenCalled();
  });
});