import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRowsProp } from "@mui/x-data-grid";
import { Paper, Box, Typography } from "@mui/material";
import { STANDARD_COLORS } from "../../utils/standardColors";

interface EnhancedDataGridProps {
  rows: GridRowsProp;
  columns: GridColDef[];
  loading?: boolean;
  pageSize?: number;
  title?: string;
  subtitle?: string;
  onRowClick?: (params: unknown) => void;
  checkboxSelection?: boolean;
  disableRowSelectionOnClick?: boolean;
}

export const EnhancedDataGrid: React.FC<EnhancedDataGridProps> = ({
  rows,
  columns,
  loading = false,
  pageSize = 10,
  title,
  subtitle,
  onRowClick,
  checkboxSelection = false,
  disableRowSelectionOnClick = true,
}) => {
  return (
    <Paper
      sx={{
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'rgba(200, 121, 65, 0.08)',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(16px) saturate(180%)',
        WebkitBackdropFilter: 'blur(16px) saturate(180%)',
      }}
    >
      {(title || subtitle) && (
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: '1px solid',
            borderColor: STANDARD_COLORS.ui.border,
          }}
        >
          {title && (
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: STANDARD_COLORS.text.primary,
                mb: subtitle ? 0.5 : 0,
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        initialState={{
          pagination: {
            paginationModel: { pageSize, page: 0 },
          },
        }}
        pageSizeOptions={[10, 25, 50, 100, 200, 300]}
        checkboxSelection={checkboxSelection}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        onRowClick={onRowClick}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: STANDARD_COLORS.ui.border,
            py: 1.5,
          },
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: STANDARD_COLORS.ui.background,
            borderBottom: '2px solid',
            borderColor: STANDARD_COLORS.ui.border,
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
              fontSize: '0.813rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: STANDARD_COLORS.text.secondary,
            },
          },
          '& .MuiDataGrid-row': {
            '&:hover': {
              bgcolor: `${STANDARD_COLORS.brand.primary}08`,
            },
            '&.Mui-selected': {
              bgcolor: `${STANDARD_COLORS.brand.primary}15`,
              '&:hover': {
                bgcolor: `${STANDARD_COLORS.brand.primary}20`,
              },
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '2px solid',
            borderColor: STANDARD_COLORS.ui.border,
            bgcolor: STANDARD_COLORS.ui.background,
          },
          '& .MuiTablePagination-root': {
            color: STANDARD_COLORS.text.secondary,
          },
        }}
      />
    </Paper>
  );
};
