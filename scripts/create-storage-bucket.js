const PROJECT_REF = 'pbtaolycccmmqmwurinp';
const ACCESS_TOKEN = 'sbp_606adf37f1cf2ab0abf0b938d789ef21b821b324';

// Create the muzzle-images storage bucket via SQL
const sql = `
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('muzzle-images', 'muzzle-images', false, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp'])
ON CONFLICT (id) DO NOTHING;
`;

const response = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: sql })
});

if (response.ok) {
  console.log('Storage bucket created: muzzle-images');
} else {
  const error = await response.text();
  if (error.includes('duplicate') || error.includes('already')) {
    console.log('Storage bucket already exists: muzzle-images');
  } else {
    console.log('Error:', error.slice(0, 300));
  }
}

// Set RLS policies
const policySql = `
-- Allow authenticated users to upload
DROP POLICY IF EXISTS "Users can upload muzzle images" ON storage.objects;
CREATE POLICY "Users can upload muzzle images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'muzzle-images'
    AND auth.uid() IS NOT NULL
  );

-- Allow service role to manage all objects
DROP POLICY IF EXISTS "Service role can manage muzzle images" ON storage.objects;
CREATE POLICY "Service role can manage muzzle images"
  ON storage.objects FOR ALL
  TO service_role
  USING (bucket_id = 'muzzle-images')
  WITH CHECK (bucket_id = 'muzzle-images');

-- Allow authenticated users to read their own uploads
DROP POLICY IF EXISTS "Users can read own muzzle images" ON storage.objects;
CREATE POLICY "Users can read own muzzle images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'muzzle-images');

-- Allow authenticated users to delete their own uploads
DROP POLICY IF EXISTS "Users can delete own muzzle images" ON storage.objects;
CREATE POLICY "Users can delete own muzzle images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'muzzle-images');
`;

const policyResponse = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ACCESS_TOKEN}`,
  },
  body: JSON.stringify({ query: policySql })
});

if (policyResponse.ok) {
  console.log('Storage policies created');
} else {
  const error = await policyResponse.text();
  console.log('Policy error:', error.slice(0, 300));
}
