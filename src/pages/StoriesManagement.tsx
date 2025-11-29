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
  CardMedia,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Grid,
  Paper,
  InputAdornment,
  Tooltip,
  Zoom,
  Collapse,
  Badge,
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
  Collections as GalleryIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';
import { StatusChip } from '../components/common/StatusChip';
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
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [storyDialog, setStoryDialog] = useState(false);
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
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
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
    } else {
      setCategoryForm({
        name: '',
        description: '',
        isActive: true,
        sortOrder: 0,
      });
      setEditingCategoryId(null);
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
        showSnackbar(
          editingCategoryId
            ? 'Category updated successfully'
            : 'Category created successfully',
        );
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
    if (
      !window.confirm(
        'Are you sure you want to delete this category? All stories in this category will also be deleted.',
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stories/categories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showSnackbar('Category deleted successfully');
        loadCategories();
      } else {
        throw new Error('Failed to delete category');
      }
    } catch (error) {
      logger.error('Error deleting category:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

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

  const removeImagePreview = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url: string) => {
    setExistingImageUrls((prev) => prev.filter((u) => u !== url));
    setImagesToDelete((prev) => [...prev, url]);
  };

  const handleOpenStoryDialog = (category: StoryCategory) => {
    setSelectedCategory(category);
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setEditingStory(null);
    setStoryDialog(true);
  };

  // Edit story is currently handled via the story dialog creation route.

  const handleCloseStoryDialog = () => {
    setStoryDialog(false);
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setEditingStory(null);
    setExistingImageUrls([]);
  };

  const handleSaveStory = async () => {
    try {
      if (!selectedCategory) return;

      // For creation require at least one selected file
      if (!editingStory && selectedFiles.length === 0) {
        showSnackbar('Please select at least one image', 'error');
        return;
      }
      // For edit require at least one file or existing image
      if (
        editingStory &&
        selectedFiles.length === 0 &&
        existingImageUrls.length === 0
      ) {
        showSnackbar(
          'Please select at least one image or keep existing images',
          'error',
        );
        return;
      }

      setLoading(true);

      // Upload images
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
      const imageUrls = uploadResult.urls || [];

      let storyResponse: Response;
      if (editingStory) {
        // Update existing story
        const finalImageUrls = [...existingImageUrls, ...imageUrls];
        storyResponse = await fetch(
          `${API_BASE_URL}/stories/${editingStory.id}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ imageUrls: finalImageUrls }),
          },
        );
      } else {
        // Create story
        storyResponse = await fetch(`${API_BASE_URL}/stories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            categoryId: selectedCategory.id,
            imageUrls,
            isActive: true,
            sortOrder: 0,
          }),
        });
      }

      if (storyResponse.ok) {
        showSnackbar(`${imageUrls.length} image(s) uploaded successfully`);
        // Delete marked images from storage after successful save/update
        if (imagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ urls: imagesToDelete }),
            });
            setImagesToDelete([]);
          } catch (err) {
            logger.error('Error deleting story images from storage:', err);
          }
        }
        handleCloseStoryDialog();
        loadCategories();
        setSelectedFiles([]);
        setImagePreviews([]);
        setExistingImageUrls([]);
        setEditingStory(null);
      } else {
        throw new Error('Failed to create story');
      }
    } catch (error) {
      logger.error('Error saving story:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStory = async (storyId: string) => {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/stories/${storyId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        showSnackbar('Story deleted successfully');
        loadCategories();
      } else {
        throw new Error('Failed to delete story');
      }
    } catch (error) {
      logger.error('Error deleting story:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search and status
  const filteredCategories = useMemo(() => {
    let result = categories;

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
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#C87941', fontSize: '1.2rem' }} />
                  </InputAdornment>
                ),
              }}
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
          filteredCategories.map((category) => {
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
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => toggleCategoryExpansion(category.id)}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flex: 1,
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
                        }}
                      >
                        <CategoryIcon sx={{ color: 'white', fontSize: 24 }} />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 700, color: '#2C1810' }}
                          >
                            {category.name}
                          </Typography>
                          <StatusChip
                            status={category.isActive ? 'active' : 'inactive'}
                          />
                          <Chip
                            size="small"
                            icon={
                              <GalleryIcon
                                sx={{ fontSize: '16px !important' }}
                              />
                            }
                            label={`${storyCount} stories`}
                            sx={{
                              backgroundColor: 'rgba(33, 150, 243, 0.1)',
                              color: '#2196F3',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                          <Chip
                            size="small"
                            icon={
                              <PhotoIcon sx={{ fontSize: '16px !important' }} />
                            }
                            label={`${totalImages} images`}
                            sx={{
                              backgroundColor: 'rgba(156, 39, 176, 0.1)',
                              color: '#9C27B0',
                              fontWeight: 600,
                              fontSize: '0.75rem',
                            }}
                          />
                        </Box>
                        {category.description && (
                          <Typography
                            variant="body2"
                            sx={{ color: '#6B4E3D', mt: 0.5, maxWidth: 500 }}
                            noWrap
                          >
                            {category.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action Buttons */}
                    <Box
                      sx={{ display: 'flex', gap: 1, alignItems: 'center' }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Tooltip
                        title={category.isActive ? 'Deactivate' : 'Activate'}
                        arrow
                      >
                        <Switch
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
                      <Tooltip title="Edit Category" arrow>
                        <IconButton
                          onClick={() => handleOpenCategoryDialog(category)}
                          sx={{
                            color: '#C87941',
                            '&:hover': {
                              backgroundColor: 'rgba(200, 121, 65, 0.1)',
                            },
                          }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Category" arrow>
                        <IconButton
                          onClick={() => handleDeleteCategory(category.id)}
                          sx={{
                            color: '#d32f2f',
                            '&:hover': {
                              backgroundColor: 'rgba(211, 47, 47, 0.1)',
                            },
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<UploadIcon />}
                        onClick={() => handleOpenStoryDialog(category)}
                        sx={{
                          backgroundColor: '#C87941',
                          color: 'white',
                          borderRadius: 2,
                          px: 2,
                          boxShadow: '0 4px 12px rgba(200, 121, 65, 0.25)',
                          '&:hover': { backgroundColor: '#A45F2D' },
                        }}
                      >
                        Upload
                      </Button>
                      <IconButton
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

                  {/* Collapsible Stories Section */}
                  <Collapse in={isExpanded}>
                    <Box
                      sx={{
                        mt: 3,
                        pt: 2,
                        borderTop: '1px solid rgba(200, 121, 65, 0.1)',
                      }}
                    >
                      {category.stories && category.stories.length > 0 ? (
                        <Grid container spacing={2}>
                          {category.stories.map((story) => (
                            <Grid key={story.id}>
                              <Box sx={{ position: 'relative' }}>
                                {/* Story Image Grid */}
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: `repeat(${Math.min(
                                      story.imageUrls.length,
                                      4,
                                    )}, 1fr)`,
                                    gap: 0.5,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    border:
                                      '1px solid rgba(200, 121, 65, 0.12)',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                    maxWidth:
                                      story.imageUrls.length === 1 ? 180 : 360,
                                  }}
                                >
                                  {story.imageUrls
                                    .slice(0, 4)
                                    .map((url, idx) => (
                                      <Box
                                        key={idx}
                                        sx={{
                                          position: 'relative',
                                          aspectRatio: '1',
                                          overflow: 'hidden',
                                          cursor: 'pointer',
                                          '&:hover': {
                                            '& img': {
                                              transform: 'scale(1.1)',
                                            },
                                            '& .preview-overlay': {
                                              opacity: 1,
                                            },
                                          },
                                        }}
                                        onClick={() =>
                                          setPreviewImage(getImageUrl(url))
                                        }
                                      >
                                        <Box
                                          component="img"
                                          src={getImageUrl(url)}
                                          alt={`Story ${idx + 1}`}
                                          sx={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.3s ease',
                                          }}
                                        />
                                        <Box
                                          className="preview-overlay"
                                          sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            backgroundColor:
                                              'rgba(0, 0, 0, 0.4)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.2s ease',
                                          }}
                                        >
                                          <ViewIcon
                                            sx={{
                                              color: 'white',
                                              fontSize: 24,
                                            }}
                                          />
                                        </Box>
                                        {/* +X indicator for more images */}
                                        {idx === 3 &&
                                          story.imageUrls.length > 4 && (
                                            <Box
                                              sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                backgroundColor:
                                                  'rgba(0, 0, 0, 0.6)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                              }}
                                            >
                                              <Typography
                                                sx={{
                                                  color: 'white',
                                                  fontWeight: 700,
                                                  fontSize: '1.25rem',
                                                }}
                                              >
                                                +{story.imageUrls.length - 4}
                                              </Typography>
                                            </Box>
                                          )}
                                      </Box>
                                    ))}
                                </Box>

                                {/* Story Action Buttons (remove Edit in preview expanded grid) */}
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    display: 'flex',
                                    gap: 0.5,
                                  }}
                                >
                                  <Tooltip
                                    title="Delete Story"
                                    arrow
                                    TransitionComponent={Zoom}
                                  >
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteStory(story.id)
                                      }
                                      sx={{
                                        bgcolor: 'white',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        '&:hover': { bgcolor: '#FFF0F0' },
                                      }}
                                    >
                                      <DeleteIcon
                                        fontSize="small"
                                        color="error"
                                      />
                                    </IconButton>
                                  </Tooltip>
                                </Box>

                                {/* Image count badge */}
                                <Badge
                                  badgeContent={story.imageUrls.length}
                                  sx={{
                                    position: 'absolute',
                                    bottom: 8,
                                    right: 8,
                                    '& .MuiBadge-badge': {
                                      backgroundColor:
                                        'rgba(200, 121, 65, 0.9)',
                                      color: 'white',
                                      fontWeight: 600,
                                      fontSize: '0.7rem',
                                    },
                                  }}
                                />
                              </Box>
                            </Grid>
                          ))}
                        </Grid>
                      ) : (
                        <Box
                          sx={{
                            textAlign: 'center',
                            py: 4,
                            bgcolor: 'rgba(255, 251, 247, 0.5)',
                            borderRadius: 2,
                            border: '2px dashed rgba(200, 121, 65, 0.2)',
                          }}
                        >
                          <ImageIcon
                            sx={{
                              fontSize: 48,
                              color: '#C87941',
                              opacity: 0.4,
                              mb: 1,
                            }}
                          />
                          <Typography variant="body2" sx={{ color: '#6B4E3D' }}>
                            No stories yet. Click "Upload" to add images.
                          </Typography>
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
        PaperProps={{
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
            overflow: 'visible',
          },
        }}
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
      <Dialog
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingCategoryId ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Category Name"
              fullWidth
              value={categoryForm.name}
              onChange={(e) =>
                setCategoryForm({ ...categoryForm, name: e.target.value })
              }
              required
            />
            <TextField
              label="Description (Optional)"
              fullWidth
              multiline
              rows={3}
              value={categoryForm.description}
              onChange={(e) =>
                setCategoryForm({
                  ...categoryForm,
                  description: e.target.value,
                })
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={categoryForm.isActive}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      isActive: e.target.checked,
                    })
                  }
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveCategory}
            variant="contained"
            sx={{ backgroundColor: '#C87941' }}
          >
            {editingCategoryId ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Story Dialog */}
      <Dialog
        open={storyDialog}
        onClose={() => setStoryDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {editingStory
            ? `Edit Story Images for ${selectedCategory?.name}`
            : `Upload Images for ${selectedCategory?.name}`}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box
              component="input"
              accept="image/*"
              sx={{ display: 'none' }}
              id="story-image-upload"
              multiple
              type="file"
              onChange={handleImageUpload}
            />
            <label htmlFor="story-image-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadIcon />}
                sx={{
                  borderColor: '#C87941',
                  color: '#C87941',
                  mb: 2,
                }}
              >
                Select Images
              </Button>
            </label>

            {(existingImageUrls.length > 0 || imagePreviews.length > 0) && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {existingImageUrls.map((url, index) => (
                  <Box key={`existing-${index}`} sx={{ position: 'relative' }}>
                    <Card sx={{ width: 150, height: 150 }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={getImageUrl(url)}
                        alt={`Existing ${index + 1}`}
                      />
                    </Card>
                    <IconButton
                      size="small"
                      onClick={() => removeExistingImage(url)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
                {imagePreviews.map((preview, index) => (
                  <Box key={`preview-${index}`} sx={{ position: 'relative' }}>
                    <Card sx={{ width: 150, height: 150 }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={preview}
                        alt={`Preview ${index + 1}`}
                      />
                    </Card>
                    <IconButton
                      size="small"
                      onClick={() => removeImagePreview(index)}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255,255,255,0.9)',
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStoryDialog}>Cancel</Button>
          <Button
            onClick={handleSaveStory}
            variant="contained"
            sx={{ backgroundColor: '#C87941' }}
            disabled={
              !editingStory && selectedFiles.length === 0
                ? true
                : editingStory &&
                  selectedFiles.length === 0 &&
                  existingImageUrls.length === 0
                ? true
                : false
            }
          >
            {editingStory ? 'Save' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
        // @ts-ignore PortalProps typed as any
        PortalProps={{ style: { zIndex: 99999 } }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StoriesManagement;
