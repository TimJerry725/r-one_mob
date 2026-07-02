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
    Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/NeonButton';
import { PopoverDropdown } from '../components/PopoverDropdown';
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
import { WORK_ORDERS } from '../data/fieldDemo';

const CREATE_OPTIONS = [
    {
        id: 'checklist',
        title: 'Add Tasks',
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
        label: 'Tasks',
        title: 'Create Tasks',
        subtitle: 'Define the steps technicians must follow.',
        primary: 'Create Tasks',
    },
    task: {
        label: 'Task',
        title: 'Create Task',
        subtitle: 'Add a new task or step.',
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
    
    const [taskTitle, setTaskTitle] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [siteName, setSiteName] = useState<string>(prefill.siteName || '');
    const [projectId, setProjectId] = useState<string>(prefill.projectId || '');
    const [assignees, setAssignees] = useState<string[]>([]);
    const [dataType, setDataType] = useState<typeof DATA_TYPES[number]>('Text');
    const [taskOptions, setTaskOptions] = useState<string[]>([]);
    const [newOption, setNewOption] = useState('');
    const [tasks, setTasks] = useState<ChecklistTaskDraft[]>([]);
    const [hasAttachment, setHasAttachment] = useState(false);

    // New states from Create Service Work mockup
    const [priority, setPriority] = useState('Medium');
    const [chargePoint, setChargePoint] = useState('CP-01');
    const [startDate, setStartDate] = useState('30 Jun 2026');
    const [endDate, setEndDate] = useState('05 Jul 2026');
    const [task, setTask] = useState('');
    const [assignmentType, setAssignmentType] = useState('Self');
    const [serviceType, setServiceType] = useState<typeof SERVICE_TYPES[number]>('Service');

    const handledSelectorToken = useRef<number | null>(null);
    const handledTaskToken = useRef<number | null>(null);

    const handleCreateWorkOrder = () => {
        if (serviceType === 'Service' && !title.trim()) {
            Alert.alert('Required Field', 'Please enter a work title.');
            return;
        }
        if (!siteName) {
            Alert.alert('Required Field', 'Please choose a charging station.');
            return;
        }

        const techs = assignmentType === 'Self' ? ['Self'] : assignees;

        const newWO = {
            id: `wo-${Date.now()}`,
            projectId: projectId || 'PJ001',
            title: title.trim(),
            description: description.trim(),
            siteName: siteName,
            address: 'Platform Road, Shivajinagar, Pune',
            type: serviceType === 'Request Preventive' ? 'Preventive' as const : 'Service' as const,
            stage: serviceType === 'Request Preventive' ? 'Commissioning' : 'Site Prep',
            status: 'Unassigned' as const,
            dueWindow: 'Today, 14:00 - 17:00',
            eta: 'Not started',
            distance: '1.2 km',
            checklistCompleted: 0,
            checklistTotal: 5,
            tools: [],
            parts: [],
            technicians: techs,
            assetId: chargePoint || 'CP-100239',
            offlineReady: true,
            notes: description.trim() || 'Service job',
            latitude: 18.5314,
            longitude: 73.8446,
            priority: (priority || 'Medium') as any,
            targetTime: Date.now() + 6 * 60 * 60 * 1000,
            assignedBy: 'Andrea Meuschke',
        };

        WORK_ORDERS.unshift(newWO);

        Alert.alert(
            serviceType === 'Request Preventive' ? 'Request Sent' : 'Work Created',
            `Work order has been successfully created.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const selectedCopy = useMemo(
        () => (selectedFlow ? FLOW_COPY[selectedFlow] : null),
        [selectedFlow],
    );

    const selectedStationValue = getStationSelectionValue(siteName, projectId);
    const selectedStationLabel = siteName ? (projectId ? `${siteName} (${projectId})` : siteName) : 'Select station and project';

    useEffect(() => {
        const taskDraftResult = route.params?.taskDraftResult as TaskDraftResult | undefined;

        if (!taskDraftResult || handledTaskToken.current === taskDraftResult.token) {
            return;
        }

        handledTaskToken.current = taskDraftResult.token;
        setTasks((current) => [...current, taskDraftResult.task]);
    }, [route.params?.taskDraftResult]);

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
            setTaskTitle('');
            setSiteName('');
            setProjectId('');
            setDataType('Text');
            return;
        }

        setTitle('');
        setSiteName('');
        setProjectId('');
        setAssignees([]);
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
                                            <Text style={[styles.headerTitle, { color: colors.text }]}>
                                                Create Service Work
                                            </Text>
                                        )}
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => navigation.goBack()}
                                        style={[styles.iconButton, { backgroundColor: colors.surfaceHighlight }]}
                                    >
                                        <Ionicons name="close" size={22} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ flexShrink: 1 }} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
                                    <View style={{ gap: 4 }}>
                                        {selectedFlow === 'checklist' && (
                                            <View style={{ gap: 4 }}>
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

                                                {serviceType === 'Service' && (
                                                    <>
                                                        {/* Title */}
                                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                                            <Text style={{ color: colors.danger }}>* </Text>Title
                                                        </Text>
                                                        <TextInput
                                                            value={title}
                                                            onChangeText={setTitle}
                                                            style={[styles.input, getInputShellStyle(colors), { color: colors.text, marginBottom: 12 }]}
                                                            placeholder="Enter work title (max 100 characters)"
                                                            placeholderTextColor={colors.textSecondary}
                                                        />

                                                        {/* Description */}
                                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Description</Text>
                                                        <TextInput
                                                            value={description}
                                                            onChangeText={setDescription}
                                                            style={[styles.input, getInputShellStyle(colors), styles.textArea, { color: colors.text, marginBottom: 12 }]}
                                                            placeholder="Enter description"
                                                            placeholderTextColor={colors.textSecondary}
                                                            multiline
                                                        />
                                                    </>
                                                )}

                                                <PopoverDropdown
                                                    label="* Charging Station"
                                                    placeholder="Choose charge station"
                                                    options={getSelectorOptions('station').options}
                                                    value={selectedStationValue}
                                                    onSelect={(val) => {
                                                        const matchedOption = findStationProjectOptionByValue(val as string);
                                                        if (matchedOption) {
                                                            setSiteName(matchedOption.siteName);
                                                            setProjectId(matchedOption.projectId);
                                                        }
                                                    }}
                                                />

                                                {/* Charge Point */}
                                                <PopoverDropdown
                                                    label="* Charge Point (CPID)"
                                                    placeholder="Choose CPID"
                                                    options={[
                                                        { label: 'CP-01 (MUM-FAST-1)', value: 'CP-01' },
                                                        { label: 'CP-02 (MUM-FAST-2)', value: 'CP-02' },
                                                        { label: 'CP-03 (DEL-FAST-1)', value: 'CP-03' },
                                                    ]}
                                                    value={chargePoint}
                                                    onSelect={(val) => setChargePoint(val as string)}
                                                />

                                                {serviceType === 'Service' && (
                                                    <>

                                                {/* Priority */}
                                                <PopoverDropdown
                                                    label="* Priority"
                                                    placeholder="Choose priority"
                                                    options={[
                                                        { label: 'Low', value: 'Low' },
                                                        { label: 'Medium', value: 'Medium' },
                                                        { label: 'High', value: 'High' },
                                                    ]}
                                                    value={priority}
                                                    onSelect={(val) => setPriority(val as string)}
                                                />

                                                {/* Date Range */}
                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                                    <Text style={{ color: colors.danger }}>* </Text>Date Range
                                                </Text>
                                                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12, alignItems: 'center' }}>
                                                    <View style={{ flex: 1 }}>
                                                        <TextInput
                                                            value={startDate}
                                                            onChangeText={setStartDate}
                                                            style={[styles.input, getInputShellStyle(colors), { color: colors.text }]}
                                                            placeholder="Start date"
                                                            placeholderTextColor={colors.textSecondary}
                                                        />
                                                    </View>
                                                    <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
                                                    <View style={{ flex: 1 }}>
                                                        <TextInput
                                                            value={endDate}
                                                            onChangeText={setEndDate}
                                                            style={[styles.input, getInputShellStyle(colors), { color: colors.text }]}
                                                            placeholder="End date"
                                                            placeholderTextColor={colors.textSecondary}
                                                        />
                                                    </View>
                                                </View>

                                                {/* Tasks */}
                                                <View style={{ gap: 8, marginTop: 4 }}>
                                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tasks</Text>
                                                    
                                                    {tasks.map((t, idx) => (
                                                        <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surfaceHighlight, padding: 12, borderRadius: 12 }}>
                                                            <View style={{ flex: 1 }}>
                                                                <Text style={{ color: colors.text, ...FONTS.bodyStrong, fontSize: 16 }}>{t.title}</Text>
                                                                <Text style={{ color: colors.textSecondary, ...FONTS.caption, marginTop: 2 }}>{t.dataType}</Text>
                                                            </View>
                                                            <TouchableOpacity onPress={() => removeTask(idx)} style={{ padding: 4 }}>
                                                                <Ionicons name="trash-outline" size={20} color={colors.danger} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ))}

                                                    <TouchableOpacity 
                                                        activeOpacity={0.8}
                                                        onPress={openChecklistTaskSheet}
                                                        style={[
                                                            styles.captureButton, 
                                                            { 
                                                                backgroundColor: colors.surfaceHighlight,
                                                                borderColor: colors.border,
                                                                borderStyle: 'dashed',
                                                                justifyContent: 'center',
                                                                alignItems: 'center',
                                                                gap: 8,
                                                                minHeight: 52
                                                            }
                                                        ]}
                                                    >
                                                        <Ionicons name="add" size={20} color={colors.primary} />
                                                        <Text style={[styles.captureButtonText, { color: colors.primary, marginTop: 0 }]}>Add custom task</Text>
                                                    </TouchableOpacity>
                                                </View>
                                                {/* Assignment Type */}
                                                <PopoverDropdown
                                                    label="* Assignment Type"
                                                    placeholder="Choose assignment type"
                                                    options={[
                                                        { label: 'Self', value: 'Self' },
                                                        { label: 'Team', value: 'Team' },
                                                        { label: 'Unassigned', value: 'Unassigned' },
                                                    ]}
                                                    value={assignmentType}
                                                    onSelect={(val) => setAssignmentType(val as string)}
                                                />

                                                {/* Assignees (Conditional) */}
                                                {assignmentType === 'Team' && (
                                                    <PopoverDropdown
                                                        label="* Assignees"
                                                        placeholder="Choose team members"
                                                        options={getSelectorOptions('assignees').options}
                                                        value={assignees}
                                                        onSelect={(val) => setAssignees(val as string[])}
                                                        isMulti={true}
                                                    />
                                                )}

                                                </>
                                                )}

                                                {/* Attachments */}
                                                <View style={{ gap: 4, marginBottom: 12, marginTop: 8 }}>
                                                    <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Attachments</Text>
                                                    <TouchableOpacity 
                                                        activeOpacity={0.8}
                                                        onPress={() => setHasAttachment(!hasAttachment)}
                                                        style={[
                                                            styles.captureButton, 
                                                            { 
                                                                backgroundColor: hasAttachment ? colors.primary + '12' : colors.surfaceHighlight,
                                                                borderColor: hasAttachment ? colors.primary : colors.border,
                                                            }
                                                        ]}
                                                    >
                                                        <Ionicons 
                                                            name={hasAttachment ? "checkmark-circle" : "attach"}
                                                            size={18} 
                                                            color={colors.primary} 
                                                        />
                                                        <View style={{ alignItems: 'flex-start' }}>
                                                            <Text style={[styles.captureButtonText, { color: hasAttachment ? colors.primary : colors.text }]}>
                                                                {hasAttachment ? 'Attachment Added' : 'Add attachment'}
                                                            </Text>
                                                            <Text style={[{ color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>Max-125mb size limit</Text>
                                                        </View>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
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

                                                <PopoverDropdown
                                                    label="Data type"
                                                    placeholder="Select data type"
                                                    options={getSelectorOptions('dataType').options}
                                                    value={dataType}
                                                    onSelect={(val) => setDataType(val as any)}
                                                />

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
                                    <NeonButton title={serviceType === 'Request Preventive' ? 'Send Request' : (selectedCopy?.primary ?? 'Create')} onPress={handleCreateWorkOrder} />
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
    captureButton: {
        minHeight: 64,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    captureButtonText: {
        ...FONTS.bodyStrong,
        textAlign: 'center',
        fontSize: 16,
    },
    uploadArea: {
        borderWidth: 1,
        borderRadius: 16,
        borderStyle: 'dashed',
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        marginTop: 6,
        marginBottom: 12,
    },
    uploadText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        textAlign: 'center',
    },
});
