import { 
  navigationItems, contentSections, blogPosts, experiences, education, 
  skillCategories, skills, projects, profile, adminUsers, adminSessions,
  type NavigationItem, type InsertNavigationItem,
  type ContentSection, type InsertContentSection,
  type BlogPost, type InsertBlogPost,
  type Experience, type InsertExperience,
  type Education, type InsertEducation,
  type SkillCategory, type InsertSkillCategory,
  type Skill, type InsertSkill,
  type Project, type InsertProject,
  type Profile, type InsertProfile,
  type AdminUser, type InsertAdminUser,
  type AdminSession, type InsertAdminSession
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc } from "drizzle-orm";

export interface IStorage {
  // Admin authentication operations
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  createAdminSession(session: InsertAdminSession): Promise<AdminSession>;
  getAdminSession(sessionId: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionId: string): Promise<void>;
  updateAdminLastLogin(userId: number): Promise<void>;
  updateAdminPassword(userId: number, passwordHash: string, salt: string): Promise<void>;

  // Navigation
  getNavigationItems(): Promise<NavigationItem[]>;
  createNavigationItem(item: InsertNavigationItem): Promise<NavigationItem>;
  updateNavigationItem(id: number, item: Partial<InsertNavigationItem>): Promise<NavigationItem>;
  deleteNavigationItem(id: number): Promise<void>;

  // Content sections
  getContentSection(sectionKey: string): Promise<ContentSection | undefined>;
  upsertContentSection(section: InsertContentSection): Promise<ContentSection>;

  // Blog posts
  getBlogPosts(published?: boolean): Promise<BlogPost[]>;
  getBlogPost(id: number): Promise<BlogPost | undefined>;
  getBlogPostBySlug(slug: string): Promise<BlogPost | undefined>;
  createBlogPost(post: InsertBlogPost): Promise<BlogPost>;
  updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost>;
  deleteBlogPost(id: number): Promise<void>;

  // Experience
  getExperiences(): Promise<Experience[]>;
  createExperience(experience: InsertExperience): Promise<Experience>;
  updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience>;
  deleteExperience(id: number): Promise<void>;

  // Education
  getEducation(): Promise<Education[]>;
  createEducation(edu: InsertEducation): Promise<Education>;
  updateEducation(id: number, edu: Partial<InsertEducation>): Promise<Education>;
  deleteEducation(id: number): Promise<void>;

  // Skills
  getSkillCategories(): Promise<SkillCategory[]>;
  getSkillsWithCategories(): Promise<(SkillCategory & { skills: Skill[] })[]>;
  createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory>;
  updateSkillCategory(id: number, category: Partial<InsertSkillCategory>): Promise<SkillCategory>;
  deleteSkillCategory(id: number): Promise<void>;
  
  createSkill(skill: InsertSkill): Promise<Skill>;
  updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill>;
  deleteSkill(id: number): Promise<void>;

  // Projects
  getProjects(featured?: boolean): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;

  // Profile
  getProfile(): Promise<Profile | undefined>;
  upsertProfile(profileData: InsertProfile): Promise<Profile>;
}

