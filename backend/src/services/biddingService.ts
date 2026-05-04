import { Bidding, BiddingService, SearchFilters, PaginatedResponse } from '../types/bidding';
import { pncpBiddingService } from './pncpService';

export { pncpBiddingService } from './pncpService';

class PncpBiddingServiceAdapter implements BiddingService {
  async findAll(filters?: SearchFilters): Promise<PaginatedResponse<Bidding>> {
    return pncpBiddingService.findAll(filters);
  }

  async findById(id: string): Promise<Bidding | null> {
    return pncpBiddingService.findById(id);
  }

  async getCategories(): Promise<string[]> {
    return pncpBiddingService.getCategories();
  }

  async getModalidades(): Promise<string[]> {
    return pncpBiddingService.getModalidades();
  }
}

export const biddingService: BiddingService = new PncpBiddingServiceAdapter();