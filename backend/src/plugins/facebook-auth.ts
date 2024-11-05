import fp from "fastify-plugin";
import oauthPlugin, { FastifyOAuth2Options } from "@fastify/oauth2";

export default fp(async (fastify) => {
  const facebookOAuth2Options: FastifyOAuth2Options = {
    name: "facebookOAuth2",
    scope: ["email", "public_profile"],
    credentials: {
      client: {
        id: process.env.FACEBOOK_ID || "",
        secret: process.env.FACEBOOK_SECRET || "",
      },
      auth: oauthPlugin.fastifyOauth2.FACEBOOK_CONFIGURATION,
    },
    startRedirectPath: "/auth/login/facebook",
    callbackUri: "https://localhost/backend/auth/login/facebook/callback",
  };

  fastify.register(oauthPlugin.fastifyOauth2, facebookOAuth2Options);
});
