import React, { useState, useEffect } from 'react';
import { BarberItem } from '../../types';
import { barbersService } from '../../services/barbers.service';
import { useToast } from '../common/Toast';
import { Plus, Edit, Trash2, User, Check, X } from 'lucide-react';
import { getImageUrl, handleImageError } from '../../lib/images';

export const AdminBarbers: React.FC = () => {
  const { showToast } = useToast();
  const [barbers, setBarbers] = useState<BarberItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit / Create modal
  const [isEditing, setIsEditing] = useState(false);
  const [editItem, setEditItem] = useState<Partial<BarberItem>>({
    name: '',
    bio: '',
    image_url: '',
    specialties: ['Classic Tapers', 'Hot Towel Shave'],
    active: true,
    display_order: 1,
  });

  const [specialtyInput, setSpecialtyInput] = useState('');

  const loadBarbers = async () => {
    setLoading(true);
    try {
      const list = await barbersService.getAll(true);
      setBarbers(list);
    } catch (err) {
      console.error('Error loading barbers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBarbers();
  }, []);

  const handleOpenCreate = () => {
    setEditItem({
      name: '',
      bio: '',
      image_url: '',
      specialties: ['Precision Tapers', 'Beard Sculpting'],
      active: true,
      display_order: barbers.length + 1,
    });
    setSpecialtyInput('');
    setIsEditing(true);
  };

  const handleOpenEdit = (barber: BarberItem) => {
    setEditItem(barber);
    setSpecialtyInput('');
    setIsEditing(true);
  };

  const handleAddSpecialty = () => {
    if (!specialtyInput.trim()) return;
    const current = editItem.specialties || [];
    if (!current.includes(specialtyInput.trim())) {
      setEditItem({ ...editItem, specialties: [...current, specialtyInput.trim()] });
    }
    setSpecialtyInput('');
  };

  const handleRemoveSpecialty = (spec: string) => {
    const current = editItem.specialties || [];
    setEditItem({ ...editItem, specialties: current.filter((s) => s !== spec) });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editItem.name) {
      showToast('Please provide a barber or chair name.', 'error');
      return;
    }

    try {
      if (editItem.id) {
        await barbersService.update(editItem.id, editItem);
        showToast('Barber profile updated.', 'success');
      } else {
        await barbersService.create({
          name: editItem.name,
          bio: editItem.bio || '',
          image_url: editItem.image_url || undefined,
          specialties: editItem.specialties || [],
          active: editItem.active ?? true,
          display_order: Number(editItem.display_order || barbers.length + 1),
        });
        showToast('New barber chair profile added.', 'success');
      }
      setIsEditing(false);
      loadBarbers();
    } catch (err: any) {
      showToast(err.message || 'Error saving barber.', 'error');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Delete profile for "${name}"?`)) return;
    try {
      await barbersService.delete(id);
      showToast('Barber profile deleted.', 'info');
      loadBarbers();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete barber.', 'error');
    }
  };

  const handleToggleActive = async (barber: BarberItem) => {
    try {
      await barbersService.update(barber.id, { active: !barber.active });
      showToast(`Barber ${!barber.active ? 'activated' : 'deactivated'}.`, 'success');
      setBarbers((prev) =>
        prev.map((b) => (b.id === barber.id ? { ...b, active: !b.active } : b))
      );
    } catch (err) {
      showToast('Error updating active state.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Team & Chairs
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Barber Profile Management
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Manage your barbershop team, chair assignments, photos, and styling specialties.
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD BARBER PROFILE
        </button>
      </div>

      {/* Barbers Table */}
      <div className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden">
        {loading ? (
          <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading team...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#B8B5AE]">
              <thead className="bg-[#141517] text-[#F5F2EA] uppercase tracking-wider font-semibold border-b border-[#2E3035]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Barber</th>
                  <th className="py-3 px-4">Bio</th>
                  <th className="py-3 px-4">Specialties</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2E3035]">
                {barbers.map((b) => (
                  <tr key={b.id} className="hover:bg-[#202124]">
                    <td className="py-3 px-4 font-mono">{b.display_order}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {b.image_url ? (
                          <img
                            src={getImageUrl(b.image_url)}
                            alt={b.name}
                            className="w-9 h-9 rounded-full object-cover border border-[#2E3035]"
                            onError={handleImageError}
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-[#202124] border border-[#2E3035] flex items-center justify-center text-[#C5A059] font-serif">
                            {b.name.charAt(0)}
                          </div>
                        )}
                        <strong className="text-[#F5F2EA]">{b.name}</strong>
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate text-[11px]">
                      {b.bio || 'Master barber at U.S. Barber.'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {b.specialties?.slice(0, 2).map((s, idx) => (
                          <span
                            key={idx}
                            className="bg-[#121314] px-2 py-0.5 rounded text-[10px] text-[#C5A059] border border-[#2E3035]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(b)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                          b.active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                        }`}
                      >
                        {b.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1 text-[#B8B5AE] hover:text-[#C5A059]"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name)}
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

      {/* Modal: Create or Edit Barber */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-lg w-full p-6 sm:p-8 space-y-6">
            <div className="flex justify-between items-center border-b border-[#2E3035] pb-4">
              <h3 className="font-serif text-2xl text-[#F5F2EA]">
                {editItem.id ? 'Edit Barber Profile' : 'Add New Barber'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="text-[#B8B5AE] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Barber / Chair Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Barber Chair 1 or John Doe"
                  value={editItem.name || ''}
                  onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  placeholder="Experience, barbering style, grooming approach..."
                  value={editItem.bio || ''}
                  onChange={(e) => setEditItem({ ...editItem, bio: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Profile Photo URL</label>
                <input
                  type="text"
                  placeholder="https://images.unsplash.com/..."
                  value={editItem.image_url || ''}
                  onChange={(e) => setEditItem({ ...editItem, image_url: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              {/* Specialties Tagger */}
              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Specialties</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Hot Towel Shave, Skin Fade"
                    value={specialtyInput}
                    onChange={(e) => setSpecialtyInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSpecialty();
                      }
                    }}
                    className="flex-1 bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleAddSpecialty}
                    className="px-3 bg-[#202124] text-[#F5F2EA] border border-[#2E3035] rounded font-semibold"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {editItem.specialties?.map((spec, idx) => (
                    <span
                      key={idx}
                      className="bg-[#121314] text-[#C5A059] px-2 py-1 rounded border border-[#2E3035] flex items-center gap-1.5"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecialty(spec)}
                        className="text-[#B8B5AE] hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="barber_active"
                    checked={editItem.active ?? true}
                    onChange={(e) => setEditItem({ ...editItem, active: e.target.checked })}
                    className="rounded text-[#C5A059]"
                  />
                  <label htmlFor="barber_active" className="text-[#F5F2EA] font-medium">
                    Barber is Active
                  </label>
                </div>
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
                  Save Barber
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
