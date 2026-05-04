import { NextResponse } from 'next/server';
import { pncpBiddingService } from '@/lib/services/pncpService';

export async function GET() {
  try {
    const categories = await pncpBiddingService.getCategories();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Erro na API categorias:', error);
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível' },
      { status: 503 }
    );
  }
}