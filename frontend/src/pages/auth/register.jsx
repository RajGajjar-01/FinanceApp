import { Button } from '@/components/ui/button';
import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router';
import { Loader2, Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useSearchParams } from 'react-router';

const formSchema = z.object({
  username: z
    .string()
    .nonempty({ message: 'Username is required' })
    .min(4, { message: 'Username must be at least 4 characters' })
    .regex(/[a-z]/, 'Invalid username'),
  email: z
    .string()
    .nonempty({ message: 'Email is required' })
    .email({ message: 'Invalid email address' }),
  password: z
    .string()
    .nonempty({ message: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' })
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one digit')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
});

const Register = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, googleLogin, handleGoogleCallback } = useAuth();

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');


  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (code) {
      setGoogleLoading(true);
      handleGoogleCallback(code, 'from:register');
    }
    if (error) {
      setGoogleLoading(false);
    }
  }, [code, error]);

  const onSubmit = async (data) => {
    const response = await register(data);

    if (response.data.errors?.username) {
      form.setError('username', {
        message: 'Username already taken',
      });
    }
    if (response.data.errors?.email) {
      form.setError('email', {
        message: 'User with this email already exist',
      });
    }
    if (response.data.errors?.password) {
      form.setError('password', {
        message: response.data.errors?.password[0],
      });
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div className="min-h-screen flex items-center justify-center py-8 px-0">
        <div className="w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
          >
            <Card className="bg-card/95 backdrop-blur-sm border-2 border-border/70 dark:border-border/50 rounded-md shadow-2xl md:w-full">
              <CardHeader className="space-y-2 py-4 px-6 sm:px-8 lg:px-8">
                <CardTitle className="text-3xl font-bold text-center">Create Account</CardTitle>
                <CardDescription className="text-center text-base text-muted-foreground">
                  Sign up to get started with your journey
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-4 sm:px-8 lg:px-10 pb-6 lg:w-[28rem]">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50 transition-all duration-200"
                  onClick={() => googleLogin('from:register')}
                  disabled={googleLoading || form.formState.isSubmitting}
                >
                  {googleLoading ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <FcGoogle className="mr-3 h-5 w-5" />
                      Continue with Google
                    </>
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <Separator className="w-full" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="bg-card px-4 text-muted-foreground">
                      Or continue with email
                    </span>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md font-medium">Username</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                  placeholder="Choose a username"
                                  className="pl-10 h-12 text-base"
                                  autoComplete="off"
                                  disabled={form.formState.isSubmitting || googleLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <AnimatePresence mode="wait">
                              {form.formState.errors.username && (
                                <motion.div
                                  key="username-error"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  transition={{
                                    duration: 0.1,
                                    ease: 'easeOut',
                                  }}
                                >
                                  <FormMessage className="text-sm text-destructive font-medium" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md font-medium">Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                  placeholder="Enter your email address"
                                  className="pl-10 h-12 text-base"
                                  autoComplete="off"
                                  disabled={form.formState.isSubmitting || googleLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <AnimatePresence mode="wait">
                              {form.formState.errors.email && (
                                <motion.div
                                  key="email-error"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  transition={{
                                    duration: 0.1,
                                    ease: 'easeOut',
                                  }}
                                >
                                  <FormMessage className="text-sm text-destructive font-medium" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md font-medium">Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Create a password"
                                  className="pl-10 pr-10 h-12 text-base"
                                  autoComplete="off"
                                  disabled={form.formState.isSubmitting || googleLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <AnimatePresence mode="wait">
                              {form.formState.errors.password && (
                                <motion.div
                                  key="password-error"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  transition={{
                                    duration: 0.1,
                                    ease: 'easeOut',
                                  }}
                                >
                                  <FormMessage className="text-sm text-destructive font-medium" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={form.formState.isSubmitting || googleLoading}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        'Create Account'
                      )}
                    </Button>
                  </form>
                </Form>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Already have an account?
                    <Link
                      to="/login"
                      className="text-primary hover:text-primary/80 transition-colors font-medium underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
export default Register;
