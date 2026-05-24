'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MuseumLayout } from '@/components/museum/museum-layout';
import { RoomAtmosphere } from '@/components/rooms/room-atmosphere';
import { ExhibitCard } from '@/components/exhibits/exhibit-card';
import { MUSEUM_ROOMS } from '@/lib/constants';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

export default function RoomPage() {
  const params = useParams();
  const [roomData, setRoomData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const roomInfo = MUSEUM_ROOMS.find((r) => r.slug === params?.slug);

  useEffect(() => {
    if (!params?.slug) return;
    setLoading(true);
    api.rooms.get(params.slug as string)
      .then((data) => setRoomData(data))
      .catch(() => setRoomData(null))
      .finally(() => setLoading(false));
  }, [params?.slug]);

  return (
    <MuseumLayout>
      {roomInfo && <RoomAtmosphere roomSlug={roomInfo.slug} />}

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-museum-800 rounded w-1/3" />
            <div className="h-4 bg-museum-800 rounded w-1/2" />
          </div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <h1 className="font-serif text-4xl text-whisper-light mb-2">
                {roomData?.name || roomInfo?.name || 'Unknown Room'}
              </h1>
              <p className="text-whisper-dark font-light">
                {roomData?.description || roomInfo?.description}
              </p>
              {roomData?._count && (
                <p className="text-sm text-museum-600 mt-2">
                  {roomData._count.exhibits} exhibits preserved here
                </p>
              )}
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomData?.exhibits?.map((exhibit: any, i: number) => (
                <ExhibitCard key={exhibit.id} exhibit={exhibit} index={i} />
              ))}
              {roomData?.exhibits?.length === 0 && (
                <div className="col-span-full text-center py-20">
                  <p className="text-museum-600 font-serif text-xl">This room is empty.</p>
                  <p className="text-museum-700 mt-2">No exhibits have been placed here yet.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </MuseumLayout>
  );
}
