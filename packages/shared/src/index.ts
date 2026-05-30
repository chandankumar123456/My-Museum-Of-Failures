export const ExhibitionCategory = {
  STARTUP_FAILURE: 'startup_failure',
  ACADEMIC_COLLAPSE: 'academic_collapse',
  RELATIONSHIP_FAILURE: 'relationship_failure',
  BURNOUT: 'burnout',
  CAREER_REGRET: 'career_regret',
  MISSED_OPPORTUNITY: 'missed_opportunity',
  FINANCIAL_MISTAKE: 'financial_mistake',
  FAMILY_CONFLICT: 'family_conflict',
  CREATIVE_FAILURE: 'creative_failure',
  IDENTITY_CRISIS: 'identity_crisis',
  MENTAL_EXHAUSTION: 'mental_exhaustion',
  FAILED_SIDE_PROJECT: 'failed_side_project',
  INTERVIEW_REJECTION: 'interview_rejection',
  BETRAYAL: 'betrayal',
  UNREALIZED_DREAM: 'unrealized_dream',
} as const;

export type ExhibitionCategory = (typeof ExhibitionCategory)[keyof typeof ExhibitionCategory];

export const MuseumRoom = {
  HALL_OF_BROKEN_DREAMS: 'hall_of_broken_dreams',
  STARTUP_CEMETERY: 'startup_cemetery',
  BURNOUT_BASEMENT: 'burnout_basement',
  ACADEMIC_RUINS: 'academic_ruins',
  GALLERY_OF_LOST_POTENTIAL: 'gallery_of_lost_potential',
  THE_REGRET_ARCHIVE: 'the_regret_archive',
  ABANDONED_FUTURES_WING: 'abandoned_futures_wing',
  RELATIONSHIP_GRAVEYARD: 'relationship_graveyard',
} as const;

export type MuseumRoom = (typeof MuseumRoom)[keyof typeof MuseumRoom];

export const EmotionalReaction = {
  I_RELATE: 'i_relate',
  I_SURVIVED_THIS_TOO: 'i_survived_this_too',
  STILL_RECOVERING: 'still_recovering',
  THIS_HURT: 'this_hurt',
  YOU_WERE_BRAVE: 'you_were_brave',
  I_UNDERSTAND: 'i_understand',
} as const;

export type EmotionalReaction = (typeof EmotionalReaction)[keyof typeof EmotionalReaction];

export const EndingStatus = {
  DESTROYED_ME: 'destroyed_me',
  CHANGED_ME: 'changed_me',
  STILL_DEFINING_ME: 'still_defining_me',
  MADE_ME_STRONGER: 'made_me_stronger',
  STILL_UNRESOLVED: 'still_unresolved',
} as const;

export type EndingStatus = (typeof EndingStatus)[keyof typeof EndingStatus];

export const RecoveryStatus = {
  RECOVERED: 'recovered',
  RETRIED: 'retried',
  PIVOTED: 'pivoted',
  STILL_FAILING: 'still_failing',
  GAVE_UP: 'gave_up',
  HEALING: 'healing',
} as const;

export type RecoveryStatus = (typeof RecoveryStatus)[keyof typeof RecoveryStatus];

export const VisibilityMode = {
  ANONYMOUS: 'anonymous',
  PSEUDONYM: 'pseudonym',
  REAL_NAME: 'real_name',
} as const;

export type VisibilityMode = (typeof VisibilityMode)[keyof typeof VisibilityMode];

export const CuratorPersona = {
  HISTORIAN: 'historian',
  ENGINEER: 'engineer',
  THERAPIST: 'therapist',
  FOUNDER: 'founder',
  PHILOSOPHER: 'philosopher',
} as const;

export type CuratorPersona = (typeof CuratorPersona)[keyof typeof CuratorPersona];

export const EvolutionStatus = {
  FAILED: 'failed',
  ONGOING: 'ongoing',
  RECOVERED: 'recovered',
  SUCCESSFUL: 'successful',
} as const;

export type EvolutionStatus = (typeof EvolutionStatus)[keyof typeof EvolutionStatus];

