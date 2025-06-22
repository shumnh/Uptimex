import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API_ENDPOINTS from '../config/api';

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasSpecialChar: boolean;
}

function EmailRegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');

    if (name === 'email') {
      setEmailError('');
      if (value && !validateEmail(value)) {
        setEmailError('Please enter a valid email address');
      }
    }

    if (name === 'password') {
      setPasswordValidation(validatePassword(value));
    }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate name
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    // Validate email
    if (!formData.email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    // Validate password
    if (!formData.password) {
      setError('Password is required');
      return;
    }
    if (!isPasswordValid(passwordValidation)) {
      setError('Password does not meet security requirements');
      return;
    }

    // Validate password confirmation
    if (!formData.confirmPassword) {
      setError('Please confirm your password');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsRegistering(true);

    try {
      // Call the backend registration endpoint
      const response = await fetch(`${API_ENDPOINTS.BASE}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.name.trim(),
          email: formData.email,
          password: formData.password,
          role: 'user' // Set role as user (website owner)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsRegistering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%236366f1%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221.5%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-r from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full">
          {/* Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-8 transition-colors group font-medium"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-10 border border-white/50 shadow-2xl">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                Create Account
              </h1>
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                Join the platform and start monitoring your websites
              </p>
              <div className="mt-6 inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl">
                <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3 animate-pulse"></div>
                <span className="text-indigo-700 text-sm font-bold">
                  Website Owner Registration • Secure • Encrypted
                </span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-red-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-red-800 font-medium">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleRegistration} className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-bold text-slate-700">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-4 pl-12 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500 transition-all duration-300"
                    placeholder="Enter your full name"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-bold text-slate-700">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 pl-12 bg-white border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      emailError 
                        ? 'border-red-300 focus:border-red-500' 
                        : formData.email && validateEmail(formData.email)
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    placeholder="Enter your email address"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  {formData.email && validateEmail(formData.email) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                {emailError && (
                  <p className="text-red-600 text-sm font-medium">{emailError}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-bold text-slate-700">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 pl-12 pr-12 bg-white border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      formData.password && isPasswordValid(passwordValidation)
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    placeholder="Create a secure password"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.465 8.465M9.878 9.878l.518.518m4.242 4.242l1.414 1.414M14.12 14.12l.518.518m-4.242-4.242l2.121-2.121m2.121 2.121L16.95 8.05m0 0l2.121-2.121M16.95 8.05l-2.121 2.121" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Validation Indicators */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-slate-700">Password Requirements:</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className={`flex items-center text-xs font-medium ${passwordValidation.minLength ? 'text-green-600' : 'text-slate-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordValidation.minLength ? 'text-green-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordValidation.minLength ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        7+ characters
                      </div>
                      <div className={`flex items-center text-xs font-medium ${passwordValidation.hasUppercase ? 'text-green-600' : 'text-slate-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordValidation.hasUppercase ? 'text-green-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordValidation.hasUppercase ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        Uppercase letter
                      </div>
                      <div className={`flex items-center text-xs font-medium ${passwordValidation.hasLowercase ? 'text-green-600' : 'text-slate-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordValidation.hasLowercase ? 'text-green-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordValidation.hasLowercase ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        Lowercase letter
                      </div>
                      <div className={`flex items-center text-xs font-medium ${passwordValidation.hasSpecialChar ? 'text-green-600' : 'text-slate-500'}`}>
                        <svg className={`w-4 h-4 mr-2 ${passwordValidation.hasSpecialChar ? 'text-green-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={passwordValidation.hasSpecialChar ? "M5 13l4 4L19 7" : "M6 18L18 6M6 6l12 12"} />
                        </svg>
                        Special character
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-bold text-slate-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-4 pl-12 pr-12 bg-white border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                      formData.confirmPassword && formData.password === formData.confirmPassword
                        ? 'border-green-300 focus:border-green-500'
                        : 'border-slate-200 focus:border-indigo-500'
                    }`}
                    placeholder="Confirm your password"
                    required
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.465 8.465M9.878 9.878l.518.518m4.242 4.242l1.414 1.414M14.12 14.12l.518.518m-4.242-4.242l2.121-2.121m2.121 2.121L16.95 8.05m0 0l2.121-2.121M16.95 8.05l-2.121 2.121" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-red-600 text-sm font-medium">Passwords do not match</p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isRegistering || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !validateEmail(formData.email) || !isPasswordValid(passwordValidation) || formData.password !== formData.confirmPassword}
                className="group relative w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-5 px-8 rounded-2xl shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-1 hover:scale-105 disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center">
                  {isRegistering ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <span className="text-3xl mr-3">🚀</span>
                      <span className="text-lg">Create Account</span>
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-700 to-purple-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Alternative Registration Options */}
            <div className="mt-8 border-t border-slate-200 pt-8">
              <div className="text-center mb-6">
                <p className="text-slate-600 font-medium">
                  Prefer crypto wallet registration?
                </p>
              </div>
              <Link 
                to="/register"
                className="w-full inline-flex items-center justify-center px-6 py-3 bg-white border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:border-slate-400 hover:bg-slate-50 transition-all duration-300"
              >
                <span className="text-2xl mr-3">👻</span>
                Use Phantom Wallet Instead
              </Link>
            </div>

            {/* Sign In Link */}
            <div className="text-center mt-6">
              <p className="text-slate-600 mb-4 font-medium">
                Already have an account?
              </p>
              <Link 
                to="/email-login"
                className="inline-flex items-center justify-center px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-300 transform hover:-translate-y-1"
              >
                Sign In with Email
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailRegisterPage; 