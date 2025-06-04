import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProfileSchema, type Profile, type InsertProfile } from "@shared/schema";
import { Loader2, Save, User, Mail, Phone, MapPin, FileText, Image, Link as LinkIcon } from "lucide-react";

const socialLinksSchema = z.object({
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
  twitter: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
});

const profileFormSchema = insertProfileSchema.extend({
  socialLinks: socialLinksSchema.optional(),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

export function ProfileEditor() {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("basic");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      bio: "",
      avatarUrl: "",
      resumeUrl: "",
      themePreference: "dark",
      socialLinks: {
        github: "",
        linkedin: "",
        twitter: "",
        website: "",
      },
    },
  });

  // Reset form when profile data loads
  useEffect(() => {
    if (profile) {
      form.reset({
        name: (profile as any).name || "",
        title: (profile as any).title || "",
        email: (profile as any).email || "",
        phone: (profile as any).phone || "",
        location: (profile as any).location || "",
        bio: (profile as any).bio || "",
        avatarUrl: (profile as any).avatarUrl || "",
        resumeUrl: (profile as any).resumeUrl || "",
        themePreference: (profile as any).themePreference || "dark",
        socialLinks: {
          github: (profile as any).socialLinks?.github || "",
          linkedin: (profile as any).socialLinks?.linkedin || "",
          twitter: (profile as any).socialLinks?.twitter || "",
          website: (profile as any).socialLinks?.website || "",
        },
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: InsertProfile) => {
      console.log("Updating profile with data:", data);
      return await apiRequest("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    console.log("Form submitted with data:", data);
    
    // Clean up empty social links
    const cleanedSocialLinks = Object.fromEntries(
      Object.entries(data.socialLinks || {}).filter(([_, value]) => value && value.trim() !== "")
    );

    const profileData: InsertProfile = {
      ...data,
      socialLinks: Object.keys(cleanedSocialLinks).length > 0 ? cleanedSocialLinks : null,
    };

    updateProfileMutation.mutate(profileData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const sections = [
    { id: "basic", label: "Basic Info", icon: User },
    { id: "contact", label: "Contact", icon: Mail },
    { id: "bio", label: "Bio & Media", icon: FileText },
    { id: "social", label: "Social Links", icon: LinkIcon },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">
          Manage your personal information and website profile.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeSection === section.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Form Content */}
        <div className="lg:col-span-3">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {activeSection === "basic" && (
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>
                    Your name and professional title as they appear on your website.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        {...form.register("name")}
                        placeholder="Your full name"
                      />
                      {form.formState.errors.name && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="title">Professional Title *</Label>
                      <Input
                        id="title"
                        {...form.register("title")}
                        placeholder="e.g., Senior Software Engineer"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "contact" && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                  <CardDescription>
                    How people can reach you professionally.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...form.register("email")}
                      placeholder="your.email@example.com"
                    />
                    {form.formState.errors.email && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        {...form.register("phone")}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        {...form.register("location")}
                        placeholder="City, State/Country"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "bio" && (
              <Card>
                <CardHeader>
                  <CardTitle>Bio & Media</CardTitle>
                  <CardDescription>
                    Your professional bio and profile media.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      placeholder="Tell visitors about yourself, your experience, and what you're passionate about..."
                      rows={4}
                    />
                  </div>
                  <Separator />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="avatarUrl">Avatar/Photo URL</Label>
                      <Input
                        id="avatarUrl"
                        {...form.register("avatarUrl")}
                        placeholder="https://example.com/photo.jpg"
                      />
                    </div>
                    <div>
                      <Label htmlFor="resumeUrl">Resume/CV URL</Label>
                      <Input
                        id="resumeUrl"
                        {...form.register("resumeUrl")}
                        placeholder="https://example.com/resume.pdf"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeSection === "social" && (
              <Card>
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>
                    Your professional social media and portfolio links.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="github">GitHub</Label>
                      <Input
                        id="github"
                        {...form.register("socialLinks.github")}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        {...form.register("socialLinks.linkedin")}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="twitter">Twitter/X</Label>
                      <Input
                        id="twitter"
                        {...form.register("socialLinks.twitter")}
                        placeholder="https://twitter.com/username"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Personal Website</Label>
                      <Input
                        id="website"
                        {...form.register("socialLinks.website")}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={updateProfileMutation.isPending}
                className="min-w-[120px]"
              >
                {updateProfileMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}