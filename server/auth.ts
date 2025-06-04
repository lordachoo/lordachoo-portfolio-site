import crypto from "crypto";
import { storage } from "./storage";
import type { Request, Response, NextFunction } from "express";

// Generate salt for password hashing
export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Hash password with salt
export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const hashToCheck = hashPassword(password, salt);
  return hashToCheck === hash;
}

// Generate session ID
export function generateSessionId(): string {
  return crypto.randomUUID();
}

// Change admin password
export async function changeAdminPassword(currentPassword: string, newPassword: string): Promise<boolean> {
  try {
    const adminUser = await storage.getAdminByUsername("admin");
    if (!adminUser) {
      throw new Error("Admin user not found");
    }

    // Verify current password
    if (!verifyPassword(currentPassword, adminUser.passwordHash, adminUser.salt)) {
      throw new Error("Invalid current password");
    }

    // Generate new salt and hash
    const newSalt = generateSalt();
    const newHash = hashPassword(newPassword, newSalt);

    // Update admin user with new password
    await storage.updateAdminPassword(adminUser.id, newHash, newSalt);
    
    return true;
  } catch (error) {
    throw error;
  }
}

// Middleware to check authentication
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const sessionId = (req as any).cookies?.adminSessionId;
    
    if (!sessionId) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const session = await storage.getAdminSession(sessionId);
    
    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await storage.deleteAdminSession(sessionId);
      }
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Attach user info to request
    (req as any).adminSession = session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ error: "Authentication error" });
  }
}

// Create admin user (for initial setup)
export async function createAdminUser(username: string, password: string) {
  const salt = generateSalt();
  const passwordHash = hashPassword(password, salt);
  
  return await storage.createAdminUser({
    username,
    passwordHash,
    salt,
    isActive: true,
  });
}

// Login admin user
export async function loginAdmin(username: string, password: string) {
  const user = await storage.getAdminByUsername(username);
  
  if (!user || !user.isActive) {
    throw new Error("Invalid credentials");
  }
  
  if (!verifyPassword(password, user.passwordHash, user.salt)) {
    throw new Error("Invalid credentials");
  }
  
  // Create session
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  const session = await storage.createAdminSession({
    id: sessionId,
    userId: user.id,
    expiresAt,
  });
  
  // Update last login
  await storage.updateAdminLastLogin(user.id);
  
  return { session, user: { id: user.id, username: user.username } };
}

// Logout admin user
export async function logoutAdmin(sessionId: string) {
  await storage.deleteAdminSession(sessionId);
}