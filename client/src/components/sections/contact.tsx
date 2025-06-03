import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Github, Linkedin, Send } from "lucide-react";
import type { Profile, ContentSection } from "@shared/schema";

export function ContactSection() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: profile } = useQuery<Profile>({
    queryKey: ["/api/profile"],
  });

  const { data: contactContent } = useQuery<ContentSection>({
    queryKey: ["/api/content/contact"],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 2000));

    toast({
      title: "Message sent!",
      description: "Thank you for your message. I'll get back to you soon.",
    });

    setIsSubmitting(false);
    (e.target as HTMLFormElement).reset();
  };

  const socialLinks = profile?.socialLinks as Record<string, string> || {};

  return (
    <section id="contact" className="p-8 lg:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
          <p className="text-xl text-muted-foreground">
            {contactContent?.content || 
             "Interested in collaborating on a project or discussing opportunities? I'm always open to connecting with fellow developers and exploring new challenges."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h3 className="text-2xl font-semibold mb-6">Contact Information</h3>
            
            <div className="space-y-6">
              {profile?.email && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">{profile.email}</div>
                  </div>
                </div>
              )}
              
              {profile?.phone && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Phone</div>
                    <div className="text-muted-foreground">{profile.phone}</div>
                  </div>
                </div>
              )}
              
              {profile?.location && (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">Location</div>
                    <div className="text-muted-foreground">{profile.location}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Links */}
            {Object.keys(socialLinks).length > 0 && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold mb-4">Connect With Me</h4>
                <div className="flex space-x-4">
                  {socialLinks.github && (
                    <Button variant="outline" size="icon" asChild>
                      <a 
                        href={socialLinks.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  
                  {socialLinks.linkedin && (
                    <Button variant="outline" size="icon" asChild>
                      <a 
                        href={socialLinks.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                  
                  {profile?.email && (
                    <Button variant="outline" size="icon" asChild>
                      <a href={`mailto:${profile.email}`}>
                        <Mail className="h-5 w-5" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle>Send Message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" required className="mt-1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" required className="mt-1" />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <Input id="subject" name="subject" required className="mt-1" />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea 
                    id="message" 
                    name="message" 
                    rows={5} 
                    required 
                    className="mt-1 resize-none" 
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Sending..."
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
