import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONTS } from '../styles/futurist';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const PRIORITIES = ['Low', 'Medium', 'High'];

import { useTheme } from '../context/ThemeContext';

export const CreateTaskScreen = () => {
    const navigation = useNavigation();
    const { colors } = useTheme();
    const [priority, setPriority] = useState('Low');

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { backgroundColor: colors.surface }]}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text }]}>New task</Text>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.iconButton, { backgroundColor: colors.primary }]}>
                        <Ionicons name="checkmark" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <TextInput
                        style={[styles.titleInput, { color: colors.text }]}
                        placeholder="Task title"
                        placeholderTextColor={colors.textSecondary}
                        defaultValue="Application architecture"
                    />

                    <View style={styles.descriptionContainer}>
                        <Text style={[styles.descText, { color: colors.textSecondary }]}>
                            Designing the structural foundation, components of the application to ensure
                            <Text style={{ backgroundColor: colors.primary, color: colors.white }}> scalability and efficiency</Text>
                        </Text>
                    </View>

                    <TouchableOpacity style={styles.actionRow}>
                        <Ionicons name="person-add" size={20} color={colors.textSecondary} />
                        <Text style={[styles.actionText, { color: colors.textSecondary }]}>Add assignee</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <TouchableOpacity style={styles.actionRow}>
                        <Ionicons name="calendar" size={20} color={colors.textSecondary} />
                        <Text style={[styles.actionText, { color: colors.textSecondary }]}>Set due date</Text>
                    </TouchableOpacity>

                    <View style={[styles.divider, { backgroundColor: colors.border }]} />

                    <Text style={[styles.label, { color: colors.textSecondary }]}>Priority</Text>
                    <View style={[styles.priorityContainer, { backgroundColor: colors.surface }]}>
                        {PRIORITIES.map(p => (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityTab,
                                    priority === p && { borderColor: colors.success, borderWidth: 1 }
                                ]}
                                onPress={() => setPriority(p)}
                            >
                                <Text style={[
                                    styles.priorityText,
                                    { color: colors.textSecondary },
                                    priority === p && { color: colors.success }
                                ]}>{p}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                </ScrollView>
                {/* Keyboard simulation would be handled by OS in real app */}
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
    },
    content: {
        padding: 20,
    },
    titleInput: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    descriptionContainer: {
        marginBottom: 30,
    },
    descText: {
        color: COLORS.textSecondary,
        fontSize: 16,
        lineHeight: 24,
    },
    actionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 16,
    },
    actionText: {
        color: COLORS.textSecondary,
        fontSize: 16,
    },
    divider: {
        height: 1,
        backgroundColor: COLORS.border,
    },
    label: {
        color: COLORS.textSecondary,
        marginTop: 24,
        marginBottom: 12,
    },
    priorityContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: 4,
        borderRadius: 25,
    },
    priorityTab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 20,
    },
    activePriority: {
        borderColor: COLORS.success,
        borderWidth: 1,
    },
    priorityText: {
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
});
