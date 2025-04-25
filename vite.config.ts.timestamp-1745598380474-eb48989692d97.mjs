// vite.config.ts
import { defineConfig } from "file:///Users/jameson.brown/connect-widget/node_modules/vite/dist/node/index.js";
import path from "path";
import react from "file:///Users/jameson.brown/connect-widget/node_modules/@vitejs/plugin-react/dist/index.mjs";
import dts from "file:///Users/jameson.brown/connect-widget/node_modules/vite-plugin-dts/dist/index.mjs";
import svgr from "file:///Users/jameson.brown/connect-widget/node_modules/vite-plugin-svgr/dist/index.js";
var __vite_injected_original_dirname = "/Users/jameson.brown/connect-widget";
var vite_config_default = defineConfig({
  build: {
    target: "esnext",
    minify: false,
    cssMinify: false,
    //Specifies that the output of the build will be a library.
    lib: {
      //Defines the entry point for the library build. It resolves
      //to src/index.ts,indicating that the library starts from this file.
      entry: path.resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "connect-widget",
      formats: ["es"],
      //A function that generates the output file
      //name for different formats during the build
      fileName: (format) => `index.${format}.js`
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM"
        }
      },
      onwarn(warning, defaultHandler) {
        if (warning.code === "SOURCEMAP_ERROR") {
          return;
        }
        defaultHandler(warning);
      }
    },
    //Generates sourcemaps for the built files,
    //aiding in debugging.
    sourcemap: true,
    //Clears the output directory before building.
    emptyOutDir: true
  },
  esbuild: {
    include: /\.[jt]sx?$/,
    exclude: [],
    loader: "tsx"
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        ".js": "jsx"
      }
    }
  },
  resolve: {
    alias: {
      src: path.resolve(__vite_injected_original_dirname, "./src"),
      utils: path.join(__vite_injected_original_dirname, "src/utils")
    }
  },
  plugins: [
    react(),
    dts(),
    svgr({ include: "**/*.svg", svgrOptions: { svgProps: { role: "image" } } })
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/testSetup.ts",
    include: ["**/*-{test,spec}.?(c|m)[jt]s?(x)"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvamFtZXNvbi5icm93bi9jb25uZWN0LXdpZGdldFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2phbWVzb24uYnJvd24vY29ubmVjdC13aWRnZXQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2phbWVzb24uYnJvd24vY29ubmVjdC13aWRnZXQvdml0ZS5jb25maWcudHNcIjsvLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGVzdFwiIC8+XG4vLy8gPHJlZmVyZW5jZSB0eXBlcz1cInZpdGUtcGx1Z2luLXN2Z3IvY2xpZW50XCIgLz5cbmltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gJ3ZpdGUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHJlYWN0IGZyb20gJ0B2aXRlanMvcGx1Z2luLXJlYWN0J1xuaW1wb3J0IGR0cyBmcm9tICd2aXRlLXBsdWdpbi1kdHMnXG5pbXBvcnQgc3ZnciBmcm9tICd2aXRlLXBsdWdpbi1zdmdyJ1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6ICdlc25leHQnLFxuICAgIG1pbmlmeTogZmFsc2UsXG4gICAgY3NzTWluaWZ5OiBmYWxzZSxcbiAgICAvL1NwZWNpZmllcyB0aGF0IHRoZSBvdXRwdXQgb2YgdGhlIGJ1aWxkIHdpbGwgYmUgYSBsaWJyYXJ5LlxuICAgIGxpYjoge1xuICAgICAgLy9EZWZpbmVzIHRoZSBlbnRyeSBwb2ludCBmb3IgdGhlIGxpYnJhcnkgYnVpbGQuIEl0IHJlc29sdmVzXG4gICAgICAvL3RvIHNyYy9pbmRleC50cyxpbmRpY2F0aW5nIHRoYXQgdGhlIGxpYnJhcnkgc3RhcnRzIGZyb20gdGhpcyBmaWxlLlxuICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvaW5kZXgudHMnKSxcbiAgICAgIG5hbWU6ICdjb25uZWN0LXdpZGdldCcsXG4gICAgICBmb3JtYXRzOiBbJ2VzJ10sXG4gICAgICAvL0EgZnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgdGhlIG91dHB1dCBmaWxlXG4gICAgICAvL25hbWUgZm9yIGRpZmZlcmVudCBmb3JtYXRzIGR1cmluZyB0aGUgYnVpbGRcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYCxcbiAgICB9LFxuICAgIHJvbGx1cE9wdGlvbnM6IHtcbiAgICAgIGV4dGVybmFsOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbSddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGdsb2JhbHM6IHtcbiAgICAgICAgICByZWFjdDogJ1JlYWN0JyxcbiAgICAgICAgICAncmVhY3QtZG9tJzogJ1JlYWN0RE9NJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICBvbndhcm4od2FybmluZywgZGVmYXVsdEhhbmRsZXIpIHtcbiAgICAgICAgaWYgKHdhcm5pbmcuY29kZSA9PT0gJ1NPVVJDRU1BUF9FUlJPUicpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGRlZmF1bHRIYW5kbGVyKHdhcm5pbmcpXG4gICAgICB9LFxuICAgIH0sXG4gICAgLy9HZW5lcmF0ZXMgc291cmNlbWFwcyBmb3IgdGhlIGJ1aWx0IGZpbGVzLFxuICAgIC8vYWlkaW5nIGluIGRlYnVnZ2luZy5cbiAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgLy9DbGVhcnMgdGhlIG91dHB1dCBkaXJlY3RvcnkgYmVmb3JlIGJ1aWxkaW5nLlxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICB9LFxuICBlc2J1aWxkOiB7XG4gICAgaW5jbHVkZTogL1xcLltqdF1zeD8kLyxcbiAgICBleGNsdWRlOiBbXSxcbiAgICBsb2FkZXI6ICd0c3gnLFxuICB9LFxuICBvcHRpbWl6ZURlcHM6IHtcbiAgICBlc2J1aWxkT3B0aW9uczoge1xuICAgICAgbG9hZGVyOiB7XG4gICAgICAgICcuanMnOiAnanN4JyxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICBzcmM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYycpLFxuICAgICAgdXRpbHM6IHBhdGguam9pbihfX2Rpcm5hbWUsICdzcmMvdXRpbHMnKSxcbiAgICB9LFxuICB9LFxuXG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIGR0cygpLFxuICAgIHN2Z3IoeyBpbmNsdWRlOiAnKiovKi5zdmcnLCBzdmdyT3B0aW9uczogeyBzdmdQcm9wczogeyByb2xlOiAnaW1hZ2UnIH0gfSB9KSxcbiAgXSxcbiAgdGVzdDoge1xuICAgIGdsb2JhbHM6IHRydWUsXG4gICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXG4gICAgc2V0dXBGaWxlczogJy4vc3JjL3Rlc3RTZXR1cC50cycsXG4gICAgaW5jbHVkZTogWycqKi8qLXt0ZXN0LHNwZWN9Lj8oY3xtKVtqdF1zPyh4KSddLFxuICB9LFxufSlcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFFQSxTQUFTLG9CQUFvQjtBQUM3QixPQUFPLFVBQVU7QUFDakIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFOakIsSUFBTSxtQ0FBbUM7QUFTekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsV0FBVztBQUFBO0FBQUEsSUFFWCxLQUFLO0FBQUE7QUFBQTtBQUFBLE1BR0gsT0FBTyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQzdDLE1BQU07QUFBQSxNQUNOLFNBQVMsQ0FBQyxJQUFJO0FBQUE7QUFBQTtBQUFBLE1BR2QsVUFBVSxDQUFDLFdBQVcsU0FBUyxNQUFNO0FBQUEsSUFDdkM7QUFBQSxJQUNBLGVBQWU7QUFBQSxNQUNiLFVBQVUsQ0FBQyxTQUFTLFdBQVc7QUFBQSxNQUMvQixRQUFRO0FBQUEsUUFDTixTQUFTO0FBQUEsVUFDUCxPQUFPO0FBQUEsVUFDUCxhQUFhO0FBQUEsUUFDZjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLE9BQU8sU0FBUyxnQkFBZ0I7QUFDOUIsWUFBSSxRQUFRLFNBQVMsbUJBQW1CO0FBQ3RDO0FBQUEsUUFDRjtBQUVBLHVCQUFlLE9BQU87QUFBQSxNQUN4QjtBQUFBLElBQ0Y7QUFBQTtBQUFBO0FBQUEsSUFHQSxXQUFXO0FBQUE7QUFBQSxJQUVYLGFBQWE7QUFBQSxFQUNmO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxTQUFTO0FBQUEsSUFDVCxTQUFTLENBQUM7QUFBQSxJQUNWLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixnQkFBZ0I7QUFBQSxNQUNkLFFBQVE7QUFBQSxRQUNOLE9BQU87QUFBQSxNQUNUO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxPQUFPLEtBQUssS0FBSyxrQ0FBVyxXQUFXO0FBQUEsSUFDekM7QUFBQSxFQUNGO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixJQUFJO0FBQUEsSUFDSixLQUFLLEVBQUUsU0FBUyxZQUFZLGFBQWEsRUFBRSxVQUFVLEVBQUUsTUFBTSxRQUFRLEVBQUUsRUFBRSxDQUFDO0FBQUEsRUFDNUU7QUFBQSxFQUNBLE1BQU07QUFBQSxJQUNKLFNBQVM7QUFBQSxJQUNULGFBQWE7QUFBQSxJQUNiLFlBQVk7QUFBQSxJQUNaLFNBQVMsQ0FBQyxrQ0FBa0M7QUFBQSxFQUM5QztBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
