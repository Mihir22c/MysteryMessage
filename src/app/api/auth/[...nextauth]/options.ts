import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';


export const authOptions = NextAuth({
    providers: [
        Credentials({
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    const user = await UserModel.findOne({ $or: [{ email: credentials.identifier }, { username: credentials.identifier }] })
                    if (!user) {
                        throw new Error('No user found')
                    }
                    if (!user.isVerified) {
                        throw new Error('User not verified! Please verify the user first.')
                    }
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (!isPasswordCorrect) {
                        throw new Error('Password is incorrect')
                    }
                    else {
                        return user
                    }
                } catch (error: any) {
                    throw new Error(error);
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString()
                token.isVerified = user.isVerified
                token.isAcceptingMessages = user.isAcceptingMessages
                token.username = user.username
            }
            return token
        },
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessages = token.isAcceptingMessages
                session.user.username = token.username
            }
            return session
        },
    },

    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/sign-in',
    },
});