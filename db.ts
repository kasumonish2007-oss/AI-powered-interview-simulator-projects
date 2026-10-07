import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
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
    readinessTier: string;
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

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'match' | 'system' | 'return' | 'verification' | 'message';
  read: boolean;
  relatedItemId?: string;
  createdAt: string;
}

export interface ItemReportDispute {
  id: string;
  itemId: string;
  reportedByUserId: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  createdAt: string;
}

// In-Memory Database with Seed Data
class Database {
  users: User[] = [];
  interviews: InterviewSession[] = [];
  items: LostFoundItem[] = [];
  notifications: Notification[] = [];
  reports: ItemReportDispute[] = [];

  constructor() {
    this.initSeedData();
  }

  private initSeedData() {
    const salt = bcrypt.genSaltSync(10);
    const demoPasswordHash = bcrypt.hashSync('campus1234', salt);
    const adminPasswordHash = bcrypt.hashSync('admin1234', salt);

    // 10 Demo Users (Student, Admin, Moderator)
    this.users = [
      {
        id: 'usr_admin_1',
        name: 'Dr. Elena Vance',
        email: 'admin@campusconnect.edu',
        passwordHash: adminPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: 'FAC-802',
        department: 'Career & Campus Affairs',
        year: 'Staff / Admin',
        phone: '+1 (555) 019-2831',
        role: 'admin',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        bio: 'Campus Dean of Student Services and Placement Officer.',
        createdAt: '2026-09-01T08:00:00Z',
      },
      {
        id: 'usr_mod_1',
        name: 'Marcus Chen',
        email: 'moderator@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: 'STU-MOD-441',
        department: 'Information Technology',
        year: '4th Year',
        phone: '+1 (555) 018-9922',
        role: 'moderator',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        bio: 'Student Council Moderator for Campus Safety & Lost/Found.',
        createdAt: '2026-09-05T09:30:00Z',
      },
      {
        id: 'usr_student_1',
        name: 'Alex Rivera',
        email: 'alex.rivera@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2023CS0148',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        phone: '+1 (555) 012-3456',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Full Stack Software Engineer',
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'System Design'],
        bio: 'Aspiring software developer preparing for summer 2027 tech internships.',
        createdAt: '2026-09-10T10:00:00Z',
      },
      {
        id: 'usr_student_2',
        name: 'Priya Sharma',
        email: 'priya.sharma@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2023EC0294',
        department: 'Electronics & Communication',
        year: '3rd Year',
        phone: '+1 (555) 014-7711',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Embedded Systems Engineer',
        skills: ['C++', 'IoT', 'Microcontrollers', 'Python'],
        createdAt: '2026-09-12T11:00:00Z',
      },
      {
        id: 'usr_student_3',
        name: 'Jordan Miller',
        email: 'jordan.miller@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2024ME0088',
        department: 'Mechanical Engineering',
        year: '2nd Year',
        phone: '+1 (555) 017-4321',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        targetRole: 'CAD Design & Robotics Intern',
        skills: ['SolidWorks', 'MATLAB', 'Python', 'Mechatronics'],
        createdAt: '2026-09-15T12:00:00Z',
      },
      {
        id: 'usr_student_4',
        name: 'Sofia Gomez',
        email: 'sofia.gomez@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2022DS0402',
        department: 'Data Science & AI',
        year: '4th Year',
        phone: '+1 (555) 019-8765',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Machine Learning Engineer',
        skills: ['PyTorch', 'Data Analysis', 'Scikit-Learn', 'SQL'],
        createdAt: '2026-09-18T14:20:00Z',
      },
      {
        id: 'usr_student_5',
        name: 'David Kim',
        email: 'david.kim@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2023IT0311',
        department: 'Information Technology',
        year: '3rd Year',
        phone: '+1 (555) 013-6543',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Cloud & DevOps Engineer',
        skills: ['Docker', 'Kubernetes', 'AWS', 'Linux'],
        createdAt: '2026-09-20T16:00:00Z',
      },
      {
        id: 'usr_student_6',
        name: 'Aisha Patel',
        email: 'aisha.patel@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2024CS0199',
        department: 'Computer Science',
        year: '2nd Year',
        phone: '+1 (555) 016-1122',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Frontend Developer',
        skills: ['React', 'CSS', 'JavaScript', 'UI/UX Design'],
        createdAt: '2026-09-22T08:45:00Z',
      },
      {
        id: 'usr_student_7',
        name: 'Liam Zhang',
        email: 'liam.zhang@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2023BT0103',
        department: 'Biotechnology',
        year: '3rd Year',
        phone: '+1 (555) 015-8899',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Bioinformatics Researcher',
        skills: ['Python', 'Genomics', 'Biostatistics', 'R'],
        createdAt: '2026-09-25T11:10:00Z',
      },
      {
        id: 'usr_student_8',
        name: 'Chloe Washington',
        email: 'chloe.w@campusconnect.edu',
        passwordHash: demoPasswordHash,
        college: 'State Institute of Science & Technology',
        studentId: '2022BA0512',
        department: 'Business Administration',
        year: '4th Year',
        phone: '+1 (555) 011-4455',
        role: 'student',
        avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        targetRole: 'Product Manager',
        skills: ['Agile', 'Product Strategy', 'Market Research', 'Data Analytics'],
        createdAt: '2026-09-28T13:40:00Z',
      },
    ];

