// Forum Request DTOs
export interface CreateTopicRequest {
  title: string;
  content: string;
  imageUrls?: string[]; // Optional: Array of image URLs from Cloudinary
}

export interface CreateReplyRequest {
  content: string;
  parentReplyId?: string; // Optional: ID of parent reply for nested replies
  imageUrls?: string[]; // Optional: Array of image URLs from Cloudinary
}
