import { Static, Type } from "@sinclair/typebox";
import { productoSchema } from "./productos.js";
export const bebidaSchema = Type.Object({
  tipo_bebida: Type.String({
    minLength: 4,
    maxLength: 50,
    examples: ["Gaseosa"],
  }),
});
export const bebidaProductoSchema = Type.Object({
  ...productoSchema.properties,
  ...bebidaSchema.properties,
});
export type bebidaSchema = Static<typeof bebidaSchema>;
export type bebidaProductoSchema = Static<typeof bebidaProductoSchema>; // Este es un tipo, no debes usarlo en el esquema.