    // 10 Lost Items
    this.items = [
      {
        id: 'item_lost_1',
        userId: 'usr_student_1',
        reporterName: 'Alex Rivera',
        reporterEmail: 'alex.rivera@campusconnect.edu',
        reporterPhone: '+1 (555) 012-3456',
        type: 'lost',
        itemName: 'Casio fx-991EX Scientific Calculator',
        category: 'Calculator',
        description: 'Black and silver Casio ClassWiz calculator. It has a small blue NASA sticker and initials "AR" written in silver marker on the battery back door.',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
        color: 'Black & Silver',
        brand: 'Casio',
        location: 'Central Library - 2nd Floor Study Cubicle',
        date: '2026-10-05',
        time: '14:30',
        identifiers: 'Small blue NASA sticker, "AR" written on back cover',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T15:00:00Z',
        updatedAt: '2026-10-05T15:00:00Z',
      },
      {
        id: 'item_lost_2',
        userId: 'usr_student_2',
        reporterName: 'Priya Sharma',
        reporterEmail: 'priya.sharma@campusconnect.edu',
        reporterPhone: '+1 (555) 014-7711',
        type: 'lost',
        itemName: 'Apple AirPods Pro (2nd Gen) in Green Case',
        category: 'Electronics',
        description: 'AirPods Pro with a matte olive green silicone protective case and a small carabiner ring. Lost during evening lab session.',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        color: 'Olive Green',
        brand: 'Apple',
        location: 'Engineering Building Lab 304',
        date: '2026-10-04',
        time: '17:15',
        identifiers: 'Olive green case with engraved initial "P" on keychain ring',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-04T18:00:00Z',
        updatedAt: '2026-10-04T18:00:00Z',
      },
      {
        id: 'item_lost_3',
        userId: 'usr_student_3',
        reporterName: 'Jordan Miller',
        reporterEmail: 'jordan.miller@campusconnect.edu',
        reporterPhone: '+1 (555) 017-4321',
        type: 'lost',
        itemName: 'Leather Bifold Wallet',
        category: 'Wallet',
        description: 'Dark brown leather Tommy Hilfiger bifold wallet containing College ID card, driver license, and campus cafeteria card.',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        color: 'Dark Brown',
        brand: 'Tommy Hilfiger',
        location: 'Campus Sports Complex Gym locker area',
        date: '2026-10-03',
        time: '18:45',
        identifiers: 'Student ID Jordan Miller inside transparent slot',
        contactPreference: 'email',
        status: 'active',
        createdAt: '2026-10-03T19:20:00Z',
        updatedAt: '2026-10-03T19:20:00Z',
      },
      {
        id: 'item_lost_4',
        userId: 'usr_student_4',
        reporterName: 'Sofia Gomez',
        reporterEmail: 'sofia.gomez@campusconnect.edu',
        reporterPhone: '+1 (555) 019-8765',
        type: 'lost',
        itemName: 'Hydro Flask 32oz Insulated Bottle',
        category: 'Bottle',
        description: 'Cobalt blue wide-mouth Hydro Flask bottle covered with tech stickers (Python, Docker, GitHub octocat).',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
        color: 'Cobalt Blue',
        brand: 'Hydro Flask',
        location: 'Lecture Hall Block B - Room 102',
        date: '2026-10-05',
        time: '11:15',
        identifiers: 'Multiple tech stickers including GitHub Octocat and Docker whale',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T12:00:00Z',
        updatedAt: '2026-10-05T12:00:00Z',
      },
      {
        id: 'item_lost_5',
        userId: 'usr_student_5',
        reporterName: 'David Kim',
        reporterEmail: 'david.kim@campusconnect.edu',
        reporterPhone: '+1 (555) 013-6543',
        type: 'lost',
        itemName: 'Campus Smart ID Card & Keyring',
        category: 'ID Card',
        description: 'SIST University student lanyard in navy blue with electronic access badge for Server Room and two brass keys on a bicycle charm ring.',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        color: 'Navy Blue / Brass',
        brand: 'Campus Issued',
        location: 'North Cafeteria food court bench',
        date: '2026-10-06',
        time: '13:00',
        identifiers: 'Student ID # 2023IT0311, miniature silver bicycle pendant',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-06T13:30:00Z',
        updatedAt: '2026-10-06T13:30:00Z',
      },
      {
        id: 'item_lost_6',
        userId: 'usr_student_6',
        reporterName: 'Aisha Patel',
        reporterEmail: 'aisha.patel@campusconnect.edu',
        reporterPhone: '+1 (555) 016-1122',
        type: 'lost',
        itemName: 'Grey The North Face Backpack',
        category: 'Bag',
        description: 'Heather grey Borealis backpack containing a spiral notebook, pencil case, and glasses in an orange case.',
        image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
        color: 'Heather Grey',
        brand: 'The North Face',
        location: 'Main Auditorium Foyer',
        date: '2026-10-04',
        time: '16:00',
        identifiers: 'Small plush bear keychain on zipper pull',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-04T16:30:00Z',
        updatedAt: '2026-10-04T16:30:00Z',
      },
      {
        id: 'item_lost_7',
        userId: 'usr_student_7',
        reporterName: 'Liam Zhang',
        reporterEmail: 'liam.zhang@campusconnect.edu',
        reporterPhone: '+1 (555) 015-8899',
        type: 'lost',
        itemName: 'Textbook: Molecular Cell Biology (9th Ed)',
        category: 'Books',
        description: 'Hardcover textbook by Lodish et al., highlighted in yellow in chapters 4 through 8.',
        image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80',
        color: 'Blue & White',
        brand: 'Macmillan',
        location: 'Bio-Sciences Department Lounge',
        date: '2026-10-02',
        time: '15:20',
        identifiers: 'Yellow highlighters throughout ch 4-8, "L. Zhang" inside front cover',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-02T16:00:00Z',
        updatedAt: '2026-10-02T16:00:00Z',
      },
      {
        id: 'item_lost_8',
        userId: 'usr_student_8',
        reporterName: 'Chloe Washington',
        reporterEmail: 'chloe.w@campusconnect.edu',
        reporterPhone: '+1 (555) 011-4455',
        type: 'lost',
        itemName: 'Black Patagonia Fleece Jacket (Size M)',
        category: 'Clothing',
        description: 'Women Snap-T pullover fleece jacket, black with turquoise inner collar trim. Forgotten after club meeting.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        color: 'Black with Turquoise trim',
        brand: 'Patagonia',
        location: 'Student Union Room 205',
        date: '2026-10-05',
        time: '19:00',
        identifiers: 'Turquoise snap buttons, lip balm in left pocket',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T20:00:00Z',
        updatedAt: '2026-10-05T20:00:00Z',
      },
      {
        id: 'item_lost_9',
        userId: 'usr_student_1',
        reporterName: 'Alex Rivera',
        reporterEmail: 'alex.rivera@campusconnect.edu',
        reporterPhone: '+1 (555) 012-3456',
        type: 'lost',
        itemName: 'Samsung T7 1TB Portable SSD',
        category: 'Electronics',
        description: 'Titanium grey metallic external solid state drive with high-speed USB-C braided cable.',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
        color: 'Titanium Grey',
        brand: 'Samsung',
        location: 'CS Lab 2 Computer Workstations',
        date: '2026-10-01',
        time: '17:00',
        identifiers: 'Laser engraved model number MU-PC1T0T',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-01T18:00:00Z',
        updatedAt: '2026-10-01T18:00:00Z',
      },
      {
        id: 'item_lost_10',
        userId: 'usr_student_3',
        reporterName: 'Jordan Miller',
        reporterEmail: 'jordan.miller@campusconnect.edu',
        reporterPhone: '+1 (555) 017-4321',
        type: 'lost',
        itemName: 'Ray-Ban Wayfarer Sunglasses in Black Case',
        category: 'Other',
        description: 'Classic matte black polarized Ray-Ban sunglasses inside standard textured case with microfibre cloth.',
        image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=80',
        color: 'Black',
        brand: 'Ray-Ban',
        location: 'Campus Amphitheater Steps',
        date: '2026-10-03',
        time: '13:30',
        identifiers: 'Tiny scratch on inner left temple',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-03T14:15:00Z',
        updatedAt: '2026-10-03T14:15:00Z',
      },

      // 10 Found Items (Some correlate strongly with lost items for AI matching demo!)
      {
        id: 'item_found_1',
        userId: 'usr_mod_1',
        reporterName: 'Marcus Chen',
        reporterEmail: 'moderator@campusconnect.edu',
        reporterPhone: '+1 (555) 018-9922',
        type: 'found',
        itemName: 'Scientific Casio Calculator with NASA sticker',
        category: 'Calculator',
        description: 'Found a black and silver Casio scientific calculator on desk #14 in Central Library 2nd floor. It has a round NASA space sticker and silver marker markings on the battery lid.',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
        color: 'Black & Silver',
        brand: 'Casio',
        location: 'Central Library - 2nd Floor Silent Study Section',
        date: '2026-10-05',
        time: '15:10',
        identifiers: 'Blue NASA sticker, silver initials on back',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T15:45:00Z',
        updatedAt: '2026-10-05T15:45:00Z',
      },
      {
        id: 'item_found_2',
        userId: 'usr_student_5',
        reporterName: 'David Kim',
        reporterEmail: 'david.kim@campusconnect.edu',
        reporterPhone: '+1 (555) 013-6543',
        type: 'found',
        itemName: 'AirPods Wireless Earphones in Olive Case',
        category: 'Electronics',
        description: 'Picked up a pair of white wireless AirPods in a green protective sleeve with small silver ring near the 3rd floor EE laboratory benches.',
        image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&auto=format&fit=crop&q=80',
        color: 'Olive Green',
        brand: 'Apple',
        location: 'Engineering Building 3rd Floor Hallway',
        date: '2026-10-04',
        time: '18:00',
        identifiers: 'Matte green silicone case with ring charm',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-04T18:30:00Z',
        updatedAt: '2026-10-04T18:30:00Z',
      },
      {
        id: 'item_found_3',
        userId: 'usr_student_6',
        reporterName: 'Aisha Patel',
        reporterEmail: 'aisha.patel@campusconnect.edu',
        reporterPhone: '+1 (555) 016-1122',
        type: 'found',
        itemName: 'Dark Brown Men Leather Wallet',
        category: 'Wallet',
        description: 'Found brown leather wallet on bench outside gym changing room. Handed over to Campus Security Desk for safe custody.',
        image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80',
        color: 'Dark Brown',
        brand: 'Tommy Hilfiger',
        location: 'Sports Complex Entrance',
        date: '2026-10-03',
        time: '19:15',
        identifiers: 'Contains student identification card and cards',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-03T19:45:00Z',
        updatedAt: '2026-10-03T19:45:00Z',
      },
      {
        id: 'item_found_4',
        userId: 'usr_student_7',
        reporterName: 'Liam Zhang',
        reporterEmail: 'liam.zhang@campusconnect.edu',
        reporterPhone: '+1 (555) 015-8899',
        type: 'found',
        itemName: 'Blue Metal Water Bottle with Stickers',
        category: 'Bottle',
        description: 'Found a 32oz cobalt blue Hydroflask with tech stickers left under lecture desk row 4.',
        image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
        color: 'Blue',
        brand: 'Hydro Flask',
        location: 'Lecture Hall Block B - Room 102',
        date: '2026-10-05',
        time: '13:00',
        identifiers: 'GitHub Octocat sticker and programming logo stickers',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T13:30:00Z',
        updatedAt: '2026-10-05T13:30:00Z',
      },
      {
        id: 'item_found_5',
        userId: 'usr_student_2',
        reporterName: 'Priya Sharma',
        reporterEmail: 'priya.sharma@campusconnect.edu',
        reporterPhone: '+1 (555) 014-7711',
        type: 'found',
        itemName: 'Student ID Lanyard with 2 Brass Keys',
        category: 'ID Card',
        description: 'Found SIST student ID lanyard with two brass keys and a silver bike keychain on cafeteria table near juice counter.',
        image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
        color: 'Navy Blue',
        brand: 'Campus Issued',
        location: 'North Cafeteria Table #8',
        date: '2026-10-06',
        time: '13:40',
        identifiers: 'IT Department ID card with miniature bike keychain',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-06T14:00:00Z',
        updatedAt: '2026-10-06T14:00:00Z',
      },
      {
        id: 'item_found_6',
        userId: 'usr_student_4',
        reporterName: 'Sofia Gomez',
        reporterEmail: 'sofia.gomez@campusconnect.edu',
        reporterPhone: '+1 (555) 019-8765',
        type: 'found',
        itemName: 'HP 65W USB-C Laptop Charger',
        category: 'Electronics',
        description: 'Black HP laptop power adapter with braided USB-C cable left plugged into wall outlet in Study Commons.',
        image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80',
        color: 'Black',
        brand: 'HP',
        location: 'Student Commons 1st Floor Study Pods',
        date: '2026-10-04',
        time: '11:00',
        identifiers: 'Wrap velcro strap labeled "HP 65W"',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-04T11:45:00Z',
        updatedAt: '2026-10-04T11:45:00Z',
      },
      {
        id: 'item_found_7',
        userId: 'usr_admin_1',
        reporterName: 'Dr. Elena Vance',
        reporterEmail: 'admin@campusconnect.edu',
        reporterPhone: '+1 (555) 019-2831',
        type: 'found',
        itemName: 'Titanium Grey Portable SSD Drive',
        category: 'Electronics',
        description: 'Turned into Placement Cell front office: Samsung compact 1TB SSD drive with braided cable found in computer lab 2.',
        image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&auto=format&fit=crop&q=80',
        color: 'Grey',
        brand: 'Samsung',
        location: 'CS Lab 2 / Placement Cell Reception',
        date: '2026-10-01',
        time: '18:30',
        identifiers: 'Samsung T7 model',
        contactPreference: 'email',
        status: 'active',
        createdAt: '2026-10-01T19:00:00Z',
        updatedAt: '2026-10-01T19:00:00Z',
      },
      {
        id: 'item_found_8',
        userId: 'usr_student_8',
        reporterName: 'Chloe Washington',
        reporterEmail: 'chloe.w@campusconnect.edu',
        reporterPhone: '+1 (555) 011-4455',
        type: 'found',
        itemName: 'Car Key Fob (Honda) on Leather Strap',
        category: 'Keys',
        description: 'Honda black electronic smart key fob with a tan leather strap found near South Parking Lot B entrance.',
        image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80',
        color: 'Black & Tan',
        brand: 'Honda',
        location: 'South Parking Lot B Gate 2',
        date: '2026-10-05',
        time: '09:15',
        identifiers: 'Red panic button, tan leather strap with brass rivet',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T09:40:00Z',
        updatedAt: '2026-10-05T09:40:00Z',
      },
      {
        id: 'item_found_9',
        userId: 'usr_mod_1',
        reporterName: 'Marcus Chen',
        reporterEmail: 'moderator@campusconnect.edu',
        reporterPhone: '+1 (555) 018-9922',
        type: 'found',
        itemName: 'Black Fleece Pullover with Turquoise Accents',
        category: 'Clothing',
        description: 'Patagonia fleece sweater left on a chair in Student Union Room 205. Turned into Student Council storage locker.',
        image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=600&auto=format&fit=crop&q=80',
        color: 'Black with Turquoise',
        brand: 'Patagonia',
        location: 'Student Union Room 205',
        date: '2026-10-05',
        time: '20:15',
        identifiers: 'Turquoise inner trim and snap buttons',
        contactPreference: 'in_app',
        status: 'active',
        createdAt: '2026-10-05T20:30:00Z',
        updatedAt: '2026-10-05T20:30:00Z',
      },
      {
        id: 'item_found_10',
        userId: 'usr_student_3',
        reporterName: 'Jordan Miller',
        reporterEmail: 'jordan.miller@campusconnect.edu',
        reporterPhone: '+1 (555) 017-4321',
        type: 'found',
        itemName: 'Scientific Casio fx-82MS (Resolved Item)',
        category: 'Calculator',
        description: 'Blue casing basic engineering calculator found last week and successfully reunited with owner.',
        image: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?w=600&auto=format&fit=crop&q=80',
        color: 'Blue',
        brand: 'Casio',
        location: 'Physics Lab Ground Floor',
        date: '2026-09-29',
        time: '14:00',
        identifiers: 'Physics class sticker',
        contactPreference: 'in_app',
        status: 'returned',
        createdAt: '2026-09-29T14:30:00Z',
        updatedAt: '2026-09-30T10:00:00Z',
      },
    ];

