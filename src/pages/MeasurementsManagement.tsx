import React, { useEffect, useState } from 'react';
import { api } from '../utils/api';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selected, setSelected] = useState<MeasurementType | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    isActive: true,
    sortOrder: 0,
  });

  const load = async () => {
    try {
      const res = await api.get('/measurements');
      setMeasurementTypes(res.data);
    } catch (error) {
      // handle
      console.error(error);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
    try {
      if (selected) {
        await api.patch(`/measurements/${selected.id}`, form);
      } else {
        await api.post('/measurements', form);
      }
      setDialogOpen(false);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  const del = async (id: string) => {
    if (!confirm('Delete this measurement type?')) return;
    try {
      await api.delete(`/measurements/${id}`);
      load();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Measurement Types</Typography>
        <Button startIcon={<AddIcon />} onClick={openCreate}>
          Create Measurement Type
        </Button>
      </Box>

      <Grid container spacing={2}>
        {measurementTypes.map((m) => (
          <Grid size={{ xs: 12, md: 6 }} key={m.id}>
            <Box border={1} borderColor={'grey.200'} borderRadius={1} p={2}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6">{m.name}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {m.description}
                  </Typography>
                </Box>
                <Box>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => openEdit(m)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => del(m.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selected ? 'Edit' : 'Create'} Measurement Type
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400 }}>
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth
              label="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Sort Order"
              type="number"
              value={form.sortOrder}
              onChange={(e) =>
                setForm({ ...form, sortOrder: parseInt(e.target.value || '0') })
              }
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={save} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MeasurementsManagement;
