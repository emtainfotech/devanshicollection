import Layout from "@/components/layout/Layout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link } from "react-router-dom";
import { Calendar, User, ArrowRight } from "lucide-react";

const Blog = () => {
  const { data: blogs, isLoading } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      return await api.get('/blogs');
    },
  });

  return (
    <Layout>
      <div className="bg-secondary/30 py-20 border-b border-border">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-6 italic text-primary">Our Blog</h1>
          <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
            Stay updated with the latest trends, styling tips, and news from Devanshi Collection.
          </p>
        </div>
      </div>

      <div className="py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-6">
                  <div className="bg-secondary h-64 rounded-2xl w-full" />
                  <div className="h-4 bg-secondary w-1/3 rounded" />
                  <div className="h-8 bg-secondary w-full rounded" />
                  <div className="h-20 bg-secondary w-full rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-12">
              {blogs?.map((blog: any) => (
                <Link key={blog.id} to={`/blog/${blog.slug}`} className="group space-y-6 block">
                  <div className="relative overflow-hidden rounded-2xl aspect-[4/3] shadow-lg border border-border">
                    <img 
                      src={blog.image_url || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"} 
                      alt={blog.title} 
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs font-body text-muted-foreground uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(blog.published_at).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><User className="h-3 w-3" /> {blog.author || "Admin"}</span>
                    </div>
                    
                    <h2 className="font-display text-2xl font-bold group-hover:text-primary transition-colors leading-tight">
                      {blog.title}
                    </h2>
                    
                    <p className="font-body text-muted-foreground text-sm leading-relaxed line-clamp-3">
                      {blog.excerpt}
                    </p>
                    
                    <div className="pt-4 flex items-center gap-2 font-display font-bold text-sm text-primary group-hover:translate-x-2 transition-transform">
                      Read More <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              ))}
              {(!blogs || blogs.length === 0) && (
                <div className="col-span-full py-20 text-center space-y-4">
                  <p className="font-display text-2xl text-muted-foreground italic">No blogs published yet.</p>
                  <p className="font-body text-sm text-muted-foreground">Check back soon for exciting updates!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
