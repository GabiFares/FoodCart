import { FastifyPluginAsync } from "fastify";
import { query } from "../../../services/database.js";

const auth: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post("/", {
    schema: {
      tags: ["Auth"],
      body: {
        type: "object",
        properties: {
          email: {
            type: "string",
            format: "email",
            examples: ["emilio.rodriguez@example.com"],
          },
          contraseña: { type: "string", examples: ["Contraseña123!"] },
        },
        required: ["email", "contraseña"],
      },
      response: {
        200: {
          description: "Token del usuario",
        },
      },
    },
    handler: async function (request, reply) {
      const { email, contraseña } = request.body as {
        email: string;
        contraseña: string;
      };

      const checkResult = await query(
        "SELECT id,admin FROM usuario WHERE email = $1 AND contraseña = crypt($2, contraseña)",
        [email, contraseña]
      );
      const rows = checkResult.rows;
      if (!rows || rows.length === 0) {
        return reply.unauthorized("Tu correo o contraseña es incorrecto");
      }

      const id_usuario = rows[0].id;
      const isAdmin = rows[0].admin;
      const token = fastify.jwt.sign({
        email,
        id: id_usuario,
        expiresIn: "3h",
        isAdmin: isAdmin,
      });
      reply.send({ token });
    },
  });
};

export default auth;
