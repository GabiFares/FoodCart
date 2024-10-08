import { FastifyPluginAsync } from "fastify";
import { UsuarioPostSchema } from "../../types/usuario.js";
import { join } from "node:path";
import { writeFileSync } from "node:fs";
import { query } from "../../services/database.js";
import { QueryResult } from "pg";

const usuarioRoute: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post('/', {
    schema: {
      tags: ['Usuarios'],
      body: UsuarioPostSchema,
      response: {
        201: {
          description: 'El usuario se creó correctamente'
        }
      }
    },
    handler: async function (request, reply) {
      const postUsuario = request.body as UsuarioPostSchema;
      var direccionId: QueryResult<any>;
      var telefonoId: QueryResult<any>;
      var usuarioId: QueryResult<any>;

      if (postUsuario.contraseña != postUsuario.repetirContraseña) {
        return reply
          .status(400)
          .send({ error: "Las contraseñas no coinciden" });
      }

      if (postUsuario.foto && Object.keys(postUsuario.foto).length > 0) {
        try {
          const fileBuffer = (postUsuario.foto as Buffer);
          const fileName = join(process.cwd(), "Resources", postUsuario.email + ".jpg");
          writeFileSync(fileName, fileBuffer);
        } catch (error) {
          console.error("Error al intentar crear la imagen:", error);
          return reply.status(500).send("Hubo un error al intentar crear la imagen");
        }
      }

      try {
        if (postUsuario.apto != null || postUsuario.apto != undefined) {
          direccionId = await query("INSERT INTO direccion (numero, calle, apto) VALUES ($1, $2, $3) RETURNING id",
            [postUsuario.numero, postUsuario.calle, postUsuario.apto]);
        } else {
          direccionId = await query("INSERT INTO direccion (numero, calle) VALUES ($1, $2) RETURNING id",
            [postUsuario.numero, postUsuario.calle]);
        }
      } catch (error) {
        console.error("Error al intentar crear la dirección:", error);
        return reply.status(500).send("Hubo un error al intentar crear la dirección");
      }

      try {
        telefonoId = await query("INSERT INTO telefono (numeroTel) VALUES ($1) RETURNING id",
          [postUsuario.telefono]);
      } catch (error) {
        console.error("Error al intentar crear el teléfono:", error);
        return reply.status(500).send("Hubo un error al intentar crear el teléfono");
      }

      try {
        usuarioId = await query(`INSERT INTO usuario(nombre, apellido, email, contraseña, id_direccion, id_telefono) 
          VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5, $6) RETURNING id`,
          [postUsuario.nombre, postUsuario.apellido, postUsuario.email, postUsuario.contraseña, direccionId.rows[0].id, telefonoId.rows[0].id]);

        await query("UPDATE direccion SET id_usuario = $1 WHERE id = $2", 
          [usuarioId.rows[0].id, direccionId.rows[0].id]);

        await query("UPDATE telefono SET id_usuario = $1 WHERE id = $2",
          [usuarioId.rows[0].id, telefonoId.rows[0].id]);

        await query(`INSERT INTO usuarios_direcciones(usuario_id, direccion_id) VALUES ($1, $2)`,
          [usuarioId.rows[0].id, direccionId.rows[0].id]);

        return reply.status(201).send("Se creó correctamente el usuario");
      } catch (error) {
        console.error("Error al intentar crear al usuario:", error);
        return reply.status(500).send("Hubo un error al intentar crear al usuario.");
      }
    }
  });

  fastify.get('/', {
    schema: {
      description: 'Obtener un usuario',
      tags: ['Usuarios'],
      security: [{ BearerAuth: [] }],
      response: {
        200: {}
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const response = await query("SELECT * from usuario");
      return response.rows[0];
    }
  });

  fastify.put('/:id', {
    onRequest: [fastify.authenticate],
    schema: {
      tags: ['Usuarios'],
      body: UsuarioPostSchema,
      security: [{ BearerAuth: [] }],
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'El usuario se editó correctamente'
        }
      }
    },
    handler: async function (request, reply) {
      const postUsuario = request.body as UsuarioPostSchema;

      const id = (request.params as { id: string }).id;
      const idt = request.user.id;
      if (id != idt) {
        return reply
          .status(401)
          .send({ error: "No tiene permisos para hacer esto." });
      }

      if (postUsuario.contraseña != postUsuario.repetirContraseña) {
        return reply
          .status(400)
          .send({ error: "Las contraseñas no coinciden" });
      }

      try {
        if (postUsuario.foto != null || postUsuario.foto != undefined) {
          const fileBuffer = (postUsuario.foto as Buffer);
          const fileName = join(process.cwd(), "Resources", postUsuario.email + ".jpg");
          writeFileSync(fileName, fileBuffer);
        }
      } catch (error) {
        console.error("Error al intentar crear la imagen:", error);
        return reply.status(500).send("Hubo un error al intentar crear la imagen");
      }

      if (postUsuario.apto != null || postUsuario.apto != undefined) {
        try {
          await query("UPDATE direccion set numero = $1 , calle = $2 , apto = $3 WHERE id_usuario = $4",
            [postUsuario.numero, postUsuario.calle, postUsuario.apto, idt]);
        } catch {
          return reply.status(500).send("Hubo un error al intentar actualizar la dirección.");
        }
      } else {
        try {
          await query("UPDATE direccion set numero = $1 , calle = $2 WHERE id_usuario = $4",
            [postUsuario.numero, postUsuario.calle, idt]);
        } catch {
          return reply.status(500).send("Hubo un error al intentar actualizar la dirección.");
        }
      }

      try {
        await query("UPDATE telefono set numeroTel = $1 WHERE id_usuario = $2",
          [postUsuario.telefono, idt]);
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar actualizar el teléfono.");
      }

      try {
        await query("UPDATE personas set nombre = $1, email = $2, contraseña = crypt($3, gen_salt('bf')) WHERE id = $4",
          [postUsuario.nombre, postUsuario.email, postUsuario.contraseña, idt]);
        return reply.status(201).send("El usuario se editó correctamente");
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar actualizar al usuario.");
      }
    }
  });

  fastify.delete("/:id", {
    onRequest: [fastify.authenticate],
    schema: {
      description: "Borrar un usuario",
      tags: ["Usuarios"],
      summary: "Borrar un usuario",
      params: {
        type: "object",
        properties: {
          id: { type: "string" },
        },
        required: ["id"],
      },
    },
    handler: async function (request, reply) {
      const id = (request.params as { id: string }).id;
      const idt = request.user.id;
      if (id != idt) {
        return reply
          .status(401)
          .send({ error: "No tiene permisos para hacer esto, su id es:" + "y el id que intenta borrar es:" + id });
      }
      /*
      try {
        await query("DELETE FROM usuario WHERE id = $1", [id]);
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar borrar al usuario.");
      }

      try {
        await query("DELETE FROM usuarios_direcciones WHERE usuario_id = $1", [id]);
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar borrar la relación usuario-dirección.");
      }

      try {
        await query("DELETE FROM telefono WHERE id_usuario = $1", [id]);
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar borrar el teléfono.");
      }*/
      try {
        await query("Delete from usuario where id = $1", [id]);
      } catch (error) {
        return reply.status(500).send("Hubo un error al intentar borrar al usuario.");
      }
      return reply.status(204).send();
    }
  });
};

export default usuarioRoute;
