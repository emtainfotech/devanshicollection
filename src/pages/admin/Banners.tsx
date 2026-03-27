import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { api } from '@/lib/api';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminBanners = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ position: 'all', status: 'all' });

  const { data: banners } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: async () => {
      return await api.get('/admin/banners');
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (b: any) => {
      const payload = { title: b.title || null, subtitle: b.subtitle || null, image_url: b.image_url, link: b.link || null, position: b.position, is_active: b.is_active, sort_order: parseInt(b.sort_order) || 0 };
      if (b.id) {
        await api.put(`/admin/banners/${b.id}`, payload);
      } else {
        await api.post('/admin/banners', payload);
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); setDialogOpen(false); toast.success('Banner saved'); },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => { await api.del(`/admin/banners/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-banners'] }); toast.success('Deleted'); },
  });

  const filteredBanners = useMemo(() => {
    if (!banners) return [];
    return banners.filter((b: any) => {
      const searchLower = search.toLowerCase();
      const titleMatch = (b.title || '').toLowerCase().includes(searchLower);
      const subtitleMatch = (b.subtitle || '').toLowerCase().includes(searchLower);
      const positionMatch = filters.position === 'all' || b.position === filters.position;
      const statusMatch = filters.status === 'all' || (b.is_active ? 'active' : 'inactive') === filters.status;
      return (titleMatch || subtitleMatch) && positionMatch && statusMatch;
    });
  }, [banners, search, filters]);

  const handleSystemImagePick = (file?: File | null) => {
    if (!file || !editing) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setEditing({ ...editing, image_url: result });
      toast.success('Banner image loaded from system');
    };
    reader.readAsDataURL(file);
  };

  return (
    <AdminLayout title="Banners">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <div className="relative w-full md:w-64">
          <Input 
            placeholder="Search by title or subtitle..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={filters.position} onValueChange={(v) => setFilters(f => ({ ...f, position: v }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Position" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              <SelectItem value="hero">Hero</SelectItem>
              <SelectItem value="mid">Mid</SelectItem>
              <SelectItem value="footer">Footer</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.status} onValueChange={(v) => setFilters(f => ({ ...f, status: v }))}>
            <SelectTrigger className="w-32"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => { setEditing({ title: '', subtitle: '', image_url: '', link: '', position: 'hero', is_active: true, sort_order: '0' }); setDialogOpen(true); }} size="sm" className="gap-1">
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredBanners?.map((b) => (
          <div key={b.id} className="bg-background rounded-lg border border-border p-4 flex gap-4 items-center">
            <img src={b.image_url} alt={b.title || 'Banner Image'} className="w-32 h-20 rounded object-cover" />
            <div className="flex-1">
              <h3 className="font-body font-medium text-sm">{b.title || 'Untitled Banner'}</h3>
              <p className="text-xs text-muted-foreground">{b.subtitle || 'No subtitle'}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-xs bg-secondary px-2 py-0.5 rounded">{b.position}</span>
                <span className={`text-xs px-2 py-0.5 rounded ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {b.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => { setEditing({ ...b, sort_order: String(b.sort_order) }); setDialogOpen(true); }} className="p-2 hover:bg-accent rounded"><Pencil className="h-4 w-4" /></button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button className="p-2 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                    <AlertDialogDescription>Are you sure? This cannot be undone.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle className="font-display text-xl">{editing?.id ? 'Edit' : 'New'} Banner</DialogTitle></DialogHeader>
          {editing && (
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editing); }} className="space-y-4">
              <div><Label className="font-body text-xs">Title (Optional)</Label><Input value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
              <div><Label className="font-body text-xs">Subtitle (Optional)</Label><Input value={editing.subtitle || ''} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></div>
              <div>
                <Label className="font-body text-xs">Image URL</Label>
                <Input value={editing.image_url} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} required />
              </div>
              <div>
                <Label className="font-body text-xs">Upload Image From System</Label>
                <Input type="file" accept="image/*" onChange={(e) => handleSystemImagePick(e.target.files?.[0] || null)} />
              </div>
              <div>
                <Label className="font-body text-xs">Link</Label>
                <Input value={editing.link || ''} onChange={(e) => setEditing({ ...editing, link: e.target.value })} placeholder="/products?category=dresses" />
              </div>
              <div><Label className="font-body text-xs">Position</Label>
                <select value={editing.position} onChange={(e) => setEditing({ ...editing, position: e.target.value })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background">
                  <option value="hero">Hero</option>
                  <option value="mid">Mid</option>
                  <option value="footer">Footer</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={editing.is_active} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked })} />
                <Label className="font-body text-xs">Active</Label>
              </div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit">Save</Button></div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminBanners;
