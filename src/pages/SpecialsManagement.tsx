import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  CardActions,
  IconButton,
  Alert,
  Snackbar,
  LinearProgress,
  Tabs,
  Tab,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  Add as AddIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Image as ImageIcon,
  AcUnit as SeasonalIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import { api } from "../utils/api";
import { getImageUrl, getErrorMessage } from "../utils/uploadHelpers";
import { StatusChip } from "../components/common/StatusChip";
import { ActionButtons } from "../components/common/ActionButtons";
import { PageHeader } from "../components/common/PageHeader";
import logger from "../utils/logger";

const TIMEZONE = "America/Toronto";

type SpecialType = "daily" | "game_time" | "day_time" | "chef" | "seasonal";
type SpecialCategory = "regular" | "late_night";

type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const SpecialTypeValues = {
  DAILY: "daily" as SpecialType,
  GAME_TIME: "game_time" as SpecialType,
  DAY_TIME: "day_time" as SpecialType,
  CHEF: "chef" as SpecialType,
  SEASONAL: "seasonal" as SpecialType,
};

const SpecialCategoryValues = {
  REGULAR: "regular" as SpecialCategory,
  LATE_NIGHT: "late_night" as SpecialCategory,
};

const DayOfWeekValues = {
  MONDAY: "monday" as DayOfWeek,
  TUESDAY: "tuesday" as DayOfWeek,
  WEDNESDAY: "wednesday" as DayOfWeek,
  THURSDAY: "thursday" as DayOfWeek,
  FRIDAY: "friday" as DayOfWeek,
  SATURDAY: "saturday" as DayOfWeek,
  SUNDAY: "sunday" as DayOfWeek,
};

