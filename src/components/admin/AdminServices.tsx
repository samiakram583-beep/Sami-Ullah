import React, { useState, useEffect } from 'react';
import { ServiceItem } from '../../types';
import { servicesService } from '../../services/services.service';
import { useToast } from '../common/Toast';
import { Plus, Edit, Trash2, CheckCircle2, Clock, Scissors, Power } from 'lucide-react';

export const AdminServices: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create Modal
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<ServiceItem>>({
    name: '',
    slug: '',
    description: '',
    price: 35.0,
    duration_minutes: 30,
    category: 'Haircuts',
    active: true,
    display_order: 1,
  });

  const loadServices = async () => {
    setLoading(true);
    try {
      const list = await servicesService.getAll(true);
      setServices(list);
    } catch (err) {
      console.error('Error loading services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleOpenCreate = () => {
    setEditItem({
      name: '',
      slug: '',
      description: '',
      price: 35.0,
      duration_minutes: 30,
      category: 'Haircuts',
      active: true,
      display_order: services.length + 1,
    });
    setIsEditing(true);
  };

  const handleOpenEdit = (svc: ServiceItem) => {
    setEditItem(svc);
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem.name || !editItem.description) {
      showToast('Please provide service name and description.', 'error');
      return;
    }
    if ((editItem.price ?? 0) <= 0) {
      showToast('Price must be greater than zero.', 'error');
      return;
    }
    if ((editItem.duration_minutes ?? 0) <= 0) {
      showToast('Duration must be greater than zero minutes.', 'error');
      return;
    }

    try {
      if (editItem.id) {
        await servicesService.update(editItem.id, editItem);
        showToast('Service updated successfully.', 'success');
      } else {
        await servicesService.create({
          name: editItem.name,
          slug: editItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: editItem.description,
          price: Number(editItem.price),
          duration_minutes: Number(editItem.duration_minutes),
          category: editItem.category || 'Haircuts',
          image_url: editItem.image_url || undefined,
          active: editItem.active ?? true,
          display_order: Number(editItem.display_order || services.length + 1),
        });
        showToast('New service created.', 'success');
      }
      setIsEditing(false);
      loadServices();
    } catch (err: any) {
      showToast(err.message || 'Error saving service.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await servicesService.delete(id);
      showToast('Service deleted.', 'info');
      loadServices();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete service.', 'error');
    }
  };

  const handleToggleActive = async (svc: ServiceItem) => {
    try {
      await servicesService.update(svc.id, { active: !svc.active });
      showToast(`Service ${!svc.active ? 'activated' : 'deactivated'}.`, 'success');
      setServices((prev) =>
        prev.map((s) => (s.id === svc.id ? { ...s, active: !s.active } : s))
      );
    } catch (err: any) {
      showToast('Error updating status.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Catalog Configuration
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Service Menu Management
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Create, update prices, change durations, and manage grooming offerings.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD NEW SERVICE
        </button>
      </div>

      {/* Services Table */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading services...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B8B5AE]">
              <thead className="bg-[#141517] text-[#F5F2EA] uppercase tracking-wider font-semibold border-b border-[#2E3035]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3035]">
                {services.map((svc) => (
                  <tr key={svc.id} className="hover:bg-[#202124]">
                    <td className="py-3 px-4 font-mono">{svc.display_order}</td>
                    <td className="py-3 px-4">
                      <strong className="text-[#F5F2EA] block">{svc.name}</strong>
                      <span className="text-[11px] text-[#B8B5AE] line-clamp-1">
                        {svc.description}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-[#121314] px-2 py-0.5 rounded border border-[#2E3035] text-[11px]">
                        {svc.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 tabular-nums text-[#F5F2EA]">
                      {svc.duration_minutes} min
                    </td>
                    <td className="py-3 px-4 tabular-nums font-semibold text-[#C5A059]">
                      ${svc.price.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(svc)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                          svc.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {svc.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(svc)}
                          className="p-1 text-[#B8B5AE] hover:text-[#C5A059]"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(svc.id, svc.name)}
                          className="p-1 text-[#B8B5AE] hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Service */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#2E3035] pb-4">
              <h3 className="font-serif text-2xl text-[#F5F2EA]">
                {editItem.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-[#B8B5AE] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Haircut & Taper"
                  value={editItem.name || ''}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detailed description of the service and tools used..."
                  value={editItem.description || ''}
                  onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={editItem.price || ''}
                    onChange={(e) => setEditItem({ ...editItem, price: parseFloat(e.target.value) })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Duration (Minutes) *</label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    required
                    value={editItem.duration_minutes || ''}
                    onChange={(e) => setEditItem({ ...editItem, duration_minutes: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Category</label>
                  <select
                    value={editItem.category || 'Haircuts'}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  >
                    <option value="Haircuts">Haircuts</option>
                    <option value="Beard & Shave">Beard & Shave</option>
                    <option value="Packages">Packages</option>
                    <option value="Grooming">Grooming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#F5F2EA] font-semibold mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={editItem.display_order || 1}
                    onChange={(e) => setEditItem({ ...editItem, display_order: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Image URL (Optional)</label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={editItem.image_url || ''}
                  onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="active_check"
                  checked={editItem.active ?? true}
                  onChange={(e) => setEditItem({ ...editItem, active: e.target.checked })}
                  className="rounded text-[#C5A059]"
                />
                <label htmlFor="active_check" className="text-[#F5F2EA] font-medium">
                  Service is active and visible in public booking
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2E3035]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-[#202124] text-[#B8B5AE] hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#C5A059] text-[#121314] font-semibold uppercase tracking-wider"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
