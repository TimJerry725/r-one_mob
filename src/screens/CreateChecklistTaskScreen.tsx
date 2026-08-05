import React, { useState } from 'react';
import {
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import {
    ChecklistTaskDraft,
    DATA_TYPES,
    getSelectorOptions,
    TaskDraftResult,
} from '../data/createTaskOptions';
import { PopoverDropdown } from '../components/PopoverDropdown';

export const CreateChecklistTaskScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const isFocused = useIsFocused();
    const { colors } = useTheme();
    const insets = useSafeAreaInsets();

    const [taskTitle, setTaskTitle] = useState('');
    const [dataType, setDataType] = useState<typeof DATA_TYPES[number]>('Short text');
    const [taskOptions, setTaskOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState('');



    const addOption = () => {
        if (newOption.trim() && !taskOptions.includes(newOption.trim())) {
            setTaskOptions((current) => [...current, newOption.trim()]);
            setNewOption('');
        }
    };

    const removeOption = (index: number) => {
        setTaskOptions((current) => current.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handleSave = () => {
        if (!taskTitle.trim()) {
            return;
        }

        const task: ChecklistTaskDraft = {
            title: taskTitle.trim(),
            dataType,
            options: ['Multiple Choice', 'Radio button', 'Dropdown'].includes(dataType) ? [...taskOptions] : [],
        };

        const taskDraftResult: TaskDraftResult = {
            task,
            token: Date.now(),
        };

        navigation.navigate({
            name: 'CreateTask',
            params: { taskDraftResult },
            merge: true,
        });
    };

    if (!isFocused) {
        return null;
    }

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={handleClose} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardLayer}
            >
                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.background,
                            paddingBottom: Math.max(insets.bottom, 12),
                            shadowColor: colors.shadow,
                        },
                    ]}
                >
                    <View style={[styles.handle, { backgroundColor: colors.border }]} />
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text }]}>Add Task</Text>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[styles.closeButton, { backgroundColor: colors.surfaceHighlight }]}
                        >
                            <Ionicons name="close" size={20} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                        <View>
                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Task title</Text>
                            <TextInput
                                value={taskTitle}
                                onChangeText={setTaskTitle}
                                style={[styles.input, getInputShellStyle(colors), { color: colors.text }]}
                                placeholder="Enter custom task/question title"
                                placeholderTextColor={colors.textSecondary}
                            />
                        </View>

                        <View style={{ zIndex: 100 }}>
                            <PopoverDropdown
                                label="Data type"
                                placeholder="Select data type"
                                options={getSelectorOptions('dataType').options}
                                value={dataType}
                                onSelect={(val) => setDataType(val as any)}
                                placement="top"
                            />
                        </View>

                        {['Multiple Choice', 'Radio button', 'Dropdown'].includes(dataType) ? (
                            <View style={styles.optionSection}>
                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Options</Text>
                                {taskOptions.map((option, index) => (
                                    <View key={`${option}-${index}`} style={[styles.optionRow, { backgroundColor: colors.surfaceHighlight }]}>
                                        <Text style={[styles.optionText, { color: colors.text }]}>{option}</Text>
                                        <TouchableOpacity onPress={() => removeOption(index)}>
                                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                                <View style={styles.optionComposer}>
                                    <TextInput
                                        style={[styles.input, styles.optionInput, getInputShellStyle(colors), { color: colors.text }]}
                                        placeholder="Add an option..."
                                        placeholderTextColor={colors.textSecondary}
                                        value={newOption}
                                        onChangeText={setNewOption}
                                        onSubmitEditing={addOption}
                                    />
                                    <TouchableOpacity onPress={addOption} style={[styles.addButton, { backgroundColor: colors.primary }]}>
                                        <Ionicons name="add" size={24} color={colors.white} />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : null}
                    </ScrollView>

                    <View style={styles.footer}>
                        <TouchableOpacity
                            onPress={handleClose}
                            style={[styles.footerButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                        >
                            <Text style={[styles.footerButtonText, { color: colors.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleSave}
                            style={[styles.footerButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                        >
                            <Text style={[styles.footerButtonText, { color: colors.white }]}>Save Task</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    keyboardLayer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 10,
        maxHeight: '78%',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 14,
    },
    handle: {
        width: 44,
        height: 4,
        borderRadius: 999,
        alignSelf: 'center',
        marginBottom: 14,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 10,
    },
    title: {
        ...FONTS.h3,
    },
    closeButton: {
        width: 38,
        height: 38,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        gap: 12,
    },
    inputLabel: {
        ...FONTS.label,
        marginBottom: 8,
        marginTop: 6,
    },
    input: {
        minHeight: 52,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        ...FONTS.body,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    dropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minHeight: 52,
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 14,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    optionSection: {
        gap: 8,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        padding: 12,
    },
    optionText: {
        flex: 1,
        ...FONTS.body,
    },
    optionComposer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    optionInput: {
        flex: 1,
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footer: {
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 4,
    },
    footerButton: {
        flex: 1,
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        ...FONTS.bodyStrong,
    },
});
