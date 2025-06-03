import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, loginAdmin, logoutAdmin, createAdminUser } from "./auth";
import { z } from "zod";
import { 
  insertNavigationItemSchema, insertContentSectionSchema, insertBlogPostSchema,
  insertExperienceSchema, insertEducationSchema, insertSkillCategorySchema,
  insertSkillSchema, insertProjectSchema, insertProfileSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize admin user if none exists
  try {
    const existingAdmin = await storage.getAdminByUsername("admin");
    if (!existingAdmin) {
      await createAdminUser("admin", "admin123");
      console.log("Created default admin user: admin/admin123");
    }
  } catch (error) {
    console.log("Admin user setup will be handled after database is ready");
  }

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const result = await loginAdmin(username, password);
      
      // Set session cookie
      res.cookie('adminSessionId', result.session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      res.json({ 
        success: true,
        user: result.user 
      });
    } catch (error) {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.post("/api/auth/logout", async (req: any, res) => {
    try {
      const sessionId = req.cookies?.adminSessionId;
      
      if (sessionId) {
        await logoutAdmin(sessionId);
      }
      
      // Always clear the session cookie
      res.clearCookie('adminSessionId', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.json({ message: "Logged out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/auth/me", requireAuth, async (req: any, res) => {
    try {
      const session = req.adminSession;
      const user = await storage.getAdminByUsername("admin");
      res.json({ user: { id: user?.id, username: user?.username } });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user info" });
    }
  });

  // Public endpoints (no authentication required)
  // Navigation endpoints
  app.get("/api/navigation", async (req, res) => {
    try {
      const items = await storage.getNavigationItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch navigation items" });
    }
  });

  // Protected admin endpoints (require authentication)
  app.post("/api/navigation", requireAuth, async (req, res) => {
    try {
      const data = insertNavigationItemSchema.parse(req.body);
      const item = await storage.createNavigationItem(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create navigation item" });
      }
    }
  });

  app.put("/api/navigation/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertNavigationItemSchema.partial().parse(req.body);
      const item = await storage.updateNavigationItem(id, data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update navigation item" });
      }
    }
  });

  app.delete("/api/navigation/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNavigationItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete navigation item" });
    }
  });

  // Protected admin endpoints (require authentication)
  app.post("/api/navigation", requireAuth, async (req, res) => {
    try {
      const data = insertNavigationItemSchema.parse(req.body);
      const item = await storage.createNavigationItem(data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create navigation item" });
      }
    }
  });

  app.put("/api/navigation/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertNavigationItemSchema.partial().parse(req.body);
      const item = await storage.updateNavigationItem(id, data);
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update navigation item" });
      }
    }
  });

  app.delete("/api/navigation/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteNavigationItem(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete navigation item" });
    }
  });

  // Content sections endpoints (public read access)
  app.get("/api/content/:sectionKey", async (req, res) => {
    try {
      const section = await storage.getContentSection(req.params.sectionKey);
      if (!section) {
        res.status(404).json({ error: "Section not found" });
        return;
      }
      res.json(section);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content section" });
    }
  });

  app.put("/api/education/api/content/:sectionKey", requireAuth, requireAuth, async (req, res) => {
    try {
      const data = insertContentSectionSchema.parse({
        ...req.body,
        sectionKey: req.params.sectionKey,
      });
      const section = await storage.upsertContentSection(data);
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content section" });
      }
    }
  });

  app.put("/api/content/:sectionKey", requireAuth, async (req, res) => {
    try {
      const data = insertContentSectionSchema.parse({
        ...req.body,
        sectionKey: req.params.sectionKey,
      });
      const section = await storage.upsertContentSection(data);
      res.json(section);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content section" });
      }
    }
  });

  // Blog posts endpoints (public read access)
  app.get("/api/blog", async (req, res) => {
    try {
      const published = req.query.published ? req.query.published === 'true' : undefined;
      const posts = await storage.getBlogPosts(published);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog posts" });
    }
  });

  app.get("/api/blog/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getBlogPost(id);
      if (!post) {
        res.status(404).json({ error: "Blog post not found" });
        return;
      }
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog post" });
    }
  });

  app.post("/api/education/api/blog", requireAuth, requireAuth, async (req, res) => {
    try {
      const data = insertBlogPostSchema.parse(req.body);
      const post = await storage.createBlogPost(data);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create blog post" });
      }
    }
  });

  app.put("/api/education/api/blog/:id", requireAuth, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertBlogPostSchema.partial().parse(req.body);
      const post = await storage.updateBlogPost(id, data);
      res.json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update blog post" });
      }
    }
  });

  app.delete("/api/education/api/blog/:id", requireAuth, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteBlogPost(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete blog post" });
    }
  });

  // Experience endpoints (public read access)
  app.get("/api/experience", async (req, res) => {
    try {
      const experiences = await storage.getExperiences();
      res.json(experiences);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch experiences" });
    }
  });

  app.post("/api/education/api/experience", requireAuth, requireAuth, async (req, res) => {
    try {
      const data = insertExperienceSchema.parse(req.body);
      const experience = await storage.createExperience(data);
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create experience" });
      }
    }
  });

  app.put("/api/education/api/experience/:id", requireAuth, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertExperienceSchema.partial().parse(req.body);
      const experience = await storage.updateExperience(id, data);
      res.json(experience);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update experience" });
      }
    }
  });

  app.delete("/api/education/api/experience/:id", requireAuth, requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteExperience(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete experience" });
    }
  });

  // Education endpoints (public read access)
  app.get("/api/education", async (req, res) => {
    try {
      const education = await storage.getEducation();
      res.json(education);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch education" });
    }
  });

  app.post("/api/education/api/education", requireAuth, async (req, res) => {
    try {
      const data = insertEducationSchema.parse(req.body);
      const education = await storage.createEducation(data);
      res.json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create education" });
      }
    }
  });

  app.put("/api/education/api/education/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertEducationSchema.partial().parse(req.body);
      const education = await storage.updateEducation(id, data);
      res.json(education);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update education" });
      }
    }
  });

  app.delete("/api/education/api/education/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEducation(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete education" });
    }
  });

  // Skills endpoints (public read access)
  app.get("/api/skills", async (req, res) => {
    try {
      const skills = await storage.getSkillsWithCategories();
      res.json(skills);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch skills" });
    }
  });

  app.post("/api/education/api/skills/categories", requireAuth, async (req, res) => {
    try {
      const data = insertSkillCategorySchema.parse(req.body);
      const category = await storage.createSkillCategory(data);
      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create skill category" });
      }
    }
  });

  app.post("/api/education/api/skills", requireAuth, async (req, res) => {
    try {
      const data = insertSkillSchema.parse(req.body);
      const skill = await storage.createSkill(data);
      res.json(skill);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create skill" });
      }
    }
  });

  // Projects endpoints (public read access)
  app.get("/api/projects", async (req, res) => {
    try {
      const featured = req.query.featured ? req.query.featured === 'true' : undefined;
      const projects = await storage.getProjects(featured);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch projects" });
    }
  });

  app.post("/api/education/api/projects", requireAuth, async (req, res) => {
    try {
      const data = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(data);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create project" });
      }
    }
  });

  app.put("/api/education/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertProjectSchema.partial().parse(req.body);
      const project = await storage.updateProject(id, data);
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update project" });
      }
    }
  });

  app.delete("/api/education/api/projects/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete project" });
    }
  });

  // Profile endpoints (public read access)
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getProfile();
      if (!profile) {
        res.status(404).json({ error: "Profile not found" });
        return;
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.put("/api/education/api/profile", requireAuth, async (req, res) => {
    try {
      const data = insertProfileSchema.parse(req.body);
      const profile = await storage.upsertProfile(data);
      res.json(profile);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update profile" });
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
