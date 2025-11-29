import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '../utils/api';
import {
  Box,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  LinearProgress,
  FormControlLabel,
  Switch,
  Chip,
  Typography,
} from '@mui/material';
import type { GridColDef } from '@mui/x-data-grid';
import { EnhancedDataGrid } from '../components/common/EnhancedDataGrid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Straighten as MeasureIcon,
  CheckCircle as ActiveIcon,
  Cancel as InactiveIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { PageHeader } from '../components/common/PageHeader';
import { SummaryStats } from '../components/common/SummaryStats';
import type { StatItem } from '../components/common/SummaryStats';
import { StatusChip } from '../components/common/StatusChip';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface MeasurementType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

const MeasurementsManagement: React.FC = () => {
  const [measurementTypes, setMeasurementTypes] = useState<MeasurementType[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [measurementToDelete, setMeasurementToDelete] =
    useState<MeasurementType | null>(null);
  const [selected, setSelected] = useState<MeasurementType | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const total = measurementTypes.length;
    const active = measurementTypes.filter((m) => m.isActive !== false).length;
    const inactive = total - active;

    return [
      {
        label: 'Total Measurements',
        value: total,
        icon: <MeasureIcon fontSize="small" />,
        color: '#C87941',
      },
      {
        label: 'Active',
        value: active,
        icon: <ActiveIcon fontSize="small" />,
        color: '#4caf50',
      },
      {
        label: 'Inactive',
        value: inactive,
        icon: <InactiveIcon fontSize="small" />,
        color: '#9e9e9e',
      },
    ];
  }, [measurementTypes]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/measurements');
      setMeasurementTypes(res.data);
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to load measurement types',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setSelected(null);
    setForm({
      name: '',
      description: '',
      isActive: true,
      sortOrder: measurementTypes.length,
    });
    setDialogOpen(true);
  };

  const openEdit = (m: MeasurementType) => {
    setSelected(m);
    setForm({
      name: m.name,
      description: m.description || '',
      isActive: m.isActive ?? true,
      sortOrder: m.sortOrder || 0,
    });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      setSnackbar({
        open: true,
        message: 'Name is required',
        severity: 'error',
      });
      return;
    }

    setLoading(true);
    try {
      if (selected) {
        await api.patch(`/measurements/${selected.id}`, form);
        setSnackbar({
          open: true,
          message: 'Measurement type updated successfully',
          severity: 'success',
        });
      } else {
        await api.post('/measurements', form);
        setSnackbar({
          open: true,
          message: 'Measurement type created successfully',
          severity: 'success',
        });
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to save measurement type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (m: MeasurementType) => {
    setMeasurementToDelete(m);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!measurementToDelete) return;

    setLoading(true);
    try {
      await api.delete(`/measurements/${measurementToDelete.id}`);
      setSnackbar({
        open: true,
        message: 'Measurement type deleted successfully',
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      setMeasurementToDelete(null);
      load();
    } catch (error) {
      console.error(error);
      setSnackbar({
        open: true,
        message: 'Failed to delete measurement type',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const sortedMeasurements = useMemo(() => {
    return [...measurementTypes].sort(
      (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0),
    );
  }, [measurementTypes]);

  return (
    <Box
      sx={{
        animation: 'fadeIn 0.5s ease-out',
        '@keyframes fadeIn': {
          from: { opacity: 0, transform: 'translateY(10px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      }}
    >
      {/* Loading Bar */}
      {loading && (
        <LinearProgress
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            height: 3,
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #C87941, #DDA15E)',
            },
          }}
        />
      )}

      {/* Page Header */}
      <PageHeader
        title="Measurement Types"
        subtitle="Manage measurement units for menu items (e.g., oz, ml, pieces)"
        icon={<MeasureIcon />}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openCreate}
            sx={{
              background: 'linear-gradient(135deg, #C87941 0%, #DDA15E 100%)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              py: 1.2,
              borderRadius: 2,
              boxShadow: '0 4px 14px rgba(200, 121, 65, 0.35)',
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #B56A32 0%, #C89A4E 100%)',
                boxShadow: '0 6px 20px rgba(200, 121, 65, 0.45)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Add Measurement
          </Button>
        }
      />

      {/* Summary Stats */}
      <SummaryStats stats={stats} columns={3} variant="card" />

      {/* Measurements Grid */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2.5,
          background: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(200, 121, 65, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
        }}
      >
        {sortedMeasurements.length === 0 && !loading ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 6,
              color: 'text.secondary',
            }}
          >
            <MeasureIcon sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Measurement Types
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Get started by adding your first measurement type
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreate}
              sx={{
                borderColor: 'rgba(200, 121, 65, 0.5)',
                color: '#C87941',
                '&:hover': {
                  borderColor: '#C87941',
                  background: 'rgba(200, 121, 65, 0.05)',
                },
              }}
            >
              Add Measurement Type
            </Button>
          </Box>
        ) : (
          <EnhancedDataGrid
            rows={measurementTypes}
            columns={(() => {
              const cols: GridColDef[] = [
                { field: 'name', headerName: 'Name', flex: 1, minWidth: 180 },
                {
                  field: 'description',
                  headerName: 'Description',
                  flex: 2,
                  minWidth: 240,
                },
                {
                  field: 'sortOrder',
                  headerName: 'Order',
                  width: 100,
                  headerAlign: 'center',
                  align: 'center',
                },
                {
                  field: 'isActive',
                  headerName: 'Status',
                  width: 120,
                  headerAlign: 'center',
                  align: 'center',
                  renderCell: (params) => (
                    <StatusChip
                      label={params.value !== false ? 'Active' : 'Inactive'}
                      status={params.value !== false ? 'success' : 'inactive'}
                    />
                  ),
                },
                {
                  field: 'actions',
                  headerName: 'Actions',
                  width: 200,
                  headerAlign: 'center',
                  align: 'center',
                  sortable: false,
                  renderCell: (params) => (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        justifyContent: 'center',
                        width: '100%',
                      }}
                    >
                      <Button
                        size="small"
                        onClick={() => openEdit(params.row as MeasurementType)}
                        sx={{ color: '#C87941', minWidth: 90 }}
                        startIcon={<EditIcon sx={{ fontSize: 16 }} />}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          handleDeleteClick(params.row as MeasurementType)
                        }
                        sx={{ color: '#d32f2f', minWidth: 90 }}
                        startIcon={<DeleteIcon sx={{ fontSize: 16 }} />}
                      >
                        Delete
                      </Button>
                    </Box>
                  ),
                },
              ];
              return cols;
            })()}
            loading={loading}
            pageSize={10}
            title="Measurement Types"
          />
        )}
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #C87941 0%, #DDA15E 100%)',
            color: '#fff',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <MeasureIcon />
            {selected ? 'Edit' : 'Create'} Measurement Type
          </Box>
          <IconButton
            onClick={() => setDialogOpen(false)}
            sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}
          >
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              placeholder="e.g., Ounces, Milliliters, Pieces"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              multiline
              rows={2}
              placeholder="Optional description for this measurement type"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <TextField
              fullWidth
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: parseInt(e.target.value || '0') })
              }
              helperText="Lower numbers appear first"
              InputProps={{
                sx: { borderRadius: 2 },
              }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#4caf50',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#4caf50',
                    },
                  }}
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography>Active</Typography>
                  <Chip
                    label={form.isActive ? 'Visible' : 'Hidden'}
                    size="small"
                    color={form.isActive ? 'success' : 'default'}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={save}
            variant="contained"
            disabled={loading || !form.name.trim()}
            sx={{
              background: 'linear-gradient(135deg, #C87941 0%, #DDA15E 100%)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              '&:hover': {
                background: 'linear-gradient(135deg, #B56A32 0%, #C89A4E 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
              },
            }}
          >
            {loading ? 'Saving...' : selected ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Measurement Type"
        message={`Are you sure you want to delete "${measurementToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMeasurementToDelete(null);
        }}
        severity="error"
      />

      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MeasurementsManagement;
