import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/navigation";
import { ContentEditor } from "@/components/admin/content-editor";
import { NavigationEditor } from "@/components/admin/navigation-editor";
import { BlogEditor } from "@/components/admin/blog-editor";
import { ResumeEditor } from "@/components/admin/resume-editor";
import { ProjectsEditor } from "@/components/admin/projects-editor";
import { useAuth } from "@/hooks/useAuth";
import { 
  Database, 
  Server, 
  HardDrive, 
  Activity,
  FileText,
  Navigation as NavigationIcon,
  MessageSquare,
  LogOut,
  Shield,
  Briefcase,
  Code,
  User
} from "lucide-react";
import type { Profile } from "@shared/schema";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("content");
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = "/login";
    }
  }, [isAuthenticated, isLoading]);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  // Don't render admin content if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const systemStats = [
    {
      label: "Database",
      value: "Online",
      icon: Database,
      status: "success",
      details: "PostgreSQL 14.2"
    },
    {
      label: "API Status", 
      value: "Active",
      icon: Server,
      status: "success",
      details: "Response: 45ms"
    },
    {
      label: "Storage",
      value: "2.3GB",
      icon: HardDrive,
      status: "warning", 
      details: "23% used"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="ml-60 md:ml-60 transition-all duration-300">
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
              <p className="text-muted-foreground mt-2">
                Manage your portfolio content and settings
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-green-500 border-green-500">
                <Activity className="h-3 w-3 mr-1" />
                System Online
              </Badge>
              
              <Button variant="outline" asChild>
                <a href="/" target="_blank">
                  View Site
                </a>
              </Button>
            </div>
          </div>

          {/* System Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {systemStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-muted-foreground">{stat.label}</span>
                    <stat.icon 
                      className={`h-5 w-5 ${
                        stat.status === 'success' ? 'text-green-500' : 
                        stat.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                      }`} 
                    />
                  </div>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.details}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Admin Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-5">
              <TabsTrigger value="content" className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Content</span>
              </TabsTrigger>
              
              <TabsTrigger value="navigation" className="flex items-center space-x-2">
                <NavigationIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Navigation</span>
              </TabsTrigger>
              
              <TabsTrigger value="blog" className="flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span className="hidden sm:inline">Blog</span>
              </TabsTrigger>
              
              <TabsTrigger value="resume" className="flex items-center space-x-2">
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Resume</span>
              </TabsTrigger>
              
              <TabsTrigger value="projects" className="flex items-center space-x-2">
                <Code className="h-4 w-4" />
                <span className="hidden sm:inline">Projects</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-6">
              <ContentEditor />
            </TabsContent>

            <TabsContent value="navigation" className="space-y-6">
              <NavigationEditor />
            </TabsContent>

            <TabsContent value="blog" className="space-y-6">
              <BlogEditor />
            </TabsContent>

            <TabsContent value="resume" className="space-y-6">
              <ResumeEditor />
            </TabsContent>

            <TabsContent value="projects" className="space-y-6">
              <ProjectsEditor />
            </TabsContent>
          </Tabs>

          {/* Profile Quick Access */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Name</div>
                  <div>{profile?.name || "Not set"}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Title</div>
                  <div>{profile?.title || "Not set"}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Email</div>
                  <div>{profile?.email || "Not set"}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Location</div>
                  <div>{profile?.location || "Not set"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
