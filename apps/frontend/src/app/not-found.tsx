import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="font-serif text-6xl text-museum-600">404</h1>
        <p className="text-whisper-dark font-light text-lg">
          This exhibit has been lost to time.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 border border-museum-800 rounded-sm text-whisper-dark hover:border-ember/50 transition-colors"
        >
          Return to the museum
        </Link>
      </div>
    </div>
  );
}