export interface ExhibitCreateInput {
  title: string;
  category: ExhibitionCategory;
  story: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonLearned: string;
  emotionalState: string;
  painLevel: number;
  regretLevel: number;
  recoveryProgress: number;
  stillHurts: boolean;
  wouldRetry: boolean;
  endingStatus: EndingStatus;
  recoveryStatus: RecoveryStatus;
  visibilityMode: VisibilityMode;
  emotionalTags: string[];
  roomId?: string;
  parentFailureId?: string;
  evolutionStatus?: EvolutionStatus;
}

export interface ExhibitUpdateInput extends Partial<ExhibitCreateInput> {}

export interface Exhibit {
  id: string;
  exhibitId: string;
  title: string;
  category: ExhibitionCategory;
  story: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonLearned: string;
  emotionalState: string;
  painLevel: number;
  regretLevel: number;
  recoveryProgress: number;
  stillHurts: boolean;
  wouldRetry: boolean;
  endingStatus: EndingStatus;
  recoveryStatus: RecoveryStatus;
  visibilityMode: VisibilityMode;
  emotionalTags: string[];
  retryCount: number;
  roomId: string | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  decayLevel: number;
  artifacts: Artifact[];
  reactions: ExhibitReaction[];
}

export interface Artifact {
  id: string;
  exhibitId: string;
  type: 'image' | 'audio' | 'pdf' | 'code' | 'screenshot' | 'note';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  decayed: boolean;
}

export interface ExhibitReaction {
  id: string;
  exhibitId: string;
  reaction: EmotionalReaction;
  userId: string | null;
  createdAt: Date;
}

export interface MuseumRoomData {
  id: string;
  slug: MuseumRoom;
  name: string;
  description: string;
  ambience: string;
  lighting: string;
  exhibitCount: number;
}

export interface TimeCapsule {
  id: string;
  userId: string;
  title: string;
  message: string;
  unlockDate: Date;
  isLocked: boolean;
  createdAt: Date;
}

export interface AIReflection {
  id: string;
  exhibitId: string;
  emotionalSummary: string;
  patterns: string[];
  reframing: string;
  observations: string;
  createdAt: Date;
}

export interface UserProfile {
  id: string;
  displayName: string | null;
  visibilityMode: VisibilityMode;
  exhibitCount: number;
  joinedAt: Date;
  legacyExhibitId: string | null;
}

/* ------------------------------------------------------------------ */
/*  View shapes — what the frontend actually receives from the API.    */
/*  These are intentionally JSON-flavored (string dates) and partial.  */
/* ------------------------------------------------------------------ */

export interface ArtifactView {
  id: string;
  exhibitId: string;
  type: 'image' | 'audio' | 'pdf' | 'code' | 'screenshot' | 'note';
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  decayed?: boolean;
  createdAt: string;
}

export interface ReactionView {
  id: string;
  exhibitId: string;
  reaction: EmotionalReaction;
  userId: string | null;
  createdAt: string;
}

export interface RoomSummaryView {
  id: string;
  slug: MuseumRoom;
  name: string;
  description?: string;
  ambience?: string;
  lighting?: string;
}

export interface ExhibitView {
  id: string;
  exhibitId: string;
  title: string;
  category: ExhibitionCategory;
  story: string;
  expectedOutcome: string;
  actualOutcome: string;
  lessonLearned: string;
  emotionalState?: string;
  painLevel: number;
  regretLevel: number;
  recoveryProgress: number;
  stillHurts: boolean;
  wouldRetry: boolean;
  endingStatus: EndingStatus;
  recoveryStatus: RecoveryStatus;
  visibilityMode: VisibilityMode;
  emotionalTags: string[];
  retryCount: number;
  decayLevel?: number;
  viewCount?: number;
  isOneSentence?: boolean;
  createdAt: string;
  updatedAt?: string;
  artifacts?: ArtifactView[];
  reactions?: ReactionView[];
  room?: RoomSummaryView | null;
  parentFailureId?: string | null;
  evolutionStatus?: EvolutionStatus | null;
  recoveredAt?: string | null;
}

