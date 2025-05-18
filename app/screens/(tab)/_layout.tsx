import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Image, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import homeScreen from './home';
import messagesScreen from './message';
import createNewProject from './addProject';
import notificationScreen from './notification';
import scheduleScreen from './schedule';
import CustomText from '@/constants/CustomText';
import stylesHome from '@/styles/home';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '@/services/supabase';
import Icon from '@/components/Icon';
import { useThemeContext } from '@/context/ThemeContext';

const Tab = createBottomTabNavigator();

const CustomHeaderLeft = () => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
            <Icon category="topTab" name="back" style={{ width: 24, height: 24 }} />
        </TouchableOpacity>
    );
};

const CustomHeaderRight = ({ routeName }: { routeName: string }) => {
    const router = useRouter();
    let iconName = '';
    let onPressHandler = () => { };

    if (routeName === 'Messages') {
        iconName = 'edit';
        onPressHandler = () => router.push('../newMessage');
    }

    return (
        <TouchableOpacity style={styles.headerRight} onPress={onPressHandler}>
            {iconName ? <Icon category="topTab" name={iconName} style={{ width: 24, height: 24 }} /> : null}
        </TouchableOpacity>
    );
};

const TabRoot = () => {
    const router = useRouter();
    const [userName, setUserName] = useState('');
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const { colors } = useThemeContext();

    const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error fetching user:', error.message);
            return;
        }
        if (user) {
            setUserId(user.id);
            const { data, error: profileError } = await supabase
                .from('users')
                .select('full_name, avatar')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError.message);
            } else {
                setUserName(data.full_name || 'User');
                setUserAvatar(data.avatar || null);
            }
        }
    };

    useEffect(() => {
        fetchUser();

        if (userId) {
            const userChannel = supabase
                .channel('users')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
                    (payload) => {
                        console.log('User data changed:', payload);
                        fetchUser();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(userChannel);
            };
        }
    }, [userId]);

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerLeft: route.name !== 'Home' ? () => <CustomHeaderLeft /> : undefined,
                headerRight: () => <CustomHeaderRight routeName={route.name} />,
                headerTitle: () => (
                    <CustomText fontSize={22} style={[styles.headerTitle, { color: colors.text1 }]}>
                        {route.name}
                    </CustomText>
                ),
                headerTitleAlign: route.name === 'Home' ? 'left' : 'center',
                tabBarStyle: [
                    styles.tabBar,
                    { backgroundColor: colors.boxMenu },
                    route.name === 'Create New Project' ? { display: 'none' } : undefined,
                ],
                headerStyle: {
                    backgroundColor: colors.backgroundColor,
                    elevation: 0,
                    shadowOpacity: 0,
                },
                tabBarIcon: ({ focused }) => {
                    let category = 'tabbar' as const;
                    let name = '';

                    switch (route.name) {
                        case 'Home':
                            name = focused ? 'homeSelected' : 'home';
                            break;
                        case 'Messages':
                            name = focused ? 'chatSelected' : 'chat';
                            break;
                        case 'Create New Project':
                            return (
                                <View style={[styles.addTask, { backgroundColor: colors.boxAdd }]}>
                                    <Icon category="tabbar" name="addProject" style={styles.addTaskImage} />
                                </View>
                            );
                        case 'Notifications':
                            name = focused ? 'notiSelected' : 'noti';
                            break;
                        case 'Schedule':
                            name = focused ? 'calendarSelected' : 'calendar';
                            break;
                    }

                    return <Icon category={category} name={name} style={styles.tabIcon} />;
                },
                tabBarLabel: ({ focused }) =>
                    route.name === 'Create New Project' ? null : (
                        <CustomText
                            fontFamily={'InterRegular'}
                            fontSize={10}
                            style={{ color: focused ? '#FED36A' : '#617D8A', marginTop: 15 }}
                        >
                            {route.name}
                        </CustomText>
                    ),
            })}
        >
            <Tab.Screen
                name="Home"
                component={homeScreen}
                options={{
                    headerTitle: () => (
                        <View style={stylesHome.containerHeader}>
                            <View>
                                <CustomText
                                    fontFamily="InterMedium"
                                    style={[stylesHome.headerText1, { color: colors.text2 }]}
                                >
                                    Welcome Back!
                                </CustomText>
                                <CustomText
                                    fontFamily="Montserrat"
                                    style={[stylesHome.headerText2, { color: colors.text7 }]}
                                >
                                    {userName}
                                </CustomText>
                            </View>
                            <Pressable style={stylesHome.headerRight} onPress={() => router.push('../profile')}>
                                {userAvatar ? (
                                    <Image
                                        source={{ uri: userAvatar }}
                                        style={{ width: 47, height: 47, borderRadius: 24, marginLeft: 20 }}
                                    />
                                ) : (
                                    <Icon category="avatar" style={{ width: 47, height: 47 }} />
                                )}
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <Tab.Screen name="Messages" component={messagesScreen} />
            <Tab.Screen
                name="Create New Project"
                component={createNewProject}
                options={{ tabBarLabel: () => null, tabBarStyle: { display: 'none' } }}
            />
            <Tab.Screen name="Notifications" component={notificationScreen} />
            <Tab.Screen name="Schedule" component={scheduleScreen} />
        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    headerLeft: {
        left: 41,
        top: -12,
    },
    headerRight: {
        right: 41,
        top: -12,
    },
    headerTitle: {
        top: -12,
    },
    tabBar: {
        height: 87,
        borderTopWidth: 0,
    },
    tabIcon: {
        width: 24,
        height: 24,
        marginTop: 27,
        resizeMode: 'contain',
    },
    addTask: {
        width: 54,
        height: 54,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 40,
    },
    addTaskImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});

export default TabRoot;