import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '../config/env.config';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  Tooltip,
  Collapse,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
  AutoStories as StoriesIcon,
  Category as CategoryIcon,
  Photo as PhotoIcon,
  CheckCircle as ActiveIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as ViewIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';
import { StatusChip } from '../components/common/StatusChip';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { getImageUrl, getErrorMessage } from '../utils/uploadHelpers';
import logger from '../utils/logger';

interface StoryCategory {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
  stories?: Story[];
  createdAt: string;
  updatedAt: string;
}

interface Story {
  id: string;
  categoryId: string;
  imageUrls: string[];
  isActive: boolean;
  sortOrder: number;
  category?: StoryCategory;
  createdAt: string;
  updatedAt: string;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

const StoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<StoryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<StoryCategory | null>(null);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [storiesToDelete, setStoriesToDelete] = useState<string[]>([]);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'category' | 'story';
    id: string;
    name: string;
  } | null>(null);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity'] = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stories/categories`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        throw new Error('Failed to load story categories');
      }
    } catch (error) {
      logger.error('Error loading categories:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const handleOpenCategoryDialog = (category?: StoryCategory) => {
    if (category) {
      setCategoryForm({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder,
      });
      setEditingCategoryId(category.id);
      setSelectedCategory(category);
      // Reset upload states for edit mode
      setSelectedFiles([]);
      setImagePreviews([]);
      setStoriesToDelete([]);
    } else {
      setCategoryForm({
        name: '',
        description: '',
        isActive: true,
        sortOrder: 0,
      });
      setEditingCategoryId(null);
      setSelectedCategory(null);
    }
    setCategoryDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (!categoryForm.name.trim()) {
        showSnackbar('Category name is required', 'error');
        return;
      }

      setLoading(true);
      const url = editingCategoryId
        ? `${API_BASE_URL}/stories/categories/${editingCategoryId}`
        : `${API_BASE_URL}/stories/categories`;
      const method = editingCategoryId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        // Process pending story changes (uploads and deletions) if editing
        if (editingCategoryId) {
          const hasStoryChanges = await processPendingStoryChanges();
          if (hasStoryChanges) {
            showSnackbar('Category and stories updated successfully');
          } else {
            showSnackbar('Category updated successfully');
          }
        } else {
          showSnackbar('Category created successfully');
        }

        // Reset states
        setSelectedFiles([]);
        setImagePreviews([]);
        setStoriesToDelete([]);
        setCategoryDialog(false);
        loadCategories();
      } else {
        throw new Error('Failed to save category');
      }
    } catch (error) {
      logger.error('Error saving category:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const category = categories.find((c) => c.id === id);
    setDeleteTarget({
      type: 'category',
      id,
      name: category?.name || 'this category',
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteStoryConfirm = (storyId: string) => {
    setDeleteTarget({
      type: 'story',
      id: storyId,
      name: 'this story',
    });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      const url =
        deleteTarget.type === 'category'
          ? `${API_BASE_URL}/stories/categories/${deleteTarget.id}`
          : `${API_BASE_URL}/stories/${deleteTarget.id}`;
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showSnackbar(
          `${deleteTarget.type === 'category' ? 'Category' : 'Story'} deleted successfully`,
        );
        loadCategories();
      } else {
        throw new Error(
          `Failed to delete ${deleteTarget.type}`,
        );
      }
    } catch (error) {
      logger.error('Error deleting:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleToggleCategoryStatus = async (id: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/stories/categories/${id}/toggle`,
        {
          method: 'PATCH',
          credentials: 'include',
        },
      );

      if (response.ok) {
        showSnackbar('Category status updated');
        loadCategories();
      } else {
        throw new Error('Failed to toggle category status');
      }
    } catch (error) {
      logger.error('Error toggling status:', error);
      showSnackbar(getErrorMessage(error), 'error');
    }
  };

  const handleMoveCategoryOrder = async (
    id: string,
    direction: 'up' | 'down',
  ) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/stories/categories/${id}/move`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        },
      );

      if (response.ok) {
        showSnackbar(`Category moved ${direction} successfully`, 'success');
        loadCategories();
      } else {
        throw new Error('Failed to move category');
      }
    } catch (error) {
      logger.error('Error moving category:', error);
      showSnackbar(getErrorMessage(error), 'error');
    }
  };

  const handleMoveStoryOrder = async (id: string, direction: 'up' | 'down') => {
    try {
      const response = await fetch(`${API_BASE_URL}/stories/${id}/move`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ direction }),
      });

      if (response.ok) {
        showSnackbar(`Story moved ${direction} successfully`, 'success');
        loadCategories();
      } else {
        throw new Error('Failed to move story');
      }
    } catch (error) {
      logger.error('Error moving story:', error);
      showSnackbar(getErrorMessage(error), 'error');
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate max file count (50 files per upload)
    const totalFiles = selectedFiles.length + files.length;
    if (totalFiles > 50) {
      showSnackbar(
        `Maximum 50 images allowed. You have ${selectedFiles.length} selected and are trying to add ${files.length} more.`,
        'error',
      );
      return;
    }

    // Validate file size (max 1MB each)
    const oversizedFiles = files.filter((file) => file.size > 1024 * 1024);
    if (oversizedFiles.length > 0) {
      const fileSizes = oversizedFiles
        .map((f) => `${f.name} (${(f.size / (1024 * 1024)).toFixed(2)} MB)`)
        .join(', ');
      showSnackbar(
        `File size must be less than 1MB. Please compress the following image${
          oversizedFiles.length > 1 ? 's' : ''
        }: ${fileSizes}`,
        'error',
      );
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith('image/'),
    );
    if (invalidFiles.length > 0) {
      showSnackbar('Only image files are allowed', 'error');
      return;
    }

    setSelectedFiles((prev) => [...prev, ...files]);

    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const [isDragging, setIsDragging] = useState(false);

  const removeImagePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dt = e.dataTransfer;
    if (dt.files && dt.files.length > 0) {
      const synthetic = { target: { files: dt.files } } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageUpload(synthetic);
    }
  };

  // Toggle story for deletion (visual only until save)
  const toggleStoryForDeletion = (storyId: string) => {
    setStoriesToDelete((prev) =>
      prev.includes(storyId)
        ? prev.filter((id) => id !== storyId)
        : [...prev, storyId],
    );
  };

  // Process pending changes (upload new stories and delete marked stories)
  const processPendingStoryChanges = async () => {
    if (!selectedCategory) return;

    let hasChanges = false;

    // Upload images and create ONE story per image
    if (selectedFiles.length > 0) {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });
      formData.append('folder', 'stories');

      const uploadResponse = await fetch(`${API_BASE_URL}/upload/images`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload images');
      }

      const uploadResult = await uploadResponse.json();
      const imageUrls: string[] = uploadResult.urls || [];

      // Create one story per image (not one story with all images)
      for (const imageUrl of imageUrls) {
        const storyResponse = await fetch(`${API_BASE_URL}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            categoryId: selectedCategory.id,
            imageUrls: [imageUrl],
            isActive: true,
            sortOrder: 0,
          }),
        });
        if (!storyResponse.ok) {
          throw new Error('Failed to create story');
        }
      }
      hasChanges = true;
    }

    // Delete marked stories
    for (const storyId of storiesToDelete) {
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to delete story');
      }
      hasChanges = true;
    }

    return hasChanges;
  };

  const handleDeleteStory = async (storyId: string) => {
    handleDeleteStoryConfirm(storyId);
  };

  // Filter and sort categories based on search and status
  const filteredCategories = useMemo(() => {
    let result = [...categories];

    // Sort by sortOrder first
    result.sort((a, b) => a.sortOrder - b.sortOrder);

    // Sort stories within each category by sortOrder
    result = result.map((category) => ({
      ...category,
      stories: category.stories
        ? [...category.stories].sort((a, b) => a.sortOrder - b.sortOrder)
        : [],
    }));

    // Filter by status
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      result = result.filter((c) => c.isActive === isActive);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(term) ||
          (c.description && c.description.toLowerCase().includes(term)),
      );
    }

    return result;
  }, [categories, searchTerm, statusFilter]);

  // Toggle category expansion
  const toggleCategoryExpansion = useCallback((categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  }, []);

  // Expand all categories
  const expandAllCategories = useCallback(() => {
    setExpandedCategories(new Set(categories.map((c) => c.id)));
  }, [categories]);

  // Collapse all categories
  const collapseAllCategories = useCallback(() => {
    setExpandedCategories(new Set());
  }, []);

  // Calculate stories stats
  const storiesStats = useMemo(() => {
    const allStories = categories.flatMap((c) => c.stories || []);
    const totalImages = allStories.reduce(
      (acc, s) => acc + (s.imageUrls?.length || 0),
      0,
    );
    return {
      totalCategories: categories.length,
      activeCategories: categories.filter((c) => c.isActive).length,
      totalStories: allStories.length,
      activeStories: allStories.filter((s) => s.isActive).length,
      totalImages,
    };
  }, [categories]);

  return (
    <Box sx={{ p: 3 }}>
      <PageHeader
        title="Stories Management"
        subtitle="Manage story categories and upload images for each category"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenCategoryDialog()}
            sx={{
              backgroundColor: '#C87941',
              color: 'white',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 6px 20px rgba(200, 121, 65, 0.3)',
              '&:hover': { backgroundColor: '#A45F2D' },
            }}
          >
            Add Category
          </Button>
        }
      />

      {/* Summary Statistics */}
      <SummaryStats
        stats={
          [
            {
              label: 'Categories',
              value: storiesStats.totalCategories,
              icon: <CategoryIcon fontSize="small" />,
              color: '#C87941',
            },
            {
              label: 'Active Categories',
              value: storiesStats.activeCategories,
              icon: <ActiveIcon fontSize="small" />,
              color: '#4CAF50',
            },
            {
              label: 'Total Stories',
              value: storiesStats.totalStories,
              icon: <StoriesIcon fontSize="small" />,
              color: '#2196F3',
            },
            {
              label: 'Active Stories',
              value: storiesStats.activeStories,
              icon: <ActiveIcon fontSize="small" />,
              color: '#43A047',
            },
            {
              label: 'Total Images',
              value: storiesStats.totalImages,
              icon: <PhotoIcon fontSize="small" />,
              color: '#9C27B0',
            },
          ] as StatItem[]
        }
        variant="compact"
        columns={5}
      />

      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
            backgroundColor: 'rgba(200, 121, 65, 0.15)',
            '& .MuiLinearProgress-bar': { backgroundColor: '#C87941' },
          }}
        />
      )}

      {/* Search and Filter Bar */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid rgba(200, 121, 65, 0.08)',
          background: 'linear-gradient(180deg, #FFFBF7 0%, #FFFFFF 100%)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 5 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              slotProps={{ input: { startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#C87941', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ) } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(200, 121, 65, 0.2)' },
                  '&:hover fieldset': { borderColor: '#C87941' },
                  '&.Mui-focused fieldset': { borderColor: '#C87941' },
                },
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl
              size="small"
              fullWidth
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: 2,
                  '& fieldset': { borderColor: 'rgba(200, 121, 65, 0.2)' },
                  '&:hover fieldset': { borderColor: '#C87941' },
                  '&.Mui-focused fieldset': { borderColor: '#C87941' },
                },
              }}
            >
              <InputLabel sx={{ '&.Mui-focused': { color: '#C87941' } }}>
                Status
              </InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as typeof statusFilter)
                }
                label="Status"
              >
                <MenuItem value="all">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FilterIcon sx={{ fontSize: 18, color: '#C87941' }} />
                    All Categories
                  </Box>
                </MenuItem>
                <MenuItem value="active">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ActiveIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
                    Active Only
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CloseIcon sx={{ fontSize: 18, color: '#F44336' }} />
                    Inactive Only
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              <Button
                size="small"
                onClick={expandAllCategories}
                startIcon={<ExpandMoreIcon />}
                sx={{
                  color: '#6B4E3D',
                  '&:hover': { backgroundColor: 'rgba(200, 121, 65, 0.08)' },
                }}
              >
                Expand All
              </Button>
              <Button
                size="small"
                onClick={collapseAllCategories}
                startIcon={<ExpandLessIcon />}
                sx={{
                  color: '#6B4E3D',
                  '&:hover': { backgroundColor: 'rgba(200, 121, 65, 0.08)' },
                }}
              >
                Collapse All
              </Button>
              {(searchTerm || statusFilter !== 'all') && (
                <Button
                  size="small"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  startIcon={<CloseIcon />}
                  sx={{
                    color: '#C87941',
                    borderColor: 'rgba(200, 121, 65, 0.3)',
                    '&:hover': {
                      backgroundColor: 'rgba(200, 121, 65, 0.08)',
                      borderColor: '#C87941',
                    },
                  }}
                  variant="outlined"
                >
                  Clear Filters
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Active filter chips */}
        {(searchTerm || statusFilter !== 'all') && (
          <Box
            sx={{
              mt: 1.5,
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <Typography variant="caption" sx={{ color: '#6B4E3D', mr: 0.5 }}>
              Showing:
            </Typography>
            {searchTerm && (
              <Chip
                size="small"
                label={`Search: "${searchTerm}"`}
                onDelete={() => setSearchTerm('')}
                sx={{
                  backgroundColor: 'rgba(200, 121, 65, 0.12)',
                  color: '#C87941',
                  '& .MuiChip-deleteIcon': { color: '#C87941' },
                }}
              />
            )}
            {statusFilter !== 'all' && (
              <Chip
                size="small"
                label={`Status: ${
                  statusFilter === 'active' ? 'Active' : 'Inactive'
                }`}
                onDelete={() => setStatusFilter('all')}
                sx={{
                  backgroundColor:
                    statusFilter === 'active'
                      ? 'rgba(76, 175, 80, 0.12)'
                      : 'rgba(244, 67, 54, 0.12)',
                  color: statusFilter === 'active' ? '#4CAF50' : '#F44336',
                  '& .MuiChip-deleteIcon': {
                    color: statusFilter === 'active' ? '#4CAF50' : '#F44336',
                  },
                }}
              />
            )}
            <Typography variant="caption" sx={{ color: '#8B7355', ml: 1 }}>
              ({filteredCategories.length} of {categories.length} categories)
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Categories List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {filteredCategories.length === 0 ? (
          <Paper
            sx={{
              p: 6,
              textAlign: 'center',
              borderRadius: 2.5,
              border: '2px dashed rgba(200, 121, 65, 0.3)',
              background: 'rgba(255, 251, 247, 0.5)',
            }}
          >
            <StoriesIcon
              sx={{ fontSize: 64, color: '#C87941', opacity: 0.4, mb: 2 }}
            />
            <Typography variant="h6" sx={{ color: '#6B4E3D', mb: 1 }}>
              {categories.length === 0
                ? 'No Categories Yet'
                : 'No Results Found'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {categories.length === 0
                ? 'Create your first story category to get started.'
                : 'Try adjusting your search or filter criteria.'}
            </Typography>
          </Paper>
        ) : (
          filteredCategories.map((category, index) => {
            const storyCount = category.stories?.length || 0;
            const totalImages =
              category.stories?.reduce(
                (acc, s) => acc + (s.imageUrls?.length || 0),
                0,
              ) || 0;
            const isExpanded = expandedCategories.has(category.id);

            return (
              <Card
                key={category.id}
                sx={{
                  borderRadius: 2.5,
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
                  border: '1px solid rgba(200, 121, 65, 0.08)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(16px)',
                  overflow: 'visible',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: '0 8px 32px rgba(200, 121, 65, 0.12)',
                  },
                }}
              >
                <CardContent sx={{ pb: isExpanded ? 2 : '16px !important' }}>
                  {/* Category Header */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', md: 'row' },
                      justifyContent: 'space-between',
                      alignItems: { xs: 'stretch', md: 'center' },
                      gap: 2,
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    {/* Left: Category Info */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 2,
                          background:
                            'linear-gradient(135deg, #C87941 0%, #A45F2D 100%)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 4px 12px rgba(200, 121, 65, 0.25)',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        <CategoryIcon sx={{ color: 'white', fontSize: 24 }} />
                        {/* Sort Order Badge */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            bgcolor: '#2C1810',
                            color: 'white',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid white',
                          }}
                        >
                          {index + 1}
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              color: '#2C1810',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {category.name}
                          </Typography>
                          <StatusChip
                            status={category.isActive ? 'active' : 'inactive'}
                          />
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 0.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{ color: '#6B4E3D' }}
                          >
                            {storyCount} stories • {totalImages} images
                          </Typography>
                          {category.description && (
                            <>
                              <Typography
                                variant="caption"
                                sx={{ color: '#C87941' }}
                              >
                                •
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: '#8B7355',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  maxWidth: 200,
                                }}
                              >
                                {category.description}
                              </Typography>
                            </>
                          )}
                        </Box>
                      </Box>
                    </Box>

                    {/* Right: Action Buttons - Restructured */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: { xs: 0.5, md: 1 },
                        flexWrap: 'wrap',
                        justifyContent: { xs: 'flex-end', md: 'flex-end' },
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Order Controls Group */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          bgcolor: 'rgba(107, 78, 61, 0.06)',
                          borderRadius: 1.5,
                          p: 0.25,
                        }}
                      >
                        <Tooltip title="Move Up" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleMoveCategoryOrder(category.id, 'up')
                              }
                              disabled={index === 0}
                              sx={{
                                color:
                                  index === 0
                                    ? 'rgba(107, 78, 61, 0.3)'
                                    : '#6B4E3D',
                              }}
                            >
                              <ArrowUpIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move Down" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleMoveCategoryOrder(category.id, 'down')
                              }
                              disabled={index === filteredCategories.length - 1}
                              sx={{
                                color:
                                  index === filteredCategories.length - 1
                                    ? 'rgba(107, 78, 61, 0.3)'
                                    : '#6B4E3D',
                              }}
                            >
                              <ArrowDownIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>

                      {/* Status Toggle */}
                      <Tooltip
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                        arrow
                      >
                        <Switch
                          size="small"
                          checked={category.isActive}
                          onChange={() =>
                            handleToggleCategoryStatus(category.id)
                          }
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: '#4CAF50',
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track':
                              {
                                backgroundColor: '#4CAF50',
                              },
                          }}
                        />
                      </Tooltip>

                      {/* Edit/Delete Group */}
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Tooltip title="Edit Category" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenCategoryDialog(category)}
                            sx={{
                              color: '#C87941',
                              '&:hover': {
                                backgroundColor: 'rgba(200, 121, 65, 0.1)',
                              },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Category" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category.id)}
                            sx={{
                              color: '#d32f2f',
                              '&:hover': {
                                backgroundColor: 'rgba(211, 47, 47, 0.1)',
                              },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                      {/* Expand/Collapse */}
                      <IconButton
                        size="small"
                        sx={{ color: '#6B4E3D' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategoryExpansion(category.id);
                        }}
                      >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Collapsible Stories Section — flat image grid */}
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px solid rgba(200,121,65,0.1)' }}>
                      {/* Section label */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          Images · {category.stories?.reduce((acc, s) => acc + (s.imageUrls?.length || 0), 0) || 0} total
                        </Typography>
                        <Button size="small" variant="outlined" startIcon={<AddIcon />}
                          onClick={() => handleOpenCategoryDialog(category)}
                          sx={{ borderRadius: 2, fontSize: '0.78rem', fontWeight: 600, py: 0.5, px: 1.5, borderColor: 'rgba(200,121,65,0.4)', color: '#C87941', '&:hover': { borderColor: '#C87941', bgcolor: 'rgba(200,121,65,0.05)' } }}>
                          Add Images
                        </Button>
                      </Box>

                      {category.stories && category.stories.length > 0 ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                          {category.stories.map((story, storyIndex) => (
                            story.imageUrls.map((url, imgIdx) => (
                              <Box key={`${story.id}-${imgIdx}`}
                                sx={{
                                  position: 'relative', width: 130, height: 130,
                                  borderRadius: 2, overflow: 'hidden',
                                  border: '1px solid rgba(200,121,65,0.15)',
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                  cursor: 'pointer',
                                  '&:hover .img-overlay': { opacity: 1 },
                                  '&:hover img': { transform: 'scale(1.06)' },
                                }}
                              >
                                <Box component="img" src={getImageUrl(url)} alt={`Story ${storyIndex + 1}`}
                                  sx={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
                                  onClick={() => setPreviewImage(getImageUrl(url))} />

                                {/* Hover overlay */}
                                <Box className="img-overlay" sx={{
                                  position: 'absolute', inset: 0, opacity: 0, transition: 'opacity 0.2s ease',
                                  background: 'linear-gradient(180deg, rgba(0,0,0,0.0) 40%, rgba(0,0,0,0.65) 100%)',
                                  display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 0.75,
                                }}>
                                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Tooltip title="Delete" arrow>
                                      <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleDeleteStory(story.id); }}
                                        sx={{ bgcolor: 'rgba(239,68,68,0.9)', color: 'white', p: 0.5, '&:hover': { bgcolor: '#EF4444' } }}>
                                        <DeleteIcon sx={{ fontSize: '0.875rem' }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.25 }}>
                                      <Tooltip title="Move Earlier" arrow>
                                        <span>
                                          <IconButton size="small" onClick={() => handleMoveStoryOrder(story.id, 'up')} disabled={storyIndex === 0}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.85)', color: '#2C1810', p: 0.4 }}>
                                            <ArrowUpIcon sx={{ fontSize: '0.875rem' }} />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      <Tooltip title="Move Later" arrow>
                                        <span>
                                          <IconButton size="small" onClick={() => handleMoveStoryOrder(story.id, 'down')} disabled={storyIndex === (category.stories?.length ?? 1) - 1}
                                            sx={{ bgcolor: 'rgba(255,255,255,0.85)', color: '#2C1810', p: 0.4 }}>
                                            <ArrowDownIcon sx={{ fontSize: '0.875rem' }} />
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                    </Box>
                                    <ViewIcon sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem' }} onClick={() => setPreviewImage(getImageUrl(url))} />
                                  </Box>
                                </Box>

                                {/* Order badge */}
                                <Box sx={{
                                  position: 'absolute', top: 5, left: 5,
                                  bgcolor: 'rgba(44,24,16,0.75)', color: 'white',
                                  fontSize: '0.6rem', fontWeight: 700,
                                  px: 0.75, py: 0.2, borderRadius: 1,
                                  backdropFilter: 'blur(4px)',
                                }}>
                                  #{storyIndex + 1}
                                </Box>
                              </Box>
                            ))
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{
                          textAlign: 'center', py: 5,
                          bgcolor: 'rgba(255,251,247,0.5)',
                          borderRadius: 2, border: '2px dashed rgba(200,121,65,0.2)',
                        }}>
                          <ImageIcon sx={{ fontSize: 44, color: '#C87941', opacity: 0.35, mb: 1 }} />
                          <Typography variant="body2" sx={{ color: '#6B4E3D', mb: 2 }}>
                            No images yet in this category
                          </Typography>
                          <Button size="small" variant="outlined" startIcon={<AddIcon />}
                            onClick={() => handleOpenCategoryDialog(category)}
                            sx={{ borderRadius: 2, borderColor: '#C87941', color: '#C87941', fontWeight: 600, '&:hover': { bgcolor: 'rgba(200,121,65,0.06)' } }}>
                            Add Images
                          </Button>
                        </Box>
                      )}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>

      {/* Image Preview Dialog */}
      <Dialog
        open={!!previewImage}
        onClose={() => setPreviewImage(null)}
        maxWidth="lg"
        slotProps={{ paper: { sx: { backgroundColor: 'transparent', boxShadow: 'none', overflow: 'visible' } } }}
      >
        <Box sx={{ position: 'relative' }}>
          <IconButton
            onClick={() => setPreviewImage(null)}
            sx={{
              position: 'absolute',
              top: -48,
              right: 0,
              color: 'white',
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.7)' },
            }}
          >
            <CloseIcon />
          </IconButton>
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Preview"
              sx={{
                maxWidth: '90vw',
                maxHeight: '80vh',
                borderRadius: 2,
                boxShadow: '0 16px 64px rgba(0, 0, 0, 0.3)',
              }}
            />
          )}
        </Box>
      </Dialog>

      {/* Category Dialog */}
      <Dialog open={categoryDialog} onClose={() => setCategoryDialog(false)} maxWidth="md" fullWidth>
        {/* Clean dialog header */}
        <DialogTitle sx={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          px: 3, py: 2.5, borderBottom: '1px solid rgba(200,121,65,0.1)',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'rgba(200,121,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#C87941' }}>
              <CategoryIcon fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#2C1810' }}>
              {editingCategoryId ? 'Edit Category' : 'Create Category'}
            </Typography>
          </Box>
          <IconButton size="small" onClick={() => setCategoryDialog(false)}
            sx={{ color: 'text.secondary', '&:hover': { color: '#C87941', bgcolor: 'rgba(200,121,65,0.08)' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ px: 3, pt: 3, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField label="Category Name" fullWidth value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              required placeholder="e.g., Food, Events, Atmosphere" />
            <TextField label="Description (Optional)" fullWidth multiline rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Brief description of this story category" />
            <FormControlLabel
              control={
                <Switch checked={categoryForm.isActive}
                  onChange={(e) => setCategoryForm({ ...categoryForm, isActive: e.target.checked })}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#4CAF50' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#4CAF50' } }} />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography sx={{ fontWeight: 500 }}>Active</Typography>
                  <Chip label={categoryForm.isActive ? 'Visible' : 'Hidden'} size="small"
                    sx={{ height: 20, fontSize: '0.7rem', bgcolor: categoryForm.isActive ? 'rgba(76,175,80,0.12)' : 'rgba(0,0,0,0.06)', color: categoryForm.isActive ? '#2E7D32' : '#757575' }} />
                </Box>
              }
            />

            {/* Image Upload Section — shown when editing existing category */}
            {editingCategoryId && selectedCategory && (
              <Box sx={{ pt: 2, borderTop: '1px solid rgba(200,121,65,0.12)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.875rem', color: '#2C1810' }}>
                    Images
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#8B7355' }}>
                    {(selectedCategory.stories?.length || 0) - storiesToDelete.length} current
                    {selectedFiles.length > 0 && ` · +${selectedFiles.length} pending`}
                    {storiesToDelete.length > 0 && ` · −${storiesToDelete.length} to remove`}
                  </Typography>
                </Box>

                {/* Existing story thumbnails */}
                {selectedCategory.stories && selectedCategory.stories.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#8B7355', textTransform: 'uppercase', letterSpacing: '0.04em', mb: 1.5 }}>
                      Current Images — click × to remove
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25 }}>
                      {selectedCategory.stories.map((story, idx) => {
                        const isMarkedForDeletion = storiesToDelete.includes(story.id);
                        return story.imageUrls.map((url, uIdx) => (
                          <Box key={`${story.id}-${uIdx}`} sx={{
                            position: 'relative', width: 88, height: 88,
                            borderRadius: 1.5, overflow: 'hidden',
                            border: isMarkedForDeletion ? '2px solid #EF4444' : '1px solid rgba(200,121,65,0.2)',
                            opacity: isMarkedForDeletion ? 0.45 : 1,
                            filter: isMarkedForDeletion ? 'grayscale(80%)' : 'none',
                            transition: 'all 0.2s ease',
                          }}>
                            <Box component="img" src={getImageUrl(url)} alt={`Img ${idx + 1}`}
                              sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            {isMarkedForDeletion && (
                              <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(239,68,68,0.2)' }}>
                                <Typography sx={{ color: '#EF4444', fontWeight: 800, fontSize: '0.6rem', textTransform: 'uppercase' }}>Remove</Typography>
                              </Box>
                            )}
                            <IconButton size="small" onClick={() => toggleStoryForDeletion(story.id)}
                              sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.92)', p: 0.25,
                                '&:hover': { bgcolor: isMarkedForDeletion ? '#E8F5E9' : '#FFF0F0' } }}>
                              <CloseIcon sx={{ fontSize: '0.8rem', color: isMarkedForDeletion ? '#4CAF50' : '#EF4444',
                                transform: isMarkedForDeletion ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                            </IconButton>
                          </Box>
                        ));
                      })}
                    </Box>
                  </Box>
                )}

                {/* Drag-and-drop upload zone */}
                <Box
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  sx={{
                    borderRadius: 2.5,
                    border: `2px dashed ${isDragging ? '#C87941' : 'rgba(200,121,65,0.3)'}`,
                    background: isDragging ? 'rgba(200,121,65,0.04)' : 'rgba(255,251,247,0.5)',
                    transition: 'all 0.2s ease',
                    p: 3, textAlign: 'center',
                  }}
                >
                  <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(200,121,65,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1.5 }}>
                    <UploadIcon sx={{ color: '#C87941', fontSize: '1.5rem' }} />
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: '#2C1810', fontSize: '0.9rem', mb: 0.5 }}>
                    Drop images here or click to browse
                  </Typography>
                  <Typography sx={{ fontSize: '0.78rem', color: '#8B7355', mb: 2 }}>
                    Up to 50 images · Max 1 MB each · Each image = 1 story item
                  </Typography>
                  <Box component="input" accept="image/*" sx={{ display: 'none' }}
                    id="category-story-upload" multiple type="file" onChange={handleImageUpload} />
                  <label htmlFor="category-story-upload">
                    <Button variant="outlined" component="span" size="small"
                      sx={{ borderRadius: 2, borderColor: '#C87941', color: '#C87941', fontWeight: 600, px: 3, '&:hover': { bgcolor: 'rgba(200,121,65,0.06)' } }}>
                      Browse Files
                    </Button>
                  </label>
                </Box>

                {/* New image previews */}
                {imagePreviews.length > 0 && (
                  <Box sx={{ mt: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                      <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: '#2E7D32', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        {imagePreviews.length} new image{imagePreviews.length !== 1 ? 's' : ''} ready to upload
                      </Typography>
                      <Button size="small" onClick={() => { setImagePreviews([]); setSelectedFiles([]); }}
                        sx={{ fontSize: '0.72rem', color: '#EF4444', p: 0.5 }}>
                        Clear all
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.25, maxHeight: 240, overflowY: 'auto', pr: 0.5 }}>
                      {imagePreviews.map((preview, index) => (
                        <Box key={`preview-${index}`} sx={{
                          position: 'relative', width: 88, height: 88,
                          borderRadius: 1.5, overflow: 'hidden',
                          border: '2px solid rgba(46,125,50,0.6)',
                        }}>
                          <Box component="img" src={preview} alt={`Preview ${index + 1}`}
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <Box sx={{ position: 'absolute', top: 3, left: 3, bgcolor: '#4CAF50', color: 'white',
                            fontSize: '0.5rem', fontWeight: 700, px: 0.5, py: 0.1, borderRadius: 0.5, textTransform: 'uppercase' }}>
                            New
                          </Box>
                          <IconButton size="small" onClick={() => removeImagePreview(index)}
                            sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(255,255,255,0.92)', p: 0.25, '&:hover': { bgcolor: '#FFF0F0' } }}>
                            <CloseIcon sx={{ fontSize: '0.8rem', color: '#EF4444' }} />
                          </IconButton>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, pt: 2, gap: 1.5 }}>
          <Button onClick={() => setCategoryDialog(false)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}>
            Cancel
          </Button>
          <Button onClick={handleSaveCategory} variant="contained"
            disabled={loading || !categoryForm.name.trim()}
            sx={{ borderRadius: 2, fontWeight: 600, px: 3, backgroundColor: '#C87941', '&:hover': { backgroundColor: '#A45F2D' } }}>
            {loading ? 'Saving…' : editingCategoryId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title={`Delete ${deleteTarget?.type === 'category' ? 'Category' : 'Story'}`}
        message={
          deleteTarget?.type === 'category'
            ? `Are you sure you want to delete "${deleteTarget.name}"? All images in this category will also be deleted.`
            : 'Are you sure you want to delete this image? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => { setDeleteDialogOpen(false); setDeleteTarget(null); }}
        severity="error"
      />

      <Snackbar open={snackbar.open} autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoriesManagement;
