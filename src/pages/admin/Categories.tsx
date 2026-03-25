import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      return await api.get('/admin/categories');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (cat: any) => {
      const payload = {
        name: cat.name,
        slug: cat.slug,
        description: cat.description || null,
        image_url: cat.image_url || null,
        parent_id: cat.parent_id || null,
        sort_order: parseInt(cat.sort_order) || 0,
        is_active: cat.is_active !== false,
      };
      if (cat.id) {
        await api.put(`/admin/categories/${cat.id}`, payload);
      } else {
        await api.post('/admin/categories', payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setDialogOpen(false);
      toast.success('Category saved');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    return categories.filter((c: any) => {
      const searchLower = search.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(searchLower);
      const slugMatch = c.slug.toLowerCase().includes(searchLower);
      const statusMatch = filter === 'all' || (c.is_active ? 'active' : 'inactive') === filter;
      return (nameMatch || slugMatch) && statusMatch;
    });
  }, [categories, search, filter]);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.del(`/admin/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
  });

  const openNew = () => {
    setEditing({ name: '', slug: '', description: '', image_url: '', parent_id: '', sort_order: '0', is_active: true });
    setDialogOpen(true);
  };

  const handleCategoryImageFromSystem = (file?: File | null) => {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setEditing({ ...editing, image_url: result });
      toast.success('Category image loaded from system');
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search by name or slug..." 
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={openNew} size="sm" className="gap-1"><Plus className="h-4 w-4" /> New</Button>
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Slug</th>
              <th className="text-left p-3 font-medium">Order</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories?.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-3 flex items-center gap-3">
                  {c.image_url && <img src={c.image_url} alt="" className="w-10 h-10 rounded object-cover" />}
                  <span className="font-medium">{c.name}</span>
                </td>
                <td className="p-3 text-muted-foreground">{c.slug}</td>
                <td className="p-3 tabular-nums">{c.sort_order}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => { setEditing({ ...c, sort_order: String(c.sort_order) }); setDialogOpen(true); }} className="p-1.5 hover:bg-accent rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id); }} className="p-1.5 hover:bg-destructive/10 rounded text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? 'Edit' : 'New'} Category</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label className="font-body text-xs">Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.id ? editing.slug : e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required /></div>
              <div><Label className="font-body text-xs">Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} required /></div>
              <div><Label className="font-body text-xs">Description</Label><Input value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} /></div>
              <div><Label className="font-body text-xs">Image URL</Label><Input value={editing.image_url || ''} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} /></div>
              <div>
                <Label className="font-body text-xs">Upload Image From System</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleCategoryImageFromSystem(e.target.files?.[0] || null)} />
              </div>
              <div><Label className="font-body text-xs">Parent Category</Label>
                <select value={editing.parent_id || ''} onChange={(e) => setEditing({ ...editing, parent_id: e.target.value || null })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background">
                  <option value="">None (top level)</option>
                  {categories?.filter((c) => c.id !== editing.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><Label className="font-body text-xs">Sort Order</Label><Input type="number" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value })} /></div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>Save</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCategories;
