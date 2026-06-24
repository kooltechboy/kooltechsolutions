
import { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Fetch all published posts with language info
  const { data: posts } = await supabase
    .from('posts')
    .select('id, slug, lang, translated_from, updated_at')
    .eq('status', 'Published');

  const allPosts = posts || [];

  // Build a map of post ID → slug for counterpart lookups
  const postMap = new Map(allPosts.map(p => [p.id, p]));

  // Generate blog post entries with alternate language links
  const blogEntries: MetadataRoute.Sitemap = allPosts.map((post) => {
    const isSpanish = post.lang === 'es';
    const url = isSpanish
      ? `https://kooltechsolutions.com/es/blog/${post.slug}`
      : `https://kooltechsolutions.com/blog/${post.slug}`;

    // Find the counterpart post for alternates
    const languages: Record<string, string> = {};

    if (isSpanish) {
      // This is a Spanish post — its English counterpart is the translated_from post
      languages.es = url;
      if (post.translated_from) {
        const enPost = postMap.get(post.translated_from);
        if (enPost) {
          languages.en = `https://kooltechsolutions.com/blog/${enPost.slug}`;
          languages['x-default'] = languages.en;
        }
      }
    } else {
      // This is an English post — look for a Spanish post that translates from it
      languages.en = url;
      languages['x-default'] = url;
      const esPost = allPosts.find(p => p.translated_from === post.id && p.lang === 'es');
      if (esPost) {
        languages.es = `https://kooltechsolutions.com/es/blog/${esPost.slug}`;
      }
    }

    return {
      url,
      lastModified: post.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(Object.keys(languages).length > 1 ? {
        alternates: { languages }
      } : {}),
    };
  });

  return [
    {
      url: 'https://kooltechsolutions.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://kooltechsolutions.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://kooltechsolutions.com/es/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.85,
    },
    ...blogEntries,
  ];
}
