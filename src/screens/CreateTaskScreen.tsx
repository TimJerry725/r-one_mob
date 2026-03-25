import React, { useMemo, useState } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/NeonButton';
import { FONTS } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';

const SERVICE_TYPES = ['Installation', 'Maintenance', 'Preventive'] as const;
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

const DATA_TYPES = ['Text', 'Number', 'Date', 'Radio', 'Multiselect', 'Media', 'Toggle', 'Not applicable'] as const;
const STAGE_NAMES = ['Site Prep', 'Fault Check', 'Inspection', 'Commissioning', 'Closeout'] as const;
const STATION_NAMES = ['Kharadi Logistics Hub', 'Pune Central Station', 'Mumbai Depot'] as const;
const CHECKLIST_NAMES = ['Pedestal Repair', 'Grounding Check', 'Annual Maintenance'] as const;

export const CreateTaskScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const insets = useSafeAreaInsets();
    
    const fromDetail = route.params?.fromDetail ?? false;
    const prefill = route.params?.prefill ?? {};
    const [selectedFlow, setSelectedFlow] = useState<CreateFlow>(fromDetail ? 'task' : 'checklist');
    
    const [checklistName, setChecklistName] = useState<typeof CHECKLIST_NAMES[number] | ''>(prefill.checklistName || '');
    const [taskTitle, setTaskTitle] = useState('');
    const [title, setTitle] = useState('');
    const [siteName, setSiteName] = useState<string>(prefill.siteName || '');
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
    const [tasks, setTasks] = useState<any[]>([]);

    // Dropdown toggles
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [showStageDropdown, setShowStageDropdown] = useState(false);
    const [showDataTypeDropdown, setShowDataTypeDropdown] = useState(false);
    const [showStationDropdown, setShowStationDropdown] = useState(false);
    const [showChecklistDropdown, setShowChecklistDropdown] = useState(false);
    const [addingTaskForm, setAddingTaskForm] = useState(false);

    const selectedCopy = useMemo(
        () => (selectedFlow ? FLOW_COPY[selectedFlow] : null),
        [selectedFlow],
    );

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
        setAddingTaskForm(false);
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
            setDataType('Text');
            setServiceType('Installation');
            setStageName('Site Prep');
            return;
        }

        setTitle('Preventive closeout checklist');
        setSiteName('');
        setInstructions('List the essential closeout steps, expected evidence, and sign-off rules for repeat visits.');
        setServiceType('Preventive');
        setNeedsPhotos(true);
        setNeedsSignature(true);
        setNeedsPartsLog(false);
        setAssignee('Timothy');
    };

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
                                                <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={() => setShowStationDropdown(!showStationDropdown)}>
                                                    <Text style={{ color: colors.text, ...FONTS.body }}>{siteName || 'Select station'}</Text>
                                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                                {showStationDropdown && (
                                                    <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                        {STATION_NAMES.map((stn) => (
                                                            <TouchableOpacity key={stn} style={styles.dropdownOption} onPress={() => { setSiteName(stn); setShowStationDropdown(false); }}>
                                                                <Text style={{ color: colors.text, ...FONTS.body }}>{stn}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}

                                                {serviceType === 'Installation' && (
                                                    <View style={{ marginBottom: 4 }}>
                                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Stage name</Text>
                                                        <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={() => setShowStageDropdown(!showStageDropdown)}>
                                                            <Text style={{ color: colors.text, ...FONTS.body }}>{stageName || 'Select stage'}</Text>
                                                            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                        </TouchableOpacity>
                                                        {showStageDropdown && (
                                                            <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                                {STAGE_NAMES.map((stage) => (
                                                                    <TouchableOpacity key={stage} style={styles.dropdownOption} onPress={() => { setStageName(stage); setShowStageDropdown(false); }}>
                                                                        <Text style={{ color: colors.text, ...FONTS.body }}>{stage}</Text>
                                                                    </TouchableOpacity>
                                                                ))}
                                                            </View>
                                                        )}
                                                    </View>
                                                )}

                                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Checklist title</Text>
                                            <TextInput
                                                value={title}
                                                onChangeText={setTitle}
                                                style={[styles.input, { color: colors.text, backgroundColor: colors.surface, shadowColor: colors.shadow, marginBottom: 12 }]}
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
                                                    <View style={{ marginBottom: 12, gap: 12, padding: 12, backgroundColor: colors.surfaceHighlight, borderRadius: 12 }}>
                                                        <View>
                                                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Task title</Text>
                                                            <TextInput
                                                                value={taskTitle}
                                                                onChangeText={setTaskTitle}
                                                                style={[styles.input, { color: colors.text, backgroundColor: colors.background, shadowColor: colors.shadow }]}
                                                                placeholder="Enter custom task/question title"
                                                                placeholderTextColor={colors.textSecondary}
                                                            />
                                                        </View>

                                                        <View>
                                                            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Data type</Text>
                                                            <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: colors.background, shadowColor: colors.shadow }]} onPress={() => setShowDataTypeDropdown(!showDataTypeDropdown)}>
                                                                <Text style={{ color: colors.text, ...FONTS.body }}>{dataType}</Text>
                                                                <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                            </TouchableOpacity>
                                                            {showDataTypeDropdown && (
                                                                <View style={[styles.dropdownList, { backgroundColor: colors.background, borderColor: colors.border }]}>
                                                                    {DATA_TYPES.map((dt) => (
                                                                        <TouchableOpacity key={dt} style={styles.dropdownOption} onPress={() => { setDataType(dt); setShowDataTypeDropdown(false); }}>
                                                                            <Text style={{ color: colors.text, ...FONTS.body }}>{dt}</Text>
                                                                        </TouchableOpacity>
                                                                    ))}
                                                                </View>
                                                            )}
                                                        </View>

                                                        {['Radio', 'Multiselect'].includes(dataType) && (
                                                            <View style={{ gap: 8 }}>
                                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Options</Text>
                                                                {taskOptions.map((opt, idx) => (
                                                                    <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, padding: 12, borderRadius: 12 }}>
                                                                        <Text style={{ flex: 1, color: colors.text, ...FONTS.body }}>{opt}</Text>
                                                                        <TouchableOpacity onPress={() => removeOption(idx)}>
                                                                            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                ))}
                                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                                    <TextInput
                                                                        style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.background, shadowColor: colors.shadow }]}
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

                                                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                                                            <TouchableOpacity 
                                                                onPress={() => {
                                                                    setTaskTitle('');
                                                                    setDataType('Text');
                                                                    setTaskOptions([]);
                                                                    setAddingTaskForm(false);
                                                                }}
                                                                style={{ 
                                                                    flex: 1,
                                                                    backgroundColor: colors.surfaceHighlight, 
                                                                    paddingVertical: 12, 
                                                                    borderRadius: 12, 
                                                                    alignItems: 'center',
                                                                    borderWidth: 1,
                                                                    borderColor: colors.border
                                                                }}
                                                            >
                                                                <Text style={{ color: colors.text, ...FONTS.bodyStrong }}>Cancel</Text>
                                                            </TouchableOpacity>
                                                            
                                                            <TouchableOpacity 
                                                                onPress={saveTask}
                                                                style={{ 
                                                                    flex: 1,
                                                                    backgroundColor: colors.primary, 
                                                                    paddingVertical: 12, 
                                                                    borderRadius: 12, 
                                                                    alignItems: 'center'
                                                                }}
                                                            >
                                                                <Text style={{ color: colors.white, ...FONTS.bodyStrong }}>Save Task</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
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
                                                    onPress={() => setAddingTaskForm(!addingTaskForm)}
                                                >
                                                    <Ionicons name="add" size={18} color={colors.text} />
                                                    <Text style={{ color: colors.text, ...FONTS.bodyStrong }}>Add tasks</Text>
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
                                                    style={[styles.input, { color: colors.text, backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                                                    placeholder="Enter custom task/question title"
                                                    placeholderTextColor={colors.textSecondary}
                                                />

                                                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Data type</Text>
                                                <TouchableOpacity style={[styles.dropdownButton, { backgroundColor: colors.surface, shadowColor: colors.shadow }]} onPress={() => setShowDataTypeDropdown(!showDataTypeDropdown)}>
                                                    <Text style={{ color: colors.text, ...FONTS.body }}>{dataType}</Text>
                                                    <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                                                </TouchableOpacity>
                                                {showDataTypeDropdown && (
                                                    <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                        {DATA_TYPES.map((dt) => (
                                                            <TouchableOpacity key={dt} style={styles.dropdownOption} onPress={() => { setDataType(dt); setShowDataTypeDropdown(false); }}>
                                                                <Text style={{ color: colors.text, ...FONTS.body }}>{dt}</Text>
                                                            </TouchableOpacity>
                                                        ))}
                                                    </View>
                                                )}

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
                                                                style={[styles.input, { flex: 1, color: colors.text, backgroundColor: colors.surface, shadowColor: colors.shadow }]}
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
    dropdownList: {
        borderWidth: 1,
        borderTopWidth: 0,
        borderBottomLeftRadius: 12,
        borderBottomRightRadius: 12,
        marginTop: -12,
        paddingTop: 12,
        overflow: 'hidden',
    },
    dropdownOption: {
        paddingHorizontal: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(150,150,150,0.1)',
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
