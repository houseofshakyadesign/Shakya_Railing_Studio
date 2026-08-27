import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  server: {
    host: "localhost",
  },
  tanstackStart: {
    server: { entry: "server" },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "framer-motion": ["framer-motion"],
          "radix": [
            "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog",
            "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label", "@radix-ui/react-popover",
            "@radix-ui/react-select", "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip", "@radix-ui/react-slot",
          ],
          "recharts": ["recharts"],
        },
      },
    },
  },
} as any);
