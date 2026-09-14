import { useState, useCallback } from 'react';

const AFFIRMATIONS = [
  "Amazing work! Your dedication is truly inspiring!",
  "You're crushing it! Every session brings you closer to your goals!",
  "Incredible focus! You're building unstoppable momentum!",
  "Outstanding effort! Your hard work is paying off!",
  "Brilliant session! You're proving what persistence looks like!",
  "Fantastic job! Your commitment to excellence shines through!",
  "Superb concentration! You're mastering the art of deep work!",
  "Wonderful progress! Your discipline is truly admirable!",
  "Exceptional work! You're turning dreams into reality!",
  "Remarkable focus! You're building a better version of yourself!"
];

export interface AffirmationState {
  message: string;
  isVisible: boolean;
  type: 'focus' | 'break';
}

export function useAffirmations() {
  const [affirmation, setAffirmation] = useState<AffirmationState>({
    message: '',
    isVisible: false,
    type: 'focus',
  });

  const showAffirmation = useCallback((type: 'focus' | 'break' = 'focus') => {
    const randomIndex = Math.floor(Math.random() * AFFIRMATIONS.length);
    const message = AFFIRMATIONS[randomIndex];
    
    setAffirmation({
      message,
      isVisible: true,
      type,
    });
  }, []);

  const hideAffirmation = useCallback(() => {
    setAffirmation(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    affirmation,
    showAffirmation,
    hideAffirmation,
  };
}
