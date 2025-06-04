import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { generateSlug, calculateReadTime, formatDate } from "@/lib/utils";
import { Plus, Edit, Trash2, Eye, Calendar } from "lucide-react";
import type { BlogPost, InsertBlogPost } from "@shared/schema";

export function BlogEditor() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<Partial<InsertBlogPost>>({});

  const { data: blogPosts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      return await apiRequest("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      setFormData({});
      toast({
        title: "Blog post created",
        description: "The blog post has been created successfully.",
      });
    },
  });

  const updatePostMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBlogPost> }) => {
      return await apiRequest(`/api/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      setFormData({});
      toast({
        title: "Blog post updated",
        description: "The blog post has been updated successfully.",
      });
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/blog/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      toast({
        title: "Blog post deleted",
        description: "The blog post has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content) {
      toast({
        title: "Error",
        description: "Title and content are required.",
        variant: "destructive",
      });
      return;
    }

    const slug = formData.slug || generateSlug(formData.title);
    const readTime = calculateReadTime(formData.content);
    const tags = formData.tags || [];

    const data: InsertBlogPost = {
      title: formData.title,
      slug,
      excerpt: formData.excerpt || "",
      content: formData.content,
      category: formData.category || "General",
      tags,
      readTime,
      isPublished: formData.isPublished ?? false,
      publishedAt: formData.isPublished ? new Date() : null,
    };

    if (editingPost) {
      updatePostMutation.mutate({ id: editingPost.id, data });
    } else {
      createPostMutation.mutate(data);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || "",
      content: post.content,
      category: post.category,
      tags: post.tags || [],
      isPublished: post.isPublished,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      deletePostMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingPost(null);
  };

  const handleTagsChange = (value: string) => {
    const tags = value.split(",").map(tag => tag.trim()).filter(Boolean);
    setFormData({ ...formData, tags });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Blog Editor</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPost ? "Edit Blog Post" : "Create Blog Post"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Blog post title"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="url-friendly-slug (auto-generated if empty)"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Technology, Tutorial, Career..."
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt || ""}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the post"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ""}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Write your blog post content here..."
                    rows={10}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={formData.tags?.join(", ") || ""}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    placeholder="react, javascript, tutorial"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isPublished"
                    checked={formData.isPublished ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublished: checked })}
                  />
                  <Label htmlFor="isPublished">Publish immediately</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={createPostMutation.isPending || updatePostMutation.isPending}>
                    {editingPost ? "Update" : "Create"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {blogPosts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No blog posts found. Create your first post to get started.
            </p>
          ) : (
            blogPosts.map((post) => (
              <div
                key={post.id}
                className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{post.title}</h3>
                      <Badge variant={post.isPublished ? "default" : "secondary"}>
                        {post.isPublished ? "Published" : "Draft"}
                      </Badge>
                      <Badge variant="outline">{post.category}</Badge>
                    </div>
                    
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(post.publishedAt || post.createdAt)}
                      </span>
                      {post.readTime && (
                        <span>{post.readTime} min read</span>
                      )}
                      {post.views !== null && (
                        <span>{post.views} views</span>
                      )}
                    </div>
                    
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {post.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(post)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(post.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
