'use client';

import { useEffect, useState, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BlogPost } from '@/types/database';
import { Plus, Edit, Trash2, Eye, EyeOff, Upload, X, Image as ImageIcon, ExternalLink, Star, StarOff } from 'lucide-react';
import { toast } from 'sonner';
import ConfirmModal from '@/components/ui/ConfirmModal';
import MarkdownEditor from '@/components/admin/MarkdownEditor';

export default function AdminBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; postId: string | null; postTitle: string }>({
    isOpen: false,
    postId: null,
    postTitle: '',
  });
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    published: false,
    featured: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load blog posts');
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: editingPost ? prev.slug : generateSlug(title),
    }));
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `blog-${Date.now()}.${fileExt}`;
      const filePath = `blog-thumbnails/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        // If bucket doesn't exist, try creating it or provide helpful error
        if (uploadError.message.includes('Bucket not found')) {
          toast.error('Storage bucket not configured. Please create a "public" bucket in Supabase Storage.');
        } else {
          throw uploadError;
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setFormData(prev => ({
        ...prev,
        thumbnail_url: urlData.publicUrl,
      }));

      toast.success('Thumbnail uploaded!');
    } catch (error) {
      console.error('Error uploading thumbnail:', error);
      toast.error('Failed to upload thumbnail');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const removeThumbnail = () => {
    setFormData(prev => ({
      ...prev,
      thumbnail_url: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.slug || !formData.content) {
      toast.error('Title, slug, and content are required');
      return;
    }

    const postData = {
      title: formData.title,
      slug: formData.slug,
      excerpt: formData.excerpt || null,
      content: formData.content,
      thumbnail_url: formData.thumbnail_url || null,
      published: formData.published,
      featured: formData.featured,
      published_at: formData.published ? new Date().toISOString() : null,
    };

    if (editingPost) {
      const { error } = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);

      if (error) {
        console.error('Error updating post:', error);
        toast.error('Error updating post');
      } else {
        fetchPosts();
        resetForm();
        toast.success('Post updated successfully!');
      }
    } else {
      const { error } = await supabase.from('blog_posts').insert([postData]);

      if (error) {
        console.error('Error creating post:', error);
        if (error.code === '23505') {
          toast.error('A post with this slug already exists');
        } else {
          toast.error('Error creating post');
        }
      } else {
        fetchPosts();
        resetForm();
        toast.success('Post created successfully!');
      }
    }
  };

  const openDeleteModal = (post: BlogPost) => {
    setDeleteModal({
      isOpen: true,
      postId: post.id,
      postTitle: post.title,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, postId: null, postTitle: '' });
  };

  const handleDelete = async () => {
    if (!deleteModal.postId) return;

    setDeleting(true);
    const { error } = await supabase.from('blog_posts').delete().eq('id', deleteModal.postId);

    if (error) {
      console.error('Error deleting post:', error);
      toast.error('Error deleting post');
    } else {
      fetchPosts();
      toast.success('Post deleted successfully!');
    }
    setDeleting(false);
    closeDeleteModal();
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      thumbnail_url: post.thumbnail_url || '',
      published: post.published,
      featured: post.featured,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFeatured = async (post: BlogPost) => {
    const newFeatured = !post.featured;
    const { error } = await supabase
      .from('blog_posts')
      .update({ featured: newFeatured })
      .eq('id', post.id);

    if (error) {
      console.error('Error updating featured status:', error);
      toast.error('Error updating featured status');
    } else {
      fetchPosts();
      toast.success(newFeatured ? 'Post featured on homepage!' : 'Post removed from homepage!');
    }
  };

  const togglePublished = async (post: BlogPost) => {
    const newPublished = !post.published;
    const { error } = await supabase
      .from('blog_posts')
      .update({ 
        published: newPublished,
        published_at: newPublished ? new Date().toISOString() : null,
      })
      .eq('id', post.id);

    if (error) {
      console.error('Error updating published status:', error);
      toast.error('Error updating status');
    } else {
      fetchPosts();
      toast.success(newPublished ? 'Post published!' : 'Post unpublished!');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      thumbnail_url: '',
      published: false,
      featured: false,
    });
    setEditingPost(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-10 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
          <div className="text-[var(--text-muted)] font-medium">Loading posts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display text-[var(--text-primary)] mb-2">Blog</h1>
          <p className="text-[var(--text-secondary)]">Share news, stories, and insights from the kitchen.</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="btn-primary flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 shadow-lg shadow-orange-500/20"
        >
          <Plus size={20} />
          Write New Post
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white border border-[var(--border-light)] rounded-3xl p-6 sm:p-10 mb-10 shadow-sm relative overflow-hidden fade-up">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] font-display flex items-center gap-3">
              <span className="w-10 h-10 bg-[var(--cookd-orange)]/10 rounded-xl flex items-center justify-center">
                <Plus className="text-[var(--cookd-orange)]" size={20} />
              </span>
              {editingPost ? 'Edit Story' : 'New Kitchen Story'}
            </h2>
            <button
              onClick={resetForm}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-cream)] rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium"
                    placeholder="The secret ingredient to human creativity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                    URL Slug *
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-mono text-xs">/blog/</span>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                      className="w-full pl-16 pr-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-mono text-sm"
                      placeholder="human-creativity"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                  Featured Image
                </label>
                
                <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-4">
                  {formData.thumbnail_url ? (
                    <div className="relative aspect-video rounded-xl overflow-hidden border border-[var(--border-light)] group">
                      <img
                        src={formData.thumbnail_url}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-xl"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        className="hidden"
                        id="thumbnail-upload"
                      />
                      <label
                        htmlFor="thumbnail-upload"
                        className={`flex flex-col items-center justify-center gap-2 aspect-video border-2 border-dashed border-[var(--border-medium)] rounded-xl cursor-pointer hover:border-[var(--cookd-orange)] hover:bg-white transition-all ${
                          uploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {uploading ? (
                          <>
                            <div className="w-8 h-8 border-3 border-[var(--cookd-orange)]/20 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
                            <span className="text-[var(--text-muted)] font-bold text-sm">Uploading...</span>
                          </>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-[var(--text-muted)]">
                              <Upload size={24} />
                            </div>
                            <span className="text-[var(--text-muted)] font-bold text-sm">Drop thumbnail here or click</span>
                          </>
                        )}
                      </label>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[var(--border-light)]"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-[var(--surface-cream)] px-2 text-[var(--text-muted)] font-bold">OR</span>
                        </div>
                      </div>
                      
                      <input
                        type="url"
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                        className="w-full px-4 py-2 bg-white border border-[var(--border-light)] rounded-xl text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)]"
                        placeholder="Paste image URL directly"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Short Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] transition-all font-medium resize-none"
                placeholder="A brief taste of what this post is about..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[var(--text-primary)] mb-2">
                Main Content (Markdown)
              </label>
              <div className="border border-[var(--border-light)] rounded-2xl overflow-hidden focus-within:border-[var(--cookd-orange)] transition-all">
                <MarkdownEditor
                  value={formData.content}
                  onChange={(content) => setFormData({ ...formData, content })}
                  placeholder="Write your blog post here..."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-[var(--surface-cream)]/50 border border-[var(--border-light)] rounded-2xl p-6">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-[var(--border-light)] bg-white text-[var(--cookd-orange)] focus:ring-[var(--cookd-orange)] transition-all"
                  />
                  <label htmlFor="published" className="text-lg font-bold text-[var(--text-primary)] font-display cursor-pointer select-none">
                    Publish Now
                  </label>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-2 ml-8 font-medium italic">
                  Visible to everyone on the blog page.
                </p>
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
                    Feature on Home
                  </label>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-2 ml-8 font-medium italic">
                  Highlighted in the homepage feed.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-[var(--border-light)]">
              <button type="submit" className="btn-primary flex-1 py-4 text-lg font-bold shadow-lg shadow-orange-500/10">
                {editingPost ? 'Update Story' : 'Publish Story'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary flex-1 py-4 text-lg font-bold"
              >
                Discard
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.length === 0 ? (
          <div className="col-span-full bg-white border border-[var(--border-light)] rounded-3xl p-20 text-center shadow-sm">
            <div className="w-20 h-20 bg-[var(--surface-cream)] rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="text-[var(--text-muted)] opacity-50" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display mb-2">The kitchen is quiet...</h3>
            <p className="text-[var(--text-secondary)] mb-10 max-w-sm mx-auto font-medium">No blog posts found. Time to write your first story!</p>
            <button
              onClick={() => setShowForm(true)}
              className="btn-primary px-10 py-4"
            >
              Start Writing
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white border border-[var(--border-light)] rounded-3xl overflow-hidden shadow-sm card-hover flex flex-col group h-full"
            >
              <div className="aspect-video bg-[var(--surface-cream)] relative overflow-hidden">
                {post.thumbnail_url ? (
                  <img
                    src={post.thumbnail_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="text-[var(--border-medium)]" size={48} />
                  </div>
                )}
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border shadow-xl backdrop-blur-md ${
                    post.published 
                      ? 'bg-[var(--cookd-green)]/90 text-white border-[var(--cookd-green)]' 
                      : 'bg-white/90 text-[var(--text-muted)] border-[var(--border-light)]'
                  }`}>
                    {post.published ? 'Published' : 'Draft'}
                  </span>
                  {post.featured && (
                    <span className="px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-[var(--cookd-orange)]/90 text-white border border-[var(--cookd-orange)] shadow-xl backdrop-blur-md flex items-center gap-1">
                      <Star size={10} fill="currentColor" />
                      Featured
                    </span>
                  )}
                </div>
              </div>

              <div className="p-6 sm:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-4">
                  <span>{new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-primary)] font-display line-clamp-2 mb-4 group-hover:text-[var(--cookd-orange)] transition-colors leading-tight">
                  {post.title}
                </h3>
                
                {post.excerpt && (
                  <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-8 font-medium leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                
                <div className="mt-auto space-y-4">
                  <div className="flex gap-2 pt-4 border-t border-[var(--border-light)]">
                    {post.published && (
                      <a
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--surface-cream)] text-[var(--text-primary)] rounded-xl font-bold text-xs hover:bg-[var(--border-light)] transition-all border border-[var(--border-light)]"
                      >
                        <ExternalLink size={14} />
                        View
                      </a>
                    )}
                    <button
                      onClick={() => handleEdit(post)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-[var(--text-secondary)] hover:text-[var(--cookd-orange)] hover:bg-[var(--cookd-orange)]/5 rounded-xl text-xs font-bold transition-all border border-[var(--border-light)] hover:border-[var(--cookd-orange)]/30"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(post)}
                      className="p-3 bg-white text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 rounded-xl transition-all border border-[var(--border-light)] hover:border-red-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => togglePublished(post)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        post.published
                          ? 'bg-white text-[var(--text-muted)] border-[var(--border-light)] hover:bg-[var(--surface-cream)]'
                          : 'bg-[var(--cookd-green)]/10 text-[var(--cookd-green)] border-[var(--cookd-green)]/20 hover:bg-[var(--cookd-green)]/20'
                      }`}
                    >
                      {post.published ? <EyeOff size={14} /> : <Eye size={14} />}
                      {post.published ? 'Unpublish' : 'Publish Story'}
                    </button>
                    <button
                      onClick={() => toggleFeatured(post)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border transition-all ${
                        post.featured
                          ? 'bg-white text-[var(--text-muted)] border-[var(--border-light)] hover:bg-[var(--surface-cream)]'
                          : 'bg-[var(--cookd-golden)]/10 text-[var(--cookd-golden)] border-[var(--cookd-golden)]/20 hover:bg-[var(--cookd-golden)]/20'
                      }`}
                    >
                      {post.featured ? <StarOff size={14} /> : <Star size={14} />}
                      {post.featured ? 'Unfeature' : 'Feature Story'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Story"
        message={`Are you sure you want to delete "${deleteModal.postTitle}"? This will remove the post permanently from your kitchen records.`}
        confirmText="Yes, delete it"
        variant="danger"
        loading={deleting}
      />
    </div>
  );

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteModal.postTitle}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}

