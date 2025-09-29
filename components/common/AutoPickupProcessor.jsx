import React, { useEffect, useCallback } from 'react';
import { processOverduePickups } from "@/api/functions";
import { toast } from "sonner";

export default function AutoPickupProcessor({ currentUser }) {
  const processOverduePickupsAutomatically = useCallback(async () => {
    try {
      console.log('Checking for overdue pickups...');
      const result = await processOverduePickups({});
      
      if (result?.data?.updatedCount > 0) {
        console.log(`Processed ${result.data.updatedCount} overdue pickups automatically`);
        toast.info(`${result.data.updatedCount} איסופים הועברו ליום הבא אוטומטית`, {
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Error in automatic overdue pickups processing:', error);
    }
  }, []);

  // הפעלה כל 5 דקות עבור מנהלים
  useEffect(() => {
    if (currentUser && (currentUser.custom_role === 'admin' || currentUser.custom_role === 'store_manager')) {
      // הפעלה מידית
      const timer1 = setTimeout(() => {
        processOverduePickupsAutomatically();
      }, 2000); // 2 שניות אחרי טעינה

      // הפעלה כל 5 דקות
      const interval = setInterval(() => {
        processOverduePickupsAutomatically();
      }, 5 * 60 * 1000); // 5 דקות

      return () => {
        clearTimeout(timer1);
        clearInterval(interval);
      };
    }
  }, [currentUser, processOverduePickupsAutomatically]);

  // הקומפוננטה לא מציגה כלום
  return null;
}