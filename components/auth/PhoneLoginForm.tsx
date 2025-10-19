"use client";

import React, { useState } from 'react';
import authService from '@/lib/api/auth';

interface PhoneLoginFormProps {
  onSuccess: () => void;
}

const PhoneLoginForm: React.FC<PhoneLoginFormProps> = ({ onSuccess }) => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('+994');
  const [otpCode, setOtpCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const formatPhone = (value: string) => {
    // Remove all non-digit characters except +
    const cleaned = value.replace(/[^\d+]/g, '');

    // Ensure it starts with +994
    if (!cleaned.startsWith('+994')) {
      return '+994';
    }

    // Limit to +994 plus 9 digits
    const match = cleaned.match(/^(\+994)(\d{0,2})(\d{0,3})(\d{0,2})(\d{0,2})$/);

    if (match) {
      const parts = [match[1]];
      if (match[2]) parts.push(match[2]);
      if (match[3]) parts.push(match[3]);
      if (match[4]) parts.push(match[4]);
      if (match[5]) parts.push(match[5]);
      return parts.join(' ');
    }

    return cleaned.slice(0, 13); // +994 + 9 digits max
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate phone number
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone.match(/^\+994\d{9}$/)) {
      setError('Please enter a valid Azerbaijan phone number');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.sendOTP({
        phone: cleanPhone,
        purpose: 'login'
      });

      if (response.status === 'success') {
        setStep('otp');
        setCountdown(60);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const cleanPhone = phone.replace(/\s/g, '');

    try {
      const response = await authService.verifyOTP({
        phone: cleanPhone,
        code: otpCode,
        name: name || undefined,
      });

      if (response.status === 'success') {
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setError('');
    const cleanPhone = phone.replace(/\s/g, '');

    try {
      await authService.sendOTP({
        phone: cleanPhone,
        purpose: 'login'
      });
      setCountdown(60);
    } catch (err: any) {
      setError('Failed to resend OTP. Please try again.');
    }
  };

  if (step === 'phone') {
    return (
      <form onSubmit={handleSendOTP} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="+994 XX XXX XX XX"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Enter your Azerbaijan mobile number
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading || phone.replace(/\s/g, '').length !== 13}
          className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send SMS Code'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOTP} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <div className="text-center mb-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          We've sent a 6-digit code to
        </p>
        <p className="font-medium text-gray-900 dark:text-white">{phone}</p>
      </div>

      <div>
        <label htmlFor="otp" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Verification Code
        </label>
        <input
          type="text"
          id="otp"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          required
          maxLength={6}
          className="w-full px-3 py-2 text-center text-lg tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="000000"
        />
      </div>

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Your Name (optional)
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="John Doe"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading || otpCode.length !== 6}
        className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? 'Verifying...' : 'Verify & Sign In'}
      </button>

      <div className="text-center">
        <button
          type="button"
          onClick={handleResendOTP}
          disabled={countdown > 0}
          className="text-sm text-blue-600 hover:text-blue-500 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend code'}
        </button>
        <button
          type="button"
          onClick={() => setStep('phone')}
          className="ml-4 text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300"
        >
          Change number
        </button>
      </div>
    </form>
  );
};

export default PhoneLoginForm;