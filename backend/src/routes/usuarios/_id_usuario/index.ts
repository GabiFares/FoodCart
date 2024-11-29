import { FastifyPluginAsync } from "fastify";
import {
  IdUsuario,
  IdUsuarioSchema,
  UsuarioFotoType,
  usuarioGet,
  UsuarioPasswordType,
  UsuarioUpdateSchema,
  UsuarioUpdateType,
} from "../../../types/usuario.js";
import { query } from "../../../services/database.js";
import { existsSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const usuarioIdRoute: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  // ####################################################### PUT #####################################################
  // Actualizar Información del Usuario
  fastify.put("/:id_usuario", {
    schema: {
      summary: "Actualizar información del usuario",
      description: "Actualizar información del usuario",
      body: {
        type: "object",
        properties: {
          ...UsuarioUpdateSchema.properties,
        },
        required: [
          "nombre",
          "apellido",
          "email",
          "telefono",
          "calle",
          "numero",
          "id_direccion",
          "id_telefono",
        ],
        additionalProperties: false,
      },
      tags: ["Usuarios"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_usuario: { type: "string" },
        },
        required: ["id_usuario"],
      },
      response: {
        200: {
          description: "La información del usuario se actualizó correctamente",
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const postUsuario = request.body as UsuarioUpdateType;
      const idt = request.user.id;

      try {
        if (postUsuario.apto) {
          await query(
            "UPDATE direccion set numero = $1 , calle = $2 , apto = $3 WHERE id = $4",
            [
              postUsuario.numero,
              postUsuario.calle,
              postUsuario.apto,
              postUsuario.id_direccion,
            ]
          );
        } else {
          await query(
            "UPDATE direccion set numero = $1 , calle = $2 WHERE id = $3",
            [postUsuario.numero, postUsuario.calle, postUsuario.id_direccion]
          );
        }

        await query("UPDATE telefono set numeroTel = $1 WHERE id = $2", [
          postUsuario.telefono,
          postUsuario.id_telefono,
        ]);

        await query(
          "UPDATE usuario set nombre = $1, apellido = $2, email = $3 WHERE id = $4",
          [postUsuario.nombre, postUsuario.apellido, postUsuario.email, idt]
        );

        return reply
          .status(200)
          .send("La información del usuario se actualizó correctamente");
      } catch (error) {
        return reply
          .status(500)
          .send(
            "Hubo un error al intentar actualizar la información del usuario."
          );
      }
    },
  });

  // ###################################  Cambiar contraseña #########################################

  fastify.put("/:id_usuario/password", {
    onRequest: [fastify.authenticate],
    schema: {
      summary: "Cambiar la contraseña del usuario",
      tags: ["Usuarios"],
      description: "Cambiar la contraseña del usuario",
      body: {
        type: "object",
        properties: {
          contrasenaActual: { type: "string" },
          password: { type: "string" },
          confirmarContrasena: { type: "string" },
        },
        required: ["contrasenaActual", "password", "confirmarContrasena"],
      },
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_usuario: { type: "string" },
        },
        required: ["id_usuario"],
      },
      response: {
        200: {
          description: "La contraseña se actualizó correctamente",
        },
      },
    },
    handler: async function (request, reply) {
      const { contrasenaActual, password, confirmarContrasena } =
        request.body as UsuarioPasswordType;
      const id_usuario = (request.params as { id_usuario: string }).id_usuario;
      const idt = request.user.id;

      if (id_usuario !== String(idt)) {
        return reply
          .status(403)
          .send({ error: "No tienes permiso para cambiar esta contraseña" });
      }

      if (password !== confirmarContrasena) {
        return reply
          .status(400)
          .send({ error: "Las contraseñas no coinciden" });
      }

      try {
        // Selecciona al usuario para verificar que exista
        const usuarioResult = await query(
          "SELECT * FROM usuario WHERE id = $1",
          [idt]
        );
        const usuario = usuarioResult.rows[0];

        if (!usuario) {
          return reply.status(404).send({ error: "Usuario no encontrado" });
        }

        // Intenta seleccionar el usuario por su id y password para validar la contraseña actual ingresada por el usuario
        const result = await query(
          "SELECT * FROM usuario WHERE id = $1 AND contraseña = crypt($2, contraseña)",
          [idt, contrasenaActual]
        );

        if (result.rows.length === 0) {
          return reply
            .status(401)
            .send({ error: "Contraseña actual incorrecta" });
        }

        // Actualizar la contraseña con una nueva encriptación
        await query(
          "UPDATE usuario SET contraseña = crypt($1, gen_salt('bf')) WHERE id = $2",
          [password, idt]
        );
        return reply
          .status(200)
          .send("La contraseña se actualizó correctamente");
      } catch (error: any) {
        console.error("Unexpected error:", error);
        return reply
          .status(500)
          .send({ error: "Internal server error", details: error.message });
      }
    },
  });

  // ################################### Cambiar foto de perfil ######################################

  fastify.put("/:id_usuario/imagen", {
    schema: {
      summary: "Cambiar foto de perfil del usuario",
      tags: ["Usuarios"],
      description: "Actualizar la foto de perfil del usuario",
      body: {
        type: "object",
        properties: {
          foto: { type: "object" },
        },
        required: ["foto"],
      },
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          description: "La foto de perfil se actualizó correctamente",
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const foto = request.body as UsuarioFotoType;
      const idt = request.user.id;

      try {
        if (foto && Object.keys(foto).length > 0) {
          const fileBuffer = foto as Buffer;
          const fileName = join(
            process.cwd(),
            "Resources/usuarios",
            idt + ".jpg"
          );

          // Verifica si ya existe una foto y la elimina
          if (existsSync(fileName)) {
            unlinkSync(fileName);
          }

          writeFileSync(fileName, fileBuffer);
        }
        return reply
          .status(200)
          .send("La foto de perfil se actualizó correctamente");
      } catch (error) {
        console.error("Error al intentar crear la imagen:", error);
        return reply
          .status(500)
          .send("Hubo un error al intentar crear la imagen");
      }
    },
  });

  // ##################################################### DELETE #####################################################
  // Ruta para borrar un usuario por su ID
  fastify.delete("/", {
    onRequest: [fastify.authenticate], // Middleware para autenticar
    schema: {
      summary: "Borrar un usuario por su id",
      tags: ["Usuarios"],
      security: [{ BearerAuth: [] }],
      description: "Borrar un usuario",
      params: IdUsuarioSchema,
    },
    handler: async function (request, reply) {
      const id = request.params as IdUsuario;
      const idt = request.user.id;

      // Verifica si el usuario tiene permisos para borrar
      if (id.id_usuario != parseInt(idt)) {
        return reply
          .status(401)
          .send({ error: "No tiene permisos para hacer esto." });
      }

      try {
        await query("DELETE FROM usuario WHERE id = $1", [idt]);
      } catch (error) {
        return reply.status(500).send(error);
      }
      return reply.status(204).send();
    },
  });

  // #################################################### GET #####################################################
  // Ruta para obtener los datos de un usuario por su ID
  fastify.get("/:id_usuario", {
    schema: {
      summary: "Se consiguen los datos del usuario",
      description: "### Implementa y valida: \n" + "- token \n" + "- params",
      tags: ["Usuarios"],
      security: [{ BearerAuth: [] }],
      params: IdUsuarioSchema,
      response: {
        200: {
          description: "Proporciona los datos del usuario",
          type: "object",
          properties: {
            ...usuarioGet.properties,
          },
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const { id_usuario } = request.params as IdUsuario;
      const idt = request.user.id;

      // Verifica si el usuario tiene permisos para acceder
      if (id_usuario != parseInt(idt)) {
        return reply
          .status(401)
          .send({ error: "No tiene permisos para hacer esto." });
      }

      const response = await query(
        `SELECT 
          u.nombre, 
          u.apellido, 
          u.email,
          u.contraseña, 
          u.foto,  
          u.id_direccion,
          u.id_telefono,
          d.calle,
          d.numero,
          d.apto,
          t.numeroTel
        FROM usuario u 
        LEFT JOIN direccion d ON u.id_direccion = d.id
        LEFT JOIN telefono t ON u.id_telefono = t.id  
        WHERE u.id=$1`,
        [idt]
      );

      reply.status(200);
      return response.rows[0];
    },
  });
};

export default usuarioIdRoute;
