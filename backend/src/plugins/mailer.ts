import nodemailer = require("nodemailer");
import fp from "fastify-plugin";

export default fp(async (fastify) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "gabrielafaresm@gmail.com",
      pass: "fqcc fmcl uhks plet",
    },
  });
  console.log("Checking credentials:", {
    user: "gabrielafaresm@gmail.com",
    pass: "fqcc fmcl uhks plet", // Para verificar que no hay espacios extra
  });

  await transporter.verify();
  console.log("Ready to send emailssss");

  fastify.decorate("mailer", transporter);
});

declare module "fastify" {
  interface FastifyInstance {
    mailer: any;
  }
}