interface Special {
  id: number;
  type: SpecialType;
  dayOfWeek?: DayOfWeek;
  specialCategory?: SpecialCategory;
  title: string;
  description: string;
  displayStartDate?: string;
  displayEndDate?: string;
  specialStartDate?: string;
  specialEndDate?: string;
  imageUrls: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SpecialForm {
  type: SpecialType;
  dayOfWeek: DayOfWeek;
  specialCategory: SpecialCategory;
  title: string;
  description: string;
  displayStartDate: moment.Moment | null;
  displayEndDate: moment.Moment | null;
  specialStartDate: moment.Moment | null;
  specialEndDate: moment.Moment | null;
  imageUrls: string[];
  isActive: boolean;
}

const SpecialsManagement: React.FC = () => {
  const [specials, setSpecials] = useState<Special[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const [specialForm, setSpecialForm] = useState<SpecialForm>({
    type: SpecialTypeValues.DAILY,
    dayOfWeek: DayOfWeekValues.MONDAY,
    specialCategory: SpecialCategoryValues.REGULAR,
    title: '',
    description: '',
    displayStartDate: null,
    displayEndDate: null,
    specialStartDate: null,
    specialEndDate: null,
    imageUrls: [],
    isActive: true,
  });

  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null);

  // Image upload states for preview functionality
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

  const showSnackbar = useCallback(
    (message: string, severity: 'success' | 'error') => {
      setSnackbar({ open: true, message, severity });
    },
    [],
  );

  const fetchSpecials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/specials');
      setSpecials(res.data || []);
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchSpecials();
  }, [fetchSpecials]);

  const handleOpenDialog = (
    special?: Special,
    presetType?: SpecialType,
    presetCategory?: SpecialCategory,
  ) => {
    if (special) {
      setEditingSpecial(special);
      setSpecialForm({
        type: special.type,
        dayOfWeek: special.dayOfWeek || DayOfWeekValues.MONDAY,
        specialCategory:
          special.specialCategory || SpecialCategoryValues.REGULAR,
        title: special.title,
        description: special.description,
        displayStartDate: special.displayStartDate
          ? moment.tz(special.displayStartDate, TIMEZONE)
          : null,
        displayEndDate: special.displayEndDate
          ? moment.tz(special.displayEndDate, TIMEZONE)
          : null,
        specialStartDate: special.specialStartDate
          ? moment.tz(special.specialStartDate, TIMEZONE)
          : null,
        specialEndDate: special.specialEndDate
          ? moment.tz(special.specialEndDate, TIMEZONE)
          : null,
        imageUrls: special.imageUrls || [],
        isActive: special.isActive,
      });
    } else {
      setEditingSpecial(null);
      setSpecialForm({
        type: presetType || SpecialTypeValues.DAILY,
        dayOfWeek: DayOfWeekValues.MONDAY,
        specialCategory: presetCategory || SpecialCategoryValues.REGULAR,
        title: '',
        description: '',
        displayStartDate: null,
        displayEndDate: null,
        specialStartDate: null,
        specialEndDate: null,
        imageUrls: [],
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingSpecial(null);
    setSelectedFiles([]);
    setImagePreviews([]);
    setImagesToDelete([]);
    setSpecialForm({
      type: SpecialTypeValues.DAILY,
      dayOfWeek: DayOfWeekValues.MONDAY,
      specialCategory: SpecialCategoryValues.REGULAR,
      title: '',
      description: '',
      displayStartDate: null,
      displayEndDate: null,
      specialStartDate: null,
      specialEndDate: null,
      imageUrls: [],
      isActive: true,
    });
  };

  const handleSave = async () => {
    if (!specialForm.title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }

    setLoading(true);

    try {
      // Upload new images to storage if any
      let finalImageUrls = [...specialForm.imageUrls];

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append('images', file);
        });
        formData.append('folder', 'specials');

        const uploadRes = await api.post('/upload/images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.urls) {
          finalImageUrls = [...finalImageUrls, ...uploadRes.data.urls];
        }
      }

      const specialData = {
        ...specialForm,
        imageUrls: finalImageUrls,
        displayStartDate: specialForm.displayStartDate?.utc().toISOString(),
        displayEndDate: specialForm.displayEndDate?.utc().toISOString(),
        specialStartDate: specialForm.specialStartDate?.utc().toISOString(),
        specialEndDate: specialForm.specialEndDate?.utc().toISOString(),
      };

      if (editingSpecial) {
        await api.patch(`/specials/${editingSpecial.id}`, specialData);
        showSnackbar('Special updated successfully', 'success');
      } else {
        await api.post('/specials', specialData);
        showSnackbar('Special created successfully', 'success');
      }

      // Delete marked images after successful save
      if (imagesToDelete.length > 0) {
        try {
          await api.delete('/upload/images', {
            data: { urls: imagesToDelete },
          });
        } catch (error) {
          logger.error('Error deleting images:', error);
          // Don't show error to user as the special was saved successfully
        }
      }

      fetchSpecials();
      handleCloseDialog();
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this special?'))
      return;

    try {
      await api.delete(`/specials/${id}`);
      showSnackbar('Special deleted successfully', 'success');
      fetchSpecials();
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    }
  };

  const handleToggleActive = async (special: Special) => {
    try {
      await api.patch(`/specials/${special.id}`, { isActive: !special.isActive });
      showSnackbar('Special status updated', 'success');
      fetchSpecials();
    } catch (error) {
      showSnackbar(getErrorMessage(error), 'error');
    }
  };

  const handleImageUpload = (files: FileList) => {
    const maxImages = 5;
    const maxSize = 1024 * 1024; // 1MB

    const totalImages =
      specialForm.imageUrls.length + imagePreviews.length + files.length;
    if (totalImages > maxImages) {
      showSnackbar(`Maximum ${maxImages} images allowed`, 'error');
      return;
    }

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (file.size > maxSize) {
        showSnackbar('Image size must be less than 1MB', 'error');
        return;
      }
      if (!file.type.startsWith('image/')) {
        showSnackbar('Only image files are allowed', 'error');
        return;
      }
    }

    // Add files to preview list
    setSelectedFiles((prev) => [...prev, ...fileArray]);

    // Create previews
    fileArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    const totalExistingImages = specialForm.imageUrls.length;

    if (index < totalExistingImages) {
      // Mark existing S3 image for deletion (will be deleted on save)
      const imageToRemove = specialForm.imageUrls[index];
      setImagesToDelete((prev) => [...prev, imageToRemove]);

      // Remove from form imageUrls
      setSpecialForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index),
      }));

      showSnackbar('Image will be deleted when you save changes', 'success');
    } else {
      // Removing a new file preview (not yet uploaded)
      const previewIndex = index - totalExistingImages;
      setImagePreviews((prev) => prev.filter((_, i) => i !== previewIndex));
      setSelectedFiles((prev) => prev.filter((_, i) => i !== previewIndex));
    }
  };

  const renderSpecialCard = (special: Special) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={special.id}>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          backgroundColor: 'white',
          boxShadow: '0 4px 16px rgba(200, 121, 65, 0.12)',
          border: '2px solid',
          borderColor: 'rgba(200, 121, 65, 0.2)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #C87941 0%, #E89B5C 100%)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(200, 121, 65, 0.25)',
            borderColor: '#C87941',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={2}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                lineHeight: 1.3,
                pr: 2,
              }}
            >
              {special.title}
            </Typography>
            <StatusChip
              status={special.isActive ? 'active' : 'inactive'}
              label={special.isActive ? 'Active' : 'Inactive'}
              size="small"
            />
          </Box>
          <Typography
            variant="body2"
            color="text.secondary"
            mb={2}
            sx={{ lineHeight: 1.5 }}
          >
            {special.description}
          </Typography>
          <Box sx={{ mb: 2 }}>
            {special.type === SpecialTypeValues.DAILY && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  bgcolor:
                    special.specialCategory === SpecialCategoryValues.LATE_NIGHT
                      ? 'secondary.light'
                      : 'primary.light',
                  borderRadius: 2,
                  color:
                    special.specialCategory === SpecialCategoryValues.LATE_NIGHT
                      ? 'secondary.contrastText'
                      : 'primary.contrastText',
                }}
              >
                <ScheduleIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {special.dayOfWeek
                    ? special.dayOfWeek.charAt(0).toUpperCase() +
                      special.dayOfWeek.slice(1)
                    : 'N/A'}
                  {special.specialCategory ===
                    SpecialCategoryValues.LATE_NIGHT && ' (Late Night)'}
                </Typography>
              </Box>
            )}
            {special.type === SpecialTypeValues.SEASONAL && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  bgcolor: 'secondary.light',
                  borderRadius: 2,
                  color: 'secondary.contrastText',
                }}
              >
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {moment
                    .tz(special.displayStartDate, TIMEZONE)
                    .format('MMM DD')}{' '}
                  -{' '}
                  {moment
                    .tz(special.displayEndDate, TIMEZONE)
                    .format('MMM DD, YYYY')}
                </Typography>
              </Box>
            )}
          </Box>
          {special.imageUrls && special.imageUrls.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'grey.50',
                borderRadius: 1,
              }}
            >
              <ImageIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {special.imageUrls.length} image
                {special.imageUrls.length > 1 ? 's' : ''}
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions
          sx={{
            p: 2,
            pt: 0,
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <ActionButtons
            size="small"
            onEdit={() => handleOpenDialog(special)}
            onDelete={() => handleDelete(special.id)}
          />
          <Button
            size="small"
            color={special.isActive ? 'warning' : 'success'}
            onClick={() => handleToggleActive(special)}
            sx={{
              textTransform: 'none',
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            {special.isActive ? 'Deactivate' : 'Activate'}
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const dailySpecials = useMemo(
    () =>
      specials.filter(
        (s) =>
          s.type === SpecialTypeValues.DAILY &&
          s.specialCategory !== SpecialCategoryValues.LATE_NIGHT,
      ),
    [specials],
  );
  const lateNightSpecials = useMemo(
    () =>
      specials.filter(
        (s) =>
          s.type === SpecialTypeValues.DAILY &&
          s.specialCategory === SpecialCategoryValues.LATE_NIGHT,
      ),
    [specials],
  );
  const gameTimeSpecials = useMemo(
    () => specials.filter((s) => s.type === SpecialTypeValues.GAME_TIME),
    [specials],
  );
  const dayTimeSpecials = useMemo(
    () => specials.filter((s) => s.type === SpecialTypeValues.DAY_TIME),
    [specials],
  );
  const chefSpecials = useMemo(
    () => specials.filter((s) => s.type === SpecialTypeValues.CHEF),
    [specials],
  );
  const seasonalSpecials = useMemo(
    () => specials.filter((s) => s.type === SpecialTypeValues.SEASONAL),
    [specials],
  );

  const getSpecialDefaultsForActiveTab = (tabIndex: number) => {
    switch (tabIndex) {
      case 0:
        return {
          type: SpecialTypeValues.DAILY,
          category: SpecialCategoryValues.REGULAR,
          label: 'Daily Special',
        };
      case 1:
        return {
          type: SpecialTypeValues.DAILY,
          category: SpecialCategoryValues.LATE_NIGHT,
          label: 'Late Night Special',
        };
      case 2:
        return {
          type: SpecialTypeValues.GAME_TIME,
          category: SpecialCategoryValues.REGULAR,
          label: 'Game Time Special',
        };
      case 3:
        return {
          type: SpecialTypeValues.DAY_TIME,
          category: SpecialCategoryValues.REGULAR,
          label: 'Day Time Special',
        };
      case 4:
        return {
          type: SpecialTypeValues.CHEF,
          category: SpecialCategoryValues.REGULAR,
          label: 'Chef Special',
        };
      case 5:
        return {
          type: SpecialTypeValues.SEASONAL,
          category: SpecialCategoryValues.REGULAR,
          label: 'Seasonal Special',
        };
      default:
        return {
          type: SpecialTypeValues.DAILY,
          category: SpecialCategoryValues.REGULAR,
          label: 'Special',
        };
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #faf9f7 0%, #f5f4f1 100%)',
          p: 3,
        }}
      >
        {/* Global page header - outside inner container for consistency */}
        <PageHeader
          title="Specials Management"
          subtitle="Manage your daily and seasonal specials with ease"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                const defaults = getSpecialDefaultsForActiveTab(activeTab);
                handleOpenDialog(undefined, defaults.type, defaults.category);
              }}
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
              {`Add ${getSpecialDefaultsForActiveTab(activeTab).label}`}
            </Button>
          }
        />

        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            backgroundColor: 'white',
            borderRadius: 3,
            boxShadow: '0 2px 12px rgba(200, 121, 65, 0.12)',
            overflow: 'visible',
            border: '1px solid #E8DDD0',
          }}
        >
          {loading && (
            <LinearProgress
              sx={{
                mb: 2,
                backgroundColor: 'rgba(200, 121, 65, 0.15)',
                '& .MuiLinearProgress-bar': { backgroundColor: '#C87941' },
              }}
            />
          )}

          {/* header moved above outer container */}

          {/* Tabs */}
          <Box
            sx={{
              mb: 3,
              mt: 2,
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
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  color: '#8B7355',
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
                    background:
                      'linear-gradient(135deg, #C87941 0%, #E89B5C 100%)',
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
              <Tab label="Daily Specials" />
              <Tab label="Late Night" />
              <Tab label="Game Time" />
              <Tab label="Day Time" />
              <Tab label="Chef Specials" />
              <Tab label="Seasonal" />
            </Tabs>
          </Box>

          <Box sx={{ px: 3, pb: 3 }}>
            {activeTab === 0 && (
              <Box>
                {dailySpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      px: 4,
                      bgcolor: 'grey.50',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Daily Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create your first daily special to attract customers with
                      fresh offerings every day of the week.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {dailySpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 0 }}
                  >
                    Late Night Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleOpenDialog(
                        undefined,
                        SpecialTypeValues.DAILY,
                        SpecialCategoryValues.LATE_NIGHT,
                      )
                    }
                    sx={{
                      background:
                        'linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)',
                      boxShadow: '0 4px 12px rgba(74, 20, 140, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #2E0051 0%, #4A148C 100%)',
                        boxShadow: '0 6px 16px rgba(74, 20, 140, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Add Late Night Special
                  </Button>
                </Box>
                {lateNightSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      px: 4,
                      bgcolor: 'grey.50',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Late Night Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create late night specials for all days of the week to
                      attract night owls and late diners.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {lateNightSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 0 }}
                  >
                    Game Time Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleOpenDialog(undefined, SpecialTypeValues.GAME_TIME)
                    }
                    sx={{
                      background:
                        'linear-gradient(135deg, #FF5722 0%, #FF9800 100%)',
                      boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #D84315 0%, #FF5722 100%)',
                        boxShadow: '0 6px 16px rgba(255, 87, 34, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Add Game Time Special
                  </Button>
                </Box>
                {gameTimeSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      backgroundColor: 'background.default',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Game Time Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create game time specials to attract sports fans during
                      game hours.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {gameTimeSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 3 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 0 }}
                  >
                    Day Time Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleOpenDialog(undefined, SpecialTypeValues.DAY_TIME)
                    }
                    sx={{
                      background:
                        'linear-gradient(135deg, #2196F3 0%, #64B5F6 100%)',
                      boxShadow: '0 4px 12px rgba(33, 150, 243, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
                        boxShadow: '0 6px 16px rgba(33, 150, 243, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Add Day Time Special
                  </Button>
                </Box>
                {dayTimeSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      backgroundColor: 'background.default',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Day Time Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create day time specials for lunch and afternoon crowds.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {dayTimeSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 4 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: 'text.primary', fontWeight: 600, mb: 0 }}
                  >
                    Chef Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleOpenDialog(undefined, SpecialTypeValues.CHEF)
                    }
                    sx={{
                      background:
                        'linear-gradient(135deg, #9C27B0 0%, #BA68C8 100%)',
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #7B1FA2 0%, #9C27B0 100%)',
                        boxShadow: '0 6px 16px rgba(156, 39, 176, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Add Chef Special
                  </Button>
                </Box>
                {chefSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      backgroundColor: 'background.default',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Chef Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create chef specials featuring signature dishes from your
                      culinary team.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {chefSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 5 && (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SeasonalIcon
                      sx={{ color: '#2E7D32', fontSize: '1.75rem' }}
                    />
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ color: 'text.primary', fontWeight: 600, mb: 0 }}
                    >
                      Seasonal Specials
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() =>
                      handleOpenDialog(undefined, SpecialTypeValues.SEASONAL)
                    }
                    sx={{
                      background:
                        'linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)',
                      boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        background:
                          'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
                        boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Add Seasonal Special
                  </Button>
                </Box>
                {seasonalSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 8,
                      px: 4,
                      bgcolor: 'grey.50',
                      borderRadius: 3,
                      border: '2px dashed',
                      borderColor: 'grey.300',
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: 'text.secondary', mb: 2 }}
                    >
                      No Seasonal Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: 'text.secondary', mb: 3 }}
                    >
                      Create seasonal specials for holidays, events, or special
                      occasions to keep your menu exciting throughout the year.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                    {seasonalSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Dialog
            open={dialogOpen}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            sx={{
              '& .MuiDialog-paper': {
                borderRadius: 3,
                boxShadow: '0 8px 24px rgba(200, 121, 65, 0.2)',
                overflow: 'visible',
                border: '1px solid #E8DDD0',
              },
            }}
          >
            <DialogTitle
              sx={{
                background: 'linear-gradient(135deg, #C87941 0%, #D4842D 100%)',
                color: 'white',
                fontSize: '1.5rem',
                fontWeight: 700,
                textAlign: 'center',
                py: 3,
                position: 'relative',
              }}
            >
              {editingSpecial ? 'Edit Special' : 'Create New Special'}
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  color: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' },
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 4 }}>
              <Grid container spacing={4}>
                <Grid size={{ xs: 12 }}>
                  <FormControl fullWidth>
                    <InputLabel>Special Type</InputLabel>
                    <Select
                      value={specialForm.type}
                      label="Special Type"
                      onChange={(e) =>
                        setSpecialForm({
                          ...specialForm,
                          type: e.target.value as SpecialType,
                        })
                      }
                    >
                      <MenuItem value={SpecialTypeValues.DAILY}>
                        Daily Special
                      </MenuItem>
                      <MenuItem value={SpecialTypeValues.GAME_TIME}>
                        Game Time Special
                      </MenuItem>
                      <MenuItem value={SpecialTypeValues.DAY_TIME}>
                        Day Time Special
                      </MenuItem>
                      <MenuItem value={SpecialTypeValues.CHEF}>
                        Chef Special
                      </MenuItem>
                      <MenuItem value={SpecialTypeValues.SEASONAL}>
                        Seasonal Special
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {specialForm.type === SpecialTypeValues.DAILY && (
                  <>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Day of Week</InputLabel>
                        <Select
                          value={specialForm.dayOfWeek}
                          label="Day of Week"
                          onChange={(e) =>
                            setSpecialForm({
                              ...specialForm,
                              dayOfWeek: e.target.value as DayOfWeek,
                            })
                          }
                        >
                          <MenuItem value={DayOfWeekValues.MONDAY}>
                            Monday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.TUESDAY}>
                            Tuesday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.WEDNESDAY}>
                            Wednesday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.THURSDAY}>
                            Thursday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.FRIDAY}>
                            Friday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.SATURDAY}>
                            Saturday
                          </MenuItem>
                          <MenuItem value={DayOfWeekValues.SUNDAY}>
                            Sunday
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <FormControl fullWidth>
                        <InputLabel>Special Category</InputLabel>
                        <Select
                          value={specialForm.specialCategory}
                          label="Special Category"
                          onChange={(e) =>
                            setSpecialForm({
                              ...specialForm,
                              specialCategory: e.target
                                .value as SpecialCategory,
                            })
                          }
                        >
                          <MenuItem value={SpecialCategoryValues.REGULAR}>
                            Regular Daily Special
                          </MenuItem>
                          <MenuItem value={SpecialCategoryValues.LATE_NIGHT}>
                            Late Night Special
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Title"
                    value={specialForm.title}
                    onChange={(e) =>
                      setSpecialForm({ ...specialForm, title: e.target.value })
                    }
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Description"
                    value={specialForm.description}
                    onChange={(e) =>
                      setSpecialForm({
                        ...specialForm,
                        description: e.target.value,
                      })
                    }
                    multiline
                    rows={3}
                    required
                  />
                </Grid>

                {(specialForm.type === SpecialTypeValues.SEASONAL ||
                  specialForm.type === SpecialTypeValues.GAME_TIME) && (
                  <>
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Display Period (When to show the special)
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <DateTimePicker
                        label="Display Start Date/Time"
                        value={specialForm.displayStartDate}
                        onChange={(newValue) =>
                          setSpecialForm({
                            ...specialForm,
                            displayStartDate: newValue,
                          })
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <DateTimePicker
                        label="Display End Date/Time"
                        value={specialForm.displayEndDate}
                        onChange={(newValue) =>
                          setSpecialForm({
                            ...specialForm,
                            displayEndDate: newValue,
                          })
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                      <Typography variant="h6" gutterBottom>
                        Special Period (When the offer is valid)
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <DateTimePicker
                        label="Special Start Date/Time"
                        value={specialForm.specialStartDate}
                        onChange={(newValue) =>
                          setSpecialForm({
                            ...specialForm,
                            specialStartDate: newValue,
                          })
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <DateTimePicker
                        label="Special End Date/Time"
                        value={specialForm.specialEndDate}
                        onChange={(newValue) =>
                          setSpecialForm({
                            ...specialForm,
                            specialEndDate: newValue,
                          })
                        }
                        slotProps={{ textField: { fullWidth: true } }}
                      />
                    </Grid>
                  </>
                )}

                <Grid size={{ xs: 12 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={specialForm.isActive}
                        onChange={(e) =>
                          setSpecialForm({
                            ...specialForm,
                            isActive: e.target.checked,
                          })
                        }
                      />
                    }
                    label="Active"
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Typography variant="h6" gutterBottom>
                    Images (Max 5, 1MB each)
                  </Typography>
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}
                  >
                    {/* Existing images */}
                    {specialForm.imageUrls.map((url, index) => (
                      <Box
                        key={`existing-${index}`}
                        sx={{ position: 'relative' }}
                      >
                        <Box
                          component="img"
                          src={getImageUrl(url)}
                          alt={specialForm.title}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '2px solid #C87941',
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                    {/* New image previews */}
                    {imagePreviews.map((preview, index) => (
                      <Box
                        key={`preview-${index}`}
                        sx={{ position: 'relative' }}
                      >
                        <Box
                          component="img"
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: 'cover',
                            borderRadius: 1,
                            border: '2px dashed #4CAF50',
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            bgcolor: 'rgba(255,255,255,0.9)',
                            '&:hover': { bgcolor: 'rgba(255,255,255,1)' },
                          }}
                          onClick={() =>
                            handleRemoveImage(
                              specialForm.imageUrls.length + index,
                            )
                          }
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  {specialForm.imageUrls.length + imagePreviews.length < 5 && (
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<UploadIcon />}
                    >
                      Upload Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        hidden
                        onChange={(e) =>
                          e.target.files && handleImageUpload(e.target.files)
                        }
                      />
                    </Button>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions
              sx={{
                p: 3,
                bgcolor: 'grey.50',
                borderTop: '1px solid',
                borderColor: 'grey.200',
                gap: 2,
              }}
            >
              <Button
                onClick={handleCloseDialog}
                sx={{
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                variant="contained"
                sx={{
                  background:
                    'linear-gradient(135deg, #C87941 0%, #D4842D 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(200, 121, 65, 0.22)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #A45F2D 0%, #B5661A 100%)',
                    boxShadow: '0 4px 12px rgba(200, 121, 65, 0.3)',
                  },
                }}
              >
                {editingSpecial ? 'Update Special' : 'Create Special'}
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
      </Box>
    </LocalizationProvider>
  );
};

export default React.memo(SpecialsManagement);
