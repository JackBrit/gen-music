import { join } from "path";
import { file } from "bun";

Bun.serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);

        // If requesting the root path, serve index.html
        if (url.pathname === "/") {
        return new Response(file("public/index.html"), {
            headers: { "Content-Type": "text/html" },
        });
        }

        // Try serving static files from the public directory
        const filePath = join("public", url.pathname);
        try {
        return new Response(file(filePath));
        } catch {
        return new Response("File not found", { status: 404 });
        }
  },
});

console.log("Server running at http://localhost:3000");
