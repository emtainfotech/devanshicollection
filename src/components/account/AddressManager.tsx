import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Home } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';

type Address = {
  id: string;
  full_name: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
};

const AddressForm = ({ address, onSave }: { address?: Address; onSave: () => void }) => {
  const [form, setForm] = useState({
    full_name: address?.full_name || '',
    phone: address?.phone || '',
    address_line1: address?.address_line1 || '',
    city: address?.city || '',
    state: address?.state || '',
    postal_code: address?.postal_code || '',
    is_default: address?.is_default || false,
  });

  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (newAddress: Omit<Address, 'id'>) =>
      address
        ? api.put(`/my-addresses/${address.id}`, newAddress)
        : api.post('/my-addresses', newAddress),
    onSuccess: () => {
      toast.success(`Address ${address ? 'updated' : 'saved'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      onSave();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save address');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="addressLine1">Address</Label>
        <Input id="addressLine1" value={form.address_line1} onChange={(e) => setForm({ ...form, address_line1: e.target.value })} required />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Input id="state" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postalCode">Postal Code</Label>
          <Input id="postalCode" value={form.postal_code} onChange={(e) => setForm({ ...form, postal_code: e.target.value })} required />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <input type="checkbox" id="is_default" checked={form.is_default} onChange={(e) => setForm({ ...form, is_default: e.target.checked })} />
        <Label htmlFor="is_default">Set as default address</Label>
      </div>
      <DialogFooter>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save Address'}
        </Button>
      </DialogFooter>
    </form>
  );
};

const AddressManager = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(undefined);
  const queryClient = useQueryClient();

  const { data: addresses, isLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: () => api.get('/my-addresses'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.del(`/my-addresses/${id}`),
    onSuccess: () => {
      toast.success('Address deleted');
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete address');
    },
  });

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6 mt-8">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl font-semibold">My Addresses</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew}><Plus className="mr-2 h-4 w-4" /> Add New</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
            </DialogHeader>
            <AddressForm address={editingAddress} onSave={() => setIsFormOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Loading addresses...</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses?.map((address) => (
            <div key={address.id} className="rounded-lg border p-4 space-y-2 relative">
              {address.is_default && (
                <div className="absolute top-2 right-2 flex items-center text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  <Home className="h-3 w-3 mr-1" /> Default
                </div>
              )}
              <p className="font-semibold">{address.full_name}</p>
              <p className="text-sm text-muted-foreground">{address.phone}</p>
              <p className="text-sm text-muted-foreground">
                {address.address_line1}, {address.city}, {address.state} - {address.postal_code}
              </p>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(address)}>
                  <Edit className="h-3 w-3 mr-1" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(address.id)} disabled={deleteMutation.isPending}>
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
