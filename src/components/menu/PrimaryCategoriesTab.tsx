import { useState, useCallback } from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Alert,
  Snackbar,
} from "@mui/material";
import { Add as AddIcon, Search as SearchIcon, Warning as WarningIcon } from "@mui/icons-material";
import { DataGrid, GridActionsCellItem } from "@mui/x-data-grid";
import type { GridColDef } from "@mui/x-data-grid";
      import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from "@mui/material";
import { StatusChip } from "../common/StatusChip";
import { api } from "../../utils/api";

interface PrimaryCategory {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

interface PrimaryCategoriesTabProps {
  primaryCategories: PrimaryCategory[];
  onRefresh: () => void;
  onEdit: (category: PrimaryCategory) => void;
  onAdd: () => void;
}

export default function PrimaryCategoriesTab({
  primaryCategories,
  onRefresh,
  onEdit,
  onAdd,
}: PrimaryCategoriesTabProps) {
  const [searchText, setSearchText] = useState("");
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/menu/primary-categories/${id}`);
        setSnackbar({
          open: true,
          message: "Primary category deleted successfully",
          severity: "success",
        });
        onRefresh();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message:
            error.response?.data?.message ||
            "Failed to delete primary category",
          severity: "error",
        });
      } finally {
        setDeleteConfirmId(null);
      }
    },
    [onRefresh]
  );

  const handleReorder = useCallback(
    async (id: string, direction: "up" | "down") => {
      try {
        await api.patch(`/menu/primary-categories/${id}/reorder`, {
          direction,
        });
        onRefresh();
      } catch (error: any) {
        setSnackbar({
          open: true,
          message: error.response?.data?.message || "Failed to reorder",
          severity: "error",
        });
      }
    },
    [onRefresh]
  );

  const columns: GridColDef[] = [
    {
      field: "imageUrl",
      headerName: "Image",
      width: 100,
      renderCell: (params) => (
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 1,
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f5f5f5",
          }}
        >
          {params.value ? (
            <Box
              component="img"
              src={params.value}
              alt={params.row.name}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <Box sx={{ color: "#ccc", fontSize: 12 }}>No Image</Box>
          )}
        </Box>
      ),
    },
    {
      field: "sortOrder",
      headerName: "Order",
      width: 80,
      align: "center",
      headerAlign: "center",
    },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      minWidth: 200,
    },
    {
      field: "description",
      headerName: "Description",
      flex: 2,
      minWidth: 300,
    },
    {
      field: "isActive",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <StatusChip status={params.value ? "active" : "inactive"} />
      ),
    },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      width: 180,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ArrowUpwardIcon />}
          label="Move Up"
          onClick={() => handleReorder(params.id as string, "up")}
          disabled={params.row.sortOrder === 0}
        />,
        <GridActionsCellItem
          icon={<ArrowDownwardIcon />}
          label="Move Down"
          onClick={() => handleReorder(params.id as string, "down")}
          disabled={params.row.sortOrder === primaryCategories.length - 1}
        />,
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => onEdit(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => setDeleteConfirmId(params.id as string)}
          showInMenu
        />,
      ],
    },
  ];

  const filteredCategories = primaryCategories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchText.toLowerCase()) ||
      cat.description?.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          placeholder="Search primary categories..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
          sx={{ flexGrow: 1 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          sx={{
            bgcolor: '#E49B5F',
            '&:hover': { bgcolor: '#C9A87C' },
          }}
        >
          Add Primary Category
        </Button>
      </Box>

      <DataGrid
        rows={filteredCategories}
        columns={columns}
        autoHeight
        pageSizeOptions={[10, 25, 50, 100, 200, 300]}
        initialState={{
          pagination: { paginationModel: { pageSize: 10 } },
        }}
        disableRowSelectionOnClick
        sx={{
          bgcolor: 'white',
          '& .MuiDataGrid-row:hover': {
            bgcolor: '#f5f5f5',
          },
        }}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog open={deleteConfirmId !== null} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 3, py: 2.5, borderBottom: '1px solid rgba(200, 121, 65, 0.1)' }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#EF4444' }}>
            <WarningIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontWeight: 700, fontSize: '1.05rem', color: '#2C1810' }}>
            Delete Primary Category
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3, py: 3 }}>
          <Typography sx={{ color: '#6B4E3D', fontSize: '0.938rem', lineHeight: 1.6 }}>
            Are you sure you want to delete this primary category? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1.5 }}>
          <Button onClick={() => setDeleteConfirmId(null)} variant="outlined" sx={{ borderRadius: 2, fontWeight: 600, px: 3 }}>
            Cancel
          </Button>
          <Button
            onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
            variant="contained"
            sx={{ borderRadius: 2, fontWeight: 600, px: 3, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
