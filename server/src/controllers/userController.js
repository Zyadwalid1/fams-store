import User from '../models/User.js';
import Address from '../models/Address.js';
import OTP from '../models/OTP.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../middleware/errorMiddleware.js';
import { generateOTP, sendOTPEmail } from '../utils/emailService.js';
import { recordLoginAttempt } from './loginHistoryController.js';

// Load environment variables
dotenv.config();

// Debug: Check if JWT_SECRET is loaded
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Not loaded');

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword, mobile } = req.body;

    // Validate required fields
    if (!name || !email || !password || !confirmPassword || !mobile) {
      throw new AppError('Please provide all required fields', 400);
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Check if user exists
    const userExists = await User.findOne({ $or: [{ email }, { mobile }] });
    if (userExists) {
      throw new AppError('User with this email or mobile number already exists', 400);
    }

    // Create unverified user
    const user = await User.create({
      name,
      email,
      password,
      mobile,
      isVerified: false
    });

    // Generate and send OTP
    const otp = generateOTP();
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send verification email
    await sendOTPEmail(email, otp);

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with OTP
// @route   POST /api/users/verify-email
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw new AppError('Email and OTP are required', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Update user verification status using the new method
    const verifiedUser = await user.verifyEmail();

    // Delete used OTP
    await OTP.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. Please login to continue.',
      user: {
        id: verifiedUser._id,
        name: verifiedUser.name,
        email: verifiedUser.email,
        mobile: verifiedUser.mobile,
        role: verifiedUser.role,
        isVerified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification OTP
// @route   POST /api/users/resend-otp
// @access  Public
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.isVerified) {
      throw new AppError('Email already verified', 400);
    }

    // Generate new OTP
    const otp = generateOTP();
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send new verification email
    await sendOTPEmail(email, otp);

    res.status(200).json({
      success: true,
      message: 'New verification code sent successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate inputs
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    // Check for user email
    const user = await User.findOne({ email }).select('+password'); // Explicitly include password
    if (!user) {
      // Record failed login attempt with null user ID
      await recordLoginAttempt(null, req, 'failed');
      throw new AppError('Invalid credentials', 401);
    }

    // Check if password exists in user document
    if (!user.password) {
      console.error('User has no password hash:', user._id);
      // Record failed login attempt
      await recordLoginAttempt(user._id, req, 'failed');
      throw new AppError('This account cannot use password login. Try social login instead.', 401);
    }

    // Check if password matches
    try {
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        // Record failed login attempt
        await recordLoginAttempt(user._id, req, 'failed');
        throw new AppError('Invalid credentials', 401);
      }
    } catch (err) {
      console.error('Password match error:', err);
      // Record failed login attempt
      await recordLoginAttempt(user._id, req, 'failed');
      throw new AppError('Authentication error', 500);
    }

    // Record successful login
    await recordLoginAttempt(user._id, req, 'success');

    // Generate access token
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_EXPIRY_TIME || '1h' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.REFRESH_EXPIRY_TIME || '7d' }
    );

    // Save refresh token to user document
    user.refreshToken = refreshToken;
    await user.save();

    // Set refresh token as HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh access token
// @route   POST /api/users/refresh-token
// @access  Public
export const refreshToken = async (req, res, next) => {
  try {
    console.log('Cookies received:', req.cookies);
    console.log('Headers:', req.headers);

    let token = req.cookies.refreshToken;

    // Try to get token from authorization header if not in cookies
    if (!token && req.headers.cookie) {
      const cookieHeader = req.headers.cookie;
      const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {});
      token = cookies.refreshToken;
    }

    if (!token) {
      throw new AppError('No refresh token provided', 401);
    }

    console.log('Token found:', token);

    // Verify refresh token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);

    // Find user with refresh token
    const user = await User.findOne({ 
      _id: decoded.id,
      refreshToken: token
    });

    if (!user) {
      throw new AppError('Invalid refresh token', 401);
    }

    // Generate new access token
    const accessToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.ACCESS_EXPIRY_TIME || '1h' }
    );

    res.status(200).json({
      success: true,
      accessToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate({
        path: 'addresses',
        select: 'street city governorate postalCode isDefault'
      });
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        addresses: user.addresses,
        isVerified: user.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Basic info update
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.mobile = req.body.mobile || user.mobile;

    const updatedUser = await user.save();

    // Fetch user with populated addresses
    const populatedUser = await User.findById(updatedUser._id)
      .select('-password')
      .populate({
        path: 'addresses',
        select: 'street city governorate postalCode isDefault'
      });

    res.status(200).json({
      success: true,
      user: {
        id: populatedUser._id,
        name: populatedUser.name,
        email: populatedUser.email,
        mobile: populatedUser.mobile,
        role: populatedUser.role,
        addresses: populatedUser.addresses,
        isVerified: populatedUser.isVerified
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const { street, city, governorate, postalCode, isDefault } = req.body;

    // Validate required fields
    if (!street || !city || !governorate || !postalCode) {
      throw new AppError('Please provide all address fields: street, city, governorate, and postalCode', 400);
    }

    // If this is set as default, unset any existing default address
    if (isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    // Create new address
    const address = await Address.create({
      street,
      city,
      governorate,
      postalCode,
      isDefault: isDefault || false,
      user: req.user.id
    });

    // Add address to user's addresses array
    const user = await User.findById(req.user.id);
    user.addresses.push(address._id);
    await user.save();

    res.status(201).json({
      success: true,
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  try {
    const { street, city, governorate, postalCode, isDefault } = req.body;
    const addressId = req.params.id;

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    // If setting as default, unset any existing default address
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { user: req.user.id, isDefault: true },
        { isDefault: false }
      );
    }

    // Update address fields
    address.street = street || address.street;
    address.city = city || address.city;
    address.governorate = governorate || address.governorate;
    address.postalCode = postalCode || address.postalCode;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      address
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const addressId = req.params.id;

    const address = await Address.findOne({
      _id: addressId,
      user: req.user.id
    });

    if (!address) {
      throw new AppError('Address not found', 404);
    }

    // Remove address from user's addresses array
    const user = await User.findById(req.user.id);
    user.addresses = user.addresses.filter(addr => addr.toString() !== addressId);
    await user.save();

    // Delete the address
    await Address.deleteOne({ _id: addressId });

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all addresses
// @route   GET /api/users/addresses
// @access  Private
export const getAddresses = async (req, res, next) => {
  try {
    // First, get the user to check their addresses array
    const user = await User.findById(req.user.id);
    
    // Get all valid addresses for this user
    const validAddresses = await Address.find({ 
      _id: { $in: user.addresses },
      user: req.user.id 
    })
    .select('street city governorate postalCode isDefault')
    .sort({ isDefault: -1 });

    // Clean up user's addresses array to remove any invalid references
    const validAddressIds = validAddresses.map(addr => addr._id);
    if (user.addresses.length !== validAddressIds.length) {
      user.addresses = validAddressIds;
      await user.save();
    }

    res.status(200).json({
      success: true,
      count: validAddresses.length,
      addresses: validAddresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/users/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Generate OTP
    const otp = generateOTP();
    await OTP.findOneAndUpdate(
      { email },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send password reset email
    await sendOTPEmail(email, otp, 'reset-password');

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password with OTP
// @route   POST /api/users/reset-password
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;

    if (!email || !otp || !newPassword || !confirmPassword) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('Passwords do not match', 400);
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Verify OTP
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      throw new AppError('Invalid or expired OTP', 400);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Delete used OTP
    await OTP.deleteOne({ email });

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please login with your new password.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Password (from profile)
// @route   PUT /api/users/update-password
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      throw new AppError('Please provide all required fields', 400);
    }

    if (newPassword !== confirmPassword) {
      throw new AppError('New passwords do not match', 400);
    }

    // Get user with password field included
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      throw new AppError('Current password is incorrect', 401);
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    next(error);
  }
};
