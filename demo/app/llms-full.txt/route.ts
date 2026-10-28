import { DOC_MARKDOWN } from '@/lib/docs';

export const dynamic = 'force-static';

/** The whole guide in one file, for language models and answer engines. */
export function GET() {
  return new Response(DOC_MARKDOWN, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
