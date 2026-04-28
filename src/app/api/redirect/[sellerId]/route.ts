import { handleSellerRedirect } from '@/lib/seller-redirect';

export async function GET(request: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  const { searchParams } = new URL(request.url);
  return handleSellerRedirect(sellerId, searchParams.get('tracked') === '1');
}
