import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CANONICAL_HOST = "utahpeaks.org";

function requestHost(req: express.Request) {
  return (req.headers.host || "").split(":")[0].toLowerCase();
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // The bundled server lives in dist/, next to the Vite output in dist/public.
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // Cloud Run's frontend already redirects HTTP to HTTPS on mapped domains.
  // This covers a request that still arrives with x-forwarded-proto=http.
  // www → apex stays off until CANONICAL_REDIRECT=1, so this deploy can be
  // checked on www before the apex DNS cutover. See CUTOVER.md.
  app.use((req, res, next) => {
    const host = requestHost(req);
    const onPublicHost = host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`;
    if (!onPublicHost) {
      next();
      return;
    }

    const proto = String(req.headers["x-forwarded-proto"] || "")
      .split(",")[0]
      .trim()
      .toLowerCase();
    const redirectWww = process.env.CANONICAL_REDIRECT === "1" && host === `www.${CANONICAL_HOST}`;
    if (proto === "http" || redirectWww) {
      res.redirect(301, `https://${CANONICAL_HOST}${req.originalUrl}`);
      return;
    }
    next();
  });

  // Old Manus storage URLs. Keys are single filenames, including the one
  // photo whose name contains parentheses.
  app.all("/manus-storage/:key", (req, res) => {
    const key = req.params.key;
    if (!key || key.includes("..") || key.includes("/") || key.includes("\\")) {
      res.status(400).type("text/plain").send("Bad storage key");
      return;
    }
    const query = req.originalUrl.includes("?")
      ? req.originalUrl.slice(req.originalUrl.indexOf("?"))
      : "";
    res.redirect(301, `/media/${encodeURIComponent(key)}${query}`);
  });

  const longCache = {
    immutable: true,
    maxAge: "365d",
    fallthrough: false,
  } as const;

  app.use("/media", express.static(path.join(staticPath, "media"), longCache));
  app.use("/assets", express.static(path.join(staticPath, "assets"), longCache));

  app.use(
    express.static(staticPath, {
      index: false,
      setHeaders(res, filePath) {
        if (filePath.endsWith(`${path.sep}index.html`)) {
          res.setHeader("Cache-Control", "no-cache");
        }
      },
    }),
  );

  app.get("*", (req, res) => {
    if (path.extname(req.path)) {
      res.status(404).type("text/plain").send("Not found");
      return;
    }
    res.setHeader("Cache-Control", "no-cache");
    res.sendFile(path.join(staticPath, "index.html"));
  });

  app.use(
    (
      err: { status?: number; statusCode?: number },
      _req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      if (err?.status === 404 || err?.statusCode === 404) {
        res.status(404).type("text/plain").send("Not found");
        return;
      }
      next(err);
    },
  );

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
