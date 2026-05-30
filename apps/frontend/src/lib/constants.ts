export const MUSEUM_ROOMS = [
  { slug: 'hall_of_broken_dreams', name: 'Hall of Broken Dreams', description: 'Dreams that never came true.', ambience: 'echoing_hall', lighting: 'dim_amber', path: '/rooms/hall_of_broken_dreams' },
  { slug: 'startup_cemetery', name: 'Startup Cemetery', description: 'Failed startups and abandoned products.', ambience: 'cold_warehouse', lighting: 'fluorescent_flicker', path: '/rooms/startup_cemetery' },
  { slug: 'burnout_basement', name: 'Burnout Basement', description: 'Exhaustion and collapse.', ambience: 'underground_hum', lighting: 'almost_dark', path: '/rooms/burnout_basement' },
  { slug: 'academic_ruins', name: 'Academic Ruins', description: 'Exam failures and abandoned degrees.', ambience: 'library_echo', lighting: 'reading_lamp', path: '/rooms/academic_ruins' },
  { slug: 'gallery_of_lost_potential', name: 'Gallery of Lost Potential', description: 'Talents never realized.', ambience: 'quiet_gallery', lighting: 'spotlight', path: '/rooms/gallery_of_lost_potential' },
  { slug: 'the_regret_archive', name: 'The Regret Archive', description: 'Decisions that haunt.', ambience: 'archive_room', lighting: 'vintage_bulb', path: '/rooms/the_regret_archive' },
  { slug: 'abandoned_futures_wing', name: 'Abandoned Futures Wing', description: 'Futures that never arrived.', ambience: 'wind_tunnel', lighting: 'broken_lights', path: '/rooms/abandoned_futures_wing' },
  { slug: 'relationship_graveyard', name: 'Relationship Graveyard', description: 'Love lost and connections faded.', ambience: 'rain_room', lighting: 'moonlight', path: '/rooms/relationship_graveyard' },
];

export const CATEGORIES = [
  { value: 'startup_failure', label: 'Startup Failure', icon: '💼' },
  { value: 'academic_collapse', label: 'Academic Collapse', icon: '📚' },
  { value: 'relationship_failure', label: 'Relationship Failure', icon: '💔' },
  { value: 'burnout', label: 'Burnout', icon: '🔥' },
  { value: 'career_regret', label: 'Career Regret', icon: '💼' },
  { value: 'missed_opportunity', label: 'Missed Opportunity', icon: '⏳' },
  { value: 'financial_mistake', label: 'Financial Mistake', icon: '💰' },
  { value: 'family_conflict', label: 'Family Conflict', icon: '🏠' },
  { value: 'creative_failure', label: 'Creative Failure', icon: '🎨' },
  { value: 'identity_crisis', label: 'Identity Crisis', icon: '🌀' },
  { value: 'mental_exhaustion', label: 'Mental Exhaustion', icon: '🌑' },
  { value: 'failed_side_project', label: 'Failed Side Project', icon: '💻' },
  { value: 'interview_rejection', label: 'Interview Rejection', icon: '📄' },
  { value: 'betrayal', label: 'Betrayal', icon: '🗡️' },
  { value: 'unrealized_dream', label: 'Unrealized Dream', icon: '🌟' },
];

export const ENDING_STATUSES = [
  { value: 'destroyed_me', label: 'Destroyed Me', description: 'This failure completely broke me.' },
  { value: 'changed_me', label: 'Changed Me', description: 'I am not the same person after this.' },
  { value: 'still_defining_me', label: 'Still Defining Me', description: 'This failure is still part of my story.' },
  { value: 'made_me_stronger', label: 'Made Me Stronger', description: 'It hurt, but I grew from it.' },
  { value: 'still_unresolved', label: 'Still Unresolved', description: 'I haven\'t found closure yet.' },
];

export const REACTIONS = [
  { value: 'i_relate', label: 'I Relate', symbol: '🤝' },
  { value: 'i_survived_this_too', label: 'I Survived This Too', symbol: '💪' },
  { value: 'still_recovering', label: 'Still Recovering', symbol: '❤️‍🩹' },
  { value: 'this_hurt', label: 'This Hurt', symbol: '💔' },
  { value: 'you_were_brave', label: 'You Were Brave', symbol: '🕯️' },
  { value: 'i_understand', label: 'I Understand', symbol: '👁️' },
];

export const RECOVERY_STATUSES = [
  { value: 'recovered', label: 'Recovered', description: 'I moved past this.' },
  { value: 'retried', label: 'Retried', description: 'I tried again.' },
  { value: 'pivoted', label: 'Pivoted', description: 'I changed direction.' },
  { value: 'still_failing', label: 'Still Failing', description: 'I am still in it.' },
  { value: 'gave_up', label: 'Gave Up', description: 'I let it go.' },
  { value: 'healing', label: 'Healing', description: 'I am getting better.' },
];


/**
 * Curator persona tabs for the exhibit reflection panel (Feature 2).
 * `value: ''` is the original default curator; the rest map to the backend
 * CuratorPersona enum.
 */
export const CURATOR_PERSONAS = [
  { value: '', label: 'Curator' },
  { value: 'historian', label: 'Historian' },
  { value: 'engineer', label: 'Engineer' },
  { value: 'therapist', label: 'Therapist' },
  { value: 'founder', label: 'Founder' },
  { value: 'philosopher', label: 'Philosopher' },
] as const;


/** Evolution node statuses (Feature 4 — Failure Evolution Tree). */
export const EVOLUTION_STATUSES = [
  { value: 'failed', label: 'Failed' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'recovered', label: 'Recovered' },
  { value: 'successful', label: 'Successful' },
] as const;
