import fs from "node:fs";
import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Connect, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

function sajikanDemo(): Plugin {
  const akar = path.resolve("demo");
  const tangani: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split("?")[0] ?? "";
    if (!url.startsWith("/demo/")) {
      next();
      return;
    }
    const berkas = path.resolve(akar, decodeURIComponent(url.slice("/demo/".length)));
    if (!berkas.startsWith(akar + path.sep) || !fs.existsSync(berkas)) {
      next();
      return;
    }
    res.setHeader("Content-Type", "video/mp4");
    fs.createReadStream(berkas).pipe(res);
  };
  return {
    name: "sajikan-demo",
    configureServer(server) {
      server.middlewares.use(tangani);
    },
    configurePreviewServer(server) {
      server.middlewares.use(tangani);
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile(), sajikanDemo()],
  test: {
    environment: "node",
  },
});
