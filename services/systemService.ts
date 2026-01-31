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
      // Logic for different vibration patterns based on type is handled in the vibrate function
      // but Android Notification channels would be set here in a real native app.
      const n = new Notification(title, {
        body,
        icon: 'https://picsum.photos/64/64', 
        tag: type,
        silent: false, // We rely on our own vibration logic or OS defaults
        requireInteraction: type === 'emergency' // "Heads up" behavior
      });
      
      // Web Notification interaction hooks
      n.onclick = () => {
          window.focus();
          n.close();
      };
    }
  },

  vibrate: (pattern: 'success' | 'error' | 'warning' | 'tick') => {
    if (!navigator.vibrate) return;

    switch (pattern) {
      case 'success':
        navigator.vibrate([50, 50, 100]); // Short + Mid
        break;
      case 'error':
        navigator.vibrate([200, 100, 200]);
        break;
      case 'warning':
        navigator.vibrate([500]); // Long
        break;
      case 'tick':
        navigator.vibrate(20);
        break;
    }
  },

  // Simulating Foreground Service visual indicator
  updateTitle: (activeTaskCount: number) => {
    // Spec: Persistent Notification simulation via title
    document.title = activeTaskCount > 0 ? `🔥 执行中...` : '习惯大作战';
  }
};