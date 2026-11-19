import NextAuth from "next-auth";
import { authOptions } from "../../../../lib/auth";

// Endpoint de autenticación de NextAuth (inicio/cierre de sesión, CSRF, sesión).
// Es público por definición: es la puerta de entrada para obtener una sesión.
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
