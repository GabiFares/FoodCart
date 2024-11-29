import { FastifyPluginAsync } from "fastify";
import {
  IdProductoSchema,
  productoPost,
  productoPostType,
  productoSchema,
  productoGet,
} from "../../types/productos.js";
import { query } from "../../services/database.js";
import { writeFileSync } from "fs";
import { join } from "node:path";

const productosRoute: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  // ################################################### GET ###################################################
  // Ruta para obtener un listado completo de productos
  fastify.get("/", {
    schema: {
      summary: "Listado de productos completo",
      description: "### Implementa y valida: \n " + "- token",
      tags: ["Productos"],
      security: [{ BearerAuth: [] }],
      response: {
        200: {
          description: "Proporciona todos los productos y sus datos",
          type: "array",
          properties: {
            ...IdProductoSchema.properties,
            ...productoSchema.properties,
          },
          examples: [
            {
              id_producto: 1,
              nombre: "Hamburgesa Triple",
              descripcion:
                "Tres patties de 100% carne de res con cebolla picada, ketchup, mostaza y dos fetas de queso americano.",
              precio_unidad: 500,
              id_categoria: 1,
              foto: true,
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const response = await query("SELECT * FROM producto");
      if (response.rows.length == 0 || !response.rows) {
        return reply.status(404).send("No se encontro ningun producto");
      }
      reply.code(200);
      return response.rows;
    },
  });

  // ################################################### GET BY ID_CATEGORIA ###################################################
  // Ruta para obtener un listado de productos filtrados por categoría
  fastify.get("/categoria/:id_categoria", {
    schema: {
      summary: "Listado de productos filtrados por categoría",
      description: "### Implementa y valida: \n" + "- token \n" + "- params",
      tags: ["Productos"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_categoria: { type: "string" },
        },
        required: ["id_categoria"],
      },
      response: {
        200: {
          description: "Proporciona los productos filtrados por categoría",
          type: "array",
          items: {
            type: "object",
            properties: {
              ...IdProductoSchema.properties,
              ...productoGet.properties,
            },
          },
          examples: [
            {
              id_producto: 1,
              nombre: "Hamburgesa Triple",
              descripcion:
                "Tres patties de 100% carne de res con cebolla picada, ketchup, mostaza y dos fetas de queso americano.",
              precio_unidad: 500,
              id_categoria: 1,
              foto: true,
            },
          ],
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const id_categoria = (request.params as { id_categoria: string })
        .id_categoria;
      try {
        const response = await query(
          "SELECT * FROM producto WHERE id_categoria = $1",
          [id_categoria]
        );

        if (response.rows.length === 0) {
          return reply.status(404).send({
            error: "No se encontraron productos para la categoría especificada",
          });
        }
        reply.code(200).send(response.rows);
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  // ######################################################### GET BY ID_PRODUCTO #########################################################
  // Ruta para obtener un producto por su ID
  fastify.get("/:id_producto", {
    schema: {
      summary: "Obtener un producto por su ID",
      description: "### Implementa y valida: \n" + "- token \n" + "- params",
      tags: ["Productos"],
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
          description: "Proporciona el producto con el ID especificado",
          type: "object",
          properties: {
            ...IdProductoSchema.properties,
            ...productoGet.properties,
          },
          example: {
            id_producto: 1,
            nombre: "Hamburgesa Triple",
            descripcion:
              "Tres patties de 100% carne de res con cebolla picada, ketchup, mostaza y dos fetas de queso americano.",
            precio_unidad: 500,
            id_categoria: 1,
            foto: true,
          },
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const id_producto = (request.params as { id_producto: string })
        .id_producto;

      try {
        const response = await query(
          "SELECT * FROM producto WHERE id_producto = $1",
          [id_producto]
        );

        if (response.rows.length === 0) {
          return reply.status(404).send({
            error: "No se encontro el producto con el id especificado",
          });
        }

        reply.code(200).send(response.rows[0]);
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  // ########################################################### PUT ###########################################################
  // Ruta para modificar un producto por su ID
  fastify.put("/:id_producto", {
    schema: {
      summary: "Modificación de un producto por su id",
      description:
        "### Implementa y valida: \n " +
        " - token \n " +
        " - params \n " +
        " - body \n " +
        " - que el usuario que ejecuta es admin \n " +
        " - response. \n ",
      tags: ["Productos"],
      security: [{ BearerAuth: [] }],
      params: {
        type: "object",
        properties: {
          id_producto: { type: "string" },
        },
        required: ["id_producto"],
      },
      body: productoPost,
      response: {
        200: {
          description:
            "Muestra los cambios que tiene las propiedades del producto.",
          type: "object",
          properties: {
            ...productoPost.properties,
          },
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const bodyProducto: productoPostType = request.body as productoPostType;
      const id_producto = (request.params as { id_producto: string })
        .id_producto;

      try {
        if (bodyProducto.foto && Object.keys(bodyProducto.foto).length > 0) {
          const fileBuffer = bodyProducto.foto as unknown as Buffer;
          const fileName = `${bodyProducto.nombre.replace(
            /\s+/g,
            "_"
          )}_${Date.now()}.jpg`;
          const filePath = join(process.cwd(), "Resources", fileName);
          writeFileSync(filePath, fileBuffer);
          // var fileUrl = `/Resources/${fileName}`;
        }

        // Para que no funcione como un post verificamos que el producto exista
        const existingProduct = await query(
          "SELECT * FROM producto WHERE id_producto = $1",
          [id_producto]
        );

        if (existingProduct.rows.length === 0) {
          return reply.status(404).send({ error: "Producto no encontrado" });
        }

        // Actualiza el producto en la base de datos
        const result = await query(
          `UPDATE producto SET
            nombre = $1,
            descripcion = $2,
            precio_unidad = $3,
            id_categoria = $4
          WHERE id_producto = $5
          RETURNING *`,
          [
            bodyProducto.nombre,
            bodyProducto.descripcion,
            bodyProducto.precio_unidad,
            bodyProducto.id_categoria,
            id_producto,
          ]
        );

        reply.code(200).send(result.rows[0]);
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });

  // ################################################### DELETE #################################################
  // Ruta para eliminar un producto por su ID
  fastify.delete("/:id_producto", {
    schema: {
      summary: "Eliminación de un producto por su id",
      description:
        "### Implementa y valida: \n " +
        " - token \n " +
        " - params \n " +
        " - que el usuario que ejecuta es administrador o el creador \n " +
        " - response. \n ",
      tags: ["Productos"],
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
          description: "Producto eliminado correctamente",
          type: "null",
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const id_producto = (request.params as { id_producto: string })
        .id_producto;

      try {
        await query("DELETE FROM producto WHERE id_producto = $1", [
          id_producto,
        ]);
      } catch (error) {
        return reply.status(500).send(error);
      }
      reply.code(204);
    },
  });

  // ################################################### POST ###################################################
  // Ruta para crear un nuevo producto
  fastify.post("/", {
    schema: {
      summary: "Creación de un producto",
      tags: ["Productos"],
      description: "Creación de un producto ",
      security: [{ BearerAuth: [] }],
      body: productoPost,
      response: {
        201: {
          description: "Muestra el objeto resultante del producto creado",
          type: "object",
          properties: {
            ...productoPost.properties,
          },
        },
      },
    },
    onRequest: [fastify.authenticate], // Middleware para autenticar
    handler: async function (request, reply) {
      const bodyProducto: productoPostType = request.body as productoPostType;
      let tieneFoto: boolean = false;

      if (bodyProducto.foto && Object.keys(bodyProducto.foto).length > 0) {
        tieneFoto = true;
      } else {
        tieneFoto = false;
      }

      const result = await query(
        `INSERT INTO producto(
        nombre,
        descripcion,
        precio_unidad,
        id_categoria, 
        foto
      ) VALUES($1,$2,$3,$4,$5) RETURNING *`,
        [
          bodyProducto.nombre,
          bodyProducto.descripcion,
          bodyProducto.precio_unidad,
          bodyProducto.id_categoria,
          tieneFoto,
        ]
      );

      try {
        if (tieneFoto) {
          const fileBuffer = bodyProducto.foto as Buffer;
          const filename = result.rows[0].id_producto + ".jpg";
          const filePath = join(
            process.cwd(),
            "Resources",
            "img",
            "productos",
            filename
          );

          // Guarda la foto del producto en el servidor
          writeFileSync(filePath, fileBuffer);
        }

        reply.code(201).send(result.rows[0]);
      } catch (error) {
        return reply.status(500).send(error);
      }
    },
  });
};
export default productosRoute;
