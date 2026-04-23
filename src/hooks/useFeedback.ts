// src/hooks/useFeedback.ts
// React hook for managing feedback submissions

import { useState, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  submitFeedback, 
  getUserFeedback, 
  FeedbackData, 
  FeedbackSubmission 
} from '@/services/feedbackService';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

interface UseFeedbackReturn {
  // State
  isOpen: boolean;
  isSubmitting: boolean;
  submitError: Error | null;
  
  // Actions
  openFeedback: () => void;
  closeFeedback: () => void;
  submit: (data: FeedbackData) => Promise<void>;
  
  // Data
  feedbackHistory: FeedbackSubmission[];
  isLoading: boolean;
}

export const useFeedback = (): UseFeedbackReturn => {
  const { language } = useLanguage();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  // Query for feedback history
  const { data: feedbackHistory = [], isLoading } = useQuery({
    queryKey: ['feedback-history'],
    queryFn: getUserFeedback,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for submitting feedback
  const submitMutation = useMutation({
    mutationFn: submitFeedback,
    onSuccess: () => {
      // Invalidate feedback history query
      queryClient.invalidateQueries({ queryKey: ['feedback-history'] });
      
      // Show success message
      const messages: Record<string, string> = {
        am: 'ግብረ መልስዎ በተሳካ ሁኔታ ተልኳል! እናመሰግናለን።',
        en: 'Feedback submitted successfully! Thank you.',
        or: 'Yaada kee milkaa\'eera! Galatoomi.',
        sw: 'Maoni yamewasilishwa! Asante.'
      };
      
      toast.success(messages[language] || messages.en);
      setIsOpen(false);
    },
    onError: (error: Error) => {
      const messages: Record<string, string> = {
        am: 'ግብረ መልስ መላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
        en: 'Failed to submit feedback. Please try again.',
        or: 'Yaada erguu hinmilkoofne. Mee irra deebi\'ii yaali.',
        sw: 'Imeshindwa kuwasilisha maoni. Tafadhali jaribu tena.'
      };
      
      toast.error(messages[language] || messages.en);
      console.error('Feedback submission error:', error);
    }
  });

  const openFeedback = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeFeedback = useCallback(() => {
    setIsOpen(false);
  }, []);

  const submit = useCallback(async (data: FeedbackData) => {
    await submitMutation.mutateAsync(data);
  }, [submitMutation]);

  return {
    isOpen,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error as Error | null,
    openFeedback,
    closeFeedback,
    submit,
    feedbackHistory,
    isLoading
  };
};
