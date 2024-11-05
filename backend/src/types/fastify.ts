import { FastifyReply, FastifyRequest } from "fastify";

export interface authenticateFunction {
  (request: FastifyRequest, reply: FastifyReply): Promise<void>;
}

export interface verifyAdminFunction {
  (request: FastifyRequest, reply: FastifyReply): Promise<void>;
}
declare module "fastify" {
  interface FastifyInstance {
    authenticate: authenticateFunction;
    verifyAdmin: verifyAdminFunction;
    mailer: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
      is_admin: boolean;
    };
  }
}
