import { supabase } from '@/integrations/supabase/client';

export const seedFeedData = async () => {
  try {
    console.log('🌱 Seeding feed data using SQL function...');
    
    const { error } = await supabase.rpc('seed_initial_feed_data');
    
    if (error) {
      console.error('❌ Error seeding feed data:', error);
      throw error;
    }
    
    console.log('✅ Feed data seeded successfully!');
  } catch (error) {
    console.error('❌ Error in seedFeedData:', error);
    throw error;
  }
};
