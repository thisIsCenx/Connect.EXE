// Forum Response DTOs
export interface TopicResponse {
  topicId: string;
  title: string;
  userId: string;
  authorName: string;
  content: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount: number;
}

export interface TopicDetailResponse {
  topicId: string;
  title: string;
  userId: string;
  authorName: string;
  content: string;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
  replies: ReplyResponse[];
}

export interface ReplyResponse {
  replyId: string;
  topicId: string;
  userId: string;
  authorName: string;
  content: string;
  createdAt: string;
  parentReplyId?: string; // ID of parent reply (null/undefined for root replies)
  children?: ReplyResponse[]; // Nested replies
  replyCount?: number; // Count of child replies
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}
