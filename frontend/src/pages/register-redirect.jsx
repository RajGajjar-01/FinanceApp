import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { useAuth } from '../contexts/auth-context';
import { CheckCircle, RefreshCw, AlertCircle, Loader2, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const OTPVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, verifyEmail, resendVerifyEmail } = useAuth();

  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [message, setMessage] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const emailFromParams = searchParams.get('email');
    const emailFromUser = user?.email;
    setEmail(emailFromParams || emailFromUser || '');
  }, [searchParams, user]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const validateOtp = (value) => {
    if (!value) return 'Verification code is required';
    if (value.length !== 6) return 'Verification code must be 6 digits';
    if (!/^\d{6}$/.test(value)) return 'Please enter a valid 6-digit code';
    return '';
  };

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setOtp(value);
    if (otpError) setOtpError('');
  };

  const handleSubmit = async () => {
    const error = validateOtp(otp);
    if (error) {
      setOtpError(error);
      return;
    }

    setIsSubmitting(true);
    setVerificationStatus('verifying');
    setMessage('');
    setOtpError('');

    try {
      const response = await verifyEmail({
        email: email,
        otp_code: otp,
      });

      if (response.data.success) {
        setVerificationStatus('success');
        setMessage('Email verified successfully! Welcome aboard!');
        setTimeout(() => navigate('/dashboard', {replace:true}), 2000);
      } else {
        setVerificationStatus('error');
        setMessage(response.error || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      setVerificationStatus('error');
      setMessage('Network error. Please try again.');
    }
    setIsSubmitting(false);
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setMessage('');

    try {
      const response = await resendVerifyEmail({ email });
      if (response.data.success) {
        setMessage('New verification code sent! Please check your inbox.');
        setResendCooldown(60);
        setVerificationStatus('pending');
      } else {
        setMessage(result.error || 'Failed to resend verification code. Please try again.');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }

    setResendLoading(false);
  };

  const getStatusIcon = () => {
    switch (verificationStatus) {
      case 'verifying':
        return <Loader2 className="h-12 w-12 animate-spin text-primary" />;
      case 'success':
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          >
            <CheckCircle className="h-16 w-16 text-green-500" />
          </motion.div>
        );
      case 'error':
        return <AlertCircle className="h-12 w-12 text-destructive" />;
      default:
        return <Shield className="h-12 w-12 text-primary" />;
    }
  };

  const getStatusTitle = () => {
    switch (verificationStatus) {
      case 'verifying':
        return 'Verifying Code...';
      case 'success':
        return 'Email Verified!';
      case 'error':
        return 'Verification Failed';
      default:
        return 'Enter Verification Code';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex justify-center pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="flex justify-center"
          >
            {getStatusIcon()}
          </motion.div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{getStatusTitle()}</h1>
            <p className="text-muted-foreground">
              {verificationStatus === 'success'
                ? 'Your email has been successfully verified. Welcome aboard!'
                : `We've sent a 6-digit verification code to ${email}`}
            </p>
          </div>
        </div>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <Alert
                className={`${
                  verificationStatus === 'success'
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20'
                    : verificationStatus === 'error'
                      ? 'bg-destructive/10 border-destructive/50'
                      : 'bg-primary/10 border-primary/50'
                }`}
              >
                <AlertDescription className="text-center">{message}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {verificationStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <Button
              onClick={() => navigate('/dashboard')}
              className="w-full h-12 text-base font-medium bg-green-500 hover:bg-green-600"
            >
              Go to Dashboard Now
            </Button>
          </motion.div>
        )}

        {(verificationStatus === 'pending' || verificationStatus === 'error') && (
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="space-y-2">
                <label
                  htmlFor="otp"
                  className={`text-sm font-medium ${otpError ? 'text-destructive' : ''}`}
                >
                  Verification Code
                </label>
              </div>

              <Input
                id="otp"
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={otp}
                onChange={handleOtpChange}
                onKeyDown={handleKeyDown}
                className="text-center text-lg font-mono tracking-widest h-12"
                disabled={isSubmitting}
              />
              {otpError && <p className="text-sm text-destructive font-medium">{otpError}</p>}
            </div>

            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full h-12 text-base font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify Code'
              )}
            </Button>
          </div>
        )}

        {verificationStatus === 'pending' && (
          <div className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code? Check your spam folder or try resending.
            </p>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
              className="w-full h-12 text-base font-medium"
            >
              {resendLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Sending...
                </>
              ) : resendCooldown > 0 ? (
                <>Resend in {resendCooldown}s</>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-5 w-5" />
                  Resend Code
                </>
              )}
            </Button>
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Need help?{' '}
            <button className="text-primary hover:text-primary/80 transition-colors font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPVerification;
