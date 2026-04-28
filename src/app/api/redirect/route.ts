import { NextRequest } from 'next/server';
import { handleSellerRedirect } from '@/lib/seller-redirect';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sellerId = searchParams.get('sellerId') || '';

  return handleSellerRedirect(sellerId, searchParams.get('tracked') === '1');
}
