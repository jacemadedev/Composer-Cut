import React from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UserProfileProps {
  user: User;
}

export function UserProfile({ user }: UserProfileProps) {
  const [avatarUrl] = React.useState(
    user.user_metadata.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`
  );
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div 
        role="button"
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 hover:bg-base-200 p-2 rounded-lg transition-colors cursor-pointer"
      >
        <img
          src={avatarUrl}
          alt="User avatar"
          className="w-8 h-8 rounded-full"
        />
        <span className="text-sm hidden md:inline-block text-white">{user.email}</span>
      </div>

      <button
        onClick={handleSignOut}
        className="btn btn-ghost btn-sm text-red-400 hover:text-red-300 hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" />
        <span className="hidden md:inline ml-2">Sign Out</span>
      </button>
    </div>
  );
}