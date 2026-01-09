import { CONFIG } from '../constants';

export const SystemService = {
  requestPermissions: async () => {
    if ('Notification' in window) {
      await Notification.requestPermission();
    }
  },

  notify: (title: string, body: string, type: 'emergency' | 'reward' | 'daily' | 'system' = 'system') => {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: 'https://picsum.photos/64/64', // Placeholder icon
        tag: type,
        silent: false
      });
    }
  },

  vibrate: (pattern: 'success' | 'error' | 'warning' | 'tick') => {
    if (!navigator.vibrate) return;

    switch (pattern) {
      case 'success':
        navigator.vibrate([50, 50, 100]);
        break;
      case 'error':
        navigator.vibrate([200, 100, 200]);
        break;
      case 'warning':
        navigator.vibrate([500]);
        break;
      case 'tick':
        navigator.vibrate(20);
        break;
    }
  },

  // Simulating Foreground Service visual indicator
  updateTitle: (activeTaskCount: number) => {
    document.title = activeTaskCount > 0 ? `(${activeTaskCount}) 执行中...` : '习惯大作战';
  }
};