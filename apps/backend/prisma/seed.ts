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