    // 5 Completed Interviews
    this.interviews = [
      {
        id: 'int_001',
        userId: 'usr_student_1',
        studentName: 'Alex Rivera',
        role: 'Full Stack Software Engineer',
        interviewType: 'Technical Interview',
        difficulty: 'Intermediate',
        skills: ['React', 'Node.js', 'System Design', 'PostgreSQL'],
        totalQuestions: 5,
        currentQuestionIndex: 5,
        status: 'completed',
        overallScore: 84,
        scores: {
          technicalScore: 88,
          communicationScore: 82,
          clarityScore: 85,
          confidenceScore: 80,
          relevanceScore: 89,
          problemSolvingScore: 81,
        },
        overallFeedback: {
          readinessTier: 'Very Good',
          strengths: [
            'Solid grasp of React 19 state synchronization and server components',
            'Clear articulation of database indexing strategies and query cost reduction',
            'Good structured problem decomposition using the STAR framework'
          ],
          areasToImprove: [
            'Could discuss caching invalidation edge cases in distributed systems earlier',
            'Quantify production metrics more sharply (e.g. latency percentiles p99 vs p50)'
          ],
          communicationTips: [
            'Keep introductory context concise before diving into technical trade-offs',
            'Explicitly confirm requirements with the interviewer before assuming scale'
          ],
          technicalRecommendations: [
            'Review Redis cache aside patterns and idempotency keys in payment workflows',
            'Practice distributed transaction patterns like Sagas and 2PC'
          ],
          suggestedPracticeTopics: [
            'System Design: Scalable URL Shortener with Sharding',
            'React Fiber Reconciliation and Concurrency Primitives'
          ],
          verdict: 'Candidate demonstrates strong mid-level competencies and is ready for technical screening rounds.'
        },
        questions: [
          {
            id: 'q1',
            questionNumber: 1,
            question: 'How does React Virtual DOM reconciliation work, and what advantages do keys provide in dynamic list rendering?',
            category: 'Frontend Engineering',
            difficulty: 'Intermediate',
            candidateAnswer: 'React maintains a lightweight virtual DOM in memory. When state updates occur, it creates a new tree and diffs it against the previous tree using heuristic O(n) algorithms. Keys tell React which specific elements changed, were added, or got removed across re-renders, preventing unneeded DOM mutations.',
            evaluation: {
              overallScore: 88,
              technicalScore: 90,
              communicationScore: 86,
              clarityScore: 88,
              confidenceScore: 85,
              relevanceScore: 92,
              problemSolvingScore: 85,
              strengths: ['Accurate heuristic diffing explanation', 'Direct answer on keyed reconciliation efficiency'],
              weaknesses: ['Did not mention key anti-patterns like using array indices when items can reorder'],
              suggestions: ['Point out why index as key leads to state leakage in uncontrolled inputs'],
              improvedAnswer: 'React uses an in-memory Virtual DOM to compare state changes against the prior snapshot using an efficient O(n) heuristic diff algorithm. Keys provide stable identities across renders; when rendering lists, unique keys prevent incorrect component reuse and avoid DOM re-creations. Using index as key is dangerous when elements are filtered or reordered.',
              summaryFeedback: 'Excellent fundamental knowledge of React internals with confident delivery.'
            },
            timeSpentSeconds: 65,
          },
          {
            id: 'q2',
            questionNumber: 2,
            question: 'You mentioned state updates in React. What specific steps would you take if a heavy list causes lag during live search filtering?',
            category: 'Frontend Performance',
            difficulty: 'Intermediate',
            isFollowUp: true,
            parentQuestion: 'How does React Virtual DOM reconciliation work...',
            candidateAnswer: 'I would use debouncing on user keystrokes to minimize filter calls, use useDeferredValue or useTransition so urgent typing input is not blocked, and implement virtualized scrolling like TanStack Virtual to only mount visible DOM nodes.',
            evaluation: {
              overallScore: 91,
              technicalScore: 92,
              communicationScore: 90,
              clarityScore: 90,
              confidenceScore: 88,
              relevanceScore: 95,
              problemSolvingScore: 90,
              strengths: ['Great combination of concurrent React features and DOM virtualization', 'Pragmatic production focus'],
              weaknesses: ['Could mention web workers for multi-million item compute'],
              suggestions: ['Highlight profiling using React DevTools Profiler flamegraphs'],
              improvedAnswer: 'I prioritize two layers: CPU computation and DOM footprint. For computation, I debounce input by ~250ms and wrap filtering in useDeferredValue to keep keystrokes 60fps. For DOM layout, I virtualize the list with react-window or TanStack Virtual so only 15-20 nodes exist in DOM. If dataset exceeds 50k rows, I offload search indexing to Web Workers or Elasticsearch backend.',
              summaryFeedback: 'Outstanding response demonstrating practical full-stack performance tuning.'
            },
            timeSpentSeconds: 78,
          },
        ],
        createdAt: '2026-10-05T10:00:00Z',
        completedAt: '2026-10-05T10:25:00Z',
      },
      {
        id: 'int_002',
        userId: 'usr_student_1',
        studentName: 'Alex Rivera',
        role: 'Full Stack Software Engineer',
        interviewType: 'Behavioral Interview',
        difficulty: 'Intermediate',
        skills: ['Teamwork', 'Conflict Resolution', 'Leadership', 'Delivery'],
        totalQuestions: 4,
        currentQuestionIndex: 4,
        status: 'completed',
        overallScore: 78,
        scores: {
          technicalScore: 74,
          communicationScore: 82,
          clarityScore: 79,
          confidenceScore: 76,
          relevanceScore: 82,
          problemSolvingScore: 75,
        },
        overallFeedback: {
          readinessTier: 'Good',
          strengths: ['Constructive attitude toward team conflicts', 'Clear communication and honesty about mistakes'],
          areasToImprove: ['Use stricter STAR framework to make Action and Result metrics more pronounced'],
          communicationTips: ['State the measurable outcome at the beginning as an executive hook'],
          technicalRecommendations: ['Focus on engineering collaboration tools and retrospectives'],
          suggestedPracticeTopics: ['Tell me about a time you missed a deadline and how you handled stakeholder communication'],
          verdict: 'Good interpersonal presence; refining impact metrics will elevate score into top percentile.'
        },
        questions: [],
        createdAt: '2026-10-03T14:00:00Z',
        completedAt: '2026-10-03T14:22:00Z',
      },
      {
        id: 'int_003',
        userId: 'usr_student_2',
        studentName: 'Priya Sharma',
        role: 'Embedded Systems Engineer',
        interviewType: 'Technical Interview',
        difficulty: 'Intermediate',
        skills: ['C++', 'RTOS', 'I2C', 'SPI', 'Microcontrollers'],
        totalQuestions: 5,
        currentQuestionIndex: 5,
        status: 'completed',
        overallScore: 86,
        scores: {
          technicalScore: 90,
          communicationScore: 84,
          clarityScore: 86,
          confidenceScore: 83,
          relevanceScore: 88,
          problemSolvingScore: 87,
        },
        overallFeedback: {
          readinessTier: 'Very Good',
          strengths: ['Deep understanding of interrupt service routines and race conditions', 'Clear timing diagram analysis'],
          areasToImprove: ['Elaborate more on memory footprint reduction in resource constrained MCUs'],
          communicationTips: ['Maintain steady pace when explaining complex state machines'],
          technicalRecommendations: ['Practice FreeRTOS queue versus semaphore synchronization patterns'],
          suggestedPracticeTopics: ['Deadlock prevention in embedded RTOS systems'],
          verdict: 'Very strong technical competence, primed for aerospace or hardware internships.'
        },
        questions: [],
        createdAt: '2026-10-02T11:00:00Z',
        completedAt: '2026-10-02T11:28:00Z',
      },
      {
        id: 'int_004',
        userId: 'usr_student_4',
        studentName: 'Sofia Gomez',
        role: 'Machine Learning Engineer',
        interviewType: 'Coding Interview',
        difficulty: 'Advanced',
        skills: ['PyTorch', 'Transformers', 'Model Quantization', 'Linear Algebra'],
        totalQuestions: 4,
        currentQuestionIndex: 4,
        status: 'completed',
        overallScore: 92,
        scores: {
          technicalScore: 95,
          communicationScore: 90,
          clarityScore: 92,
          confidenceScore: 90,
          relevanceScore: 94,
          problemSolvingScore: 93,
        },
        overallFeedback: {
          readinessTier: 'Excellent',
          strengths: ['Flawless explanation of FlashAttention mechanisms', 'Rigorous complexity analysis of attention layers'],
          areasToImprove: ['Could briefly touch on serving latency with TensorRT-LLM'],
          communicationTips: ['Already exceptionally structured and crisp'],
          technicalRecommendations: ['Explore speculative decoding algorithms'],
          suggestedPracticeTopics: ['Distributed training with FSDP and ZeRO-3'],
          verdict: 'Excellent hire potential; top 5% candidate readiness.'
        },
        questions: [],
        createdAt: '2026-10-04T15:00:00Z',
        completedAt: '2026-10-04T15:35:00Z',
      },
      {
        id: 'int_005',
        userId: 'usr_student_5',
        studentName: 'David Kim',
        role: 'Cloud & DevOps Engineer',
        interviewType: 'HR Interview',
        difficulty: 'Beginner',
        skills: ['Leadership', 'Cultural Fit', 'Adaptability'],
        totalQuestions: 3,
        currentQuestionIndex: 3,
        status: 'completed',
        overallScore: 73,
        scores: {
          technicalScore: 70,
          communicationScore: 76,
          clarityScore: 74,
          confidenceScore: 72,
          relevanceScore: 75,
          problemSolvingScore: 71,
        },
        overallFeedback: {
          readinessTier: 'Good',
          strengths: ['Enthusiastic and eager to learn', 'Great alignment with company growth vision'],
          areasToImprove: ['Avoid filler words when thinking through answers under pressure'],
          communicationTips: ['Take a 3-second breath before starting your response'],
          technicalRecommendations: ['Structure career goals into 1-year and 3-year milestones'],
          suggestedPracticeTopics: ['Why do you want to work for our engineering team specifically?'],
          verdict: 'Solid foundation, with practice on executive phrasing can reach 85%+.'
        },
        questions: [],
        createdAt: '2026-10-01T09:30:00Z',
        completedAt: '2026-10-01T09:50:00Z',
      },
    ];

