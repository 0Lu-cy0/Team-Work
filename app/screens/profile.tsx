import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/services/supabase';
import CustomText from '@/constants/CustomText';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';

// Định nghĩa kiểu cho user
interface User {
    full_name: string;
    email: string;
    avatar: string | null;
}

const Profile = () => {
    const router = useRouter();
    const [user, setUser] = useState<User>({ full_name: '', email: '', avatar: null });
    const [isSettingOpen, setIsSettingOpen] = useState(false);
    const [theme, setTheme] = useState('dark'); // Mặc định là dark

    // Lấy thông tin người dùng từ Supabase
    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser }, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Error fetching user:', error.message);
                return;
            }
            if (authUser) {
                const { data, error: profileError } = await supabase
                    .from('users')
                    .select('full_name, email, avatar')
                    .eq('id', authUser.id)
                    .single();

                if (profileError) {
                    console.error('Error fetching profile:', profileError.message);
                } else {
                    setUser({
                        full_name: data.full_name ?? 'User',
                        email: data.email ?? authUser.email ?? '',
                        avatar: data.avatar ?? null,
                    });
                }
            }
        };
        fetchUser();
    }, []);

    // Hàm chọn ảnh từ thư viện
    const pickImage = async () => {
        const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (permissionResult.granted === false) {
            Alert.alert("Permission Denied", "You've refused to allow this app to access your photos!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!pickerResult.canceled) {
            const selectedAsset = pickerResult.assets[0];
            uploadImage(selectedAsset.uri, user.email); // Truyền email từ state
        }
    };

    // Hàm tải ảnh lên Supabase Storage và cập nhật bảng users
    const uploadImage = async (uri: string, email: string) => {
        try {
            // Lấy user ID từ phiên đăng nhập
            const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
            if (userError || !authUser) {
                throw new Error('No user found');
            }

            // Tạo tên file duy nhất cho avatar mới
            const fileName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;

            // Chuyển URI thành ArrayBuffer
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            // Kiểm tra và xóa avatar cũ nếu tồn tại (dùng state user.avatar)
            if (user.avatar) {
                const oldFileName = user.avatar.split('/').pop(); // Lấy tên file từ URL
                if (oldFileName) {
                    const { error: removeError } = await supabase.storage
                        .from('teamwork')
                        .remove([oldFileName]);

                    if (removeError) {
                        console.error('Error removing old avatar:', removeError.message);
                    } else {
                        console.log('Old avatar removed successfully:', oldFileName);
                    }
                }
            }

            // Tải ảnh mới lên bucket 'teamwork'
            const { error: uploadError } = await supabase.storage
                .from('teamwork')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) {
                throw uploadError;
            }

            // Lấy URL công khai của ảnh mới
            const { data: publicUrlData } = supabase.storage
                .from('teamwork')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            // Cập nhật URL vào bảng users
            const { error: updateError } = await supabase
                .from('users')
                .update({ avatar: publicUrl })
                .eq('id', authUser.id); // Dùng authUser.id thay vì user.id

            if (updateError) {
                throw updateError;
            }

            // Cập nhật state để hiển thị ảnh mới
            setUser((prev) => ({ ...prev, avatar: publicUrl }));
            Alert.alert('Success', 'Avatar updated successfully!');
        } catch (error: unknown) {
            if (error instanceof Error) {
                console.error('Error uploading image:', error.message);
            } else {
                console.error('An unknown error occurred:', error);
            }
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
    };

    // Hàm đăng xuất
    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            router.push('/login');
        }
    };

    // Hàm chuyển đổi theme
    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#212832' : '#FFFFFF' }]}>
            {/* Header */}
            <CustomText fontFamily="Montserrat" fontSize={18} style={styles.headerTitle}>
                Profile
            </CustomText>

            {/* Avatar */}
            <View style={styles.avatarContainer}>
                <Image
                    source={
                        user.avatar
                            ? { uri: user.avatar }
                            : require('@/assets/images/Avatar/Ellipse 36.png')
                    }
                    style={styles.avatar}
                />
                <TouchableOpacity style={styles.editAvatar} onPress={pickImage}>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/e2e98082-960a-4970-bb96-0b5b27337190' }}
                        style={styles.editIcon}
                    />
                </TouchableOpacity>
            </View>

            {/* Thông tin người dùng */}
            <View style={styles.infoContainer}>
                {/* Tên người dùng */}
                <TouchableOpacity style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/user-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            {user.full_name}
                        </CustomText>
                    </View>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/edit-icon.png' }}
                        style={styles.editIcon}
                    />
                </TouchableOpacity>

                {/* Email */}
                <TouchableOpacity style={styles.infoRow}>
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/email-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            {user.email}
                        </CustomText>
                    </View>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/edit-icon.png' }}
                        style={styles.editIcon}
                    />
                </TouchableOpacity>

                {/* Password */}
                <TouchableOpacity style={styles.infoRow} onPress={() => console.log('Tính năng đang phát triển')}>
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/password-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            Password
                        </CustomText>
                    </View>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/chevron-right.png' }}
                        style={styles.chevron}
                    />
                </TouchableOpacity>

                {/* My Tasks */}
                <TouchableOpacity style={styles.infoRow} onPress={() => console.log('Tính năng đang phát triển')}>
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/tasks-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            My Tasks
                        </CustomText>
                    </View>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/chevron-right.png' }}
                        style={styles.chevron}
                    />
                </TouchableOpacity>

                {/* Privacy */}
                <TouchableOpacity style={styles.infoRow} onPress={() => console.log('Tính năng đang phát triển')}>
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/privacy-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            Privacy
                        </CustomText>
                    </View>
                    <Image
                        source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/chevron-right.png' }}
                        style={styles.chevron}
                    />
                </TouchableOpacity>

                {/* Setting (có dropdown) */}
                <TouchableOpacity
                    style={styles.infoRow}
                    onPress={() => setIsSettingOpen(!isSettingOpen)}
                >
                    <View style={styles.infoRowLeft}>
                        <Image
                            source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/setting-icon.png' }}
                            style={styles.icon}
                        />
                        <CustomText fontFamily="InterMedium" fontSize={16} style={styles.infoText}>
                            Setting
                        </CustomText>
                    </View>
                    <Image
                        source={{
                            uri: isSettingOpen
                                ? 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/chevron-down.png'
                                : 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/chevron-right.png'
                        }}
                        style={styles.chevron}
                    />
                </TouchableOpacity>

                {/* Dropdown cho Setting */}
                {isSettingOpen && (
                    <View style={styles.dropdown}>
                        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
                            <CustomText fontFamily="InterMedium" fontSize={16} style={styles.themeText}>
                                {theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                )}
            </View>

            {/* Nút Logout */}
            <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
                <Image
                    source={{ uri: 'https://figma-alpha-api.s3.us-west-2.amazonaws.com/images/logout-icon.png' }}
                    style={styles.logoutIcon}
                />
                <CustomText fontFamily="InterMedium" fontSize={16} style={styles.logoutText}>
                    Logout
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 50,
    },
    headerTitle: {
        color: '#FFFFFF',
        textAlign: 'center',
    },
    avatarContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#FED36A',
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: '40%',
        backgroundColor: '#FED36A',
        borderRadius: 15,
        padding: 5,
    },
    editIcon: {
        width: 20,
        height: 20,
    },
    infoContainer: {
        marginHorizontal: 20,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#263238',
        padding: 15,
        borderRadius: 10,
        marginVertical: 5,
    },
    infoRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    infoText: {
        color: '#FFFFFF',
    },
    chevron: {
        width: 20,
        height: 20,
    },
    dropdown: {
        backgroundColor: '#2E3A44',
        padding: 10,
        borderRadius: 10,
        marginVertical: 5,
        marginHorizontal: 20,
    },
    themeButton: {
        padding: 10,
        backgroundColor: '#FED36A',
        borderRadius: 5,
        alignItems: 'center',
    },
    themeText: {
        color: '#212832',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FED36A',
        padding: 15,
        borderRadius: 10,
        margin: 20,
    },
    logoutIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    logoutText: {
        color: '#212832',
    },
});

export default Profile;