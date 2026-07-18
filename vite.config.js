import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: 'index.html', focus: 'focus.html', music: 'music.html', activities: 'activities.html',
        herbs: 'herbs.html', journal: 'journal.html', profile: 'profile.html', auth: 'auth.html', admin: 'admin.html'
      }
    }
  }
});
