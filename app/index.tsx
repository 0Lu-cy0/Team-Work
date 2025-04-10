import { useRouter } from "expo-router";
import { SafeAreaView, View } from "react-native";
import MyButton from "@/components/MyButton";
import ResizableLogoBox from "../components/Logo";
import React, { useEffect } from "react";
import CustomText from "@/constants/CustomText";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggleButton";
import { useThemeContext } from "@/context/ThemeContext";
import styles from "../styles/splashStyle";
import Icon from "@/components/Icon";

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
        <CustomText style={{ color: colors.text3 }}>Loading...</CustomText>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
      <View style={styles.viewLogo}>
        <ResizableLogoBox />
      </View>
      <View style={styles.viewImage}>
        <Icon category="splash" style={{ width: '100%', height: '100%' }} />
      </View>
      <View style={styles.viewText}>
        <CustomText fontFamily="InterMedium" fontSize={70} style={[styles.text, { color: colors.text1 }]}>
          Manage {"\n"}
          your {"\n"}
          Task with {"\n"}
          <CustomText fontFamily="InterMedium" fontSize={70} style={{ color: colors.text2 }}>
            DayTask
          </CustomText>
        </CustomText>
      </View>
      <View style={styles.viewLetstart}>
        <MyButton
          title={<CustomText fontFamily="Inter" fontSize={18} style={{ color: colors.text4 }}>Let's Start</CustomText>}
          onPress={onContinue}
          style={[styles.letStartBox, { backgroundColor: colors.box1 }]}
        />
      </View>
    </View>
  );
}