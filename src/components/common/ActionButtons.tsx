import React from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
} from "@mui/icons-material";
import { STATUS_COLORS } from "../../utils/standardColors";

interface ActionButtonsProps {
  onEdit?: () => void;
  onDelete?: () => void;
  onView?: () => void;
  onDuplicate?: () => void;
  size?: "small" | "medium";
  showLabels?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onEdit,
  onDelete,
  onView,
  onDuplicate,
  size = "small",
}) => {
  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
      {onView && (
        <Tooltip title="View Details" arrow>
          <IconButton
            size={size}
            onClick={onView}
            sx={{
              color: STATUS_COLORS.info,
              "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.08)" },
            }}
          >
            <VisibilityIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onEdit && (
        <Tooltip title="Edit" arrow>
          <IconButton
            size={size}
            onClick={onEdit}
            sx={{
              color: STATUS_COLORS.primary,
              "&:hover": { backgroundColor: "rgba(200, 121, 65, 0.08)" },
            }}
          >
            <EditIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDuplicate && (
        <Tooltip title="Duplicate" arrow>
          <IconButton
            size={size}
            onClick={onDuplicate}
            sx={{
              color: STATUS_COLORS.info,
              "&:hover": { backgroundColor: "rgba(33, 150, 243, 0.08)" },
            }}
          >
            <ContentCopyIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Delete" arrow>
          <IconButton
            size={size}
            onClick={onDelete}
            sx={{
              color: STATUS_COLORS.error,
              "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.08)" },
            }}
          >
            <DeleteIcon fontSize={size} />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export default ActionButtons;
