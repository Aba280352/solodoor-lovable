-- Upload limits for the admin's picture buckets (security/QA review 2026-11-08):
-- at most 10MB per file and pictures only (WebP, JPEG, PNG, AVIF). The admin shrinks pictures before upload
-- (image-tools.ts), so normal uploads are far below the limit. SVG/HTML can no longer be stored in these public buckets.
update storage.buckets
set file_size_limit = 10485760,
    allowed_mime_types = array['image/webp', 'image/jpeg', 'image/png', 'image/avif']
where id in ('catalog', 'articles');

-- Rollback (back to no limits, as before):
-- update storage.buckets set file_size_limit = null, allowed_mime_types = null where id in ('catalog', 'articles');
