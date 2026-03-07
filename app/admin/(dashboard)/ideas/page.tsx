'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Idea, Category } from '@/types/database';
import IdeaCard from '@/components/admin/IdeaCard';
import { Plus, X, Edit, Trash2, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';

export default function AdminIdeas() {
  const [ideas, setIdeas] = useState<(Idea & { categories?: Category | null })[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdeaForm, setShowIdeaForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [deleteModal, setDeleteModal] = useState<{ 
    isOpen: boolean; 
    type: 'idea' | 'category' | null;
    id: string | null; 
    name: string;
  }>({
    isOpen: false,
    type: null,
    id: null,
    name: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [ideaFormData, setIdeaFormData] = useState({
    title: '',
    description: '',
    emoji: '',
    category_id: '',
    status: 'plan_to_do' as 'plan_to_do' | 'done' | 'dropped',
  });
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    color: '#d4a017',
  });
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [ideasResult, categoriesResult] = await Promise.all([
      supabase
        .from('ideas')
        .select('*, categories(*)')
        .order('created_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (ideasResult.error) {
      console.error('Error fetching ideas:', ideasResult.error);
    } else {
      setIdeas(ideasResult.data || []);
    }

    if (categoriesResult.error) {
      console.error('Error fetching categories:', categoriesResult.error);
    } else {
      setCategories(categoriesResult.data || []);
    }

    setLoading(false);
  };

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...ideaFormData,
      category_id: ideaFormData.category_id || null,
      emoji: ideaFormData.emoji || null,
    };

    if (editingIdea) {
      const { error } = await supabase
        .from('ideas')
        .update(data)
        .eq('id', editingIdea.id);

      if (error) {
        console.error('Error updating idea:', error);
        toast.error('Error updating idea');
      } else {
        fetchData();
        resetIdeaForm();
        toast.success('Idea updated successfully!');
      }
    } else {
      const { error } = await supabase.from('ideas').insert([data]);

      if (error) {
        console.error('Error creating idea:', error);
        toast.error('Error creating idea');
      } else {
        fetchData();
        resetIdeaForm();
        toast.success('Idea created successfully!');
      }
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryFormData)
        .eq('id', editingCategory.id);

      if (error) {
        console.error('Error updating category:', error);
        toast.error('Error updating category');
      } else {
        fetchData();
        resetCategoryForm();
        toast.success('Category updated successfully!');
      }
    } else {
      const { error } = await supabase.from('categories').insert([categoryFormData]);

      if (error) {
        console.error('Error creating category:', error);
        toast.error(`Error creating category: ${error.message}`);
      } else {
        fetchData();
        resetCategoryForm();
        toast.success('Category created successfully!');
      }
    }
  };

  const openDeleteModal = (type: 'idea' | 'category', id: string, name: string) => {
    setDeleteModal({ isOpen: true, type, id, name });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, type: null, id: null, name: '' });
  };

  const handleDelete = async () => {
    if (!deleteModal.id || !deleteModal.type) return;
    
    setDeleting(true);
    
    if (deleteModal.type === 'idea') {
      const { error } = await supabase.from('ideas').delete().eq('id', deleteModal.id);

      if (error) {
        console.error('Error deleting idea:', error);
        toast.error('Error deleting idea');
      } else {
        fetchData();
        toast.success('Idea deleted successfully!');
      }
    } else {
      const { error } = await supabase.from('categories').delete().eq('id', deleteModal.id);

      if (error) {
        console.error('Error deleting category:', error);
        toast.error('Error deleting category');
      } else {
        fetchData();
        toast.success('Category deleted successfully!');
      }
    }
    
    setDeleting(false);
    closeDeleteModal();
  };

  const handleStatusChange = async (idea: Idea, newStatus: 'plan_to_do' | 'done' | 'dropped') => {
    const { error } = await supabase
      .from('ideas')
      .update({ status: newStatus })
      .eq('id', idea.id);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Error updating status');
    } else {
      fetchData();
      toast.success('Status updated!');
    }
  };

  const handleEditIdea = (idea: Idea) => {
    setEditingIdea(idea);
    setIdeaFormData({
      title: idea.title,
      description: idea.description || '',
      emoji: idea.emoji || '',
      category_id: idea.category_id || '',
      status: idea.status,
    });
    setShowIdeaForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      color: category.color,
    });
    setShowCategoryForm(true);
  };

  const resetIdeaForm = () => {
    setIdeaFormData({
      title: '',
      description: '',
      emoji: '',
      category_id: '',
      status: 'plan_to_do',
    });
    setEditingIdea(null);
    setShowIdeaForm(false);
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      color: '#d4a017',
    });
    setEditingCategory(null);
    setShowCategoryForm(false);
  };

  const filteredIdeas = ideas.filter((idea) => {
    const categoryMatch = selectedCategory === 'all' || idea.category_id === selectedCategory;
    const statusMatch = selectedStatus === 'all' || idea.status === selectedStatus;
    return categoryMatch && statusMatch;
  });

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading ideas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)]">Ideas</h1>
          <p className="text-[var(--text-secondary)]">Manage your concept board and category labels.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <button
            onClick={() => {
              resetCategoryForm();
              setShowCategoryForm(true);
            }}
            className="btn-secondary flex items-center justify-center gap-2 px-6 py-4 font-bold"
          >
            <Plus size={20} />
            Add Category
          </button>
          <button
            onClick={() => {
              resetIdeaForm();
              setShowIdeaForm(true);
            }}
            className="btn-primary flex items-center justify-center gap-2 px-8 py-4 shadow-lg shadow-orange-500/20"
          >
            <Plus size={20} />
            Create Idea
          </button>
        </div>
      </div>

      {/* Category Management Form */}
      {showCategoryForm && (
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 mb-10 shadow-sm fade-up relative overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display flex items-center gap-3">
              <span className="w-10 h-10 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
                <Plus className="text-[var(--cookd-orange)]" size={20} />
              </span>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>
            <button
              onClick={resetCategoryForm}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-cream)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCategorySubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design, Development..."
                  value={categoryFormData.name}
                  onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Brand Color *
                </label>
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl border border-[var(--border-light)] overflow-hidden shrink-0 shadow-sm">
                    <input
                      type="color"
                      value={categoryFormData.color}
                      onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                      className="w-full h-full scale-150 cursor-pointer"
                    />
                  </div>
                  <input
                    type="text"
                    value={categoryFormData.color}
                    onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
                    className="flex-1 px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-mono font-bold"
                    placeholder="#FF6B35"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-light)]">
              <button type="submit" className="btn-primary flex-1 py-4 font-bold shadow-lg shadow-orange-500/10">
                {editingCategory ? 'Save Category' : 'Create Category'}
              </button>
              <button
                type="button"
                onClick={resetCategoryForm}
                className="btn-secondary flex-1 py-4 font-bold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories Horizontal Scroll/List */}
      {categories.length > 0 && (
        <div className="mb-10 bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-[var(--text-primary)] font-display mb-6">Manage Categories</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center gap-3 bg-[var(--surface-cream)]/80 border border-[var(--border-light)] rounded-2xl px-5 py-3 shadow-sm group hover:border-[var(--cookd-orange)]/30 transition-all"
              >
                <span
                  className="w-4 h-4 rounded-full shadow-sm ring-2 ring-white"
                  style={{ backgroundColor: category.color }}
                />
                <span className="text-[var(--text-primary)] font-bold text-sm tracking-wide">{category.name}</span>
                <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[var(--border-light)]">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-[var(--cookd-orange)] hover:bg-white rounded-lg transition-all"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => openDeleteModal('category', category.id, category.name)}
                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Idea Form */}
      {showIdeaForm && (
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden fade-up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display flex items-center gap-3">
              <span className="w-10 h-10 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
                <Lightbulb className="text-[var(--cookd-orange)]" size={20} />
              </span>
              {editingIdea ? 'Edit Project Idea' : 'Cook Up a New Idea'}
            </h2>
            <button
              onClick={resetIdeaForm}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-cream)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleIdeaSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Idea Title *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AI-powered recipe generator"
                    value={ideaFormData.title}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, title: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Description & Motivation
                  </label>
                  <textarea
                    placeholder="Why this idea? What are the key features?"
                    value={ideaFormData.description}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium resize-none"
                  />
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Mascot/Emoji
                    </label>
                    <input
                      type="text"
                      value={ideaFormData.emoji}
                      onChange={(e) => setIdeaFormData({ ...ideaFormData, emoji: e.target.value })}
                      maxLength={2}
                      className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all text-2xl text-center"
                      placeholder="💡"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                      Project Status
                    </label>
                    <select
                      value={ideaFormData.status}
                      onChange={(e) => setIdeaFormData({ ...ideaFormData, status: e.target.value as 'plan_to_do' | 'done' | 'dropped' })}
                      className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-bold text-sm uppercase tracking-wide appearance-none"
                    >
                      <option value="plan_to_do">Plan to do</option>
                      <option value="done">Done</option>
                      <option value="dropped">Dropped</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Label Category
                  </label>
                  <select
                    value={ideaFormData.category_id}
                    onChange={(e) => setIdeaFormData({ ...ideaFormData, category_id: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-bold text-sm uppercase tracking-wide appearance-none"
                  >
                    <option value="">No category assigned</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-light)]">
              <button type="submit" className="btn-primary flex-1 py-4 font-bold shadow-lg shadow-orange-500/10">
                {editingIdea ? 'Save Changes' : 'Launch Idea'}
              </button>
              <button
                type="button"
                onClick={resetIdeaForm}
                className="btn-secondary flex-1 py-4 font-bold"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="relative flex-1 sm:min-w-[200px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-[var(--border-light)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] font-bold text-sm uppercase tracking-wide appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <Plus size={16} className="rotate-45" />
            </div>
          </div>
          
          <div className="relative flex-1 sm:min-w-[200px]">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-6 py-4 bg-white border border-[var(--border-light)] rounded-2xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] font-bold text-sm uppercase tracking-wide appearance-none shadow-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="plan_to_do">Plan to do</option>
              <option value="done">Done</option>
              <option value="dropped">Dropped</option>
            </select>
            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <Plus size={16} className="rotate-45" />
            </div>
          </div>
        </div>

        <div className="text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs bg-[var(--surface-cream)] px-4 py-2 rounded-full border border-[var(--border-light)]">
          Showing {filteredIdeas.length} ideas
        </div>
      </div>

      {/* Ideas Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-16 text-center shadow-sm">
          <div className="w-20 h-20 bg-[var(--surface-cream)] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lightbulb className="text-[var(--text-muted)] opacity-50" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] font-display mb-2">No matching ideas</h3>
          <p className="text-[var(--text-secondary)] mb-8 font-medium">Try adjusting your filters or create a new concept.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedStatus('all');
            }}
            className="btn-secondary"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-10">
          {filteredIdeas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              category={idea.categories || null}
              onEdit={handleEditIdea}
              onDelete={(id) => openDeleteModal('idea', id, idea.title)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title={`Delete ${deleteModal.type === 'idea' ? 'Concept Idea' : 'Category'}`}
        message={
          deleteModal.type === 'category'
            ? `Delete the category "${deleteModal.name}"? Ideas currently using this label will become unassigned. This cannot be undone.`
            : `Are you sure you want to delete the concept "${deleteModal.name}"? This action is permanent.`
        }
        confirmText="Yes, delete it"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
