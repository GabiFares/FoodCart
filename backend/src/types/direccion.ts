import { Static, Type } from "@sinclair/typebox";

export const direccionSchema = Type.Object({
    calle: Type.String({
        minLength: 1,
        maxLength: 20,
        examples: ["Guaraní"],
    }),
    numero: Type.String({
        minLength: 1,
        maxLength: 10,
        examples: ["1435"],
    }),
    apto: Type.Optional(Type.String({
        minLength: 1,
        maxLength: 5,
        examples: ["B12"],
    })),
});
export const direccionGet = Type.Object(
    {
        calle: direccionSchema.properties.calle,
        numero: direccionSchema.properties.numero,
        apto: direccionSchema.properties.apto,
        id_direccion: Type.Integer({
            description: "Id de la direccion."
        })
    },
    { additionalProperties: false }
);
export type direccionGet = Static<typeof direccionGet>;
export type direccionSchema = Static<typeof direccionSchema>;
