'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface TweetEmbedProps {
  tweetUrl: string;
}

interface TweetData {
  author_name: string;
  author_url: string;
  html: string;
}

// Extract tweet info from URL
function extractTweetInfo(url: string): { username: string; tweetId: string } | null {
  const pattern = /(?:twitter\.com|x\.com)\/(\w+)\/status(?:es)?\/(\d+)/;
  const match = url.match(pattern);
  if (match) {
    return { username: match[1], tweetId: match[2] };
  }
  return null;
}

// Extract tweet text from oEmbed HTML response
function extractTweetText(html: string): string | null {
  const match = html.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  if (match) {
    let text = match[1]
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .trim();
    return text || null;
  }
  return null;
}

// Check if a string contains a Twitter/X URL
export function containsTweetUrl(text: string): string | null {
  const urlPattern = /(https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/\d+)/gi;
  const match = text.match(urlPattern);
  return match ? match[0] : null;
}

// Check if a string contains a YouTube URL
export function containsYouTubeUrl(text: string): { url: string; videoId: string } | null {
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?[^\s]*v=([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return { url: match[0], videoId: match[1] };
    }
  }
  return null;
}

// Check if a string contains an Instagram URL
export function containsInstagramUrl(text: string): string | null {
  const pattern = /(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[a-zA-Z0-9_-]+\/?)/gi;
  const match = text.match(pattern);
  return match ? match[0] : null;
}

// Check if a string contains any generic URL (excluding social media)
export function containsGenericUrl(text: string): string | null {
  const urlPattern = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;
  const matches = text.match(urlPattern);
  
  if (!matches) return null;
  
  for (const url of matches) {
    // Skip social media URLs that have dedicated embeds
    if (
      url.includes('twitter.com') ||
      url.includes('x.com') ||
      url.includes('youtube.com') ||
      url.includes('youtu.be') ||
      url.includes('instagram.com')
    ) {
      continue;
    }
    return url;
  }
  return null;
}

// Get all URLs from text with their types
export function extractAllUrls(text: string | null): {
  tweet: string | null;
  youtube: { url: string; videoId: string } | null;
  instagram: string | null;
  generic: string | null;
} {
  if (!text) {
    return { tweet: null, youtube: null, instagram: null, generic: null };
  }
  
  return {
    tweet: containsTweetUrl(text),
    youtube: containsYouTubeUrl(text),
    instagram: containsInstagramUrl(text),
    generic: containsGenericUrl(text),
  };
}

// Remove all embed URLs from description for cleaner display
export function getCleanDescription(description: string | null): string | null {
  if (!description) return null;
  
  let cleaned = description
    // Twitter/X (with optional query params)
    .replace(/https?:\/\/(?:twitter\.com|x\.com)\/\w+\/status(?:es)?\/\d+[^\s]*/gi, '')
    // YouTube (with optional query params)
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch[^\s]*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/[^\s]*/gi, '')
    .replace(/(?:https?:\/\/)?youtu\.be\/[^\s]*/gi, '')
    .replace(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/[^\s]*/gi, '')
    // Instagram (with optional query params)
    .replace(/https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[^\s]*/gi, '')
    // Generic URLs
    .replace(/https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi, '')
    .trim();
  
  return cleaned || null;
}

