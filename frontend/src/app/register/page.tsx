'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { register } = useAuth();
  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Full Name validation
    if (!fullName.trim()) newErrors.fullName = 'Full name is required.';
    else if (fullName.trim().split(' ').length < 2) newErrors.fullName = 'Please enter both first and last name.';
    
    // Username validation
    if (!username.trim()) newErrors.username = 'Username is required.';
    
    // Email validation
    if (!email) newErrors.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email address is invalid.';
    
    // Password validation
    if (!password) newErrors.password = 'Password is required.';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    else if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/.test(password)) {
      newErrors.password = 'Password needs one uppercase, one lowercase, one number, and one special character.';
    }

    // Confirm Password validation
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts.slice(0, -1).join(' ') || nameParts[0];
    const lastName = nameParts.slice(-1).join(' ') || '';

    try {
      await register({
        username,
        email,
        password1: password,        
        password2: confirmPassword,
        first_name: firstName,
        last_name: lastName
      });
      // The register function in AuthContext will handle redirection on success
    } catch (err: any) {
      // Handle backend errors (e.g., username already exists)
      const backendErrors = err.response?.data || {};
      const newErrors: Record<string, string> = {};
      
      for (const key in backendErrors) {
        if (Array.isArray(backendErrors[key])) {
          newErrors[key] = backendErrors[key].join(' ');
        } else {
          newErrors[key] = String(backendErrors[key]);
        }
      }
      
      // Map backend field names to frontend field names for display
      if (newErrors.password1) {
        newErrors.password = newErrors.password1;
        delete newErrors.password1;
      }
      if (newErrors.password2) {
        newErrors.confirmPassword = newErrors.password2;
        delete newErrors.password2;
      }
      
      setErrors(newErrors);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 text-black">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create your account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border rounded-md"
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 px-4 bg-blue-600 text-white rounded-md disabled:opacity-50">
            {isSubmitting ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        <p className="text-center text-sm">
          Already have an account? <Link href="/login" className="text-blue-600">Log in</Link>
        </p>
      </div>
    </div>
  );
}