import { Request, Response, NextFunction } from 'express';
import { biddingService } from '../services/biddingService';

const serviceUnavailableResponse = {
  error: 'Serviço temporariamente indisponível',
  message: 'O portal PNCP está passando por manutenção. Tente novamente em alguns minutos.',
};

export const getAllBidding = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      search,
      query,
      category,
      status,
      uf,
      modalidade,
      valorMin,
      valorMax,
      dataInicial,
      dataFinal,
      pagina,
      tamanhoPagina,
    } = req.query;

    const filters = {
      query: (search || query) as string | undefined,
      category: category as string | undefined,
      status: status as string | undefined,
      uf: uf as string | undefined,
      modalidade: modalidade ? parseInt(modalidade as string, 10) : undefined,
      valorMin: valorMin ? parseFloat(valorMin as string) : undefined,
      valorMax: valorMax ? parseFloat(valorMax as string) : undefined,
      dataInicial: dataInicial as string | undefined,
      dataFinal: dataFinal as string | undefined,
      pagina: pagina ? parseInt(pagina as string, 10) : 1,
      tamanhoPagina: tamanhoPagina ? parseInt(tamanhoPagina as string, 10) : undefined,
    };

    const biddings = await biddingService.findAll(filters);
    res.json(biddings);
  } catch (error) {
    if (error instanceof Error && error.message === 'PNCP_API_UNAVAILABLE') {
      res.status(503).json(serviceUnavailableResponse);
      return;
    }
    next(error);
  }
};

export const getBiddingById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const bidding = await biddingService.findById(id);

    if (!bidding) {
      res.status(404).json({ error: 'Licitação não encontrada' });
      return;
    }

    res.json(bidding);
  } catch (error) {
    if (error instanceof Error && error.message === 'PNCP_API_UNAVAILABLE') {
      res.status(503).json(serviceUnavailableResponse);
      return;
    }
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await biddingService.getCategories();
    res.json(categories);
  } catch (error) {
    if (error instanceof Error && error.message === 'PNCP_API_UNAVAILABLE') {
      res.status(503).json(serviceUnavailableResponse);
      return;
    }
    next(error);
  }
};

export const getModalidades = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const modalidades = await biddingService.getModalidades();
    res.json(modalidades);
  } catch (error) {
    if (error instanceof Error && error.message === 'PNCP_API_UNAVAILABLE') {
      res.status(503).json(serviceUnavailableResponse);
      return;
    }
    next(error);
  }
};
