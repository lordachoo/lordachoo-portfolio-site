import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, GripVertical } from "lucide-react";
import type { NavigationItem, InsertNavigationItem } from "@shared/schema";

export function NavigationEditor() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [formData, setFormData] = useState<Partial<InsertNavigationItem>>({});

  const { data: navigationItems = [] } = useQuery<NavigationItem[]>({
    queryKey: ["/api/navigation"],
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertNavigationItem) => {
      const response = await apiRequest("POST", "/api/navigation", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation"] });
      setIsDialogOpen(false);
      setFormData({});
      toast({
        title: "Navigation item created",
        description: "The navigation item has been added successfully.",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertNavigationItem> }) => {
      const response = await apiRequest("PUT", `/api/navigation/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation"] });
      setIsDialogOpen(false);
      setEditingItem(null);
      setFormData({});
      toast({
        title: "Navigation item updated",
        description: "The navigation item has been updated successfully.",
      });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/navigation/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation"] });
      toast({
        title: "Navigation item deleted",
        description: "The navigation item has been removed.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data: InsertNavigationItem = {
      label: formData.label || "",
      href: formData.href || "",
      icon: formData.icon || "fas fa-circle",
      order: formData.order || 0,
      isVisible: formData.isVisible ?? true,
    };

    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData({
      label: item.label,
      href: item.href,
      icon: item.icon,
      order: item.order,
      isVisible: item.isVisible,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this navigation item?")) {
      deleteItemMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({});
    setEditingItem(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Navigation Editor</CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label || ""}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Home, About, Projects..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="href">Link</Label>
                  <Input
                    id="href"
                    value={formData.href || ""}
                    onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                    placeholder="#home, #about, /admin..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon Class</Label>
                  <Input
                    id="icon"
                    value={formData.icon || ""}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="fas fa-home, fas fa-user..."
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="order">Order</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order || 0}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isVisible"
                    checked={formData.isVisible ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                  />
                  <Label htmlFor="isVisible">Visible</Label>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button type="submit" disabled={createItemMutation.isPending || updateItemMutation.isPending}>
                    {editingItem ? "Update" : "Create"}
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
        <div className="space-y-2">
          {navigationItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No navigation items found. Add some to get started.
            </p>
          ) : (
            navigationItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
              >
                <div className="flex items-center space-x-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <i className={`${item.icon} w-4 h-4`} />
                  <span className="font-medium">{item.label}</span>
                  <span className="text-sm text-muted-foreground">→ {item.href}</span>
                  {!item.isVisible && (
                    <span className="text-xs bg-muted px-2 py-1 rounded">Hidden</span>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(item)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
