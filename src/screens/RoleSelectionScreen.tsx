import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NeonButton } from '../components/NeonButton';
import { Logo } from '../components/Logo';
import { useTheme } from '../context/ThemeContext';

export const RoleSelectionScreen = () => {
    const navigation = useNavigation<any>();
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <View style={styles.brandBlock}>
                        <Logo width={140} height={34} />
                    </View>
                    <View style={[styles.card, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <Text style={[styles.title, { color: colors.text }]}>Select Your Role</Text>
                        <View style={styles.buttonContainer}>
                            <NeonButton
                                title="Field Team"
                                onPress={() => navigation.navigate('MainTabs')}
                                style={styles.button}
                            />
                            <NeonButton
                                title="Admin/Central Team"
                                onPress={() => navigation.navigate('AdminTeam')}
                                style={styles.button}
                            />
                        </View>
                    </View>
                </View>
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
        marginBottom: 32,
    },
    card: {
        borderRadius: 16,
        padding: 24,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 6,
    },
    title: {
        fontFamily: 'RedHatDisplay_700Bold',
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 24,
    },
    buttonContainer: {
        gap: 16,
    },
    button: {
        width: '100%',
    },
});
