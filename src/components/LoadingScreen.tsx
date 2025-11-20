import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const LoadingScreen: React.FC = () => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Box
        component="img"
        src="/brooklinpub-logo.png"
        alt="Brooklin Pub"
        sx={{ height: 60, marginBottom: 3 }}
      />
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
