import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Modal,
    Share,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { getStatusColor } from '../styles/statusColors';
import { useTheme } from '../context/ThemeContext';
import { ACTIVITY_LOG, CHECKLIST_TEMPLATE, ChecklistTemplateItem, getWorkOrderById } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { PopoverDropdown } from '../components/PopoverDropdown';
import { getSelectorOptions } from '../data/createTaskOptions';
import { getServiceTypeColors } from '../styles/workTypeColors';

type ChecklistStateItem = {
    id: string;
    label: string;
    type: 'toggle' | 'text' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'media' | 'remarks_response';
    required: boolean;
    options?: string[];
    value: string | number | string[] | string[][];
    isNa?: boolean;
};

const getCompletedChecklistValue = (item: ChecklistTemplateItem): string | number | string[] | string[][] => {
    switch (item.type) {
        case 'date':
            return new Date().toISOString().slice(0, 10);
        case 'radio':
            return item.options?.[0] ?? 'Completed';
        case 'text':
            return 'Checked and verified on site.';
        case 'photo':
        case 'media':
            return 1;
        case 'toggle':
            return 'Completed';
        case 'number':
            return '415';
        case 'not_applicable':
            return 'N/A';
        case 'multiselect':
            return item.options?.slice(0, 2) ?? ['Completed'];
        case 'remarks_response':
            return [['Checked on site.', 'No issues found.']];
        default:
            return 'Completed';
    }
};

const buildChecklistState = (template: ChecklistTemplateItem[], prefillComplete: boolean): ChecklistStateItem[] =>
    template.map((item) => ({
        ...item,
        value: prefillComplete
            ? getCompletedChecklistValue(item)
            : item.type === 'photo' || item.type === 'media'
                ? 0
                : item.type === 'remarks_response' ? [['', '']] : '',
    }));

const isComplete = (item: ChecklistStateItem) => {
    if (item.isNa) return true;
    if (item.type === 'remarks_response') {
        const val = item.value as string[][];
        if (!val || val.length === 0) return false;
        return val.every(pair => pair && pair[0]?.trim().length > 0 && pair[1]?.trim().length > 0);
    }
    if (item.type === 'not_applicable') return String(item.value).length > 0;
    if (item.type === 'photo' || item.type === 'media') {
        return Number(item.value) > 0;
    }
    if (item.type === 'multiselect') {
        return String(Array.isArray(item.value) ? item.value.join(', ') : item.value).trim().length > 0;
    }
    return String(item.value).trim().length > 0;
};

const getChecklistPlaceholder = (item: ChecklistStateItem) => {
    switch (item.type) {
        case 'date':
            return 'Enter date';
        case 'number':
            return 'Enter value';
        case 'toggle':
            return 'Enter status';
        case 'radio':
            return 'Enter response';
        case 'multiselect':
            return 'Enter selections';
        case 'not_applicable':
            return 'Enter N/A if not applicable';
        default:
            return 'Add measured values or notes';
    }
};

type DetailTab = 'Tasks' | 'Activities' | 'Attachments';
type ActivityFilter = 'All' | 'Comment' | 'Activity';

