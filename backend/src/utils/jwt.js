import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * Generates a JWT token
 * @param {object} payload - Data to include in the token
 * @returns {string} - The generated JWT token
 */
export function generateToken(payload) {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn
  });
}

export function verifyToken(token) {
  return jwt.verify(token, config.jwt.secret);
}
