import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
    Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/NeonButton';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';
import {
    CHECKLIST_NAMES,
    ChecklistTaskDraft,
    DATA_TYPES,
    findStationProjectOptionByValue,
    getSelectorOptions,
    getStationSelectionValue,
    SelectorResult,
    SelectorSheetType,
    SERVICE_TYPES,
    STAGE_NAMES,
    TaskDraftResult,
} from '../data/createTaskOptions';

const CREATE_OPTIONS = [
    {
        id: 'checklist',
        title: 'Add Checklist',
        icon: 'check-square-o',
    },
    {
        id: 'task',
        title: 'Add Task',
        icon: 'wrench',
    },
] as const;

type CreateFlow = typeof CREATE_OPTIONS[number]['id'] | null;

const FLOW_COPY: Record<Exclude<CreateFlow, null>, { label: string; title: string; subtitle: string; primary: string }> = {
    checklist: {
        label: 'Checklist',
        title: 'Create Checklist',
        subtitle: 'Define the steps technicians must follow.',
        primary: 'Create Checklist',
    },
    task: {
        label: 'Task',
        title: 'Create Task',
        subtitle: 'Add a new task or checklist step.',
        primary: 'Create Task',
    },
};

export const CreateTaskScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const isFocused = useIsFocused();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const fromDetail = route.params?.fromDetail ?? false;
    const prefill = route.params?.prefill ?? {};
    const [selectedFlow, setSelectedFlow] = useState<CreateFlow>(fromDetail ? 'task' : 'checklist');
    
    const [checklistName, setChecklistName] = useState<typeof CHECKLIST_NAMES[number] | ''>(prefill.checklistName || '');
    const [taskTitle, setTaskTitle] = useState('');
    const [title, setTitle] = useState('');
    const [siteName, setSiteName] = useState<string>(prefill.siteName || '');
    const [projectId, setProjectId] = useState<string>(prefill.projectId || '');
    const [assignee, setAssignee] = useState('');
    const [instructions, setInstructions] = useState('');
    const [serviceType, setServiceType] = useState<typeof SERVICE_TYPES[number]>(prefill.serviceType || 'Installation');
    const [stageName, setStageName] = useState<typeof STAGE_NAMES[number]>(prefill.stageName || 'Site Prep');
    const [dataType, setDataType] = useState<typeof DATA_TYPES[number]>('Text');
    const [taskOptions, setTaskOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState('');
    const [needsPhotos, setNeedsPhotos] = useState(true);
    const [needsSignature, setNeedsSignature] = useState(true);
    const [needsPartsLog, setNeedsPartsLog] = useState(true);
    const [tasks, setTasks] = useState<ChecklistTaskDraft[]>([]);

    const handledSelectorToken = useRef<number | null>(null);
    const handledTaskToken = useRef<number | null>(null);

    const selectedCopy = useMemo(
        () => (selectedFlow ? FLOW_COPY[selectedFlow] : null),
        [selectedFlow],
    );

    const selectedStationValue = getStationSelectionValue(siteName, projectId);
    const selectedStationLabel = siteName ? (projectId ? `${siteName} (${projectId})` : siteName) : 'Select station and project';

    useEffect(() => {
        const selectorResult = route.params?.selectorResult as SelectorResult | undefined;

        if (!selectorResult || handledSelectorToken.current === selectorResult.token) {
            return;
        }

        handledSelectorToken.current = selectorResult.token;

        if (selectorResult.type === 'station') {
            const matchedOption = findStationProjectOptionByValue(selectorResult.value);

            if (matchedOption) {
                setSiteName(matchedOption.siteName);
                setProjectId(matchedOption.projectId);
            }
        }

        if (selectorResult.type === 'stage') {
            setStageName(selectorResult.value as typeof STAGE_NAMES[number]);
        }

        if (selectorResult.type === 'dataType') {
            setDataType(selectorResult.value as typeof DATA_TYPES[number]);
        }
    }, [route.params?.selectorResult]);

    useEffect(() => {
        const taskDraftResult = route.params?.taskDraftResult as TaskDraftResult | undefined;

        if (!taskDraftResult || handledTaskToken.current === taskDraftResult.token) {
            return;
        }

        handledTaskToken.current = taskDraftResult.token;
        setTasks((current) => [...current, taskDraftResult.task]);
    }, [route.params?.taskDraftResult]);

    const openSelectorSheet = (selector: SelectorSheetType) => {
        Keyboard.dismiss();
        const currentValue =
            selector === 'station'
                ? selectedStationValue
                : selector === 'stage'
                    ? stageName
                    : dataType;

        navigation.navigate('CreateTaskSelector', {
            selectorType: selector,
            selectedValue: currentValue,
            title: getSelectorOptions(selector).title,
        });
    };

    const addOption = () => {
        if (newOption.trim() && !taskOptions.includes(newOption.trim())) {
            setTaskOptions([...taskOptions, newOption.trim()]);
            setNewOption('');
        }
    };

    const removeOption = (idx: number) => {
        setTaskOptions(taskOptions.filter((_, i) => i !== idx));
    };

    const saveTask = () => {
        if (!taskTitle.trim()) return;
        
        const newTask = {
            title: taskTitle,
            dataType,
            options: ['Radio', 'Multiselect'].includes(dataType) ? [...taskOptions] : [],
        };
        
        setTasks([...tasks, newTask]);
        
        // Reset subform
        setTaskTitle('');
        setDataType('Text');
        setTaskOptions([]);
    };

    const removeTask = (index: number) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const openFlow = (flow: Exclude<CreateFlow, null>) => {
        setSelectedFlow(flow);

        if (flow === 'task') {
            setChecklistName('');
            setTaskTitle('');
            setSiteName('');
            setProjectId('');
            setDataType('Text');
            setServiceType('Installation');
            setStageName('Site Prep');
            return;
        }

        setTitle('Preventive closeout checklist');
        setSiteName('');
        setProjectId('');
        setInstructions('List the essential closeout steps, expected evidence, and sign-off rules for repeat visits.');
        setServiceType('Preventive');
        setNeedsPhotos(true);
        setNeedsSignature(true);
        setNeedsPartsLog(false);
        setAssignee('Timothy');
    };

    const openChecklistTaskSheet = () => {
        Keyboard.dismiss();
        navigation.navigate('CreateChecklistTask');
    };

    if (!isFocused) {
        return null;
    }

    return (
        <View style={[styles.container, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
            <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => navigation.goBack()} />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardLayer}
            >
                <View
                    style={[
                        styles.sheet,
                        {
                            backgroundColor: colors.background,
                            paddingBottom: Math.max(insets.bottom, 10),
                            shadowColor: colors.shadow,
                            maxHeight: '90%',
                        },
                    ]}
                >
                                <View style={[styles.sheetHeader, selectedFlow === 'task' && { alignItems: 'center', paddingBottom: 10 }]}>
                                    <View style={{ flex: 1, paddingLeft: 8 }}>
                                        {selectedFlow === 'task' ? (
                                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                                Create tasks
                                            </Text>
                                        ) : (
                                            <>
                                                <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedCopy?.title}</Text>
                                            </>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={[styles.iconButton, { backgroundColor: colors.surfaceHighlight }]}
                                    >
                                        <Ionicons name="close" size={22} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                                    <View style={{ gap: 4 }}>
                                        {selectedFlow === 'checklist' && (
                                            <>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Work type</Text>
                                                <View style={styles.chipRow}>
                                                    {SERVICE_TYPES.map((item) => {
                                                        const typeColors = getServiceTypeColors(item, isDark);
                                                        return (
                                                        <TouchableOpacity
                                                            key={item}
                                                            onPress={() => setServiceType(item)}
                                                            style={[
                                                                styles.choiceChip,
                                                                {
                                                                    backgroundColor: serviceType === item ? typeColors.background : typeColors.tint,
                                                                    borderColor: typeColors.border,
                                                                },
                                                            ]}
                                                        >
                                                            <Text
                                                                style={[
                                                                    styles.choiceChipText,
                                                                    { color: serviceType === item ? typeColors.text : typeColors.tintText },
                                                                ]}
                                                            >
                                                                {item}
                                                            </Text>
                                                        </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>

                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Station name</Text>
                                                <TouchableOpacity style={[styles.dropdownButton, getInputShellStyle(colors)]} onPress={() => openSelectorSheet('station')}>
                                                    <Text style={{ color: siteName ? colors.text : colors.textSecondary, ...FONTS.body }}>{selectedStationLabel}</Text>
                                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                </TouchableOpacity>

                                                {serviceType === 'Installation' && (
                                                    <View style={{ marginBottom: 4 }}>
                                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Stage name</Text>
                                                        <TouchableOpacity style={[styles.dropdownButton, getInputShellStyle(colors)]} onPress={() => openSelectorSheet('stage')}>
                                                            <Text style={{ color: colors.text, ...FONTS.body }}>{stageName || 'Select stage'}</Text>
                                                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                        </TouchableOpacity>
                                                    </View>
                                                )}

                                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Checklist title</Text>
                                            <TextInput
                                                value={title}
                                                onChangeText={setTitle}
                                                style={[styles.input, getInputShellStyle(colors), { color: colors.text, marginBottom: 12 }]}
                                                placeholder="Enter a clear title"
                                                placeholderTextColor={colors.textSecondary}
                                            />

	                                            {tasks.length > 0 && (
	                                                <View style={{ gap: 8, marginBottom: 16 }}>
                                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tasks ({tasks.length})</Text>
                                                    {tasks.map((t, i) => (
                                                        <View key={i} style={{ 
                                                            flexDirection: 'row', 
                                                            alignItems: 'center', 
                                                            backgroundColor: colors.surfaceHighlight, 
                                                            padding: 12, 
                                                            borderRadius: 12,
                                                            borderWidth: 1,
                                                            borderColor: colors.border
                                                        }}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ color: colors.text, ...FONTS.bodyStrong }}>{t.title}</Text>
                                                                <Text style={{ color: colors.textSecondary, fontSize: 10 }}>{t.dataType} {t.options?.length > 0 ? `(${t.options.length} options)` : ''}</Text>
                                                            </View>
                                                            <TouchableOpacity onPress={() => removeTask(i)}>
                                                                <Ionicons name="trash-outline" size={18} color={colors.danger} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}
                                                </View>
	                                            )}

	                                            <View style={{ marginTop: 8 }}>
	                                                <TouchableOpacity 
	                                                    style={{
	                                                        borderWidth: 1, 
                                                        borderColor: colors.border, 
                                                        borderRadius: 12, 
                                                        padding: 14, 
                                                        flexDirection: 'row', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center', 
	                                                        gap: 8,
	                                                        borderStyle: 'dashed'
	                                                    }}
	                                                    onPress={openChecklistTaskSheet}
	                                                >
	                                                    <Ionicons name="add" size={18} color={colors.text} />
	                                                    <Text style={{ color: colors.text, ...FONTS.bodyStrong }}>{tasks.length > 0 ? 'Add another task' : 'Add task'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            </>
                                        )}

                                        {selectedFlow === 'task' && (
                                            <>
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Task title</Text>
                                                <TextInput
                                                    value={taskTitle}
                                                    onChangeText={setTaskTitle}
                                                    style={[styles.input, getInputShellStyle(colors), { color: colors.text }]}
                                                    placeholder="Enter custom task/question title"
                                                    placeholderTextColor={colors.textSecondary}
                                                />

                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Data type</Text>
                                                <TouchableOpacity style={[styles.dropdownButton, getInputShellStyle(colors)]} onPress={() => openSelectorSheet('dataType')}>
                                                    <Text style={{ color: colors.text, ...FONTS.body }}>{dataType}</Text>
                                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                </TouchableOpacity>

                                                {['Radio', 'Multiselect'].includes(dataType) && (
                                                    <View style={{ gap: 8, marginTop: 4 }}>
                                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Options</Text>
                                                        {taskOptions.map((opt, idx) => (
                                                            <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHighlight, padding: 12, borderRadius: 12 }}>
                                                                <Text style={{ flex: 1, color: colors.text, ...FONTS.body }}>{opt}</Text>
                                                                <TouchableOpacity onPress={() => removeOption(idx)}>
                                                                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                                                                </TouchableOpacity>
                                                            </View>
                                                        ))}
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                            <TextInput
                                                                style={[styles.input, getInputShellStyle(colors), { flex: 1, color: colors.text }]}
                                                                placeholder="Add an option..."
                                                                placeholderTextColor={colors.textSecondary}
                                                                value={newOption}
                                                                onChangeText={setNewOption}
                                                                onSubmitEditing={addOption}
                                                            />
                                                            <TouchableOpacity onPress={addOption} style={{ backgroundColor: colors.primary, width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                                                                <Ionicons name="add" size={24} color={colors.white} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                )}
                                            </>
                                        )}
                                    </View>
                                </ScrollView>
	                                <View style={{ paddingHorizontal: 16, paddingBottom: 40, paddingTop: 0 }}>
	                                    <NeonButton title={selectedCopy?.primary ?? 'Create'} onPress={() => navigation.goBack()} />
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
    },
    keyboardLayer: {
        flex: 1,
        justifyContent: 'flex-end',
        width: '100%',
    },
    safeArea: {
        justifyContent: 'flex-end',
    },
    sheet: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        width: '100%',
        shadowOffset: { width: 0, height: -6 },
        shadowOpacity: 0.14,
        shadowRadius: 20,
        elevation: 12,
    },
    sheetHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 6,
    },
    iconButton: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButton: {
        minWidth: 28,
        minHeight: 28,
        marginLeft: -6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...FONTS.h3,
    },
    headerCopy: {
        ...FONTS.caption,
        marginTop: 4,
    },
    sheetTitle: {
        ...FONTS.label,
        marginBottom: 16,
    },
    sheetOption: {
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
    },
    sheetIcon: {
        width: 32,
    },
    sheetOptionText: {
        ...FONTS.bodyStrong,
        fontSize: 16,
    },
    sheetCancel: {
        marginTop: 24,
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sheetCancelText: {
        ...FONTS.bodyStrong,
    },
    content: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 24,
        gap: 12,
    },
    sectionCard: {
        borderRadius: 16,
        padding: 14,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    sectionLabel: {
        ...FONTS.label,
        marginBottom: 12,
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
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 4,
    },
    choiceChip: {
        minHeight: 42,
        borderRadius: 12,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 14,
    },
    choiceChipText: {
        ...FONTS.bodyStrong,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 6,
    },
    settingTitle: {
        ...FONTS.bodyStrong,
        marginBottom: 4,
    },
    settingCopy: {
        ...FONTS.body,
    },
    textArea: {
        minHeight: 132,
        borderRadius: 12,
        padding: 14,
        textAlignVertical: 'top',
        ...FONTS.body,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
});
