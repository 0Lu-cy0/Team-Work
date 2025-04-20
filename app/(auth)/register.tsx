// app/(auth)/register.tsx
import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from '@/services/supabase';
import { useAuth } from '@/context/AuthContext';
import { useThemeContext } from '@/context/ThemeContext';
import styleSignUp from '@/styles/login_signupStyle';
import ResizableLogoBox from '../../components/Logo';
import CustomText from '@/constants/CustomText';
import MyInputField from '@/components/MyInputField';
import MyButton from '@/components/MyButton';
import DividerWithText from '@/components/DividerWithText';
import Icon from '@/components/Icon';

const Register = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();
  const { colors } = useThemeContext();

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: '<890891709385-snblotj2m9rv443cbrhis6ipdbu0msfu.apps.googleusercontent.com>',
    redirectUri: 'https://<lfxwmqsymsslufddqklx>.supabase.co/auth/v1/callback',
  });

  useEffect(() => {
    if (session) {
      router.replace('./screens/(tab)');
    }
  }, [session]);

  const isRegisterDisabled = !fullName.trim() || !email.trim() || !password.trim() || !isChecked || isLoading;

  const signUpWithEmail = async (): Promise<void> => {
    if (!isChecked) {
      Alert.alert('Error', 'You need to agree to the terms and conditions to register.');
      return;
    }
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      // Thêm log chi tiết
      console.log('SignUp Response Data:', JSON.stringify(data, null, 2));
      console.log('SignUp Response Error:', JSON.stringify(error, null, 2));

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Success', 'Check your email to verify your account!');
        router.push('./login');
      }
    } catch (error) {
      // Log lỗi không mong đợi
      console.error('Unexpected SignUp Error:', JSON.stringify(error, null, 2));
      Alert.alert('Error', 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithGoogle = async (): Promise<void> => {
    try {
      await promptAsync();
    } catch (error: any) {
      console.error('Google SignUp Error:', JSON.stringify(error, null, 2));
      Alert.alert('Google Sign-In Error', error.message);
    }
  };

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      supabase.auth
        .signInWithIdToken({
          provider: 'google',
          token: id_token,
        })
        .then(({ error }) => {
          if (error) {
            console.error('Google SignIn Error:', JSON.stringify(error, null, 2));
            Alert.alert('Error', error.message);
          }
        });
    } else if (response?.type === 'error') {
      console.error('Google SignIn Response Error:', JSON.stringify(response.error, null, 2));
      Alert.alert('Google Sign-In Error', response.error?.message || 'Unknown error');
    }
  }, [response]);

  return (
    <View style={[styleSignUp.container, { backgroundColor: colors.backgroundColor }]}>
      <View style={{ alignItems: 'center' }}>
        <ResizableLogoBox />
      </View>
      <CustomText fontFamily='Inter' fontSize={32} style={[styleSignUp.text1, { color: colors.text5 }]}>Create your account</CustomText>
      <CustomText fontFamily='Inter' fontSize={21} style={[styleSignUp.text2, { color: colors.textNoti }]}>Full Name</CustomText>
      <MyInputField
        value={fullName}
        onChangeText={setFullName}
        placeholder='Enter your full name'
        leftIcon={<Icon category='icon_sign_up_in' name='user' style={{ width: 24, height: 24 }} />}
        style={[styleSignUp.inputEmailAndPassword]}
      />
      <CustomText fontFamily='Inter' fontSize={21} style={[styleSignUp.text2, { color: colors.textNoti }]}>Email</CustomText>
      <MyInputField
        value={email}
        onChangeText={setEmail}
        placeholder='Enter your email'
        leftIcon={<Icon category='icon_sign_up_in' name='email' style={{ width: 24, height: 24 }} />}
        style={[styleSignUp.inputEmailAndPassword]}
      />
      <CustomText fontFamily='Inter' fontSize={21} style={[styleSignUp.text2, { color: colors.textNoti }]}>Password</CustomText>
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
        style={styleSignUp.inputEmailAndPassword}
      />
      <View style={styleSignUp.termsContainer}>
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
          {isChecked ? (
            <Icon category='icon_sign_up_in' name='checked' style={{ width: 24, height: 24 }} />
          ) : (
            <Icon category='icon_sign_up_in' name='unChecked' style={{ width: 24, height: 24 }} />)}
        </TouchableOpacity>
        <View style={[styleSignUp.textTermsContainer, { flexDirection: 'row', flexWrap: 'wrap' }]}>
          <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.textNoti }]}>
            I have read & agreed to DayTask{' '}
          </CustomText>
          <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.text2, lineHeight: 17 }]}>
            Privacy Policy,
          </CustomText>
          <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.text2 }]}>
            {'\n'}
          </CustomText>
          <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.text2 }]}>
            Terms & Condition
          </CustomText>
        </View>
      </View>
      <MyButton
        title={
          <CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.text4 }}>
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </CustomText>
        }
        onPress={signUpWithEmail}
        disabled={isRegisterDisabled}
        style={[
          styleSignUp.signUpButton,
          { backgroundColor: colors.loading },
          ...(isRegisterDisabled ? [{ opacity: 0.5 }] : []),
        ]}
      />
      <DividerWithText
        containerStyle={styleSignUp.lineSignIn_Up}
        text={
          <CustomText fontFamily="InterMedium" fontSize={18} style={{ color: colors.text3 }}>
            Or continue with
          </CustomText>
        }
      />
      <MyButton
        backgroundColor='transparent'
        title={
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Icon category='icon_sign_up_in' name='google' style={{ width: 24, height: 24 }} />
            <CustomText fontSize={21} style={{ color: colors.text5, lineHeight: 27 }}>Google</CustomText>
          </View>
        }
        onPress={signUpWithGoogle}
        disabled={!request}
        style={[styleSignUp.googleButton, { borderColor: colors.border }]}
      />
      <View style={styleSignUp.PageTransition}>
        <CustomText fontFamily="InterMedium" fontSize={16} style={{ color: colors.text3 }}>
          Already have an account?{' '}
        </CustomText>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.text2, lineHeight: 25 }}>
            Log In
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;