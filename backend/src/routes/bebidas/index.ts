import { FastifyPluginAsync } from "fastify";
import { bebidaSchema, bebidaProductoSchema } from "../../types/bebidas.js";
import { productoSchema } from "../../types/productos.js";
import { Type } from "@fastify/type-provider-typebox";
import { query } from "../../services/database.js";

const bebidasRoute: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get("/:id_producto", {
    schema: {
      description: "Consigue una bebida por su id.",
      tags: ["Bebidas"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_producto: { type: "string" },
        },
        required: ["id_producto"],
      },
      response: {
        200: {
          description: "Proporciona todos los datos de la bebida",
          type: "object",
          properties: {
            // Estos ... lo que hacen es desarmar el schema en propiedades individuales, esta esto acá
            // pq no se puede utilizar Type.Intesect en properties :(
            ...productoSchema.properties,
            ...bebidaSchema.properties,
          },
          examples: [
            {
              nombre: "Coca-Cola Light",
              descripcion: "Cola sin azúcar y sin calorias",
              precio_unidad: 70,
              foto: {},
              tipo_bebida: "Gaseosa",
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const id_producto = (request.params as { id_producto: string })
        .id_producto;
      const response = await query(
        "SELECT * FROM productos JOIN bebidas on productos.id_producto=bebidas.id_producto WHERE id_producto=$1 ",
        [id_producto]
      );
      if (response.rows.length == 0 || !response.rows) {
        return reply
          .status(404)
          .send("No se encontro ningun producto con ese id.");
      }
      reply.code(200);
      return response.rows[0];
    },
  });
  fastify.put("/:id_producto", {
    schema: {
      description: "Edita los datos de la bebida.",
      tags: ["Bebidas"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_producto: { type: "string" },
        },
        required: ["id_producto"],
      },
      body: Type.Intersect([productoSchema, bebidaSchema]),
      response: {
        200: {
          description:
            "Muestra los cambios que tiene las propiedades de bebida.",
          type: "object",
          properties: {
            ...productoSchema.properties,
            ...bebidaSchema.properties,
          },
          examples: [
            {
              nombre: "Coca-Cola Light",
              descripcion: "Cola sin azúcar y sin calorias",
              precio_unidad: 70,
              foto: {},
              tipo_bebida: "Gaseosa",
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {},
  });
  fastify.delete("/:id_producto", {
    schema: {
      description: "Eliminamos un tipo de bebida por su id.",
      tags: ["Bebidas"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_producto: { type: "string" },
        },
        required: ["id_producto"],
      },

      response: {
        204: {
          description: "Mensaje de exito.",
          type: "null",
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {},
  });
  fastify.post("/", {
    schema: {
      description: "Creamos una bebida.",
      tags: ["Bebidas"],
      security: [{ BearerAuth: [] }],
      body: bebidaProductoSchema,
      response: {
        200: {
          description: "Muestra el objeto resultante por crear la bebida",
          type: "object",
          properties: {
            ...productoSchema.properties,
            ...bebidaSchema.properties,
          },
          examples: [
            {
              nombre: "Coca-Cola Light",
              descripcion: "Cola sin azúcar y sin calorias",
              precio_unidad: 70,
              foto: {},
              tipo_bebida: "Gaseosa",
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      const bodybebida: bebidaProductoSchema =
        request.body as bebidaProductoSchema;
      try {
        await query(
          `WITH bebidaproducto as (
          INSERT INTO producto(nombre,descripcion,precio_unidad) VALUES($1,$2,$3)
          RETURNING id
          )
          INSERT INTO bebida(id_producto,tipo_bebida) VALUES ((SELECT id from bebidaproducto),$4)`,
          [
            bodybebida.nombre,
            bodybebida.descripcion,
            bodybebida.precio_unidad,
            bodybebida.tipo_bebida,
          ]
        );
        reply.code(201).send(bodybebida);
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });
};
export default bebidasRoute;