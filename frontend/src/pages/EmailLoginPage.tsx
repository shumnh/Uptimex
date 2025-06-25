import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

function EmailLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<PasswordValidation>({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasSpecialChar: false
  });
  const navigate = useNavigate();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): PasswordValidation => {
    return {
      minLength: password.length >= 7,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasSpecialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>?]/.test(password)
    };
  };

  const isPasswordValid = (validation: PasswordValidation): boolean => {
    return validation.minLength && validation.hasUppercase && validation.hasLowercase && validation.hasSpecialChar;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const emailValue = e.target.value;
    setEmail(emailValue);
    setEmailError('');
    
    if (emailValue && !validateEmail(emailValue)) {
      setEmailError('Invalid email format');
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const passwordValue = e.target.value;
    setPassword(passwordValue);
    setPasswordValidation(validatePassword(passwordValue));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!password) {
      setError('Password is required');
      return;
    }
    if (!isPasswordValid(passwordValidation)) {
      setError('Password does not meet security requirements');
      return;
    }

    setIsLoggingIn(true);

    try {
      // Calling the existing backend login endpoint
      const response = await fetch(`${API_ENDPOINTS.BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Check if user is a website owner (role: 'user')
        if (data.user.role !== 'user') {
          setError('This account is not registered as a website owner. Please use the validator login.');
          return;
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,#3b82f6_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,#8b5cf6_0%,transparent_70%)]"></div>
      </div>
      
      {/* Floating elements */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-500 rounded-full animate-ping"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-purple-500 rounded-full animate-pulse"></div>
      <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Back button */}
        <Link 
          to="/"
          className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors group"
        >
          <svg className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        {/* Main card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your UptimeX dashboard</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-red-300 text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleEmailChange}
                  className={`w-full px-4 py-4 bg-white/5 border ${
                    emailError 
                      ? 'border-red-500/50' 
                      : email && validateEmail(email)
                      ? 'border-green-500/50'
                      : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all`}
                  placeholder="Enter your email"
                  required
                />
                {email && validateEmail(email) && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-red-400 text-sm mt-2">{emailError}</p>
              )}
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-4 bg-white/5 border ${
                    password && isPasswordValid(passwordValidation)
                      ? 'border-green-500/50'
                      : 'border-white/10'
                  } rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/25 transition-all pr-12`}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password requirements */}
              {password && (
                <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-xs text-gray-400 mb-2">Password Requirements:</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className={`flex items-center ${passwordValidation.minLength ? 'text-green-400' : 'text-gray-500'}`}>
                      <svg className={`w-3 h-3 mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      7+ characters
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasUppercase ? 'text-green-400' : 'text-gray-500'}`}>
                      <svg className={`w-3 h-3 mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Uppercase
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasLowercase ? 'text-green-400' : 'text-gray-500'}`}>
                      <svg className={`w-3 h-3 mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Lowercase
                    </div>
                    <div className={`flex items-center ${passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-gray-500'}`}>
                      <svg className={`w-3 h-3 mr-1`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Special char
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoggingIn || !email || !password || !validateEmail(email) || !isPasswordValid(passwordValidation)}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none"
            >
              {isLoggingIn ? (
                <div className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4 text-gray-500 text-sm">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Alternative options */}
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center"
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Connect Wallet Instead
            </Link>

            <div className="text-center">
              <span className="text-gray-500 text-sm">Don't have an account? </span>
              <Link 
                to="/email-register"
                className="text-blue-400 hover:text-blue-300 font-medium text-sm transition-colors"
              >
                Sign up here
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 text-sm flex items-center justify-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Protected by enterprise-grade security
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmailLoginPage;