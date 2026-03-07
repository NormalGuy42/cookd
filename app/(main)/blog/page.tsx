import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight, BookOpen, FileText } from 'lucide-react';

export const runtime = 'edge';

export const metadata = {
  title: 'Blog',
  description: 'Read our latest articles, tutorials, and updates about creativity, web development, and bringing ideas to life.',
};

function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

export default async function BlogPage() {
  const supabase = await createClient();
  
  const { data: posts, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
  }

  return (
    <div className="min-h-screen bg-[var(--surface-cream)] text-[var(--text-primary)]">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--cookd-orange)]/5 via-transparent to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-[var(--cookd-orange)]/10 rounded-full">
              <BookOpen size={16} className="text-[var(--cookd-orange)]" />
              <span className="text-sm font-medium text-[var(--cookd-orange)]">From the Kitchen</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-display">
              The Cookd Blog
            </h1>
            <p className="text-lg sm:text-xl text-[var(--text-secondary)]">
              Stories, tutorials, and insights about bringing creative ideas to life
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-12 sm:py-16 pb-24">
        <div className="container mx-auto px-4">
          {!posts || posts.length === 0 ? (
            <div className="max-w-xl mx-auto text-center py-16">
              <div className="bg-white rounded-2xl border border-[var(--border-light)] p-12">
                <BookOpen size={48} className="mx-auto mb-4 text-[var(--cookd-orange)]/30" />
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 font-display">No posts yet</h2>
                <p className="text-[var(--text-secondary)]">
                  We're cooking up some great content. Check back soon!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className={`group card-base overflow-hidden hover:border-[var(--cookd-orange)]/30 transition-all duration-300 hover:-translate-y-1 fade-up ${
                    index === 0 ? 'md:col-span-2 lg:col-span-2' : ''
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Thumbnail */}
                  <div className={`relative overflow-hidden ${index === 0 ? 'h-64 sm:h-80' : 'h-48'}`}>
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--cookd-orange)]/10 to-[var(--cookd-golden)]/10 flex items-center justify-center">
                        <FileText size={48} className="text-[var(--cookd-orange)]/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-5 sm:p-6">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {estimateReadingTime(post.content)} min read
                      </span>
                    </div>

                    {/* Title */}
                    <h2 className={`font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--cookd-orange)] transition-colors font-display ${
                      index === 0 ? 'text-xl sm:text-2xl' : 'text-lg'
                    }`}>
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className={`text-[var(--text-secondary)] mb-4 ${index === 0 ? 'line-clamp-3' : 'line-clamp-2'}`}>
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-[var(--cookd-orange)] text-sm font-medium group-hover:gap-3 transition-all">
                      Read more
                      <ArrowRight size={16} />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
