import { NextResponse } from 'next/server';
import { pncpBiddingService } from '@/lib/services/pncpService';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bidding = await pncpBiddingService.findById(id);
    
    if (!bidding) {
      return NextResponse.json({ error: 'Licitação não encontrada' }, { status: 404 });
    }
    
    return NextResponse.json(bidding);
  } catch (error) {
    console.error('Erro na API licitacao:', error);
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível', message: 'O portal PNCP está passando por manutenção.' },
      { status: 503 }
    );
  }
}