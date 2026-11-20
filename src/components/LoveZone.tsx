import { useState } from 'react';
import {
  Brain,
  Flag,
  Flame,
  Heart,
  HeartHandshake,
  HelpCircle,
  MessageCircleHeart,
  PenLine,
  Scale,
} from 'lucide-react';
import {
  PickAHeartGrid,
  QuestionOfTheMoment,
  RedGreenFlagCard,
  TruthOrDareCard,
  WouldYouRatherCard,
} from './love/LoveInteractiveGames';
import {
  FinishTheSentence,
  GuessWhatImThinking,
  KnowMeQuiz,
  LoveLanguageQuiz,
} from './love/LoveDeepActivities';
import type {
  ActiveSessionState,
  RecipientUniversePayload,
} from '../types/universe';

interface LoveZoneProps {
  data: RecipientUniversePayload;
  onSessionUpdate: (state: ActiveSessionState) => void;
}

type LoveActivityId =
  | 'question'
  | 'wyr'
  | 'tod'
  | 'quiz'
  | 'hearts'
  | 'sentence'
  | 'flags'
  | 'guess'
  | 'language';

const ACTIVITIES: Array<{
  id: LoveActivityId;
  label: string;
  shortDesc: string;
  icon: typeof Heart;
}> = [
  {
    id: 'question',
    label: 'Question of the Moment',
    shortDesc: 'Thoughtful & bold prompts',
    icon: MessageCircleHeart,
  },
  {
    id: 'wyr',
    label: 'Would You Rather',
    shortDesc: 'Two tempting choices',
    icon: Scale,
  },
  {
    id: 'tod',
    label: 'Truth or Dare',
    shortDesc: 'Three playful levels',
    icon: Flame,
  },
  {
    id: 'quiz',
    label: 'How Well Do You Know Me?',
    shortDesc: 'Interactive quiz & score',
    icon: HelpCircle,
  },
  {
    id: 'hearts',
    label: 'Pick a Heart',
    shortDesc: 'Tap for hidden notes',
    icon: Heart,
  },
  {
    id: 'sentence',
    label: 'Finish the Sentence',
    shortDesc: 'Write & save your ending',
    icon: PenLine,
  },
  {
    id: 'flags',
    label: 'Red or Green Flag',
    shortDesc: 'Fun relationship verdicts',
    icon: Flag,
  },
  {
    id: 'guess',
    label: "Guess What I'm Thinking",
    shortDesc: 'Clues & mind reading',
    icon: Brain,
  },
  {
    id: 'language',
    label: 'Love Language Quiz',
    shortDesc: 'Discover your heart style',
    icon: HeartHandshake,
  },
];

export function LoveZone({ data, onSessionUpdate }: LoveZoneProps) {
  const [active, setActive] = useState<LoveActivityId>('question');
  const sessionId = data.activeSession.session.id;
  const savedAnswers = data.activeSession.answers;
  const knowMeAttempt = data.activeSession.quizAttempts.find(
    (q) => q.quizType === 'know_me'
  );
  const loveLangAttempt = data.activeSession.quizAttempts.find(
    (q) => q.quizType === 'love_language'
  );

  return (
    <div className="space-y-7 pb-8">
      {/* Blush-tinted editorial intro header */}
      <section className="rounded-3xl border border-[#702B4C]/10 bg-gradient-to-br from-[#FFF0F5] via-[#FFF9F5] to-[#FDF6E6] p-6 sm:p-8">
        <p className="text-xs font-semibold text-[#9274B8]">
          The Love &amp; Flirting Zone · 9 Interactive Experiences
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#702B4C] sm:text-4xl">
          Conversations, Curiosities &amp; Playful Sparks
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6A525E]">
          Choose any experience below — from gentle late-night questions to
          playful dares, hidden hearts, and personal quizzes. You can save your
          answers and revisit or change them anytime.
        </p>
      </section>

      {/* Responsive selector + active workspace */}
      <div className="grid gap-6 lg:grid-cols-12">
        <aside aria-label="Love Zone activities" className="lg:col-span-4">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1">
            {ACTIVITIES.map((item) => {
              const Icon = item.icon;
              const isSelected = active === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  aria-current={isSelected ? 'true' : undefined}
                  className={`flex min-h-[56px] items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-colors ${
                    isSelected
                      ? 'border-[#702B4C] bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                      : 'border-[#702B4C]/10 bg-white text-[#2E1A24] hover:border-[#702B4C]/35 hover:bg-[#FFF0F5]/60'
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      isSelected
                        ? 'bg-white/15 text-[#F3D69B]'
                        : 'bg-[#FFDCE8]/75 text-[#702B4C]'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs leading-snug font-semibold sm:text-sm">
                      {item.label}
                    </div>
                    <div
                      className={`hidden truncate text-[11px] lg:block ${
                        isSelected ? 'text-[#FFF9F5]/80' : 'text-[#6A525E]'
                      }`}
                    >
                      {item.shortDesc}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active interactive panel */}
        <section className="min-w-0 lg:col-span-8">
          {active === 'question' && (
            <QuestionOfTheMoment
              questions={data.questions}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              allowSubmissions={data.settings.allowSubmissions}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'wyr' && (
            <WouldYouRatherCard
              items={data.wouldYouRather}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'tod' && (
            <TruthOrDareCard
              items={data.truthOrDares}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'quiz' && (
            <KnowMeQuiz
              questions={data.quizQuestions}
              existingAttempt={knowMeAttempt}
              sessionId={sessionId}
              allowSubmissions={data.settings.allowSubmissions}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'hearts' && (
            <PickAHeartGrid
              surprises={data.heartSurprises}
              openedHeartIds={data.activeSession.openedHeartIds}
              sessionId={sessionId}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'sentence' && (
            <FinishTheSentence
              prompts={data.sentencePrompts}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              allowSubmissions={data.settings.allowSubmissions}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'flags' && (
            <RedGreenFlagCard
              scenarios={data.flagScenarios}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'guess' && (
            <GuessWhatImThinking
              challenges={data.guessChallenges}
              savedAnswers={savedAnswers}
              sessionId={sessionId}
              onSessionUpdate={onSessionUpdate}
            />
          )}
          {active === 'language' && (
            <LoveLanguageQuiz
              questions={data.loveLanguageQuestions}
              existingAttempt={loveLangAttempt}
              sessionId={sessionId}
              allowSubmissions={data.settings.allowSubmissions}
              onSessionUpdate={onSessionUpdate}
            />
          )}
        </section>
      </div>
    </div>
  );
}
