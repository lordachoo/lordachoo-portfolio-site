import { Navigation } from "@/components/navigation";
import { HeroSection } from "@/components/sections/hero";
import { ResumeSection } from "@/components/sections/resume";
import { ProjectsSection } from "@/components/sections/projects";
import { BlogSection } from "@/components/sections/blog";
import { ContactSection } from "@/components/sections/contact";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="ml-60 md:ml-60 transition-all duration-300">
        <HeroSection />
        <ResumeSection />
        <ProjectsSection />
        <BlogSection />
        <ContactSection />
      </main>
    </div>
  );
}
