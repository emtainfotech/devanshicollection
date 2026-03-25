import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Calendar, User, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminBlogs = () => {
  const queryClient = useQueryClient();
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    image_url: '',
    author: '',
    is_published: true
  });

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: async () => {
      return await api.get('/admin/blogs');
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/admin/blogs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog post created');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create blog'),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/admin/blogs/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog post updated');
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update blog'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.del(`/admin/blogs/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] });
      toast.success('Blog post deleted');
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete blog'),
  });

  const filteredBlogs = useMemo(() => {
    if (!blogs) return [];
    return blogs.filter((b: any) => {
      const searchLower = search.toLowerCase();
      const titleMatch = b.title.toLowerCase().includes(searchLower);
      const slugMatch = b.slug.toLowerCase().includes(searchLower);
      const statusMatch = filter === 'all' || (b.is_published ? 'published' : 'draft') === filter;
      return (titleMatch || slugMatch) && statusMatch;
    });
  }, [blogs, search, filter]);

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      image_url: '',
      author: '',
      is_published: true
    });
    setEditingBlog(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBlog) {
      updateMutation.mutate({ id: editingBlog.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (blog: any) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      slug: blog.slug,
      content: blog.content,
      excerpt: blog.excerpt || '',
      image_url: blog.image_url || '',
      author: blog.author || '',
      is_published: blog.is_published === 1
    });
    setIsDialogOpen(true);
  };

  return (
    <AdminLayout title="Blogs">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search by title or slug..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
            <Plus className="h-4 w-4" /> New Blog Post
          </Button>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden shadow-sm">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-4 font-medium uppercase tracking-wider text-xs">Blog Info</th>
              <th className="text-left p-4 font-medium uppercase tracking-wider text-xs">Author</th>
              <th className="text-left p-4 font-medium uppercase tracking-wider text-xs">Date</th>
              <th className="text-left p-4 font-medium uppercase tracking-wider text-xs">Status</th>
              <th className="text-right p-4 font-medium uppercase tracking-wider text-xs">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBlogs?.map((blog: any) => (
              <tr key={blog.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={blog.image_url || "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"} 
                      alt={blog.title} 
                      className="h-12 w-16 object-cover rounded shadow-sm" 
                    />
                    <div>
                      <p className="font-bold text-sm leading-tight mb-1">{blog.title}</p>
                      <p className="text-xs text-muted-foreground">/{blog.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <User className="h-3 w-3" /> {blog.author || "Admin"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(blog.created_at).toLocaleDateString()}
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    blog.is_published ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {blog.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="p-4 text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEdit(blog)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => { if(confirm('Delete this blog post?')) deleteMutation.mutate(blog.id); }}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {(!blogs || blogs.length === 0) && !isLoading && (
              <tr><td colSpan={5} className="p-12 text-center text-muted-foreground italic">No blogs found. Start by creating one!</td></tr>
            )}
            {isLoading && <tr><td colSpan={5} className="p-12 text-center text-muted-foreground">Loading blogs...</td></tr>}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl font-bold">{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Title</Label>
                <Input 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  placeholder="e.g. Summer Style Guide 2026"
                  required
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Slug (Unique Link)</Label>
                <Input 
                  value={formData.slug} 
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/ /g, '-') })} 
                  placeholder="e.g. summer-style-guide-2026"
                  required
                  className="bg-secondary/20 font-mono"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Author</Label>
                <Input 
                  value={formData.author} 
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })} 
                  placeholder="e.g. Devanshi"
                  className="bg-secondary/20"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-bold uppercase tracking-wider">Image URL</Label>
                <Input 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                  placeholder="https://images.unsplash.com/..."
                  className="bg-secondary/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider">Excerpt (Short Summary)</Label>
              <Input 
                value={formData.excerpt} 
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} 
                placeholder="A brief summary for the listing page..."
                className="bg-secondary/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold uppercase tracking-wider">Content (HTML allowed)</Label>
              <textarea 
                value={formData.content} 
                onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                rows={10}
                className="w-full px-4 py-3 bg-secondary/20 border border-input rounded-md text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Write your blog post here. Use <p>, <h2>, <strong> etc. for formatting."
                required
              />
            </div>

            <div className="flex items-center gap-2 py-4 border-t border-border">
              <input 
                type="checkbox" 
                id="is_published" 
                checked={formData.is_published} 
                onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
              />
              <Label htmlFor="is_published" className="text-sm font-bold uppercase tracking-wider cursor-pointer">Publish immediately</Label>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-border">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="px-8 font-bold">Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-12 font-bold shadow-lg shadow-primary/20">
                {editingBlog ? 'Update Blog' : 'Create Blog'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBlogs;
