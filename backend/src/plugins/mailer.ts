import fp from "fastify-plugin";
import fastifyMailer from "fastify-mailer";

export default fp(async (fastify) => {
  fastify.register(fastifyMailer, {
    transport: {
      host: "smtp.example.tld",
      port: 465,
      secure: true, // use TLS
      auth: {
        user: process.env.user,
        pass: process.env.pass,
      },
    },
  });
});
