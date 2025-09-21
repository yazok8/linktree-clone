'use client';

import { useAuth } from '@/context/AuthContext';
import { CreateLinkData, Link } from '@/types';
import { authAPI, linksAPI } from '@/utils/api';
import { BarChart3, Brush, Copy, ExternalLink, Eye, GripVertical, Plus, Settings, Share2, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// This is the main component exported for the page.
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return <Dashboard />;
}

function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const { user, logout } = useAuth();
  const [newLink, setNewLink] = useState<CreateLinkData>({ 
    title: '', 
    url: '', 
    description: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingLinks, setLoadingLinks] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // Profile editing states
  const [isEditingDisplayName, setIsEditingDisplayName] = useState<boolean>(false);
  const [isEditingBio, setIsEditingBio] = useState<boolean>(false);
  const [displayName, setDisplayName] = useState<string>(user?.display_name || user?.username || '');
  const [bio, setBio] = useState<string>(user?.bio || 'Welcome to my page!');
  const [tempDisplayName, setTempDisplayName] = useState<string>('');
  const [tempBio, setTempBio] = useState<string>('');

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const linksRes = await linksAPI.getLinks();
        setLinks(linksRes.data);
      } catch (err) {
        console.error('Error fetching links:', err);
        setError('Failed to load links. Please refresh the page.');
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinks();
  }, []);

  // Initialize profile data when user loads
  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || user.first_name + ' ' + user.last_name || user.username || '');
      setBio(user.bio || 'Welcome to my page!');
    }
  }, [user]);

  const handleCreateLink = async (): Promise<void> => {
    if (isSubmitting || !newLink.title || !newLink.url) return;

    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await linksAPI.createLink(newLink);
      setLinks([...links, response.data]);
      setNewLink({ title: '', url: '', description: '' });
      setShowAddForm(false);
    } catch (err: any) {
      console.error('Error creating link:', err);
      
      if (err.response?.status === 403) {
        setError('Permission denied. Please log in again.');
      } else if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        logout();
      } else if (err.response?.status === 400) {
        setError('Invalid link data. Please check your inputs.');
      } else {
        setError('Failed to create link. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: number): Promise<void> => {
    try {
      await linksAPI.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
    } catch (err: any) {
      console.error('Error deleting link:', err);
      if (err.response?.status === 403) {
        setError('Permission denied. Unable to delete link.');
      } else {
        setError('Failed to delete link. Please try again.');
      }
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CreateLinkData
  ): void => {
    setNewLink({ ...newLink, [field]: e.target.value });
  };

  const copyProfileUrl = () => {
    const url = `${window.location.origin}/${user?.username}`;
    navigator.clipboard.writeText(url);
  };

  // Unified function to handle showing the add form
  const handleShowAddForm = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddForm(!showAddForm);
    setError(''); // Clear any existing errors
  };

  // Profile editing functions
  const startEditingDisplayName = () => {
    setTempDisplayName(displayName);
    setIsEditingDisplayName(true);
  };

  const startEditingBio = () => {
    setTempBio(bio);
    setIsEditingBio(true);
  };

  const saveDisplayName = async () => {
    if (!tempDisplayName.trim()) return;
    
    try {
      await authAPI.updateProfile({ display_name: tempDisplayName.trim() });
      setDisplayName(tempDisplayName.trim());
      setIsEditingDisplayName(false);
    } catch (err) {
      console.error('Error updating display name:', err);
      setError('Failed to update display name.');
      // Reset to original value on error
      setTempDisplayName(displayName);
    }
  };

  const saveBio = async () => {
    try {
      await authAPI.updateProfile({ bio: tempBio });
      setBio(tempBio);
      setIsEditingBio(false);
    } catch (err) {
      console.error('Error updating bio:', err);
      setError('Failed to update bio.');
      // Reset to original value on error
      setTempBio(bio);
    }
  };

  const cancelEditingDisplayName = () => {
    setTempDisplayName('');
    setIsEditingDisplayName(false);
  };

  const cancelEditingBio = () => {
    setTempBio('');
    setIsEditingBio(false);
  };

  const handleDisplayNameKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveDisplayName();
    } else if (e.key === 'Escape') {
      cancelEditingDisplayName();
    }
  };

  const handleBioKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveBio();
    } else if (e.key === 'Escape') {
      cancelEditingBio();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">My Linktree</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors">
              <Brush className="w-4 h-4" />
              <span className="hidden sm:inline">Design</span>
            </button>
            
            <button 
              onClick={copyProfileUrl}
              className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <button 
              onClick={logout}
              className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Link Management */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Collection and View Archive */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleShowAddForm}
                className="flex items-center justify-center space-x-2 px-6 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add link</span>
              </button>
              
              <button className="flex items-center justify-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
                <Eye className="w-5 h-5" />
                <span>View archive</span>
              </button>
            </div>

            {/* Add Link Form */}
            {showAddForm && (
              <div className="bg-white border border-gray-200 rounded-lg p-6 text-black">
                <h3 className="text-lg font-semibold mb-4">Add New Link</h3>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Title"
                    value={newLink.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="url"
                    placeholder="URL"
                    value={newLink.url}   
                    onChange={(e) => handleInputChange(e, 'url')}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={newLink.description || ''}
                    onChange={(e) => handleInputChange(e, 'description')}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex space-x-3">
                    <button 
                      type="button"
                      onClick={handleCreateLink}
                      disabled={isSubmitting || !newLink.title || !newLink.url}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Adding...' : 'Add Link'}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setShowAddForm(false)}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Links List */}
            <div className="space-y-4">
              {loadingLinks ? (
                <div className="flex justify-center py-8">
                  <div className="text-gray-500">Loading links...</div>
                </div>
              ) : links.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <button 
                    className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                    onClick={handleShowAddForm}
                  >
                    <Plus className="w-8 h-8 text-gray-400" />
                  </button>
                  <p>No links yet. Add your first link above!</p>
                </div>
              ) : (
                links.map((link) => (
                  <div key={link.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    {/* Link Header */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{link.title}</h3>
                            <p className="text-sm text-gray-500 truncate max-w-md">{link.url}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={link.is_active} 
                              className="sr-only peer"
                              readOnly
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    {/* Link Footer */}
                    <div className="border-t border-gray-100 px-4 py-3 bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <Copy className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                            <BarChart3 className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-gray-500">0 clicks</span>
                        </div>
                        
                        <button 
                          onClick={() => handleDeleteLink(link.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Mobile Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold mb-4 text-center">Preview</h3>
                
                {/* Phone Frame */}
                <div className="mx-auto" style={{ width: '280px' }}>
                  <div className="relative bg-gradient-to-br from-pink-200 to-purple-300 rounded-3xl p-6 shadow-xl">
                    {/* Profile Section */}
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3"></div>
                      
                      {/* Editable Display Name */}
                      {isEditingDisplayName ? (
                        <div className="mb-2">
                          <input
                            type="text"
                            value={tempDisplayName}
                            onChange={(e) => setTempDisplayName(e.target.value)}
                            onKeyDown={handleDisplayNameKeyPress}
                            onBlur={saveDisplayName}
                            className="font-semibold text-gray-800 text-center bg-white/90 border border-gray-300 rounded px-2 py-1 text-sm w-full max-w-[200px]"
                            autoFocus
                          />
                        </div>
                      ) : (
                        <h4 
                          className="font-semibold text-gray-800 mb-1 cursor-pointer hover:bg-white/20 rounded px-2 py-1 transition-colors"
                          onClick={startEditingDisplayName}
                          title="Click to edit display name"
                        >
                          {displayName}
                        </h4>
                      )}
                      
                      {/* Editable Bio */}
                      {isEditingBio ? (
                        <div>
                          <textarea
                            value={tempBio}
                            onChange={(e) => setTempBio(e.target.value)}
                            onKeyDown={handleBioKeyPress}
                            onBlur={saveBio}
                            className="text-sm text-gray-600 text-center bg-white/90 border border-gray-300 rounded px-2 py-1 w-full resize-none"
                            rows={2}
                            autoFocus
                          />
                        </div>
                      ) : (
                        <p 
                          className="text-sm text-gray-600 cursor-pointer hover:bg-white/20 rounded px-2 py-1 transition-colors"
                          onClick={startEditingBio}
                          title="Click to edit bio"
                        >
                          {bio}
                        </p>
                      )}
                    </div>
                    
                    {/* Links Preview */}
                    <div className="space-y-3">
                      {links.filter(link => link.is_active).slice(0, 5).map((link) => (
                        <div key={link.id} className="bg-white rounded-lg p-3 shadow-sm">
                          <div className="text-center">
                            <div className="font-medium text-gray-800 text-sm truncate">
                              {link.title}
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {links.filter(link => link.is_active).length === 0 && (
                        <div className="text-center text-gray-500 text-sm py-8">
                          Your links will appear here
                        </div>
                      )}
                    </div>
                    
                    {/* Footer */}
                    <div className="text-center mt-6 pt-4 border-t border-white/20">
                      <p className="text-xs text-gray-600">
                        ⭐ Join {user?.username} on Linktree
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="mt-6 space-y-3">
                  <a 
                    href={`/${user?.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full text-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Live Page
                  </a>
                  <button 
                    onClick={copyProfileUrl}
                    className="block w-full text-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}