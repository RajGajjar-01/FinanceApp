import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { FcGoogle } from 'react-icons/fc';
import { Loader2, AlertCircle, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '@/contexts/auth-context';
import { useSearchParams } from 'react-router';
import React from 'react';

const formSchema = z.object({
  login: z.email({ message: 'Invalid email address' }),
  password: z.string().nonempty({ message: 'Password is required' }),
});

const Login = () => {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login, googleLogin, handleGoogleCallback } = useAuth();

  const [searchParams] = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  console.log('rendeer');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      login: '',
      password: '',
    },
  });

  useEffect(() => {
    const processGoogleCallback = async () => {
      if (error) {
        console.error('OAuth error:', error);
        setGoogleLoading(false);
        return;
      }

      if (code) {
        setGoogleLoading(true);
        try {
          await handleGoogleCallback(code, 'from:login');
        } catch (error) {
          console.error('Google callback error:', error);
          form.setError('root', {
            message: 'Oops! Something went wrong!!',
          });
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    processGoogleCallback();
  }, [code, error]);

  const onSubmit = async (data) => {
    const response = await login(data);
    if (response.data?.errors?.non_field_errors)
      form.setError('root', {
        message: 'Invalid credentials',
      });
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
            <Card className="bg-card/95 backdrop-blur-sm border-2 border-border/70 dark:border-border/50 shadow-2xl rounded-md md:w-full">
              <CardHeader className="space-y-2 py-4 px-6 sm:px-8 lg:px-8">
                <CardTitle className="text-3xl font-bold text-center">Welcome Back</CardTitle>
                <CardDescription className="text-center text-base text-muted-foreground">
                  Sign in to your account to continue
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5 px-4 sm:px-8 lg:px-10 pb-6 lg:w-[28rem]">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  className="w-full h-12 text-base font-medium border-border/50 hover:bg-muted/50 transition-all duration-200"
                  onClick={() => googleLogin('from:login')}
                  disabled={form.formState.isSubmitting || googleLoading}
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
                        name="login"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-md font-medium">Email</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Enter your email address"
                                  className="pl-10 h-12"
                                  autoComplete="off"
                                  disabled={form.formState.isSubmitting || googleLoading}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage className="text-sm text-destructive font-medium" />
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
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Enter your password"
                                  className="pl-10 pr-10 h-12"
                                  autoComplete="off"
                                  disabled={form.formState.isSubmitting || googleLoading}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                  ) : (
                                    <Eye className="h-4 w-4" />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <FormMessage className="text-sm text-destructive font-medium" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-sm text-primary hover:text-primary/80 transition-colors font-medium"
                      >
                        Forgot password?
                      </Link>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={form.formState.isSubmitting || googleLoading}
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </Button>
                    {form.formState.errors.root && (
                      <div className="font-bold text-destructive text-center">
                        {form.formState.errors.root.message}
                      </div>
                    )}
                  </form>
                </Form>
                <p>{form.error?.root.message}</p>

                <div className="text-center pt-2">
                  <p className="text-sm text-muted-foreground">
                    Don't have an account?{' '}
                    <Link
                      to="/register"
                      className="text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      Create account
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

export default Login;
