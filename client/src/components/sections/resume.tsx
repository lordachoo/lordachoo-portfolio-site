import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Briefcase, GraduationCap, Code } from "lucide-react";
import { formatDateRange } from "@/lib/utils";
import type { Experience, Education, SkillCategory, Skill } from "@shared/schema";

export function ResumeSection() {
  const { data: experiencesData = [] } = useQuery<Experience[]>({
    queryKey: ["/api/experience"],
  });

  const { data: education = [] } = useQuery<Education[]>({
    queryKey: ["/api/education"],
  });

  const { data: skillCategories = [] } = useQuery<(SkillCategory & { skills: Skill[] })[]>({
    queryKey: ["/api/skills"],
  });

  // Sort experiences by start date descending (most recent first)
  const experiences = [...experiencesData].sort((a, b) => {
    const dateA = new Date(a.startDate + "-01");
    const dateB = new Date(b.startDate + "-01");
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <section id="resume" className="p-8 lg:p-12 bg-card">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Resume</h2>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Experience & Education Column */}
          <div className="lg:col-span-2 space-y-12">
            {/* Experience */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <Briefcase className="h-6 w-6 text-primary mr-3" />
                Experience
              </h3>
              
              <div className="space-y-6">
                {experiences.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-center">
                        No experience entries found. Add some in the admin panel.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  experiences.map((exp) => (
                    <Card key={exp.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
                          <h4 className="text-xl font-semibold">{exp.title}</h4>
                          <Badge variant="secondary">
                            {formatDateRange(exp.startDate, exp.endDate)}
                          </Badge>
                        </div>
                        
                        <div className="text-primary font-medium mb-3">
                          {exp.company}
                          {exp.location && (
                            <span className="text-muted-foreground ml-2">
                              • {exp.location}
                            </span>
                          )}
                        </div>
                        
                        {exp.description && (
                          <div className="text-muted-foreground mb-4 whitespace-pre-line">
                            {exp.description}
                          </div>
                        )}
                        
                        {exp.achievements && exp.achievements.length > 0 && (
                          <ul className="list-disc list-inside space-y-2 text-muted-foreground mb-4">
                            {exp.achievements.map((achievement, index) => (
                              <li key={index} className="whitespace-pre-line">{achievement}</li>
                            ))}
                          </ul>
                        )}
                        
                        {exp.technologies && exp.technologies.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {exp.technologies.map((tech) => (
                              <Badge key={tech} variant="outline">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Education */}
            <div>
              <h3 className="text-2xl font-semibold mb-6 flex items-center">
                <GraduationCap className="h-6 w-6 text-primary mr-3" />
                Education
              </h3>
              
              <div className="space-y-6">
                {education.length === 0 ? (
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-muted-foreground text-center">
                        No education entries found. Add some in the admin panel.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  education.map((edu) => (
                    <Card key={edu.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-3">
                          <h4 className="text-xl font-semibold">{edu.degree}</h4>
                          <Badge variant="secondary">
                            {formatDateRange(edu.startYear, edu.endYear)}
                          </Badge>
                        </div>
                        
                        <div className="text-primary font-medium mb-3">
                          {edu.institution}
                          {edu.location && (
                            <span className="text-muted-foreground ml-2">
                              • {edu.location}
                            </span>
                          )}
                        </div>
                        
                        {edu.gpa && (
                          <div className="text-muted-foreground mb-2">
                            GPA: {edu.gpa}
                          </div>
                        )}
                        
                        {edu.description && (
                          <div className="text-muted-foreground whitespace-pre-line">{edu.description}</div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Skills Column */}
          <div>
            <h3 className="text-2xl font-semibold mb-6 flex items-center">
              <Code className="h-6 w-6 text-primary mr-3" />
              Technical Skills
            </h3>
            
            <div className="space-y-6">
              {skillCategories.length === 0 ? (
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground text-center">
                      No skills found. Add some in the admin panel.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                skillCategories.map((category) => (
                  <Card key={category.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {category.skills.length === 0 ? (
                        <p className="text-muted-foreground text-sm">
                          No skills in this category yet.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {category.skills.map((skill) => (
                            <div key={skill.id}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm font-medium">{skill.name}</span>
                                <span className="text-sm text-muted-foreground">
                                  {skill.level}%
                                </span>
                              </div>
                              <Progress value={skill.level} className="h-2" />
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
