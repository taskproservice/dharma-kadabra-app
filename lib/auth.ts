import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { getAuthSecret } from "./auth-secret";
import { burnPasswordCheck, verifyPassword } from "./password";
import { prisma } from "./prisma";
import { parseRole } from "./rbac-config";

const STAFF_SESSION_MAX_AGE = 60 * 60 * 8; // Jornada laboral: 8 horas.

const credentialsSchema = z.object({
  email: z.string().trim().email().max(180),
  password: z.string().min(1).max(128),
});

/**
 * NextAuth para el equipo del dashboard (ADMIN, ENGINEER, SOCIAL_MEDIA, COLLABORATOR).
 * El rol viaja dentro del JWT cifrado; nunca se acepta desde query params,
 * cabeceras o cookies editables por el navegador.
 */
export const authOptions: NextAuthOptions = {
  secret: getAuthSecret(),
  session: { strategy: "jwt", maxAge: STAFF_SESSION_MAX_AGE },
  jwt: { maxAge: STAFF_SESSION_MAX_AGE },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    CredentialsProvider({
      id: "staff",
      name: "Equipo Dharma Kadabra",
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          burnPasswordCheck(parsed.data.password);
          return null;
        }
        if (!user.active || !verifyPassword(parsed.data.password, user.passwordHash)) return null;
        const role = parseRole(user.role);
        if (!role) return null;
        return { id: user.id, name: user.name, email: user.email, role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role;
      }
      return session;
    },
  },
};
