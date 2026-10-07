export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  studentId: string;
  department: string;
  year: string;
  phone: string;
  role: 'student' | 'admin' | 'moderator';
  avatarUrl?: string;
  targetRole?: string;
  skills?: string[];
  bio?: string;
  createdAt: string;
}

export interface InterviewEvaluation {
  overallScore: number;
  technicalScore: number;
  communicationScore: number;
  clarityScore: number;
  confidenceScore: number;
  relevanceScore: number;
  problemSolvingScore: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  improvedAnswer: string;
  summaryFeedback: string;
}

export interface InterviewQuestionItem {
  id: string;
  questionNumber: number;
  question: string;
  category: string;
  difficulty: string;
  isFollowUp?: boolean;
  parentQuestion?: string;
  candidateAnswer?: string;
  evaluation?: InterviewEvaluation;
  timeSpentSeconds?: number;
}

export interface InterviewSession {
  id: string;
  userId: string;
  studentName: string;
  role: string;
  interviewType: string;
  difficulty: string;
  targetCompany?: string;
  skills: string[];
  totalQuestions: number;
  currentQuestionIndex: number;
  status: 'in_progress' | 'completed' | 'abandoned';
  questions: InterviewQuestionItem[];
  overallScore?: number;
  scores?: {
    technicalScore: number;
    communicationScore: number;
    clarityScore: number;
    confidenceScore: number;
    relevanceScore: number;
    problemSolvingScore: number;
  };
  overallFeedback?: {
    readinessTier: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'Needs More Practice';
    strengths: string[];
    areasToImprove: string[];
    communicationTips: string[];
    technicalRecommendations: string[];
    suggestedPracticeTopics: string[];
    verdict: string;
  };
  createdAt: string;
  completedAt?: string;
}

export interface LostFoundItem {
  id: string;
  userId: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone?: string;
  type: 'lost' | 'found';
  itemName: string;
  category: string;
  description: string;
  image: string;
  color: string;
  brand: string;
  location: string;
  date: string;
  time: string;
  identifiers: string;
  contactPreference: 'email' | 'in_app' | 'phone';
  status: 'active' | 'matched' | 'returned' | 'closed' | 'reported';
  matchedItemId?: string;
  reportCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchFactor {
  itemSimilarity: number;
  descriptionSimilarity: number;
  locationSimilarity: number;
  dateProximity: number;
  colorBrandMatch: number;
  identifierMatch: number;
}

export interface ItemMatch {
  foundItemId: string;
  matchScore: number;
  confidenceTier: 'Excellent Match' | 'Strong Match' | 'Possible Match' | 'Weak Match';
  matchReason: string;
  factors: MatchFactor;
  item?: LostFoundItem;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'system' | 'return' | 'verification' | 'message';
  read: boolean;
  relatedItemId?: string;
  createdAt: string;
}

export interface AdminStats {
  totalStudents: number;
  totalInterviews: number;
  avgScore: number;
  lostItems: number;
  foundItems: number;
  returnedItems: number;
  pendingReports: number;
  recoveryRate: number;
  interviewTypeBreakdown: Array<{ type: string; count: number; avgScore: number }>;
  monthlyTrends: Array<{ month: string; interviews: number; lost: number; returned: number }>;
}
