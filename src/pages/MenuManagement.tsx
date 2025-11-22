import React, { useState, useEffect, useMemo, useCallback } from "react";
import { API_BASE_URL } from "../config/env.config";
import {
  Box,
  Typography,
  Button,
  Paper,
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
  Chip,
  Tabs,
  Tab,
  Grid,
  InputAdornment,
  IconButton,
  Alert,
  Snackbar,
  Card,
  CardMedia,
  LinearProgress,
  Tooltip,
  Zoom,
  Divider,
  Badge,
} from "@mui/material";

import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  CloudUpload as UploadIcon,
  CloudUpload as CloudUploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import type { GridColDef } from '@mui/x-data-grid';
import { PageHeader } from '../components/common/PageHeader';
import logger from '../utils/logger';
import { StatusChip } from '../components/common/StatusChip';
import {
  uploadImages,
  parseBackendError,
  getErrorMessage,
} from '../utils/uploadHelpers';

interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  categories?: MenuCategory[];
}

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  primaryCategoryId?: string;
  primaryCategory?: PrimaryCategory;
  menuItems?: MenuItem[];
  createdAt: Date;
  updatedAt: Date;
}

interface BackendMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  preparationTime?: number;
  allergens?: string[];
  dietaryInfo?: string[];
  isAvailable: boolean;
  imageUrls?: string[];
  sortOrder: number;
  createdAt: string;
  category?: {
    name: string;
  };
}


interface MenuItemMeasurement {
  id?: string;
  measurementTypeId?: string;
  price: number;
  isAvailable: boolean;
  sortOrder: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  preparationTime?: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  allergens: string[];
  imageUrls: string[];
  sortOrder: number;
  createdAt: Date;
  hasMeasurements?: boolean;
  measurements?: MenuItemMeasurement[];
}

