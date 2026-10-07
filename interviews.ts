import { Router, Response } from 'express';
import { db, InterviewSession, InterviewQuestionItem } from '../db';
import { AuthenticatedRequest, authenticate } from '../middleware/auth';
import { aiService } from '../aiService';

const router = Router();

// POST /api/interviews/start
router.post('/start', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const {
      role = 'Software Developer',
      interviewType = 'Technical Interview',
      difficulty = 'Intermediate',
      skills = ['JavaScript', 'React', 'Problem Solving'],
      targetCompany = 'Tech Solutions Corp',
      totalQuestions = 5,
    } = req.body;

    const initialQ = await aiService.generateInterviewQuestion({
      role,
      interviewType,
      difficulty,
      skills,
      questionNumber: 1,
      totalQuestions: Math.max(3, Math.min(10, Number(totalQuestions) || 5)),
    });

    const firstQuestionItem: InterviewQuestionItem = {
      id: `q_${Date.now()}_1`,
      questionNumber: 1,
      question: initialQ.question,
      category: initialQ.category,
      difficulty: initialQ.difficulty,
    };

    const newSession: InterviewSession = {
      id: `int_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      userId: req.user.id,
      studentName: req.user.name,
      role,
      interviewType,
      difficulty,
      targetCompany,
      skills,
      totalQuestions: Math.max(3, Math.min(10, Number(totalQuestions) || 5)),
      currentQuestionIndex: 1,
      status: 'in_progress',
      questions: [firstQuestionItem],
      createdAt: new Date().toISOString(),
    };

    db.createInterview(newSession);

    res.status(201).json({
      success: true,
      message: 'Interview session started',
      data: newSession,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to start interview' });
  }
});

// POST /api/interviews/evaluate
router.post('/evaluate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, questionId, answer, timeSpentSeconds = 60 } = req.body;

    if (!sessionId || !answer) {
      res.status(400).json({ success: false, message: 'Session ID and answer are required' });
      return;
    }

    const session = db.findInterviewById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    const targetQuestion = session.questions.find((q) => q.id === questionId) || session.questions[session.questions.length - 1];
    if (!targetQuestion) {
      res.status(404).json({ success: false, message: 'Question not found in session' });
      return;
    }

    // Evaluate with AI
    const evaluation = await aiService.evaluateAnswer(
      {
        role: session.role,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
      },
      targetQuestion.question,
      answer
    );

    targetQuestion.candidateAnswer = answer;
    targetQuestion.evaluation = evaluation;
    targetQuestion.timeSpentSeconds = Number(timeSpentSeconds) || 60;

    db.updateInterview(sessionId, {
      questions: session.questions,
    });

    res.json({
      success: true,
      message: 'Answer evaluated successfully',
      data: {
        evaluation,
        question: targetQuestion,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Evaluation failed' });
  }
});

// POST /api/interviews/followup
router.post('/followup', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, previousQuestion, previousAnswer } = req.body;
    const session = db.findInterviewById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    const followUp = await aiService.generateFollowUpQuestion(
      {
        role: session.role,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        skills: session.skills,
        questionNumber: session.questions.length + 1,
        totalQuestions: session.totalQuestions,
      },
      previousQuestion,
      previousAnswer
    );

    const followUpItem: InterviewQuestionItem = {
      id: `q_${Date.now()}_followup`,
      questionNumber: session.questions.length + 1,
      question: followUp.question,
      category: followUp.category,
      difficulty: followUp.difficulty,
      isFollowUp: true,
      parentQuestion: previousQuestion,
    };

    session.questions.push(followUpItem);
    session.currentQuestionIndex = session.questions.length;
    db.updateInterview(sessionId, {
      questions: session.questions,
      currentQuestionIndex: session.currentQuestionIndex,
    });

    res.json({
      success: true,
      message: 'Adaptive follow-up question generated',
      data: followUpItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate follow-up' });
  }
});

// POST /api/interviews/question
router.post('/question', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = db.findInterviewById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    const nextQNum = session.questions.length + 1;
    const previousQA = session.questions
      .filter((q) => q.candidateAnswer)
      .map((q) => ({
        question: q.question,
        answer: q.candidateAnswer || '',
        score: q.evaluation?.overallScore,
      }));

    const generated = await aiService.generateInterviewQuestion({
      role: session.role,
      interviewType: session.interviewType,
      difficulty: session.difficulty,
      skills: session.skills,
      questionNumber: nextQNum,
      totalQuestions: session.totalQuestions,
      previousQA,
    });

    const newQuestionItem: InterviewQuestionItem = {
      id: `q_${Date.now()}_${nextQNum}`,
      questionNumber: nextQNum,
      question: generated.question,
      category: generated.category,
      difficulty: generated.difficulty,
    };

    session.questions.push(newQuestionItem);
    session.currentQuestionIndex = nextQNum;
    db.updateInterview(sessionId, {
      questions: session.questions,
      currentQuestionIndex: nextQNum,
    });

    res.json({
      success: true,
      message: 'Next question generated',
      data: newQuestionItem,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to generate next question' });
  }
});

// POST /api/interviews/complete
router.post('/complete', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.body;
    const session = db.findInterviewById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Interview session not found' });
      return;
    }

    const qaList = session.questions
      .filter((q) => q.candidateAnswer)
      .map((q) => ({
        question: q.question,
        answer: q.candidateAnswer || '',
        evaluation: q.evaluation,
      }));

    const finalFeedback = await aiService.generateInterviewFeedback(
      {
        role: session.role,
        interviewType: session.interviewType,
        difficulty: session.difficulty,
        skills: session.skills,
      },
      qaList
    );

    const updatedSession = db.updateInterview(sessionId, {
      status: 'completed',
      overallScore: finalFeedback.overallScore,
      scores: finalFeedback.scores,
      overallFeedback: {
        readinessTier: finalFeedback.readinessTier,
        strengths: finalFeedback.strengths,
        areasToImprove: finalFeedback.areasToImprove,
        communicationTips: finalFeedback.communicationTips,
        technicalRecommendations: finalFeedback.technicalRecommendations,
        suggestedPracticeTopics: finalFeedback.suggestedPracticeTopics,
        verdict: finalFeedback.verdict,
      },
      completedAt: new Date().toISOString(),
    });

    // Create student notification
    if (req.user) {
      db.createNotification({
        id: `notif_${Date.now()}`,
        userId: req.user.id,
        title: `Interview Completed: ${finalFeedback.overallScore}/100 🎉`,
        message: `Your ${session.role} mock interview scored ${finalFeedback.overallScore} (${finalFeedback.readinessTier}). Review detailed feedback now!`,
        type: 'system',
        read: false,
        createdAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: 'Interview completed successfully',
      data: updatedSession,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message || 'Failed to complete interview' });
  }
});

// GET /api/interviews/history
router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }
  const history = db.findInterviewsByUser(req.user.id);
  res.json({
    success: true,
    data: history,
  });
});

// GET /api/interviews/:id
router.get('/:id', authenticate, (req: AuthenticatedRequest, res: Response) => {
  const session = db.findInterviewById(req.params.id);
  if (!session) {
    res.status(404).json({ success: false, message: 'Interview session not found' });
    return;
  }
  res.json({
    success: true,
    data: session,
  });
});

export default router;
