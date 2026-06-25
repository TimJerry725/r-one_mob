import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NeonButton } from '../components/NeonButton';
import { NeonInput } from '../components/NeonInput';
import { Logo } from '../components/Logo';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';

const getDisplayName = (email: string) => {
    const localPart = email.split('@')[0]?.trim();
    if (!localPart) {
        return 'Technician';
    }

    const cleaned = localPart
        .replace(/[._-]+/g, ' ')
        .split(' ')
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase());

    return cleaned[0] ?? 'Technician';
};

export const LoginScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();
    const { setSession } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        setSession({
            email,
            displayName: getDisplayName(email),
        });
        navigation.navigate('RoleSelection');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.safeArea}
                >
                    <View style={styles.content}>
                        <View style={styles.brandBlock}>
                            <Logo width={140} height={34} />
                        </View>
                        <View style={[styles.formCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                            <NeonInput
                                label="Email"
                                placeholder="name@company.com"
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
                                style={styles.button}
                            />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
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
        flex: 1,
        justifyContent: 'center',
        padding: 24,
    },
    brandBlock: {
        alignItems: 'center',
        marginBottom: 20,
    },
    formCard: {
        borderRadius: 16,
        padding: 22,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },
    button: {
        marginTop: 6,
    },
});
