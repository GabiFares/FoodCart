import { FastifyPluginAsync } from "fastify";
import { query } from "../../services/database.js";
import {
  PedidoPostSchema,
  PedidoPostType,
  PedidoSchema,
} from "../../types/pedidos.js";
import { IdPedidoSchema } from "../../types/detalle_pedido.js";

const pedidosRoute: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.post("/", {
    schema: {
      summary: "Creación de un pedido",
      tags: ["Pedidos"],
      description: "Creación de un nuevo pedido",
      security: [{ BearerAuth: [] }],
      body: PedidoPostSchema,
      response: {
        201: {
          description: "Muestra el objeto resultante del pedido creado",
          type: "object",
          properties: {
            ...PedidoPostSchema.properties,
            id_pedido: { type: "integer" },
          },
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const bodyPedido: PedidoPostType = request.body as PedidoPostType;

      await query("BEGIN");

      try {
        const localExists = await query(
          "SELECT id_local FROM local WHERE id_local = $1",
          ["1"]
        );
        if (localExists.rows.length === 0) {
          await query("ROLLBACK");
          return reply
            .status(400)
            .send({ error: "El local especificado no existe" });
        }

        const userExists = await query("SELECT id FROM usuario WHERE id = $1", [
          bodyPedido.id_usuario,
        ]);
        if (userExists.rows.length === 0) {
          await query("ROLLBACK");
          return reply
            .status(400)
            .send({ error: "El usuario especificado no existe" });
        }

        const result = await query(
          `INSERT INTO pedido(
            estado,
            importe_total,
            id_local,
            id_usuario
          ) VALUES($1, $2, $3, $4) RETURNING *`,
          [
            bodyPedido.estado || "PENDIENTE",
            bodyPedido.importe_total,
            bodyPedido.id_local,
            bodyPedido.id_usuario,
          ]
        );

        await query("COMMIT");
        reply.code(201).send(result.rows[0]);
      } catch (error) {
        await query("ROLLBACK");
        return reply.status(500).send(error);
      }
    },
  });

  fastify.put("/:id_pedido", {
    schema: {
      summary: "Modificación de un pedido por su id",
      description:
        "### Implementa y valida: \n " +
        " - token \n " +
        " - params \n " +
        " - body \n " +
        " - response \n ",
      tags: ["Pedidos"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_pedido: { type: "string" },
        },
        required: ["id_pedido"],
      },
      body: PedidoPostSchema,
      response: {
        200: {
          description: "Muestra el pedido actualizado",
          type: "object",
          properties: {
            ...PedidoPostSchema.properties,
          },
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const bodyPedido: PedidoPostType = request.body as PedidoPostType;
      const id_pedido = (request.params as { id_pedido: string }).id_pedido;

      await query("BEGIN");

      try {
        const existingPedido = await query(
          "SELECT * FROM pedido WHERE id_pedido = $1",
          [id_pedido]
        );
        if (existingPedido.rows.length === 0) {
          await query("ROLLBACK");
          return reply.status(404).send({ error: "Pedido no encontrado" });
        }

        const localExists = await query(
          "SELECT id_local FROM local WHERE id_local = $1",
          [bodyPedido.id_local]
        );
        if (localExists.rows.length === 0) {
          await query("ROLLBACK");
          return reply
            .status(400)
            .send({ error: "El local especificado no existe" });
        }

        const userExists = await query("SELECT id FROM usuario WHERE id = $1", [
          bodyPedido.id_usuario,
        ]);
        if (userExists.rows.length === 0) {
          await query("ROLLBACK");
          return reply
            .status(400)
            .send({ error: "El usuario especificado no existe" });
        }

        const result = await query(
          `UPDATE pedido SET
            estado = $1,
            importe_total = $2,
            id_local = $3,
            id_usuario = $4
          WHERE id_pedido = $5
          RETURNING *`,
          [
            bodyPedido.estado,
            bodyPedido.importe_total,
            bodyPedido.id_local,
            bodyPedido.id_usuario,
            id_pedido,
          ]
        );

        await query("COMMIT");
        reply.code(200).send(result.rows[0]);
      } catch (error) {
        await query("ROLLBACK");
        return reply.status(500).send(error);
      }
    },
  });

  fastify.get("/", {
    schema: {
      summary: "Listado de pedidos completo",
      description: "### Implementa y valida: \n " + "- token",
      tags: ["Pedidos"],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          description: "Proporciona todos los pedidos y sus datos",
          type: "array",
          properties: {
            ...IdPedidoSchema.properties,
            ...PedidoSchema.properties,
          },
          examples: [
            {
              id_pedido: 1,
              fecha_hora: "2024-10-27T15:30:00Z",
              estado: "PENDIENTE",
              importe_total: 1500,
              id_local: 1,
              id_usuario: 1,
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      try {
        const response = await query(
          "SELECT * FROM pedido ORDER BY fecha_hora DESC"
        );
        if (response.rows.length === 0) {
          return reply.status(404).send("No se encontró ningún pedido");
        }
        reply.code(200);
        return response.rows;
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  fastify.get("/:id_pedido", {
    schema: {
      summary: "Obtener un pedido por su ID",
      description: "### Implementa y valida: \n " + "- token \n - params",
      tags: ["Pedidos"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_pedido: { type: "string" },
        },
        required: ["id_pedido"],
      },
      response: {
        200: {
          description: "Detalles del pedido solicitado",
          type: "object",
          properties: {
            ...PedidoSchema.properties,
          },
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const id_pedido = (request.params as { id_pedido: string }).id_pedido;

      try {
        const response = await query(
          "SELECT * FROM pedido WHERE id_pedido = $1",
          [id_pedido]
        );

        if (response.rows.length === 0) {
          return reply.status(404).send("Pedido no encontrado");
        }

        reply.code(200);
        return response.rows[0];
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  fastify.get("/usuario/:id_usuario", {
    schema: {
      summary: "Obtener todos los pedidos de un usuario por su ID",
      description: "### Implementa y valida: \n " + "- token \n - params",
      tags: ["Pedidos"],
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
          description: "Proporciona todos los productos y sus datos",
          type: "array",
          properties: {
            ...PedidoSchema.properties,
          },
          examples: [
            {
              id_pedido: 1,
              fecha_hora: "2024-10-27T15:30:00Z",
              estado: "PENDIENTE",
              importe_total: 1500,
              id_local: 1,
              id_usuario: 1,
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const id_usuario = (request.params as { id_usuario: string }).id_usuario;

      try {
        const response = await query(
          "SELECT * FROM pedido WHERE id_usuario = $1",
          [id_usuario]
        );

        if (response.rows.length === 0) {
          return reply.status(404).send("Pedido no encontrado");
        }

        reply.code(200);
        return response.rows;
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  fastify.delete("/:id_pedido", {
    schema: {
      summary: "Eliminación de un pedido por su id",
      description:
        "### Implementa y valida: \n " +
        " - token \n " +
        " - params \n " +
        " - response \n ",
      tags: ["Pedidos"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_pedido: { type: "string" },
        },
        required: ["id_pedido"],
      },
      response: {
        204: {
          description: "Pedido eliminado correctamente",
          type: "null",
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const id_pedido = (request.params as { id_pedido: string }).id_pedido;

      try {
        const pedidoExistente = await query(
          "SELECT estado FROM pedido WHERE id_pedido = $1",
          [id_pedido]
        );

        if (pedidoExistente.rows.length === 0) {
          return reply.status(404).send({
            error: "Pedido no encontrado",
          });
        }

        if (pedidoExistente.rows[0].estado === "CANCELADO") {
          await query("DELETE FROM pedido WHERE id_pedido = $1", [id_pedido]);
          return reply.code(204).send();
        }

        if (pedidoExistente.rows[0].estado === "PENDIENTE") {
          await query(
            "UPDATE pedido SET estado = 'CANCELADO' WHERE id_pedido = $1 RETURNING *",
            [id_pedido]
          );
          return reply.code(204).send();
        }

        return reply.status(400).send({
          error:
            "Solo se pueden eliminar pedidos en estado PENDIENTE o CANCELADO",
        });
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });
};
export default pedidosRoute;
