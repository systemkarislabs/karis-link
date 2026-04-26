import { handleSellerRedirect } from '@/lib/seller-redirect';

export async function GET(_: Request, { params }: { params: Promise<{ sellerId: string }> }) {
  const { sellerId } = await params;
  return handleSellerRedirect(sellerId);
}
