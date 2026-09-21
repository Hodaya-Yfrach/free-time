// ============================================================================
//  תצורת Vite — כלי הבנייה של הלקוח.
//  שרת הפיתוח רץ על 5173 ומדבר עם שרת המשחק על 3000.
// ============================================================================
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, open: true },
  build: { outDir: 'dist' },
});
