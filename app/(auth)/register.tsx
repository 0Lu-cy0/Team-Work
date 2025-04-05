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
      <ResizableLogoBox />
      <CustomText style={[styleSignUp.text1, { color: colors.textColor }]}>Create your account</CustomText>
      <CustomText style={[styleSignUp.text2, { color: colors.textColor }]}>Full Name</CustomText>
      <MyInputField
        value={fullName}
        onChangeText={setFullName}
        placeholder="Enter your full name"
        leftIcon={
          <Image
            source={{
              uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/3caff157-2efa-4052-95fd-f178e49fd5c9',
            }}
            style={{ width: 24, height: 24 }}
          />
        }
        style={styleSignUp.inputEmailAndPassword}
      />
      <CustomText style={[styleSignUp.text3, { color: colors.textColor }]}>Email Address</CustomText>
      <MyInputField
        value={email}
        onChangeText={setEmail}
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon={
          <Image
            source={{
              uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/01c3956b-50b9-4793-819f-54b0e1af8a2a',
            }}
            style={{ width: 24, height: 24 }}
          />
        }
        style={styleSignUp.inputEmailAndPassword}
      />
      <CustomText style={[styleSignUp.text3, { color: colors.textColor }]}>Password</CustomText>
      <MyInputField
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
        leftIcon={
          <Image
            source={{
              uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/484553ed-cffc-478e-8665-5a9353dafde4',
            }}
            style={{ width: 24, height: 24 }}
          />
        }
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Image
              source={{
                uri: showPassword
                  ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/dc42c0ed-eae3-440a-8b19-f9b5842a5869'
                  : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e8912b8a-d4c8-456b-90fd-f8ebae2af43d',
              }}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
        }
        style={styleSignUp.inputEmailAndPassword}
      />
      <View style={styleSignUp.termsContainer}>
        <TouchableOpacity onPress={() => setIsChecked(!isChecked)}>
          <Image
            source={{
              uri: isChecked
                ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/6f39f8db-578b-4436-ae45-5103af475330'
                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/eb5662b6-1b13-4050-9be8-be99b6ef85cb',
            }}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <View style={styleSignUp.textTermsContainer}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.textColor }]}>
              I have read & agreed to DayTask{' '}
            </CustomText>
            <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.accentColor, lineHeight: 17 }]}>
              Privacy Policy,
            </CustomText>
            <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.textColor }]}>
              {'\n'}
            </CustomText>
            <CustomText fontFamily="Inter" style={[styleSignUp.text7, { color: colors.accentColor }]}>
              Terms & Condition
            </CustomText>
          </View>
        </View>
      </View>
      <MyButton
        title={
          <CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.textColor }}>
            {isLoading ? 'Registering...' : 'Register'}
          </CustomText>
        }
        onPress={signUpWithEmail}
        disabled={isRegisterDisabled}
        style={[
          styleSignUp.signUpButton,
          { backgroundColor: colors.accentColor },
          ...(isRegisterDisabled ? [{ opacity: 0.5 }] : []),
        ]}
      />
      <DividerWithText
        containerStyle={styleSignUp.lineSignIn_Up}
        text={
          <CustomText fontFamily="InterMedium" fontSize={18} style={{ color: colors.secondaryTextColor }}>
            Or continue with
          </CustomText>
        }
      />
      <MyButton
        backgroundColor="transparent"
        title={
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source={{
                uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/af3d1608-6525-47dc-9f96-1c952c827e7b',
              }}
              style={styleSignUp.googleIconStyle}
            />
            <CustomText fontFamily="InterMedium" fontSize={18} style={{ color: colors.textColor }}>
              Google
            </CustomText>
          </View>
        }
        onPress={signUpWithGoogle}
        disabled={!request}
        style={[styleSignUp.googleButton, { borderColor: colors.borderColor }]}
      />
      <View style={styleSignUp.PageTransition}>
        <CustomText fontFamily="InterMedium" fontSize={16} style={{ color: colors.secondaryTextColor }}>
          Already have an account?{' '}
        </CustomText>
        <TouchableOpacity onPress={() => router.push('/login')}>
          <CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.accentColor }}>
            Log In
          </CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Register;