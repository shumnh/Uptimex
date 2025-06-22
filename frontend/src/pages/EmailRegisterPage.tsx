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
        setEmailError('Invalid email format');
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
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Terminal Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ff00%22%20fill-opacity%3D%220.03%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Terminal Scanlines */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-green-500/20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6 py-12">
        <div className="max-w-5xl w-full">
          {/* Terminal Back Button */}
          <Link 
            to="/"
            className="inline-flex items-center text-green-400 hover:text-green-300 mb-8 transition-colors group font-mono text-sm"
          >
            <span className="mr-2 text-green-500">$</span>
            <span className="animate-pulse mr-1">cd</span>
            <span className="group-hover:animate-pulse">..</span>
            <span className="ml-2 animate-pulse">←</span>
          </Link>

          {/* Terminal Window */}
          <div className="bg-gray-900 border border-green-500/30 rounded-lg shadow-2xl shadow-green-500/20">
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-3 rounded-t-lg border-b border-green-500/30 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-green-400 font-mono text-sm">uptimex@terminal:~/auth/register</span>
              </div>
            </div>
            
            {/* Terminal Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Column - Terminal Info */}
                <div>
                  <div className="text-green-400 font-mono mb-4">
                    <span className="text-green-500">$</span> ./register.sh --type=email --role=website_owner
                  </div>
                  <div className="text-green-300 font-mono text-sm mb-2">
                    [INFO] Initializing user registration module...
                  </div>
                  <div className="text-green-300 font-mono text-sm mb-4">
                    [INFO] Email registration protocol activated
                  </div>
                  <div className="border-l-2 border-green-500 pl-4 mb-6">
                    <h1 className="text-xl font-mono text-green-400 mb-2">
                      USER_REGISTRATION
                    </h1>
                    <p className="text-green-300 font-mono text-sm">
                      &gt; Create new website owner account
                    </p>
                  </div>
                  <div className="bg-green-900/20 border border-green-500/30 rounded px-4 py-2 mb-4">
                    <div className="text-green-400 font-mono text-xs flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                      STATUS: READY • ENCRYPTION: AES-256 • VALIDATION: ACTIVE
                    </div>
                  </div>

                  {/* Alternative Options */}
                  <div className="mt-8 pt-6 border-t border-green-500/30">
                    <div className="text-green-400 font-mono text-sm mb-4">
                      [INFO] Alternative registration methods:
                    </div>
                    <Link 
                      to="/register"
                      className="block w-full bg-gray-800/50 border border-gray-600 text-gray-300 font-mono py-2 px-4 rounded hover:bg-gray-800 transition-all duration-300 mb-3 text-sm"
                    >
                      <span className="text-gray-500">$</span> ./wallet_register.sh --phantom
                    </Link>
                    
                    <div className="text-green-400 font-mono text-sm mb-2">
                      [INFO] Already have an account? Login:
                    </div>
                    <Link 
                      to="/email-login"
                      className="block w-full bg-blue-900/30 border border-blue-500 text-blue-400 font-mono py-2 px-4 rounded hover:bg-blue-900/50 transition-all duration-300 text-sm"
                    >
                      <span className="text-blue-500">$</span> ./login.sh --type=email --role=website_owner
                    </Link>
                  </div>
                </div>

                {/* Right Column - Registration Form */}
                <div>
                  {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-6">
                      <div className="text-red-400 font-mono text-sm">
                        <span className="text-red-500">[ERROR]</span> {error}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleRegistration} className="space-y-6">
                {/* Name Field */}
                <div className="space-y-2">
                  <div className="text-green-400 font-mono text-sm">
                    <span className="text-green-500">$</span> Enter full name:
                  </div>
                  <div className="relative">
                    <span className="text-green-500 font-mono absolute left-3 top-1/2 transform -translate-y-1/2 z-10">&gt;</span>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 bg-black border border-green-500/30 rounded font-mono text-green-400 focus:outline-none focus:ring-1 focus:ring-green-500 transition-all duration-300"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-2">
                  <div className="text-green-400 font-mono text-sm">
                    <span className="text-green-500">$</span> Enter email:
                  </div>
                  <div className="relative">
                    <span className="text-green-500 font-mono absolute left-3 top-1/2 transform -translate-y-1/2 z-10">&gt;</span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-4 py-3 bg-black border rounded font-mono text-green-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        emailError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : formData.email && validateEmail(formData.email)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-green-500/30 focus:ring-green-500'
                      }`}
                      placeholder="user@example.com"
                      required
                    />
                    {formData.email && validateEmail(formData.email) && (
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500 font-mono">✓</span>
                    )}
                  </div>
                  {emailError && (
                    <div className="text-red-400 font-mono text-xs">
                      [ERROR] {emailError}
                    </div>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="text-green-400 font-mono text-sm">
                    <span className="text-green-500">$</span> Create password:
                  </div>
                  <div className="relative">
                    <span className="text-green-500 font-mono absolute left-3 top-1/2 transform -translate-y-1/2 z-10">&gt;</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-12 py-3 bg-black border rounded font-mono text-green-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        formData.password && isPasswordValid(passwordValidation)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-green-500/30 focus:ring-green-500'
                      }`}
                      placeholder="Create secure password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 font-mono text-xs"
                    >
                      {showPassword ? '[HIDE]' : '[SHOW]'}
                    </button>
                  </div>

                  {/* Password Validation */}
                  {formData.password && (
                    <div className="mt-3 space-y-1">
                      <div className="text-green-400 font-mono text-xs">
                        [INFO] Password requirements:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        <div className={passwordValidation.minLength ? 'text-green-400' : 'text-gray-500'}>
                          {passwordValidation.minLength ? '✓' : '✗'} 7+ chars
                        </div>
                        <div className={passwordValidation.hasUppercase ? 'text-green-400' : 'text-gray-500'}>
                          {passwordValidation.hasUppercase ? '✓' : '✗'} A-Z
                        </div>
                        <div className={passwordValidation.hasLowercase ? 'text-green-400' : 'text-gray-500'}>
                          {passwordValidation.hasLowercase ? '✓' : '✗'} a-z
                        </div>
                        <div className={passwordValidation.hasSpecialChar ? 'text-green-400' : 'text-gray-500'}>
                          {passwordValidation.hasSpecialChar ? '✓' : '✗'} !@#$
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <div className="text-green-400 font-mono text-sm">
                    <span className="text-green-500">$</span> Confirm password:
                  </div>
                  <div className="relative">
                    <span className="text-green-500 font-mono absolute left-3 top-1/2 transform -translate-y-1/2 z-10">&gt;</span>
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full pl-8 pr-12 py-3 bg-black border rounded font-mono text-green-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        formData.confirmPassword && formData.password === formData.confirmPassword
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-green-500/30 focus:ring-green-500'
                      }`}
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400 hover:text-green-300 font-mono text-xs"
                    >
                      {showConfirmPassword ? '[HIDE]' : '[SHOW]'}
                    </button>
                  </div>
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <div className="text-red-400 font-mono text-xs">
                      [ERROR] Passwords do not match
                    </div>
                  )}
                </div>

                {/* Register Button */}
                <button
                  type="submit"
                  disabled={isRegistering || !formData.name || !formData.email || !formData.password || !formData.confirmPassword || !validateEmail(formData.email) || !isPasswordValid(passwordValidation) || formData.password !== formData.confirmPassword}
                  className="w-full bg-green-900/30 border border-green-500 text-green-400 font-mono py-3 px-4 rounded hover:bg-green-900/50 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isRegistering ? (
                    <span>
                      <span className="animate-pulse">[CREATING ACCOUNT...]</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-green-500">$</span> ./create_user.sh --execute
                    </span>
                  )}
                </button>
              </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EmailRegisterPage; 