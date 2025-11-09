import React, { useState, useEffect } from "react";
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
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
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
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [itemDialog, setItemDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(
    null
  );
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
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

  useEffect(() => {
    loadCategories();
    loadMenuItems();
  }, []);

  const showSnackbar = (
    message: string,
    severity: SnackbarState["severity"] = "success"
  ) => {
    setSnackbar({ open: true, message, severity });
  };

  const loadCategories = async () => {
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
        showSnackbar("Categories loaded successfully");
      } else {
        throw new Error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      showSnackbar("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadMenuItems = async () => {
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
        showSnackbar("Menu items loaded successfully");
      } else {
        throw new Error("Failed to fetch menu items");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
      showSnackbar("Failed to load menu items", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setCategoryForm({
      name: "",
      description: "",
      isActive: true,
      sortOrder: categories.length,
    });
    setCategoryDialog(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
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
    // Debug: log item and its images to help diagnose missing previews
    // eslint-disable-next-line no-console
    console.log("handleEditItem item:", item);
    // eslint-disable-next-line no-console
    console.log("existing imageUrls:", item.imageUrls);
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

  const handleSaveCategory = async () => {
    try {
      setLoading(true);
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
        body: JSON.stringify(categoryForm),
      });

      if (response.ok) {
        setCategoryDialog(false);
        await loadCategories();
        showSnackbar(
          selectedCategory
            ? "Category updated successfully"
            : "Category created successfully"
        );
      } else {
        throw new Error("Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      showSnackbar("Failed to save category", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
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
  };

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

  const categoryColumns: GridColDef[] = [
    {
      field: "name",
      headerName: "Name",
      width: 200,
      sortable: true,
    },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      sortable: false,
    },
    {
      field: "sortOrder",
      headerName: "Order",
      width: 100,
      sortable: true,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value ? "Active" : "Inactive"}
          color={params.value ? "success" : "default"}
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
      field: "name",
      headerName: "Name",
      width: 200,
      sortable: true,
    },
    {
      field: "categoryName",
      headerName: "Category",
      width: 150,
      sortable: true,
    },
    {
      field: "price",
      headerName: "Price",
      width: 100,
      renderCell: (params) => {
        const price = parseFloat(params.value);
        return isNaN(price) ? "$0.00" : `$${price.toFixed(2)}`;
      },
      sortable: true,
    },
    {
      field: "sortOrder",
      headerName: "Order",
      width: 80,
      sortable: true,
    },
    {
      field: "images",
      headerName: "Images",
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <ImageIcon fontSize="small" />
          <Typography variant="caption">
            {params.row.imageUrls?.length || 0}
          </Typography>
        </Box>
      ),
      sortable: false,
    },
    {
      field: "dietary",
      headerName: "Dietary",
      width: 200,
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
      renderCell: (params) => (
        <Chip
          label={params.value ? "Available" : "Unavailable"}
          color={params.value ? "success" : "default"}
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
    <Box sx={{ backgroundColor: "#faf6f2", minHeight: "100vh", p: 3 }}>
      {loading && (
        <LinearProgress
          sx={{
            mb: 2,
            backgroundColor: "rgba(139, 69, 19, 0.2)",
            "& .MuiLinearProgress-bar": { backgroundColor: "#8B4513" },
          }}
        />
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
          p: 3,
          backgroundColor: "#8B4513",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600, color: "white" }}>
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={activeTab === 0 ? handleCreateCategory : handleCreateItem}
          sx={{
            backgroundColor: "white",
            color: "#8B4513",
            fontWeight: 600,
            "&:hover": { backgroundColor: "#f5f5f5" },
          }}
        >
          {activeTab === 0 ? "Add Category" : "Add Menu Item"}
        </Button>
      </Box>

      <Paper
        sx={{
          width: "100%",
          mb: 2,
          borderRadius: 3,
          border: "1px solid #d7ccc8",
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.15)",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            borderBottom: 1,
            borderColor: "#d7ccc8",
            "& .MuiTab-root": {
              color: "#6d4c41",
              fontWeight: 600,
              "&.Mui-selected": {
                color: "#8B4513",
              },
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#8B4513",
            },
          }}
        >
          <Tab label="Categories" />
          <Tab label="Menu Items" />
        </Tabs>

        {activeTab === 1 && (
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#6d4c41" }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  "&:hover fieldset": {
                    borderColor: "#8B4513",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#8B4513",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#8B4513",
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
              rows={categories}
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
                  backgroundColor: "#8B4513",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiDataGrid-columnHeader": {
                    "&:focus": {
                      outline: "none",
                    },
                  },
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "rgba(139, 69, 19, 0.05)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(139, 69, 19, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(139, 69, 19, 0.15)",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0d4c8",
                  color: "#3e2723",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#faf6f2",
                  borderTop: "1px solid #d7ccc8",
                },
                "& .MuiTablePagination-root": {
                  color: "#5d4037",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#5d4037",
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
                  backgroundColor: "#8B4513",
                  color: "white",
                  fontWeight: 600,
                  "& .MuiDataGrid-columnHeader": {
                    "&:focus": {
                      outline: "none",
                    },
                  },
                },
                "& .MuiDataGrid-row": {
                  "&:hover": {
                    backgroundColor: "rgba(139, 69, 19, 0.05)",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "rgba(139, 69, 19, 0.1)",
                    "&:hover": {
                      backgroundColor: "rgba(139, 69, 19, 0.15)",
                    },
                  },
                },
                "& .MuiDataGrid-cell": {
                  borderBottom: "1px solid #e0d4c8",
                  color: "#3e2723",
                },
                "& .MuiDataGrid-footerContainer": {
                  backgroundColor: "#faf6f2",
                  borderTop: "1px solid #d7ccc8",
                },
                "& .MuiTablePagination-root": {
                  color: "#5d4037",
                },
                "& .MuiTablePagination-selectIcon": {
                  color: "#5d4037",
                },
              }}
            />
          )}
        </Box>
      </Paper>

      {/* Category Dialog */}
      <Dialog
        open={categoryDialog}
        onClose={() => setCategoryDialog(false)}
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
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={categoryForm.sortOrder}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    sortOrder: parseInt(e.target.value),
                  })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
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
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCategoryDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveCategory}
            disabled={loading}
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
                <Grid container spacing={2}>
                  {/* Existing images */}
                  {itemForm.imageUrls.map((url, index) => (
                    <Grid item xs={6} sm={4} md={3} key={`existing-${index}`}>
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
                    </Grid>
                  ))}
                  {/* New image previews */}
                  {imagePreviews.map((preview, index) => (
                    <Grid item xs={6} sm={4} md={3} key={`new-${index}`}>
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
                    </Grid>
                  ))}
                </Grid>
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

export default MenuManagement;