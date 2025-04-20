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
import ThemeToggleButton from '@/components/ThemeToggleButton';
import { useThemeContext } from "@/context/ThemeContext";
import Icon from '@/components/Icon';

const Login = () => {
    const router = useRouter();
    const { session } = useAuth();
    const { colors } = useThemeContext();
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
            router.replace('./screens/(tab)');
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
            router.push('./screens/(tab)');
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
        <View style={[stylesLogin.container, { backgroundColor: colors.backgroundColor }]}>

            <View style={{ alignItems: 'center' }}>
                <ResizableLogoBox />
                <ThemeToggleButton />
            </View>
            <CustomText fontFamily='Inter' fontSize={32} style={[stylesLogin.text1, { color: colors.text5 }]}>Welcome Back!</CustomText>
            <CustomText fontFamily='Inter' fontSize={21} style={[stylesLogin.text2, { color: colors.textNoti }]}>Email Address</CustomText>
            <MyInputField
                value={email}
                onChangeText={setEmail}
                placeholder='Enter your email'
                leftIcon={<Icon category='icon_sign_up_in' name='email' style={{ width: 24, height: 24 }} />}
                style={[stylesLogin.inputEmailAndPassword]}
            />

            <CustomText fontFamily='Inter' fontSize={21} style={[stylesLogin.text2, { color: colors.textNoti }]}>Password</CustomText>
            <MyInputField
                value={password}
                onChangeText={setPassword}
                placeholder='Enter your password'
                leftIcon={<Icon category='icon_sign_up_in' name='password' style={{ width: 24, height: 24 }} />}
                rightIcon={
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        {showPassword ? (
                            <Icon category='icon_sign_up_in' name='showPass' style={{ width: 24, height: 24 }} />
                        ) : (
                            <Icon category='icon_sign_up_in' name='hiddenPass' style={{ width: 24, height: 24 }} />
                        )}
                    </TouchableOpacity>
                }
                secureTextEntry={!showPassword}
                style={stylesLogin.inputEmailAndPassword}
            />

            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Feature coming soon!')}>
                <CustomText fontFamily='Inter' fontSize={21} style={[stylesLogin.text4, { color: colors.textNoti }]}>Forgot Password?</CustomText>
            </TouchableOpacity>

            <MyButton
                title={<CustomText fontFamily='Inter' fontSize={22} style={{ color: colors.text4, lineHeight: 22 }}>{isLoading ? 'Logging in...' : 'Log In'}</CustomText>}
                onPress={signInWithEmail}
                disabled={isLoading || !email.trim() || !password.trim()}
                style={[stylesLogin.loginButton, isLoading ? { opacity: 0.5 } : {},]}
            />

            <DividerWithText text={<CustomText fontFamily='Inter' fontSize={21} style={{ color: colors.textNoti, lineHeight: 21 }}>Or continute with</CustomText>} containerStyle={stylesLogin.lineSignIn_Up} />

            <MyButton
                backgroundColor='transparent'
                title={
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Icon category='icon_sign_up_in' name='google' style={{ width: 24, height: 24 }} />
                        <CustomText fontSize={21} style={{ color: colors.text5, lineHeight: 27 }}>Google</CustomText>
                    </View>
                }
                onPress={signInWithGoogle}
                disabled={!request}
                style={[stylesLogin.googleButton, { borderColor: colors.border }]}
            />

            <View style={stylesLogin.PageTransition}>
                <CustomText fontSize={16} style={{ color: colors.textNoti }}>Don't have an account? </CustomText>
                <TouchableOpacity onPress={() => router.push('./register')}>
                    <CustomText fontSize={18} style={{ color: colors.text2 }}>Sign Up</CustomText>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default Login;