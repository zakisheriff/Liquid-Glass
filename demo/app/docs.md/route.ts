import { DOC_MARKDOWN } from '@/lib/docs';

export const dynamic = 'force-static';

export function GET() {
  return new Response(DOC_MARKDOWN, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
