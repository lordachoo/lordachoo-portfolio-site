import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { BlogPost } from "@shared/schema";

export function BlogSection() {
  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog", { published: true }],
    queryFn: () => fetch("/api/blog?published=true").then(res => res.json()),
  });

  const recentPosts = posts.slice(0, 3);

  return (
    <section id="blog" className="p-8 lg:p-12 bg-card">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Latest Blog Posts</h2>
          <p className="text-xl text-muted-foreground">
            Thoughts on software development, technology trends, and lessons learned.
          </p>
        </div>

        <div className="space-y-8">
          {recentPosts.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No blog posts found. Create some in the admin panel.
                </p>
                <Button asChild>
                  <a href="/admin">Go to Admin Panel</a>
                </Button>
              </CardContent>
            </Card>
          ) : (
            recentPosts.map((post) => (
              <article key={post.id} className="blog-card">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <Badge variant="secondary">{post.category}</Badge>
                        <time className="text-sm text-muted-foreground">
                          {formatDate(post.publishedAt || post.createdAt)}
                        </time>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {post.readTime && (
                          <span className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{post.readTime} min read</span>
                          </span>
                        )}
                        
                        {post.views !== null && (
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} views</span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-semibold hover:text-primary transition-colors cursor-pointer">
                      {post.title}
                    </h3>
                  </CardHeader>
                  
                  <CardContent>
                    {post.excerpt && (
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {post.excerpt}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-2">
                        {post.tags?.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button variant="ghost" className="text-primary hover:text-primary/80">
                        Read More
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </article>
            ))
          )}
        </div>

        {posts.length > 3 && (
          <div className="text-center mt-12">
            <Button size="lg" className="inline-flex items-center">
              View All Posts
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
