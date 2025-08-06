'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn, generateUUID } from '@/lib/utils';
import { signIn } from '@/lib/auth-client';

export function CustomerLoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [customerId, setCustomerId] = useState('');
  const [password, setPassword] = useState('');

  async function handleSignIn() {
    if (!customerId.trim()) {
      toast.error('Please enter your customer ID');
      return;
    }
    
    if (!password.trim()) {
      toast.error('Please enter your password');
      return;
    }

    setLoading(true);
    try {
      const result = await signIn('customer', {
        customerId: parseInt(customerId),
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("Customer ID or password is incorrect");
      } else {
        toast.success('Signed in successfully');
        const chatId = generateUUID();
        router.push(`/chat/${chatId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Customer Login</CardTitle>
          <CardDescription>
            Login with your Customer ID to file a complaint or check the status of your complaint.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="customerId">Customer ID</Label>
                  <Input
                    disabled={loading}
                    id="customerId"
                    onChange={(e) => setCustomerId(e.target.value)}
                    placeholder="Enter your customer ID"
                    required
                    type="text"
                    value={customerId}
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    disabled={loading}
                    id="password"
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    type="password"
                    value={password}
                  />
                </div>
                <Button
                  className="w-full"
                  disabled={loading}
                  onClick={handleSignIn}
                  type="button"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-muted-foreground text-xs">
        <a href="/login/employee" className="underline underline-offset-4 hover:text-primary">
          Login as Employee
        </a>
      </div>
    </div>
  );
}
