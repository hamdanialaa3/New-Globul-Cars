// NextAuth Configuration - Free Authentication Alternative
// إعداد NextAuth - بديل مجاني للمصادقة

import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import FacebookProvider from 'next-auth/providers/facebook';
import CredentialsProvider from 'next-auth/providers/credentials';
import { supabase } from '../services/supabase-config';

export const authOptions = {
  providers: [
    // Google Authentication
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),

    // Facebook Authentication
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID || '',
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET || '',
    }),

    // Email/Password Authentication
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Sign in with Supabase
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });

          if (error || !data.user) {
            return null;
          }

          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.display_name || data.user.email,
            image: data.user.user_metadata?.avatar_url,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],

  // Database adapter for Supabase
  adapter: {
    async createUser(user) {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          created_at: new Date(),
        }])
        .select();

      if (error) throw error;
      return data[0];
    },

    async getUser(id) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error) return null;
      return data;
    },

    async getUserByEmail(email) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) return null;
      return data;
    },

    async updateUser(user) {
      const { data, error } = await supabase
        .from('users')
        .update({
          name: user.name,
          email: user.email,
          image: user.image,
        })
        .eq('id', user.id)
        .select();

      if (error) throw error;
      return data[0];
    },
  },

  // Session configuration
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
  },

  // Pages configuration
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup',
    error: '/auth/error',
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
      }
      return session;
    },

    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
  },

  // Events
  events: {
    async signIn({ user, account, profile, isNewUser }) {
      console.log('User signed in:', user.email);
    },

    async signOut({ token }) {
      console.log('User signed out');
    },
  },

  // Debug mode
  debug: process.env.NODE_ENV === 'development',
};

export default NextAuth(authOptions);