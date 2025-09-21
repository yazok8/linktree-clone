import { useAuth } from '@/context/AuthContext';
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, X } from 'lucide-react';
import React, { useState } from 'react';

interface SignupModalProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface SignupData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password1: string;
  password2: string;
}

const SignupModal: React.FC<SignupModalProps> = ({ onClose, onSwitchToLogin }) => {
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  const [signupData, setSignupData] = useState<SignupData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password1: '',
    password2: ''
  });

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /\W/.test(password)
    };
    
    Object.values(checks).forEach(check => {
      if (check) strength++;
    });
    
    return { strength, checks };
  };

  const passwordStrength = getPasswordStrength(signupData.password1);

  const handleSignupSubmit = async (): Promise<void> => {
    // Basic validation
    if (!signupData.username || !signupData.email || !signupData.first_name || !signupData.last_name || !signupData.password1 || !signupData.password2) {
      setError('Please fill in all fields');
      return;
    }

    if (signupData.password1 !== signupData.password2) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password1.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Enhanced password validation (matching your register page)
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(signupData.password1)) {
      setError('Password needs one uppercase, one lowercase, one number, and one special character');
      return;
    }

    // Email validation
    if (!/\S+@\S+\.\S+/.test(signupData.email)) {
      setError('Email address is invalid');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      await register(signupData);
      onClose();
    } catch (err: unknown) {
      console.error('Registration error:', err);
      
      // Type guard to check if error has the expected structure
      const isApiError = (error: unknown): error is { response?: { data?: Record<string, unknown> } } => {
        return typeof error === 'object' && error !== null && 'response' in error;
      };
      
      // Handle backend errors more comprehensively (matching your register page logic)
      const backendErrors = isApiError(err) ? (err.response?.data || {}) : {};
      const errorMessages: string[] = [];
      
      // Process all error fields
      for (const key in backendErrors) {
        let errorText = '';
        if (Array.isArray(backendErrors[key])) {
          errorText = backendErrors[key].join(' ');
        } else {
          errorText = String(backendErrors[key]);
        }
        
        // Map backend field names to user-friendly messages
        switch (key) {
          case 'username':
            errorMessages.push('Username is already taken');
            break;
          case 'email':
            errorMessages.push('Email is already registered');
            break;
          case 'password1':
            errorMessages.push(`Password: ${errorText}`);
            break;
          case 'password2':
            errorMessages.push(`Password confirmation: ${errorText}`);
            break;
          case 'first_name':
            errorMessages.push(`First name: ${errorText}`);
            break;
          case 'last_name':
            errorMessages.push(`Last name: ${errorText}`);
            break;
          case 'non_field_errors':
            errorMessages.push(errorText);
            break;
          default:
            errorMessages.push(`${key}: ${errorText}`);
        }
      }
      
      // Set the first error message or a generic one
      setError(errorMessages.length > 0 ? errorMessages[0] : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-600 mt-1">Join thousands of creators on LinkHub</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4 text-black">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={signupData.first_name}
                  onChange={(e) => setSignupData({...signupData, first_name: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={signupData.last_name}
                  onChange={(e) => setSignupData({...signupData, last_name: e.target.value})}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={signupData.username}
                  onChange={(e) => setSignupData({...signupData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Choose a username"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This will be your unique LinkHub URL: linkhub.com/{signupData.username || 'username'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.password1}
                  onChange={(e) => setSignupData({...signupData, password1: e.target.value})}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password strength indicator */}
              {signupData.password1 && passwordStrength && (
                <div className="mt-2">
                  <div className="flex space-x-1 mb-2">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`h-1 flex-1 rounded ${
                          level <= passwordStrength.strength
                            ? passwordStrength.strength <= 2
                              ? 'bg-red-400'
                              : passwordStrength.strength <= 3
                              ? 'bg-yellow-400'
                              : 'bg-green-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className={passwordStrength.checks.length ? 'text-green-600' : 'text-gray-400'}>
                      ✓ At least 8 characters
                    </div>
                    <div className={passwordStrength.checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ One uppercase letter
                    </div>
                    <div className={passwordStrength.checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
                      ✓ One lowercase letter
                    </div>
                    <div className={passwordStrength.checks.number ? 'text-green-600' : 'text-gray-400'}>
                      ✓ One number
                    </div>
                    <div className={passwordStrength.checks.special ? 'text-green-600' : 'text-gray-400'}>
                      ✓ One special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={signupData.password2}
                  onChange={(e) => setSignupData({...signupData, password2: e.target.value})}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    signupData.password2 && signupData.password1 !== signupData.password2
                      ? 'border-red-300 bg-red-50'
                      : signupData.password2 && signupData.password1 === signupData.password2
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300'
                  }`}
                  placeholder="Confirm your password"
                />
              </div>
              {signupData.password2 && (
                <p className={`text-xs mt-1 ${
                  signupData.password1 === signupData.password2 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {signupData.password1 === signupData.password2 ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </div>

            <div className="flex items-start">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-green-600 focus:ring-green-500 mt-1" 
                required 
              />
              <span className="ml-2 text-sm text-gray-600">
                I agree to the{' '}
                <a href="#" className="text-green-600 hover:text-green-700">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-green-600 hover:text-green-700">Privacy Policy</a>
              </span>
            </div>

            <button
              onClick={handleSignupSubmit}
              disabled={isLoading}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Switch Mode */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                onClick={onSwitchToLogin}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupModal;