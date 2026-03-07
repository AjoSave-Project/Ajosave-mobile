import { useEffect, useState } from 'react';
import { Keyboard } from 'react-native';

export function useKeyboardVisible() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setIsVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setIsVisible(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  return isVisible;
}
