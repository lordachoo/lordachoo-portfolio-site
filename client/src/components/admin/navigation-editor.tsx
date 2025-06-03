import { useState, useEffect } from "react";
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { NavigationItem, InsertNavigationItem } from "@shared/schema";

// Sortable Navigation Item Component
function SortableNavigationItem({ 
  item, 
  onEdit, 
  onDelete 
}: { 
  item: NavigationItem; 
  onEdit: (item: NavigationItem) => void; 
  onDelete: (id: number) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-move"
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
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
          size="sm"
          onClick={() => onEdit(item)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(item.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function NavigationEditor() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [formData, setFormData] = useState<Partial<InsertNavigationItem>>({});
  const [localItems, setLocalItems] = useState<NavigationItem[]>([]);

  const { data: navigationItems = [] } = useQuery<NavigationItem[]>({
    queryKey: ["/api/navigation", "admin"],
    queryFn: () => fetch("/api/navigation?admin=true", { credentials: "include" }).then(res => res.json()),
  });

  // Update local items when data changes
  useEffect(() => {
    if (navigationItems.length > 0) {
      setLocalItems([...navigationItems].sort((a, b) => a.order - b.order));
    }
  }, [navigationItems]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setLocalItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update the order in the database
        reorderItemsMutation.mutate(newItems);
        
        return newItems;
      });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const createItemMutation = useMutation({
    mutationFn: async (data: InsertNavigationItem) => {
      console.log("Creating navigation item with data:", data);
      return await apiRequest("/api/navigation", {
        method: "POST",
        body: JSON.stringify(data),
      });
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
    onError: (error) => {
      console.error("Failed to create navigation item:", error);
      toast({
        title: "Error",
        description: "Failed to create navigation item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertNavigationItem> }) => {
      return await apiRequest(`/api/navigation/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      });
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
      console.log("Deleting navigation item:", id);
      return await apiRequest(`/api/navigation/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation"] });
      toast({
        title: "Navigation item deleted",
        description: "The navigation item has been removed.",
      });
    },
    onError: (error) => {
      console.error("Failed to delete navigation item:", error);
      toast({
        title: "Error",
        description: "Failed to delete navigation item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const reorderItemsMutation = useMutation({
    mutationFn: async (items: NavigationItem[]) => {
      // Update order for each item
      const updates = items.map((item, index) => 
        apiRequest(`/api/navigation/${item.id}`, {
          method: "PUT",
          body: JSON.stringify({ order: index })
        })
      );
      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/navigation"] });
      toast({
        title: "Navigation order updated",
        description: "The navigation items have been reordered.",
      });
    },
    onError: (error) => {
      console.error("Failed to reorder navigation items:", error);
      toast({
        title: "Error", 
        description: "Failed to reorder navigation items.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with formData:", formData);
    
    const data: InsertNavigationItem = {
      label: formData.label || "",
      href: formData.href || "",
      icon: formData.icon || "fas fa-circle",
      order: formData.order || 0,
      isVisible: formData.isVisible ?? true,
    };

    console.log("Prepared data for submission:", data);

    if (editingItem) {
      console.log("Updating existing item:", editingItem.id);
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      console.log("Creating new item");
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
          {localItems.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No navigation items found. Add some to get started.
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={localItems.map(item => item.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {localItems.map((item) => (
                    <SortableNavigationItem
                      key={item.id}
                      item={item}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
