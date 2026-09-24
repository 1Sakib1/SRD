import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { useAuth } from '../context/AuthContext';
import { Trophy, Medal, Crown, Star } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../utils/supabase/info';

export const Leaderboard = () => {
  const { user } = useAuth();
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    setIsLoading(true);
    try {
      const topUsersRes = await fetch(
        `https://${projectId}.supabase.co/rest/v1/top_users?select=*`,
        {
          method: 'GET',
          headers: {
            'apikey': publicAnonKey,
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );
      if (topUsersRes.ok) {
        const topUsersData = await topUsersRes.json();
        setTopUsers(topUsersData || []);
      }
    } catch (error) {
      console.error('Failed to load leaderboard', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant={user ? 'authenticated' : 'landing'} />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-[#333333] mb-4">Eco-Champions Leaderboard</h1>
          <p className="text-lg text-gray-600">See who is making the biggest impact in keeping Sydney clean.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Trophy className="w-10 h-10 text-yellow-100" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Top Contributors</h2>
                <p className="text-yellow-100">Earn $0.10 for every report!</p>
              </div>
            </div>
            
            {user && (
              <div className="bg-white/20 px-6 py-4 rounded-xl text-center md:text-right min-w-[150px]">
                <div className="text-sm text-yellow-100 font-medium uppercase tracking-wider mb-1">Your Rank</div>
                <div className="text-3xl font-bold">
                  #{topUsers.findIndex(u => u.id === user.id) !== -1 ? topUsers.findIndex(u => u.id === user.id) + 1 : '10+'}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-0">
            {isLoading ? (
              <div className="p-12 text-center text-gray-500 animate-pulse">Loading champions...</div>
            ) : topUsers.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No champions yet. Be the first!</div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {topUsers.map((topUser, index) => {
                  const isCurrentUser = topUser.id === user?.id;
                  const isTop3 = index < 3;
                  
                  return (
                    <li 
                      key={topUser.id} 
                      className={`flex items-center justify-between p-6 transition-colors hover:bg-gray-50 ${
                        isCurrentUser ? 'bg-amber-50 border-l-4 border-amber-500' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-5">
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-xl ${
                          index === 0 ? 'bg-gradient-to-br from-yellow-200 to-yellow-400 text-yellow-800 shadow-md' :
                          index === 1 ? 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 shadow-md' :
                          index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-300 text-orange-800 shadow-md' :
                          'bg-blue-50 text-blue-600 border border-blue-100'
                        }`}>
                          {index === 0 ? <Crown className="w-7 h-7" /> : 
                           index === 1 || index === 2 ? <Medal className="w-6 h-6" /> : 
                           `#${index + 1}`}
                        </div>
                        <div>
                          <div className="font-bold text-[#333333] flex items-center text-lg">
                            {topUser.name}
                            {isCurrentUser && <span className="ml-3 text-xs bg-amber-200 text-amber-800 px-3 py-1 rounded-full font-bold uppercase tracking-wide">You</span>}
                          </div>
                          {isTop3 && <div className="text-sm text-amber-600 font-medium mt-0.5">Top Contributor</div>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                        <Star className={`w-5 h-5 ${isTop3 ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                        <span className="font-bold text-[#333333] text-xl">{topUser.ecoPoints}</span>
                        <span className="text-sm text-gray-500 font-medium hidden sm:inline">pts</span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
