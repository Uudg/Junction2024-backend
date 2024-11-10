import fastify from "fastify";
import fastifyAutoload from "@fastify/autoload";
import fastifyCors from "@fastify/cors";
import "dotenv/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fastifyMultipart from "@fastify/multipart";
process.env.NODE_ENV = "production";
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

const app = fastify({ logger: true });

app.register(fastifyMultipart);

app.register(fastifyAutoload, {
    dir: path.join(__dirname, "src", "routes"),
    options: {
        dirNameRoutePrefix: false,
    },
});

app.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST"],
});

// Middleware to remove X-Frame-Options header
app.addHook("onSend", (request, reply, payload, done) => {
    reply.header("X-Frame-Options", "ALLOWALL");
    done();
});

const start = async () => {
    try {
        await app.listen({ port: 3000 });
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
