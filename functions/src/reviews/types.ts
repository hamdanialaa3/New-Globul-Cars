// functions/src/reviews/types.ts
// Reviews System Types

export interface Review {
  id: string;
  reviewerId: string;
  reviewerName: string;
  reviewerProfileType: 'private' | 'dealer' | 'company';
  
  targetUserId: string;
  targetUserName: string;
  targetUserType: 'dealer' | 'company';
  
  listingId?: string; // Optional: review related to specific listing
  
  // Ratings (1-5 stars)
  overallRating: number;
  categoryRatings: {
    communication: number;
    accuracy: number;
    professionalism: number;
    valueForMoney: number;
    responseTime?: number;
  };
  
  // Review content
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  
  // Transaction details
  transactionType: 'purchase' | 'inquiry' | 'service';
  transactionDate?: FirebaseFirestore.Timestamp;
  
  // Status
  status: 'pending' | 'published' | 'flagged' | 'removed';
  flagReason?: string;
  
  // Verification
  verified: boolean; // Verified purchase/interaction
  
  // Response from business
  response?: {
    text: string;
    respondedAt: FirebaseFirestore.Timestamp;
    respondedBy: string;
  };
  
  // Metadata
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
  helpfulCount: number;
  reportCount: number;
}

export interface ReviewStats {
  userId: string;
  
  // Overall
  totalReviews: number;
  averageRating: number;
  
  // Rating distribution
  fiveStars: number;
  fourStars: number;
  threeStars: number;
  twoStars: number;
  oneStar: number;
  
  // Category averages
  avgCommunication: number;
  avgAccuracy: number;
  avgProfessionalism: number;
  avgValueForMoney: number;
  avgResponseTime: number;
  
  // Status counts
  publishedReviews: number;
  pendingReviews: number;
  
  lastUpdated: FirebaseFirestore.Timestamp;
}

export interface SubmitReviewRequest {
  targetUserId: string;
  listingId?: string;
  overallRating: number;
  categoryRatings: {
    communication: number;
    accuracy: number;
    professionalism: number;
    valueForMoney: number;
    responseTime?: number;
  };
  title: string;
  comment: string;
  pros?: string[];
  cons?: string[];
  transactionType: 'purchase' | 'inquiry' | 'service';
  transactionDate?: string;
}

export interface GetReviewsRequest {
  targetUserId: string;
  listingId?: string;
  sortBy?: 'recent' | 'rating' | 'helpful';
  page?: number;
  limit?: number;
}

export interface MarkHelpfulRequest {
  reviewId: string;
}

export interface ReportReviewRequest {
  reviewId: string;
  reason: string;
}

export interface RespondToReviewRequest {
  reviewId: string;
  responseText: string;
}
