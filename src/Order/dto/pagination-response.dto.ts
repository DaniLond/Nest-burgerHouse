// paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
  currentPage?: number; // Opcional, para conveniencia
  totalPages: number;
}