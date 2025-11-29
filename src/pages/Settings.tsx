import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Autocomplete,
  InputAdornment,
} from '@mui/material';
import {
  Save as SaveIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Phone as PhoneIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/api';
import { getErrorMessage } from '../utils/uploadHelpers';
import { PageHeader } from '../components/common/PageHeader';
import logger from '../utils/logger';

// Comprehensive country codes list with flags - moved outside component for stability
const COUNTRY_CODES = [
  { code: '+1', country: 'United States', flag: '🇺🇸', shortName: 'US' },
  { code: '+1', country: 'Canada', flag: '🇨🇦', shortName: 'CA' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧', shortName: 'UK' },
  { code: '+91', country: 'India', flag: '🇮🇳', shortName: 'IN' },
  { code: '+86', country: 'China', flag: '🇨🇳', shortName: 'CN' },
  { code: '+81', country: 'Japan', flag: '🇯🇵', shortName: 'JP' },
  { code: '+49', country: 'Germany', flag: '🇩🇪', shortName: 'DE' },
  { code: '+33', country: 'France', flag: '🇫🇷', shortName: 'FR' },
  { code: '+39', country: 'Italy', flag: '🇮🇹', shortName: 'IT' },
  { code: '+34', country: 'Spain', flag: '🇪🇸', shortName: 'ES' },
  { code: '+61', country: 'Australia', flag: '🇦🇺', shortName: 'AU' },
  { code: '+55', country: 'Brazil', flag: '🇧🇷', shortName: 'BR' },
  { code: '+7', country: 'Russia', flag: '🇷🇺', shortName: 'RU' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷', shortName: 'KR' },
  { code: '+31', country: 'Netherlands', flag: '🇳🇱', shortName: 'NL' },
  { code: '+46', country: 'Sweden', flag: '🇸🇪', shortName: 'SE' },
  { code: '+47', country: 'Norway', flag: '🇳🇴', shortName: 'NO' },
  { code: '+45', country: 'Denmark', flag: '🇩🇰', shortName: 'DK' },
  { code: '+41', country: 'Switzerland', flag: '🇨🇭', shortName: 'CH' },
  { code: '+43', country: 'Austria', flag: '🇦🇹', shortName: 'AT' },
  { code: '+32', country: 'Belgium', flag: '🇧🇪', shortName: 'BE' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹', shortName: 'PT' },
  { code: '+30', country: 'Greece', flag: '🇬🇷', shortName: 'GR' },
  { code: '+48', country: 'Poland', flag: '🇵🇱', shortName: 'PL' },
  { code: '+420', country: 'Czech Republic', flag: '🇨🇿', shortName: 'CZ' },
  { code: '+36', country: 'Hungary', flag: '🇭🇺', shortName: 'HU' },
  { code: '+40', country: 'Romania', flag: '🇷🇴', shortName: 'RO' },
  { code: '+385', country: 'Croatia', flag: '🇭🇷', shortName: 'HR' },
  { code: '+386', country: 'Slovenia', flag: '🇸🇮', shortName: 'SI' },
  { code: '+421', country: 'Slovakia', flag: '🇸🇰', shortName: 'SK' },
  { code: '+370', country: 'Lithuania', flag: '🇱🇹', shortName: 'LT' },
  { code: '+371', country: 'Latvia', flag: '🇱🇻', shortName: 'LV' },
  { code: '+372', country: 'Estonia', flag: '🇪🇪', shortName: 'EE' },
  { code: '+358', country: 'Finland', flag: '🇫🇮', shortName: 'FI' },
  { code: '+353', country: 'Ireland', flag: '🇮🇪', shortName: 'IE' },
  { code: '+356', country: 'Malta', flag: '🇲🇹', shortName: 'MT' },
  { code: '+357', country: 'Cyprus', flag: '🇨🇾', shortName: 'CY' },
  { code: '+377', country: 'Monaco', flag: '🇲🇨', shortName: 'MC' },
  { code: '+378', country: 'San Marino', flag: '🇸🇲', shortName: 'SM' },
  { code: '+39', country: 'Vatican City', flag: '🇻🇦', shortName: 'VA' },
  { code: '+423', country: 'Liechtenstein', flag: '🇱🇮', shortName: 'LI' },
  { code: '+354', country: 'Iceland', flag: '🇮🇸', shortName: 'IS' },
  { code: '+298', country: 'Faroe Islands', flag: '🇫🇴', shortName: 'FO' },
  { code: '+299', country: 'Greenland', flag: '🇬🇱', shortName: 'GL' },
  { code: '+52', country: 'Mexico', flag: '🇲🇽', shortName: 'MX' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷', shortName: 'AR' },
  { code: '+56', country: 'Chile', flag: '🇨🇱', shortName: 'CL' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴', shortName: 'CO' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪', shortName: 'VE' },
  { code: '+51', country: 'Peru', flag: '🇵🇪', shortName: 'PE' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨', shortName: 'EC' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾', shortName: 'PY' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾', shortName: 'UY' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴', shortName: 'BO' },
  { code: '+592', country: 'Guyana', flag: '🇬🇾', shortName: 'GY' },
  { code: '+597', country: 'Suriname', flag: '🇸🇷', shortName: 'SR' },
  { code: '+594', country: 'French Guiana', flag: '🇬🇫', shortName: 'GF' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬', shortName: 'EG' },
  { code: '+27', country: 'South Africa', flag: '🇿🇦', shortName: 'ZA' },
  { code: '+234', country: 'Nigeria', flag: '🇳🇬', shortName: 'NG' },
  { code: '+254', country: 'Kenya', flag: '🇰🇪', shortName: 'KE' },
  { code: '+233', country: 'Ghana', flag: '🇬🇭', shortName: 'GH' },
  { code: '+256', country: 'Uganda', flag: '🇺🇬', shortName: 'UG' },
  { code: '+255', country: 'Tanzania', flag: '🇹🇿', shortName: 'TZ' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦', shortName: 'MA' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿', shortName: 'DZ' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳', shortName: 'TN' },
  { code: '+218', country: 'Libya', flag: '🇱🇾', shortName: 'LY' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩', shortName: 'SD' },
  { code: '+251', country: 'Ethiopia', flag: '🇪🇹', shortName: 'ET' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭', shortName: 'TH' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬', shortName: 'SG' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾', shortName: 'MY' },
  { code: '+62', country: 'Indonesia', flag: '🇮🇩', shortName: 'ID' },
  { code: '+63', country: 'Philippines', flag: '🇵🇭', shortName: 'PH' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳', shortName: 'VN' },
  { code: '+855', country: 'Cambodia', flag: '🇰🇭', shortName: 'KH' },
  { code: '+856', country: 'Laos', flag: '🇱🇦', shortName: 'LA' },
  { code: '+95', country: 'Myanmar', flag: '🇲🇲', shortName: 'MM' },
  { code: '+880', country: 'Bangladesh', flag: '🇧🇩', shortName: 'BD' },
  { code: '+92', country: 'Pakistan', flag: '🇵🇰', shortName: 'PK' },
  { code: '+94', country: 'Sri Lanka', flag: '🇱🇰', shortName: 'LK' },
  { code: '+977', country: 'Nepal', flag: '🇳🇵', shortName: 'NP' },
  { code: '+975', country: 'Bhutan', flag: '🇧🇹', shortName: 'BT' },
  { code: '+960', country: 'Maldives', flag: '🇲🇻', shortName: 'MV' },
  { code: '+98', country: 'Iran', flag: '🇮🇷', shortName: 'IR' },
  { code: '+964', country: 'Iraq', flag: '🇮🇶', shortName: 'IQ' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦', shortName: 'SA' },
  { code: '+971', country: 'UAE', flag: '🇦🇪', shortName: 'AE' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦', shortName: 'QA' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭', shortName: 'BH' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼', shortName: 'KW' },
  { code: '+968', country: 'Oman', flag: '🇴🇲', shortName: 'OM' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪', shortName: 'YE' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴', shortName: 'JO' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧', shortName: 'LB' },
  { code: '+963', country: 'Syria', flag: '🇸🇾', shortName: 'SY' },
  { code: '+972', country: 'Israel', flag: '🇮🇱', shortName: 'IL' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸', shortName: 'PS' },
  { code: '+90', country: 'Turkey', flag: '🇹🇷', shortName: 'TR' },
  { code: '+374', country: 'Armenia', flag: '🇦🇲', shortName: 'AM' },
  { code: '+375', country: 'Belarus', flag: '🇧🇾', shortName: 'BY' },
  { code: '+380', country: 'Ukraine', flag: '🇺🇦', shortName: 'UA' },
  { code: '+373', country: 'Moldova', flag: '🇲🇩', shortName: 'MD' },
  { code: '+995', country: 'Georgia', flag: '🇬🇪', shortName: 'GE' },
  { code: '+994', country: 'Azerbaijan', flag: '🇦🇿', shortName: 'AZ' },
  { code: '+996', country: 'Kyrgyzstan', flag: '🇰🇬', shortName: 'KG' },
  { code: '+998', country: 'Uzbekistan', flag: '🇺🇿', shortName: 'UZ' },
  { code: '+992', country: 'Tajikistan', flag: '🇹🇯', shortName: 'TJ' },
  { code: '+993', country: 'Turkmenistan', flag: '🇹🇲', shortName: 'TM' },
  { code: '+7', country: 'Kazakhstan', flag: '🇰🇿', shortName: 'KZ' },
  { code: '+976', country: 'Mongolia', flag: '🇲🇳', shortName: 'MN' },
  { code: '+852', country: 'Hong Kong', flag: '🇭🇰', shortName: 'HK' },
  { code: '+853', country: 'Macau', flag: '🇲🇴', shortName: 'MO' },
  { code: '+886', country: 'Taiwan', flag: '🇹🇼', shortName: 'TW' },
  { code: '+850', country: 'North Korea', flag: '🇰🇵', shortName: 'KP' },
];

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [originalProfileForm, setOriginalProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
  });
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '', // Keep for display but make field read-only
    countryCode: '+1',
    phoneNumber: '',
  });

  // Enhanced phone number parsing function
  const parsePhoneNumber = (
    phoneString: string,
  ): { countryCode: string; phoneNumber: string } => {
    if (!phoneString || !phoneString.startsWith('+')) {
      return { countryCode: '+1', phoneNumber: '' };
    }

    // Try to match against known country codes, starting with longest codes first
    const sortedCodes = COUNTRY_CODES.map((c) => c.code).sort(
      (a, b) => b.length - a.length,
    );

    for (const code of sortedCodes) {
      if (phoneString.startsWith(code)) {
        return {
          countryCode: code,
          phoneNumber: phoneString.substring(code.length).trim(),
        };
      }
    }

    // Fallback to default
    return { countryCode: '+1', phoneNumber: phoneString.substring(1) };
  };

  useEffect(() => {
    if (user) {
      // Parse phone number if it exists
      const { countryCode, phoneNumber } = user.phone
        ? parsePhoneNumber(user.phone)
        : { countryCode: '+1', phoneNumber: '' };

      const initialData = {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '', // Keep for display but make field read-only
        countryCode,
        phoneNumber,
      };

      setProfileForm(initialData);
      setOriginalProfileForm(initialData);
    }
  }, [user]);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const showNotification = (
    message: string,
    type: 'success' | 'error' = 'success',
  ) => {
    setNotification({ open: true, message, type });
  };

  // Check if profile form has changes
  const hasProfileChanges = () => {
    return (
      profileForm.firstName !== originalProfileForm.firstName ||
      profileForm.lastName !== originalProfileForm.lastName ||
      profileForm.countryCode !== originalProfileForm.countryCode ||
      profileForm.phoneNumber !== originalProfileForm.phoneNumber
    );
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelEdit = () => {
    setProfileForm(originalProfileForm);
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);

      const fullPhoneNumber = profileForm.phoneNumber
        ? `${profileForm.countryCode}${profileForm.phoneNumber}`
        : '';

      const updateData = {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: fullPhoneNumber,
      };

      const response = await api.patch('/auth/profile', updateData);

      if (response.status === 200) {
        showNotification('Profile updated successfully!');
        setOriginalProfileForm(profileForm);
        setIsEditingProfile(false);
      } else {
        const errorData = response.data;
        showNotification(errorData?.message || 'Failed to update profile', 'error');
      }
    } catch (error) {
      logger.error('Error updating profile:', error);
      showNotification(getErrorMessage(error), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('Passwords do not match', 'error');
      return;
    }

    try {
      setPasswordLoading(true);
      const response = await api.post('/auth/change-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      if (response.status === 200 || response.status === 201) {
        showNotification('Password changed successfully!');
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorData = response.data;
        showNotification(errorData?.message || 'Failed to change password', 'error');
      }
    } catch (error) {
      logger.error('Error changing password:', error);
      showNotification(getErrorMessage(error), 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        maxWidth: '1200px',
        margin: '0 auto',
        minHeight: '100vh',
      }}
    >
      <PageHeader
        title="Settings"
        subtitle="Manage your profile and security preferences"
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Profile Settings Section */}
        <Card
          sx={{
            borderRadius: 2.5,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(200, 121, 65, 0.08)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <PersonIcon sx={{ mr: 2, color: '#C87941', fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: '#3e2723' }}
              >
                Profile Information
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <TextField
                  fullWidth
                  label="First Name"
                  value={profileForm.firstName}
                  onChange={(e) => {
                    setProfileForm({
                      ...profileForm,
                      firstName: e.target.value,
                    });
                    if (!isEditingProfile) setIsEditingProfile(true);
                  }}
                  disabled={!isEditingProfile}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profileForm.lastName}
                  onChange={(e) => {
                    setProfileForm({
                      ...profileForm,
                      lastName: e.target.value,
                    });
                    if (!isEditingProfile) setIsEditingProfile(true);
                  }}
                  disabled={!isEditingProfile}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
              <TextField
                fullWidth
                label="Email"
                value={profileForm.email}
                disabled
                inputProps={{ readOnly: true, autoComplete: 'off' }}
                helperText="Email cannot be changed"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />

              {/* Phone Number with Country Code */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  flexDirection: { xs: 'column', sm: 'row' },
                }}
              >
                <Autocomplete
                  id="country-code-select"
                  options={COUNTRY_CODES}
                  getOptionLabel={(option) =>
                    `${option.flag} ${option.code} ${option.country}`
                  }
                  value={
                    COUNTRY_CODES.find(
                      (item) => item.code === profileForm.countryCode,
                    ) || null
                  }
                  onChange={(_, newValue) => {
                    setProfileForm({
                      ...profileForm,
                      countryCode: newValue ? newValue.code : '+1',
                    });
                    if (!isEditingProfile) setIsEditingProfile(true);
                  }}
                  disabled={!isEditingProfile}
                  renderOption={(props, option) => {
                    const { key, ...otherProps } = props;
                    return (
                      <Box
                        component="li"
                        key={key}
                        sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
                        {...otherProps}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                          }}
                        >
                          <Box sx={{ fontSize: '1.2em' }}>{option.flag}</Box>
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              minWidth: 0,
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {option.code}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ lineHeight: 1 }}
                            >
                              {option.country}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Country Code"
                      sx={{
                        minWidth: { xs: '100%', sm: 250 },
                        '& .MuiOutlinedInput-root': { borderRadius: 2 },
                      }}
                    />
                  )}
                  sx={{ minWidth: { xs: '100%', sm: 250 } }}
                  size="medium"
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={profileForm.phoneNumber}
                  onChange={(e) => {
                    // Allow only numbers, spaces, hyphens, and parentheses
                    const value = e.target.value.replace(/[^\d\s\-()]/g, '');
                    setProfileForm({
                      ...profileForm,
                      phoneNumber: value,
                    });
                    if (!isEditingProfile) setIsEditingProfile(true);
                  }}
                  disabled={!isEditingProfile}
                  placeholder="Enter phone number"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: 'primary.main' }} />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Enter phone number without country code"
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                mt: 4,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2,
              }}
            >
              {!isEditingProfile ? (
                <Button
                  variant="contained"
                  startIcon={<PersonIcon />}
                  onClick={handleEditProfile}
                  sx={{
                    backgroundColor: 'primary.main',
                    '&:hover': { backgroundColor: 'primary.dark' },
                    borderRadius: 2,
                    py: 1.5,
                    px: 4,
                    fontWeight: 600,
                  }}
                >
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    sx={{
                      borderColor: 'text.secondary',
                      color: 'text.secondary',
                      '&:hover': {
                        borderColor: 'text.primary',
                        color: 'text.primary',
                      },
                      borderRadius: 2,
                      py: 1.5,
                      px: 3,
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveProfile}
                    disabled={loading || !hasProfileChanges()}
                    sx={{
                      backgroundColor: '#C87941',
                      '&:hover': { backgroundColor: '#A45F2D' },
                      borderRadius: 2,
                      py: 1.5,
                      px: 4,
                      fontWeight: 600,
                    }}
                  >
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Security Settings Section */}
        <Card
          sx={{
            borderRadius: 2.5,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.04)',
            border: '1px solid rgba(200, 121, 65, 0.08)',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
              <SecurityIcon sx={{ mr: 2, color: '#C87941', fontSize: 32 }} />
              <Typography
                variant="h5"
                sx={{ fontWeight: 600, color: '#3e2723' }}
              >
                Security Settings
              </Typography>
            </Box>

            <Alert
              severity="info"
              sx={{
                mb: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                color: '#5d4037',
                '& .MuiAlert-icon': {
                  color: '#C87941',
                },
              }}
            >
              Choose a strong password with at least 6 characters.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Current Password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    currentPassword: e.target.value,
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="New Password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    newPassword: e.target.value,
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
              <TextField
                fullWidth
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Box>

            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleChangePassword}
                disabled={
                  passwordLoading ||
                  !passwordForm.currentPassword ||
                  !passwordForm.newPassword ||
                  !passwordForm.confirmPassword
                }
                sx={{
                  backgroundColor: '#A45F2D',
                  '&:hover': { backgroundColor: '#C87941' },
                  borderRadius: 2,
                  py: 1.5,
                  px: 4,
                  fontWeight: 600,
                }}
              >
                {passwordLoading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        sx={{ zIndex: 99999, position: 'fixed' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.type}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;
