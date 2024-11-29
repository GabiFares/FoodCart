import { Static, Type } from "@sinclair/typebox";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,20}$/;

export const IdUsuarioSchema = Type.Object({
  id_usuario: Type.Integer({
    description: "Identificador único del usuario",
  }),
});
export type IdUsuario = Static<typeof IdUsuarioSchema>;

export const UsuarioPostSchema = Type.Object(
  {
    nombre: Type.String({
      minLength: 3,
      maxLength: 20,
      pattern: "^[^\\d]+$",
      examples: ["Emilio"],
    }),
    apellido: Type.String({
      minLength: 3,
      maxLength: 20,
      pattern: "^[^\\d]+$",
      examples: ["Rodriguez"],
    }),
    email: Type.String({
      format: "email",
      examples: ["emilio.rodriguez@example.com"],
    }),
    telefono: Type.String({
      minLength: 3,
      maxLength: 20,
      examples: ["099471882"],
    }),
    calle: Type.String({
      maxLength: 20,
      examples: ["Calle"],
    }),
    numero: Type.String({
      maxLength: 10,
      examples: ["123"],
    }),
    apto: Type.Optional(
      Type.String({
        maxLength: 5,
        examples: ["A11"],
      })
    ),
    contraseña: Type.String({
      minLength: 8,
      maxLength: 20,
      pattern: passwordRegex.source,
      examples: ["Contraseña123!"],
    }),
    repetirContraseña: Type.String({
      minLength: 5,
      maxLength: 20,
      pattern: passwordRegex.source,
      examples: ["Contraseña123!"],
    }),
    foto: Type.Optional(Type.Object({})),
  },
  { additionalProperties: false }
);

export type UsuarioPostSchema = Static<typeof UsuarioPostSchema>;

export const UsuarioFotoSchema = Type.Object(
  {
    foto: Type.Optional(Type.Object({})),
  },
  { additionalProperties: false }
);

export type UsuarioFotoType = Static<typeof UsuarioFotoSchema>;

export const UsuarioUpdateSchema = Type.Object(
  {
    nombre: Type.String({
      minLength: 3,
      maxLength: 20,
      pattern: "^[^\\d]+$",
      examples: ["Emilio"],
    }),
    apellido: Type.String({
      minLength: 3,
      maxLength: 20,
      pattern: "^[^\\d]+$",
      examples: ["Rodriguez"],
    }),
    email: Type.String({
      format: "email",
      examples: ["emilio.rodriguez@example.com"],
    }),
    telefono: Type.String({
      minLength: 3,
      maxLength: 20,
      examples: ["099471882"],
    }),
    calle: Type.String({
      maxLength: 20,
      examples: ["Calle"],
    }),
    numero: Type.String({
      maxLength: 10,
      examples: ["123"],
    }),
    apto: Type.Optional(
      Type.String({
        maxLength: 5,
        examples: ["A11"],
      })
    ),
    id_direccion: Type.String({
      examples: ["1"],
    }),
    id_telefono: Type.String({
      examples: ["1"],
    }),
  },
  { additionalProperties: false }
);

export type UsuarioUpdateType = Static<typeof UsuarioUpdateSchema>;

export const UsuarioPasswordSchema = Type.Object(
  {
    contrasenaActual: Type.String({
      minLength: 8,
      maxLength: 20,
      pattern: passwordRegex.source,
      examples: ["ContraseñaActual123!"],
    }),
    password: Type.String({
      minLength: 8,
      maxLength: 20,
      pattern: passwordRegex.source,
      examples: ["NuevaContraseña123!"],
    }),
    confirmarContrasena: Type.String({
      minLength: 8,
      maxLength: 20,
      pattern: passwordRegex.source,
      examples: ["NuevaContraseña123!"],
    }),
  },
  { additionalProperties: false }
);

export type UsuarioPasswordType = Static<typeof UsuarioPasswordSchema>;

export const usuarioGet = Type.Object(
  {
    nombre: UsuarioPostSchema.properties.nombre,
    apellido: UsuarioPostSchema.properties.apellido,
    email: UsuarioPostSchema.properties.email,
    id_direccion: Type.Integer({
      description: "Identificador de la dirección del usuario",
    }),
    id_telefono: Type.Integer({
      description: "Identificador de el teléfono del usuario",
    }),
    admin: Type.Boolean({
      description: "Indica si el usuario es admin con un true.",
    }),
    foto: Type.Boolean({
      description: "Indica si el usuario tiene foto con un true.",
    }),
    calle: Type.String({
      description: "Indica la calle",
    }),
    numero: Type.Integer({
      description: "Indica el numero de la dirección",
    }),
    apto: Type.String({
      description: "Número de apto",
    }),
    numerotel: Type.String({
      description: "Número de teléfono",
    }),
  },
  { additionalProperties: false }
);
export type usuarioGetType = Static<typeof usuarioGet>;

export const ImagenUsuarioSchema = Type.Object(
  {
    imagen: Type.Object(
      {
        type: Type.Literal("file"),
        fieldname: Type.String(),
        filename: Type.String(),
        encoding: Type.String(),
        mimetype: Type.String(),
        file: Type.Object({}),
        _buf: Type.Object({}),
      },
      { additionalProperties: false }
    ),
  },
  { additionalProperties: false }
);
export type ImagenUsuario = Static<typeof ImagenUsuarioSchema>;
