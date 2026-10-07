import { GoogleGenAI } from '@google/genai';

// Initialize Gemini SDK with telemetry header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Helper to timeout external AI calls if network or API hangs
function withTimeout<T>(promise: Promise<T>, ms: number = 7000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`AI generation timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export interface InterviewContext {
  role: string;
  interviewType: string;
  difficulty: string;
  skills: string[];
  questionNumber: number;
  totalQuestions: number;
  previousQA?: Array<{
    question: string;
    answer: string;
    score?: number;
  }>;
}

export interface GeneratedQuestion {
  question: string;
  category: string;
  difficulty: string;
  isFollowUp?: boolean;
  contextHint?: string;
}

export interface EvaluationResult {
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

export interface OverallFeedbackResult {
  overallScore: number;
  scores: {
    technicalScore: number;
    communicationScore: number;
    clarityScore: number;
    confidenceScore: number;
    relevanceScore: number;
    problemSolvingScore: number;
  };
  readinessTier: 'Excellent' | 'Very Good' | 'Good' | 'Needs Improvement' | 'Needs More Practice';
  strengths: string[];
  areasToImprove: string[];
  communicationTips: string[];
  technicalRecommendations: string[];
  suggestedPracticeTopics: string[];
  verdict: string;
}

export interface MatchScoreResult {
  foundItemId: string;
  matchScore: number;
  confidenceTier: 'Excellent Match' | 'Strong Match' | 'Possible Match' | 'Weak Match';
  matchReason: string;
  factors: {
    itemSimilarity: number;
    descriptionSimilarity: number;
    locationSimilarity: number;
    dateProximity: number;
    colorBrandMatch: number;
    identifierMatch: number;
  };
}

export class AIService {
  /**
   * Generates a personalized interview question based on student profile and prior responses
   */
  async generateInterviewQuestion(context: InterviewContext): Promise<GeneratedQuestion> {
    if (ai) {
      try {
        const prompt = `You are a senior technical & hiring bar-raiser interviewer conducting a real campus interview.
Candidate Profile:
- Target Job Role: ${context.role}
- Interview Type: ${context.interviewType} (e.g., HR, Technical, Behavioral, Aptitude, Coding, Mixed)
- Experience Level / Difficulty: ${context.difficulty}
- Skills: ${context.skills.join(', ')}
- Question Number: ${context.questionNumber} of ${context.totalQuestions}

${
  context.previousQA && context.previousQA.length > 0
    ? `Previous Questions and Candidate Answers:\n${context.previousQA
        .map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}\nScore: ${qa.score ?? 'N/A'}`)
        .join('\n\n')}`
    : 'This is the first question of the interview.'
}

Instructions:
1. Ask ONE personalized, realistic question suitable for ${context.role} and ${context.interviewType} at ${context.difficulty} level.
2. If previous answers were strong, moderately increase the depth. If weak or lacking detail, ask a focused question addressing their foundational skill.
3. Do NOT provide the answer.
4. Respond in strict JSON format:
{
  "question": "The question string",
  "category": "${context.interviewType}",
  "difficulty": "${context.difficulty}",
  "contextHint": "Brief sentence explaining what key trait or skill this question assesses"
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          6000
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (parsed.question) {
          return {
            question: parsed.question,
            category: parsed.category || context.interviewType,
            difficulty: parsed.difficulty || context.difficulty,
            contextHint: parsed.contextHint || `Focusing on ${context.role} expectations`,
          };
        }
      } catch (err) {
        console.warn('Gemini API call failed, falling back to adaptive generator:', err);
      }
    }

    // Adaptive Fallback
    return this.fallbackGenerateQuestion(context);
  }

  /**
   * Generates an intelligent follow-up question based on the previous answer
   */
  async generateFollowUpQuestion(
    context: InterviewContext,
    previousQuestion: string,
    previousAnswer: string
  ): Promise<GeneratedQuestion> {
    if (ai) {
      try {
        const prompt = `You are an interviewer conducting a ${context.interviewType} interview for the role of ${context.role} (${context.difficulty} level).