    // 10 Notifications
    this.notifications = [
      {
        id: 'notif_1',
        userId: 'usr_student_1',
        title: 'High AI Match Alert (94%)',
        message: 'A found Casio Scientific Calculator reported by Marcus Chen closely matches your lost Casio fx-991EX near Central Library.',
        type: 'match',
        read: false,
        relatedItemId: 'item_found_1',
        createdAt: '2026-10-05T15:46:00Z',
      },
      {
        id: 'notif_2',
        userId: 'usr_student_2',
        title: 'Possible Match Found (91%)',
        message: 'A report for AirPods in Olive Green case was submitted near Engineering Building 3rd Floor.',
        type: 'match',
        read: false,
        relatedItemId: 'item_found_2',
        createdAt: '2026-10-04T18:32:00Z',
      },
      {
        id: 'notif_3',
        userId: 'usr_student_3',
        title: 'Item Turned Into Campus Security (89%)',
        message: 'A Tommy Hilfiger Dark Brown leather wallet was found near Sports Complex and turned in to Security Desk.',
        type: 'match',
        read: true,
        relatedItemId: 'item_found_3',
        createdAt: '2026-10-03T19:46:00Z',
      },
      {
        id: 'notif_4',
        userId: 'usr_student_4',
        title: 'Water Bottle Match Found (95%)',
        message: 'A Cobalt Blue Hydro Flask with tech stickers found in Lecture Hall Block B Rm 102 matches your report.',
        type: 'match',
        read: false,
        relatedItemId: 'item_found_4',
        createdAt: '2026-10-05T13:31:00Z',
      },
      {
        id: 'notif_5',
        userId: 'usr_student_5',
        title: 'Smart ID & Keys Recovered (96%)',
        message: 'Priya Sharma found an IT Department smart ID lanyard with 2 brass keys in North Cafeteria.',
        type: 'match',
        read: false,
        relatedItemId: 'item_found_5',
        createdAt: '2026-10-06T14:02:00Z',
      },
      {
        id: 'notif_6',
        userId: 'usr_student_1',
        title: 'Interview Performance Report Ready 🎉',
        message: 'Your Full Stack Technical Interview scored 84/100 (Very Good). Detailed feedback is available in your dashboard.',
        type: 'system',
        read: true,
        createdAt: '2026-10-05T10:26:00Z',
      },
      {
        id: 'notif_7',
        userId: 'usr_student_8',
        title: 'Item Match Found (93%)',
        message: 'Marcus Chen reported a black Patagonia fleece sweater in Student Union Room 205 matching your lost report.',
        type: 'match',
        read: true,
        relatedItemId: 'item_found_9',
        createdAt: '2026-10-05T20:31:00Z',
      },
      {
        id: 'notif_8',
        userId: 'usr_student_1',
        title: 'Listing Verified by Moderator',
        message: 'Your lost Samsung T7 SSD listing was reviewed and verified by campus moderator Marcus Chen.',
        type: 'verification',
        read: true,
        relatedItemId: 'item_lost_9',
        createdAt: '2026-10-02T09:00:00Z',
      },
      {
        id: 'notif_9',
        userId: 'usr_student_3',
        title: 'Item Successfully Returned!',
        message: 'Your previous calculator report has been marked as returned and archived.',
        type: 'return',
        read: true,
        relatedItemId: 'item_found_10',
        createdAt: '2026-09-30T10:05:00Z',
      },
      {
        id: 'notif_10',
        userId: 'usr_admin_1',
        title: 'Campus Report Summary',
        message: 'Monthly lost and found recovery rate reached 74% with 42 items safely returned across departments.',
        type: 'system',
        read: false,
        createdAt: '2026-10-06T08:00:00Z',
      },
    ];

