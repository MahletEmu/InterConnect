import { supabase } from '@/lib/supabase';

// =====================================================
// STORAGE SERVICE — Supabase Storage
// =====================================================

export const BUCKETS = {
  AVATARS: 'avatars',
  LOGOS: 'company-logos',
  RESUMES: 'resumes',
  PROJECT_IMAGES: 'project-images',
} as const;

export type Bucket = typeof BUCKETS[keyof typeof BUCKETS];

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * Validate an image file specifically (JPEG, PNG, WebP) with size limit.
 */
export function validateImageFile(file: File, maxMb = 5): string | null {
  if (!file) return 'No image file selected.';
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExts = ['jpg', 'jpeg', 'png', 'webp'];
  const typeMatches = allowedTypes.includes(file.type.toLowerCase()) || validExts.includes(ext);

  if (!typeMatches) {
    return 'Invalid image format. Supported formats: JPEG, PNG, and WebP.';
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `Image size exceeds the ${maxMb}MB limit. Please select a smaller photo.`;
  }
  return null;
}

/**
 * Validate a file against type and size limits.
 */
function validateFile(file: File, allowedTypes: string[], maxBytes: number): string | null {
  if (!file) return 'No file selected.';
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const validExts = allowedTypes
    .map((t) => t.split('/')[1]?.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx').toLowerCase())
    .filter(Boolean);
  const typeMatches = allowedTypes.includes(file.type.toLowerCase()) || (ext && (validExts.includes(ext) || (ext === 'jpg' && validExts.includes('jpeg'))));

  if (!typeMatches) {
    const extensions = allowedTypes
      .map((t) => t.split('/')[1]?.replace('vnd.openxmlformats-officedocument.wordprocessingml.document', 'docx'))
      .join(', ');
    return `Invalid file type. Allowed formats: ${extensions.toUpperCase()}`;
  }
  if (file.size > maxBytes) {
    const mb = Math.round(maxBytes / (1024 * 1024));
    return `File size exceeds the ${mb}MB limit.`;
  }
  return null;
}

/**
 * Upload a profile avatar image (Student or Company).
 * Uploads to Supabase Storage `avatars` bucket under a user-specific folder:
 * `${userId}/avatar-${Date.now()}.${ext}`
 * Type: JPEG, PNG, WebP | Max size: 5 MB
 */
export async function uploadAvatar(
  userId: string,
  file: File,
  oldAvatarUrl?: string
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateImageFile(file, 5);
  if (validationError) return { url: null, error: validationError };

  // Resolve current authenticated user to guarantee user-isolation
  let effectiveUserId = userId;
  try {
    const { data: authData } = await supabase.auth.getUser();
    if (authData.user?.id) {
      effectiveUserId = authData.user.id;
    }
  } catch (err) {
    console.warn('Could not verify current auth user for avatar upload:', err);
  }

  if (!effectiveUserId || effectiveUserId === 'stud-temp' || effectiveUserId === 'comp-temp') {
    return { url: null, error: 'Authentication required. Please sign in before uploading a profile photo.' };
  }

  const rawExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const ext = rawExt === 'jpeg' ? 'jpg' : rawExt;
  const filePath = `${effectiveUserId}/avatar-${Date.now()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.AVATARS)
      .upload(filePath, file, {
        upsert: true,
        contentType: file.type || (ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'),
      });

    if (error) {
      console.error('Avatar upload error:', error.message);
      if (error.message.toLowerCase().includes('security') || error.message.toLowerCase().includes('policy')) {
        return {
          url: null,
          error: 'Storage policy prevented avatar upload. Ensure you are signed in and storage policies are applied.',
        };
      }
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.AVATARS)
      .getPublicUrl(data.path);

    // Clean up previous avatar from avatars bucket if it belongs to this user
    if (oldAvatarUrl && oldAvatarUrl.includes(`/${BUCKETS.AVATARS}/`)) {
      try {
        const oldPath = oldAvatarUrl.split(`/${BUCKETS.AVATARS}/`)[1]?.split('?')[0];
        if (oldPath && oldPath.startsWith(`${effectiveUserId}/`) && oldPath !== data.path) {
          await supabase.storage.from(BUCKETS.AVATARS).remove([oldPath]);
        }
      } catch (cleanupErr) {
        console.warn('Old avatar cleanup skipped:', cleanupErr);
      }
    }

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Avatar upload failed.' };
  }
}

/**
 * Upload a company logo.
 * Type: JPEG, PNG, WebP | Max size: 5 MB
 */
export async function uploadCompanyLogo(
  companyProfileId: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateFile(file, IMAGE_TYPES, 5 * 1024 * 1024);
  if (validationError) return { url: null, error: validationError };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const filePath = `${companyProfileId}/logo-${Date.now()}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.LOGOS)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error('Company logo upload error:', error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.LOGOS)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Company logo upload failed.' };
  }
}

