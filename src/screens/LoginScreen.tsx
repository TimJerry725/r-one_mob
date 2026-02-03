import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS } from '../styles/futurist';
import { NeonButton } from '../components/NeonButton';
import { NeonInput } from '../components/NeonInput';
import { Logo } from '../components/Logo';
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '../context/ThemeContext';

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { colors, isDark } = useTheme();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // In a real app, validate and authenticate here
        navigation.navigate('MainTabs');
    };

    return (
        <LinearGradient
            colors={isDark ? [colors.background, '#000000'] : [colors.background, colors.surface]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ flex: 1 }}
                >
                    <ScrollView contentContainerStyle={styles.content}>

                        <View style={styles.logoContainer}>
                            {/* Logo centered */}
                            <Logo width={160} height={40} />
                        </View>

                        <View style={styles.formContainer}>
                            <NeonInput
                                label="Email ID"
                                placeholder="Enter your company email"
                                value={email}
                                onChangeText={setEmail}
                            />

                            <NeonInput
                                label="Password"
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />

                            <NeonButton
                                title="Login"
                                onPress={handleLogin}
                                style={styles.loginButton}
                            />

                            <TouchableOpacity style={styles.termsButton}>
                                <Text style={[styles.termsText, { color: colors.textSecondary }]}>Terms & conditions</Text>
                            </TouchableOpacity>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 60,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 60,
        marginTop: 40,
    },
    formContainer: {
        flex: 1,
    },
    loginButton: {
        marginTop: 20,
        marginBottom: 24,
    },
    termsButton: {
        alignItems: 'center',
        padding: 8,
    },
    termsText: {
        ...FONTS.body,
        fontSize: 14,
        textDecorationLine: 'underline',
        color: COLORS.textSecondary,
    }
});
