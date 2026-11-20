export type NavTab = 'home' | 'love' | 'surprises' | 'world' | 'games' | 'dates' | 'settings';

export type QuestionMood = 'Thoughtful' | 'Playful' | 'Deep' | 'Bold';

export interface QuestionItem {
  id: string;
  prompt: string;
  mood: QuestionMood;
}

export interface WouldYouRatherItem {
  id: string;
  optionA: string;
  optionB: string;
  reactionA: string;
  reactionB: string;
  category: string;
}

export type DareMode = 'Truth' | 'Dare';
export type DareIntensity = 'Gentle' | 'Playful' | 'Bold';

export interface TruthOrDareItem {
  id: string;
  mode: DareMode;
  intensity: DareIntensity;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  note: string;
}

export type HeartRewardKind = 'Compliment' | 'Romantic Note' | 'Question' | 'Surprise' | 'Playful Challenge';

export interface HeartSurprise {
  id: string;
  kind: HeartRewardKind;
  message: string;
  isEasterEgg?: boolean;
}

export interface SentencePrompt {
  id: string;
  starter: string;
}

export interface SubmittedAnswer {
  id: string;
  source: 'Finish the Sentence' | 'Know Me Quiz' | 'Love Language';
  prompt: string;
  response: string;
  createdAt: string;
}

export interface FlagScenario {
  id: string;
  scenario: string;
  feedbackGreen: string;
  feedbackRed: string;
  feedbackDepends: string;
}

export interface GuessChallenge {
  id: string;
  category: string;
  answer: string;
  acceptedAliases: string[];
  hints: [string, string, string];
  revealNote: string;
}

export type LoveLanguageKey =
  | 'Words of Affirmation'
  | 'Quality Time'
  | 'Acts of Service'
  | 'Receiving Gifts'
  | 'Physical Affection';

export interface LoveLanguageOption {
  label: string;
  language: LoveLanguageKey;
}

export interface LoveLanguageQuestion {
  id: string;
  prompt: string;
  options: LoveLanguageOption[];
}

export interface ScratchCardItem {
  id: string;
  title: string;
  category: 'Compliment' | 'Romantic Note' | 'Challenge' | 'Small Reward' | 'Surprise';
  secretText: string;
  accent: 'blush' | 'lavender' | 'champagne';
}

export interface WheelSegment {
  id: string;
  label: string;
  actionDetail: string;
  color: string;
  textColor: string;
}

export interface SecretEnvelope {
  id: string;
  label: string;
  occasion: string;
  salutation: string;
  body: string;
  closing: string;
  sealColor: 'burgundy' | 'champagne' | 'plum';
}

export interface MysteryBoxReward {
  id: string;
  title: string;
  kind: 'Reward' | 'Note' | 'Challenge' | 'Hidden Gem';
  message: string;
  isEasterEgg?: boolean;
}

export interface MemoryItem {
  id: string;
  dateLabel: string;
  title: string;
  category: string;
  description: string;
}

export interface ComplimentItem {
  id: string;
  title: string;
  text: string;
  category: string;
}

export interface InsideJokeItem {
  id: string;
  title: string;
  clue: string;
  story: string;
  createdAt: string;
}

export interface BucketItem {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  createdAt: string;
}

export type DestinationCategory = 'Café' | 'Restaurant' | 'Park' | 'Shopping' | 'Travel';

export interface DestinationIdea {
  id: string;
  name: string;
  category: DestinationCategory;
  vibeNote: string;
}

export type DatePlanStatus = 'Dreaming' | 'Upcoming' | 'Completed';

export interface DatePlan {
  id: string;
  idea: string;
  plannedDate: string;
  notes: string;
  status: DatePlanStatus;
}

export interface SiteSettings {
  welcomeHeading: string;
  welcomeSubtitle: string;
  accessHint: string;
  allowSubmissions: boolean;
  categories: string[];
}

// --- Session, Changeable Answers & Activity History Models ---

export interface UniverseSession {
  id: string;
  sessionNumber: number;
  startedAt: string;
  endedAt?: string;
  status: 'active' | 'archived';
}

export type AnswerCategory =
  | 'question'
  | 'sentence'
  | 'would_you_rather'
  | 'red_green_flag'
  | 'truth_or_dare'
  | 'guess_thinking';

export interface AnswerChangeEntry {
  answer: string;
  changedAt: string;
}

