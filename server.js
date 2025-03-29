const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Fastify with logger
const fastify = require("fastify")({
  logger: {
    level: process.env.LOG_LEVEL || "info",
    transport: {
      targets: [
        {
          target: "pino/file", // Logs to a file
          options: {
            destination: path.join(__dirname, "logs/app.log"),
            mkdir: true,
          },
        },
        {
          target: "pino-pretty", // Logs to stdout in readable format
          options: {
            colorize: true,
            singleLine: true, // Ensures one log per line (Common Log Format)
          },
        },
      ],
    },
  },
});

// Define Hello world routine.
fastify.get("/hello", function (request, reply) {
  reply.send("world");
});

const chatOpts = {
  schema: {
    querystring: {
      type: "object",
      properties: {
        message: {
          type: "string",
        },
      },
      required: ["message"],
    },
  },
};

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

fastify.get("/chat", chatOpts, async function (request, reply) {
  const messageBody = {
    messages: [
      {
        role: "system",
        content: "you are a helpful assistant.",
      },
      {
        role: "user",
        content: request.query.message,
      },
    ],
    model: "llama-3.1-8b-instant",
  };

  const response = await axios.post(GROQ_API_URL, messageBody, {
    headers: {
      Authorization: "Bearer " + process.env.LLM_API_KEY,
      "Content-Type": "application/json",
    },
  });

  const data = response.data;
  
  const headers = response.headers;

  const answer = data.choices[0].message.content;

  fastify.log.info(`Request ${request.query.message} answered with ${answer}`);
  fastify.log.info(`Remaining Request on this day ${headers["x-ratelimit-remaining-requests"]}`);

  reply.send(answer);
});

// Run the server!
fastify.listen(
  { port: process.env.FASTIFY_PORT || 3000, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
);

// Gracefully handle SIGTERM and SIGINT (Docker stop, Ctrl+C)
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    await fastify.close();
    console.log("Fastify server closed.");
    process.exit(0);
  } catch (err) {
    console.error("Error shutting down:", err);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
