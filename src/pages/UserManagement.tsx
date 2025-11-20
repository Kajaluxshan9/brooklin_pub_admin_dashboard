import React, { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../config/env.config";
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
  Chip,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  IconButton,
  Menu,
  MenuList,
  MenuItem as MenuListItem,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  SupervisorAccount as SuperAdminIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
} from "@mui/icons-material";
import moment from "moment-timezone";
import { useAuth } from "../contexts/AuthContext";
import { useGlobalToast } from "../contexts/ToastContext";
import { PageHeader } from "../components/common/PageHeader";
import { StatusChip } from "../components/common/StatusChip";
import { ActionButtons } from "../components/common/ActionButtons";

const UserRole = {
  SUPER_ADMIN: "super_admin",
  ADMIN: "admin",
} as const;

type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRoleValue;
  isActive: boolean;
  isEmailVerified?: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useGlobalToast();
  const [users, setUsers] = useState<User[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuUserId, setMenuUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: UserRoleValue;
    isActive: boolean;
    password: string;
    confirmPassword: string;
  }>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: UserRole.ADMIN,
    isActive: true,
    password: "",
    confirmPassword: "",
  });

  const loadUsers = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();

        // Filter users based on current user's role
        let filteredUsers = data;
        if (currentUser) {
          if (currentUser.role === UserRole.ADMIN) {
            // Admin can only see other admins, not super admins
            filteredUsers = data.filter(
              (user: User) => user.role === UserRole.ADMIN
            );
          }
          // Super admin can see all users (no filtering needed)
        }

        setUsers(filteredUsers);
      } else {
        console.error("Failed to load users");
        setUsers([]);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  }, [currentUser]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleCreate = () => {
    setSelectedUser(null);
    setUserForm({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      role: UserRole.ADMIN,
      isActive: true,
      password: "",
      confirmPassword: "",
    });
    setDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setUserForm({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      role: user.role,
      isActive: user.isActive,
      password: "",
      confirmPassword: "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const url = selectedUser
        ? `${API_BASE_URL}/users/${selectedUser.id}`
        : `${API_BASE_URL}/auth/register`;

      const method = selectedUser ? "PUT" : "POST";

      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...userData } = userForm;

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        loadUsers();
        setDialogOpen(false);
        // Show success message with verification info
        showToast(
          selectedUser
            ? "User updated successfully"
            : "User created successfully. A verification email has been sent.",
          "success",
        );
      } else {
        const errorData = await response.json();
        console.error("Failed to save user:", errorData);
        showToast(`Failed to save user: ${errorData.message || 'Unknown error'}`, "error");
      }
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    // Check if trying to delete self
    if (currentUser?.id === id) {
      alert(
        "Error: You cannot delete your own account. Please ask another administrator to perform this action."
      );
      return;
    }

    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (response.ok) {
          loadUsers();
        } else {
          const errorData = await response.json();
          alert(
            `Failed to delete user: ${errorData.message || "Unknown error"}`
          );
          console.error("Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error: Failed to delete user. Please try again.");
      }
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    userId: string
  ) => {
    setAnchorEl(event.currentTarget);
    setMenuUserId(userId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuUserId(null);
  };

  const handleResendVerification = async (userId: string) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/auth/resend-verification/${userId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Verification email sent successfully");
      } else {
        const errorData = await response.json();
        alert(
          `Failed to resend verification: ${
            errorData.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Error resending verification:", error);
      alert("Error: Failed to resend verification email. Please try again.");
    }
    handleMenuClose();
  };

  const handleToggleStatus = async (userId: string) => {
    // Check if trying to inactivate self
    if (currentUser?.id === userId) {
      alert(
        "Error: You cannot change your own account status. Please ask another administrator to perform this action."
      );
      handleMenuClose();
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/${userId}/toggle-status`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (response.ok) {
        loadUsers();
      } else {
        const errorData = await response.json();
        alert(
          `Failed to toggle user status: ${
            errorData.message || "Unknown error"
          }`
        );
        console.error("Failed to toggle user status");
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      alert("Error: Failed to toggle user status. Please try again.");
    }
    handleMenuClose();
  };

  const getRoleIcon = (role: UserRoleValue) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return <SuperAdminIcon />;
      case UserRole.ADMIN:
        return <AdminIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role: UserRoleValue) => {
    switch (role) {
      case UserRole.SUPER_ADMIN:
        return "#C87941";
      case UserRole.ADMIN:
        return "#D4842D";
      default:
        return "#E49B5F";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Box sx={{ backgroundColor: "#FFF8F0", minHeight: "100vh", p: 3 }}>
      <PageHeader
        title="User Management"
        subtitle="Manage admin users and their access permissions"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{
              backgroundColor: "#C87941",
              color: "white",
              fontWeight: 600,
              "&:hover": { backgroundColor: "#A45F2D" },
            }}
          >
            Add User
          </Button>
        }
      />

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={user.id}>
            <Card
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: user.isActive ? 1 : 0.7,
              }}
            >
              <Box sx={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, user.id)}
                >
                  <MoreVertIcon />
                </IconButton>
              </Box>

              <CardContent sx={{ flexGrow: 1, pt: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: getRoleColor(user.role),
                      mr: 2,
                      width: 56,
                      height: 56,
                    }}
                  >
                    {getInitials(user.firstName, user.lastName)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="div">
                      {user.firstName} {user.lastName}
                    </Typography>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role.replace("_", " ").toUpperCase()}
                      size="small"
                      sx={{
                        backgroundColor: getRoleColor(user.role),
                        color: "white",
                        fontSize: "0.7rem",
                      }}
                    />
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <EmailIcon
                      sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>

                  {user.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <PhoneIcon
                        sx={{ fontSize: 16, mr: 1, color: "text.secondary" }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {user.phone}
                      </Typography>
                    </Box>
                  )}
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <StatusChip
                      status={user.isActive ? "active" : "inactive"}
                      label={user.isActive ? "Active" : "Inactive"}
                      size="small"
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Email:
                    </Typography>
                    <Chip
                      label={user.isEmailVerified ? "Verified" : "Unverified"}
                      size="small"
                      color={user.isEmailVerified ? "success" : "warning"}
                      sx={{ fontSize: "0.7rem" }}
                    />
                  </Box>

                  {user.lastLogin && (
                    <Typography variant="body2" color="text.secondary">
                      Last login:{" "}
                      {moment(user.lastLogin).tz("America/Toronto").fromNow()}
                    </Typography>
                  )}

                  <Typography variant="body2" color="text.secondary">
                    Created:{" "}
                    {moment(user.createdAt)
                      .tz("America/Toronto")
                      .format("MMM D, YYYY")}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: "flex-end", px: 2, pb: 2 }}>
                <ActionButtons
                  size="small"
                  onEdit={() => handleEdit(user)}
                  onDelete={
                    user.role !== UserRole.SUPER_ADMIN
                      ? () => handleDelete(user.id)
                      : undefined
                  }
                />
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuList>
          <MenuListItem
            onClick={() => {
              const user = users.find((u) => u.id === menuUserId);
              if (user) handleEdit(user);
              handleMenuClose();
            }}
          >
            <EditIcon sx={{ fontSize: 16, mr: 1 }} />
            Edit User
          </MenuListItem>
          <MenuListItem
            onClick={() => {
              if (menuUserId) handleToggleStatus(menuUserId);
            }}
          >
            <Switch size="small" sx={{ mr: 1 }} />
            {users.find((u) => u.id === menuUserId)?.isActive
              ? "Deactivate"
              : "Activate"}
          </MenuListItem>
          {!users.find((u) => u.id === menuUserId)?.isEmailVerified && (
            <MenuListItem
              onClick={() => {
                if (menuUserId) handleResendVerification(menuUserId);
              }}
            >
              <EmailIcon sx={{ fontSize: 16, mr: 1 }} />
              Resend Verification
            </MenuListItem>
          )}
          <Divider />
          <MenuListItem
            onClick={() => {
              if (menuUserId) handleDelete(menuUserId);
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
            disabled={
              users.find((u) => u.id === menuUserId)?.role ===
              UserRole.SUPER_ADMIN
            }
          >
            <DeleteIcon sx={{ fontSize: 16, mr: 1 }} />
            Delete User
          </MenuListItem>
        </MenuList>
      </Menu>

      {/* Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{selectedUser ? "Edit User" : "Create User"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="First Name"
                value={userForm.firstName}
                onChange={(e) =>
                  setUserForm({ ...userForm, firstName: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Last Name"
                value={userForm.lastName}
                onChange={(e) =>
                  setUserForm({ ...userForm, lastName: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Phone"
                value={userForm.phone}
                onChange={(e) =>
                  setUserForm({ ...userForm, phone: e.target.value })
                }
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({
                      ...userForm,
                      role: e.target.value as UserRoleValue,
                    })
                  }
                >
                  <MenuItem value={UserRole.ADMIN}>Admin</MenuItem>
                  <MenuItem value={UserRole.SUPER_ADMIN}>Super Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {!selectedUser && (
              <>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={userForm.password}
                    onChange={(e) =>
                      setUserForm({ ...userForm, password: e.target.value })
                    }
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    value={userForm.confirmPassword}
                    onChange={(e) =>
                      setUserForm({
                        ...userForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </Grid>
              </>
            )}

            <Grid size={{ xs: 12 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={userForm.isActive}
                    onChange={(e) =>
                      setUserForm({ ...userForm, isActive: e.target.checked })
                    }
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {selectedUser ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;