export interface EvolutionNodeView {
  id: string;
  exhibitId: string;
  title: string;
  category: ExhibitionCategory;
  painLevel: number;
  evolutionStatus: EvolutionStatus | null;
  recoveryStatus: RecoveryStatus;
  lessonLearned: string;
  parentFailureId: string | null;
  createdAt: string;
  recoveredAt: string | null;
  children: EvolutionNodeView[];
}

export interface EvolutionTreeView {
  rootId: string;
  focusId: string;
  tree: EvolutionNodeView;
  metrics: {
    attempts: number;
    retries: number;
    recovered: boolean;
    timeToRecoverDays: number | null;
    lessons: string[];
  };
}

export const PRACTICAL_TRAITS = [
  'overconfidence',
  'planning',
  'execution',
  'communication',
  'consistency',
  'patience',
  'timing',
  'luck',
] as const;

export const EMOTIONAL_TRAITS = [
  'frustration',
  'regret',
  'embarrassment',
  'fear',
  'hope',
  'resilience',
] as const;

export type GenomeTraitMap = Record<string, number>;

export interface FailureGenomeView {
  id?: string;
  exhibitId: string;
  practical: GenomeTraitMap;
  emotional: GenomeTraitMap;
  model?: string | null;
  generatedAt?: string;
}

export interface GenomeComparisonView {
  a: FailureGenomeView;
  b: FailureGenomeView;
  similarity: {
    practical: GenomeTraitMap;
    emotional: GenomeTraitMap;
    overall: number;
  };
}

/* ---- Feature 1: Constellation 2.0 -------------------------------------- */

export const FailureRelationType = {
  SIMILAR_EMOTION: 'similar_emotion',
  SIMILAR_LESSON: 'similar_lesson',
  SIMILAR_CATEGORY: 'similar_category',
  SIMILAR_CAUSE: 'similar_cause',
  SAME_USER_JOURNEY: 'same_user_journey',
} as const;

export type FailureRelationType = (typeof FailureRelationType)[keyof typeof FailureRelationType];

export interface ConstellationNodeView {
  id: string;
  exhibitId: string;
  title: string;
  category: ExhibitionCategory;
  painLevel: number;
  impactScore: number;
}

export interface ConstellationEdgeView {
  source: string;
  target: string;
  type: FailureRelationType;
  strength: number;
}

export interface ConstellationGraphView {
  nodes: ConstellationNodeView[];
  edges: ConstellationEdgeView[];
}

/* ---- Feature 5: Audio Story Exhibits ----------------------------------- */

export const AudioStoryStatus = {
  UPLOADED: 'uploaded',
  TRANSCRIBING: 'transcribing',
  PROCESSING: 'processing',
  READY: 'ready',
  FAILED: 'failed',
} as const;

export type AudioStoryStatus = (typeof AudioStoryStatus)[keyof typeof AudioStoryStatus];

export interface TranscriptSegment {
  start: number;
  end: number;
  text: string;
}

export interface EmotionPoint {
  time: number;
  emotion: string;
  intensity: number;
}

export interface AudioStoryView {
  id?: string;
  exhibitId: string;
  status: AudioStoryStatus;
  url?: string | null;
  duration?: number | null;
  transcript?: TranscriptSegment[] | null;
  summary?: string | null;
  lessons?: string[];
  emotionTimeline?: EmotionPoint[] | null;
}

export interface ExhibitListView {
  exhibits: ExhibitView[];
  total: number;
}

export interface AIReflectionView {
  id?: string;
  exhibitId?: string;
  emotionalSummary: string;
  patterns: string[];
  reframing: string;
  observations: string;
  persona?: CuratorPersona | null;
  createdAt?: string;
}

export interface CuratedExhibitionView {
  title: string;
  description: string;
  theme: string;
  exhibits: ExhibitView[];
}

export interface TimeCapsuleView {
  id: string;
  userId: string;
  title: string;
  message: string | null;
  unlockDate: string;
  isLocked: boolean;
  openedAt?: string | null;
  locked?: boolean;
}

export interface CapsulesUserView {
  unlocked: TimeCapsuleView[];
  locked: TimeCapsuleView[];
}
