import "~/styles/globals.css";

import { GeistSans } from "geist/font/sans";

import { TRPCReactProvider } from "~/trpc/react";
import Navbar from "./_components/Navbar";
import { getServerAuthSession } from "~/server/auth";
import { signIn } from "next-auth/react";
import { redirect } from "next/navigation";
import AuthValidator from "./_components/AuthValidator";

export const metadata = {
  title: "Create T3 App",
  description: "Generated by create-t3-app",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>
          <AuthValidator>
            <div className="min-h-[100vh] flex flex-col">
              <Navbar />
              {children}
            </div>
          </AuthValidator>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
