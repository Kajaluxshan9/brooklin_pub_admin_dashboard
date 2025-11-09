import React, { useState, useEffect, useCallback } from "react";
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
  Chip,
  Tab,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Close as CloseIcon,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Image as ImageIcon,
} from "@mui/icons-material";
import { DateTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import moment from "moment-timezone";
import { api } from "../utils/api";

const TIMEZONE = "America/Toronto";

type SpecialType = "daily" | "seasonal";
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
    message: "",
    severity: "success" as "success" | "error",
  });

  const [specialForm, setSpecialForm] = useState<SpecialForm>({
    type: SpecialTypeValues.DAILY,
    dayOfWeek: DayOfWeekValues.MONDAY,
    specialCategory: SpecialCategoryValues.REGULAR,
    title: "",
    description: "",
    displayStartDate: null,
    displayEndDate: null,
    specialStartDate: null,
    specialEndDate: null,
    imageUrls: [],
    isActive: true,
  });

  const [editingSpecial, setEditingSpecial] = useState<Special | null>(null);

  const showSnackbar = useCallback(
    (message: string, severity: "success" | "error") => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  const fetchSpecials = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/specials");
      setSpecials(res.data || []);
    } catch {
      showSnackbar("Error fetching specials", "error");
    } finally {
      setLoading(false);
    }
  }, [showSnackbar]);

  useEffect(() => {
    fetchSpecials();
  }, [fetchSpecials]);

  const handleOpenDialog = (special?: Special, presetType?: SpecialType, presetCategory?: SpecialCategory) => {
    if (special) {
      setEditingSpecial(special);
      setSpecialForm({
        type: special.type,
        dayOfWeek: special.dayOfWeek || DayOfWeekValues.MONDAY,
        specialCategory: special.specialCategory || SpecialCategoryValues.REGULAR,
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
        title: "",
        description: "",
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
    setSpecialForm({
      type: SpecialTypeValues.DAILY,
      dayOfWeek: DayOfWeekValues.MONDAY,
      specialCategory: SpecialCategoryValues.REGULAR,
      title: "",
      description: "",
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
      showSnackbar("Title is required", "error");
      return;
    }

    const specialData = {
      ...specialForm,
      displayStartDate: specialForm.displayStartDate?.utc().toISOString(),
      displayEndDate: specialForm.displayEndDate?.utc().toISOString(),
      specialStartDate: specialForm.specialStartDate?.utc().toISOString(),
      specialEndDate: specialForm.specialEndDate?.utc().toISOString(),
    };

    try {
      if (editingSpecial) {
        await api.put(`/specials/${editingSpecial.id}`, specialData);
        showSnackbar("Special updated successfully", "success");
      } else {
        await api.post("/specials", specialData);
        showSnackbar("Special created successfully", "success");
      }
      fetchSpecials();
      handleCloseDialog();
    } catch {
      showSnackbar("Error saving special", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this special?"))
      return;

    try {
      await api.delete(`/specials/${id}`);
      showSnackbar("Special deleted successfully", "success");
      fetchSpecials();
    } catch {
      showSnackbar("Error deleting special", "error");
    }
  };

  const handleToggleActive = async (special: Special) => {
    try {
      await api.put(`/specials/${special.id}`, { isActive: !special.isActive });
      showSnackbar("Special status updated", "success");
      fetchSpecials();
    } catch {
      showSnackbar("Error updating special status", "error");
    }
  };

  const handleImageUpload = async (files: FileList) => {
    const maxImages = 5;
    const maxSize = 1024 * 1024; // 1MB

    if (specialForm.imageUrls.length + files.length > maxImages) {
      showSnackbar(`Maximum ${maxImages} images allowed`, "error");
      return;
    }

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > maxSize) {
        showSnackbar("Image size must be less than 1MB", "error");
        return;
      }
      if (!file.type.startsWith('image/')) {
        showSnackbar("Only image files are allowed", "error");
        return;
      }
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      const res = await api.post("/upload/images", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.urls) {
        setSpecialForm((prev) => ({
          ...prev,
          imageUrls: [...prev.imageUrls, ...res.data.urls],
        }));
        showSnackbar("Images uploaded successfully", "success");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Upload error:", error);
      showSnackbar("Error uploading images", "error");
    }
  };

  const handleRemoveImage = async (index: number) => {
    const imageUrl = specialForm.imageUrls[index];
    
    // If it's an existing S3 URL, attempt to delete it from server
    if (imageUrl && imageUrl.startsWith('https://')) {
      try {
        await api.delete("/upload/images", {
          data: { urls: [imageUrl] }
        });
      } catch (error) {
        console.error("Error deleting image from server:", error);
        // Continue with local removal even if server deletion fails
      }
    }

    setSpecialForm((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const renderSpecialCard = (special: Special) => (
    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={special.id}>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(139, 69, 19, 0.15)",
          border: "1px solid",
          borderColor: "grey.200",
          transition: "all 0.3s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: "0 8px 24px rgba(139, 69, 19, 0.25)",
            borderColor: "primary.light",
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
                color: "text.primary",
                lineHeight: 1.3,
                pr: 2,
              }}
            >
              {special.title}
            </Typography>
            <Chip
              label={special.isActive ? "Active" : "Inactive"}
              color={special.isActive ? "success" : "default"}
              size="small"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                "& .MuiChip-label": { px: 1.5 },
              }}
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
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  bgcolor: special.specialCategory === SpecialCategoryValues.LATE_NIGHT ? "secondary.light" : "primary.light",
                  borderRadius: 2,
                  color: special.specialCategory === SpecialCategoryValues.LATE_NIGHT ? "secondary.contrastText" : "primary.contrastText",
                }}
              >
                <ScheduleIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {special.dayOfWeek
                    ? special.dayOfWeek.charAt(0).toUpperCase() +
                      special.dayOfWeek.slice(1)
                    : "N/A"}
                  {special.specialCategory === SpecialCategoryValues.LATE_NIGHT && " (Late Night)"}
                </Typography>
              </Box>
            )}
            {special.type === SpecialTypeValues.SEASONAL && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1.5,
                  bgcolor: "secondary.light",
                  borderRadius: 2,
                  color: "secondary.contrastText",
                }}
              >
                <CalendarTodayIcon fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {moment
                    .tz(special.displayStartDate, TIMEZONE)
                    .format("MMM DD")}{" "}
                  -{" "}
                  {moment
                    .tz(special.displayEndDate, TIMEZONE)
                    .format("MMM DD, YYYY")}
                </Typography>
              </Box>
            )}
          </Box>
          {special.imageUrls && special.imageUrls.length > 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                p: 1,
                bgcolor: "grey.50",
                borderRadius: 1,
              }}
            >
              <ImageIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {special.imageUrls.length} image
                {special.imageUrls.length > 1 ? "s" : ""}
              </Typography>
            </Box>
          )}
        </CardContent>
        <CardActions
          sx={{
            p: 2,
            pt: 0,
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Button
            size="small"
            startIcon={<EditIcon />}
            onClick={() => handleOpenDialog(special)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
              "&:hover": { bgcolor: "primary.light" },
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            color={special.isActive ? "warning" : "success"}
            onClick={() => handleToggleActive(special)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            {special.isActive ? "Deactivate" : "Activate"}
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDelete(special.id)}
            sx={{
              textTransform: "none",
              fontWeight: 500,
              borderRadius: 2,
            }}
          >
            Delete
          </Button>
        </CardActions>
      </Card>
    </Grid>
  );

  const dailySpecials = specials.filter(
    (s) => s.type === SpecialTypeValues.DAILY && s.specialCategory !== SpecialCategoryValues.LATE_NIGHT
  );
  const lateNightSpecials = specials.filter(
    (s) => s.type === SpecialTypeValues.DAILY && s.specialCategory === SpecialCategoryValues.LATE_NIGHT
  );
  const seasonalSpecials = specials.filter(
    (s) => s.type === SpecialTypeValues.SEASONAL
  );

  return (
    <LocalizationProvider dateAdapter={AdapterMoment}>
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #faf9f7 0%, #f5f4f1 100%)",
          p: 3,
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            backgroundColor: "background.paper",
            borderRadius: 3,
            boxShadow: "0 4px 20px rgba(139, 69, 19, 0.1)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #8B4513 0%, #CD853F 100%)",
              p: 3,
              color: "white",
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              sx={{ fontWeight: 700, mb: 1 }}
            >
              Specials Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Manage your daily and seasonal specials with ease
            </Typography>
          </Box>

          {loading && (
            <Box sx={{ px: 3, py: 1 }}>
              <LinearProgress
                sx={{
                  height: 3,
                  borderRadius: 2,
                  backgroundColor: "grey.200",
                  "& .MuiLinearProgress-bar": {
                    background:
                      "linear-gradient(90deg, #8B4513 0%, #CD853F 100%)",
                  },
                }}
              />
            </Box>
          )}

          <Box sx={{ p: 3 }}>
            <Box
              sx={{
                borderBottom: 2,
                borderColor: "primary.main",
                mb: 4,
                "& .MuiTabs-indicator": {
                  backgroundColor: "primary.main",
                  height: 3,
                  borderRadius: 2,
                },
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, newValue) => setActiveTab(newValue)}
                sx={{
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontSize: "1rem",
                    fontWeight: 600,
                    minHeight: 48,
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.main",
                    },
                  },
                }}
              >
                <Tab label="Daily Specials" />
                <Tab label="Late Night Specials" />
                <Tab label="Seasonal Specials" />
              </Tabs>
            </Box>

            <Box sx={{ mb: 4 }}>
              {/* Removed common Add New Special button - now each section has its own button */}
            </Box>

            {activeTab === 0 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "text.primary", fontWeight: 600, mb: 0 }}
                  >
                    🍽️ Daily Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(undefined, SpecialTypeValues.DAILY, SpecialCategoryValues.REGULAR)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #8B4513 0%, #CD853F 100%)",
                      boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #654321 0%, #8B4513 100%)",
                        boxShadow: "0 6px 16px rgba(139, 69, 19, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Add Daily Special
                  </Button>
                </Box>
                {dailySpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      px: 4,
                      bgcolor: "grey.50",
                      borderRadius: 3,
                      border: "2px dashed",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      No Daily Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 3 }}
                    >
                      Create your first daily special to attract customers with
                      fresh offerings every day of the week.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {dailySpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 1 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "text.primary", fontWeight: 600, mb: 0 }}
                  >
                    🌙 Late Night Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(undefined, SpecialTypeValues.DAILY, SpecialCategoryValues.LATE_NIGHT)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #4A148C 0%, #7B1FA2 100%)",
                      boxShadow: "0 4px 12px rgba(74, 20, 140, 0.3)",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #2E0051 0%, #4A148C 100%)",
                        boxShadow: "0 6px 16px rgba(74, 20, 140, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Add Late Night Special
                  </Button>
                </Box>
                {lateNightSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      px: 4,
                      bgcolor: "grey.50",
                      borderRadius: 3,
                      border: "2px dashed",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      No Late Night Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 3 }}
                    >
                      Create late night specials for all days of the week to attract night owls and late diners.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
                    {lateNightSpecials.map(renderSpecialCard)}
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 2 && (
              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "text.primary", fontWeight: 600, mb: 0 }}
                  >
                    🎄 Seasonal Specials
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog(undefined, SpecialTypeValues.SEASONAL)}
                    sx={{
                      background:
                        "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
                      boxShadow: "0 4px 12px rgba(46, 125, 50, 0.3)",
                      borderRadius: 2,
                      px: 3,
                      py: 1.5,
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)",
                        boxShadow: "0 6px 16px rgba(46, 125, 50, 0.4)",
                        transform: "translateY(-2px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    Add Seasonal Special
                  </Button>
                </Box>
                {seasonalSpecials.length === 0 ? (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 8,
                      px: 4,
                      bgcolor: "grey.50",
                      borderRadius: 3,
                      border: "2px dashed",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{ color: "text.secondary", mb: 2 }}
                    >
                      No Seasonal Specials Yet
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "text.secondary", mb: 3 }}
                    >
                      Create seasonal specials for holidays, events, or special
                      occasions to keep your menu exciting throughout the year.
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
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
              "& .MuiDialog-paper": {
                borderRadius: 3,
                boxShadow: "0 20px 40px rgba(139, 69, 19, 0.3)",
                overflow: "visible",
              },
            }}
          >
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #8B4513 0%, #CD853F 100%)",
                color: "white",
                fontSize: "1.5rem",
                fontWeight: 700,
                textAlign: "center",
                py: 3,
                position: "relative",
              }}
            >
              {editingSpecial ? "Edit Special" : "Create New Special"}
              <IconButton
                onClick={handleCloseDialog}
                sx={{
                  position: "absolute",
                  right: 16,
                  top: 16,
                  color: "white",
                  bgcolor: "rgba(255,255,255,0.1)",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
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
                              specialCategory: e.target.value as SpecialCategory,
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

                {specialForm.type === SpecialTypeValues.SEASONAL && (
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
                    sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}
                  >
                    {specialForm.imageUrls.map((url, index) => (
                      <Box key={index} sx={{ position: "relative" }}>
                        <Box
                          component="img"
                          src={url}
                          alt={specialForm.title}
                          sx={{
                            width: 100,
                            height: 100,
                            objectFit: "cover",
                            borderRadius: 1,
                          }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            position: "absolute",
                            top: -8,
                            right: -8,
                            bgcolor: "rgba(255,255,255,0.8)",
                          }}
                          onClick={() => handleRemoveImage(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                  {specialForm.imageUrls.length < 5 && (
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
                bgcolor: "grey.50",
                borderTop: "1px solid",
                borderColor: "grey.200",
                gap: 2,
              }}
            >
              <Button
                onClick={handleCloseDialog}
                sx={{
                  textTransform: "none",
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
                    "linear-gradient(135deg, #8B4513 0%, #CD853F 100%)",
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  boxShadow: "0 4px 12px rgba(139, 69, 19, 0.3)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #654321 0%, #8B4513 100%)",
                    boxShadow: "0 6px 16px rgba(139, 69, 19, 0.4)",
                  },
                }}
              >
                {editingSpecial ? "Update Special" : "Create Special"}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
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
      </Box>
    </LocalizationProvider>
  );
};

export default SpecialsManagement;
