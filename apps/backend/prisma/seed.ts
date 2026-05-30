import { PrismaClient } from '@prisma/client';
import { MuseumRoomSlug } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Museum of Failures...');

  const rooms = [
    { slug: MuseumRoomSlug.hall_of_broken_dreams, name: 'Hall of Broken Dreams', description: 'Dreams that never came true. Aspirations crushed by reality.', ambience: 'echoing_hall', lighting: 'dim_amber', orderIndex: 1 },
    { slug: MuseumRoomSlug.startup_cemetery, name: 'Startup Cemetery', description: 'Failed startups, abandoned products, and ideas that never took off.', ambience: 'cold_warehouse', lighting: 'fluorescent_flicker', orderIndex: 2 },
    { slug: MuseumRoomSlug.burnout_basement, name: 'Burnout Basement', description: 'Exhaustion, collapse, and the weight of too much pressure.', ambience: 'underground_hum', lighting: 'almost_dark', orderIndex: 3 },
    { slug: MuseumRoomSlug.academic_ruins, name: 'Academic Ruins', description: 'Exam failures, abandoned degrees, and educational regrets.', ambience: 'library_echo', lighting: 'reading_lamp', orderIndex: 4 },
    { slug: MuseumRoomSlug.gallery_of_lost_potential, name: 'Gallery of Lost Potential', description: 'What could have been. Talents never realized.', ambience: 'quiet_gallery', lighting: 'spotlight', orderIndex: 5 },
    { slug: MuseumRoomSlug.the_regret_archive, name: 'The Regret Archive', description: 'Decisions that haunt. Paths not taken.', ambience: 'archive_room', lighting: 'vintage_bulb', orderIndex: 6 },
    { slug: MuseumRoomSlug.abandoned_futures_wing, name: 'Abandoned Futures Wing', description: 'Futures that never arrived. Plans that dissolved.', ambience: 'wind_tunnel', lighting: 'broken_lights', orderIndex: 7 },
    { slug: MuseumRoomSlug.relationship_graveyard, name: 'Relationship Graveyard', description: 'Love lost, friendships broken, connections that faded.', ambience: 'rain_room', lighting: 'moonlight', orderIndex: 8 },
  ];

  for (const room of rooms) {
    await prisma.museumRoom.upsert({
      where: { slug: room.slug },
      update: room,
      create: room,
    });
  }

  console.log(`Seeded ${rooms.length} museum rooms`);

  // ---- Sample exhibits: a 3-step evolution lineage + one standalone -------
  // Makes the Evolution Tree (F4), Genome (F3) and Constellation (F1) visible
  // on a fresh database. Constellation category/journey/emotion edges form
  // without an API key; run POST /constellation/rebuild after seeding.
  const archivist = await prisma.user.upsert({
    where: { pseudonym: 'the-archivist' },
    update: {},
    create: {
      pseudonym: 'the-archivist',
      displayName: 'The Archivist',
      identityMode: 'pseudonym',
      isAnonymous: false,
    },
  });

  const upsertExhibit = (data: Parameters<typeof prisma.exhibit.create>[0]['data']) =>
    prisma.exhibit.upsert({
      where: { exhibitId: data.exhibitId as string },
      update: {},
      create: data,
    });

  const a1 = await upsertExhibit({
    exhibitId: 'seed-startup-001',
    title: 'The launch nobody came to',
    category: 'startup_failure',
    story: 'We spent a year building in secret, certain the product would speak for itself. On launch day the silence was total.',
    expectedOutcome: 'A wave of early adopters and validation.',
    actualOutcome: 'Twelve signups, eleven of them friends.',
    lessonLearned: 'Building in secret is hiding, not strategy. Talk to people first.',
    emotionalState: 'numb',
    painLevel: 8,
    regretLevel: 7,
    recoveryProgress: 10,
    stillHurts: true,
    wouldRetry: true,
    endingStatus: 'destroyed_me',
    recoveryStatus: 'retried',
    visibilityMode: 'pseudonym',
    emotionalTags: ['fear', 'shame', 'hope'],
    evolutionStatus: 'failed',
    userId: archivist.id,
  });

  const a2 = await upsertExhibit({
    exhibitId: 'seed-startup-002',
    title: 'The pivot that almost worked',
    category: 'startup_failure',
    story: 'I rebuilt around the one feature people actually used. Growth came, slowly, but the runway came faster.',
    expectedOutcome: 'A second chance with real traction.',
    actualOutcome: 'Real users, but never enough revenue in time.',
    lessonLearned: 'Traction is not the same as a business. Watch the runway, not the vanity metrics.',
    emotionalState: 'anxious',
    painLevel: 6,
    regretLevel: 5,
    recoveryProgress: 40,
    stillHurts: true,
    wouldRetry: true,
    endingStatus: 'changed_me',
    recoveryStatus: 'pivoted',
    visibilityMode: 'pseudonym',
    emotionalTags: ['fear', 'hope', 'doubt'],
    evolutionStatus: 'ongoing',
    parentFailureId: a1.id,
    userId: archivist.id,
  });

  await upsertExhibit({
    exhibitId: 'seed-startup-003',
    title: 'Closing it down, on my own terms',
    category: 'startup_failure',
    story: 'I shut it down before it shut me down. For the first time the decision felt like mine.',
    expectedOutcome: 'A quiet, clean ending.',
    actualOutcome: 'Relief, and a clarity I had not felt in years.',
    lessonLearned: 'Ending something well is its own kind of success.',
    emotionalState: 'at peace',
    painLevel: 3,
    regretLevel: 2,
    recoveryProgress: 80,
    stillHurts: false,
    wouldRetry: false,
    endingStatus: 'made_me_stronger',
    recoveryStatus: 'recovered',
    visibilityMode: 'pseudonym',
    emotionalTags: ['hope', 'relief'],
    evolutionStatus: 'recovered',
    recoveredAt: new Date(),
    parentFailureId: a2.id,
    userId: archivist.id,
  });

  await upsertExhibit({
    exhibitId: 'seed-burnout-001',
    title: 'The year I worked through the warning signs',
    category: 'burnout',
    story: 'Every signal told me to stop. I read them as weakness and pushed harder until my body made the choice for me.',
    expectedOutcome: 'Endurance would be rewarded.',
    actualOutcome: 'A collapse that took months to climb out of.',
    lessonLearned: 'Rest is part of the work, not a betrayal of it.',
    emotionalState: 'exhausted',
    painLevel: 9,
    regretLevel: 6,
    recoveryProgress: 30,
    stillHurts: true,
    wouldRetry: false,
    endingStatus: 'changed_me',
    recoveryStatus: 'healing',
    visibilityMode: 'pseudonym',
    emotionalTags: ['exhaustion', 'fear', 'regret'],
    userId: archivist.id,
  });

  console.log('Seeded sample exhibits (1 evolution lineage + 1 standalone)');
  console.log('Seeding complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
