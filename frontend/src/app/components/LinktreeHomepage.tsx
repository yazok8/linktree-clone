"use client";

import {
  ArrowRight,
  BarChart3,
  Check,
  Globe,
  Smartphone,
  Star,
  Zap
} from 'lucide-react';
import React, { useState } from 'react';

interface LinktreeHomepageProps {
  onSignUp: (data?: { email?: string }) => void;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
}

const LinktreeHomepage: React.FC<LinktreeHomepageProps> = ({ onSignUp }) => {

  const [email, setEmail] = useState<string>('');

  const features: Feature[] = [
    {
      icon: <Globe className="w-6 h-6" />,
      title: "One link for everything",
      description: "Share all your content with a single, customizable link"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile optimized",
      description: "Beautiful, responsive design that works on any device"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Track your clicks",
      description: "Get insights on how your audience engages with your content"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning fast",
      description: "Super quick setup - be live in under 2 minutes"
    }
  ];

  const testimonials: Testimonial[] = [
    {
      name: "Sarah Chen",
      role: "Content Creator",
      content: "This has completely transformed how I share my content. So much easier than managing multiple bio links!",
      avatar: "SC"
    },
    {
      name: "Marcus Rodriguez",
      role: "Small Business Owner",
      content: "Perfect for my business. One link that connects customers to everything they need.",
      avatar: "MR"
    },
    {
      name: "Emily Johnson",
      role: "Influencer",
      content: "Love the analytics! I can see exactly what my followers are interested in.",
      avatar: "EJ"
    }
  ];

  const handleEmailSignup = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    if (email) {
      onSignUp({ email });
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                One link to
                <span className="bg-gradient-to-r from-green-500 to-blue-600 bg-clip-text text-transparent"> rule them all</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Connect your audience to all of your content with one simple link. Perfect for social media bios, email signatures, and more.
              </p>
              
              <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left lg:mx-0">
                <div className="mt-3 sm:flex">
                  <div className="min-w-0 flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <button
                      onClick={handleEmailSignup}
                      className="block w-full px-8 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center"
                    >
                      Get started free
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </button>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">
                  Free forever. No credit card required.
                </p>
              </div>

              <div className="mt-8 flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  Setup in 2 minutes
                </div>
                <div className="flex items-center">
                  <Check className="w-5 h-5 text-green-500 mr-2" />
                  No coding required
                </div>
              </div>
            </div>

            <div className="mt-12 relative sm:max-w-lg sm:mx-auto lg:mt-0 lg:max-w-none lg:mx-0 lg:col-span-6 lg:flex lg:items-center">
              {/* Phone Mockup */}
              <div className="relative mx-auto w-80">
                <div className="relative bg-gray-900 rounded-3xl p-2 shadow-2xl">
                  <div className="bg-white rounded-3xl overflow-hidden">
                    {/* Phone Header */}
                    <div className="h-6 bg-gray-50 flex items-center justify-center">
                      <div className="w-20 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    
                    {/* Phone Content */}
                    <div className="bg-gradient-to-br from-purple-400 to-pink-400 p-6 min-h-[500px]">
                      <div className="text-center">
                        <div className="w-20 h-20 bg-white rounded-full mx-auto mb-4 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-xl">JD</span>
                          </div>
                        </div>
                        <h3 className="text-white font-bold text-lg">@johndoe</h3>
                        <p className="text-white/80 text-sm mb-6">Content Creator & Entrepreneur</p>
                        
                        <div className="space-y-3">
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="font-semibold text-gray-800">📱 My Latest App</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="font-semibold text-gray-800">🎥 YouTube Channel</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="font-semibold text-gray-800">📧 Newsletter</div>
                          </div>
                          <div className="bg-white rounded-lg p-4 shadow-sm">
                            <div className="font-semibold text-gray-800">🛍️ Online Store</div>
                          </div>
                        </div>

                        <div className="mt-6 text-center">
                          <p className="text-white/60 text-xs">Made with LinkHub</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow
            </h2>
            <p className="text-xl text-gray-600 mb-16 max-w-3xl mx-auto">
              Powerful features that help you connect with your audience and track your success
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-lg mb-4">
                  <div className="text-green-600">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">
              Trusted by creators worldwide
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">1M+</div>
              <div className="text-xl text-gray-600">Links created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">500K+</div>
              <div className="text-xl text-gray-600">Active users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-green-600 mb-2">50M+</div>
              <div className="text-xl text-gray-600">Clicks tracked</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What creators are saying
            </h2>
            <p className="text-xl text-gray-600 mb-16">
              Join thousands of satisfied users
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">
                  &quot;{testimonial.content}&quot;
                </p>
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-white font-semibold text-sm">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-500 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-500 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of creators who trust LinkHub to connect with their audience
          </p>
          <button
            onClick={() => onSignUp({ email })}
            className="bg-white text-green-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors inline-flex items-center"
          >
            Start for free today
            <ArrowRight className="ml-2 w-5 h-5" />
          </button>
          <p className="text-white/80 text-sm mt-4">
            No credit card required • Setup in under 2 minutes
          </p>
        </div>
      </section>
    </div>
  );
};

export default LinktreeHomepage;