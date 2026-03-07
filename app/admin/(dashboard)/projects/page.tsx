'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Project } from '@/types/database';
import { Plus, Edit, Trash2, Star, StarOff, ExternalLink, Github, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import ImageUpload from '@/components/admin/ImageUpload';

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; projectId: string | null; projectName: string }>({
    isOpen: false,
    projectId: null,
    projectName: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    live_url: '',
    github_url: '',
    featured: false,
  });
  const supabase = createClient();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProject) {
      const { error } = await supabase
        .from('projects')
        .update(formData)
        .eq('id', editingProject.id);

      if (error) {
        console.error('Error updating project:', error);
        toast.error('Error updating project');
      } else {
        fetchProjects();
        resetForm();
        toast.success('Project updated successfully!');
      }
    } else {
      const { error } = await supabase.from('projects').insert([formData]);

      if (error) {
        console.error('Error creating project:', error);
        toast.error('Error creating project');
      } else {
        fetchProjects();
        resetForm();
        toast.success('Project created successfully!');
      }
    }
  };

  const openDeleteModal = (project: Project) => {
    setDeleteModal({
      isOpen: true,
      projectId: project.id,
      projectName: project.name,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, projectId: null, projectName: '' });
  };

  const handleDelete = async () => {
    if (!deleteModal.projectId) return;
    
    setDeleting(true);
    const { error } = await supabase.from('projects').delete().eq('id', deleteModal.projectId);

    if (error) {
      console.error('Error deleting project:', error);
      toast.error('Error deleting project');
    } else {
      fetchProjects();
      toast.success('Project deleted successfully!');
    }
    setDeleting(false);
    closeDeleteModal();
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      image_url: project.image_url || '',
      live_url: project.live_url || '',
      github_url: project.github_url || '',
      featured: project.featured,
    });
    setShowForm(true);
  };

  const toggleFeatured = async (project: Project) => {
    const { error } = await supabase
      .from('projects')
      .update({ featured: !project.featured })
      .eq('id', project.id);

    if (error) {
      console.error('Error updating featured status:', error);
      toast.error('Error updating featured status');
    } else {
      fetchProjects();
      toast.success(project.featured ? 'Removed from homepage!' : 'Featured on homepage!');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      image_url: '',
      live_url: '',
      github_url: '',
      featured: false,
    });
    setEditingProject(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading projects...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)]">Projects</h1>
          <p className="text-[var(--text-secondary)]">Manage your creations and showcase gallery.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Add New Project
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden fade-up">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display flex items-center gap-3">
              <span className="w-10 h-10 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
                <Plus className="text-[var(--cookd-orange)]" size={20} />
              </span>
              {editingProject ? 'Edit Project' : 'Create New Project'}
            </h2>
            <button 
              onClick={resetForm}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-cream)] rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. My Amazing App"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Tell the world what this project is about..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] focus:ring-2 focus:ring-[var(--cookd-orange)]/10 transition-all font-medium resize-none"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Image Upload */}
                <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-2">
                  <ImageUpload
                    value={formData.image_url}
                    onChange={(url) => setFormData({ ...formData, image_url: url })}
                    folder="project-images"
                    label="Project Thumbnail"
                    aspectRatio="video"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Live Preview URL
                </label>
                <div className="relative">
                  <ExternalLink className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Source Code (GitHub)
                </label>
                <div className="relative">
                  <Github className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={formData.github_url}
                    onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-5 h-5 rounded-lg border-[var(--border-light)] bg-white text-[var(--cookd-orange)] focus:ring-[var(--cookd-orange)] transition-all"
                />
                <label htmlFor="featured" className="text-lg font-bold text-[var(--text-primary)] font-display cursor-pointer select-none">
                  Feature on Homepage
                </label>
              </div>
              <p className="text-sm text-[var(--text-muted)] mt-2 ml-8 font-medium">
                Highlighted in the gallery. This does not automatically add to the Hall of Fame rankings.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-light)]">
              <button type="submit" className="btn-primary flex-1 py-4 text-lg shadow-lg shadow-orange-500/10">
                {editingProject ? 'Save Changes' : 'Publish Project'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1 py-4 text-lg"
              >
                Discard Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white border border-[var(--border-light)] rounded-2xl p-10 text-center shadow-sm">
            <div className="w-16 h-16 bg-[var(--surface-cream)] rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderKanban className="text-[var(--text-muted)]" size={28} />
            </div>
            <p className="text-[var(--text-muted)] font-medium">No projects yet. Create your first project!</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[var(--border-light)] rounded-2xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="text-[var(--text-primary)] font-bold truncate">{project.name}</div>
                  {project.description && (
                    <div className="text-[var(--text-muted)] text-sm mt-1 line-clamp-2">
                      {project.description}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => toggleFeatured(project)}
                  className={`p-2 rounded-xl shrink-0 ml-2 transition-all ${
                    project.featured
                      ? 'text-[var(--cookd-orange)] bg-[var(--cookd-orange)]/10'
                      : 'text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-[var(--surface-cream)]'
                  }`}
                  title={project.featured ? 'Remove from Homepage' : 'Feature on Homepage'}
                >
                  {project.featured ? <Star size={18} fill="currentColor" /> : <StarOff size={18} />}
                </button>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--cookd-orange)] transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                {project.github_url && (
                  <a
                    href={project.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--text-muted)] hover:text-[var(--cookd-orange)] transition-colors"
                  >
                    <Github size={16} />
                  </a>
                )}
                <span className="text-[var(--text-muted)] text-xs font-medium">
                  {new Date(project.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex gap-2 pt-3 border-t border-[var(--border-light)]">
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-[var(--surface-cream)] rounded-xl text-sm font-medium transition-all"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => openDeleteModal(project)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl text-sm font-medium transition-all"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white border border-[var(--border-light)] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--surface-cream)] border-b border-[var(--border-light)]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Featured
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-light)]">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[var(--text-muted)]">
                    No projects yet. Create your first project!
                  </td>
                </tr>
              ) : (
                projects.map((project) => (
                  <tr key={project.id} className="hover:bg-[var(--surface-cream)]/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[var(--text-primary)] font-bold">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-[var(--text-muted)] truncate max-w-md">
                          {project.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleFeatured(project)}
                        className={`p-2 rounded-xl transition-all ${
                          project.featured
                            ? 'text-[var(--cookd-orange)] bg-[var(--cookd-orange)]/10'
                            : 'text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-[var(--surface-cream)]'
                        }`}
                        title={project.featured ? 'Remove from Homepage' : 'Feature on Homepage'}
                      >
                        {project.featured ? <Star size={20} fill="currentColor" /> : <StarOff size={20} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--text-muted)]">
                      {new Date(project.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(project)}
                          className="p-2 text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-[var(--surface-cream)] rounded-xl transition-all"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => openDeleteModal(project)}
                          className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteModal.projectName}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
