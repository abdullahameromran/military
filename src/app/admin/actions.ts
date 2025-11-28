'use server'

import { supabase } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function saveFreeDays(prevState: any, formData: FormData) {
  const dateEntries = formData.getAll('dates[]');
  const dates = dateEntries.map(d => d.toString());

  try {
    // Delete all existing free days to replace with the new set.
    // In a multi-user app, you'd add a `where` clause for the current user.
    const { error: deleteError } = await supabase.from('free_days').delete().gt('id', -1);
    if (deleteError) throw deleteError;

    if (dates.length > 0) {
      const { error: insertError } = await supabase
        .from('free_days')
        .insert(dates.map(date => ({ date })));
      if (insertError) throw insertError;
    }
    
    // Revalidate paths to show updated data
    revalidatePath('/admin')
    revalidatePath('/')
    
    return { message: 'Availability updated successfully!', type: 'success' as const }
  } catch (error: any) {
    console.error('Save action error:', error)
    return { message: `Failed to save availability: ${error.message}`, type: 'error' as const }
  }
}
