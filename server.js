import { serve } from "bun";
import { join } from "path";
import { readFileSync, existsSync } from "fs";

const baseDir = "/home/fd/Cursor/Agent/dlr-driver-console";

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".wav": "audio/wav",
  ".png": "image/png",
  ".svg": "image/svg+xml"
};

serve({
  port: 4173,
  fetch(req) {
    const url = new URL(req.url);
    let filePath = join(baseDir, url.pathname === "/" ? "index.html" : url.pathname);
    
    // Check public/ directory if not found in base
    if (!existsSync(filePath)) {
      filePath = join(baseDir, "public", url.pathname);
    }
    
    if (existsSync(filePath)) {
      const ext = filePath.slice(filePath.lastIndexOf("."));
      const contentType = mimeTypes[ext] || "application/octet-stream";
      return new Response(readFileSync(filePath), {
        headers: { "Content-Type": contentType }
      });
    }
    return new Response("Not Found", { status: 404 });
  }
});
console.log("Server listening on http://127.0.0.1:4173");
