# WellSpring agent instructions

- Use plain JavaScript, HTML, CSS, Bootstrap, Vite, and Supabase; do not introduce a UI framework or TypeScript.
- Keep every screen in a separate HTML file and shared logic in `src/js` modules.
- Keep Supabase calls in `src/js/services`; UI modules should consume service functions.
- Preserve responsive behavior, accessible labels, keyboard support, and the calm visual language.
- Database changes must be new timestamped SQL migrations in `supabase/migrations` with RLS enabled.
- Never expose the service-role key in client code. Only `VITE_SUPABASE_URL` and the anon key belong in the browser.
- Keep demo mode working when Supabase environment variables are absent.
