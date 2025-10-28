// Forum Request DTOs
export interface CreateTopicRequest {
  title: string;
  content: string;
}

export interface CreateReplyRequest {
  content: string;
  parentReplyId?: string; // Optional: ID of parent reply for nested replies
}
