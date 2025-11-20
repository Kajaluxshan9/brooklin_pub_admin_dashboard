import React, { useState } from "react";
import {
  Paper,
  InputBase,
  IconButton,
  Box,
  Chip,
  Fade,
  Popper,
  ClickAwayListener,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  TuneRounded as TuneIcon,
} from "@mui/icons-material";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterClick?: () => void;
  filters?: Array<{ label: string; value: string; active: boolean }>;
  onFilterToggle?: (value: string) => void;
  variant?: "default" | "elevated" | "glass";
  fullWidth?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onFilterClick,
  filters = [],
  onFilterToggle,
  variant = "default",
  fullWidth = false,
}) => {
  const [focused, setFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const getVariantStyles = () => {
    switch (variant) {
      case "elevated":
        return {
          boxShadow: focused
            ? "0 8px 24px rgba(200, 121, 65, 0.2), 0 4px 12px rgba(200, 121, 65, 0.1)"
            : "0 4px 12px rgba(200, 121, 65, 0.12)",
          background: "#fff",
        };
      case "glass":
        return {
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        };
      default:
        return {
          boxShadow: focused
            ? "0 4px 16px rgba(200, 121, 65, 0.2)"
            : "0 2px 8px rgba(200, 121, 65, 0.1)",
          background: "#fff",
        };
    }
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
    setShowFilters(!showFilters);
  };

  return (
    <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
      <Paper
        elevation={0}
        sx={{
          display: "flex",
          alignItems: "center",
          width: fullWidth ? "100%" : { xs: "100%", sm: 400 },
          maxWidth: fullWidth ? "100%" : 600,
          height: 48,
          px: 2,
          borderRadius: 3,
          border: focused
            ? "2px solid #C87941"
            : "2px solid rgba(200, 121, 65, 0.15)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          ...getVariantStyles(),
          "&:hover": {
            borderColor: "#E89B5C",
            boxShadow:
              variant === "glass"
                ? "0 6px 16px rgba(0, 0, 0, 0.12)"
                : "0 4px 16px rgba(200, 121, 65, 0.18)",
          },
        }}
      >
        <SearchIcon
          sx={{
            color: focused ? "#C87941" : "rgba(200, 121, 65, 0.5)",
            mr: 1.5,
            fontSize: 24,
            transition: "all 0.3s ease",
          }}
        />
        <InputBase
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          sx={{
            flex: 1,
            fontSize: "0.938rem",
            fontWeight: 500,
            color: "text.primary",
            "& input::placeholder": {
              color: "text.disabled",
              opacity: 0.7,
            },
          }}
        />
        {value && (
          <Fade in>
            <IconButton
              size="small"
              onClick={() => onChange("")}
              sx={{
                color: "text.secondary",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#C87941",
                  backgroundColor: "rgba(200, 121, 65, 0.1)",
                  transform: "rotate(90deg)",
                },
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Fade>
        )}
        {(onFilterClick || filters.length > 0) && (
          <>
            <Box
              sx={{
                width: 1,
                height: 24,
                bgcolor: "rgba(200, 121, 65, 0.2)",
                mx: 1.5,
              }}
            />
            <IconButton
              size="small"
              onClick={onFilterClick || handleFilterClick}
              sx={{
                color:
                  showFilters || filters.some((f) => f.active)
                    ? "#C87941"
                    : "text.secondary",
                transition: "all 0.3s ease",
                "&:hover": {
                  color: "#C87941",
                  backgroundColor: "rgba(200, 121, 65, 0.1)",
                  transform: "rotate(180deg)",
                },
              }}
            >
              <TuneIcon fontSize="small" />
            </IconButton>
          </>
        )}
      </Paper>

      {/* Filter Chips Dropdown */}
      {filters.length > 0 && (
        <Popper
          open={showFilters}
          anchorEl={anchorEl}
          placement="bottom-end"
          transition
          sx={{ zIndex: 1300 }}
        >
          {({ TransitionProps }) => (
            <Fade {...TransitionProps} timeout={250}>
              <ClickAwayListener onClickAway={() => setShowFilters(false)}>
                <Paper
                  elevation={8}
                  sx={{
                    mt: 1,
                    p: 2,
                    borderRadius: 2.5,
                    border: "1px solid rgba(200, 121, 65, 0.15)",
                    boxShadow: "0 8px 24px rgba(200, 121, 65, 0.2)",
                    minWidth: 200,
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {filters.map((filter) => (
                      <Chip
                        key={filter.value}
                        label={filter.label}
                        onClick={() => onFilterToggle?.(filter.value)}
                        sx={{
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.813rem",
                          transition: "all 0.2s ease",
                          ...(filter.active
                            ? {
                                background:
                                  "linear-gradient(135deg, #C87941 0%, #E89B5C 100%)",
                                color: "#fff",
                                boxShadow: "0 2px 8px rgba(200, 121, 65, 0.3)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #A45F2D 0%, #C87941 100%)",
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 4px 12px rgba(200, 121, 65, 0.4)",
                                },
                              }
                            : {
                                background: "rgba(200, 121, 65, 0.1)",
                                color: "#C87941",
                                border: "1px solid rgba(200, 121, 65, 0.3)",
                                "&:hover": {
                                  background: "rgba(200, 121, 65, 0.2)",
                                  borderColor: "#C87941",
                                },
                              }),
                        }}
                      />
                    ))}
                  </Box>
                </Paper>
              </ClickAwayListener>
            </Fade>
          )}
        </Popper>
      )}
    </Box>
  );
};

export default SearchBar;
