import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, Eye } from "lucide-react";
import type { ContentSection, Profile } from "@shared/schema";

export function HeroSection() {
  const { data: heroContent } = useQuery<ContentSection>({
    queryKey: ["/api/content/hero"],
  });

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: aboutContent } = useQuery<ContentSection>({
    queryKey: ["/api/content/about"],
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: experiences = [] } = useQuery({
    queryKey: ["/api/experience"],
  });

  const { data: skillCategories = [] } = useQuery({
    queryKey: ["/api/skills"],
  });

  // Calculate dynamic stats from actual data
  const calculateYearsExperience = () => {
    if (experiences.length === 0) return "0";
    
    const sortedExperiences = experiences.sort((a: any, b: any) => {
      const dateA = new Date(a.startDate + "-01");
      const dateB = new Date(b.startDate + "-01");
      return dateA.getTime() - dateB.getTime();
    });
    
    const firstJob = sortedExperiences[0];
    const startYear = new Date(firstJob.startDate + "-01").getFullYear();
    const currentYear = new Date().getFullYear();
    const years = currentYear - startYear;
    
    return years > 0 ? `${years}+` : "1";
  };

  const calculateTechnologiesCount = () => {
    const allTech = new Set();
    
    // Add technologies from experiences
    experiences.forEach((exp: any) => {
      if (exp.technologies) {
        exp.technologies.forEach((tech: string) => allTech.add(tech.toLowerCase()));
      }
    });
    
    // Add technologies from projects
    projects.forEach((project: any) => {
      if (project.technologies) {
        project.technologies.forEach((tech: string) => allTech.add(tech.toLowerCase()));
      }
    });
    
    return allTech.size.toString();
  };

  const stats = [
    { value: calculateYearsExperience(), label: "Years Experience" },
    { value: projects.length.toString(), label: "Projects Completed" },
    { value: calculateTechnologiesCount(), label: "Technologies Mastered" },
  ];

  return (
    <section id="home" className="p-8 lg:p-12 min-h-[70vh] flex items-center">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {heroContent?.title || "Building the Future with Code"}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {heroContent?.subtitle || aboutContent?.content || 
             "Passionate software engineer specializing in full-stack development, cloud architecture, and scalable systems. Turning complex problems into elegant solutions."}
          </p>
          
          {/* Call to Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {profile?.resumeUrl && (
              <Button asChild size="lg">
                <a 
                  href={profile.resumeUrl} 
                  download
                  className="inline-flex items-center"
                >
                  <Download className="h-5 w-5 mr-2" />
                  Download Resume
                </a>
              </Button>
            )}
            
            <Button variant="outline" size="lg" asChild>
              <a href="#projects" className="inline-flex items-center">
                <Eye className="h-5 w-5 mr-2" />
                View Projects
              </a>
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {stats.map((stat, index) => (
            <Card key={stat.label} className="project-card">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
