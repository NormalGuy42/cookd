'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspectRatio?: 'square' | 'video' | 'banner';
}

export default function ImageUpload({ 
  value, 
  onChange, 
  folder = 'uploads',
  label = 'Image',
  aspectRatio = 'video'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const aspectClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    banner: 'aspect-[3/1]',
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const fileName = `${folder}-${Date.now()}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('public')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('not found')) {
          toast.error('Storage bucket "public" not configured. See setup instructions.');
          console.error('Storage bucket not found. Please create a "public" bucket in Supabase Storage with public access.');
        } else {
          throw uploadError;
        }
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      onChange(urlData.publicUrl);
      toast.success('Image uploaded!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div>
      <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
        {label}
      </label>
      
      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Preview"
            className={`w-48 ${aspectClasses[aspectRatio]} object-cover rounded-xl border border-[var(--border-light)]`}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
            id={`image-upload-${folder}`}
          />
          <label
            htmlFor={`image-upload-${folder}`}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[var(--border-light)] rounded-xl cursor-pointer hover:border-[var(--cookd-orange)] hover:bg-[var(--cookd-orange)]/5 transition-colors ${
              uploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-[var(--cookd-orange)]/30 border-t-[var(--cookd-orange)] rounded-full animate-spin" />
                <span className="text-[var(--text-muted)] font-medium">Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] font-medium">Upload image</span>
              </>
            )}
          </label>
          
          <span className="text-[var(--text-muted)] text-sm self-center">or</span>
          
          <input
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="flex-1 px-3 sm:px-4 py-2.5 bg-white border border-[var(--border-light)] rounded-xl text-[var(--text-primary)] focus:outline-none focus:border-[var(--cookd-orange)] text-sm transition-colors"
            placeholder="Paste image URL"
          />
        </div>
      )}
    </div>
  );
}

