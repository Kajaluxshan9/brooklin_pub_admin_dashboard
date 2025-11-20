import React, { useState } from "react";
import {
  Box,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogContent,
  Paper,
  Typography,
  Tooltip,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  ZoomIn as ZoomInIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { STANDARD_COLORS } from "../../utils/standardColors";

interface ImageGalleryProps {
  images: string[];
  onDelete?: (index: number) => void;
  columns?: number;
  maxHeight?: number;
  showPreview?: boolean;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  onDelete,
  columns = 3,
  maxHeight = 200,
  showPreview = true,
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string>("");

  const handlePreview = (image: string) => {
    if (showPreview) {
      setPreviewImage(image);
      setPreviewOpen(true);
    }
  };

  if (images.length === 0) {
    return (
      <Box
        sx={{
          p: 3,
          textAlign: "center",
          border: "2px dashed",
          borderColor: STANDARD_COLORS.ui.border,
          borderRadius: 2,
          bgcolor: STANDARD_COLORS.ui.background,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No images uploaded
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <ImageList cols={columns} gap={12} sx={{ margin: 0 }}>
        {images.map((image, index) => (
          <ImageListItem
            key={index}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              border: "1px solid",
              borderColor: STANDARD_COLORS.ui.border,
              position: "relative",
              "&:hover .image-actions": {
                opacity: 1,
              },
            }}
          >
            <Box
              component="img"
              src={image}
              alt={`Image ${index + 1}`}
              loading="lazy"
              sx={{
                height: maxHeight,
                objectFit: "cover",
                cursor: showPreview ? "pointer" : "default",
              }}
              onClick={() => handlePreview(image)}
            />
            <ImageListItemBar
              className="image-actions"
              sx={{
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
                opacity: 0,
                transition: "opacity 0.2s",
              }}
              position="bottom"
              actionIcon={
                <Box sx={{ display: "flex", gap: 0.5, pr: 1 }}>
                  {showPreview && (
                    <Tooltip title="View Full Size">
                      <IconButton
                        size="small"
                        onClick={() => handlePreview(image)}
                        sx={{
                          color: "white",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
                        }}
                      >
                        <ZoomInIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete Image">
                      <IconButton
                        size="small"
                        onClick={() => onDelete(index)}
                        sx={{
                          color: "white",
                          "&:hover": { bgcolor: "rgba(244,67,54,0.3)" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              }
            />
          </ImageListItem>
        ))}
      </ImageList>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: "transparent",
            boxShadow: "none",
            overflow: "visible",
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: "relative" }}>
          <IconButton
            onClick={() => setPreviewOpen(false)}
            sx={{
              position: "absolute",
              top: -16,
              right: -16,
              bgcolor: "white",
              boxShadow: 3,
              "&:hover": { bgcolor: "white" },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          <Paper
            elevation={8}
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              bgcolor: "#000",
            }}
          >
            <Box
              component="img"
              src={previewImage}
              alt="Preview"
              sx={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
              }}
            />
          </Paper>
        </DialogContent>
      </Dialog>
    </>
  );
};
