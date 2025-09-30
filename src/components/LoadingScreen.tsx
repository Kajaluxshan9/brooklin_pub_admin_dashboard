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
      <img
        src="/brooklinpub-logo.png"
        alt="Brooklin Pub"
        style={{ height: 60, marginBottom: 24 }}
      />
      <CircularProgress size={40} sx={{ mb: 2 }} />
      <Typography variant="body1" color="text.secondary">
        Loading...
      </Typography>
    </Box>
  );
};

export default LoadingScreen;
