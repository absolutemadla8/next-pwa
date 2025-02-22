// app/login/page.tsx
import { Suspense } from 'react';
import LoginContent from '../components/auth/LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}