export interface AnswerRecord {
  id: string;
  sessionId: string;
  category: AnswerCategory;
  itemKey: string;
  promptText: string;
  optionsPresented?: string[];
  currentAnswer: string;
  previousAnswer?: string;
  changeHistory: AnswerChangeEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestionResponse {
  questionId: string;
  questionText: string;
  options: string[];
  selectedIndex: number;
  selectedOption: string;
  previousOption?: string;
  isCorrect?: boolean;
  updatedAt: string;
}

export interface QuizAttemptRecord {
  id: string;
  sessionId: string;
  quizType: 'know_me' | 'love_language';
  status: 'in_progress' | 'completed';
  responses: QuizQuestionResponse[];
  score?: number;
  total: number;
  percentage?: number;
  resultSummary?: string;
  startedAt: string;
  completedAt?: string;
  updatedAt: string;
}

export interface GameRecord {
  id: string;
  sessionId: string;
  gameId: string;
  gameTitle: string;
  status: 'started' | 'completed';
  scoreLabel?: string;
  startedAt: string;
  completedAt?: string;
}

export type ActivityEventType =
  | 'answer_saved'
  | 'answer_changed'
  | 'quiz_completed'
  | 'heart_picked'
  | 'tod_choice'
  | 'scratch_revealed'
  | 'envelope_opened'
  | 'mystery_box_opened'
  | 'wheel_spun'
  | 'game_started'
  | 'game_completed'
  | 'bucket_added'
  | 'bucket_completed'
  | 'bucket_removed'
  | 'date_idea_selected'
  | 'date_plan_saved'
  | 'inside_joke_added'
  | 'universe_restarted';

export interface ActivityEvent {
  id: string;
  sessionId: string;
  type: ActivityEventType;
  title: string;
  detail: string;
  itemKey?: string;
  createdAt: string;
}

export interface ActiveSessionState {
  session: UniverseSession;
  answers: AnswerRecord[];
  quizAttempts: QuizAttemptRecord[];
  gameRecords: GameRecord[];
  revealedScratchIds: string[];
  openedEnvelopeIds: string[];
  openedHeartIds: string[];
}

export interface UniverseData {
  settings: SiteSettings;
  questions: QuestionItem[];
  wouldYouRather: WouldYouRatherItem[];
  truthOrDares: TruthOrDareItem[];
  quizQuestions: QuizQuestion[];
  heartSurprises: HeartSurprise[];
  sentencePrompts: SentencePrompt[];
  flagScenarios: FlagScenario[];
  guessChallenges: GuessChallenge[];
  loveLanguageQuestions: LoveLanguageQuestion[];
  scratchCards: ScratchCardItem[];
  wheelSegments: WheelSegment[];
  envelopes: SecretEnvelope[];
  mysteryRewards: MysteryBoxReward[];
  memories: MemoryItem[];
  compliments: ComplimentItem[];
  insideJokes: InsideJokeItem[];
  bucketList: BucketItem[];
  destinations: DestinationIdea[];
  datePlans: DatePlan[];
  submittedAnswers: SubmittedAnswer[];
  sessions: UniverseSession[];
  answerRecords: AnswerRecord[];
  quizAttempts: QuizAttemptRecord[];
  gameRecords: GameRecord[];
  activityEvents: ActivityEvent[];
}

export interface RecipientUniversePayload {
  settings: SiteSettings;
  questions: QuestionItem[];
  wouldYouRather: WouldYouRatherItem[];
  truthOrDares: TruthOrDareItem[];
  quizQuestions: QuizQuestion[];
  heartSurprises: HeartSurprise[];
  sentencePrompts: SentencePrompt[];
  flagScenarios: FlagScenario[];
  guessChallenges: GuessChallenge[];
  loveLanguageQuestions: LoveLanguageQuestion[];
  scratchCards: ScratchCardItem[];
  wheelSegments: WheelSegment[];
  envelopes: SecretEnvelope[];
  mysteryRewards: MysteryBoxReward[];
  memories: MemoryItem[];
  compliments: ComplimentItem[];
  insideJokes: InsideJokeItem[];
  bucketList: BucketItem[];
  destinations: DestinationIdea[];
  datePlans: DatePlan[];
  activeSession: ActiveSessionState;
}

export interface SessionInfo {
  universeUnlocked: boolean;
  isAdmin: boolean;
  requiresAccessCode: boolean;
  accessHint: string;
  adminRequiresUsername?: boolean;
}

export interface AdminSecurityStatus {
  usingDefaultAdminPassword: boolean;
  usingDefaultAccessCode: boolean;
  requiresCustomUsername: boolean;
  adminPasswordSource: 'env' | 'panel' | 'configured' | 'default';
  accessCodeSource: 'env' | 'panel' | 'default';
  storageMode: 'kv' | 'local-file' | 'vercel-tmp';
  durableStorageActive: boolean;
}
