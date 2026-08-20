import * as authService from './auth.service.js';

export async function register(req, res, next) {
  try {
    const result = await authService.registerUser(req.body);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
      message: 'Login successful',
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
