import React, { useState, useEffect, useRef } from 'react';
import { InterviewSession, InterviewQuestionItem, InterviewEvaluation } from '../../types';
import { api } from '../../services/api';
import {
  Bot,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  Award,
  RefreshCw,
  Zap,
} from 'lucide-react';

interface InterviewSessionPageProps {
  session: InterviewSession;
  onFinishSession: (completedSession: InterviewSession) => void;
  setActiveTab: (tab: string) => void;
}

export const InterviewSessionPage: React.FC<InterviewSessionPageProps> = ({
  session: initialSession,
  onFinishSession,
  setActiveTab,
}) => {
  const [session, setSession] = useState<InterviewSession>(initialSession);
  const [currentQIndex, setCurrentQIndex] = useState(session.questions.length - 1);
  const currentQuestion: InterviewQuestionItem =
    session.questions[currentQIndex] || session.questions[0];

  const [answerText, setAnswerText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [generatingNext, setGeneratingNext] = useState(false);
  const [currentEvaluation, setCurrentEvaluation] = useState<InterviewEvaluation | null>(
    currentQuestion.evaluation || null
  );

  const [timerSeconds, setTimerSeconds] = useState(0);
  const recognitionRef = useRef<any>(null);

  // Timer for answer duration
  useEffect(() => {
    let interval: any;
    if (!currentEvaluation) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentEvaluation, currentQIndex]);

  // Read question automatically on load if speech synthesis available
  useEffect(() => {
    if ('speechSynthesis' in window && currentQuestion) {
      speakQuestion(currentQuestion.question);
    }
    setAnswerText(currentQuestion.candidateAnswer || '');
    setCurrentEvaluation(currentQuestion.evaluation || null);
    setTimerSeconds(0);
  }, [currentQIndex]);

  const speakQuestion = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Web Speech API speech-to-text recording
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your answer directly into the response box.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setAnswerText((prev) => (transcript.trim() ? transcript : prev));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition initialization error:', err);
      setIsRecording(false);
    }
  };

  // Submit answer for evaluation
  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      alert('Please provide an answer before submitting for evaluation.');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
    stopSpeaking();

    setEvaluating(true);
    try {
      const res = await api.evaluateAnswer({
        sessionId: session.id,
        questionId: currentQuestion.id,
        answer: answerText.trim(),
        timeSpentSeconds: timerSeconds,
      });

      setCurrentEvaluation(res.evaluation);

      // Update question in local state
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentQIndex] = {
        ...updatedQuestions[currentQIndex],
        candidateAnswer: answerText.trim(),
        evaluation: res.evaluation,
        timeSpentSeconds: timerSeconds,
      };
      setSession({ ...session, questions: updatedQuestions });
    } catch (err: any) {
      alert(err.message || 'Failed to evaluate answer');
    } finally {
      setEvaluating(false);
    }
  };

  // Request intelligent AI follow-up question
  const handleTriggerFollowUp = async () => {
    setGeneratingNext(true);
    try {
      const followUpQ = await api.getFollowUpQuestion(
        session.id,
        currentQuestion.question,
        answerText
      );
      const updatedQuestions = [...session.questions, followUpQ];
      setSession({ ...session, questions: updatedQuestions });
      setCurrentQIndex(updatedQuestions.length - 1);
      setCurrentEvaluation(null);
      setAnswerText('');
    } catch (err: any) {
      alert(err.message || 'Failed to generate follow-up question');
    } finally {
      setGeneratingNext(false);
    }
  };

  // Move to next question or complete interview
  const handleNextQuestion = async () => {
    // If not at total questions count, ask next question
    if (session.questions.length < session.totalQuestions) {
      setGeneratingNext(true);
      try {
        const nextQ = await api.getNextQuestion(session.id);
        const updatedQuestions = [...session.questions, nextQ];
        setSession({ ...session, questions: updatedQuestions });
        setCurrentQIndex(updatedQuestions.length - 1);
        setCurrentEvaluation(null);
        setAnswerText('');
      } catch (err: any) {
        alert(err.message || 'Failed to fetch next question');
      } finally {
        setGeneratingNext(false);
      }
    } else {
      // Complete interview
      setGeneratingNext(true);
      try {
        const completed = await api.completeInterview(session.id);
        onFinishSession(completed);
      } catch (err: any) {
        alert(err.message || 'Failed to finalize interview');
      } finally {
        setGeneratingNext(false);
      }
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Session Header & Progress */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {session.interviewType}
            </span>
            <span className="text-[11px] font-bold text-slate-500">• {session.difficulty} Level</span>
          </div>
          <h2 className="text-lg font-black text-slate-900">{session.role} Interview</h2>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>{formatTimer(timerSeconds)}</span>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Question {currentQIndex + 1} of {session.totalQuestions}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all duration-300"
          style={{
            width: `${Math.min(100, ((currentQIndex + 1) / session.totalQuestions) * 100)}%`,
          }}
        ></div>
      </div>

      {/* AI Interviewer Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Bot className="w-6 h-6" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping"></span>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-200">AI Interviewer</p>
              <p className="text-[10px] text-emerald-400 font-medium">
                {isSpeaking
                  ? 'Speaking question...'
                  : isRecording
                  ? 'Listening to candidate...'
                  : evaluating
                  ? 'Analyzing response...'
                  : 'Ready for response'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentQuestion.isFollowUp && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                <Zap className="w-3 h-3 text-amber-400" />
                Adaptive Follow-Up
              </span>
            )}
            <button
              onClick={() => (isSpeaking ? stopSpeaking() : speakQuestion(currentQuestion.question))}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title={isSpeaking ? 'Mute Speech' : 'Listen Aloud'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 text-emerald-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-700/70">
          <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
            "{currentQuestion.question}"
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {currentQuestion.category}
            </span>
            <span>•</span>
            <span className="text-slate-400">Targeting {session.role} competencies</span>
          </div>
        </div>
      </div>

      {/* Candidate Response Workspace */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <span>Your Response</span>
            <span className="text-slate-400 font-normal">
              ({answerText.trim().split(/\s+/).filter(Boolean).length} words)
            </span>
          </label>

          {/* Voice Recording Control */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse shadow-md shadow-rose-600/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3.5 h-3.5" />
                <span>Stop Recording</span>
              </>
            ) : (
              <>
                <Mic className="w-3.5 h-3.5 text-emerald-600" />
                <span>Start Recording (Speech to Text)</span>
              </>
            )}
          </button>
        </div>

        {/* Recording active indicator */}
        {isRecording && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>Listening to microphone... Speak clearly. Your words will appear below automatically.</span>
          </div>
        )}

        {/* Text Area */}
        <textarea
          rows={6}
          value={answerText}
          onChange={(e) => setAnswerText(e.target.value)}
          disabled={evaluating}
          placeholder="Speak or type your answer here... Be structured, concise, and explain your technical reasoning and results."
          className="w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 leading-relaxed disabled:opacity-50"
        />

        {/* Submit & Navigation Buttons */}
        {!currentEvaluation && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleSubmitAnswer}
              disabled={evaluating || !answerText.trim()}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {evaluating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>AI Interviewer is analyzing your answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer for AI Evaluation</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Answer Evaluation Drawer (Rendered immediately after submission) */}
      {currentEvaluation && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-300 shadow-lg ring-4 ring-emerald-500/10 space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">AI Answer Evaluation</h3>
                <p className="text-xs text-slate-500">{currentEvaluation.summaryFeedback}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black text-emerald-600">
                {currentEvaluation.overallScore}
                <span className="text-sm font-bold text-slate-400">/100</span>
              </div>
            </div>
          </div>

          {/* Dimension score badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-center">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Technical</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.technicalScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Communication</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.communicationScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Clarity</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.clarityScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Confidence</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.confidenceScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Relevance</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.relevanceScore}%</p>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-bold uppercase">Problem Solving</p>
              <p className="text-sm font-black text-slate-900">{currentEvaluation.problemSolvingScore}%</p>
            </div>
          </div>

          {/* Strengths & Weaknesses */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
              <h4 className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Strengths in Your Answer
              </h4>
              <ul className="space-y-1.5 text-xs text-emerald-800">
                {currentEvaluation.strengths.map((str, idx) => (
                  <li key={idx}>• {str}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Areas to Sharpen
              </h4>
              <ul className="space-y-1.5 text-xs text-amber-800">
                {currentEvaluation.weaknesses.map((w, idx) => (
                  <li key={idx}>• {w}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Suggested Improved Answer */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>AI Recommended Benchmark Response:</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed italic">
              "{currentEvaluation.improvedAnswer}"
            </p>
          </div>

          {/* Action to proceed */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            {/* Intelligent Follow-up Button */}
            {!currentQuestion.isFollowUp && (
              <button
                onClick={handleTriggerFollowUp}
                disabled={generatingNext}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs border border-amber-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5 text-amber-600" />
                Ask Adaptive Follow-Up Question
              </button>
            )}

            <button
              onClick={handleNextQuestion}
              disabled={generatingNext}
              className="w-full sm:w-auto ml-auto px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {generatingNext ? (
                <span>Generating question...</span>
              ) : session.questions.length < session.totalQuestions ? (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>View Final Readiness Report 🎉</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
