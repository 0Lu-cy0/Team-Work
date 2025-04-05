// index.tsx
import { useRouter } from "expo-router";
import { SafeAreaView, View, Image } from "react-native";
import MyButton from "@/components/MyButton";
import ResizableLogoBox from "../components/Logo";
import React, { useEffect } from "react";
import CustomText from "@/constants/CustomText";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggleButton";
import { useThemeContext } from "@/context/ThemeContext";
import styles from "../styles/splashStyle";

export default function Index() {
  const router = useRouter();
  const { session, loading } = useAuth();
  const { colors } = useThemeContext();

  useEffect(() => {
    if (!loading && session) {
      router.replace('./screens/(tab)');
    }
  }, [loading, session]);

  const onContinue = () => {
    router.push("./(auth)/login");
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
        <CustomText style={{ color: colors.textColor }}>Loading...</CustomText>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
      <View style={styles.viewLogo}>
        <ResizableLogoBox />
        <ThemeToggle />
      </View>
      <View style={styles.viewImage}>
        <Image source={require('@/assets/images/Splash/Splash.png')} style={[styles.image, { backgroundColor: colors.textColor }]} />
      </View>
      <View style={styles.viewText}>
        <CustomText fontFamily="InterMedium" fontSize={70} style={[styles.text, { color: colors.textColor }]}>
          Manage {"\n"}
          your {"\n"}
          Task with {"\n"}
          <CustomText fontFamily="InterMedium" fontSize={70} style={{ color: colors.accentColor }}>
            DayTask
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.viewLetstart}>
        <MyButton
          title={<CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.textColor }}>Let's Start</CustomText>}
          onPress={onContinue}
          style={[styles.letStartBox, { backgroundColor: colors.accentColor }]}
        />
      </View>
    </View>
  );
}