type RawMeasurement = {
  id?: string;
  measurementTypeId?: string;
  measurementType?: { id?: string } | null;
  price?: number | string | null;
  isAvailable?: boolean | null;
  sortOrder?: number | null;
};

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const MenuManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [primaryCategories, setPrimaryCategories] = useState<PrimaryCategory[]>(
    [],
  );
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [measurementTypes, setMeasurementTypes] = useState<{
    id: string;
    name: string;
  }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    // load measurement types
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/measurements`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setMeasurementTypes(data);
        }
      } catch (err) {
        console.error('Failed to load measurement types', err);
      }
    })();
  }, []);
  const [primaryCategoryDialog, setPrimaryCategoryDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] =
    useState<PrimaryCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    null,
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Form states
  const [primaryCategoryForm, setPrimaryCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    isActive: true,
    sortOrder: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    primaryCategoryId: '',
    isActive: true,
    sortOrder: 0,
  });

  const [itemForm, setItemForm] = useState({
    name: '',
    description: '',
    price: 0,
    categoryId: '',
    preparationTime: undefined as number | undefined,
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    allergens: [] as string[],
    imageUrls: [] as string[],
    sortOrder: 0,
    hasMeasurements: false,
    measurements: [] as MenuItemMeasurement[],
  });

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  // Track deletes for primary and category images separately to avoid collisions between dialogs
  const [primaryImagesToDelete, setPrimaryImagesToDelete] = useState<string[]>(
    [],
  );
  const [categoryImagesToDelete, setCategoryImagesToDelete] = useState<
    string[]
  >([]);

  const filteredPrimaryCategories = useMemo(() => {
    if (!debouncedSearchTerm) return primaryCategories;
    return primaryCategories.filter(
      (pc) =>
        pc.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        pc.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [primaryCategories, debouncedSearchTerm]);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return categories;
    return categories.filter(
      (category) =>
        category.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        category.description
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        category.primaryCategory?.name
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [categories, debouncedSearchTerm]);

  const filteredItems = useMemo(() => {
    if (!searchTerm) return menuItems;
    return menuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.categoryName?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [menuItems, searchTerm]);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState['severity'] = 'success') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const closeItemDialog = useCallback(() => {
    setItemDialog(false);
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
  }, []);

  const loadPrimaryCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/menu/primary-categories`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPrimaryCategories(
          data.map((cat: PrimaryCategory) => ({
            ...cat,
            createdAt: new Date(cat.createdAt),
          })),
        );
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch primary categories');
      }
    } catch (error) {
      logger.error('Error fetching primary categories:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to load primary categories';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/menu/categories`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(
          data.map((cat: MenuCategory) => ({
            ...cat,
            createdAt: new Date(cat.createdAt),
          })),
        );
      } else {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch categories');
      }
    } catch (error) {
      logger.error('Error fetching categories:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load categories';
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/menu/items`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(
          data.map((item: BackendMenuItem) => ({
            ...item,
            categoryName: item.category?.name || 'Unknown',
            createdAt: new Date(item.createdAt),
            price: parseFloat(item.price.toString()) || 0,
            isVegetarian: item.dietaryInfo?.includes('vegetarian') || false,
            isVegan: item.dietaryInfo?.includes('vegan') || false,
            isGlutenFree: item.dietaryInfo?.includes('gluten-free') || false,
            isDairyFree: item.dietaryInfo?.includes('dairy-free') || false,
            imageUrls: item.imageUrls || [],
          })),
        );
      } else {
        throw new Error('Failed to fetch menu items');
      }
    } catch (error) {
      logger.error('Error fetching menu items:', error);
      showSnackbar('Failed to load menu items', 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    loadPrimaryCategories();
    loadCategories();
    loadMenuItems();
  }, [loadPrimaryCategories, loadCategories, loadMenuItems]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryForm({
      name: '',
      description: '',
      imageUrl: '',
      primaryCategoryId: '',
      isActive: true,
      sortOrder: categories.length,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCategoryImagesToDelete([]);
    setCategoryDialog(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || '',
      primaryCategoryId: category.primaryCategoryId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCategoryImagesToDelete([]);
    setCategoryDialog(true);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setItemForm({
      name: '',
      description: '',
      price: 0,
      categoryId: '',
      preparationTime: undefined,
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      allergens: [],
      imageUrls: [],
      sortOrder: menuItems.length,
      hasMeasurements: false,
      measurements: [],
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setItemDialog(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price:
        typeof item.price === 'string'
          ? parseFloat(item.price) || 0
          : item.price,
      categoryId: item.categoryId,
      preparationTime: item.preparationTime,
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isDairyFree: item.isDairyFree,
      allergens: item.allergens,
      imageUrls: item.imageUrls || [],
      sortOrder: item.sortOrder,
      hasMeasurements: item.hasMeasurements || false,
      measurements: (item.measurements || []).map((m: RawMeasurement) => ({
        id: m.id,
        measurementTypeId: m.measurementTypeId || m.measurementType?.id || '',
        price: typeof m.price === 'string' ? parseFloat(m.price) : m.price || 0,
        isAvailable: m.isAvailable ?? true,
        sortOrder: m.sortOrder ?? 0,
      })),
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setItemDialog(true);
  };

  // Primary Category handlers
  const handleCreatePrimaryCategory = () => {
    setSelectedPrimaryCategory(null);
    setPrimaryCategoryForm({
      name: '',
      description: '',
      imageUrl: '',
      isActive: true,
      sortOrder: primaryCategories.length,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryImagesToDelete([]);
    setPrimaryCategoryDialog(true);
  };

  const handleEditPrimaryCategory = (primaryCategory: PrimaryCategory) => {
    setSelectedPrimaryCategory(primaryCategory);
    setPrimaryCategoryForm({
      name: primaryCategory.name,
      description: primaryCategory.description,
      imageUrl: primaryCategory.imageUrl || '',
      isActive: primaryCategory.isActive,
      sortOrder: primaryCategory.sortOrder,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryImagesToDelete([]);
    setPrimaryCategoryDialog(true);
  };

  const handleMovePrimaryCategoryOrder = async (
    primaryCategoryId: string,
    direction: 'up' | 'down',
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/menu/primary-categories/${primaryCategoryId}/move`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        },
      );

      if (response.ok) {
        // Delete any images marked for deletion from S3 only after successful update
        if (primaryImagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ urls: primaryImagesToDelete }),
            });
            setPrimaryImagesToDelete([]);
          } catch (err) {
            logger.error(
              'Error deleting primary category images from S3:',
              err,
            );
          }
        }
        await loadPrimaryCategories();
        showSnackbar(`Primary category moved ${direction} successfully`);
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      logger.error(`Error moving primary category ${direction}:`, error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrimaryCategory = async () => {
    try {
      setLoading(true);

      // Upload image if a new file is selected
      let imageUrl = primaryCategoryForm.imageUrl;
      if (selectedFiles.length > 0) {
        setUploadingImage(true);
        try {
          const uploadedUrls = await uploadImages(
            selectedFiles,
            'menu/categories/primary',
          );
          imageUrl = uploadedUrls[0];
        } catch (uploadError) {
          showSnackbar(getErrorMessage(uploadError), 'error');
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const url = selectedPrimaryCategory
        ? `${API_BASE_URL}/menu/primary-categories/${selectedPrimaryCategory.id}`
        : `${API_BASE_URL}/menu/primary-categories`;

      const method = selectedPrimaryCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...primaryCategoryForm, imageUrl }),
      });

      if (response.ok) {
        await loadPrimaryCategories();
        showSnackbar(
          `Primary category ${
            selectedPrimaryCategory ? 'updated' : 'created'
          } successfully`,
        );
        setPrimaryCategoryDialog(false);
        setSelectedFiles([]);
        setImagePreviews([]);
        setPrimaryImagesToDelete([]);
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      logger.error('Error saving primary category:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrimaryCategory = async (id: string) => {
    if (
      window.confirm('Are you sure you want to delete this primary category?')
    ) {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/menu/primary-categories/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (response.ok) {
          await loadPrimaryCategories();
          showSnackbar('Primary category deleted successfully');
        } else {
          const errorMessage = await parseBackendError(response);
          throw new Error(errorMessage);
        }
      } catch (error) {
        logger.error('Error deleting primary category:', error);
        showSnackbar(getErrorMessage(error), 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Update handleFileSelect to support category images
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = fileArray.filter(
      (file) => !validTypes.includes(file.type),
    );

    if (invalidFiles.length > 0) {
      showSnackbar('Only JPEG, PNG, and WebP images are allowed', 'error');
      return;
    }

    // Validate file sizes (1MB limit)
    const oversizedFiles = fileArray.filter((file) => file.size > 1024 * 1024);

    if (oversizedFiles.length > 0) {
      showSnackbar('Image files must be less than 1MB', 'error');
      return;
    }

    setSelectedFiles(fileArray);

    // Create previews
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleMoveCategoryOrder = async (
    categoryId: string,
    direction: 'up' | 'down',
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/menu/categories/${categoryId}/move`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        },
      );

      if (response.ok) {
        await loadCategories();
        showSnackbar(`Category moved ${direction} successfully`);
      } else {
        throw new Error(`Failed to move category ${direction}`);
      }
    } catch (error) {
      logger.error(`Error moving category ${direction}:`, error);
      showSnackbar(`Failed to move category ${direction}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItemOrder = async (
    itemId: string,
    direction: 'up' | 'down',
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/menu/items/${itemId}/move`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ direction }),
        },
      );

      if (response.ok) {
        await loadMenuItems();
        showSnackbar(`Menu item moved ${direction} successfully`);
      } else {
        throw new Error(`Failed to move menu item ${direction}`);
      }
    } catch (error) {
      logger.error(`Error moving menu item ${direction}:`, error);
      showSnackbar(`Failed to move menu item ${direction}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = useCallback(async () => {
    try {
      setLoading(true);

      // Upload image if a new file is selected
      let imageUrl = categoryForm.imageUrl;
      if (selectedFiles.length > 0) {
        setUploadingImage(true);
        try {
          const uploadedUrls = await uploadImages(
            selectedFiles,
            'menu/categories',
          );
          imageUrl = uploadedUrls[0];
        } catch (uploadError) {
          showSnackbar(getErrorMessage(uploadError), 'error');
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const url = selectedCategory
        ? `${API_BASE_URL}/menu/categories/${selectedCategory.id}`
        : `${API_BASE_URL}/menu/categories`;

      const method = selectedCategory ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ...categoryForm, imageUrl }),
      });

      if (response.ok) {
        // Delete any images marked for deletion from S3 only after successful update
        if (categoryImagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ urls: categoryImagesToDelete }),
            });
            setCategoryImagesToDelete([]);
          } catch (err) {
            logger.error('Error deleting category images from S3:', err);
          }
        }
        setCategoryDialog(false);
        setSelectedFiles([]);
        setImagePreviews([]);
        await loadCategories();
        showSnackbar(
          selectedCategory
            ? 'Category updated successfully'
            : 'Category created successfully',
        );
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      logger.error('Error saving category:', error);
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    categoryForm,
    selectedFiles,
    loadCategories,
    showSnackbar,
    categoryImagesToDelete,
  ]);

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          'Are you sure you want to delete this category? This will also delete all associated menu items.',
        )
      ) {
        try {
          setLoading(true);
          const response = await fetch(
            `${API_BASE_URL}/menu/categories/${id}`,
            {
              method: 'DELETE',
              credentials: 'include',
            },
          );

          if (response.ok) {
            await loadCategories();
            await loadMenuItems();
            showSnackbar('Category deleted successfully');
          } else {
            throw new Error('Failed to delete category');
          }
        } catch (error) {
          logger.error('Error deleting category:', error);
          showSnackbar('Failed to delete category', 'error');
        } finally {
          setLoading(false);
        }
      }
    },
    [loadCategories, loadMenuItems, showSnackbar],
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file count (max 5 total)
    const totalImages =
      itemForm.imageUrls.length + imagePreviews.length + files.length;
    if (totalImages > 5) {
      showSnackbar('Maximum 5 images allowed per menu item', 'warning');
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
      showSnackbar('Only image files are allowed', 'warning');
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

  const removeImage = (index: number) => {
    const totalExistingImages = itemForm.imageUrls.length;

    if (index < totalExistingImages) {
      // Mark existing S3 image for deletion (will be deleted on save)
      const imageToRemove = itemForm.imageUrls[index];
      setImagesToDelete((prev) => [...prev, imageToRemove]);

      // Remove from form imageUrls
      setItemForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));

      showSnackbar('Image will be deleted when you save changes', 'info');
    } else {
      // Removing a new file preview (not yet uploaded)
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const removeCategoryImage = (index: number) => {
    const totalExistingImages = categoryForm.imageUrl ? 1 : 0;

    if (index < totalExistingImages) {
      const imageToRemove = categoryForm.imageUrl as string;
      setCategoryImagesToDelete((prev) => [...prev, imageToRemove]);

      setCategoryForm((prev) => ({ ...prev, imageUrl: '' }));

      showSnackbar(
        'Category image will be deleted when you save changes',
        'info',
      );
    } else {
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const removePrimaryImage = (index: number) => {
    const totalExistingImages = primaryCategoryForm.imageUrl ? 1 : 0;

    if (index < totalExistingImages) {
      const imageToRemove = primaryCategoryForm.imageUrl as string;
      setPrimaryImagesToDelete((prev) => [...prev, imageToRemove]);

      setPrimaryCategoryForm((prev) => ({ ...prev, imageUrl: '' }));

      showSnackbar(
        'Primary category image will be deleted when you save changes',
        'info',
      );
    } else {
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!itemForm.name.trim()) {
        showSnackbar('Name is required', 'error');
        return;
      }
      if (!itemForm.categoryId) {
        showSnackbar('Category is required', 'error');
        return;
      }

      // Validate measurements if enabled
      if (itemForm.hasMeasurements) {
        if (itemForm.measurements.length === 0) {
          showSnackbar('At least one measurement is required when measurements are enabled', 'error');
          return;
        }
        for (const measurement of itemForm.measurements) {
            if (!measurement.measurementTypeId || !measurement.measurementTypeId.trim()) {
              showSnackbar('All measurements must have a type selected', 'error');
              return;
            }
          if (measurement.price < 0) {
            showSnackbar('All measurement prices must be 0 or greater', 'error');
            return;
          }
        }
      } else {
        // Validate single price if measurements are not enabled
        if (itemForm.price < 0) {
          showSnackbar('Price must be 0 or greater', 'error');
          return;
        }
      }

      // Ensure price has at most 2 decimal places
      const formattedPrice = Math.round(itemForm.price * 100) / 100;

      let finalImageUrls = [...itemForm.imageUrls];

      // Upload new images to S3 if any
      if (selectedFiles.length > 0) {
        try {
          const uploadedUrls = await uploadImages(selectedFiles, 'menu/items');
          finalImageUrls = [...finalImageUrls, ...uploadedUrls];
          showSnackbar(
            `${selectedFiles.length} image(s) uploaded successfully`,
            'success',
          );
        } catch {
          showSnackbar('Failed to upload images. Please try again.', 'error');
          return;
        }
      }

      // Prepare data according to CreateMenuItemDto schema
      const itemData = {
        name: itemForm.name,
        description: itemForm.description,
        price: itemForm.hasMeasurements ? undefined : formattedPrice,
        categoryId: itemForm.categoryId,
        preparationTime: itemForm.preparationTime || undefined,
        allergens: itemForm.allergens,
        dietaryInfo: [
          ...(itemForm.isVegetarian ? ['vegetarian'] : []),
          ...(itemForm.isVegan ? ['vegan'] : []),
          ...(itemForm.isGlutenFree ? ['gluten-free'] : []),
          ...(itemForm.isDairyFree ? ['dairy-free'] : []),
        ],
        isAvailable: itemForm.isAvailable,
        imageUrls: finalImageUrls,
        sortOrder: itemForm.sortOrder,
        hasMeasurements: itemForm.hasMeasurements,
        measurements: itemForm.hasMeasurements
          ? itemForm.measurements.map((m) => ({
              measurementTypeId: m.measurementTypeId,
              price: Math.round(m.price * 100) / 100,
              isAvailable: m.isAvailable,
              sortOrder: m.sortOrder,
            }))
          : undefined,
      };

      const url = selectedItem
        ? `${API_BASE_URL}/menu/items/${selectedItem.id}`
        : `${API_BASE_URL}/menu/items`;

      const method = selectedItem ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        // Delete marked images from S3 after successful save
        if (imagesToDelete.length > 0) {
          try {
            await fetch(`${API_BASE_URL}/upload/images`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({ urls: imagesToDelete }),
            });
            logger.debug(`Deleted ${imagesToDelete.length} image(s) from S3`);
          } catch (error) {
            logger.error('Error deleting images from S3:', error);
            // Don't show error to user as the item was saved successfully
          }
        }

        closeItemDialog();
        await loadMenuItems();
        showSnackbar(
          selectedItem
            ? 'Menu item updated successfully'
            : 'Menu item created successfully',
        );
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: 'Unknown error' }));
        throw new Error(
          `Failed to save menu item: ${
            errorData.message || response.statusText
          }`,
        );
      }
    } catch (error) {
      logger.error('Error saving menu item:', error);
      showSnackbar('Failed to save menu item', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/menu/items/${id}`, {
          method: 'DELETE',
          credentials: 'include',
        });

        if (response.ok) {
          await loadMenuItems();
          showSnackbar('Menu item deleted successfully');
        } else {
          throw new Error('Failed to delete menu item');
        }
      } catch (error) {
        logger.error('Error deleting menu item:', error);
        showSnackbar('Failed to delete menu item', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  // Primary Category DataGrid columns
  const primaryCategoryColumns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Box
            component="img"
            src={params.value}
            alt="Primary Category"
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F5F5F5',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          >
            <ImageIcon sx={{ color: '#999' }} />
          </Box>
        ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#2C1810',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 320,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip status={params.value ? 'active' : 'inactive'} />
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleMovePrimaryCategoryOrder(params.row.id, 'up')}
            sx={{ color: '#000000' }}
            disabled={params.row.sortOrder === 0}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() =>
              handleMovePrimaryCategoryOrder(params.row.id, 'down')
            }
            sx={{ color: '#000000' }}
            disabled={params.row.sortOrder === primaryCategories.length - 1}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditPrimaryCategory(params.row)}
            sx={{ color: '#000000' }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeletePrimaryCategory(params.row.id)}
            sx={{ color: '#D32F2F' }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const categoryColumns: GridColDef[] = [
    {
      field: 'imageUrl',
      headerName: 'Image',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderCell: (params) =>
        params.value ? (
          <Box
            component="img"
            src={params.value}
            alt="Category"
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F5F5F5',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          >
            <ImageIcon sx={{ color: '#999' }} />
          </Box>
        ),
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#2C1810',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'primaryCategoryName',
      headerName: 'Primary Category',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueGetter: (_value, row) => row.primaryCategory?.name || 'N/A',
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: '0.9rem',
            color: '#2C1810',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 250,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 120,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip
          status={params.value ? 'active' : 'inactive'}
          label={params.value ? 'Active' : 'Inactive'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 200,
      headerAlign: 'center',
      align: 'center',
      getActions: (params) => [
        <Tooltip title="Move Up" key="up">
          <GridActionsCellItem
            icon={<ArrowUpIcon />}
            label="Move Up"
            onClick={() => handleMoveCategoryOrder(params.row.id, 'up')}
            disabled={params.row.sortOrder === 0}
          />
        </Tooltip>,
        <Tooltip title="Move Down" key="down">
          <GridActionsCellItem
            icon={<ArrowDownIcon />}
            label="Move Down"
            onClick={() => handleMoveCategoryOrder(params.row.id, 'down')}
            disabled={params.row.sortOrder === categories.length - 1}
          />
        </Tooltip>,
        <Tooltip title="Edit" key="edit">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditCategory(params.row)}
          />
        </Tooltip>,
        <Tooltip title="Delete" key="delete">
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteCategory(params.row.id)}
          />
        </Tooltip>,
      ],
    },
  ];

  const itemColumns: GridColDef[] = [
    {
      field: 'imageUrls',
      headerName: 'Image',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => {
        const imageUrl = params.row.imageUrls?.[0];
        return imageUrl ? (
          <Box
            component="img"
            src={imageUrl}
            alt={params.row.name}
            sx={{
              width: 60,
              height: 60,
              objectFit: 'cover',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#F5F5F5',
              borderRadius: 1.5,
              border: '1px solid #E8E3DC',
            }}
          >
            <ImageIcon sx={{ color: '#999' }} />
          </Box>
        );
      },
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 160,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#2C1810',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            textAlign: 'center',
            maxWidth: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'categoryName',
      headerName: 'Category',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      renderCell: (params) => (
        <Typography
          sx={{
            textAlign: 'center',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            width: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: 'primaryCategoryName',
      headerName: 'Primary Category',
      width: 150,
      headerAlign: 'center',
      align: 'center',
      sortable: true,
      valueGetter: (_value, row) => {
        const category = categories.find((c) => c.id === row.categoryId);
        return category?.primaryCategory?.name || 'N/A';
      },
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Typography
          sx={{
            textAlign: 'center',
            fontSize: '0.9rem',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
            width: '100%',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 90,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => {
        const price = parseFloat(params.value);
        return isNaN(price) ? '$0.00' : `$${price.toFixed(2)}`;
      },
      sortable: true,
    },
    {
      field: 'dietary',
      headerName: 'Dietary',
      width: 140,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Box>
          {params.row.isVegetarian && (
            <Chip label="V" size="small" sx={{ mr: 0.5 }} />
          )}
          {params.row.isVegan && (
            <Chip label="VE" size="small" sx={{ mr: 0.5 }} />
          )}
          {params.row.isGlutenFree && (
            <Chip label="GF" size="small" sx={{ mr: 0.5 }} />
          )}
          {params.row.isDairyFree && <Chip label="DF" size="small" />}
        </Box>
      ),
      sortable: false,
    },
    {
      field: 'isAvailable',
      headerName: 'Available',
      width: 100,
      headerAlign: 'center',
      align: 'center',
      renderHeader: (params) => (
        <Typography
          sx={{
            fontWeight: 600,
            color: '#000000',
            textAlign: 'center',
            width: '100%',
          }}
        >
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip
          status={params.value ? 'active' : 'inactive'}
          label={params.value ? 'Available' : 'Unavailable'}
          size="small"
        />
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 180,
      headerAlign: 'center',
      align: 'center',
      getActions: (params) => [
        <Tooltip title="Move Up" key="up">
          <GridActionsCellItem
            icon={<ArrowUpIcon />}
            label="Move Up"
            onClick={() => handleMoveItemOrder(params.row.id, 'up')}
            disabled={params.row.sortOrder === 0}
          />
        </Tooltip>,
        <Tooltip title="Move Down" key="down">
          <GridActionsCellItem
            icon={<ArrowDownIcon />}
            label="Move Down"
            onClick={() => handleMoveItemOrder(params.row.id, 'down')}
            disabled={
              menuItems
                .filter((item) => item.categoryId === params.row.categoryId)
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .pop()?.id === params.row.id
            }
          />
        </Tooltip>,
        <Tooltip title="Edit" key="edit">
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            onClick={() => handleEditItem(params.row)}
          />
        </Tooltip>,
        <Tooltip title="Delete" key="delete">
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={() => handleDeleteItem(params.row.id)}
          />
        </Tooltip>,
      ],
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh' }}>
      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
            backgroundColor: 'rgba(200, 121, 65, 0.15)',
            '& .MuiLinearProgress-bar': { backgroundColor: '#C87941' },
          }}
        />
      )}

      <PageHeader
        title="Menu Management"
        subtitle="Manage your menu categories and items"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={
              activeTab === 0
                ? handleCreatePrimaryCategory
                : activeTab === 1
                ? handleCreateCategory
                : handleCreateItem
            }
            sx={{
              backgroundColor: '#C87941',
              color: 'white',
              fontWeight: 600,
              '&:hover': { backgroundColor: '#A45F2D' },
            }}
          >
            {activeTab === 0
              ? 'Add Primary Category'
              : activeTab === 1
              ? 'Add Category'
              : 'Add Menu Item'}
          </Button>
        }
      />

      {/* Tabs moved outside table for better UX */}
      <Box
        sx={{
          mb: 3,
          background:
            'linear-gradient(135deg, rgba(255, 248, 240, 0.95) 0%, rgba(255, 255, 255, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 3,
          p: 1,
          border: '2px solid rgba(200, 121, 65, 0.2)',
          boxShadow:
            '0 8px 24px rgba(200, 121, 65, 0.12), inset 0 1px 2px rgba(255, 255, 255, 0.8)',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            '& .MuiTab-root': {
              color: '#3B2A20',
              fontWeight: 700,
              fontSize: '1rem',
              textTransform: 'none',
              minHeight: 60,
              px: 4,
              borderRadius: 2.5,
              margin: '4px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              '&.Mui-selected': {
                color: '#FFFFFF',
                background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
                boxShadow:
                  '0 6px 20px rgba(200, 121, 65, 0.35), inset 0 1px 2px rgba(255, 255, 255, 0.3)',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '60%',
                  height: '3px',
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)',
                  borderRadius: '3px 3px 0 0',
                },
              },
              '&:hover:not(.Mui-selected)': {
                color: '#C87941',
                background: 'rgba(200, 121, 65, 0.12)',
                transform: 'translateY(-2px)',
              },
            },
            '& .MuiTabs-indicator': {
              display: 'none',
            },
          }}
        >
          <Tab
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 1,
                }}
              >
                <Box component="span">Primary Categories</Box>
                <Badge
                  badgeContent={primaryCategories.length}
                  color="primary"
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: '#F5A94C',
                      color: '#2C1810',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      boxShadow: '0 2px 8px rgba(245, 169, 76, 0.45)',
                      minWidth: '24px',
                      height: '24px',
                    },
                  }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 1,
                }}
              >
                <Box component="span">Categories</Box>
                <Badge
                  badgeContent={categories.length}
                  color="primary"
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: '#F5A94C',
                      color: '#2C1810',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      boxShadow: '0 2px 8px rgba(245, 169, 76, 0.45)',
                      minWidth: '24px',
                      height: '24px',
                    },
                  }}
                />
              </Box>
            }
          />
          <Tab
            label={
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  pr: 1,
                }}
              >
                <Box component="span">Menu Items</Box>
                <Badge
                  badgeContent={menuItems.length}
                  color="primary"
                  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                  sx={{
                    ml: 2,
                    '& .MuiBadge-badge': {
                      backgroundColor: '#F5A94C',
                      color: '#2C1810',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                      boxShadow: '0 2px 8px rgba(245, 169, 76, 0.45)',
                      minWidth: '24px',
                      height: '24px',
                    },
                  }}
                />
              </Box>
            }
          />
        </Tabs>
      </Box>

      <Paper
        elevation={0}
        sx={{
          width: '100%',
          mb: 3,
          borderRadius: 4,
          border: '2px solid rgba(200, 121, 65, 0.2)',
          boxShadow: '0 12px 40px rgba(200, 121, 65, 0.12)',
          overflow: 'hidden',
          background: 'linear-gradient(to bottom, #FFFFFF 0%, #FFFBF7 100%)',
        }}
      >
        {/* Search bar for all tabs */}
        <Box
          sx={{
            p: 2,
            pb: 1.5,
            background: 'linear-gradient(180deg, #FFFBF7 0%, #FFFFFF 100%)',
          }}
        >
          <TextField
            size="small"
            fullWidth
            placeholder={
              activeTab === 0
                ? 'Search primary categories...'
                : activeTab === 1
                ? 'Search categories...'
                : 'Search menu items...'
            }
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '& fieldset': {
                  borderColor: 'rgba(200, 121, 65, 0.2)',
                  borderWidth: '1.5px',
                },
                '&:hover': {
                  backgroundColor: '#FFFBF7',
                  '& fieldset': {
                    borderColor: '#C87941',
                  },
                },
                '&.Mui-focused': {
                  backgroundColor: 'white',
                  boxShadow: '0 2px 8px rgba(200, 121, 65, 0.12)',
                  '& fieldset': {
                    borderColor: '#C87941',
                    borderWidth: '1.5px',
                  },
                },
              },
              '& .MuiInputBase-input': {
                fontSize: '0.9rem',
                padding: '8px 12px 8px 0',
              },
            }}
          />
        </Box>

        <Box
          sx={{
            height: 600,
            width: '100%',
            backgroundColor: 'white',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          {activeTab === 0 ? (
            <DataGrid
              rows={filteredPrimaryCategories}
              columns={primaryCategoryColumns}
              rowHeight={64}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: '1px solid rgba(200, 121, 65, 0.12)',
                borderRadius: 2,
                '& .MuiDataGrid-root': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-columnHeaders': {
                  background:
                    'linear-gradient(135deg, rgba(200,121,65,0.06) 0%, rgba(255,255,255,0.98) 100%)',
                  color: '#2C1810',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: 0,
                  borderBottom: '1px solid rgba(200,121,65,0.12)',
                  minHeight: 56,
                  '& .MuiDataGrid-columnHeader': {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    '&:focus': {
                      outline: 'none',
                    },
                    '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiDataGrid-iconButtonContainer':
                      {
                        color: '#2C1810',
                        opacity: 1,
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                      },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: '#2C1810',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '1 1 0',
                    textAlign: 'center',
                    pr: '36px',
                    whiteSpace: 'normal',
                  },
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(200, 121, 65, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(200, 121, 65, 0.16)',
                    },
                  },
                },
                '& .MuiDataGrid-cell': {
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottom: '1px solid rgba(200, 121, 65, 0.08)',
                  borderRight: '1px solid rgba(200, 121, 65, 0.06)',
                  color: '#2C1810',
                  fontSize: '0.875rem',
                  padding: '12px',
                  textAlign: 'center',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
                  borderTop: '2px solid rgba(200, 121, 65, 0.15)',
                },
                '& .MuiTablePagination-root': {
                  color: '#6B4E3D',
                },
                '& .MuiTablePagination-select': {
                  borderRadius: 1.5,
                },
                '& .MuiTablePagination-selectIcon': {
                  color: '#C87941',
                },
                '& .MuiIconButton-root': {
                  color: '#C87941',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.1)',
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
          ) : activeTab === 1 ? (
            <DataGrid
              rows={filteredCategories}
              columns={categoryColumns}
              rowHeight={64}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: '1px solid rgba(200, 121, 65, 0.12)',
                borderRadius: 2,
                '& .MuiDataGrid-root': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-columnHeaders': {
                  background:
                    'linear-gradient(135deg, rgba(200,121,65,0.06) 0%, rgba(255,255,255,0.98) 100%)',
                  color: '#2C1810',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: 0,
                  borderBottom: '1px solid rgba(200,121,65,0.12)',
                  minHeight: 56,
                  '& .MuiDataGrid-columnHeader': {
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: 1,
                    '&:focus': {
                      outline: 'none',
                    },
                    '& .MuiIconButton-root, & .MuiSvgIcon-root, & .MuiDataGrid-iconButtonContainer':
                      {
                        color: '#2C1810',
                        opacity: 1,
                        position: 'absolute',
                        right: 8,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 2,
                      },
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: '#2C1810',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '1 1 0',
                    textAlign: 'center',
                    pr: '36px',
                    whiteSpace: 'normal',
                  },
                  '& .MuiDataGrid-columnHeader .MuiIconButton-root, & .MuiDataGrid-columnHeader .MuiSvgIcon-root':
                    {
                      color: '#2C1810',
                    },
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(200, 121, 65, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(200, 121, 65, 0.16)',
                    },
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(200, 121, 65, 0.08)',
                  borderRight: '1px solid rgba(200, 121, 65, 0.06)',
                  color: '#2C1810',
                  fontSize: '0.875rem',
                  padding: '12px',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
                  borderTop: '2px solid rgba(200, 121, 65, 0.15)',
                },
                '& .MuiTablePagination-root': {
                  color: '#6B4E3D',
                },
                '& .MuiTablePagination-select': {
                  borderRadius: 1.5,
                },
                '& .MuiTablePagination-selectIcon': {
                  color: '#C87941',
                },
                '& .MuiIconButton-root': {
                  color: '#C87941',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.1)',
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
          ) : (
            <DataGrid
              rows={filteredItems}
              columns={itemColumns}
              rowHeight={64}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: '1px solid rgba(200, 121, 65, 0.12)',
                borderRadius: 2,
                '& .MuiDataGrid-root': {
                  backgroundColor: 'white',
                },
                '& .MuiDataGrid-columnHeaders': {
                  background:
                    'linear-gradient(135deg, rgba(200,121,65,0.06) 0%, rgba(255,255,255,0.98) 100%)',
                  color: '#2C1810',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: 0,
                  borderBottom: '1px solid rgba(200,121,65,0.12)',
                  minHeight: 56,
                  '& .MuiDataGrid-columnHeader': {
                    '&:focus': {
                      outline: 'none',
                    },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  },
                  '& .MuiDataGrid-columnSeparator': {
                    display: 'none',
                  },
                  '& .MuiDataGrid-columnHeaderTitle': {
                    color: '#2C1810',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '1 1 0',
                    textAlign: 'center',
                    pr: '36px',
                    whiteSpace: 'normal',
                  },
                  '& .MuiDataGrid-columnHeader .MuiIconButton-root, & .MuiDataGrid-columnHeader .MuiSvgIcon-root':
                    {
                      color: '#2C1810',
                    },
                },
                '& .MuiDataGrid-row': {
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.08)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(200, 121, 65, 0.12)',
                    '&:hover': {
                      backgroundColor: 'rgba(200, 121, 65, 0.16)',
                    },
                  },
                },
                '& .MuiDataGrid-cell': {
                  borderBottom: '1px solid rgba(200, 121, 65, 0.08)',
                  borderRight: '1px solid rgba(200, 121, 65, 0.06)',
                  color: '#2C1810',
                  fontSize: '0.875rem',
                  padding: '12px',
                  '&:focus': {
                    outline: 'none',
                  },
                  '&:last-child': {
                    borderRight: 'none',
                  },
                },
                '& .MuiDataGrid-footerContainer': {
                  background:
                    'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
                  borderTop: '2px solid rgba(200, 121, 65, 0.15)',
                },
                '& .MuiTablePagination-root': {
                  color: '#6B4E3D',
                },
                '& .MuiTablePagination-select': {
                  borderRadius: 1.5,
                },
                '& .MuiTablePagination-selectIcon': {
                  color: '#C87941',
                },
                '& .MuiIconButton-root': {
                  color: '#C87941',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(200, 121, 65, 0.1)',
                    transform: 'scale(1.1)',
                  },
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Primary Category Dialog */}
      <Dialog
        open={primaryCategoryDialog}
        onClose={() => {
          setPrimaryCategoryDialog(false);
          setSelectedFiles([]);
          setImagePreviews([]);
          setPrimaryImagesToDelete([]);
        }}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(200, 121, 65, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            py: 2.5,
          }}
        >
          {selectedPrimaryCategory
            ? 'Edit Primary Category'
            : 'Create Primary Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Primary Category Name"
                required
                value={primaryCategoryForm.name}
                onChange={(e) =>
                  setPrimaryCategoryForm({
                    ...primaryCategoryForm,
                    name: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={primaryCategoryForm.description}
                onChange={(e) =>
                  setPrimaryCategoryForm({
                    ...primaryCategoryForm,
                    description: e.target.value,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Category Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileSelect}
                  />
                </Button>
                {(imagePreviews.length > 0 || primaryCategoryForm.imageUrl) && (
                  <Box
                    sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  >
                    {imagePreviews.length > 0
                      ? imagePreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              border: '1px solid #E8E3DC',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.8)',
                              }}
                              onClick={() => removePrimaryImage(index)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))
                      : primaryCategoryForm.imageUrl && (
                          <Box
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              border: '1px solid #E8E3DC',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={primaryCategoryForm.imageUrl}
                              alt="Current"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.8)',
                              }}
                              onClick={() => removePrimaryImage(0)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Supported formats: JPEG, PNG, WebP. Max size: 1MB
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={primaryCategoryForm.sortOrder}
                onChange={(e) =>
                  setPrimaryCategoryForm({
                    ...primaryCategoryForm,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">Active:</Typography>
                <Switch
                  checked={primaryCategoryForm.isActive}
                  onChange={(e) =>
                    setPrimaryCategoryForm({
                      ...primaryCategoryForm,
                      isActive: e.target.checked,
                    })
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
          }}
        >
          <Button
            onClick={() => {
              setPrimaryCategoryDialog(false);
              setSelectedFiles([]);
              setImagePreviews([]);
            }}
            variant="outlined"
            sx={{
              borderColor: 'rgba(200, 121, 65, 0.3)',
              color: '#C87941',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#C87941',
                backgroundColor: 'rgba(200, 121, 65, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePrimaryCategory}
            variant="contained"
            disabled={loading || uploadingImage || !primaryCategoryForm.name}
            sx={{
              background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(200, 121, 65, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A45F2D 0%, #C87941 100%)',
                boxShadow: '0 6px 16px rgba(200, 121, 65, 0.4)',
              },
              '&:disabled': {
                background: '#E0E0E0',
                color: '#999',
              },
            }}
          >
            {selectedPrimaryCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialog}
        onClose={() => {
          setCategoryDialog(false);
          setSelectedFiles([]);
          setImagePreviews([]);
          setCategoryImagesToDelete([]);
        }}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(200, 121, 65, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            py: 2.5,
          }}
        >
          {selectedCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Category Name"
                required
                value={categoryForm.name}
                onChange={(e) =>
                  setCategoryForm({ ...categoryForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description (Optional)"
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
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth required>
                <InputLabel>Primary Category</InputLabel>
                <Select
                  value={categoryForm.primaryCategoryId || ''}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      primaryCategoryId: e.target.value,
                    })
                  }
                >
                  <MenuItem value="">
                    <em>Select Primary Category</em>
                  </MenuItem>
                  {primaryCategories
                    .filter((pc) => pc.isActive)
                    .map((pc) => (
                      <MenuItem key={pc.id} value={pc.id}>
                        {pc.name}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                  Category Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUploadIcon />}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileSelect}
                  />
                </Button>
                {(imagePreviews.length > 0 || categoryForm.imageUrl) && (
                  <Box
                    sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}
                  >
                    {imagePreviews.length > 0
                      ? imagePreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              border: '1px solid #E8E3DC',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.8)',
                              }}
                              onClick={() => removeCategoryImage(index)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))
                      : categoryForm.imageUrl && (
                          <Box
                            sx={{
                              position: 'relative',
                              width: 100,
                              height: 100,
                              border: '1px solid #E8E3DC',
                              borderRadius: 1,
                            }}
                          >
                            <Box
                              component="img"
                              src={categoryForm.imageUrl}
                              alt="Current"
                              sx={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '4px',
                              }}
                            />
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                bgcolor: 'rgba(255,255,255,0.8)',
                              }}
                              onClick={() => removeCategoryImage(0)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Supported formats: JPEG, PNG, WebP. Max size: 1MB
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  height: '100%',
                }}
              >
                <Typography variant="body2">Active:</Typography>
                <Switch
                  checked={categoryForm.isActive}
                  onChange={(e) =>
                    setCategoryForm({
                      ...categoryForm,
                      isActive: e.target.checked,
                    })
                  }
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setCategoryDialog(false);
              setSelectedFiles([]);
              setImagePreviews([]);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={
              loading ||
              uploadingImage ||
              !categoryForm.name ||
              !categoryForm.primaryCategoryId
            }
          >
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog
        open={itemDialog}
        onClose={closeItemDialog}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(200, 121, 65, 0.25)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
            color: 'white',
            fontWeight: 700,
            fontSize: '1.25rem',
            py: 2.5,
          }}
        >
          {selectedItem ? 'Edit Menu Item' : 'Create Menu Item'}
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Item Name"
                value={itemForm.name}
                onChange={(e) =>
                  setItemForm({ ...itemForm, name: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={itemForm.categoryId}
                  onChange={(e) =>
                    setItemForm({ ...itemForm, categoryId: e.target.value })
                  }
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
              />
            </Grid>
            {!itemForm.hasMeasurements && (
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  inputProps={{ step: 0.01, min: 0 }}
                  value={itemForm.price === 0 ? '' : itemForm.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setItemForm({
                        ...itemForm,
                        price: 0,
                      });
                    } else {
                      const parsed = parseFloat(value);
                      setItemForm({
                        ...itemForm,
                        price: isNaN(parsed) || parsed < 0 ? 0 : parsed,
                      });
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '') {
                      setItemForm({ ...itemForm, price: 0 });
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">$</InputAdornment>
                    ),
                  }}
                />
              </Grid>
            )}
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={itemForm.sortOrder}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    sortOrder: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>

            {/* Measurement/Size Pricing Section */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ mt: 2, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.hasMeasurements}
                      onChange={(e) => {
                        const hasMeasurements = e.target.checked;
                        setItemForm({
                          ...itemForm,
                          hasMeasurements,
                          measurements: hasMeasurements
                            ? itemForm.measurements.length > 0
                              ? itemForm.measurements
                              : [
                                  {
                                    measurementTypeId: '',
                                    price: 0,
                                    isAvailable: true,
                                    sortOrder: 0,
                                  },
                                ]
                            : [],
                        });
                      }}
                    />
                  }
                  label="Use Multiple Sizes/Measurements"
                />
                <Typography variant="caption" color="text.secondary" display="block">
                  Enable this to add different sizes (Small, Medium, Large, Pint, Pitcher, etc.) with individual pricing
                </Typography>
              </Box>

              {itemForm.hasMeasurements && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                    }}
                  >
                    <Typography variant="subtitle2">
                      Size/Measurement Options
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setItemForm({
                          ...itemForm,
                          measurements: [
                            ...itemForm.measurements,
                            {
                              measurementTypeId: '',
                              price: 0,
                              isAvailable: true,
                              sortOrder: itemForm.measurements.length,
                            },
                          ],
                        });
                      }}
                    >
                      Add Size
                    </Button>
                  </Box>

                  {itemForm.measurements.map((measurement, index) => (
                    <Card
                      key={index}
                      sx={{ mb: 2, p: 2, backgroundColor: 'grey.50' }}
                    >
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 5 }}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Size/Type</InputLabel>
                            <Select
                              value={measurement.measurementTypeId || ''}
                              onChange={(e) => {
                                const newMeasurements = [...itemForm.measurements];
                                newMeasurements[index].measurementTypeId =
                                  e.target.value as string;
                                setItemForm({
                                  ...itemForm,
                                  measurements: newMeasurements,
                                });
                              }}
                            >
                              {/* If measurement types are not loaded or empty, keep regular as fallback */}
                              {measurementTypes.length === 0 && (
                                <MenuItem value="">Regular</MenuItem>
                              )}
                              {measurementTypes.map((mt) => (
                                <MenuItem key={mt.id} value={mt.id}>
                                  {mt.name}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Price"
                            type="number"
                            inputProps={{ step: 0.01, min: 0 }}
                            value={
                              measurement.price === 0 ? '' : measurement.price
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              const newMeasurements = [...itemForm.measurements];
                              if (value === '') {
                                newMeasurements[index].price = 0;
                              } else {
                                const parsed = parseFloat(value);
                                newMeasurements[index].price =
                                  isNaN(parsed) || parsed < 0 ? 0 : parsed;
                              }
                              setItemForm({
                                ...itemForm,
                                measurements: newMeasurements,
                              });
                            }}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  $
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 3 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  size="small"
                                  checked={measurement.isAvailable}
                                  onChange={(e) => {
                                    const newMeasurements = [
                                      ...itemForm.measurements,
                                    ];
                                    newMeasurements[index].isAvailable =
                                      e.target.checked;
                                    setItemForm({
                                      ...itemForm,
                                      measurements: newMeasurements,
                                    });
                                  }}
                                />
                              }
                              label="Available"
                            />
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                const newMeasurements =
                                  itemForm.measurements.filter(
                                    (_, i) => i !== index,
                                  );
                                setItemForm({
                                  ...itemForm,
                                  measurements: newMeasurements,
                                });
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </Box>
              )}
            </Grid>

            {/* Image Upload Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Images (Max 5, 1MB each)
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box
                  component="input"
                  accept="image/*"
                  sx={{ display: 'none' }}
                  id="image-upload"
                  multiple
                  type="file"
                  onChange={handleImageUpload}
                />
                <label htmlFor="image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={
                      itemForm.imageUrls.length + imagePreviews.length >= 5
                    }
                  >
                    Upload Images
                  </Button>
                </label>
              </Box>

              {(itemForm.imageUrls.length > 0 || imagePreviews.length > 0) && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                  {/* Existing images */}
                  {itemForm.imageUrls.map((url, index) => (
                    <Box
                      sx={{
                        width: {
                          xs: 'calc(50% - 8px)',
                          sm: 'calc(33.333% - 8px)',
                          md: 'calc(25% - 8px)',
                        },
                      }}
                      key={`existing-${index}`}
                    >
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={url}
                          alt={`Existing image ${index + 1}`}
                          onError={(
                            e: React.SyntheticEvent<HTMLImageElement>,
                          ) => {
                            // replace with a tiny placeholder SVG if image fails to load
                            e.currentTarget.src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14">Image unavailable</text></svg>';
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.8)',
                          }}
                          onClick={() => removeImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Box>
                  ))}
                  {/* New image previews */}
                  {imagePreviews.map((preview, index) => (
                    <Box
                      sx={{
                        width: {
                          xs: 'calc(50% - 8px)',
                          sm: 'calc(33.333% - 8px)',
                          md: 'calc(25% - 8px)',
                        },
                      }}
                      key={`new-${index}`}
                    >
                      <Card sx={{ position: 'relative' }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={preview}
                          alt={`New image ${index + 1}`}
                          onError={(
                            e: React.SyntheticEvent<HTMLImageElement>,
                          ) => {
                            e.currentTarget.src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14">Preview unavailable</text></svg>';
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 4,
                            right: 4,
                            bgcolor: 'rgba(255,255,255,0.8)',
                          }}
                          onClick={() =>
                            removeImage(itemForm.imageUrls.length + index)
                          }
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Card>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Dietary Information
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.isAvailable}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          isAvailable: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Available"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.isVegetarian}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          isVegetarian: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Vegetarian"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.isVegan}
                      onChange={(e) =>
                        setItemForm({ ...itemForm, isVegan: e.target.checked })
                      }
                    />
                  }
                  label="Vegan"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.isGlutenFree}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          isGlutenFree: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Gluten Free"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={itemForm.isDairyFree}
                      onChange={(e) =>
                        setItemForm({
                          ...itemForm,
                          isDairyFree: e.target.checked,
                        })
                      }
                    />
                  }
                  label="Dairy Free"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <Divider />
        <DialogActions
          sx={{
            p: 3,
            gap: 1.5,
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFF8F0 100%)',
          }}
        >
          <Button
            onClick={closeItemDialog}
            variant="outlined"
            sx={{
              borderColor: 'rgba(200, 121, 65, 0.3)',
              color: '#C87941',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              '&:hover': {
                borderColor: '#C87941',
                backgroundColor: 'rgba(200, 121, 65, 0.05)',
              },
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
              color: 'white',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(200, 121, 65, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #A45F2D 0%, #C87941 100%)',
                boxShadow: '0 6px 16px rgba(200, 121, 65, 0.4)',
              },
              '&:disabled': {
                background: '#E0E0E0',
                color: '#999',
              },
            }}
          >
            {selectedItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
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

export default React.memo(MenuManagement);