// Tweet Embed Component
export default function TweetEmbed({ tweetUrl }: TweetEmbedProps) {
  const [tweetText, setTweetText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const tweetInfo = extractTweetInfo(tweetUrl);

  useEffect(() => {
    if (!tweetInfo) {
      setLoading(false);
      return;
    }

    const fetchTweetData = async () => {
      try {
        const oembedUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(tweetUrl)}&omit_script=true&hide_media=true&hide_thread=true`;
        const response = await fetch(oembedUrl);
        
        if (response.ok) {
          const data: TweetData = await response.json();
          const text = extractTweetText(data.html);
          setTweetText(text);
        }
      } catch (err) {
        console.error('Error fetching tweet:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTweetData();
  }, [tweetUrl, tweetInfo]);

  if (!tweetInfo) {
    return null;
  }

  return (
    <a 
      href={tweetUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--surface-cream)] border border-[var(--border-light)] rounded-xl hover:border-[#1DA1F2]/50 hover:bg-white transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-black flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[var(--text-primary)] font-bold text-sm group-hover:text-[#1DA1F2] transition-colors">
              @{tweetInfo.username}
            </span>
          </div>
          
          {loading ? (
            <div className="h-4 w-3/4 bg-[var(--border-light)] rounded animate-pulse" />
          ) : tweetText ? (
            <p className="text-[var(--text-secondary)] text-sm line-clamp-3 leading-relaxed">
              {tweetText}
            </p>
          ) : (
            <p className="text-[var(--text-muted)] text-xs">
              View post on X
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-[var(--text-muted)] text-xs">
            <span>View on X</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

// YouTube Embed Component
interface YouTubeEmbedProps {
  videoId: string;
  url: string;
}

export function YouTubeEmbed({ videoId, url }: YouTubeEmbedProps) {
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideoInfo = async () => {
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const response = await fetch(oembedUrl);
        
        if (response.ok) {
          const data = await response.json();
          setTitle(data.title);
        }
      } catch (err) {
        console.error('Error fetching YouTube info:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideoInfo();
  }, [videoId]);

  return (
    <a
      href={url.startsWith('http') ? url : `https://www.youtube.com/watch?v=${videoId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--surface-cream)] border border-[var(--border-light)] rounded-xl hover:border-red-500/50 hover:bg-white transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" height="800px" width="800px" version="1.1" id="Layer_1" viewBox="0 0 461.001 461.001" xmlSpace="preserve">
          <g>
            <path fill="#F61C0D" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728   c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137   C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607   c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"/>
          </g>
        </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[var(--text-primary)] font-bold text-sm group-hover:text-red-600 transition-colors">
              YouTube
            </span>
          </div>
          
          {loading ? (
            <div className="h-4 w-3/4 bg-[var(--border-light)] rounded animate-pulse" />
          ) : title ? (
            <p className="text-[var(--text-secondary)] text-sm line-clamp-2 leading-relaxed">
              {title}
            </p>
          ) : (
            <p className="text-[var(--text-muted)] text-xs">
              View video on YouTube
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-[var(--text-muted)] text-xs">
            <span>View on YouTube</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

// Instagram Embed Component
interface InstagramEmbedProps {
  url: string;
}

export function InstagramEmbed({ url }: InstagramEmbedProps) {
  const [loading, setLoading] = useState(true);
  const [embedHtml, setEmbedHtml] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmbed = async () => {
      try {
        const oembedUrl = `https://api.instagram.com/oembed?url=${encodeURIComponent(url)}&omitscript=true`;
        const response = await fetch(oembedUrl);
        
        if (response.ok) {
          const data = await response.json();
          setEmbedHtml(data.html);
        }
      } catch (err) {
        console.error('Error fetching Instagram embed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmbed();
  }, [url]);

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--surface-cream)] border border-[var(--border-light)] rounded-xl hover:border-[#E1306C]/50 hover:bg-white transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0">
        <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 32 32" fill="none">
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint0_radial_87_7153)"/>
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint1_radial_87_7153)"/>
            <rect x="2" y="2" width="28" height="28" rx="6" fill="url(#paint2_radial_87_7153)"/>
            <path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white"/>
            <defs>
            <radialGradient id="paint0_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)">
            <stop stop-color="#B13589"/>
            <stop offset="0.79309" stop-color="#C62F94"/>
            <stop offset="1" stop-color="#8A3AC8"/>
            </radialGradient>
            <radialGradient id="paint1_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)">
            <stop stop-color="#E0E8B7"/>
            <stop offset="0.444662" stop-color="#FB8A2E"/>
            <stop offset="0.71474" stop-color="#E2425C"/>
            <stop offset="1" stop-color="#E2425C" stop-opacity="0"/>
            </radialGradient>
            <radialGradient id="paint2_radial_87_7153" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)">
            <stop offset="0.156701" stop-color="#406ADC"/>
            <stop offset="0.467799" stop-color="#6A45BE"/>
            <stop offset="1" stop-color="#6A45BE" stop-opacity="0"/>
            </radialGradient>
            </defs>
        </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[var(--text-primary)] font-bold text-sm group-hover:text-[#E1306C] transition-colors">
              Instagram Post
            </span>
          </div>
          
          {loading ? (
            <div className="h-4 w-3/4 bg-[var(--border-light)] rounded animate-pulse" />
          ) : (
            <p className="text-[var(--text-muted)] text-xs">
              View post on Instagram
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-[var(--text-muted)] text-xs">
            <span>View on Instagram</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}

// Generic URL Link Preview Component
interface LinkPreviewProps {
  url: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<{
    title: string | null;
    description: string | null;
    image: string | null;
    favicon: string | null;
    siteName: string | null;
  }>({ title: null, description: null, image: null, favicon: null, siteName: null });

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        // Use a simple approach - extract domain info
        const urlObj = new URL(url);
        const domain = urlObj.hostname.replace('www.', '');
        const favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        
        setMetadata({
          title: null,
          description: null,
          image: null,
          favicon,
          siteName: domain,
        });
      } catch (err) {
        console.error('Error parsing URL:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [url]);

  const domain = (() => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  })();

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-[var(--surface-cream)] border border-[var(--border-light)] rounded-xl hover:border-[var(--cookd-orange)]/50 hover:bg-white transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-white border border-[var(--border-light)] flex items-center justify-center shrink-0 overflow-hidden">
          {metadata.favicon ? (
            <img
              src={metadata.favicon}
              alt=""
              className="w-6 h-6"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
              }}
            />
          ) : null}
          <LinkIcon className={`w-5 h-5 text-[var(--text-muted)] ${metadata.favicon ? 'hidden' : ''}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-[var(--text-primary)] font-bold text-sm group-hover:text-[var(--cookd-orange)] transition-colors truncate">
              {metadata.title || domain}
            </span>
          </div>
          
          {loading ? (
            <div className="h-4 w-3/4 bg-[var(--border-light)] rounded animate-pulse" />
          ) : (
            <p className="text-[var(--text-muted)] text-xs truncate">
              {url}
            </p>
          )}
          
          <div className="flex items-center gap-2 mt-2 text-[var(--text-muted)] text-xs">
            <ExternalLink size={12} />
            <span>Open link</span>
            <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </a>
  );
}
