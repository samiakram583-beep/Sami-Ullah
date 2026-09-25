import React, { useState, useEffect } from 'react';
import { GalleryImageItem } from '../../types';
import { galleryService } from '../../services/gallery.service';
import { useToast } from '../common/Toast';
import { Plus, Trash2, Image as ImageIcon, Eye, Power } from 'lucide-react';
import { getImageUrl, handleImageError } from '../../lib/images';

export const AdminGallery: React.FC = () => {
  const { showToast } = useToast();
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImage, setNewImage] = useState({
    image_url: '',
    title: '',
    alt_text: 'U.S. Barber Haircut & Grooming',
    display_order: 1,
    active: true,
  });

  const loadGallery = async () => {
    setLoading(true);
    try {
      const list = await galleryService.getAll(true);
      setImages(list);
    } catch (err) {
      console.error('Error loading gallery:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImage.image_url) {
      showToast('Please provide an image URL.', 'error');
      return;
    }

    try {
      await galleryService.add(newImage);
      showToast('Gallery image added successfully.', 'success');
      setShowAddModal(false);
      setNewImage({
        image_url: '',
        title: '',
        alt_text: 'U.S. Barber Haircut & Grooming',
        display_order: images.length + 1,
        active: true,
      });
      loadGallery();
    } catch (err: any) {
      showToast(err.message || 'Error adding image.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this gallery photo?')) return;
    try {
      await galleryService.delete(id);
      showToast('Image removed from gallery.', 'info');
      loadGallery();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete image.', 'error');
    }
  };

  const handleToggleActive = async (img: GalleryImageItem) => {
    try {
      await galleryService.update(img.id, { active: !img.active });
      showToast(`Image ${!img.active ? 'published' : 'hidden'}.`, 'success');
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, active: !i.active } : i))
      );
    } catch (err) {
      showToast('Failed to update image status.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2E3035] pb-6">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold">
            Visual Media
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-[#F5F2EA] mt-1">
            Gallery Management
          </h1>
          <p className="text-xs text-[#B8B5AE] mt-1">
            Curate the craftsmanship photos displayed on the customer showcase page.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-5 py-2.5 bg-[#C5A059] hover:bg-[#D4B06A] text-[#121314] font-semibold text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          ADD PHOTO
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-xs text-[#B8B5AE]">Loading gallery photos...</div>
      ) : images.length === 0 ? (
        <div className="py-24 text-center text-xs text-[#B8B5AE] space-y-2">
          <ImageIcon className="w-8 h-8 text-[#C5A059] mx-auto opacity-70" />
          <p className="text-sm font-medium text-[#F5F2EA]">No gallery images found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img) => (
            <div
              key={img.id}
              className="bg-[#1A1B1D] border border-[#2E3035] rounded overflow-hidden flex flex-col justify-between"
            >
              <div className="h-44 overflow-hidden relative">
                <img
                  src={getImageUrl(img.image_url)}
                  alt={img.alt_text}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute top-2 right-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold border ${
                      img.active
                        ? 'bg-emerald-500/80 text-white border-emerald-400'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-600'
                    }`}
                  >
                    {img.active ? 'Active' : 'Hidden'}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 text-xs">
                <span className="font-semibold text-[#F5F2EA] block truncate">
                  {img.title || 'Untitled Photo'}
                </span>
                <p className="text-[11px] text-[#B8B5AE] line-clamp-1">{img.alt_text}</p>
                <div className="text-[10px] text-[#C5A059]">Order: #{img.display_order}</div>

                <div className="pt-3 border-t border-[#2E3035] flex items-center justify-between">
                  <button
                    onClick={() => handleToggleActive(img)}
                    className="text-xs text-[#B8B5AE] hover:text-[#C5A059] transition-colors"
                  >
                    {img.active ? 'Hide' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#121314]/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1A1B1D] border border-[#2E3035] rounded max-w-md w-full p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#2E3035] pb-3">
              <h3 className="font-serif text-xl text-[#F5F2EA]">Add Gallery Photo</h3>
              <button onClick={() => setShowAddModal(false)} className="text-[#B8B5AE] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAdd} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Image URL *</label>
                <input
                  type="text"
                  required
                  placeholder="https://..."
                  value={newImage.image_url}
                  onChange={(e) => setNewImage({ ...newImage, image_url: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Title</label>
                <input
                  type="text"
                  placeholder="e.g. Master Razor Fade"
                  value={newImage.title}
                  onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Alt Text (Accessibility)</label>
                <input
                  type="text"
                  value={newImage.alt_text}
                  onChange={(e) => setNewImage({ ...newImage, alt_text: e.target.value })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-[#F5F2EA] font-semibold mb-1">Display Order</label>
                <input
                  type="number"
                  min="1"
                  value={newImage.display_order}
                  onChange={(e) => setNewImage({ ...newImage, display_order: parseInt(e.target.value, 10) })}
                  className="w-full bg-[#121314] border border-[#2E3035] p-2 text-[#F5F2EA] rounded focus:border-[#C5A059]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#2E3035]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#202124] text-[#B8B5AE] hover:text-white rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#C5A059] text-[#121314] font-semibold uppercase tracking-wider rounded"
                >
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
