import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const Account = () => {
  const [isLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl font-semibold text-center mb-8" style={{ lineHeight: '1.1' }}>
              Welcome Back
            </h1>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary">
                <TabsTrigger value="login" className="font-body text-sm">Sign In</TabsTrigger>
                <TabsTrigger value="register" className="font-body text-sm">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={(e) => { e.preventDefault(); toast.info('Auth will be connected to Supabase'); }} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="font-body text-sm">Email</Label>
                    <Input id="email" type="email" placeholder="your@email.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="password" className="font-body text-sm">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" className="mt-1.5" />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-3 text-sm font-body font-medium tracking-wide hover:bg-foreground/90 transition-colors active:scale-[0.97] rounded-md"
                  >
                    SIGN IN
                  </button>
                  <p className="text-center text-xs font-body text-muted-foreground">
                    <a href="#" className="underline underline-offset-4 hover:text-foreground">Forgot your password?</a>
                  </p>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={(e) => { e.preventDefault(); toast.info('Auth will be connected to Supabase'); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="firstName" className="font-body text-sm">First Name</Label>
                      <Input id="firstName" placeholder="Jane" className="mt-1.5" />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="font-body text-sm">Last Name</Label>
                      <Input id="lastName" placeholder="Smith" className="mt-1.5" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="regEmail" className="font-body text-sm">Email</Label>
                    <Input id="regEmail" type="email" placeholder="your@email.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="regPassword" className="font-body text-sm">Password</Label>
                    <Input id="regPassword" type="password" placeholder="••••••••" className="mt-1.5" />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-foreground text-background py-3 text-sm font-body font-medium tracking-wide hover:bg-foreground/90 transition-colors active:scale-[0.97] rounded-md"
                  >
                    CREATE ACCOUNT
                  </button>
                </form>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return null;
};

export default Account;
