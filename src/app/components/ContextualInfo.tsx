import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { Users, FileCheck, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

export const ContextualInfo = () => {
  const [stats, setStats] = useState({
    users: 0,
    reports: 0,
    satisfaction: 100
  });

  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const { count: usersCount } = await supabase
          .from('users')
          .select('*', { count: 'exact', head: true });
          
        const { count: reportsCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true });
          
        const { count: resolvedCount } = await supabase
          .from('reports')
          .select('*', { count: 'exact', head: true })
          .in('status', ['resolved', 'reviewed']);

        const totalUsers = usersCount || 0;
        const totalReports = reportsCount || 0;
        const totalResolved = resolvedCount || 0;
        
        let sat = 100;
        if (totalReports > 0) {
            sat = Math.round((totalResolved / totalReports) * 100);
        }

        setStats({
          users: totalUsers,
          reports: totalReports,
          satisfaction: sat
        });
      } catch (err) {
        console.error("Error fetching contextual info:", err);
      }
    };
    
    fetchRealStats();
    
    // Subscribe to realtime inserts so the numbers update live on the landing page!
    const channel = supabase.channel('contextual_info_stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'reports' }, () => {
         fetchRealStats(); // Refresh stats on new report
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'reports' }, () => {
         fetchRealStats(); // Refresh stats on status change
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, () => {
         fetchRealStats(); // Refresh on new user
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-[#00B150]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#333333] mb-2">{stats.users.toLocaleString()}</div>
          <div className="text-sm sm:text-base text-gray-600">Community Members</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
            <FileCheck className="w-7 h-7 sm:w-8 sm:h-8 text-[#00B150]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#333333] mb-2">{stats.reports.toLocaleString()}</div>
          <div className="text-sm sm:text-base text-gray-600">Rubbish Reports</div>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-4">
            <TrendingUp className="w-7 h-7 sm:w-8 sm:h-8 text-[#00B150]" />
          </div>
          <div className="text-3xl sm:text-4xl font-bold text-[#333333] mb-2">{stats.satisfaction}%</div>
          <div className="text-sm sm:text-base text-gray-600">Resolution Rate</div>
        </motion.div>
      </div>
  );
};