export class DatabaseStorage implements IStorage {
  // Admin authentication operations
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user;
  }

  async createAdminUser(userData: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db.insert(adminUsers).values(userData).returning();
    return user;
  }

  async createAdminSession(sessionData: InsertAdminSession): Promise<AdminSession> {
    const [session] = await db.insert(adminSessions).values(sessionData).returning();
    return session;
  }

  async getAdminSession(sessionId: string): Promise<AdminSession | undefined> {
    const [session] = await db.select().from(adminSessions).where(eq(adminSessions.id, sessionId));
    return session;
  }

  async deleteAdminSession(sessionId: string): Promise<void> {
    await db.delete(adminSessions).where(eq(adminSessions.id, sessionId));
  }

  async updateAdminLastLogin(userId: number): Promise<void> {
    await db.update(adminUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(adminUsers.id, userId));
  }

  async updateAdminPassword(userId: number, passwordHash: string, salt: string): Promise<void> {
    await db.update(adminUsers).set({ 
      passwordHash, 
      salt,
      updatedAt: new Date()
    }).where(eq(adminUsers.id, userId));
  }

  // Navigation
  async getNavigationItems(): Promise<NavigationItem[]> {
    return await db.select().from(navigationItems).orderBy(asc(navigationItems.order));
  }

  async createNavigationItem(item: InsertNavigationItem): Promise<NavigationItem> {
    const [created] = await db.insert(navigationItems).values(item).returning();
    return created;
  }

  async updateNavigationItem(id: number, item: Partial<InsertNavigationItem>): Promise<NavigationItem> {
    const [updated] = await db.update(navigationItems).set(item).where(eq(navigationItems.id, id)).returning();
    return updated;
  }

  async deleteNavigationItem(id: number): Promise<void> {
    await db.delete(navigationItems).where(eq(navigationItems.id, id));
  }

  // Content sections
  async getContentSection(sectionKey: string): Promise<ContentSection | undefined> {
    const [section] = await db.select().from(contentSections).where(eq(contentSections.sectionKey, sectionKey));
    return section || undefined;
  }

  async upsertContentSection(section: InsertContentSection): Promise<ContentSection> {
    const existing = await this.getContentSection(section.sectionKey);
    if (existing) {
      const [updated] = await db.update(contentSections)
        .set({ ...section, updatedAt: new Date() })
        .where(eq(contentSections.sectionKey, section.sectionKey))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(contentSections).values(section).returning();
      return created;
    }
  }

  // Blog posts
  async getBlogPosts(published?: boolean): Promise<BlogPost[]> {
    let query = db.select().from(blogPosts);
    if (published !== undefined) {
      query = query.where(eq(blogPosts.isPublished, published));
    }
    return await query.orderBy(desc(blogPosts.createdAt));
  }

  async getBlogPost(id: number): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return post || undefined;
  }

  async getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
    const [post] = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug));
    return post || undefined;
  }

  async createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const [created] = await db.insert(blogPosts).values(post).returning();
    return created;
  }

  async updateBlogPost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost> {
    const [updated] = await db.update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return updated;
  }

  async deleteBlogPost(id: number): Promise<void> {
    await db.delete(blogPosts).where(eq(blogPosts.id, id));
  }

  // Experience
  async getExperiences(): Promise<Experience[]> {
    return await db.select().from(experiences).orderBy(asc(experiences.order));
  }

  async createExperience(experience: InsertExperience): Promise<Experience> {
    const [created] = await db.insert(experiences).values(experience).returning();
    return created;
  }

  async updateExperience(id: number, experience: Partial<InsertExperience>): Promise<Experience> {
    const [updated] = await db.update(experiences).set(experience).where(eq(experiences.id, id)).returning();
    return updated;
  }

  async deleteExperience(id: number): Promise<void> {
    await db.delete(experiences).where(eq(experiences.id, id));
  }

  // Education
  async getEducation(): Promise<Education[]> {
    return await db.select().from(education).orderBy(asc(education.order));
  }

  async createEducation(edu: InsertEducation): Promise<Education> {
    const [created] = await db.insert(education).values(edu).returning();
    return created;
  }

  async updateEducation(id: number, edu: Partial<InsertEducation>): Promise<Education> {
    const [updated] = await db.update(education).set(edu).where(eq(education.id, id)).returning();
    return updated;
  }

  async deleteEducation(id: number): Promise<void> {
    await db.delete(education).where(eq(education.id, id));
  }

  // Skills
  async getSkillCategories(): Promise<SkillCategory[]> {
    return await db.select().from(skillCategories).orderBy(asc(skillCategories.order));
  }

  async getSkillsWithCategories(): Promise<(SkillCategory & { skills: Skill[] })[]> {
    const categories = await this.getSkillCategories();
    const result = [];
    
    for (const category of categories) {
      const categorySkills = await db.select().from(skills)
        .where(eq(skills.categoryId, category.id))
        .orderBy(asc(skills.order));
      
      result.push({
        ...category,
        skills: categorySkills,
      });
    }
    
    return result;
  }

  async createSkillCategory(category: InsertSkillCategory): Promise<SkillCategory> {
    const [created] = await db.insert(skillCategories).values(category).returning();
    return created;
  }

  async updateSkillCategory(id: number, category: Partial<InsertSkillCategory>): Promise<SkillCategory> {
    const [updated] = await db.update(skillCategories).set(category).where(eq(skillCategories.id, id)).returning();
    return updated;
  }

  async deleteSkillCategory(id: number): Promise<void> {
    await db.delete(skillCategories).where(eq(skillCategories.id, id));
  }

  async createSkill(skill: InsertSkill): Promise<Skill> {
    const [created] = await db.insert(skills).values(skill).returning();
    return created;
  }

  async updateSkill(id: number, skill: Partial<InsertSkill>): Promise<Skill> {
    const [updated] = await db.update(skills).set(skill).where(eq(skills.id, id)).returning();
    return updated;
  }

  async deleteSkill(id: number): Promise<void> {
    await db.delete(skills).where(eq(skills.id, id));
  }

  // Projects
  async getProjects(featured?: boolean): Promise<Project[]> {
    let query = db.select().from(projects);
    if (featured !== undefined) {
      query = query.where(eq(projects.featured, featured));
    }
    return await query.orderBy(asc(projects.order));
  }

  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project || undefined;
  }

  async createProject(project: InsertProject): Promise<Project> {
    const [created] = await db.insert(projects).values(project).returning();
    return created;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project> {
    const [updated] = await db.update(projects)
      .set({ ...project, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return updated;
  }

  async deleteProject(id: number): Promise<void> {
    await db.delete(projects).where(eq(projects.id, id));
  }

  // Profile
  async getProfile(): Promise<Profile | undefined> {
    const [profileData] = await db.select().from(profile).limit(1);
    return profileData || undefined;
  }

  async upsertProfile(profileData: InsertProfile): Promise<Profile> {
    const existing = await this.getProfile();
    if (existing) {
      const [updated] = await db.update(profile)
        .set({ ...profileData, updatedAt: new Date() })
        .where(eq(profile.id, existing.id))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(profile).values(profileData).returning();
      return created;
    }
  }
}

export const storage = new DatabaseStorage();
