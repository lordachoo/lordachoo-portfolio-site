import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";
import type { Project } from "@shared/schema";

export function ProjectsSection() {
  const { data: projects = [] } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const featuredProjects = projects.filter(p => p.featured);
  const displayProjects = featuredProjects.length > 0 ? featuredProjects : projects.slice(0, 6);

  return (
    <section id="projects" className="p-4 sm:p-6 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            A showcase of my recent work and open-source contributions. Each project demonstrates different aspects of my technical expertise.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayProjects.length === 0 ? (
            <div className="col-span-full">
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground mb-4">
                    No projects found. Add some in the admin panel.
                  </p>
                  <Button asChild>
                    <a href="/admin">Go to Admin Panel</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            displayProjects.map((project) => (
              <Card key={project.id} className="project-card group overflow-hidden">
                {project.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
                      {project.name}
                    </h3>
                    <div className="flex space-x-2">
                      {project.githubUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Github className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                      
                      {project.liveUrl && (
                        <Button variant="ghost" size="icon" asChild>
                          <a 
                            href={project.liveUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink className="h-5 w-5" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                    {project.description}
                  </p>
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      {project.stars !== null && (
                        <span className="flex items-center space-x-1">
                          <Star className="h-4 w-4 fill-current text-yellow-500" />
                          <span>{project.stars}</span>
                        </span>
                      )}
                      
                      {project.forks !== null && (
                        <span className="flex items-center space-x-1">
                          <GitFork className="h-4 w-4" />
                          <span>{project.forks}</span>
                        </span>
                      )}
                    </div>
                    
                    {project.language && (
                      <span className="text-xs">{project.language}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {projects.length > 6 && (
          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <a 
                href="/admin" 
                className="inline-flex items-center"
              >
                <Github className="h-5 w-5 mr-2" />
                View All Projects
                <ExternalLink className="h-4 w-4 ml-2" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
