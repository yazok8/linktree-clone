'use client';

import { useState, useEffect } from 'react';
import { linksAPI } from '@/utils/api';
import { UserProfile, Link, CreateLinkData } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// This is the main component exported for the page.
// It acts as a wrapper to protect the dashboard content.
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // This effect hook handles the authentication check and redirection.
  useEffect(() => {
    // If the authentication state is no longer loading and there is no user,
    // redirect to the login page.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // While the auth state is loading or if there's no user, show a loading indicator.
  // This prevents a brief flash of the dashboard for unauthenticated users.
  if (loading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If the user is authenticated, render the actual dashboard UI.
  return <Dashboard />;
}

// This is the actual UI for the dashboard.
// It only renders when the user is confirmed to be logged in.
function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const { user, logout } = useAuth(); // Get user data and logout function from the global context
  const [newLink, setNewLink] = useState<CreateLinkData>({ 
    title: '', 
    url: '', 
    description: '' 
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loadingLinks, setLoadingLinks] = useState<boolean>(true);

  useEffect(() => {
    // The user profile is already available from the context.
    // We only need to fetch the data specific to this page, which is the links.
    const fetchLinks = async () => {
      try {
        const linksRes = await linksAPI.getLinks();
        setLinks(linksRes.data);
      } catch (err) {
        console.error('Error fetching links:', err);
      } finally {
        setLoadingLinks(false);
      }
    };
    fetchLinks();
  }, []);

  const handleCreateLink = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await linksAPI.createLink(newLink);
      setLinks([...links, response.data]);
      setNewLink({ title: '', url: '', description: '' });
    } catch (err) {
      console.error('Error creating link:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteLink = async (id: number): Promise<void> => {
    try {
      await linksAPI.deleteLink(id);
      setLinks(links.filter(link => link.id !== id));
    } catch (err) {
      console.error('Error deleting link:', err);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: keyof CreateLinkData
  ): void => {
    setNewLink({ ...newLink, [field]: e.target.value });
  };

  if (loadingLinks) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading links...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-5">
      <header className="flex flex-wrap justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Links</h1>
          <p className="text-gray-500">Welcome, {user?.username}!</p>
        </div>
        <div className="flex items-center gap-4">
          <a 
            href={`/${user?.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2 bg-blue-600 text-white no-underline rounded-md hover:bg-blue-700 transition-colors"
          >
            View Public Profile
          </a>
          <button 
            onClick={logout}
            className="px-5 py-2 bg-red-500 text-white no-underline rounded-md hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <form onSubmit={handleCreateLink} className="bg-gray-50 p-5 rounded-lg mb-8 text-black">
        <h2 className="text-xl font-semibold mb-4">Add New Link</h2>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={newLink.title}
            onChange={(e) => handleInputChange(e, 'title')}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="url"
            placeholder="URL"
            value={newLink.url}   
            onChange={(e) => handleInputChange(e, 'url')}
            required
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Description (optional)"
            value={newLink.description || ''}
            onChange={(e) => handleInputChange(e, 'description')}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-5 py-2 bg-green-600 text-black border-none rounded-md cursor-pointer hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Adding...' : 'Add Link'}
          </button>
        </div>
      </form>

      <div className="space-y-4">
        {links.map((link) => (
          <div key={link.id} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">{link.title}</h3>
              <p className="text-blue-600 hover:underline mb-1 break-all">
                <a href={link.url} target="_blank" rel="noopener noreferrer">
                  {link.url}
                </a>
              </p>
              {link.description && <p className="text-gray-600 text-sm">{link.description}</p>}
            </div>
            <button 
              onClick={() => handleDeleteLink(link.id)}
              className="ml-4 px-3 py-1 bg-red-600 text-black border-none rounded-md cursor-pointer hover:bg-red-700 transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
        {links.length === 0 && !loadingLinks && (
          <div className="text-center py-8 text-gray-500">
            No links yet. Add your first link above!
          </div>
        )}
      </div>
    </div>
  );
}