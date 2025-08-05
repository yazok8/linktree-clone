'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { linksAPI, publicAPI } from '@/utils/api';
import { UserProfile, Link } from '@/types';
import { Instagram, Music, ExternalLink, MoreHorizontal } from 'lucide-react';

export default function PublicProfile() {
  const params = useParams();
  const username = params.username as string;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (username) {
      fetchProfileData();
    }
  }, [username]);

  const fetchProfileData = async (): Promise<void> => {
    try {
      const [profileRes, linksRes] = await Promise.all([
        publicAPI.getProfile(username),
        linksAPI.getPublicLinks(username)
      ]);
      setProfile(profileRes.data);
      setLinks(linksRes.data);
    } catch (err) {
      setError('Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const getSocialIcon = (url: string) => {
    if (url.includes('instagram.com')) return <Instagram className="w-8 h-8" />;
    if (url.includes('tiktok.com')) return <Music className="w-8 h-8" />;
    return <ExternalLink className="w-6 h-6" />;
  };

  const isSocialMedia = (url: string) => {
    return url.includes('instagram.com') || url.includes('tiktok.com') || url.includes('twitter.com') || url.includes('facebook.com');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-pink-300 to-purple-400">
        <div className="text-lg text-gray-700">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-200 via-pink-300 to-purple-400">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  // Separate social media links from regular links
  const socialLinks = links.filter(link => isSocialMedia(link.url));
  const regularLinks = links.filter(link => !isSocialMedia(link.url));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      {/* Mobile Phone Frame */}
      <div className="relative">
        {/* Phone Outer Frame */}
        <div className="w-80 h-[700px] bg-black rounded-[3rem] p-2 shadow-2xl">
          {/* Phone Screen */}
          <div className="w-full h-full bg-gradient-to-br from-pink-200 via-pink-300 to-purple-400 rounded-[2.5rem] relative overflow-hidden">
            
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-center">
              <div className="w-32 h-6 bg-black rounded-full"></div>
            </div>

            {/* Star Icon Top Left */}
            <div className="absolute top-12 left-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg z-10">
              <span className="text-gray-800 text-lg">✱</span>
            </div>

            {/* Scrollable Content */}
            <div className="pt-16 px-6 pb-8 h-full overflow-y-auto">
              
              {/* Profile Header */}
              <div className="text-center mb-8">
                {/* Profile Picture */}
                <div className="mb-6">
                  {profile?.profile_picture ? (
                    <img 
                      src={profile.profile_picture} 
                      alt={profile.username}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white mx-auto border-4 border-white shadow-lg flex items-center justify-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {profile?.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Name */}
                <h1 className="text-xl font-bold text-gray-800 mb-4">
                  {profile?.username || 'User'}
                </h1>

                {/* Bio */}
                {profile?.bio && (
                  <p className="text-gray-700 text-sm leading-relaxed mb-6 px-2">
                    {profile.bio}
                  </p>
                )}

                {/* Social Media Icons */}
                {socialLinks.length > 0 && (
                  <div className="flex justify-center space-x-6 mb-8">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-gray-600 transition-colors"
                      >
                        {getSocialIcon(link.url)}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Links */}
              <div className="space-y-4 pb-6">
                {regularLinks.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    {/* 3D Card with Shadow Effect */}
                    <div className="relative">
                      {/* Shadow/Border Layer */}
                      <div className="absolute inset-0 bg-black rounded-3xl transform translate-x-1 translate-y-1"></div>
                      
                      {/* Main Card */}
                      <div className="relative bg-white rounded-3xl border-4 border-black hover:transform hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform duration-200">
                        <div className="px-6 py-5 flex items-center">
                          
                          {/* Left Icon/Thumbnail (if applicable) */}
                          {link.url.includes('forms.gle') && (
                            <div className="flex-shrink-0 mr-4">
                              <div className="w-12 h-12 bg-gray-400 rounded-lg"></div>
                            </div>
                          )}
                          
                          {/* Content */}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-700 text-base leading-tight">
                              {link.title}
                            </h3>
                            {link.description && (
                              <p className="text-gray-500 text-sm mt-1">
                                {link.description}
                              </p>
                            )}
                          </div>
                          
                          {/* Three Dots Menu */}
                          <div className="flex-shrink-0 ml-4">
                            <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </a>
                ))}

                {regularLinks.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-700 text-sm">No links to display</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="text-center pt-4">
                <div className="inline-flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2 mb-4">
                  <span className="text-white text-sm">⭐</span>
                  <span className="text-white text-sm font-medium">
                    Join {profile?.username} on Linktree
                  </span>
                </div>
                
                <p className="text-gray-600 text-xs">
                  Report • Privacy
                </p>
              </div>
            </div>

            {/* Home Indicator */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-black bg-opacity-30 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}