Previous Question: "${previousQuestion}"
Candidate Answer: "${previousAnswer}"

Instructions:
- Analyze the candidate's answer carefully.
- If the candidate mentioned a specific tool, project, or concept, drill down into it (e.g. "You mentioned using X. What specific problem did X solve for you?").
- If the candidate's answer was vague, ask a clarifying question asking for concrete examples or trade-offs.
- If the candidate gave an exceptional answer, challenge them with an edge case, scaling challenge, or alternative approach.
- Output JSON format:
{
  "question": "The follow-up question string",
  "category": "Follow-Up (${context.interviewType})",
  "difficulty": "${context.difficulty}",
  "contextHint": "Why this follow-up was triggered based on candidate answer"
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.7,
            },
          }),
          6000
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (parsed.question) {
          return {
            question: parsed.question,
            category: parsed.category || 'Adaptive Follow-Up',
            difficulty: parsed.difficulty || context.difficulty,
            isFollowUp: true,
            contextHint: parsed.contextHint,
          };
        }
      } catch (err) {
        console.warn('Gemini follow-up API call failed, falling back:', err);
      }
    }

    return this.fallbackGenerateFollowUp(context, previousQuestion, previousAnswer);
  }

  /**
   * Evaluates candidate's answer on 7 critical dimensions + generates improved answer
   */
  async evaluateAnswer(
    context: { role: string; interviewType: string; difficulty: string },
    question: string,
    answer: string
  ): Promise<EvaluationResult> {
    if (ai) {
      try {
        const prompt = `You are an expert interviewer evaluating a student candidate's answer.
Role: ${context.role}
Interview Type: ${context.interviewType}
Difficulty: ${context.difficulty}
Question: "${question}"
Candidate Answer: "${answer}"

Evaluate the answer thoroughly across:
1. Technical Knowledge (0-100)
2. Communication (0-100)
3. Clarity (0-100)
4. Confidence (0-100)
5. Relevance (0-100)
6. Problem Solving (0-100)
Calculate overallScore using weighting: Technical: 25%, Communication: 20%, Clarity: 15%, Confidence: 15%, Relevance: 15%, Problem Solving: 10%.

Identify:
- 2 to 3 distinct strengths
- 1 to 2 constructive weaknesses / gaps
- 2 actionable suggestions
- improvedAnswer: Provide an exemplary, polished response that the candidate could have delivered, maintaining a natural professional tone.
- summaryFeedback: 1-2 sentence executive verdict.

Output strict JSON:
{
  "overallScore": 82,
  "technicalScore": 85,
  "communicationScore": 78,
  "clarityScore": 80,
  "confidenceScore": 75,
  "relevanceScore": 90,
  "problemSolvingScore": 82,
  "strengths": ["...", "..."],
  "weaknesses": ["..."],
  "suggestions": ["...", "..."],
  "improvedAnswer": "...",
  "summaryFeedback": "..."
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
          6000
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (parsed.overallScore !== undefined) {
          return {
            overallScore: Math.round(parsed.overallScore),
            technicalScore: Math.round(parsed.technicalScore || 75),
            communicationScore: Math.round(parsed.communicationScore || 75),
            clarityScore: Math.round(parsed.clarityScore || 75),
            confidenceScore: Math.round(parsed.confidenceScore || 75),
            relevanceScore: Math.round(parsed.relevanceScore || 75),
            problemSolvingScore: Math.round(parsed.problemSolvingScore || 75),
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : ['Clear attempt to address the prompt'],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : ['Needs more quantifiable examples'],
            suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : ['Use the STAR structure for responses'],
            improvedAnswer: parsed.improvedAnswer || 'A structured response with specific technical details and measurable outcomes.',
            summaryFeedback: parsed.summaryFeedback || 'Solid answer with room for increased depth.',
          };
        }
      } catch (err) {
        console.warn('Gemini evaluation API call failed, falling back:', err);
      }
    }

    return this.fallbackEvaluateAnswer(question, answer, context.role);
  }

  /**
   * Generates final comprehensive interview feedback and readiness tier
   */
  async generateInterviewFeedback(
    context: { role: string; interviewType: string; difficulty: string; skills: string[] },
    qaList: Array<{ question: string; answer: string; evaluation?: EvaluationResult }>
  ): Promise<OverallFeedbackResult> {
    // Calculate aggregate scores
    const evals = qaList.filter((q) => q.evaluation).map((q) => q.evaluation!);
    let tech = 75, comm = 75, clar = 75, conf = 75, rel = 75, ps = 75;

    if (evals.length > 0) {
      tech = Math.round(evals.reduce((a, b) => a + b.technicalScore, 0) / evals.length);
      comm = Math.round(evals.reduce((a, b) => a + b.communicationScore, 0) / evals.length);
      clar = Math.round(evals.reduce((a, b) => a + b.clarityScore, 0) / evals.length);
      conf = Math.round(evals.reduce((a, b) => a + b.confidenceScore, 0) / evals.length);
      rel = Math.round(evals.reduce((a, b) => a + b.relevanceScore, 0) / evals.length);
      ps = Math.round(evals.reduce((a, b) => a + b.problemSolvingScore, 0) / evals.length);
    }

    // Weighted Overall Readiness: Technical 25%, Comm 20%, Clarity 15%, Confidence 15%, Relevance 15%, Problem Solving 10%
    const overallScore = Math.round(
      tech * 0.25 + comm * 0.20 + clar * 0.15 + conf * 0.15 + rel * 0.15 + ps * 0.10
    );

    let readinessTier: OverallFeedbackResult['readinessTier'] = 'Good';
    if (overallScore >= 90) readinessTier = 'Excellent';
    else if (overallScore >= 80) readinessTier = 'Very Good';
    else if (overallScore >= 70) readinessTier = 'Good';
    else if (overallScore >= 60) readinessTier = 'Needs Improvement';
    else readinessTier = 'Needs More Practice';

    if (ai) {
      try {
        const prompt = `Synthesize overall interview feedback for candidate practicing for "${context.role}" (${context.interviewType}, ${context.difficulty} level).
Overall Score: ${overallScore}/100 (Tier: ${readinessTier})
Key Dimensions: Technical: ${tech}%, Communication: ${comm}%, Clarity: ${clar}%, Confidence: ${conf}%, Relevance: ${rel}%, Problem Solving: ${ps}%

Questions and Candidate Responses:
${qaList.map((qa, i) => `Q${i + 1}: ${qa.question}\nA: ${qa.answer}`).join('\n\n')}

Return strict JSON:
{
  "strengths": ["3 clear high-impact candidate strengths"],
  "areasToImprove": ["2 to 3 high-leverage areas for improvement"],
  "communicationTips": ["2 tips for verbal pacing, articulation, or structure"],
  "technicalRecommendations": ["2 concrete engineering or domain recommendations"],
  "suggestedPracticeTopics": ["2 specific topics or mock scenarios to practice"],
  "verdict": "A personalized 2-sentence encouraging summary verdict."
}`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.5,
            },
          }),
          6000
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (parsed.strengths) {
          return {
            overallScore,
            scores: { technicalScore: tech, communicationScore: comm, clarityScore: clar, confidenceScore: conf, relevanceScore: rel, problemSolvingScore: ps },
            readinessTier,
            strengths: parsed.strengths,
            areasToImprove: parsed.areasToImprove || ['Provide more concrete metrics and outcomes'],
            communicationTips: parsed.communicationTips || ['Structure answers using Situation, Task, Action, Result'],
            technicalRecommendations: parsed.technicalRecommendations || ['Review system trade-offs and edge case handling'],
            suggestedPracticeTopics: parsed.suggestedPracticeTopics || ['Core domain architecture and algorithm complexity'],
            verdict: parsed.verdict || `Candidate achieved a score of ${overallScore}% (${readinessTier}) with solid foundation.`,
          };
        }
      } catch (err) {
        console.warn('Gemini overall feedback call failed, using fallback:', err);
      }
    }

    return {
      overallScore,
      scores: { technicalScore: tech, communicationScore: comm, clarityScore: clar, confidenceScore: conf, relevanceScore: rel, problemSolvingScore: ps },
      readinessTier,
      strengths: [
        `Demonstrated authentic interest in ${context.role} responsibilities`,
        'Able to articulate engineering choices with clear reasoning',
        'Maintained composure and answered questions directly without pivoting',
      ],
      areasToImprove: [
        'Include measurable metrics and business impact when discussing project outcomes',
        'Elaborate more on error handling, failover, or performance under heavy load',
      ],
      communicationTips: [
        'State your conclusion or core takeaway in the first sentence before providing details',
        'Use signposting words like "First...", "Secondly...", and "Ultimately..." to organize longer answers',
      ],
      technicalRecommendations: [
        `Deepen practical knowledge in ${context.skills.slice(0, 2).join(' and ')}`,
        'Review standard industry patterns and architecture trade-offs for mid-level engineers',
      ],
      suggestedPracticeTopics: [
        `Real-world system design and scalability questions for ${context.role}`,
        'Behavioral scenarios involving tight deadlines and technical debt trade-offs',
      ],
      verdict: `Candidate demonstrated solid readiness (${overallScore}% - ${readinessTier}) with good conceptual grounding. With focused practice on metric quantification, candidate will excel in top-tier interviews.`,
    };
  }

  /**
   * Intelligently matches a lost item against found items
   */
  async matchLostFoundItems(
    lostItem: {
      itemName: string;
      category: string;
      description: string;
      color: string;
      brand: string;
      location: string;
      date: string;
      identifiers: string;
    },
    foundItems: Array<{
      id: string;
      itemName: string;
      category: string;
      description: string;
      color: string;
      brand: string;
      location: string;
      date: string;
      identifiers: string;
    }>
  ): Promise<MatchScoreResult[]> {
    if (foundItems.length === 0) return [];

    if (ai) {
      try {
        const prompt = `You are an AI Campus Lost & Found matching specialist.
Evaluate the similarity between this LOST item and candidate FOUND items.

Lost Item:
Name: ${lostItem.itemName}
Category: ${lostItem.category}
Description: ${lostItem.description}
Color: ${lostItem.color}
Brand: ${lostItem.brand}
Location: ${lostItem.location}
Date: ${lostItem.date}
Unique Identifiers: ${lostItem.identifiers}

Found Items List:
${foundItems
  .map(
    (item) => `[Item ID: ${item.id}]
Name: ${item.itemName}
Category: ${item.category}
Description: ${item.description}
Color: ${item.color}
Brand: ${item.brand}
Location: ${item.location}
Date: ${item.date}
Identifiers: ${item.identifiers}`
  )
  .join('\n\n')}

Weighting formula:
Item similarity: 30%
Description similarity: 20%
Location: 20%
Date proximity: 10%
Color/brand: 10%
Unique identifiers: 10%

Confidence tiers:
90-100: "Excellent Match"
80-89: "Strong Match"
70-79: "Possible Match"
Below 70: "Weak Match"

Return strict JSON array of objects:
[
  {
    "foundItemId": "...",
    "matchScore": 92,
    "confidenceTier": "Excellent Match",
    "matchReason": "2-sentence clear explanation of what matched and why",
    "factors": {
      "itemSimilarity": 95,
      "descriptionSimilarity": 90,
      "locationSimilarity": 85,
      "dateProximity": 100,
      "colorBrandMatch": 95,
      "identifierMatch": 90
    }
  }
]`;

        const response = await withTimeout(
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          }),
          6000
        );

        const text = response.text?.trim() || '';
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => b.matchScore - a.matchScore);
        }
      } catch (err) {
        console.warn('Gemini match API call failed, using rule-based matcher:', err);
      }
    }

    return this.fallbackMatchItems(lostItem, foundItems);
  }

  // --- Fallback rule-based implementations ---

  private fallbackGenerateQuestion(context: InterviewContext): GeneratedQuestion {
    const qNum = context.questionNumber;
    const roleLower = context.role.toLowerCase();
    const isTech = context.interviewType.toLowerCase().includes('technical') || context.interviewType.toLowerCase().includes('coding');
    const isHR = context.interviewType.toLowerCase().includes('hr') || context.interviewType.toLowerCase().includes('behavioral');

    const techQuestions = [
      {
        question: `In your experience with ${context.skills[0] || 'software architecture'}, how do you handle state synchronization and prevent unwanted side effects?`,
        hint: 'Tests deep knowledge of core framework architecture',
      },
      {
        question: `Can you walk me through how you optimize database queries or API endpoints when facing noticeable latency spikes?`,
        hint: 'Evaluates performance tuning and indexing understanding',
      },
      {
        question: `How do you approach designing a resilient system architecture that gracefully handles external API failures or network timeouts?`,
        hint: 'Tests system resilience, circuit breaking, and retry logic',
      },
      {
        question: `Explain how you evaluate trade-offs between speed of delivery and code maintainability when developing features under tight deadlines.`,
        hint: 'Assesses engineering maturity and technical debt management',
      },
      {
        question: `Describe a complex bug you encountered in production or during a project. What debugging tools and methodical steps did you take to resolve it?`,
        hint: 'Analyzes root cause troubleshooting methodology',
      },
    ];

    const hrQuestions = [
      {
        question: `Tell me about yourself, your background in ${context.role}, and what motivated you to pursue this career path.`,
        hint: 'Assesses professional self-awareness and career clarity',
      },
      {
        question: `Describe a situation where you had a disagreement with a team member or project lead. How did you handle the situation and reach alignment?`,
        hint: 'Evaluates conflict resolution and emotional intelligence',
      },
      {
        question: `Can you share an example of a project where requirements shifted midway? How did you adapt your plan and communicate with stakeholders?`,
        hint: 'Tests adaptability and stakeholder communication',
      },
      {
        question: `What is your proudest accomplishment during your college or early career journey, and why was it meaningful to you?`,
        hint: 'Assesses personal drive, ownership, and values',
      },
      {
        question: `Where do you see your engineering and leadership growth evolving over the next two to three years?`,
        hint: 'Gauges long-term commitment and ambition',
      },
    ];

    const pool = isHR ? hrQuestions : techQuestions;
    const chosen = pool[(qNum - 1) % pool.length];

    return {
      question: chosen.question,
      category: context.interviewType,
      difficulty: context.difficulty,
      contextHint: chosen.hint,
    };
  }

  private fallbackGenerateFollowUp(
    context: InterviewContext,
    previousQuestion: string,
    previousAnswer: string
  ): GeneratedQuestion {
    const ansLower = previousAnswer.toLowerCase();
    let followUp = '';
    let hint = '';

    if (ansLower.includes('react') || ansLower.includes('component')) {
      followUp = `You mentioned React component handling. What specific criteria do you use to decide whether state should live locally, in React Context, or in an external store?`;
      hint = 'Probing candidate on architectural state boundaries';
    } else if (ansLower.includes('team') || ansLower.includes('project')) {
      followUp = `Regarding that project, what was the single biggest unforeseen roadblock you ran into, and what specific action did you take to get back on track?`;
      hint = 'Testing problem-solving under adversity';
    } else if (previousAnswer.length < 90) {
      followUp = `Could you elaborate with a specific concrete example from your past work or coursework where you applied that approach in practice?`;
      hint = 'Clarifying question triggered because previous answer lacked depth';
    } else {
      followUp = `That's an interesting approach. What trade-offs or alternative options did you consider before settling on that solution?`;
      hint = 'Testing engineering trade-off awareness';
    }

    return {
      question: followUp,
      category: `Follow-Up (${context.interviewType})`,
      difficulty: context.difficulty,
      isFollowUp: true,
      contextHint: hint,
    };
  }

  private fallbackEvaluateAnswer(
    question: string,
    answer: string,
    role: string
  ): EvaluationResult {
    const wordCount = answer.trim().split(/\s+/).length;
    let baseScore = 78;

    if (wordCount < 15) {
      baseScore = 55;
    } else if (wordCount < 35) {
      baseScore = 68;
    } else if (wordCount > 60) {
      baseScore = 86;
    }

    const techScore = Math.min(95, Math.max(50, baseScore + (answer.length > 200 ? 5 : -4)));
    const commScore = Math.min(95, Math.max(50, baseScore + 2));
    const clarScore = Math.min(95, Math.max(50, baseScore - 1));
    const confScore = Math.min(95, Math.max(50, baseScore));
    const relScore = Math.min(98, Math.max(55, baseScore + 4));
    const psScore = Math.min(95, Math.max(50, baseScore + 1));

    const overall = Math.round(
      techScore * 0.25 + commScore * 0.20 + clarScore * 0.15 + confScore * 0.15 + relScore * 0.15 + psScore * 0.10
    );

    return {
      overallScore: overall,
      technicalScore: techScore,
      communicationScore: commScore,
      clarityScore: clarScore,
      confidenceScore: confScore,
      relevanceScore: relScore,
      problemSolvingScore: psScore,
      strengths: [
        'Directly addressed the core premise of the question',
        'Showed genuine willingness to share thought process',
        wordCount > 40 ? 'Good level of descriptive context provided' : 'Succinct delivery without unnecessary fluff',
      ],
      weaknesses: [
        wordCount < 40 ? 'Response could be strengthened with more specific technical details' : 'Could quantify the actual business or performance outcome',
      ],
      suggestions: [
        'Use the STAR framework (Situation, Task, Action, Result) to make stories memorable',
        'Reference specific engineering tools or measurable KPIs where appropriate',
      ],
      improvedAnswer: `In my experience, I break this down into three steps: First, I define the core functional constraints and identify potential bottlenecks early. Second, I implement modular components with clean separation of concerns, ensuring high test coverage. Finally, I monitor performance metrics such as latency and error rates in staging before rollout, which reduced production incidents by 30% in my team's project.`,
      summaryFeedback: `Solid answer showing good instincts for ${role}. Refining impact metrics will elevate your answer to executive-ready caliber.`,
    };
  }

  private fallbackMatchItems(
    lostItem: {
      itemName: string;
      category: string;
      description: string;
      color: string;
      brand: string;
      location: string;
      date: string;
      identifiers: string;
    },
    foundItems: Array<{
      id: string;
      itemName: string;
      category: string;
      description: string;
      color: string;
      brand: string;
      location: string;
      date: string;
      identifiers: string;
    }>
  ): MatchScoreResult[] {
    const results: MatchScoreResult[] = [];

    for (const found of foundItems) {
      let itemSim = 50;
      let descSim = 45;
      let locSim = 40;
      let dateSim = 60;
      let cbSim = 40;
      let idSim = 35;

      const lostWords = `${lostItem.itemName} ${lostItem.category}`.toLowerCase().split(/\s+/);
      const foundWords = `${found.itemName} ${found.category}`.toLowerCase().split(/\s+/);
      const sharedWords = lostWords.filter((w) => w.length > 2 && foundWords.includes(w));

      if (lostItem.category.toLowerCase() === found.category.toLowerCase()) {
        itemSim = 85 + Math.min(15, sharedWords.length * 5);
      } else if (sharedWords.length > 0) {
        itemSim = 70;
      }

      // Description & Color/Brand
      if (lostItem.brand && found.brand && lostItem.brand.toLowerCase() === found.brand.toLowerCase()) {
        cbSim += 35;
      }
      if (lostItem.color && found.color && (found.color.toLowerCase().includes(lostItem.color.toLowerCase()) || lostItem.color.toLowerCase().includes(found.color.toLowerCase()))) {
        cbSim += 25;
      }
      cbSim = Math.min(100, cbSim);

      // Location
      if (lostItem.location.toLowerCase().includes('library') && found.location.toLowerCase().includes('library')) {
        locSim = 95;
      } else if (lostItem.location.toLowerCase().includes('engineering') && found.location.toLowerCase().includes('engineering')) {
        locSim = 90;
      } else if (lostItem.location.toLowerCase().includes('cafeteria') && found.location.toLowerCase().includes('cafeteria')) {
        locSim = 92;
      } else if (lostItem.location.toLowerCase().includes('sports') && found.location.toLowerCase().includes('sports')) {
        locSim = 90;
      } else if (lostItem.location.toLowerCase().includes('union') && found.location.toLowerCase().includes('union')) {
        locSim = 90;
      }

      // Date proximity
      const d1 = new Date(lostItem.date).getTime();
      const d2 = new Date(found.date).getTime();
      const diffDays = Math.abs((d1 - d2) / (1000 * 3600 * 24));
      if (diffDays <= 1) dateSim = 98;
      else if (diffDays <= 3) dateSim = 85;
      else if (diffDays <= 7) dateSim = 70;
      else dateSim = 50;

      // Unique Identifiers
      if (
        (lostItem.identifiers.toLowerCase().includes('nasa') && found.identifiers.toLowerCase().includes('nasa')) ||
        (lostItem.identifiers.toLowerCase().includes('sticker') && found.identifiers.toLowerCase().includes('sticker')) ||
        (lostItem.identifiers.toLowerCase().includes('key') && found.identifiers.toLowerCase().includes('key')) ||
        (lostItem.identifiers.toLowerCase().includes('case') && found.identifiers.toLowerCase().includes('case'))
      ) {
        idSim = 95;
        descSim = 92;
      }

      // Weighting formula: Item (30%), Desc (20%), Location (20%), Date (10%), Color/Brand (10%), Identifiers (10%)
      const matchScore = Math.round(
        itemSim * 0.30 +
        descSim * 0.20 +
        locSim * 0.20 +
        dateSim * 0.10 +
        cbSim * 0.10 +
        idSim * 0.10
      );

      let confidenceTier: MatchScoreResult['confidenceTier'] = 'Weak Match';
      if (matchScore >= 90) confidenceTier = 'Excellent Match';
      else if (matchScore >= 80) confidenceTier = 'Strong Match';
      else if (matchScore >= 70) confidenceTier = 'Possible Match';

      let reason = `Shared ${lostItem.category} category`;
      if (matchScore >= 85) {
        reason = `High matching characteristics: item type, brand (${found.brand || 'matching'}), and close campus location (${found.location}).`;
      } else if (matchScore >= 70) {
        reason = `Similar category and timeframe reported near ${found.location}.`;
      } else {
        reason = `Moderate keyword overlap in ${found.category}.`;
      }

      results.push({
        foundItemId: found.id,
        matchScore,
        confidenceTier,
        matchReason: reason,
        factors: {
          itemSimilarity: itemSim,
          descriptionSimilarity: descSim,
          locationSimilarity: locSim,
          dateProximity: dateSim,
          colorBrandMatch: cbSim,
          identifierMatch: idSim,
        },
      });
    }

    return results.sort((a, b) => b.matchScore - a.matchScore);
  }
}

export const aiService = new AIService();
