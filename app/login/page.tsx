"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import LogoVector from '@/components/ui/LogoVector';

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Store user/session info in localStorage
        if (data.user) {
          console.log('Login successful, user data received:', data.user);
          console.log('User is_active value:', data.user.is_active, 'Type:', typeof data.user.is_active);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          // Verify what was stored
          const storedUser = localStorage.getItem('user');
          console.log('Stored user in localStorage:', storedUser);
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            console.log('Parsed user from localStorage:', parsedUser);
            console.log('Parsed user is_active:', parsedUser.is_active, 'Type:', typeof parsedUser.is_active);
          }
        }
        router.push('/dashboard');
      } else {
        if (res.status === 403) {
          setError('Your account is disabled. Please contact an administrator or clinical director.');
        } else {
          setError(data.error || 'Login failed.');
        }
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#f4f8fd] px-2">
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-8">
        <LogoVector className="h-16 mb-2" />
        <h1 className="text-3xl font-bold text-center">NewLife CRM</h1>
        <p className="text-center text-gray-500 mt-1">Mental Health Practice Management</p>
      </div>
      <Card className="w-full max-w-md mx-auto shadow-lg rounded-xl">
        <CardHeader className="flex flex-col items-center">
          <LogoVector className="h-10 mb-2" />
          <CardTitle className="text-2xl font-bold text-center">Sign In to NewLife CRM</CardTitle>
          <CardDescription className="text-center mt-1 mb-2">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="identifier">Username or Email</Label>
              <Input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            {error && <div className="text-red-600 text-sm text-center">{error}</div>}
            <Button type="submit" className="w-full mt-2 bg-green-500 hover:bg-green-600" disabled={loading}>
              <LogIn className="mr-2 h-5 w-5" />
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>
          <div className="text-center text-sm text-gray-500 mt-4">
            Don&apos;t have an account? Contact your administrator for access
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-gray-400 mt-4">
        Don&apos;t have an account? Contact your administrator for access
      </div>
    </div>
  );
} 