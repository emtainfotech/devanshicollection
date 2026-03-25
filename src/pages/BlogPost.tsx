import Layout from "@/components/layout/Layout";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Calendar, User, ArrowLeft, Share2 } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams();
  
  const { data: blog, isLoading, error } = useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      return await api.get(`/blogs/${slug}`);
    },
    enabled: !!slug
  });

  if (isLoading) return (
    <Layout>
      <div className="container mx-auto px-4 py-20 animate-pulse">
        <div className="h-4 bg-secondary w-20 mb-8 rounded" />
        <div className="h-12 bg-secondary w-2/3 mb-12 rounded" />
        <div className="h-[500px] bg-secondary w-full mb-12 rounded-3xl" />
        <div className="space-y-4">
          <div className="h-4 bg-secondary w-full rounded" />
          <div className="h-4 bg-secondary w-full rounded" />
          <div className="h-4 bg-secondary w-3/4 rounded" />
        </div>
      </div>
    </Layout>
  );

  if (error || !blog) return (
    <Layout>
      <div className="container mx-auto px-4 py-40 text-center">
        <h1 className="font-display text-4xl font-bold mb-6">Blog post not found</h1>
        <p className="font-body text-muted-foreground mb-12">The post you're looking for might have been moved or deleted.</p>
        <Link to="/blog" className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3 rounded-full font-display font-bold">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to blog
        </Link>
        
        <header className="mb-12">
          <div className="flex items-center gap-6 text-xs font-body text-muted-foreground uppercase tracking-widest mb-6">
            <span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> {new Date(blog.published_at).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><User className="h-4 w-4 text-primary" /> {blog.author || "Admin"}</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl font-bold mb-8 italic text-primary leading-tight">{blog.title}</h1>
          
          <div className="flex items-center justify-between py-6 border-y border-border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-display font-bold text-lg">
                {(blog.author || "A")[0]}
              </div>
              <div>
                <p className="font-display font-bold">{blog.author || "Admin"}</p>
                <p className="text-xs font-body text-muted-foreground">Devanshi Collection Team</p>
              </div>
            </div>
            <button className="h-10 w-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all">
              <Share2 className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="mb-16">
          <img 
            src={blog.image_url || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"} 
            alt={blog.title} 
            className="w-full h-[500px] object-cover rounded-3xl shadow-2xl"
          />
        </div>

        <div className="prose prose-lg max-w-none font-body text-muted-foreground leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
        
        <div className="mt-20 pt-12 border-t border-border">
          <h3 className="font-display text-2xl font-bold mb-8">Related Stories</h3>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Simple related blog placeholder */}
            <p className="font-body text-sm text-muted-foreground italic">Stay tuned for more updates!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
