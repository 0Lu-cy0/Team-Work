import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image, TouchableOpacity, Alert } from 'react-native';
import { supabase } from '@/services/supabase';
import { Database } from '@/services/database.types';
import CustomText from '@/constants/CustomText';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import Icon from '@/components/Icon';
import ProfileField from '@/components/ProfileField';
import { useThemeContext } from '@/context/ThemeContext';
import ThemeToggleButton from '@/components/ThemeToggleButton';
import Head from '@/components/Head';
interface User {
    full_name: string;
    email: string;
    avatar: string | null;
}

const Profile = () => {
    const router = useRouter();
    const { colors } = useThemeContext();
    const [user, setUser] = useState<User>({ full_name: '', email: '', avatar: null });
    const [isSettingOpen, setIsSettingOpen] = useState(false);

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
                    .select('full_name, email, avatar') // Xóa theme khỏi select
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
            uploadImage(selectedAsset.uri, user.email);
        }
    };

    const uploadImage = async (uri: string, email: string) => {
        try {
            const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
            if (userError || !authUser) throw new Error('No user found');

            const fileName = `${email.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.jpg`;
            const response = await fetch(uri);
            const blob = await response.blob();
            const arrayBuffer = await new Response(blob).arrayBuffer();

            if (user.avatar) {
                const oldFileName = user.avatar.split('/').pop();
                if (oldFileName) {
                    const { error: removeError } = await supabase.storage
                        .from('teamwork')
                        .remove([oldFileName]);
                    if (removeError) console.error('Error removing old avatar:', removeError.message);
                }
            }

            const { error: uploadError } = await supabase.storage
                .from('teamwork')
                .upload(fileName, arrayBuffer, {
                    contentType: 'image/jpeg',
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            const { data: publicUrlData } = supabase.storage
                .from('teamwork')
                .getPublicUrl(fileName);

            const publicUrl = publicUrlData.publicUrl;

            const updateData: Partial<Database['public']['Tables']['users']['Update']> = {
                avatar: publicUrl,
            };

            const { error: updateError } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', authUser.id);

            if (updateError) throw updateError;

            setUser((prev) => ({ ...prev, avatar: publicUrl }));
            Alert.alert('Success', 'Avatar updated successfully!');
        } catch (error: unknown) {
            console.error('Error uploading image:', error instanceof Error ? error.message : error);
            Alert.alert('Error', 'Failed to update avatar. Please try again.');
        }
    };

    const signOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            router.push('/login');
        }
    };

    const updateUserField = async (field: keyof User, value: string) => {
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (!authUser) return;

            const updateData: Partial<Database['public']['Tables']['users']['Update']> = {
                [field]: value,
            };

            const { error } = await supabase
                .from('users')
                .update(updateData)
                .eq('id', authUser.id);

            if (error) throw error;

            setUser((prev) => ({ ...prev, [field]: value }));
        } catch (error) {
            console.error(`Error updating ${field}:`, error);
            Alert.alert('Error', `Failed to update ${field}`);
        }
    };

    const handleGoBack = () => {
        try {
            router.back();
        } catch (error) {
            logger.error("Error in handleGoBack", error);
        }
    };

    const logger = {
        error: (message: string, error: any, context?: any) => {
            console.error(`[TaskDetails] ${message}`, {
                error: error?.message || error,
                stack: error?.stack,
                context,
                timestamp: new Date().toISOString(),
            });
        },
        warn: (message: string, context?: any) => {
            console.warn(`[TaskDetails] ${message}`, {
                context,
                timestamp: new Date().toISOString(),
            });
        },
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.backgroundColor }]}>
            <Head
                onLeftPress={handleGoBack}
                showRightIcon={false}
            >
                <CustomText fontFamily='Inter' fontSize={25} style={[{ color: colors.text7, marginRight: 20 }]}>Profile</CustomText>
            </Head>
            <ThemeToggleButton />

            <View style={styles.avatarContainer}>
                {user.avatar ? (
                    <Image source={{ uri: user.avatar }} style={[styles.avatar, { borderColor: colors.box1 }]} />
                ) : (
                    <Icon category="avatar" style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.box1 }} />
                )}
                <TouchableOpacity style={[styles.editAvatar, { backgroundColor: colors.backgroundColor }]} onPress={pickImage}>
                    <Icon category="profile" name="avatarEditing" style={{ width: 20, height: 20 }} />
                </TouchableOpacity>
            </View>

            <View>
                <ProfileField
                    iconCategory="profile"
                    iconName="userName"
                    iconRightName='edit'
                    label="Name"
                    value={user.full_name}
                    onUpdate={(value) => updateUserField('full_name', value)}
                />
                <ProfileField
                    iconCategory="profile"
                    iconName="email"
                    iconRightName='edit'
                    label="Email"
                    value={user.email}
                    onUpdate={(value) => updateUserField('email', value)}
                />
                <ProfileField
                    iconCategory="profile"
                    iconName="password"
                    iconRightName='edit'
                    isPassword={true}
                    label="Password"
                    value="Password"
                />
                <ProfileField
                    iconCategory="profile"
                    iconName="myTask"
                    iconRightName='more'
                    label="My Tasks"
                    value="My Tasks"
                    canEdit={false}
                />
                <ProfileField
                    iconCategory="profile"
                    iconName="privacy"
                    iconRightName='more'
                    label="Privacy"
                    value="Privacy"
                    canEdit={false}
                />
                <ProfileField
                    iconCategory="profile"
                    iconName="setting"
                    iconRightName='more'
                    label="Setting"
                    value="Setting"
                    canEdit={false}
                />
            </View>

            <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.box1 }]} onPress={signOut}>
                <Icon category="profile" name="logout" style={styles.logoutIcon} />
                <CustomText fontFamily="InterMedium" fontSize={16} style={{ color: colors.text4 }}>
                    Logout
                </CustomText>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 19,
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
    },
    editAvatar: {
        position: 'absolute',
        bottom: 0,
        right: '40%',
        borderRadius: 15,
        padding: 5,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
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
    chevron: {
        width: 20,
        height: 20,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
    },
    logoutIcon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
});

export default Profile;