import { getCustomer, getEmployee } from "@/lib/db/queries";
import NextAuth, { DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { DefaultJWT } from 'next-auth/jwt';

export type UserType = 'customer' | 'employee';
export type UserRole = 'customer' | 'csr' | 'admin';

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: number;
      type: UserType;
      role: UserRole;
      name: string;
      email: string;
      phone: string;
    } & DefaultSession["user"];
  }

  interface User {
    id?: number;
    type?: UserType;
    role?: UserRole;
    name?: string;
    email?: string;
    phone?: string;
  }
}

declare module 'next-auth/jwt' {
    interface JWT extends DefaultJWT {
      id: number;
      type: UserType;
      role: UserRole;
      name: string;
      email: string;
      phone: string;
    }
  }
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      id: "customer",
      name: "Customer",
      credentials: {
        customerId: { label: "Customer ID", type: "number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const customers = await getCustomer(credentials.customerId as number);

        if (customers.length === 0) {
          throw new Error('Customer not found');
        }

        const customer = customers[0];

        if ("CitiHackathon" !== credentials.password) {
          throw new Error('Invalid password');
        }

        return {
          id: customer.id,
          type: 'customer',
          role: 'customer',
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
        };
      },
    }),
    Credentials({
      id: "employee",
      name: "Employee",
      credentials: {
        employeeId: { label: "Employee ID", type: "number" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const employees = await getEmployee(credentials.employeeId as number);

        if (employees.length === 0) {
          throw new Error('Employee not found');
        }

        const employee = employees[0];

        if ("CitiHackathon" !== credentials.password) {
          throw new Error('Invalid password');
        }

        return {
          id: employee.id,
          type: 'employee',
          role: employee.role as UserRole,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as number;
        token.type = user.type as UserType;
        token.role = user.role as UserRole;
        token.name = user.name as string;
        token.email = user.email as string;
        token.phone = user.phone as string;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).type = token.type;
        (session.user as any).role = token.role;
        (session.user as any).name = token.name;
        (session.user as any).email = token.email;
        (session.user as any).phone = token.phone;
      }
      return session;
    },
  },
  trustHost: true
})