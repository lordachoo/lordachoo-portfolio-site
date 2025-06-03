import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Save, Eye } from "lucide-react";
import type { ContentSection, InsertContentSection } from "@shared/schema";

const CONTENT_SECTIONS = [
  { key: "hero", label: "Hero Section" },
  { key: "about", label: "About" },
  { key: "contact", label: "Contact" },
];

export function ContentEditor() {
  const { toast } = useToast();
  const [selectedSection, setSelectedSection] = useState("hero");
  const [formData, setFormData] = useState<Partial<InsertContentSection>>({});

  const { data: contentSection, isLoading } = useQuery<ContentSection>({
    queryKey: ["/api/content", selectedSection],
    queryFn: () => fetch(`/api/content/${selectedSection}`).then(res => {
      if (res.status === 404) return null;
      return res.json();
    }),
    enabled: !!selectedSection,
  });

  const updateContentMutation = useMutation({
    mutationFn: async (data: InsertContentSection) => {
      const response = await apiRequest("PUT", `/api/content/${selectedSection}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/content", selectedSection] });
      toast({
        title: "Content updated",
        description: "Your changes have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: InsertContentSection = {
      sectionKey: selectedSection,
      title: formData.title || "",
      subtitle: formData.subtitle || "",
      content: formData.content || "",
      metadata: formData.metadata || null,
    };

    updateContentMutation.mutate(data);
  };

  const handleSectionChange = (sectionKey: string) => {
    setSelectedSection(sectionKey);
    setFormData({});
  };

  // Update form data when content section changes
  React.useEffect(() => {
    if (contentSection) {
      setFormData({
        title: contentSection.title || "",
        subtitle: contentSection.subtitle || "",
        content: contentSection.content || "",
        metadata: contentSection.metadata,
      });
    } else {
      setFormData({});
    }
  }, [contentSection]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Editor</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label htmlFor="section">Section</Label>
          <Select value={selectedSection} onValueChange={handleSectionChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONTENT_SECTIONS.map((section) => (
                <SelectItem key={section.key} value={section.key}>
                  {section.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title || ""}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter section title"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle || ""}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Enter section subtitle"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={formData.content || ""}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Enter section content"
              rows={8}
              className="mt-1"
            />
          </div>

          <div className="flex space-x-4">
            <Button 
              type="submit" 
              disabled={updateContentMutation.isPending}
              className="flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {updateContentMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            
            <Button type="button" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
