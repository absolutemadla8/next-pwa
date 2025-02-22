// app/verify/page.tsx
import { Suspense } from 'react';
import VerifyContent from '../components/auth/VerifyContent';

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  );
}