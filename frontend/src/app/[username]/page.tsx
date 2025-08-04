'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { linksAPI, publicAPI } from '@/utils/api';
import { UserProfile, Link } from '@/types';
import Image from 'next/image';

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex justify-center items-center p-5"
      style={{ 
        backgroundColor: profile?.background_color || '#ffffff',
        color: profile?.text_color || '#000000'
      }}
    >
      <div className="max-w-md w-full text-center">
        {profile?.profile_picture && (
          <div className="mb-5">
            <Image 
              src={profile.profile_picture} 
              alt={profile.username}
              width={100}
              height={100}
              className="w-25 h-25 rounded-full object-cover mx-auto"
            />
          </div>
        )}
        <h1 className="text-2xl font-bold mb-2">@{profile?.username}</h1>
        {profile?.bio && <p className="text-base mb-8 opacity-80">{profile.bio}</p>}
        
        <div className="flex flex-col gap-4">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg no-underline text-inherit transition-all duration-300 hover:bg-opacity-20 hover:-translate-y-0.5"
            >
              <div>
                <h3 className="margin-0 mb-1 text-base font-semibold">{link.title}</h3>
                {link.description && <p className="margin-0 text-sm opacity-80">{link.description}</p>}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}