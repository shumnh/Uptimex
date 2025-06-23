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
    <div className="min-h-screen bg-black relative overflow-hidden font-mono">
      {/* Terminal Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300ff00%22%20fill-opacity%3D%220.03%22%3E%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%221%22%20height%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-60"></div>
      
      {/* Terminal Scanlines - Blue/Green Mix */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 via-green-500/3 to-transparent animate-pulse"></div>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500/20 to-green-500/20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-green-500/20 to-blue-500/20 animate-pulse"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl w-full">
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
          <div className="bg-gray-900 border border-blue-500/30 rounded-lg shadow-2xl shadow-blue-500/20">
            {/* Terminal Header */}
            <div className="bg-gray-800 px-4 py-3 rounded-t-lg border-b border-blue-500/30 flex items-center">
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              </div>
              <div className="flex-1 text-center">
                <span className="text-blue-400 font-mono text-sm">uptimex@terminal:~/auth/login</span>
              </div>
            </div>
            
            {/* Terminal Content */}
            <div className="p-8">
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column - Terminal Info */}
                <div>
                  <div className="text-blue-400 font-mono mb-4">
                    <span className="text-green-500">$</span> ./login.sh --type=email --role=website_owner
                  </div>
                  <div className="text-blue-300 font-mono text-sm mb-2">
                    [INFO] Initializing email authentication module...
                  </div>
                  <div className="text-green-300 font-mono text-sm mb-4">
                    [INFO] Secure login protocol activated
                  </div>
                  <div className="border-l-2 border-blue-500 pl-4 mb-6">
                    <h1 className="text-xl font-mono text-blue-400 mb-2">
                      AUTHENTICATION_REQUIRED
                    </h1>
                    <p className="text-blue-300 font-mono text-sm">
                      &gt; Enter credentials to access website owner portal
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-blue-900/20 to-green-900/20 border border-blue-500/30 rounded px-4 py-2 mb-4">
                    <div className="text-blue-400 font-mono text-xs flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                      STATUS: READY • ENCRYPTION: AES-256 • PROTOCOL: HTTPS
                    </div>
                  </div>

                  {/* Alternative Options */}
                  <div className="mt-8 pt-6 border-t border-green-500/30">
                    <div className="text-green-400 font-mono text-sm mb-4">
                      [INFO] Alternative authentication methods:
                    </div>
                    <Link 
                      to="/login"
                      className="block w-full bg-gray-800/50 border border-gray-600 text-gray-300 font-mono py-2 px-4 rounded hover:bg-gray-800 transition-all duration-300 mb-3 text-sm"
                    >
                      <span className="text-gray-500">$</span> ./wallet_auth.sh --phantom
                    </Link>
                    
                    <div className="text-green-400 font-mono text-sm mb-2">
                      [INFO] No account? Register new user:
                    </div>
                    <Link 
                      to="/email-register"
                      className="block w-full bg-blue-900/30 border border-blue-500 text-blue-400 font-mono py-2 px-4 rounded hover:bg-blue-900/50 transition-all duration-300 text-sm"
                    >
                      <span className="text-blue-500">$</span> ./register.sh --type=email --role=website_owner
                    </Link>
                  </div>
                </div>

                {/* Right Column - Login Form */}
                <div>
                  {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded p-4 mb-6">
                      <div className="text-red-400 font-mono text-sm">
                        <span className="text-red-500">[ERROR]</span> {error}
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="space-y-6">
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
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full pl-8 pr-4 py-3 bg-black border rounded font-mono text-green-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        emailError 
                          ? 'border-red-500 focus:ring-red-500' 
                          : email && validateEmail(email)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-green-500/30 focus:ring-green-500'
                      }`}
                      placeholder="user@example.com"
                      required
                    />
                    {email && validateEmail(email) && (
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
                    <span className="text-green-500">$</span> Enter password:
                  </div>
                  <div className="relative">
                    <span className="text-green-500 font-mono absolute left-3 top-1/2 transform -translate-y-1/2 z-10">&gt;</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={handlePasswordChange}
                      className={`w-full pl-8 pr-12 py-3 bg-black border rounded font-mono text-green-400 focus:outline-none focus:ring-1 transition-all duration-300 ${
                        password && isPasswordValid(passwordValidation)
                          ? 'border-green-500 focus:ring-green-500'
                          : 'border-green-500/30 focus:ring-green-500'
                      }`}
                      placeholder="Enter secure password"
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
                  {password && (
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

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={isLoggingIn || !email || !password || !validateEmail(email) || !isPasswordValid(passwordValidation)}
                  className="w-full bg-green-900/30 border border-green-500 text-green-400 font-mono py-3 px-4 rounded hover:bg-green-900/50 focus:outline-none focus:ring-1 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                >
                  {isLoggingIn ? (
                    <span>
                      <span className="animate-pulse">[AUTHENTICATING...]</span>
                    </span>
                  ) : (
                    <span>
                      <span className="text-green-500">$</span> ./authenticate.sh --execute
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

export default EmailLoginPage;