/**
 * Upload a student resume (PDF/DOC/DOCX).
 * The resumes bucket is PRIVATE.
 * Type: PDF, DOC, DOCX | Max size: 10 MB
 */
export async function uploadResume(
  studentProfileId: string,
  file: File
): Promise<{ path: string | null; signedUrl: string | null; error: string | null }> {
  const validationError = validateFile(file, RESUME_TYPES, 10 * 1024 * 1024);
  if (validationError) return { path: null, signedUrl: null, error: validationError };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${studentProfileId}/${Date.now()}-${cleanName}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.RESUMES)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error('Resume upload error:', error.message);
      return { path: null, signedUrl: null, error: error.message };
    }

    // Generate signed URL with 2-hour expiration for immediate preview/download
    const { data: signedData, error: signError } = await supabase.storage
      .from(BUCKETS.RESUMES)
      .createSignedUrl(data.path, 7200);

    if (signError) {
      return { path: data.path, signedUrl: null, error: null };
    }

    return { path: data.path, signedUrl: signedData.signedUrl, error: null };
  } catch (err: any) {
    return { path: null, signedUrl: null, error: err?.message || 'Resume upload failed.' };
  }
}

/**
 * Generate a fresh secure signed URL for a private resume.
 */
export async function getResumeSignedUrl(
  filePathOrUrl: string,
  expiresInSeconds = 3600
): Promise<string | null> {
  if (!filePathOrUrl) return null;

  // Extract relative storage path if a full URL was stored
  let path = filePathOrUrl;
  if (path.includes('/resumes/')) {
    path = path.split('/resumes/').pop()?.split('?')[0] || path;
  }

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.RESUMES)
      .createSignedUrl(path, expiresInSeconds);

    if (error || !data) {
      console.error('Failed to create signed URL for resume:', error?.message);
      return null;
    }

    return data.signedUrl;
  } catch (err) {
    console.error('getResumeSignedUrl error:', err);
    return null;
  }
}

/**
 * Upload a project screenshot image.
 * Type: JPEG, PNG, WebP | Max size: 10 MB
 */
export async function uploadProjectImage(
  studentProfileId: string,
  projectTitle: string,
  file: File
): Promise<{ url: string | null; error: string | null }> {
  const validationError = validateFile(file, IMAGE_TYPES, 10 * 1024 * 1024);
  if (validationError) return { url: null, error: validationError };

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const slug = projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 30);
  const filePath = `${studentProfileId}/${Date.now()}-${slug}.${ext}`;

  try {
    const { data, error } = await supabase.storage
      .from(BUCKETS.PROJECT_IMAGES)
      .upload(filePath, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error('Project image upload error:', error.message);
      return { url: null, error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKETS.PROJECT_IMAGES)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl, error: null };
  } catch (err: any) {
    return { url: null, error: err?.message || 'Project image upload failed.' };
  }
}

/**
 * Delete a file from storage bucket.
 */
export async function deleteStorageFile(bucket: Bucket, path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    return !error;
  } catch {
    return false;
  }
}
