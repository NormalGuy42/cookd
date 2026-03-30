'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Plus, ArrowRight, User, Calendar, Clock, Sparkles, Zap, Star, Trophy, UtensilsCrossed, CookingPot, Flame, Cookie } from 'lucide-react';
import Footer from '@/components/Footer';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import ProjectDetailModal from '@/components/ProjectDetailModal';
import { links } from '@/constants';

interface ProjectProfile {
  display_name: string | null;
  avatar_url: string | null;
  twitter_url: string | null;
  is_anonymous: boolean;
}

interface FeaturedProject {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  user_id: string | null;
  created_at: string;
  profile?: ProjectProfile | null;
}

interface FeaturedBlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  created_at: string;
  content: string;
}

export default function Home() {
  useEffect(() => {
    // Easter egg console log
    console.log(`Welcome to Cookd! Thanks for checking under the hood. Follow ${links["twitter"]} on Twitter!`);
    
  }, []);

  
  const [faqOpenIndex, setFaqOpenIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [featuredBlogPosts, setFeaturedBlogPosts] = useState<FeaturedBlogPost[]>([]);
  const [selectedProject, setSelectedProject] = useState<FeaturedProject | null>(null);
  const [availability, setAvailability] = useState<{
    premium: boolean | null;
    standard: boolean | null;
    hallOfFame: boolean | null;
  }>({
    premium: null,
    standard: null,
    hallOfFame: null,
  });

  useEffect(() => {
    checkAvailability();
    fetchFeaturedProjects();
    fetchFeaturedBlogPosts();
  }, []);

  const fetchFeaturedProjects = async () => {
    const supabase = createClient();
    
    // Fetch featured projects (limit to 6 for the homepage)
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (error) {
      console.error('Error fetching projects:', error);
      return;
    }

    if (projects && projects.length > 0) {
      // Get unique user IDs
      const userIds = new Set(projects.map(p => p.user_id).filter(Boolean));
      
      // Fetch profiles for project creators
      let profilesMap: Record<string, ProjectProfile> = {};
      if (userIds.size > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url, twitter_url, is_anonymous')
          .in('id', Array.from(userIds));
        
        if (profiles) {
          profiles.forEach(p => {
            profilesMap[p.id] = {
              display_name: p.display_name,
              avatar_url: p.avatar_url,
              twitter_url: p.twitter_url,
              is_anonymous: p.is_anonymous,
            };
          });
        }
      }

      // Merge profiles with projects
      const projectsWithProfiles = projects.map(project => ({
        ...project,
        profile: project.user_id ? profilesMap[project.user_id] || null : null,
      }));

      setFeaturedProjects(projectsWithProfiles);
    }
  };

  const fetchFeaturedBlogPosts = async () => {
    const supabase = createClient();
    
    // Fetch featured and published blog posts (limit to 3 for homepage)
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, thumbnail_url, published_at, created_at, content')
      .eq('published', true)
      .eq('featured', true)
      .order('published_at', { ascending: false })
      .limit(3);

    if (error) {
      console.error('Error fetching blog posts:', error);
      return;
    }

    if (posts) {
      setFeaturedBlogPosts(posts);
    }
  };

  const estimateReadingTime = (content: string): number => {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const checkAvailability = async () => {
    const supabase = createClient();
    
    // Check each tier
    const [premium, standard, hallOfFame] = await Promise.all([
      supabase.rpc('check_tier_availability', { amount_cents: 30000 }),
      supabase.rpc('check_tier_availability', { amount_cents: 15000 }),
      supabase.rpc('check_tier_availability', { amount_cents: 7500 }),
    ]);

    setAvailability({
      premium: premium.data ?? null,
      standard: standard.data ?? null,
      hallOfFame: hallOfFame.data ?? null,
    });
  };

  const handleSubmitIdea = async () => {
    // Redirect to pricing section
    window.location.href = '#pricing';
  };

  const handleCheckout = async (tier: 'bare_minimum' | 'premium' | 'standard' | 'hall_of_fame') => {
    setLoading(true);
    try {
      const response = await fetch('/api/dodo/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tier }),
      });

      // Read body as text first, then parse as JSON
      const text = await response.text();
      let data: any = null;
      
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error('Non-JSON response from create-checkout:', {
          status: response.status,
          statusText: response.statusText,
          body: text.substring(0, 500), // First 500 chars
        });
        // Show more helpful error based on status
        if (response.status === 500) {
          toast.error('Server error. Check console for details.', {
            description: text.substring(0, 100),
            duration: 10000,
          });
        } else if (response.status === 404) {
          toast.error('Payment endpoint not found. Please contact support.');
        } else {
          toast.error(`Payment service error (${response.status})`, {
            description: text.substring(0, 100),
            duration: 10000,
          });
        }
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else if (data.error) {
        // Log detailed error info for debugging
        console.error('Checkout error:', {
          code: data.code,
          error: data.error,
          details: data.details,
          tier: data.tier,
        });
        
        // Show user-friendly error message
        toast.error(data.error, {
          duration: 5000,
          description: data.code === 'TIER_SOLD_OUT' 
            ? 'Check other tiers for availability.' 
            : data.code === 'RATE_LIMITED'
            ? 'Please wait a moment before trying again.'
            : undefined,
        });
        setLoading(false);
        
        // Refresh availability if tier sold out
        if (data.code === 'TIER_SOLD_OUT') {
          checkAvailability();
        }
      } else {
        toast.error('Failed to create checkout. Please try again.');
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error creating checkout:', error);
      toast.error(error?.message || 'Connection error. Please check your internet and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--surface-cream)] text-[var(--text-primary)]">
      {/* Navigation now rendered from shared Header component */}

      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
        {/* Warm hero gradient */}
        <div className="hero-gradient"></div>
        
        {/* Decorative cooking elements */}
        <div className="absolute top-20 left-[8%] opacity-15 floating" style={{ animationDelay: '0s' }}>
          <UtensilsCrossed size={44} className="text-[var(--cookd-orange)]" />
        </div>
        <div className="absolute top-32 right-[12%] opacity-15 floating" style={{ animationDelay: '2s' }}>
          <Sparkles size={36} className="text-[var(--cookd-golden)]" />
        </div>
        <div className="absolute top-[45%] left-[5%] opacity-15 floating" style={{ animationDelay: '1s' }}>
          <CookingPot size={52} className="text-[var(--cookd-orange)]" />
        </div>
        <div className="absolute top-[30%] right-[8%] opacity-15 floating" style={{ animationDelay: '1.5s' }}>
          <Flame size={40} className="text-[var(--cookd-golden)]" />
        </div>
        <div className="absolute bottom-[25%] left-[12%] opacity-15 floating" style={{ animationDelay: '0.5s' }}>
          <Cookie size={38} className="text-[var(--cookd-orange)]" />
        </div>
        <div className="absolute bottom-[35%] right-[6%] opacity-15 floating" style={{ animationDelay: '2.5s' }}>
          <Star size={32} className="text-[var(--cookd-golden)]" />
        </div>
        
        <div className="text-center max-w-4xl mx-auto relative z-10">
          {/* Chef mascot */}
          <div className="mb-8 bounce-in">
            <div className="relative w-32 h-32 mx-auto wiggle">
               <img src="/cookd-logo.png" alt="Cookd logo" className="w-42 h-42 object-contain cursor-pointer" />    
            </div>
          </div>

          
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 font-display fade-up">
            <span className="gradient-text">Where Great Ideas</span>
            <br />
            <span className="text-[var(--text-primary)]">Are Cooked</span>
          </h1>
          <p className="text-lg md:text-xl mb-10 text-[var(--text-secondary)] max-w-2xl mx-auto fade-up stagger-2">
            A platform for shipping great and fun ideas at affordable prices. Stop wasting time and let's get your idea out there.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center fade-up stagger-3">
            <button 
              onClick={handleSubmitIdea}
              className="btn-primary hover-shake"
            >
              Submit Your Idea
            </button>
            <Link href="/projects" className="btn-inverse">Explore Projects</Link>
          </div>
          
        </div>
      </section>


      {/* About Section */}
      <section id="about" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-[320px_1fr] gap-10 md:gap-16 items-start">
            {/* Profile image */}
            <div className="mx-auto md:mx-0 w-[320px] fade-up">
              <div className="rounded-2xl border border-[var(--border-light)] bg-[var(--surface-cream)] p-8 shadow-lg">
                <div className="relative h-44 w-44 mx-auto rounded-2xl overflow-hidden">
                  <Image
                    src="/madiou_logo.jpg"
                    alt="Madiou profile picture"
                    fill
                    sizes="176px"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Narrative text */}
            <div className="fade-up stagger-2">
              <h2 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] mb-2 font-display">
                Hey, it's Madiou
              </h2>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              I hate AI vibecoded slop and I hate Vercel. However I cannot deny how powerful vibecoding is, so I decided to kill 2 birds with one stone by building my own hosting platform
              </p>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
                To be completely honest with you, this is the second version of this website. My first attempt at building this idea was through <a href="https://slopcel.com" target="_blank" rel="noopener noreferrer" className="text-[var(--cookd-orange)] hover:opacity-80 transition-opacity font-medium">Slopcel.com</a> but I felt like the domain and branding didn't fit with what I really had in mind, and because of <a href="https://x.com/NabilHunt" target="_blank" rel="noopener noreferrer" className="text-[var(--cookd-orange)] hover:opacity-80 transition-opacity font-medium">Nabil Hunt</a> on Twitter I finally decided to change it to something different. 
              </p>
              <blockquote className="twitter-tweet"><p lang="en" dir="ltr">I think your ideal users wouldn&#39;t want to call what they ship slop, maybe the name is bad</p>&mdash; Nabil Hunt (@NabilHunt) <a href="https://twitter.com/NabilHunt/status/2006000028624748710?ref_src=twsrc%5Etfw">December 30, 2025</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
              <p className="text-[var(--text-secondary)] leading-relaxed mb-6">
              It's thanks to him that Cookd was born: a platform that celebrates human creativity and ingenuity.
              </p>
              <div className="bg-[var(--surface-cream)] rounded-2xl p-6 mb-8 border border-[var(--border-light)]">
                <h3 className="font-bold text-[var(--text-primary)] mb-4 font-display flex items-center gap-2">
                  <Sparkles size={20} className="text-[var(--cookd-orange)]" />
                  How It Works
                </h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--cookd-orange)] text-white flex items-center justify-center font-bold text-sm">1</span>
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">Submit your idea</span>
                      <p className="text-sm text-[var(--text-secondary)]">by either paying a fee or by reaching out to me on my Twitter posts</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--cookd-golden)] text-white flex items-center justify-center font-bold text-sm">2</span>
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">I build it</span>
                      <p className="text-sm text-[var(--text-secondary)]">if I like the idea or if there is enough popular demand</p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--cookd-green)] text-white flex items-center justify-center font-bold text-sm">3</span>
                    <div>
                      <span className="font-semibold text-[var(--text-primary)]">For those who pay premium</span>
                      <p className="text-sm text-[var(--text-secondary)]">your project will be immediately accepted and appear on the hall of fame</p>
                    </div>
                  </li>
                </ol>
              </div>

              <p className="text-[var(--text-secondary)]">
                <Link href={links["twitter"]} target="_blank" className="inline-flex items-center gap-2 text-[var(--cookd-orange)] hover:opacity-80 transition-opacity font-medium">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2H21l-6.543 7.48L22 22h-6.828l-4.77-6.223L4.8 22H2l7.028-8.04L2 2h6.828l4.325 5.77L18.244 2Zm-1.197 18h1.887L7.03 4h-1.89l10.906 16Z"/>
                  </svg>
                  <span className="underline-draw">Follow me on Twitter</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Projects Section - Only show if there are projects */}
      {featuredProjects.length > 0 && (
        <section id="projects" className="py-24 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">
                Featured Projects
              </h2>
              <p className="text-[var(--text-secondary)] text-lg">
                Some of our finest creations
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProjects.map((project, index) => {
                const showProfile = project.profile && !project.profile.is_anonymous;
                
                return (
                  <div 
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className="card-hover card-base overflow-hidden cursor-pointer group fade-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Project Image */}
                    {project.image_url ? (
                      <div className="relative w-full h-44 overflow-hidden">
                        <Image
                          src={project.image_url}
                          alt={project.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-gradient-to-br from-[var(--cookd-orange)]/10 to-[var(--cookd-golden)]/10 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-[var(--cookd-orange)]/20"></div>
                      </div>
                    )}
                    
                    <div className="p-5">
                      {/* Creator Profile */}
                      {showProfile && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 rounded-full bg-[var(--surface-cream)] overflow-hidden flex items-center justify-center border border-[var(--border-light)]">
                            {project.profile?.avatar_url ? (
                              <img
                                src={project.profile.avatar_url}
                                alt={project.profile.display_name || 'Creator'}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="text-[var(--text-muted)] w-3 h-3" />
                            )}
                          </div>
                          <span className="text-[var(--text-muted)] text-xs truncate">
                            {project.profile?.display_name || 'Anonymous'}
                          </span>
                        </div>
                      )}
                      
                      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 line-clamp-1 group-hover:text-[var(--cookd-orange)] transition-colors">{project.name}</h3>
                      {project.description && (
                        <p className="text-[var(--text-secondary)] text-sm line-clamp-2">{project.description}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="text-center mt-12">
              <Link 
                href="/projects" 
                className="btn-primary inline-flex items-center gap-2"
              >
                See More Creations
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">
              Pick Your Plan
            </h2>
            <p className="text-[var(--text-secondary)] text-lg">
              Choose the right option for your project
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto">
            {/* Basic - $50 */}
            <div className="card-hover card-base p-8 relative flex">
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--cookd-orange)]/10 flex items-center justify-center">
                    <Zap size={20} className="text-[var(--cookd-orange)]" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-[var(--text-primary)]">Basic</h3>
                </div>
                <div className="text-5xl font-bold text-[var(--cookd-orange)] mb-2">$50</div>
                <p className="text-[var(--text-secondary)] mb-6">Perfect for testing the waters</p>
                <ul className="space-y-3 mb-8 text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>1 app deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Complete access to code and repo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Your idea, brought to life</span>
                  </li>
                  <li className="flex items-center gap-2 text-[var(--text-muted)]">
                    <span>✗</span>
                    <span>Hall of Fame placement</span>
                  </li>
                </ul>
                <button 
                  onClick={() => handleCheckout('bare_minimum')}
                  disabled={loading}
                  className="btn-secondary w-full mt-auto disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Get Started'}
                </button>
              </div>
            </div>
            
            {/* Standard - $75 */}
            <div className="card-hover card-base p-8 relative flex border-2 border-[var(--cookd-golden)]">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-[var(--cookd-golden)] text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </span>
              </div>
              <div className="flex flex-col w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[var(--cookd-golden)]/10 flex items-center justify-center">
                    <Trophy size={20} className="text-[var(--cookd-golden)]" />
                  </div>
                  <h3 className="text-2xl font-bold font-display text-[var(--text-primary)]">Standard</h3>
                </div>
                <div className="text-5xl font-bold text-[var(--cookd-orange)] mb-2">$75</div>
                <p className="text-[var(--text-secondary)] mb-6">Hall of Fame positions 12-100</p>
                <ul className="space-y-3 mb-8 text-[var(--text-secondary)]">
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>1 app deployment</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Hall of Fame placement (12-100)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Enhanced design & features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Complete code access</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[var(--cookd-green)]">✓</span>
                    <span>Support (up to 3 revisions)</span>
                  </li>
                </ul>
                {availability.hallOfFame === false && (
                  <p className="text-red-500 text-sm mb-4 text-center">All spots taken</p>
                )}
                {availability.hallOfFame === true && (
                  <p className="text-[var(--cookd-green)] text-sm mb-4 text-center">Positions available!</p>
                )}
                <button 
                  onClick={() => handleCheckout('hall_of_fame')}
                  disabled={loading || availability.hallOfFame === false}
                  className="btn-primary w-full mt-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Loading...' : availability.hallOfFame === false ? 'Sold Out' : 'Claim Your Spot'}
                </button>
              </div>
            </div>
          </div>
          
          <p className="text-center text-[var(--text-muted)] mt-8 text-sm">
            Looking for something more custom? <Link href={links["twitter"]} target="_blank" className="text-[var(--cookd-orange)] underline-draw">Let's chat</Link>
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">
              Questions? We've Got Answers
            </h2>
            <p className="text-[var(--text-secondary)]">Everything you need to know about Cookd</p>
          </div>

          {[
            { 
              q: 'What is Cookd?', 
              a: 'Cookd is a platform that celebrates human creativity. You submit your idea, and I personally build and deploy it, creating something unique and beautiful that lives on the web.' 
            },
            { 
              q: 'How do I submit my idea?', 
              a: 'Simply choose a plan above! After payment, you\'ll be able to share your idea details. I\'ll review it and start building your project.' 
            },
            { 
              q: 'Will my project stay online?', 
              a: 'Yes! All projects hosted on Cookd remain online. Hall of Fame projects get permanent, prominent placement on the platform.' 
            },
            { 
              q: 'What kind of projects can I request?', 
              a: 'Almost anything! Web apps, games, landing pages. If it can live on the web, we can build it. The more creative, the better. However projects are still subject to my approval and I reserve the right to refuse any submission that goes against our terms and conditions. You will get a full refund upon refusal of your request.' 
            },
          ].map((item, i) => {
            const isOpen = faqOpenIndex === i;
            return (
              <div key={i} className="mb-4">
                <button
                  onClick={() => setFaqOpenIndex(isOpen ? null : i)}
                  className="w-full text-left rounded-2xl border border-[var(--border-light)] bg-white hover:border-[var(--cookd-orange)]/30 transition-colors p-6 flex items-start justify-between gap-6"
                  aria-expanded={isOpen}
                >
                  <div>
                    <div className="text-[var(--text-primary)] font-semibold mb-1 font-display">{item.q}</div>
                    {isOpen && (
                      <div className="text-[var(--text-secondary)] leading-relaxed mt-2">{item.a}</div>
                    )}
                  </div>
                  <span className={`shrink-0 rounded-xl border border-[var(--border-light)] p-2 transition-all duration-200 ${isOpen ? 'rotate-45 bg-[var(--cookd-orange)] border-[var(--cookd-orange)]' : 'bg-white'}`}>
                    <Plus size={18} className={isOpen ? 'text-white' : 'text-[var(--text-secondary)]'} />
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Blog Section */}
      {featuredBlogPosts.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 font-display text-[var(--text-primary)]">
              Latest Updates
            </h2>
            <p className="text-[var(--text-secondary)]">News, stories, and insights</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredBlogPosts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group card-base overflow-hidden hover:border-[var(--cookd-orange)]/30 transition-all duration-300 hover:-translate-y-1 fade-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-44 overflow-hidden">
                    {post.thumbnail_url ? (
                      <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[var(--cookd-orange)]/10 to-[var(--cookd-golden)]/10 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-lg bg-[var(--cookd-orange)]/20"></div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(post.published_at || post.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {estimateReadingTime(post.content)} min
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--cookd-orange)] transition-colors line-clamp-2 font-display">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="text-[var(--text-secondary)] text-sm line-clamp-2 mb-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read More */}
                    <span className="text-[var(--cookd-orange)] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Read more
                      <ArrowRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/blog"
                className="text-[var(--cookd-orange)] hover:opacity-80 flex items-center gap-2 font-medium group justify-center"
              >
                View all posts
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Project Detail Modal */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={!!selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
}
