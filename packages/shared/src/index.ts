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
