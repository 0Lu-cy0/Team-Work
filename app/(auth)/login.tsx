import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import ResizableLogoBox from '@/components/Logo';
import CustomText from '@/constants/CustomText';
import MyButton from '@/components/MyButton';
import MyInputField from '@/components/MyInputField';
import stylesLogin from '../../styles/login_signupStyle';
import DividerWithText from '@/components/DividerWithText';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import * as Google from 'expo-auth-session/providers/google';

const Login = () => {
    const router = useRouter();
    const { session } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        clientId: '<890891709385-snblotj2m9rv443cbrhis6ipdbu0msfu.apps.googleusercontent.com>',
        redirectUri: 'https://<lfxwmqsymsslufddqklx>.supabase.co/auth/v1/callback',
    });

    useEffect(() => {
        if (session) {
            router.replace('./screens/home/(tab)');
        }
    }, [session]);

    const signInWithEmail = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter both email and password.');
            return;
        }
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) throw error;
            router.push('./screens/home/(tab)');
        } catch (error: unknown) {
            if (error instanceof Error) {
                Alert.alert('Login Failed', error.message);
            } else {
                Alert.alert('Login Failed', 'An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        try {
            await promptAsync();
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Google Sign-In Error', error.message);
            }
        }
    };

    return (
        <View style={stylesLogin.container}>
            <ResizableLogoBox />
            <CustomText style={stylesLogin.text1}>Welcome Back!</CustomText>

            <CustomText style={stylesLogin.text2}>Email Address</CustomText>
            <MyInputField
                value={email}
                onChangeText={setEmail}
                placeholder='Enter your email'
                leftIcon={<Image source={{ uri: 'https://img.icons8.com/ios/50/email.png' }} style={{ width: 24, height: 24 }} />}
                style={stylesLogin.inputEmailAndPassword}
            />

            <CustomText style={stylesLogin.text3}>Password</CustomText>
            <MyInputField
                value={password}
                onChangeText={setPassword}
                placeholder='Enter your password'
                leftIcon={<Image source={{ uri: 'https://img.icons8.com/ios/50/lock.png' }} style={{ width: 24, height: 24 }} />}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Image
                            source={{
                                uri: showPassword
                                    ? 'https://img.icons8.com/ios/50/visible.png'
                                    : 'https://img.icons8.com/ios/50/invisible.png'
                            }}
                            style={{ width: 24, height: 24 }}
                        />
                    </TouchableOpacity>
                }
                secureTextEntry={!showPassword}
                style={stylesLogin.inputEmailAndPassword}
            />

            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Feature coming soon!')}>
                <CustomText style={stylesLogin.text4}>Forgot Password?</CustomText>
            </TouchableOpacity>

            <MyButton
                title={<CustomText fontSize={18}>{isLoading ? 'Logging in...' : 'Login'}</CustomText>}
                onPress={signInWithEmail}
                disabled={isLoading || !email.trim() || !password.trim()}
                style={[stylesLogin.loginButton, isLoading ? { opacity: 0.5 } : {}]}
            />

            <DividerWithText text='Or continue with' containerStyle={stylesLogin.lineSignIn_Up} />

            {/* <MyButton
                backgroundColor='transparent'
                title={
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={{ uri: 'https://img.icons8.com/color/48/google-logo.png' }}
                            style={{ width: 24, height: 24, marginRight: 8 }}
                        />
                        <CustomText fontSize={18} style={{ color: '#FFFFFF' }}>Google</CustomText>
                    </View>
                }
                onPress={signInWithGoogle}
                disabled={!request}
                style={stylesLogin.googleButton}
            /> */}

            <View style={stylesLogin.PageTransition}>
                <CustomText fontSize={16} style={{ color: '#8CAAB9' }}>Don't have an account? </CustomText>
                <TouchableOpacity onPress={() => router.push('./register')}>
                    <CustomText fontSize={18} style={{ color: '#FED36A' }}>Sign Up</CustomText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;
