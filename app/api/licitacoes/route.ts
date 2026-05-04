import { NextResponse } from 'next/server';
import { pncpBiddingService } from '@/lib/services/pncpService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters = {
      query: searchParams.get('search') || undefined,
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      uf: searchParams.get('uf') || undefined,
      modalidade: searchParams.get('modalidade') ? parseInt(searchParams.get('modalidade')!, 10) : undefined,
      valorMin: searchParams.get('valorMin') ? parseFloat(searchParams.get('valorMin')!) : undefined,
      valorMax: searchParams.get('valorMax') ? parseFloat(searchParams.get('valorMax')!) : undefined,
      dataInicial: searchParams.get('dataInicial') || undefined,
      dataFinal: searchParams.get('dataFinal') || undefined,
      pagina: searchParams.get('pagina') ? parseInt(searchParams.get('pagina')!, 10) : 1,
      tamanhoPagina: searchParams.get('tamanhoPagina') ? parseInt(searchParams.get('tamanhoPagina')!, 10) : 50,
    };

    const result = await pncpBiddingService.findAll(filters);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro na API licitacoes:', error);
    return NextResponse.json(
      { error: 'Serviço temporariamente indisponível', message: 'O portal PNCP está passando por manutenção.' },
      { status: 503 }
    );
  }
}