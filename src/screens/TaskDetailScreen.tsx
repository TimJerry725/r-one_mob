import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { useTheme } from '../context/ThemeContext';
import { ACTIVITY_LOG, CHECKLIST_TEMPLATE, ChecklistTemplateItem, getWorkOrderById } from '../data/fieldDemo';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';

type ChecklistStateItem = {
    id: string;
    label: string;
    type: 'toggle' | 'text' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'media';
    required: boolean;
    options?: string[];
    value: string | number | string[];
};

const getCompletedChecklistValue = (item: ChecklistTemplateItem): string | number | string[] => {
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
                : '',
    }));

const isComplete = (item: ChecklistStateItem) => {
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
    const checklistTemplate = workOrder.checklistItems ?? CHECKLIST_TEMPLATE;
    const [items, setItems] = useState<ChecklistStateItem[]>(() => buildChecklistState(checklistTemplate, isUnderReview));
    const [completionNote, setCompletionNote] = useState('');
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>('Tasks');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('All');

    const [confirmationModalVisible, setConfirmationModalVisible] = useState(false);

    const requiredItems = items.filter((item) => item.required);
    const completedRequired = requiredItems.filter(isComplete).length;
    const allCompleted = items.filter(isComplete).length === items.length;
    const readyToComplete = items.length > 0 && completedRequired === requiredItems.length;
    const completeActionLabel = isUnderReview ? 'Review Work' : 'Mark Complete';
    const filteredActivities = ACTIVITY_LOG.filter((item) => {
        if (activityFilter === 'All') {
            return true;
        }
        if (activityFilter === 'Comment') {
            return item.type === 'comment';
        }
        return item.type !== 'comment';
    });

    const updateItem = (id: string, value: string | number | string[]) => {
        setItems((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
    };

    const handleCompleteAction = () => {
        if (!allCompleted) {
            setConfirmationModalVisible(true);
        } else {
            navigation.goBack();
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    >
                        <Ionicons name="chevron-back" size={28} color={colors.text} />
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

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    <View style={[styles.heroCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroTitleWrap}>
                                <Text numberOfLines={2} style={[styles.jobTitle, { color: colors.text }]}>{workOrder.title}</Text>
                                {workOrder.type === 'Installation' ? (
                                    <View style={styles.heroTopChipRow}>
                                        <View style={[styles.heroChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                                            <Text style={[styles.heroChipText, { color: colors.primary }]}>{workOrder.stage}</Text>
                                        </View>
                                    </View>
                                ) : null}
                            </View>
                            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="navigate" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.heroInfoRow}>
                            <View style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>{workOrder.assetId}</Text>
                            </View>
                            <View style={[styles.heroChip, styles.heroWideChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text numberOfLines={1} style={[styles.heroChipText, { color: colors.textSecondary }]}>{workOrder.address}</Text>
                            </View>
                            <View style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>{workOrder.projectId}</Text>
                            </View>
                        </View>

                        <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Deadline</Text>
                        <View style={[styles.chipRow, { marginBottom: 16 }]}>
                            <View style={[styles.heroChip, { backgroundColor: colors.danger + '15', borderColor: colors.danger }]}>
                                <Text style={[styles.heroChipText, { color: colors.danger }]}>
                                    {new Date(workOrder.targetTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                        </View>

                        <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Assignees & Approvals</Text>
                        <View style={styles.chipRow}>
                            {workOrder.technicians.map((tech, idx) => {
                                const isLead = idx === 0;
                                return (
                                    <View key={tech} style={[styles.heroChip, { backgroundColor: isLead ? colors.primary : colors.primary + '15', borderColor: colors.primary }]}>
                                        <Text style={[styles.heroChipText, { color: isLead ? colors.white : colors.primary }]}>
                                            {isLead ? `Lead: ${tech}` : tech}
                                        </Text>
                                    </View>
                                );
                            })}
                            <View style={[styles.heroChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                                <Text style={[styles.heroChipText, { color: colors.primary }]}>Approver: Dispatch</Text>
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
                                        {items.map((item) => (
                                            <View key={item.id} style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                                <View style={styles.stepHeader}>
                                                    <View style={[styles.stepIcon, { backgroundColor: isComplete(item) ? colors.success : colors.surfaceHighlight }]}>
                                                        <Ionicons
                                                            name={isComplete(item) ? 'checkmark' : 'ellipse-outline'}
                                                            size={18}
                                                            color={isComplete(item) ? colors.white : colors.textSecondary}
                                                        />
                                                    </View>
                                                    <View style={{ flex: 1 }}>
                                                        <Text style={[styles.stepTitle, { color: colors.text }]}>{item.label}</Text>
                                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>
                                                            {item.required ? 'Required before completion' : 'Optional'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {item.type === 'photo' || item.type === 'media' ? (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            setActiveMediaId(item.id);
                                                            setMediaModalVisible(true);
                                                        }}
                                                        style={[styles.captureButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                                    >
                                                        <FontAwesome name="paperclip" size={18} color={colors.primary} />
                                                        <Text style={[styles.captureButtonText, { color: colors.text }]}>Add attachment</Text>
                                                    </TouchableOpacity>
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
                                            </View>
                                        ))}
                                    </View>
                                    <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Completion Note</Text>
                                    <TextInput
                                        multiline
                                        placeholder="Summarize findings and follow-up actions."
                                        placeholderTextColor={colors.textSecondary}
                                        style={[styles.completionInput, getInputShellStyle(colors), { color: colors.text }]}
                                        value={completionNote}
                                        onChangeText={setCompletionNote}
                                    />
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
                                                <Text style={[styles.activityDetail, { color: colors.textSecondary }]}>{activity.detail}</Text>
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
                                    <View style={[styles.stepIcon, { backgroundColor: colors.primary + '15', width: 48, height: 48 }]}>
                                        <Ionicons name="document-text" size={24} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.stepTitle, { color: colors.text }]}>Site Layout Plan.pdf</Text>
                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>PDF Document • 2.4 MB</Text>
                                    </View>
                                </View>

                                <View style={[styles.stepCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, flexDirection: 'row', alignItems: 'center' }]}>
                                    <View style={[styles.stepIcon, { backgroundColor: colors.secondary + '15', width: 48, height: 48 }]}>
                                        <Ionicons name="image" size={24} color={colors.secondary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.stepTitle, { color: colors.text }]}>Previous Service Photo.jpg</Text>
                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>Image • 1.1 MB</Text>
                                    </View>
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.captureButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 16 }]}>
                                <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                                <Text style={[styles.captureButtonText, { color: colors.text }]}>Upload New Attachment</Text>
                            </TouchableOpacity>
                        </>
                    ) : null}
                </ScrollView>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
                >
                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={[styles.footerButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                    >
                        <Text style={[styles.footerButtonText, { color: colors.text }]}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={handleCompleteAction}
                        style={[
                            styles.footerButton,
                            {
                                backgroundColor: readyToComplete ? colors.primary : colors.surfaceHighlight,
                                borderColor: readyToComplete ? colors.primary : colors.border,
                                opacity: 1,
                            },
                        ]}
                    >
                        <Text style={[styles.footerPrimaryText, { color: readyToComplete ? colors.white : colors.textSecondary }]}>
                            {completeActionLabel}
                        </Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>

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
                            <TouchableOpacity onPress={() => { setActionModalVisible(false); handleCompleteAction(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>{completeActionLabel}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setActionModalVisible(false); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                <Ionicons name={isUnderReview ? "close-circle-outline" : "arrow-redo-outline"} size={26} color={isUnderReview ? colors.secondary : colors.primary} style={{ marginRight: 14 }} />
                                <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>{isUnderReview ? 'Reject' : 'Forward'}</Text>
                            </TouchableOpacity>
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
                                        navigation.goBack();
                                    }}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.white }]}>Move to Review</Text>
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
        padding: 16,
        paddingBottom: 24,
    },
    heroCard: {
        borderRadius: 18,
        padding: 14,
        marginBottom: 14,
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
        marginBottom: 16,
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
        gap: 12,
        marginBottom: 14,
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
        marginBottom: 14,
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
        padding: 16,
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
});