    // Reports
    this.reports = [
      {
        id: 'rep_1',
        itemId: 'item_lost_10',
        reportedByUserId: 'usr_student_5',
        reason: 'Duplicate listing or test entry',
        status: 'pending',
        createdAt: '2026-10-04T10:00:00Z',
      }
    ];
  }

  // User queries
  findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findUserByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(user: User): User {
    this.users.unshift(user);
    return user;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.users.findIndex((u) => u.id === id);
    if (idx === -1) return undefined;
    this.users[idx] = { ...this.users[idx], ...updates };
    return this.users[idx];
  }

  // Interview queries
  findInterviewsByUser(userId: string): InterviewSession[] {
    return this.interviews.filter((i) => i.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findInterviewById(id: string): InterviewSession | undefined {
    return this.interviews.find((i) => i.id === id);
  }

  createInterview(interview: InterviewSession): InterviewSession {
    this.interviews.unshift(interview);
    return interview;
  }

  updateInterview(id: string, updates: Partial<InterviewSession>): InterviewSession | undefined {
    const idx = this.interviews.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.interviews[idx] = { ...this.interviews[idx], ...updates };
    return this.interviews[idx];
  }

  // Items queries
  getAllItems(): LostFoundItem[] {
    return [...this.items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  findItemById(id: string): LostFoundItem | undefined {
    return this.items.find((i) => i.id === id);
  }

  createItem(item: LostFoundItem): LostFoundItem {
    this.items.unshift(item);
    return item;
  }

  updateItem(id: string, updates: Partial<LostFoundItem>): LostFoundItem | undefined {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    this.items[idx] = { ...this.items[idx], ...updates, updatedAt: new Date().toISOString() };
    return this.items[idx];
  }

  deleteItem(id: string): boolean {
    const idx = this.items.findIndex((i) => i.id === id);
    if (idx === -1) return false;
    this.items.splice(idx, 1);
    return true;
  }

  // Notifications
  getNotificationsByUser(userId: string): Notification[] {
    return this.notifications.filter((n) => n.userId === userId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createNotification(notif: Notification): Notification {
    this.notifications.unshift(notif);
    return notif;
  }

  markNotificationRead(id: string, userId: string): boolean {
    const notif = this.notifications.find((n) => n.id === id && n.userId === userId);
    if (notif) {
      notif.read = true;
      return true;
    }
    return false;
  }

  markAllNotificationsRead(userId: string): void {
    this.notifications.forEach((n) => {
      if (n.userId === userId) n.read = true;
    });
  }

  // Reports
  createReport(report: ItemReportDispute): ItemReportDispute {
    this.reports.unshift(report);
    return report;
  }

  getAllReports(): ItemReportDispute[] {
    return this.reports;
  }
}

export const db = new Database();
