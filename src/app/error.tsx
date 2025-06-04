'use client';
import { useEffect } from 'react';

export default function Error({ error }: { error: Error }) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('An error occurred:', error);
    }, [error]);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
    <div className="text-2xl text-red-500">
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
    </div>
    </div>
  );
}
