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

const Tab = createBottomTabNavigator();

const CustomHeaderLeft = () => {
    const navigation = useNavigation();

    return (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerLeft}>
            <Image
                source={{
                    uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/73bab2b3-7af2-4c18-8925-df3a35fd3758',
                }}
                style={{ width: 24, height: 24 }}
            />
        </TouchableOpacity>
    );
};

const CustomHeaderRight = ({ routeName }: { routeName: string }) => {
    const router = useRouter();
    let iconUri = '';
    let onPressHandler = () => { };

    if (routeName === 'Messages') {
        iconUri = 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/aab647bb-3d80-4f84-ae50-8dfcd9de6a7b';
        onPressHandler = () => router.push('../newMessage');
    } else if (routeName === 'Schedule') {
        iconUri = 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/929d193f-258d-4264-afa9-f7c94018fe2e';
    }

    return (
        <TouchableOpacity style={styles.headerRight} onPress={onPressHandler}>
            {iconUri ? <Image source={{ uri: iconUri }} style={{ width: 24, height: 24 }} /> : null}
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
                .from('users')
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

            // Dọn dẹp kênh khi component unmount hoặc userId thay đổi
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
                    let iconSource;

                    switch (route.name) {
                        case 'Home':
                            iconSource = focused
                                ? 'https://figma-alpha-api.s3.us#25818a'
                                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/f2d115b5-0641-4d9f-9dd9-7b970e63e509';
                            break;
                        case 'Messages':
                            iconSource = focused
                                ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/4a0519b6-d83d-4816-83db-e3d98a0e5ba9'
                                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/83441d8f-afac-451a-a2b5-d9d16cb5a3db';
                            break;
                        case 'Create New Project':
                            return (
                                <View style={styles.addTask}>
                                    <Image
                                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e2e98082-960a-4970-bb96-0b5b27337190' }}
                                        style={styles.addTaskImage}
                                    />
                                </View>
                            );
                        case 'Notifications':
                            iconSource = focused
                                ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/f724cb06-2ae9-446a-bf98-5f113e10c8d9'
                                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/56ce408b-e5e3-45fa-bdfa-146764e600cf';
                            break;
                        case 'Schedule':
                            iconSource = focused
                                ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/0f10e080-bb23-4141-9937-c6710a7633f9'
                                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/cb345231-db03-4353-a6b5-b5e9a57c8e51';
                            break;
                    }

                    return <Image source={{ uri: iconSource }} style={styles.tabIcon} />;
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
                                <Image
                                    source={
                                        userAvatar
                                            ? { uri: userAvatar }
                                            : require('@/assets/images/Avatar/Ellipse 36.png')
                                    }
                                    style={{ width: 36, height: 36, borderRadius: 18 }}
                                />
                            </Pressable>
                        </View>
                    ),
                }}
            />
            <Tab.Screen name="Messages" component={messagesScreen} />
            <Tab.Screen name="Create New Project" component={createNewProject} options={{ tabBarLabel: () => null, tabBarStyle: { display: 'none' } }} />
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