import { serveStatic } from "hono/bun";
import { Hono } from "hono";

const app = new Hono();
app.use("*", serveStatic({ root: "./dist" }));

export default {
	port: 8080,
	fetch: app.fetch,
};
