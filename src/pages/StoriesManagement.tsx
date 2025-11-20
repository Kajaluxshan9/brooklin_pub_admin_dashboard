import React, { useState, useEffect, useCallback } from 'react';
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
  FormControlLabel,
  Switch,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { StatusChip } from '../components/common/StatusChip';
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
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  );

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
      showSnackbar('Error loading story categories', 'error');
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
      showSnackbar('Error saving category', 'error');
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
      showSnackbar('Error deleting category', 'error');
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
      showSnackbar('Error updating category status', 'error');
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

  const handleOpenStoryDialog = (category: StoryCategory) => {
    setSelectedCategory(category);
    setSelectedFiles([]);
    setImagePreviews([]);
    setStoryDialog(true);
  };

  const handleSaveStory = async () => {
    try {
      if (!selectedCategory) return;

      if (selectedFiles.length === 0) {
        showSnackbar('Please select at least one image', 'error');
        return;
      }

      setLoading(true);

      // Upload images
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append('images', file);
      });

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

      // Create story
      const storyResponse = await fetch(`${API_BASE_URL}/stories`, {
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

      if (storyResponse.ok) {
        showSnackbar(`${imageUrls.length} image(s) uploaded successfully`);
        setStoryDialog(false);
        loadCategories();
        setSelectedFiles([]);
        setImagePreviews([]);
      } else {
        throw new Error('Failed to create story');
      }
    } catch (error) {
      logger.error('Error saving story:', error);
      showSnackbar('Error saving story', 'error');
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
      showSnackbar('Error deleting story', 'error');
    } finally {
      setLoading(false);
    }
  };

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

      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
            backgroundColor: 'rgba(200, 121, 65, 0.15)',
            '& .MuiLinearProgress-bar': { backgroundColor: '#C87941' },
          }}
        />
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {categories.map((category) => (
          <Box key={category.id}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 2px 12px rgba(200, 121, 65, 0.12)',
                border: '1px solid #E8DDD0',
              }}
            >
              <CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {category.name}
                    </Typography>
                    <StatusChip
                      status={category.isActive ? 'active' : 'inactive'}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      onClick={() => handleToggleCategoryStatus(category.id)}
                      sx={{ color: '#C87941' }}
                    >
                      <Switch checked={category.isActive} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleOpenCategoryDialog(category)}
                      sx={{ color: '#C87941' }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteCategory(category.id)}
                      sx={{ color: '#d32f2f' }}
                    >
                      <DeleteIcon />
                    </IconButton>
                    <Button
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      onClick={() => handleOpenStoryDialog(category)}
                      sx={{
                        borderColor: '#C87941',
                        color: '#C87941',
                        '&:hover': {
                          borderColor: '#A45F2D',
                          backgroundColor: 'rgba(200, 121, 65, 0.1)',
                        },
                      }}
                    >
                      Upload Images
                    </Button>
                  </Box>
                </Box>

                {category.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {category.description}
                  </Typography>
                )}

                {/* Display stories */}
                {category.stories && category.stories.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {category.stories.map((story) => (
                      <Box key={story.id} sx={{ position: 'relative' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 1,
                          }}
                        >
                          {story.imageUrls.map((url, idx) => (
                            <Card
                              key={idx}
                              sx={{
                                width: 150,
                                height: 150,
                                position: 'relative',
                              }}
                            >
                              <CardMedia
                                component="img"
                                height="150"
                                image={url}
                                alt={`Story image ${idx + 1}`}
                              />
                            </Card>
                          ))}
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteStory(story.id)}
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 4,
                      bgcolor: 'grey.50',
                      borderRadius: 2,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <ImageIcon
                      sx={{ fontSize: 48, color: 'grey.400', mb: 1 }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      No stories yet. Click "Upload Images" to add stories.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

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
        <DialogTitle>Upload Images for {selectedCategory?.name}</DialogTitle>
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

            {imagePreviews.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {imagePreviews.map((preview, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
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
          <Button onClick={() => setStoryDialog(false)}>Cancel</Button>
          <Button
            onClick={handleSaveStory}
            variant="contained"
            sx={{ backgroundColor: '#C87941' }}
            disabled={selectedFiles.length === 0}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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
