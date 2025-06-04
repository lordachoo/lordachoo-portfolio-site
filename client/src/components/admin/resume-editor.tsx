import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatDateRange } from "@/lib/utils";
import { Plus, Edit, Trash2, Briefcase, GraduationCap, Code, Award } from "lucide-react";
import type { 
  Experience, 
  InsertExperience, 
  Education, 
  InsertEducation,
  SkillCategory,
  InsertSkillCategory,
  Skill,
  InsertSkill
} from "@shared/schema";

export function ResumeEditor() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("experience");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [formData, setFormData] = useState<any>({});
  const [dialogType, setDialogType] = useState<"experience" | "education" | "skill-category" | "skill">("experience");

  // Queries
  const { data: experiences = [] } = useQuery<Experience[]>({
    queryKey: ["/api/experience"],
  });

  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ["/api/education"],
  });

  const { data: skillCategories = [] } = useQuery<(SkillCategory & { skills: Skill[] })[]>({
    queryKey: ["/api/skills"],
  });

  // Experience mutations
  const createExperienceMutation = useMutation({
    mutationFn: async (data: InsertExperience) => {
      return await apiRequest("/api/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      handleDialogClose();
      toast({ title: "Experience added successfully" });
    },
  });

  const updateExperienceMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertExperience> }) => {
      return await apiRequest(`/api/experience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      handleDialogClose();
      toast({ title: "Experience updated successfully" });
    },
  });

  const deleteExperienceMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/experience/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/experience"] });
      toast({ title: "Experience deleted successfully" });
    },
  });

  // Education mutations
  const createEducationMutation = useMutation({
    mutationFn: async (data: InsertEducation) => {
      return await apiRequest("/api/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      handleDialogClose();
      toast({ title: "Education added successfully" });
    },
  });

  const updateEducationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertEducation> }) => {
      return await apiRequest(`/api/education/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      handleDialogClose();
      toast({ title: "Education updated successfully" });
    },
  });

  const deleteEducationMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/education/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/education"] });
      toast({ title: "Education deleted successfully" });
    },
  });

  // Skill mutations
  const createSkillCategoryMutation = useMutation({
    mutationFn: async (data: InsertSkillCategory) => {
      return await apiRequest("/api/skills/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      handleDialogClose();
      toast({ title: "Skill category added successfully" });
    },
  });

  const createSkillMutation = useMutation({
    mutationFn: async (data: InsertSkill) => {
      return await apiRequest("/api/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      handleDialogClose();
      toast({ title: "Skill added successfully" });
    },
  });

  const updateSkillCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSkillCategory> }) => {
      return await apiRequest(`/api/skills/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      handleDialogClose();
      toast({ title: "Skill category updated successfully" });
    },
  });

  const updateSkillMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSkill> }) => {
      return await apiRequest(`/api/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      handleDialogClose();
      toast({ title: "Skill updated successfully" });
    },
  });

  const deleteSkillCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/skills/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill category deleted successfully" });
    },
  });

  const deleteSkillMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/skills/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/skills"] });
      toast({ title: "Skill deleted successfully" });
    },
  });

  // Dialog handlers
  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    setFormData({});
    setAchievementsInput("");
    setTechnologiesInput("");
  };

  const handleAddNew = (type: "experience" | "education" | "skill-category" | "skill") => {
    setDialogType(type);
    setEditingItem(null);
    setFormData({});
    setIsDialogOpen(true);
  };

  const handleEdit = (item: any, type: "experience" | "education" | "skill-category" | "skill") => {
    setDialogType(type);
    setEditingItem(item);
    setFormData(item);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number, type: "experience" | "education" | "skill-category" | "skill") => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === "experience") {
        deleteExperienceMutation.mutate(id);
      } else if (type === "education") {
        deleteEducationMutation.mutate(id);
      } else if (type === "skill-category") {
        deleteSkillCategoryMutation.mutate(id);
      } else if (type === "skill") {
        deleteSkillMutation.mutate(id);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (dialogType === "experience") {
      const data: InsertExperience = {
        title: formData.title || "",
        company: formData.company || "",
        location: formData.location || "",
        startDate: formData.startDate || "",
        endDate: formData.endDate || null,
        description: formData.description || "",
        achievements: achievementsInput ? achievementsInput.split(",").map(item => item.trim()).filter(Boolean) : [],
        technologies: technologiesInput ? technologiesInput.split(",").map(item => item.trim()).filter(Boolean) : [],
        order: formData.order || 0,
      };

      if (editingItem) {
        updateExperienceMutation.mutate({ id: editingItem.id, data });
      } else {
        createExperienceMutation.mutate(data);
      }
    } else if (dialogType === "education") {
      const data: InsertEducation = {
        degree: formData.degree || "",
        institution: formData.institution || "",
        location: formData.location || "",
        startYear: formData.startYear || "",
        endYear: formData.endYear || null,
        description: formData.description || "",
        gpa: formData.gpa || "",
        order: formData.order || 0,
      };

      if (editingItem) {
        updateEducationMutation.mutate({ id: editingItem.id, data });
      } else {
        createEducationMutation.mutate(data);
      }
    } else if (dialogType === "skill-category") {
      const data: InsertSkillCategory = {
        name: formData.name || "",
        order: formData.order || 0,
      };
      
      if (editingItem) {
        updateSkillCategoryMutation.mutate({ id: editingItem.id, data });
      } else {
        createSkillCategoryMutation.mutate(data);
      }
    } else if (dialogType === "skill") {
      const data: InsertSkill = {
        categoryId: formData.categoryId,
        name: formData.name || "",
        level: formData.level || 50,
        order: formData.order || 0,
      };
      
      if (editingItem) {
        updateSkillMutation.mutate({ id: editingItem.id, data });
      } else {
        createSkillMutation.mutate(data);
      }
    }
  };

  // Store comma-separated fields as strings during editing
  const [achievementsInput, setAchievementsInput] = useState("");
  const [technologiesInput, setTechnologiesInput] = useState("");

  // Update string inputs when editing an item
  useEffect(() => {
    if (editingItem && dialogType === "experience") {
      setAchievementsInput(editingItem.achievements?.join(", ") || "");
      setTechnologiesInput(editingItem.technologies?.join(", ") || "");
    } else {
      setAchievementsInput("");
      setTechnologiesInput("");
    }
  }, [editingItem, dialogType]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resume Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experience" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span>Experience</span>
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center space-x-2">
                <GraduationCap className="h-4 w-4" />
                <span>Education</span>
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Skills</span>
              </TabsTrigger>
            </TabsList>

            {/* Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Work Experience</h3>
                <Button onClick={() => handleAddNew("experience")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>

              <div className="space-y-4">
                {experiences.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No experience entries found. Add your work experience to get started.
                  </p>
                ) : (
                  experiences.map((exp) => (
                    <Card key={exp.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{exp.title}</h4>
                            <p className="text-primary">{exp.company}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateRange(exp.startDate, exp.endDate)}
                              {exp.location && ` • ${exp.location}`}
                            </p>
                            {exp.description && (
                              <p className="text-sm mt-2">{exp.description}</p>
                            )}
                            {exp.technologies && exp.technologies.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {exp.technologies.map((tech) => (
                                  <Badge key={tech} variant="outline" className="text-xs">
                                    {tech}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(exp, "experience")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(exp.id, "experience")}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Education</h3>
                <Button onClick={() => handleAddNew("education")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>

              <div className="space-y-4">
                {education.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No education entries found. Add your educational background.
                  </p>
                ) : (
                  education.map((edu) => (
                    <Card key={edu.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-semibold">{edu.degree}</h4>
                            <p className="text-primary">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDateRange(edu.startYear, edu.endYear)}
                              {edu.location && ` • ${edu.location}`}
                            </p>
                            {edu.gpa && (
                              <p className="text-sm">GPA: {edu.gpa}</p>
                            )}
                            {edu.description && (
                              <p className="text-sm mt-2">{edu.description}</p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(edu, "education")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(edu.id, "education")}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Technical Skills</h3>
                <div className="space-x-2">
                  <Button variant="outline" onClick={() => handleAddNew("skill-category")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </Button>
                  <Button onClick={() => handleAddNew("skill")}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {skillCategories.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">
                      No skill categories found. Create categories and add skills to showcase your expertise.
                    </p>
                  </div>
                ) : (
                  skillCategories.map((category) => (
                    <Card key={category.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category, "skill-category")}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id, "skill-category")}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {category.skills.length === 0 ? (
                          <p className="text-muted-foreground text-sm">
                            No skills in this category yet.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {category.skills.map((skill) => (
                              <div key={skill.id}>
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-sm font-medium">{skill.name}</span>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-muted-foreground">
                                      {skill.level}%
                                    </span>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEdit(skill, "skill")}
                                    >
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(skill.id, "skill")}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div 
                                    className="bg-primary h-2 rounded-full transition-all" 
                                    style={{ width: `${skill.level}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialog for adding/editing */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Edit ${dialogType}` : `Add ${dialogType}`}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {dialogType === "experience" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Senior Software Engineer"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={formData.company || ""}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="TechCorp Inc."
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date (YYYY-MM)</Label>
                    <Input
                      id="startDate"
                      value={formData.startDate || ""}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      placeholder="2021-01"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date (YYYY-MM)</Label>
                    <Input
                      id="endDate"
                      value={formData.endDate || ""}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      placeholder="2024-01 or leave empty for current"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of your role and responsibilities"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="achievements">Achievements (comma-separated)</Label>
                  <Textarea
                    id="achievements"
                    value={achievementsInput}
                    onChange={(e) => setAchievementsInput(e.target.value)}
                    placeholder="Led team of 5 developers, Increased system performance by 40%"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="technologies">Technologies (comma-separated)</Label>
                  <Input
                    id="technologies"
                    value={technologiesInput}
                    onChange={(e) => setTechnologiesInput(e.target.value)}
                    placeholder="React, Node.js, PostgreSQL, AWS"
                  />
                </div>
              </>
            )}

            {dialogType === "education" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="degree">Degree</Label>
                    <Input
                      id="degree"
                      value={formData.degree || ""}
                      onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                      placeholder="Bachelor of Science in Computer Science"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="institution">Institution</Label>
                    <Input
                      id="institution"
                      value={formData.institution || ""}
                      onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                      placeholder="University of Technology"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="startYear">Start Year</Label>
                    <Input
                      id="startYear"
                      value={formData.startYear || ""}
                      onChange={(e) => setFormData({ ...formData, startYear: e.target.value })}
                      placeholder="2015"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="endYear">End Year</Label>
                    <Input
                      id="endYear"
                      value={formData.endYear || ""}
                      onChange={(e) => setFormData({ ...formData, endYear: e.target.value })}
                      placeholder="2019 or leave empty if ongoing"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="New York, NY"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gpa">GPA (optional)</Label>
                  <Input
                    id="gpa"
                    value={formData.gpa || ""}
                    onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                    placeholder="3.8/4.0"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Relevant coursework, honors, activities, etc."
                    rows={3}
                  />
                </div>
              </>
            )}

            {dialogType === "skill-category" && (
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Frontend Development, Backend, DevOps..."
                  required
                />
              </div>
            )}

            {dialogType === "skill" && (
              <>
                <div>
                  <Label htmlFor="categoryId">Category</Label>
                  <Select 
                    value={formData.categoryId?.toString() || ""} 
                    onValueChange={(value) => setFormData({ ...formData, categoryId: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="name">Skill Name</Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="React, Node.js, PostgreSQL..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="level">Proficiency Level: {formData.level || 50}%</Label>
                  <Slider
                    value={[formData.level || 50]}
                    onValueChange={(value) => setFormData({ ...formData, level: value[0] })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </>
            )}

            <div className="flex space-x-2 pt-4">
              <Button type="submit">
                {editingItem ? "Update" : "Create"}
              </Button>
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
