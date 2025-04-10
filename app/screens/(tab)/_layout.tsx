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
        iconName = 'add';
        onPressHandler = () => router.push('../newMessage');
    } else if (routeName === 'Schedule') {
        iconName = 'filter';
    }

    return (
        <TouchableOpacity style={styles.headerRight} onPress={onPressHandler}>
            {iconName ? <Icon category="screens" name={iconName} style={{ width: 24, height: 24 }} /> : null}
        </TouchableOpacity>
    );
};

const TabRoot = () => {
    const router = useRouter();
    const [userName, setUserName] = useState(''); // State để lưu tên người dùng
    const [userAvatar, setUserAvatar] = useState<string | null>(null); // State để lưu URL avatar
    const [userId, setUserId] = useState<string | null>(null); // Lưu user ID để lọc real-time

    // Hàm lấy thông tin người dùng từ Supabase
    const fetchUser = async () => {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) {
            console.error('Error fetching user:', error.message);
            return;
        }
        if (user) {
            setUserId(user.id); // Lưu user ID
            const { data, error: profileError } = await supabase
                .from('users') // Đảm bảo bảng này đúng (có thể là 'profiles')
                .select('full_name, avatar')
                .eq('id', user.id)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError.message);
            } else {
                setUserName(data.full_name || 'User'); // Cập nhật tên
                setUserAvatar(data.avatar || null); // Cập nhật avatar
            }
        }
    };

    // Thiết lập thông tin người dùng và real-time subscription
    useEffect(() => {
        fetchUser();

        // Chỉ thiết lập subscription khi đã có userId
        if (userId) {
            const userChannel = supabase
                .channel('users')
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: 'users', filter: `id=eq.${userId}` },
                    (payload) => {
                        console.log('User data changed:', payload);
                        fetchUser(); // Cập nhật lại cả tên và avatar khi có thay đổi
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(userChannel);
            };
        }
    }, [userId]); // Chạy lại khi userId thay đổi

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={({ route }) => ({
                headerLeft: route.name !== 'Home' ? () => <CustomHeaderLeft /> : undefined,
                headerRight: () => <CustomHeaderRight routeName={route.name} />,
                headerTitle: () => (
                    <CustomText fontFamily="Montserrat" fontSize={18} style={styles.headerTitle}>
                        {route.name}
                    </CustomText>
                ),
                headerTitleAlign: route.name === 'Home' ? 'left' : 'center',
                tabBarStyle: [
                    styles.tabBar,
                    route.name === 'Create New Project' ? { display: 'none' } : undefined,
                ],
                headerStyle: {
                    backgroundColor: '#212832',
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
                                <View style={styles.addTask}>
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
                            fontFamily={'InterReguler'}
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
                                    style={stylesHome.headerText1}
                                >
                                    Welcome Back!
                                </CustomText>
                                <CustomText
                                    fontFamily="Montserrat"
                                    style={stylesHome.headerText2}
                                >
                                    {userName}
                                </CustomText>
                            </View>
                            <Pressable style={stylesHome.headerRight} onPress={() => router.push('../profile')}>
                                {userAvatar ? (
                                    <Image
                                        source={{ uri: userAvatar }}
                                        style={{ width: 32, height: 32, borderRadius: 16 }}
                                    />
                                ) : (
                                    <Icon category="avatar" style={{ width: 32, height: 32 }} />
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
        color: '#FFFFFF',
    },
    tabBar: {
        backgroundColor: '#263238',
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
        backgroundColor: '#FED36A',
    },
    addTaskImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});

export default TabRoot;