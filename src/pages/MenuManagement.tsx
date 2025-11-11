import React, { useState, useEffect, useMemo, useCallback } from "react";
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
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
import { PageHeader } from "../components/common/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import {
  uploadImages,
  parseBackendError,
  getErrorMessage,
} from "../utils/uploadHelpers";

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

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName?: string;
  isAvailable: boolean;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  allergens: string[];
  imageUrls: string[];
  sortOrder: number;
  createdAt: Date;
}

interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "warning" | "info";
}

const MenuManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [primaryCategories, setPrimaryCategories] = useState<PrimaryCategory[]>(
    []
  );
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);
  const [primaryCategoryDialog, setPrimaryCategoryDialog] = useState(false);
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [selectedPrimaryCategory, setSelectedPrimaryCategory] =
    useState<PrimaryCategory | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Form states
  const [primaryCategoryForm, setPrimaryCategoryForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    isActive: true,
    sortOrder: 0,
  });

  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    primaryCategoryId: "",
    isActive: true,
    sortOrder: 0,
  });

  const [itemForm, setItemForm] = useState({
    name: "",
    description: "",
    price: 0,
    categoryId: "",
    isAvailable: true,
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isDairyFree: false,
    allergens: [] as string[],
    imageUrls: [] as string[],
    sortOrder: 0,
  });

  // Image upload states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const filteredCategories = useMemo(() => {
    if (!debouncedSearchTerm) return categories;
    return categories.filter((category) =>
      category.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [categories, debouncedSearchTerm]);

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"] = "success") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const loadPrimaryCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/menu/primary-categories",
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPrimaryCategories(
          data.map((cat: PrimaryCategory) => ({
            ...cat,
            createdAt: new Date(cat.createdAt),
          }))
        );
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch primary categories");
      }
    } catch (error) {
      console.error("Error fetching primary categories:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to load primary categories";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/menu/categories", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setCategories(
          data.map((cat: MenuCategory) => ({
            ...cat,
            createdAt: new Date(cat.createdAt),
          }))
        );
      } else {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to load categories";
      showSnackbar(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  const loadMenuItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:5000/menu/items", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setMenuItems(
          data.map((item: BackendMenuItem) => ({
            ...item,
            categoryName: item.category?.name || "Unknown",
            createdAt: new Date(item.createdAt),
            price: parseFloat(item.price.toString()) || 0,
            isVegetarian: item.dietaryInfo?.includes("vegetarian") || false,
            isVegan: item.dietaryInfo?.includes("vegan") || false,
            isGlutenFree: item.dietaryInfo?.includes("gluten-free") || false,
            isDairyFree: item.dietaryInfo?.includes("dairy-free") || false,
            imageUrls: item.imageUrls || [],
          }))
        );
      } else {
        throw new Error("Failed to fetch menu items");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showSnackbar("Failed to load menu items", "error");
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
      name: "",
      description: "",
      imageUrl: "",
      primaryCategoryId: "",
      isActive: true,
      sortOrder: categories.length,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCategoryDialog(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      imageUrl: category.imageUrl || "",
      primaryCategoryId: category.primaryCategoryId || "",
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setCategoryDialog(true);
  };

  const handleCreateItem = () => {
    setSelectedItem(null);
    setItemForm({
      name: "",
      description: "",
      price: 0,
      categoryId: "",
      isAvailable: true,
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false,
      isDairyFree: false,
      allergens: [],
      imageUrls: [],
      sortOrder: menuItems.length,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setItemDialog(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price:
        typeof item.price === "string"
          ? parseFloat(item.price) || 0
          : item.price,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isDairyFree: item.isDairyFree,
      allergens: item.allergens,
      imageUrls: item.imageUrls || [],
      sortOrder: item.sortOrder,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setItemDialog(true);
  };

  // Primary Category handlers
  const handleCreatePrimaryCategory = () => {
    setSelectedPrimaryCategory(null);
    setPrimaryCategoryForm({
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
      sortOrder: primaryCategories.length,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryCategoryDialog(true);
  };

  const handleEditPrimaryCategory = (primaryCategory: PrimaryCategory) => {
    setSelectedPrimaryCategory(primaryCategory);
    setPrimaryCategoryForm({
      name: primaryCategory.name,
      description: primaryCategory.description,
      imageUrl: primaryCategory.imageUrl || "",
      isActive: primaryCategory.isActive,
      sortOrder: primaryCategory.sortOrder,
    });
    setSelectedFiles([]);
    setImagePreviews([]);
    setPrimaryCategoryDialog(true);
  };

  const handleMovePrimaryCategoryOrder = async (
    primaryCategoryId: string,
    direction: "up" | "down"
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/menu/primary-categories/${primaryCategoryId}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ direction }),
        }
      );

      if (response.ok) {
        await loadPrimaryCategories();
        showSnackbar(`Primary category moved ${direction} successfully`);
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error(`Error moving primary category ${direction}:`, error);
      showSnackbar(getErrorMessage(error), "error");
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
          const uploadedUrls = await uploadImages(selectedFiles);
          imageUrl = uploadedUrls[0];
        } catch (uploadError) {
          showSnackbar(getErrorMessage(uploadError), "error");
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const url = selectedPrimaryCategory
        ? `http://localhost:5000/menu/primary-categories/${selectedPrimaryCategory.id}`
        : "http://localhost:5000/menu/primary-categories";

      const method = selectedPrimaryCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...primaryCategoryForm, imageUrl }),
      });

      if (response.ok) {
        await loadPrimaryCategories();
        showSnackbar(
          `Primary category ${
            selectedPrimaryCategory ? "updated" : "created"
          } successfully`
        );
        setPrimaryCategoryDialog(false);
        setSelectedFiles([]);
        setImagePreviews([]);
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving primary category:", error);
      showSnackbar(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrimaryCategory = async (id: string) => {
    if (
      window.confirm("Are you sure you want to delete this primary category?")
    ) {
      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:5000/menu/primary-categories/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          await loadPrimaryCategories();
          showSnackbar("Primary category deleted successfully");
        } else {
          const errorMessage = await parseBackendError(response);
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error("Error deleting primary category:", error);
        showSnackbar(getErrorMessage(error), "error");
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
    const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const invalidFiles = fileArray.filter(
      (file) => !validTypes.includes(file.type)
    );

    if (invalidFiles.length > 0) {
      showSnackbar("Only JPEG, PNG, and WebP images are allowed", "error");
      return;
    }

    // Validate file sizes (1MB limit)
    const oversizedFiles = fileArray.filter((file) => file.size > 1024 * 1024);

    if (oversizedFiles.length > 0) {
      showSnackbar("Image files must be less than 1MB", "error");
      return;
    }

    setSelectedFiles(fileArray);

    // Create previews
    const previews = fileArray.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleMoveCategoryOrder = async (
    categoryId: string,
    direction: "up" | "down"
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/menu/categories/${categoryId}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ direction }),
        }
      );

      if (response.ok) {
        await loadCategories();
        showSnackbar(`Category moved ${direction} successfully`);
      } else {
        throw new Error(`Failed to move category ${direction}`);
      }
    } catch (error) {
      console.error(`Error moving category ${direction}:`, error);
      showSnackbar(`Failed to move category ${direction}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveItemOrder = async (
    itemId: string,
    direction: "up" | "down"
  ) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/menu/items/${itemId}/move`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ direction }),
        }
      );

      if (response.ok) {
        await loadMenuItems();
        showSnackbar(`Menu item moved ${direction} successfully`);
      } else {
        throw new Error(`Failed to move menu item ${direction}`);
      }
    } catch (error) {
      console.error(`Error moving menu item ${direction}:`, error);
      showSnackbar(`Failed to move menu item ${direction}`, "error");
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
          const uploadedUrls = await uploadImages(selectedFiles);
          imageUrl = uploadedUrls[0];
        } catch (uploadError) {
          showSnackbar(getErrorMessage(uploadError), "error");
          return;
        } finally {
          setUploadingImage(false);
        }
      }

      const url = selectedCategory
        ? `http://localhost:5000/menu/categories/${selectedCategory.id}`
        : "http://localhost:5000/menu/categories";

      const method = selectedCategory ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ...categoryForm, imageUrl }),
      });

      if (response.ok) {
        setCategoryDialog(false);
        setSelectedFiles([]);
        setImagePreviews([]);
        await loadCategories();
        showSnackbar(
          selectedCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
      } else {
        const errorMessage = await parseBackendError(response);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showSnackbar(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  }, [
    selectedCategory,
    categoryForm,
    selectedFiles,
    loadCategories,
    showSnackbar,
  ]);

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (
        window.confirm(
          "Are you sure you want to delete this category? This will also delete all associated menu items."
        )
      ) {
        try {
          setLoading(true);
          const response = await fetch(
            `http://localhost:5000/menu/categories/${id}`,
            {
              method: "DELETE",
              credentials: "include",
            }
          );

          if (response.ok) {
            await loadCategories();
            await loadMenuItems();
            showSnackbar("Category deleted successfully");
          } else {
            throw new Error("Failed to delete category");
          }
        } catch (error) {
          console.error("Error deleting category:", error);
          showSnackbar("Failed to delete category", "error");
        } finally {
          setLoading(false);
        }
      }
    },
    [loadCategories, loadMenuItems, showSnackbar]
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validate file count (max 5 total)
    const totalImages =
      itemForm.imageUrls.length + imagePreviews.length + files.length;
    if (totalImages > 5) {
      showSnackbar("Maximum 5 images allowed per menu item", "warning");
      return;
    }

    // Validate file size (max 1MB each)
    const oversizedFiles = files.filter((file) => file.size > 1024 * 1024);
    if (oversizedFiles.length > 0) {
      showSnackbar("Each image must be less than 1MB", "warning");
      return;
    }

    // Validate file type
    const invalidFiles = files.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      showSnackbar("Only image files are allowed", "warning");
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

  const removeImage = async (index: number) => {
    const totalExistingImages = itemForm.imageUrls.length;

    if (index < totalExistingImages) {
      // Removing an existing S3 URL
      const imageToRemove = itemForm.imageUrls[index];
      try {
        await fetch("http://localhost:5000/upload/images", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ urls: [imageToRemove] }),
        });
        showSnackbar("Image deleted from server");
      } catch (error) {
        console.error("Error deleting image from S3:", error);
        showSnackbar("Failed to delete image from server", "warning");
        // Continue with local removal even if server deletion fails
      }

      // Remove from form imageUrls
      setItemForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));
    } else {
      // Removing a new file preview
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const uploadImagesToS3 = async (files: File[]): Promise<string[]> => {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("images", file);
      });

      const response = await fetch("http://localhost:5000/upload/images", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.urls || [];
      } else {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      showSnackbar("Failed to upload images to server", "error");
      throw error;
    }
  };

  const handleSaveItem = async () => {
    try {
      setLoading(true);

      // Validate required fields
      if (!itemForm.name.trim()) {
        showSnackbar("Name is required", "error");
        return;
      }
      if (!itemForm.description.trim()) {
        showSnackbar("Description is required", "error");
        return;
      }
      if (!itemForm.categoryId) {
        showSnackbar("Category is required", "error");
        return;
      }
      if (itemForm.price < 0) {
        showSnackbar("Price must be 0 or greater", "error");
        return;
      }

      // Ensure price has at most 2 decimal places
      const formattedPrice = Math.round(itemForm.price * 100) / 100;

      let finalImageUrls = [...itemForm.imageUrls];

      // Upload new images to S3 if any
      if (selectedFiles.length > 0) {
        const uploadedUrls = await uploadImagesToS3(selectedFiles);
        finalImageUrls = [...finalImageUrls, ...uploadedUrls];
      }

      const itemData = {
        ...itemForm,
        price: formattedPrice,
        allergens: itemForm.allergens,
        dietaryInfo: [
          ...(itemForm.isVegetarian ? ["vegetarian"] : []),
          ...(itemForm.isVegan ? ["vegan"] : []),
          ...(itemForm.isGlutenFree ? ["gluten-free"] : []),
          ...(itemForm.isDairyFree ? ["dairy-free"] : []),
        ],
        imageUrls: finalImageUrls,
      };

      const url = selectedItem
        ? `http://localhost:5000/menu/items/${selectedItem.id}`
        : "http://localhost:5000/menu/items";

      const method = selectedItem ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(itemData),
      });

      if (response.ok) {
        setItemDialog(false);
        await loadMenuItems();
        showSnackbar(
          selectedItem
            ? "Menu item updated successfully"
            : "Menu item created successfully"
        );
        setSelectedFiles([]);
        setImagePreviews([]);
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Unknown error" }));
        throw new Error(
          `Failed to save menu item: ${
            errorData.message || response.statusText
          }`
        );
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      showSnackbar("Failed to save menu item", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/menu/items/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          await loadMenuItems();
          showSnackbar("Menu item deleted successfully");
        } else {
          throw new Error("Failed to delete menu item");
        }
      } catch (error) {
        console.error("Error deleting menu item:", error);
        showSnackbar("Failed to delete menu item", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Primary Category DataGrid columns
  const primaryCategoryColumns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 120,
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
              objectFit: "cover",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#F5F5F5",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          >
            <ImageIcon sx={{ color: "#999" }} />
          </Box>
        ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 300,
      sortable: true,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 400,
      sortable: false,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      sortable: true,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip status={params.value ? "active" : "inactive"} />
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleMovePrimaryCategoryOrder(params.row.id, "up")}
            sx={{ color: "#000000" }}
            disabled={params.row.sortOrder === 0}
          >
            <ArrowUpwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() =>
              handleMovePrimaryCategoryOrder(params.row.id, "down")
            }
            sx={{ color: "#000000" }}
            disabled={params.row.sortOrder === primaryCategories.length - 1}
          >
            <ArrowDownwardIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleEditPrimaryCategory(params.row)}
            sx={{ color: "#000000" }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleDeletePrimaryCategory(params.row.id)}
            sx={{ color: "#D32F2F" }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  const categoryColumns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 120,
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
              objectFit: "cover",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#F5F5F5",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          >
            <ImageIcon sx={{ color: "#999" }} />
          </Box>
        ),
    },
    {
      field: "name",
      headerName: "Name",
      width: 250,
      sortable: true,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "description",
      headerName: "Description",
      width: 350,
      sortable: false,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip
          status={params.value ? "active" : "inactive"}
          label={params.value ? "Active" : "Inactive"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      getActions: (params) => [
        <Tooltip title="Move Up" key="up">
          <GridActionsCellItem
            icon={<ArrowUpIcon />}
            label="Move Up"
            onClick={() => handleMoveCategoryOrder(params.row.id, "up")}
            disabled={params.row.sortOrder === 0}
          />
        </Tooltip>,
        <Tooltip title="Move Down" key="down">
          <GridActionsCellItem
            icon={<ArrowDownIcon />}
            label="Move Down"
            onClick={() => handleMoveCategoryOrder(params.row.id, "down")}
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
      field: "imageUrls",
      headerName: "Image",
      width: 120,
      sortable: false,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
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
              objectFit: "cover",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          />
        ) : (
          <Box
            sx={{
              width: 60,
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#F5F5F5",
              borderRadius: 1.5,
              border: "1px solid #E8E3DC",
            }}
          >
            <ImageIcon sx={{ color: "#999" }} />
          </Box>
        );
      },
    },
    {
      field: "name",
      headerName: "Name",
      width: 220,
      sortable: true,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "categoryName",
      headerName: "Category",
      width: 150,
      sortable: true,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => {
        const price = parseFloat(params.value);
        return isNaN(price) ? "$0.00" : `$${price.toFixed(2)}`;
      },
      sortable: true,
    },
    {
      field: "dietary",
      headerName: "Dietary",
      width: 200,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
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
      field: "isAvailable",
      headerName: "Available",
      width: 120,
      renderHeader: (params) => (
        <Typography sx={{ fontWeight: 600, color: "#000000" }}>
          {params.colDef.headerName}
        </Typography>
      ),
      renderCell: (params) => (
        <StatusChip
          status={params.value ? "active" : "inactive"}
          label={params.value ? "Available" : "Unavailable"}
          size="small"
        />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 200,
      getActions: (params) => [
        <Tooltip title="Move Up" key="up">
          <GridActionsCellItem
            icon={<ArrowUpIcon />}
            label="Move Up"
            onClick={() => handleMoveItemOrder(params.row.id, "up")}
            disabled={params.row.sortOrder === 0}
          />
        </Tooltip>,
        <Tooltip title="Move Down" key="down">
          <GridActionsCellItem
            icon={<ArrowDownIcon />}
            label="Move Down"
            onClick={() => handleMoveItemOrder(params.row.id, "down")}
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

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
            backgroundColor: "rgba(200, 121, 65, 0.15)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#C87941" },
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
              backgroundColor: "#C87941",
              color: "white",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#A45F2D" },
            }}
          >
            {activeTab === 0
              ? "Add Primary Category"
              : activeTab === 1
              ? "Add Category"
              : "Add Menu Item"}
          </Button>
        }
      />

      <Paper
        sx={{
          width: "100%",
          mb: 2,
          borderRadius: 3,
          border: "1px solid #E8DDD0",
          boxShadow: "0 2px 8px rgba(200, 121, 65, 0.12)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "#E8DDD0",
            "& .MuiTab-root": {
              color: "#6B4E3D",
              fontWeight: 600,
              fontSize: "0.938rem",
              "&.Mui-selected": {
                color: "#C87941",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#C87941",
              height: 3,
            },
          }}
        >
          <Tab label="Primary Categories" />
          <Tab label="Categories" />
          <Tab label="Menu Items" />
        </Tabs>

        {activeTab === 2 && (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#C87941" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&:hover fieldset": {
                    borderColor: "#C87941",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#C87941",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#C87941",
                },
              }}
            />
          </Box>
        )}

        <Box
          sx={{
            height: 600,
            width: "100%",
            backgroundColor: "white",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          {activeTab === 0 ? (
            <DataGrid
              rows={primaryCategories}
              columns={primaryCategoryColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-root": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#C87941",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.938rem",
                  "& .MuiDataGrid-columnHeader": {
                    "&:focus": {
                      outline: "none",
                    },
                  },
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#FFF3E6",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#FFEBD4",
                    "&:hover": {
                      backgroundColor: "#FFE4C8",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #E8DDD0",
                  color: "#2C1810",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#FFF8F0",
                  borderTop: "1px solid #E8DDD0",
                },
                "& .MuiTablePagination-root": {
                  color: "#6B4E3D",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#C87941",
                },
              }}
            />
          ) : activeTab === 1 ? (
            <DataGrid
              rows={filteredCategories}
              columns={categoryColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-root": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#C87941",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.938rem",
                  "& .MuiDataGrid-columnHeader": {
                    "&:focus": {
                      outline: "none",
                    },
                  },
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#FFF3E6",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#FFEBD4",
                    "&:hover": {
                      backgroundColor: "#FFE4C8",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #E8DDD0",
                  color: "#2C1810",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#FFF8F0",
                  borderTop: "1px solid #E8DDD0",
                },
                "& .MuiTablePagination-root": {
                  color: "#6B4E3D",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#C87941",
                },
              }}
            />
          ) : (
            <DataGrid
              rows={filteredItems}
              columns={itemColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 10 },
                },
              }}
              pageSizeOptions={[10, 25, 50]}
              disableRowSelectionOnClick
              sx={{
                border: 0,
                "& .MuiDataGrid-root": {
                  backgroundColor: "white",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#C87941",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.938rem",
                  "& .MuiDataGrid-columnHeader": {
                    "&:focus": {
                      outline: "none",
                    },
                  },
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "#FFF3E6",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#FFEBD4",
                    "&:hover": {
                      backgroundColor: "#FFE4C8",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #E8DDD0",
                  color: "#2C1810",
                  fontSize: "0.875rem",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#FFF8F0",
                  borderTop: "1px solid #E8DDD0",
                },
                "& .MuiTablePagination-root": {
                  color: "#6B4E3D",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#C87941",
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
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedPrimaryCategory
            ? "Edit Primary Category"
            : "Create Primary Category"}
        </DialogTitle>
        <DialogContent>
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
                label="Description"
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
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileSelect}
                  />
                </Button>
                {(imagePreviews.length > 0 || primaryCategoryForm.imageUrl) && (
                  <Box
                    sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {imagePreviews.length > 0
                      ? imagePreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: "relative",
                              width: 100,
                              height: 100,
                              border: "1px solid #E8E3DC",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        ))
                      : primaryCategoryForm.imageUrl && (
                          <Box
                            sx={{
                              position: "relative",
                              width: 100,
                              height: 100,
                              border: "1px solid #E8E3DC",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={primaryCategoryForm.imageUrl}
                              alt="Current"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        )}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button
            onClick={() => {
              setPrimaryCategoryDialog(false);
              setSelectedFiles([]);
              setImagePreviews([]);
            }}
            color="inherit"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePrimaryCategory}
            variant="contained"
            disabled={loading || uploadingImage || !primaryCategoryForm.name}
          >
            {selectedPrimaryCategory ? "Update" : "Create"}
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
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedCategory ? "Edit Category" : "Create Category"}
        </DialogTitle>
        <DialogContent>
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
                label="Description"
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
                  value={categoryForm.primaryCategoryId || ""}
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
                  {uploadingImage ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/jpg,image/webp"
                    onChange={handleFileSelect}
                  />
                </Button>
                {(imagePreviews.length > 0 || categoryForm.imageUrl) && (
                  <Box
                    sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}
                  >
                    {imagePreviews.length > 0
                      ? imagePreviews.map((preview, index) => (
                          <Box
                            key={index}
                            sx={{
                              position: "relative",
                              width: 100,
                              height: 100,
                              border: "1px solid #E8E3DC",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        ))
                      : categoryForm.imageUrl && (
                          <Box
                            sx={{
                              position: "relative",
                              width: 100,
                              height: 100,
                              border: "1px solid #E8E3DC",
                              borderRadius: 1,
                            }}
                          >
                            <img
                              src={categoryForm.imageUrl}
                              alt="Current"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                borderRadius: "4px",
                              }}
                            />
                          </Box>
                        )}
                  </Box>
                )}
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: "block" }}
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
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  height: "100%",
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
            {selectedCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog
        open={itemDialog}
        onClose={() => setItemDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          {selectedItem ? "Edit Menu Item" : "Create Menu Item"}
        </DialogTitle>
        <DialogContent>
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
                label="Description"
                multiline
                rows={3}
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                inputProps={{ step: 0.01 }}
                value={itemForm.price}
                onChange={(e) => {
                  const value = e.target.value;
                  const parsed = parseFloat(value);
                  setItemForm({
                    ...itemForm,
                    price: isNaN(parsed) || parsed < 0 ? 0 : parsed,
                  });
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                }}
              />
            </Grid>
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

            {/* Image Upload Section */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                Images (Max 5, 1MB each)
              </Typography>
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: "none" }}
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
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                  {/* Existing images */}
                  {itemForm.imageUrls.map((url, index) => (
                    <Box
                      sx={{
                        width: {
                          xs: "calc(50% - 8px)",
                          sm: "calc(33.333% - 8px)",
                          md: "calc(25% - 8px)",
                        },
                      }}
                      key={`existing-${index}`}
                    >
                      <Card sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={url}
                          alt={`Existing image ${index + 1}`}
                          onError={(e: any) => {
                            // replace with a tiny placeholder SVG if image fails to load
                            e.currentTarget.src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14">Image unavailable</text></svg>';
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.8)",
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
                          xs: "calc(50% - 8px)",
                          sm: "calc(33.333% - 8px)",
                          md: "calc(25% - 8px)",
                        },
                      }}
                      key={`new-${index}`}
                    >
                      <Card sx={{ position: "relative" }}>
                        <CardMedia
                          component="img"
                          height="140"
                          image={preview}
                          alt={`New image ${index + 1}`}
                          onError={(e: any) => {
                            e.currentTarget.src =
                              'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="100%" height="100%" fill="%23ddd"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23666" font-family="Arial" font-size="14">Preview unavailable</text></svg>';
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 4,
                            right: 4,
                            bgcolor: "rgba(255,255,255,0.8)",
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
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
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
        <DialogActions>
          <Button onClick={() => setItemDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveItem}
            disabled={loading}
          >
            {selectedItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default React.memo(MenuManagement);
