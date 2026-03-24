import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatINR, toINRValue } from '@/lib/pricing';

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase.from('products').select('*, categories(name)').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*').order('sort_order');
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (product: any) => {
      const parseImages = (value?: string) => {
        const text = String(value || '').trim();
        if (!text) return [];
        const byLines = text.split('\n').map((s: string) => s.trim()).filter(Boolean);
        if (byLines.length > 1) return byLines;
        // Keep full base64 string intact if single data URL
        if (text.startsWith('data:image/')) return [text];
        return text.split(',').map((s: string) => s.trim()).filter(Boolean);
      };
      const payload = {
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: parseFloat(product.price),
        discount: parseInt(product.discount) || 0,
        sizes: product.sizes?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        colors: product.colors?.split(',').map((s: string) => s.trim()).filter(Boolean) || [],
        stock: parseInt(product.stock) || 0,
        category_id: product.category_id || null,
        images: parseImages(product.images),
        is_featured: product.is_featured || false,
        is_trending: product.is_trending || false,
        is_active: product.is_active !== false,
      };

      if (product.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDialogOpen(false);
      setEditingProduct(null);
      toast.success('Product saved');
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const openNew = () => {
    setEditingProduct({
      name: '', slug: '', description: '', price: '', discount: '0',
      sizes: '', colors: '', stock: '0', category_id: '', images: '',
      is_featured: false, is_trending: false, is_active: true,
    });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditingProduct({
      ...p,
      price: String(p.price),
      discount: String(p.discount),
      stock: String(p.stock),
      sizes: p.sizes?.join(', ') || '',
      colors: p.colors?.join(', ') || '',
      images: p.images?.join('\n') || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(editingProduct);
  };

  const handleProductImagesFromSystem = async (files: FileList | null) => {
    if (!files || !editingProduct) return;

    const readFile = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
        reader.onerror = () => reject(new Error('Failed to read image'));
        reader.readAsDataURL(file);
      });

    try {
      const values = await Promise.all(Array.from(files).map((file) => readFile(file)));
      const current = (editingProduct.images || '')
        .split('\n')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const merged = [...current, ...values].join('\n');
      setEditingProduct({ ...editingProduct, images: merged });
      toast.success(`${values.length} image(s) added from system`);
    } catch {
      toast.error('Unable to read selected image files');
    }
  };

  return (
    <AdminLayout title="Products">
      <div className="flex justify-between items-center mb-6">
        <p className="font-body text-sm text-muted-foreground">{products?.length || 0} products</p>
        <Button onClick={openNew} size="sm"><Plus className="h-4 w-4 mr-1" /> Add Product</Button>
      </div>

      <div className="bg-background rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm font-body">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="text-left p-3 font-medium">Product</th>
              <th className="text-left p-3 font-medium">Category</th>
              <th className="text-left p-3 font-medium">Price</th>
              <th className="text-left p-3 font-medium">Stock</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products?.map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {p.images?.[0] && (
                      <img src={p.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 text-muted-foreground">{(p as any).categories?.name || '—'}</td>
                <td className="p-3 tabular-nums">{formatINR(toINRValue(Number(p.price)))}{p.discount > 0 && <span className="text-primary ml-1">-{p.discount}%</span>}</td>
                <td className="p-3 tabular-nums">{p.stock}</td>
                <td className="p-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-accent rounded transition-colors"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id); }} className="p-1.5 hover:bg-destructive/10 rounded transition-colors text-destructive ml-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="p-8 text-center text-muted-foreground font-body text-sm">Loading...</div>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{editingProduct?.id ? 'Edit Product' : 'New Product'}</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-body text-xs">Name</Label>
                  <Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} required />
                </div>
                <div>
                  <Label className="font-body text-xs">Slug</Label>
                  <Input value={editingProduct.slug} onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label className="font-body text-xs">Description</Label>
                <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background" rows={3} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div><Label className="font-body text-xs">Price</Label><Input type="number" step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })} required /></div>
                <div><Label className="font-body text-xs">Discount %</Label><Input type="number" value={editingProduct.discount} onChange={(e) => setEditingProduct({ ...editingProduct, discount: e.target.value })} /></div>
                <div><Label className="font-body text-xs">Stock</Label><Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })} /></div>
              </div>
              <div>
                <Label className="font-body text-xs">Category</Label>
                <select value={editingProduct.category_id} onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })} className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background">
                  <option value="">Select category</option>
                  {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="font-body text-xs">Sizes (comma separated)</Label><Input value={editingProduct.sizes} onChange={(e) => setEditingProduct({ ...editingProduct, sizes: e.target.value })} placeholder="XS, S, M, L, XL" /></div>
                <div><Label className="font-body text-xs">Colors (comma separated)</Label><Input value={editingProduct.colors} onChange={(e) => setEditingProduct({ ...editingProduct, colors: e.target.value })} placeholder="Black, White" /></div>
              </div>
              <div>
                <Label className="font-body text-xs">Image URLs (one per line)</Label>
                <textarea
                  value={editingProduct.images}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
                  rows={4}
                  placeholder="https://...\nhttps://..."
                />
              </div>
              <div>
                <Label className="font-body text-xs">Upload Images From System</Label>
                <Input type="file" accept="image/*" multiple onChange={(e) => handleProductImagesFromSystem(e.target.files)} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm font-body">
                  <input type="checkbox" checked={editingProduct.is_featured} onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })} />Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-body">
                  <input type="checkbox" checked={editingProduct.is_trending} onChange={(e) => setEditingProduct({ ...editingProduct, is_trending: e.target.checked })} />Trending
                </label>
                <label className="flex items-center gap-2 text-sm font-body">
                  <input type="checkbox" checked={editingProduct.is_active} onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })} />Active
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Saving...' : 'Save Product'}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminProducts;
