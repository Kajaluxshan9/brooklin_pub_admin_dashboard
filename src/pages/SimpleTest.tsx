import React from "react";
import { Box, Typography } from "@mui/material";

const SimpleTest: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4">Test Page</Typography>
      <Typography>This is a simple test to verify the build works.</Typography>
    </Box>
  );
};

export default SimpleTest;