export const TaskDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const workOrder = getWorkOrderById(route.params?.taskId);
    const typeColors = getServiceTypeColors(workOrder.type, isDark);
    const isUnderReview = workOrder.status === 'Under Review';
    const isSimpleChecklist = ['service', 'preventive'].includes((workOrder.type || '').toLowerCase());
    const checklistTemplate = workOrder.checklistItems ?? CHECKLIST_TEMPLATE;
    const [items, setItems] = useState<ChecklistStateItem[]>(() => buildChecklistState(checklistTemplate, isUnderReview));
    const [assignees, setAssignees] = useState<string[]>(workOrder.technicians || []);
    const [isAddingAssignee, setIsAddingAssignee] = useState(false);
    const [completionNote, setCompletionNote] = useState('');
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<ChecklistStateItem | null>(null);
    const [editTaskLabel, setEditTaskLabel] = useState('');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [naConfirmModalVisible, setNaConfirmModalVisible] = useState(false);
    const [taskToMarkNa, setTaskToMarkNa] = useState<string | null>(null);
    const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isEditingAssignees, setIsEditingAssignees] = useState(false);
    const [editedNotes, setEditedNotes] = useState(workOrder.notes || '');
    const [editedStartTime, setEditedStartTime] = useState(new Date(workOrder.targetStartTime || (workOrder.targetTime - 24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
    const [editedEndTime, setEditedEndTime] = useState(new Date(workOrder.targetTime).toISOString().slice(0, 10));
    const [editedApprover, setEditedApprover] = useState(workOrder.approver || 'Marcus Aurelius');

    const handleSaveDetails = () => {
        workOrder.notes = editedNotes;
        workOrder.approver = editedApprover;
        const startTime = new Date(editedStartTime).getTime();
        if (!isNaN(startTime)) {
            workOrder.targetStartTime = startTime;
        }
        const endTime = new Date(editedEndTime).getTime();
        if (!isNaN(endTime)) {
            workOrder.targetTime = endTime;
        }
        setIsEditingDetails(false);
    };

    const startEditTask = (task: ChecklistStateItem) => {
        setEditingTask(task);
        setEditTaskLabel(task.label);
    };

    const saveEditTask = () => {
        if (editingTask && editTaskLabel.trim()) {
            setItems(items.map(item => item.id === editingTask.id ? { ...item, label: editTaskLabel.trim() } : item));
        }
        setEditingTask(null);
    };

    const deleteTask = (id: string) => {
        setTaskToDelete(id);
        setDeleteConfirmModalVisible(true);
    };

    const handleConfirmDelete = () => {
        if (taskToDelete) {
            setItems(currentItems => currentItems.filter(item => item.id !== taskToDelete));
        }
        setDeleteConfirmModalVisible(false);
        setTaskToDelete(null);
    };

    const markTaskNa = (id: string) => {
        setTaskToMarkNa(id);
        setNaConfirmModalVisible(true);
    };

    const handleConfirmNa = () => {
        if (taskToMarkNa) {
            setItems(currentItems => currentItems.map(i => i.id === taskToMarkNa ? { ...i, isNa: !i.isNa } : i));
        }
        setNaConfirmModalVisible(false);
        setTaskToMarkNa(null);
    };

    const handleShareWork = async () => {
        try {
            const message = `Work Order Details:\nSite: ${workOrder.siteName}\nProject: ${workOrder.projectId}\nType: ${workOrder.type}\nStatus: ${workOrder.status}\nAddress: ${workOrder.address}`;
            await Share.share({
                message: message,
                title: `Share Work: ${workOrder.siteName}`,
            });
        } catch (error: any) {
            Alert.alert('Error', error.message);
        }
    };
    const [activeTab, setActiveTab] = useState<DetailTab>('Tasks');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('All');
    const [activities, setActivities] = useState(ACTIVITY_LOG);
    const [newComment, setNewComment] = useState('');
    const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
    const [editingCommentText, setEditingCommentText] = useState('');
    const [commentHasAttachment, setCommentHasAttachment] = useState(false);

    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);
    const [completionModalVisible, setCompletionModalVisible] = useState(false);
    const [completionComments, setCompletionComments] = useState('');
    const [completionHasAttachment, setCompletionHasAttachment] = useState(false);

    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [approveComments, setApproveComments] = useState('');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);

    useEffect(() => {
        if (isUnderReview) {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isUnderReview]);

    const requiredItems = items.filter((item) => item.required);
    const completedRequired = requiredItems.filter(isComplete).length;
    const allCompleted = items.filter(isComplete).length === items.length;
    const readyToComplete = items.length > 0 && completedRequired === requiredItems.length;
    const completeActionLabel = isUnderReview ? 'Review Work' : 'Mark Complete';
    const filteredActivities = activities.filter((item) => {
        if (activityFilter === 'All') {
            return true;
        }
        if (activityFilter === 'Comment') {
            return item.type === 'comment';
        }
        return item.type !== 'comment';
    });

    const handleAddComment = () => {
        if (!newComment.trim()) return;
        const newActivity = {
            id: Date.now().toString(),
            title: 'You',
            time: 'Just now',
            type: 'comment' as const,
            detail: commentHasAttachment ? `${newComment.trim()} (Attachment Added)` : newComment.trim(),
        };
        setActivities([newActivity, ...activities]);
        setNewComment('');
        setCommentHasAttachment(false);
    };

    const handleDeleteComment = (id: string) => {
        setActivities(activities.filter(a => a.id !== id));
    };

    const handleSaveEdit = () => {
        if (!editingCommentText.trim() || !editingCommentId) return;
        setActivities(activities.map(a => 
            a.id === editingCommentId ? { ...a, detail: editingCommentText.trim() } : a
        ));
        setEditingCommentId(null);
        setEditingCommentText('');
    };

    const handleStartEdit = (id: string, text: string) => {
        setEditingCommentId(id);
        setEditingCommentText(text);
    };

    const updateItem = (id: string, value: string | number | string[] | string[][]) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
    };

    const handleCompleteAction = () => {
        if (!allCompleted) {
            setConfirmationModalVisible(true);
        } else {
            setCompletionModalVisible(true);
        }
    };

    const handleSubmitCompletion = () => {
        if (!completionComments.trim()) {
            Alert.alert('Comments Required', 'Please provide completion details/comments.');
            return;
        }

        const newAct = {
            id: Date.now().toString(),
            title: 'Timothy Field (You)',
            time: 'Just now',
            type: 'comment' as const,
            detail: completionHasAttachment 
                ? `${completionComments.trim()} (Completion Attachment Uploaded)` 
                : completionComments.trim(),
        };
        
        setActivities([newAct, ...activities]);
        workOrder.status = 'Under Review';

        setCompletionModalVisible(false);
        Alert.alert(
            'Submitted',
            'Work completed successfully and moved to Under Review.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleApproveWork = () => {
        setApproveModalVisible(true);
    };

    const handleConfirmApproval = () => {
        const approveText = approveComments.trim() || 'Work approved successfully.';
        const newAct = {
            id: Date.now().toString(),
            title: 'Andrea Meuschke (You)',
            time: 'Just now',
            type: 'comment' as const,
            detail: `${approveText} (Approved)`,
        };
        
        setActivities([newAct, ...activities]);
        workOrder.status = 'Completed';

        setApproveModalVisible(false);
        Alert.alert(
            'Approved',
            'The work order has been approved successfully.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleRejectWork = () => {
        setRejectModalVisible(true);
    };

    const handleConfirmReject = () => {
        if (!rejectComments.trim()) {
            Alert.alert('Comments Required', 'Please provide rejection comments.');
            return;
        }

        const newAct = {
            id: Date.now().toString(),
            title: 'Andrea Meuschke (You)',
            time: 'Just now',
            type: 'comment' as const,
            detail: `${rejectComments.trim()} (Rejected)`,
        };
        
        setActivities([newAct, ...activities]);
        workOrder.status = 'Working';

        setRejectModalVisible(false);
        Alert.alert(
            'Rejected',
            'The work order has been sent back for correction.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <View style={styles.headerTitleWrap}>
                        <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>{workOrder.siteName}</Text>
                    </View>
                    <View style={[styles.headerTypeChip, { backgroundColor: typeColors.tint, borderColor: typeColors.border }]}>
                        <Text style={[styles.headerTypeChipText, { color: typeColors.tintText }]}>{workOrder.type}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setActionModalVisible(true)}
                        style={[styles.actionBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                    >
                        <Text style={[styles.actionBtnText, { color: colors.text }]}>Action</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>

                <ScrollView ref={scrollViewRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, zIndex: 10 }]}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroTitleWrap}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                                    <Text style={[styles.jobTitle, { color: colors.text, flex: 1 }]}>{workOrder.title}</Text>
                                    <Text style={[{ color: colors.primary, marginTop: 4 }, FONTS.caption]}>{workOrder.projectId}</Text>
                                </View>
                                <View style={styles.heroTopChipRow}>
                                    <View style={[
                                        styles.heroChip,
                                        {
                                            backgroundColor: getStatusColor(workOrder.status, colors, isDark) + '15',
                                            borderColor: getStatusColor(workOrder.status, colors, isDark)
                                        }
                                    ]}>
                                        <Text style={[
                                            styles.heroChipText,
                                            { color: getStatusColor(workOrder.status, colors, isDark) }
                                        ]}>{workOrder.status}</Text>
                                    </View>
                                    {workOrder.type === 'Installation' && workOrder.stage ? (
                                        <View style={[styles.heroChip, { backgroundColor: (isDark ? colors.primaryLight : colors.primary) + '15', borderColor: isDark ? colors.primaryLight : colors.primary }]}>
                                            <Text style={[styles.heroChipText, { color: isDark ? colors.primaryLight : colors.primary }]}>{workOrder.stage}</Text>
                                        </View>
                                    ) : null}
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                <TouchableOpacity 
                                    onPress={() => isEditingDetails ? handleSaveDetails() : setIsEditingDetails(true)}
                                    style={[styles.navButton, { backgroundColor: colors.primary + '15', marginTop: 4 }]}
                                >
                                    <Ionicons name={isEditingDetails ? "checkmark" : "pencil"} size={16} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={handleShareWork}
                                    style={[styles.navButton, { backgroundColor: colors.primary + '15', marginTop: 4 }]}
                                >
                                    <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Charge Points (CPID)</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                            {(workOrder.assetIds || [workOrder.assetId]).map((cp) => (
                                <View key={cp} style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }]}>
                                    <Text style={[styles.heroChipText, { color: colors.text }]}>{cp}</Text>
                                </View>
                            ))}
                        </View>

                        <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Station Address</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                <Ionicons name="location-outline" size={16} color={colors.primary} />
                                <Text style={[{ color: colors.text, flex: 1 }, FONTS.body]}>{workOrder.address}</Text>
                            </View>
                            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="navigate" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        {isEditingDetails ? (
                            <View style={{ marginBottom: 12 }}>
                                <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Description</Text>
                                <TextInput
                                    style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 8, minHeight: 60, textAlignVertical: 'top' }, FONTS.body]}
                                    value={editedNotes}
                                    onChangeText={setEditedNotes}
                                    multiline
                                    placeholder="Enter description"
                                    placeholderTextColor={colors.textSecondary}
                                />
                            </View>
                        ) : workOrder.notes ? (
                            <>
                                <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Description</Text>
                                <Text style={[{ color: colors.text, marginBottom: 12, lineHeight: 20 }, FONTS.body]}>
                                    {workOrder.notes}
                                </Text>
                            </>
                        ) : null}

                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 }}>
                            <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                            {isEditingDetails ? (
                                <View style={{ flexDirection: 'row', gap: 8, flex: 1 }}>
                                    <TextInput
                                        style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flex: 1 }, FONTS.body]}
                                        value={editedStartTime}
                                        onChangeText={setEditedStartTime}
                                        placeholder="Start (YYYY-MM-DD)"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TextInput
                                        style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, flex: 1 }, FONTS.body]}
                                        value={editedEndTime}
                                        onChangeText={setEditedEndTime}
                                        placeholder="End (YYYY-MM-DD)"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                </View>
                            ) : (
                                <Text style={[FONTS.bodyStrong, { color: colors.text, fontSize: 13 }]}>
                                    {new Date(workOrder.targetStartTime || (workOrder.targetTime - 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - {new Date(workOrder.targetTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            )}
                        </View>

                        <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Assignees & Approvals</Text>

                        {isEditingDetails ? (
                            <View style={{ zIndex: 1000 }}>
                                <View style={{ marginTop: 8, marginBottom: 12, flexDirection: 'row', gap: 12 }}>
                                    <View style={{ flex: 1, zIndex: 1000 }}>
                                        <PopoverDropdown
                                            label="Lead"
                                            placeholder="Select lead..."
                                            options={getSelectorOptions('assignees').options}
                                            value={assignees.length > 0 ? assignees[0] : ''}
                                            onSelect={(val) => {
                                                const newLead = val as string;
                                                if (newLead) {
                                                    setAssignees([newLead, ...assignees.slice(1).filter(a => a !== newLead)]);
                                                } else if (assignees.length > 0) {
                                                    setAssignees(assignees.slice(1));
                                                }
                                            }}
                                            isMulti={false}
                                        />
                                    </View>
                                    <View style={{ flex: 1, zIndex: 999 }}>
                                        <PopoverDropdown
                                            label="Assignees"
                                            placeholder="Select assignees..."
                                            options={getSelectorOptions('assignees').options}
                                            value={assignees.length > 0 ? assignees.slice(1) : []}
                                            onSelect={(val) => {
                                                const otherAssignees = val as string[];
                                                const lead = assignees.length > 0 ? assignees[0] : null;
                                                if (lead) {
                                                    setAssignees([lead, ...otherAssignees.filter(a => a !== lead)]);
                                                } else {
                                                    setAssignees(otherAssignees);
                                                }
                                            }}
                                            isMulti={true}
                                        />
                                    </View>
                                </View>
                            </View>
                        ) : (
                            <View style={[styles.chipRow, { alignItems: 'center' }]}>
                                {assignees.map((tech, idx) => {
                                    const isLead = idx === 0;
                                    return (
                                        <View key={tech} style={[styles.heroChip, { backgroundColor: isLead ? colors.primary : colors.primary + '15', borderColor: colors.primary, flexDirection: 'row', alignItems: 'center' }]}>
                                            <Text style={[styles.heroChipText, { color: isLead ? colors.white : colors.primary }]}>
                                                {isLead ? `Lead: ${tech}` : tech}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        )}
                        
                        <View style={{ marginTop: 12, flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                            {isEditingDetails ? (
                                <View style={{ flex: 1 }}>
                                    <PopoverDropdown
                                        label="Approver"
                                        placeholder="Select approver..."
                                        options={getSelectorOptions('assignees').options}
                                        value={editedApprover}
                                        onSelect={(val) => setEditedApprover(val as string)}
                                        isMulti={false}
                                    />
                                </View>
                            ) : (
                                <Text style={[{ color: colors.textSecondary, flex: 1 }, FONTS.caption]}>Approver: {workOrder.approver || 'Marcus Aurelius'}</Text>
                            )}
                            <View style={{ flex: 1 }}>
                                <Text style={[{ color: colors.textSecondary }, FONTS.caption]}>Assigned by: {workOrder.assignedBy || 'Andrea Meuschke'}</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.tabSwitch, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                        {(['Tasks', 'Activities', 'Attachments'] as const).map((tab) => {
                            const isSelected = activeTab === tab;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tab)}
                                    style={[
                                        styles.tabButton,
                                        { backgroundColor: isSelected ? colors.surface : 'transparent' },
                                    ]}
                                >
                                    <Text style={[styles.tabButtonText, { color: isSelected ? colors.text : colors.textSecondary }]}>
                                        {tab}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    {activeTab === 'Tasks' ? (
                        <>
                            {items.length === 0 ? (
                                <View style={[styles.emptyStateCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                    <EmptyStateIllustration width={228} style={{ marginBottom: 10 }} />
                                    <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No tasks yet</Text>
                                    <Text style={[styles.emptyStateCopy, { color: colors.textSecondary }]}>
                                        This checklist has been created, but no tasks have been added yet.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.listColumn}>
                                        {items.map((item) => {
                                            return (
                                                <View key={item.id} style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, zIndex: openMenuId === item.id ? 100 : 1 }]}>
                                            <View style={[styles.stepHeader, { zIndex: openMenuId === item.id ? 100 : 1 }]}>
                                                    <TouchableOpacity
                                                        activeOpacity={isSimpleChecklist ? 0.7 : 1}
                                                        onPress={() => {
                                                            if (isSimpleChecklist && !isUnderReview) {
                                                                const updateItem = (id: string, value: any) => {
                                                                    setItems(currentItems => currentItems.map(i => i.id === id ? { ...i, value } : i));
                                                                };
                                                                updateItem(item.id, isComplete(item) ? '' : 'done');
                                                            }
                                                        }}
                                                    >
                                                        <View style={[styles.stepIcon, { backgroundColor: isComplete(item) ? colors.success : colors.surfaceHighlight }]}>
                                                            <Ionicons
                                                                name={isComplete(item) ? 'checkmark' : 'ellipse-outline'}
                                                                size={18}
                                                                color={isComplete(item) ? colors.white : colors.textSecondary}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                    {editingTask?.id === item.id ? (
                                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 12 }}>
                                                            <TextInput
                                                                style={[styles.inputSingle, getInputShellStyle(colors), { flex: 1, color: colors.text, paddingHorizontal: 12, minHeight: 40 }]}
                                                                value={editTaskLabel}
                                                                onChangeText={setEditTaskLabel}
                                                                autoFocus
                                                            />
                                                            <TouchableOpacity onPress={saveEditTask}>
                                                                <FontAwesome name="check-circle" size={24} color={colors.primary} />
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setEditingTask(null)}>
                                                                <FontAwesome name="times-circle" size={24} color={colors.textSecondary} />
                                                            </TouchableOpacity>
                                                        </View>
                                                    ) : (
                                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginLeft: 12 }}>
                                                            <View style={{ flex: 1 }}>
                                                                {item.label ? (
                                                                    <Text style={[styles.stepTitle, { color: colors.text }]}>{item.label}</Text>
                                                                ) : null}
                                                                {!item.required && (
                                                                    <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>
                                                                        Optional
                                                                    </Text>
                                                                )}
                                                            </View>
                                                            {!isUnderReview && (
                                                                <View style={{ position: 'relative', zIndex: openMenuId === item.id ? 10 : 1, marginLeft: 8 }}>
                                                                    <TouchableOpacity onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} style={{ padding: 4 }}>
                                                                        <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                                                                    </TouchableOpacity>
                                                                    {openMenuId === item.id && (
                                                                        <View style={{
                                                                            position: 'absolute',
                                                                            top: 30,
                                                                            right: 0,
                                                                            backgroundColor: colors.surfaceHighlight,
                                                                            borderRadius: 8,
                                                                            paddingVertical: 8,
                                                                            paddingHorizontal: 12,
                                                                            width: 150,
                                                                            shadowColor: '#000',
                                                                            shadowOffset: { width: 0, height: 2 },
                                                                            shadowOpacity: 0.15,
                                                                            shadowRadius: 4,
                                                                            elevation: 4,
                                                                            zIndex: 100
                                                                        }}>
                                                                            <TouchableOpacity style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); startEditTask(item); }}>
                                                                                <FontAwesome name="pencil" size={16} color={colors.primary} />
                                                                                <Text style={[FONTS.body, { color: colors.text }]}>Edit</Text>
                                                                            </TouchableOpacity>
                                                                            <TouchableOpacity style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); deleteTask(item.id); }}>
                                                                                <FontAwesome name="trash-o" size={16} color={colors.danger} />
                                                                                <Text style={[FONTS.body, { color: colors.danger }]}>Delete</Text>
                                                                            </TouchableOpacity>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}
                                                        </View>
                                                    )}
                                                </View>

                                                {!isSimpleChecklist && (
                                                    <>
                                                        {item.type === 'photo' || item.type === 'media' ? (
                                                            <TouchableOpacity
                                                                onPress={() => {
                                                                    setActiveMediaId(item.id);
                                                                    setMediaModalVisible(true);
                                                                }}
                                                                style={[styles.captureButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                                            >
                                                                <FontAwesome name="paperclip" size={18} color={colors.primary} />
                                                                <View style={{ alignItems: 'flex-start' }}>
                                                                    <Text style={[styles.captureButtonText, { color: colors.text }]}>Add attachment</Text>
                                                                    <Text style={[styles.stepMeta, { color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>Max-125mb size limit</Text>
                                                                </View>
                                                            </TouchableOpacity>
                                                        ) : item.type === 'remarks_response' ? (
                                                            <View style={{ gap: 12 }}>
                                                                <Text style={[FONTS.bodyStrong, { color: colors.text, marginBottom: 4 }]}>Remarks & Responses</Text>
                                                                {((item.value as string[][]) || []).map((pair, index) => (
                                                                    <View key={index} style={{ gap: 8, padding: 12, backgroundColor: colors.surfaceHighlight, borderRadius: 8 }}>
                                                                        <TextInput
                                                                            placeholder="Remark"
                                                                            placeholderTextColor={colors.textSecondary}
                                                                            style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text, minHeight: 40, paddingHorizontal: 12 }]}
                                                                            value={pair[0] || ''}
                                                                            onChangeText={(val) => {
                                                                                const current = [...((item.value as string[][]) || [['', '']])];
                                                                                current[index] = [val, current[index]?.[1] || ''];
                                                                                updateItem(item.id, current);
                                                                            }}
                                                                        />
                                                                        <TextInput
                                                                            multiline
                                                                            placeholder="Response"
                                                                            placeholderTextColor={colors.textSecondary}
                                                                            style={[styles.notesInput, getInputShellStyle(colors), { color: colors.text, minHeight: 60 }]}
                                                                            value={pair[1] || ''}
                                                                            onChangeText={(val) => {
                                                                                const current = [...((item.value as string[][]) || [['', '']])];
                                                                                current[index] = [current[index]?.[0] || '', val];
                                                                                updateItem(item.id, current);
                                                                            }}
                                                                        />
                                                                        {((item.value as string[][]) || []).length > 1 && !isUnderReview && (
                                                                            <TouchableOpacity 
                                                                                style={{ alignSelf: 'flex-end', marginTop: 4 }}
                                                                                onPress={() => {
                                                                                    const current = [...((item.value as string[][]) || [['', '']])];
                                                                                    current.splice(index, 1);
                                                                                    updateItem(item.id, current);
                                                                                }}
                                                                            >
                                                                                <Text style={{ color: colors.danger, fontSize: 12 }}>Remove</Text>
                                                                            </TouchableOpacity>
                                                                        )}
                                                                    </View>
                                                                ))}
                                                                {!isUnderReview && (
                                                                    <TouchableOpacity 
                                                                        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, padding: 8 }}
                                                                        onPress={() => {
                                                                            const current = [...((item.value as string[][]) || [['', '']])];
                                                                            current.push(['', '']);
                                                                            updateItem(item.id, current);
                                                                        }}
                                                                    >
                                                                        <FontAwesome name="plus" size={14} color={colors.primary} />
                                                                        <Text style={{ color: colors.primary, fontWeight: '500' }}>Add another remark</Text>
                                                                    </TouchableOpacity>
                                                                )}
                                                            </View>
                                                        ) : item.type === 'text' ? (
                                                            <TextInput
                                                                multiline
                                                                placeholder={getChecklistPlaceholder(item)}
                                                                placeholderTextColor={colors.textSecondary}
                                                                style={[styles.notesInput, getInputShellStyle(colors), { color: colors.text }]}
                                                                value={String(item.value)}
                                                                onChangeText={(value) => updateItem(item.id, value)}
                                                            />
                                                        ) : (
                                                            <TextInput
                                                                keyboardType={item.type === 'number' ? 'numeric' : 'default'}
                                                                placeholder={getChecklistPlaceholder(item)}
                                                                placeholderTextColor={colors.textSecondary}
                                                                style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                value={Array.isArray(item.value) ? item.value.join(', ') : String(item.value)}
                                                                onChangeText={(value) => updateItem(item.id, value)}
                                                            />
                                                        )}

                                                        {item.options?.length ? (
                                                            <Text style={[styles.stepHint, { color: colors.textSecondary }]}>
                                                                {item.options.join(', ')}
                                                            </Text>
                                                        ) : null}
                                                    </>
                                                )}
                                                </View>
                                            );
                                        })}
                                    </View>

                                    {isUnderReview && (
                                        <View style={{ marginTop: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border, gap: 12 }}>
                                            <Text style={[{ color: colors.textSecondary }, FONTS.label]}>Submission Details</Text>
                                            <View style={[styles.card, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, padding: 16, gap: 8 }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                    <Ionicons name="chatbubble-ellipses-outline" size={18} color={colors.primary} />
                                                    <Text style={[{ color: colors.text }, FONTS.bodyStrong]}>Completion Comments</Text>
                                                </View>
                                                <Text style={[{ color: colors.textSecondary, lineHeight: 20 }, FONTS.body]}>
                                                    Foundation work fully validated. Cabinets locked and connectors tested.
                                                </Text>

                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                                                    <Ionicons name="attach-outline" size={18} color={colors.secondary} />
                                                    <Text style={[{ color: colors.text }, FONTS.bodyStrong]}>Uploaded Attachment</Text>
                                                </View>
                                                <View style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: 'transparent', borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', marginTop: 4, padding: 12 }]}>
                                                    <View style={[styles.stepIcon, { backgroundColor: colors.primary + '15', width: 36, height: 36, borderRadius: 18 }]}>
                                                        <Ionicons name="document-text" size={18} color={colors.primary} />
                                                    </View>
                                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                                        <Text style={[styles.stepTitle, { color: colors.text, fontSize: 13 }]}>completion_evidence.jpg</Text>
                                                        <Text style={[styles.stepMeta, { color: colors.textSecondary, fontSize: 11 }]}>Image • 1.5 MB</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </View>
                                    )}
                                </>
                            )}
                        </>
                    ) : activeTab === 'Activities' ? (
                        <>
                            <View style={styles.filterRow}>
                                {(['All', 'Comment', 'Activity'] as const).map((filter) => {
                                    const isSelected = activityFilter === filter;
                                    return (
                                        <TouchableOpacity
                                            key={filter}
                                            onPress={() => setActivityFilter(filter)}
                                            style={[
                                                styles.filterChip,
                                                {
                                                    backgroundColor: isSelected ? colors.primary + '14' : colors.surface,
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                },
                                            ]}
                                        >
                                            <Text style={[styles.filterChipText, { color: isSelected ? colors.primary : colors.textSecondary }]}>
                                                {filter}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>


                            <View style={styles.activityList}>
                                {filteredActivities.map((activity, index) => {
                                    const isComment = activity.type === 'comment';
                                    const isStatus = activity.type === 'status';
                                    const badgeColor = isComment ? colors.primary : isStatus ? colors.success : colors.textSecondary;
                                    const badgeBackground = isComment ? colors.primary + '14' : isStatus ? colors.success + '14' : colors.surfaceHighlight;
                                    const badgeLabel = isComment ? 'Comment' : 'Activity';
                                    const markerIcon = isComment ? 'comment' : isStatus ? 'check-circle' : 'refresh';
                                    const isFirst = index === 0;
                                    const isLast = index === filteredActivities.length - 1;

                                    return (
                                        <View key={activity.id} style={styles.timelineRow}>
                                            <View style={styles.timelineRail}>
                                                {!isFirst ? (
                                                    <View
                                                        style={[
                                                            styles.timelineLineTop,
                                                            { backgroundColor: colors.border },
                                                        ]}
                                                    />
                                                ) : null}
                                                <View style={[styles.timelineMarkerWrap, { backgroundColor: colors.background }]}>
                                                    <FontAwesome name={markerIcon} size={16} color={badgeColor} />
                                                </View>
                                                {!isLast ? (
                                                    <View
                                                        style={[
                                                            styles.timelineLineBottom,
                                                            { backgroundColor: colors.border },
                                                        ]}
                                                    />
                                                ) : null}
                                            </View>
                                            <View style={styles.timelineContent}>
                                                <View style={styles.activityTopRow}>
                                                    <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                                                    <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.time}</Text>
                                                </View>
                                                <View style={[styles.activityBadge, { backgroundColor: badgeBackground, borderColor: badgeColor }]}>
                                                    <Text style={[styles.activityBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
                                                </View>

                                                {editingCommentId === activity.id ? (
                                                    <View style={{ marginTop: 8 }}>
                                                        <TextInput
                                                            style={[styles.commentInput, getInputShellStyle(colors), { color: colors.text, marginBottom: 8 }]}
                                                            value={editingCommentText}
                                                            onChangeText={setEditingCommentText}
                                                            multiline
                                                        />
                                                        <View style={{ flexDirection: 'row', gap: 8 }}>
                                                            <TouchableOpacity onPress={handleSaveEdit} style={{ backgroundColor: colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                                                <Text style={{ color: colors.white, ...FONTS.bodyStrong, fontSize: 12 }}>Save</Text>
                                                            </TouchableOpacity>
                                                            <TouchableOpacity onPress={() => setEditingCommentId(null)} style={{ backgroundColor: colors.surfaceHighlight, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}>
                                                                <Text style={{ color: colors.text, ...FONTS.bodyStrong, fontSize: 12 }}>Cancel</Text>
                                                            </TouchableOpacity>
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <Text style={[styles.activityDetail, { color: colors.textSecondary }]}>{activity.detail}</Text>
                                                )}

                                                {isComment && editingCommentId !== activity.id ? (
                                                    <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                                                        <TouchableOpacity onPress={() => handleStartEdit(activity.id, activity.detail)}>
                                                            <Text style={{ color: colors.primary, ...FONTS.bodyStrong, fontSize: 12 }}>Edit</Text>
                                                        </TouchableOpacity>
                                                        <TouchableOpacity onPress={() => handleDeleteComment(activity.id)}>
                                                            <Text style={{ color: colors.secondary, ...FONTS.bodyStrong, fontSize: 12 }}>Delete</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </View>
                                    );
                                })}
                                {filteredActivities.length === 0 ? (
                                    <View style={[styles.emptyStateCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                        <EmptyStateIllustration width={188} style={{ marginBottom: 10 }} />
                                        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No matching items</Text>
                                        <Text style={[styles.emptyStateCopy, { color: colors.textSecondary }]}>
                                            Try another activity filter.
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </>
                    ) : activeTab === 'Attachments' ? (
                        <>
                            <View style={styles.listColumn}>
                                <View style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={[styles.stepIcon, { backgroundColor: colors.primary + '15' }]}>
                                        <Ionicons name="document-text" size={20} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.stepTitle, { color: colors.text }]}>Site Layout Plan.pdf</Text>
                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>PDF Document • 2.4 MB</Text>
                                    </View>
                                </View>

                                <View style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={[styles.stepIcon, { backgroundColor: colors.secondary + '15' }]}>
                                        <Ionicons name="image" size={20} color={colors.secondary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.stepTitle, { color: colors.text }]}>Previous Service Photo.jpg</Text>
                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>Image • 1.1 MB</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.captureButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 16 }]}>
                                <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                                <View style={{ alignItems: 'flex-start' }}>
                                    <Text style={[styles.captureButtonText, { color: colors.text }]}>Upload New Attachment</Text>
                                    <Text style={[styles.stepMeta, { color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>Max-125mb size limit</Text>
                                </View>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </ScrollView>

                {activeTab === 'Tasks' && isUnderReview && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
                    >
                        <TouchableOpacity
                            onPress={handleRejectWork}
                            style={[styles.footerButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.danger, borderWidth: 1 }]}
                        >
                            <Text style={[styles.footerButtonText, { color: colors.danger, ...FONTS.bodyStrong }]}>Reject</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={handleApproveWork}
                            style={[
                                styles.footerButton,
                                {
                                    backgroundColor: colors.success,
                                    borderColor: colors.success,
                                    opacity: 1,
                                },
                            ]}
                        >
                            <Text style={[styles.footerPrimaryText, { color: colors.white }]}>
                                Approve
                            </Text>
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                )}

                {activeTab === 'Activities' && (
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                        style={[
                            styles.footer, 
                            { 
                                backgroundColor: colors.background, 
                                borderTopColor: colors.border,
                                paddingVertical: 12,
                                gap: 12,
                            }
                        ]}
                    >
                        <View style={{ flex: 1, position: 'relative', justifyContent: 'center' }}>
                            <TextInput
                                style={[
                                    styles.commentInput, 
                                    getInputShellStyle(colors), 
                                    { 
                                        color: colors.text, 
                                        backgroundColor: colors.surfaceHighlight,
                                        paddingRight: 44,
                                    }
                                ]}
                                placeholder="Add a comment..."
                                placeholderTextColor={colors.textSecondary}
                                value={newComment}
                                onChangeText={setNewComment}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    setMediaModalVisible(true);
                                    setCommentHasAttachment(!commentHasAttachment);
                                }}
                                style={{
                                    position: 'absolute',
                                    right: 12,
                                    width: 28,
                                    height: 28,
                                    borderRadius: 14,
                                    backgroundColor: commentHasAttachment ? colors.primary + '18' : 'transparent',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Ionicons 
                                    name="attach" 
                                    size={20} 
                                    color={commentHasAttachment ? colors.primary : colors.textSecondary} 
                                />
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity 
                            style={[
                                styles.addCommentButton, 
                                { 
                                    backgroundColor: colors.primary,
                                }
                            ]}
                            onPress={handleAddComment}
                        >
                            <Ionicons name="send" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                )}

                {activeTab === 'Tasks' && (
                    <TouchableOpacity
                        style={[styles.fab, { backgroundColor: colors.primary, shadowColor: '#000' }]}
                        activeOpacity={0.9}
                        onPress={() => navigation.navigate('CreateTask', {
                            fromDetail: true,
                            prefill: {
                                serviceType: workOrder.type,
                                siteName: workOrder.siteName,
                                projectId: workOrder.projectId,
                                stageName: 'Inspection',
                                checklistName: 'Pedestal Repair'
                            }
                        })}
                    >
                        <Ionicons name="add" size={32} color={colors.white} />
                    </TouchableOpacity>
                )}
                <Modal visible={mediaModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.bottomSheetInner, { backgroundColor: colors.background, paddingBottom: 40 }]}>
                            <Text style={[styles.sheetTitle, { color: colors.textSecondary }]}>Add Attachment</Text>

                            <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => { setMediaModalVisible(false); if (activeMediaId) updateItem(activeMediaId, Number(items.find(i => i.id === activeMediaId)?.value || 0) + 1); }}>
                                <FontAwesome name="camera" size={20} color={colors.primary} style={styles.sheetIcon} />
                                <Text style={[styles.sheetOptionText, { color: colors.text }]}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => { setMediaModalVisible(false); if (activeMediaId) updateItem(activeMediaId, Number(items.find(i => i.id === activeMediaId)?.value || 0) + 1); }}>
                                <FontAwesome name="video-camera" size={20} color={colors.primary} style={styles.sheetIcon} />
                                <Text style={[styles.sheetOptionText, { color: colors.text }]}>Record Video</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setMediaModalVisible(false); if (activeMediaId) updateItem(activeMediaId, Number(items.find(i => i.id === activeMediaId)?.value || 0) + 1); }}>
                                <FontAwesome name="paperclip" size={20} color={colors.primary} style={styles.sheetIcon} />
                                <Text style={[styles.sheetOptionText, { color: colors.text }]}>Attach File</Text>
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.sheetCancel, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]} onPress={() => setMediaModalVisible(false)}>
                                <Text style={[styles.sheetCancelText, { color: colors.text }]}>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={actionModalVisible} transparent animationType="fade">
                    <TouchableOpacity style={[styles.modalOverlay, { justifyContent: 'flex-start', alignItems: 'flex-end', paddingTop: 60, paddingRight: 16 }]} activeOpacity={1} onPress={() => setActionModalVisible(false)}>
                        <View style={[{ backgroundColor: colors.surface, borderRadius: 16, padding: 12, minWidth: 260, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 12 }]}>
                            {isUnderReview ? (
                                <>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleApproveWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleRejectWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                        <Ionicons name="close-circle-outline" size={26} color={colors.danger} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleCompleteAction(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>{completeActionLabel}</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={confirmationModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.confirmSheet, { backgroundColor: colors.surface }]}>
                            <View style={[styles.warningIconCircle, { backgroundColor: colors.secondary + '15' }]}>
                                <Ionicons name="warning" size={32} color={colors.secondary} />
                            </View>

                            <Text style={[styles.confirmTitle, { color: colors.text }]}>Incomplete Tasks</Text>
                            <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                                Are you sure you want to move the checklists with applicable incomplete tasks to review?
                            </Text>

                            <View style={[styles.checklistBadge, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text style={[styles.checklistBadgeText, { color: colors.text }]}>{workOrder.title}</Text>
                            </View>

                            <View style={styles.confirmActions}>
                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                    onPress={() => setConfirmationModalVisible(false)}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => {
                                        setConfirmationModalVisible(false);
                                        setCompletionModalVisible(true);
                                    }}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.white }]}>Move to Review</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={naConfirmModalVisible} transparent animationType="fade">
                    <View style={styles.popupOverlay}>
                        <View style={[styles.popupModal, { backgroundColor: colors.surface }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <FontAwesome name="ban" size={24} color={colors.danger} />
                                <Text style={[styles.confirmTitle, { color: colors.text, marginBottom: 0 }]}>
                                    {taskToMarkNa && items.find(i => i.id === taskToMarkNa)?.isNa ? 'Mark as Applicable?' : 'Mark as N/A?'}
                                </Text>
                            </View>
                            <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                                {taskToMarkNa && items.find(i => i.id === taskToMarkNa)?.isNa 
                                    ? "Are you sure you want to mark this task as applicable again?" 
                                    : "Are you sure you want to mark this task as Not Applicable? This will skip the task."}
                            </Text>

                            <View style={styles.confirmActions}>
                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                    onPress={() => {
                                        setNaConfirmModalVisible(false);
                                        setTaskToMarkNa(null);
                                    }}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                                    onPress={handleConfirmNa}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.white }]}>Yes</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={deleteConfirmModalVisible} transparent animationType="fade">
                    <View style={styles.popupOverlay}>
                        <View style={[styles.popupModal, { backgroundColor: colors.surface }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <FontAwesome name="trash-o" size={24} color={colors.danger} />
                                <Text style={[styles.confirmTitle, { color: colors.text, marginBottom: 0 }]}>
                                    Delete Task?
                                </Text>
                            </View>
                            <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                                Are you sure you want to delete this task? This action cannot be undone.
                            </Text>

                            <View style={styles.confirmActions}>
                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                    onPress={() => {
                                        setDeleteConfirmModalVisible(false);
                                        setTaskToDelete(null);
                                    }}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.danger }]}
                                    onPress={handleConfirmDelete}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.white }]}>Delete</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={completionModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setCompletionModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Complete Work Details</Text>
                                    <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 2 }]}>Submit comments and final evidence</Text>
                                </View>
                                <TouchableOpacity onPress={() => setCompletionModalVisible(false)} style={styles.modalClose}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <View style={{ gap: 16, paddingBottom: 36 }}>
                                    <View style={{ gap: 4 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            <Text style={{ color: colors.danger }}>* </Text>Completion Comments
                                        </Text>
                                        <TextInput
                                            value={completionComments}
                                            onChangeText={setCompletionComments}
                                            style={[
                                                styles.commentInput, 
                                                getInputShellStyle(colors), 
                                                { 
                                                    color: colors.text, 
                                                    minHeight: 100, 
                                                    textAlignVertical: 'top',
                                                    paddingTop: 12,
                                                }
                                            ]}
                                            placeholder="Provide final completion notes..."
                                            placeholderTextColor={colors.textSecondary}
                                            multiline
                                        />
                                    </View>

                                    <View style={{ gap: 4 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Attachment</Text>
                                        <TouchableOpacity 
                                            activeOpacity={0.8}
                                            onPress={() => setCompletionHasAttachment(!completionHasAttachment)}
                                            style={[
                                                styles.captureButton, 
                                                { 
                                                    backgroundColor: completionHasAttachment ? colors.primary + '12' : colors.surfaceHighlight,
                                                    borderColor: completionHasAttachment ? colors.primary : colors.border,
                                                }
                                            ]}
                                        >
                                            <Ionicons 
                                                name={completionHasAttachment ? "checkmark-circle" : "attach"}
                                                size={18} 
                                                color={colors.primary} 
                                            />
                                            <Text style={[styles.captureButtonText, { color: colors.text }]}>
                                                {completionHasAttachment ? 'Attachment Added' : 'Upload attachments'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, borderWidth: 1 }]}
                                    onPress={() => setCompletionModalVisible(false)}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.primary }]}
                                    onPress={handleSubmitCompletion}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.white }]}>Submit for Review</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={approveModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setApproveModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Approve Work Comments</Text>
                                    <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 2 }]}>Provide feedback or notes for approval</Text>
                                </View>
                                <TouchableOpacity onPress={() => setApproveModalVisible(false)} style={styles.modalClose}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <View style={{ gap: 16, paddingBottom: 36 }}>
                                    <View style={{ gap: 4 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            Approval Comments / Feedback
                                        </Text>
                                        <TextInput
                                            value={approveComments}
                                            onChangeText={setApproveComments}
                                            style={[
                                                styles.commentInput, 
                                                getInputShellStyle(colors), 
                                                { 
                                                    color: colors.text, 
                                                    minHeight: 100, 
                                                    textAlignVertical: 'top',
                                                    paddingTop: 12,
                                                }
                                            ]}
                                            placeholder="Provide approval comments (optional)..."
                                            placeholderTextColor={colors.textSecondary}
                                            multiline
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, borderWidth: 1 }]}
                                    onPress={() => setApproveModalVisible(false)}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.success }]}
                                    onPress={handleConfirmApproval}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.white }]}>Confirm Approve</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal visible={rejectModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setRejectModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Reject Work</Text>
                                    <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 2 }]}>Provide feedback on why it was rejected</Text>
                                </View>
                                <TouchableOpacity onPress={() => setRejectModalVisible(false)} style={styles.modalClose}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <View style={{ gap: 16, paddingBottom: 36 }}>
                                    <View style={{ gap: 4 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            <Text style={{ color: colors.danger }}>* </Text>Rejection Comments
                                        </Text>
                                        <TextInput
                                            value={rejectComments}
                                            onChangeText={setRejectComments}
                                            style={[
                                                styles.commentInput, 
                                                getInputShellStyle(colors), 
                                                { 
                                                    color: colors.text, 
                                                    minHeight: 100, 
                                                    textAlignVertical: 'top',
                                                    paddingTop: 12,
                                                }
                                            ]}
                                            placeholder="Please provide details for the rejection..."
                                            placeholderTextColor={colors.textSecondary}
                                            multiline
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, borderWidth: 1 }]}
                                    onPress={() => setRejectModalVisible(false)}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.danger }]}
                                    onPress={handleConfirmReject}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.white }]}>Confirm Reject</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
    header: {
        minHeight: 60,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        gap: 12,
    },
    actionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    actionBtnText: {
        ...FONTS.bodyStrong,
        fontSize: 13,
    },
    backButton: {
        minWidth: 28,
        minHeight: 28,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -6,
    },
    iconButton: {
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        ...FONTS.h3,
    },
    headerTitleWrap: {
        flex: 1,
        minWidth: 0,
    },
    headerTypeChip: {
        minHeight: 24,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
        marginRight: 8,
    },
    headerTypeChipText: {
        ...FONTS.label,
        fontSize: 9,
    },
    content: {
        padding: 12,
        paddingBottom: 24,
    },
    heroCard: {
        borderRadius: 18,
        padding: 14,
        marginBottom: 8,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        marginBottom: 10,
    },
    heroTitleWrap: {
        flex: 1,
    },
    heroTopChipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    jobTitle: {
        ...FONTS.h2,
        fontSize: 20,
        lineHeight: 24,
    },
    navButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginBottom: 10,
    },
    heroInfoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    heroChip: {
        minHeight: 26,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 9,
        paddingVertical: 4,
    },
    heroWideChip: {
        flex: 1,
        minWidth: 0,
    },
    heroChipText: {
        ...FONTS.label,
        fontSize: 10,
    },
    heroSubLabel: {
        ...FONTS.label,
        fontSize: 10,
        marginBottom: 6,
        marginTop: 0,
    },
    tabSwitch: {
        minHeight: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        marginBottom: 10,
    },
    tabButton: {
        flex: 1,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabButtonText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    sectionLabel: {
        ...FONTS.label,
        marginBottom: 10,
    },
    listColumn: {
        gap: 8,
        marginBottom: 8,
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 14,
    },
    filterChip: {
        minHeight: 36,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    filterChipText: {
        ...FONTS.label,
        fontSize: 11,
    },
    activityList: {
        marginTop: 16,
    },
    addCommentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 16,
        gap: 12,
    },
    commentInput: {
        flex: 1,
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 10,
        ...FONTS.body,
    },
    addCommentButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        minHeight: 92,
    },
    timelineRail: {
        width: 38,
        alignItems: 'center',
        position: 'relative',
        alignSelf: 'stretch',
    },
    timelineLineTop: {
        position: 'absolute',
        top: 0,
        bottom: 45,
        width: 2,
    },
    timelineLineBottom: {
        position: 'absolute',
        top: 23,
        bottom: 0,
        width: 2,
    },
    timelineMarkerWrap: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 7,
        zIndex: 1,
    },
    timelineContent: {
        flex: 1,
        paddingBottom: 18,
    },
    activityTopRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 10,
        marginBottom: 6,
    },
    activityTitle: {
        ...FONTS.bodyStrong,
        flex: 1,
    },
    activityTime: {
        ...FONTS.label,
        fontSize: 10,
    },
    activityBadge: {
        alignSelf: 'flex-start',
        minHeight: 24,
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    activityBadgeText: {
        ...FONTS.label,
        fontSize: 10,
    },
    activityDetail: {
        ...FONTS.body,
        marginTop: 8,
    },
    emptyStateCard: {
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    emptyStateTitle: {
        ...FONTS.bodyStrong,
        marginBottom: 4,
        textAlign: 'center',
    },
    emptyStateCopy: {
        ...FONTS.body,
        textAlign: 'center',
    },
    stepCard: {
        borderRadius: 16,
        padding: 12,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    stepHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    stepIcon: {
        width: 40,
        height: 40,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepTitle: {
        ...FONTS.h3,
        marginBottom: 4,
    },
    stepMeta: {
        ...FONTS.caption,
    },
    stepHint: {
        ...FONTS.caption,
        marginTop: 8,
    },
    inlineActions: {
        flexDirection: 'row',
        gap: 10,
    },
    choiceButton: {
        flex: 1,
        minHeight: 50,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    choiceText: {
        ...FONTS.bodyStrong,
    },
    optionColumn: {
        gap: 10,
    },
    optionButton: {
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionText: {
        ...FONTS.bodyStrong,
        flex: 1,
        marginRight: 8,
    },
    notesInput: {
        minHeight: 110,
        borderRadius: 12,
        padding: 14,
        textAlignVertical: 'top',
        ...FONTS.body,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    inputSingle: {
        minHeight: 52,
        borderRadius: 12,
        paddingHorizontal: 14,
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
    },
    captureButtonText: {
        ...FONTS.bodyStrong,
        textAlign: 'center',
        fontSize: 16,
    },
    completionInput: {
        minHeight: 120,
        borderRadius: 16,
        padding: 16,
        marginBottom: 14,
        textAlignVertical: 'top',
        ...FONTS.body,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 4,
    },
    footer: {
        flexDirection: 'row',
        gap: 10,
        padding: 16,
        borderTopWidth: 1,
    },
    footerButton: {
        flex: 1,
        minHeight: 68,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerButtonText: {
        ...FONTS.bodyStrong,
    },
    footerPrimaryText: {
        ...FONTS.bodyStrong,
    },
    fab: {
        position: 'absolute',
        bottom: 96,
        right: 20,
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    popupOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    popupModal: {
        width: '100%',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    bottomSheetInner: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        paddingTop: 32,
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
    confirmSheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        alignItems: 'center',
    },
    warningIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    confirmTitle: {
        ...FONTS.h2,
        marginBottom: 12,
        textAlign: 'center',
    },
    confirmMessage: {
        ...FONTS.body,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 20,
    },
    checklistBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 32,
    },
    checklistBadgeText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    confirmActions: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },
    confirmBtn: {
        flex: 1,
        minHeight: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    confirmBtnText: {
        ...FONTS.bodyStrong,
    },
    modalSheet: {
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    modalTitle: {
        ...FONTS.h2,
    },
    modalSub: {
        ...FONTS.caption,
    },
    modalClose: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalScroll: {
        flexShrink: 1,
    },
    inputLabel: {
        ...FONTS.label,
        marginBottom: 8,
    },
    modalFooterRow: {
        flexDirection: 'row',
        gap: 12,
        paddingVertical: 12,
        paddingBottom: 24,
    },
    footerBtn: {
        flex: 1,
        minHeight: 52,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBtnText: {
        ...FONTS.bodyStrong,
    },
    card: {
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
});
