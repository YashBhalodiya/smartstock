import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const result = await authService.verifyEmailCode(req.body);
    return res.status(200).json({
      success: true,
      message: 'Account email successfully verified',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const result = await authService.loginUser(req.body);
    return res.status(200).json({
      success: true,
      message: result.requiresVerification ? 'Email verification code required' : (result.requires2FA ? '2-Step verification code required' : 'Login successful'),
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function verify2FA(req, res, next) {
  try {
    const result = await authService.verifyTwoFactorCode(req.body);
    return res.status(200).json({
      success: true,
      message: '2-Step verification successful',
      data: result
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Authenticated user profile retrieved successfully',
      data: {
        user: req.user
      }
    });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(req, res, next) {
  try {
    const user = await authService.updateUserProfile(req.user.id, req.body);
    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: { user }
    });
  } catch (err) {
    next(err);
  }
}
