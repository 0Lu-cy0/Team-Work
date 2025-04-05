import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types'; // Tạo file này nếu cần định nghĩa schema


const supabaseUrl = 'https://necuhffjeuirscsjzbkl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5lY3VoZmZqZXVpcnNjc2p6YmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNzI3OTEsImV4cCI6MjA1ODg0ODc5MX0.HyZLMBRk3F_-_uguvmpzwCxcngW4E6JYKqIXs-pfiOI'


export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
}); 