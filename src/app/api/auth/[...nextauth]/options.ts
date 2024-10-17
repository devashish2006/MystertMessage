import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "Credentials",
            name: "Credentials",
            credentials: { // Changed from "Credentials" to "credentials"
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    });
                    if (!user) {
                        throw new Error("No User Found with this email");
                    }

                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login");
                    }

                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user;
                    } else {
                        throw new Error("Incorrect Password");
                    }
                } catch (error: any) {
                    throw new Error(error.message || "Authorization failed");
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessage =  user.isAcceptingMessages;
                token.username = user.username
            }
            return token
        },
        async session({ session, token}) {
            if (token) {
                session.user._id = token._id as string | undefined; // Explicitly cast _id to string or undefined
                session.user.isVerified = token.isVerified as boolean; // Cast isVerified as boolean
                session.user.isAcceptingMessages = token.isAcceptingMessages as boolean | undefined; // Cast isAcceptingMessages as boolean or undefined
                session.user.username = token.username as string | undefined; // Cast username as string or undefined
            }
            return session;
        }
    }
};
