// Admin Request DTOs

export interface UpdateUserStatusRequestDTO {
  userId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}

export interface ApproveProjectRequestDTO {
  projectId: string;
  approved: boolean;
  reason?: string;
}

export interface PaginationRequestDTO {
  page: number;
  size: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilterRequestDTO extends PaginationRequestDTO {
  role?: string;
  status?: string;
  searchQuery?: string;
}

export interface ProjectFilterRequestDTO extends PaginationRequestDTO {
  status?: string;
  searchQuery?: string;
}
