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
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";

interface MenuCategory {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
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
  imageUrl?: string;
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
  imageUrl?: string;
  displayOrder: number;
  createdAt: Date;
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

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
    isActive: true,
    displayOrder: 0,
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
    imageUrl: "",
    displayOrder: 0,
  });

  useEffect(() => {
    loadCategories();
    loadMenuItems();
  }, []);

  const loadCategories = async () => {
    try {
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
        console.error("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const loadMenuItems = async () => {
    try {
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
            isVegetarian: item.dietaryInfo?.includes("vegetarian") || false,
            isVegan: item.dietaryInfo?.includes("vegan") || false,
            isGlutenFree: item.dietaryInfo?.includes("gluten-free") || false,
            isDairyFree: item.dietaryInfo?.includes("dairy-free") || false,
            displayOrder: item.sortOrder,
          }))
        );
      } else {
        console.error("Failed to fetch menu items");
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
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
      displayOrder: categories.length + 1,
    });
    setCategoryDialog(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setSelectedCategory(category);
    setCategoryForm({
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      displayOrder: category.displayOrder,
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
      imageUrl: "",
      displayOrder: menuItems.length + 1,
    });
    setItemDialog(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setSelectedItem(item);
    setItemForm({
      name: item.name,
      description: item.description,
      price: item.price,
      categoryId: item.categoryId,
      isAvailable: item.isAvailable,
      isVegetarian: item.isVegetarian,
      isVegan: item.isVegan,
      isGlutenFree: item.isGlutenFree,
      isDairyFree: item.isDairyFree,
      allergens: item.allergens,
      imageUrl: item.imageUrl || "",
      displayOrder: item.displayOrder,
    });
    setItemDialog(true);
  };

  const handleSaveCategory = async () => {
    try {
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
        loadCategories();
      } else {
        console.error("Failed to save category");
        alert("Failed to save category. Please try again.");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category. Please try again.");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? This will also delete all associated menu items."
      )
    ) {
      try {
        const response = await fetch(
          `http://localhost:5000/menu/categories/${id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        );

        if (response.ok) {
          loadCategories();
          loadMenuItems();
        } else {
          console.error("Failed to delete category");
          alert("Failed to delete category. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Error deleting category. Please try again.");
      }
    }
  };

  const handleSaveItem = async () => {
    try {
      const itemData = {
        ...itemForm,
        allergens: itemForm.allergens,
        dietaryInfo: [
          ...(itemForm.isVegetarian ? ["vegetarian"] : []),
          ...(itemForm.isVegan ? ["vegan"] : []),
          ...(itemForm.isGlutenFree ? ["gluten-free"] : []),
          ...(itemForm.isDairyFree ? ["dairy-free"] : []),
        ],
        sortOrder: itemForm.displayOrder,
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
        loadMenuItems();
      } else {
        console.error("Failed to save menu item");
        alert("Failed to save menu item. Please try again.");
      }
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Error saving menu item. Please try again.");
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this menu item?")) {
      try {
        const response = await fetch(`http://localhost:5000/menu/items/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          loadMenuItems();
        } else {
          console.error("Failed to delete menu item");
          alert("Failed to delete menu item. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting menu item:", error);
        alert("Error deleting menu item. Please try again.");
      }
    }
  };

  const categoryColumns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200, sortable: true },
    {
      field: "description",
      headerName: "Description",
      width: 300,
      sortable: false,
    },
    { field: "displayOrder", headerName: "Order", width: 100, sortable: true },
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
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditCategory(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteCategory(params.row.id)}
        />,
      ],
    },
  ];

  const itemColumns: GridColDef[] = [
    { field: "name", headerName: "Name", width: 200, sortable: true },
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
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditItem(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteItem(params.row.id)}
        />,
      ],
    },
  ];

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Menu Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={activeTab === 0 ? handleCreateCategory : handleCreateItem}
          sx={{
            backgroundColor: "#8B4513",
            "&:hover": { backgroundColor: "#A0522D" },
          }}
        >
          {activeTab === 0 ? "Add Category" : "Add Menu Item"}
        </Button>
      </Box>

      <Paper sx={{ width: "100%", mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: "divider" }}
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
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Box>
        )}

        <Box sx={{ height: 600, width: "100%" }}>
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
              sx={{ border: 0 }}
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
              sx={{ border: 0 }}
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
                label="Display Order"
                type="number"
                value={categoryForm.displayOrder}
                onChange={(e) =>
                  setCategoryForm({
                    ...categoryForm,
                    displayOrder: parseInt(e.target.value),
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
          <Button variant="contained" onClick={handleSaveCategory}>
            {selectedCategory ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Item Dialog */}
      <Dialog
        open={itemDialog}
        onClose={() => setItemDialog(false)}
        maxWidth="md"
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
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    price: parseFloat(e.target.value),
                  })
                }
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
                label="Display Order"
                type="number"
                value={itemForm.displayOrder}
                onChange={(e) =>
                  setItemForm({
                    ...itemForm,
                    displayOrder: parseInt(e.target.value),
                  })
                }
              />
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
          <Button variant="contained" onClick={handleSaveItem}>
            {selectedItem ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MenuManagement;
