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
import { useTheme } from '../context/ThemeContext';
import { ACTIVITY_LOG, CHECKLIST_TEMPLATE, getWorkOrderById } from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';
import { getServiceTypeColors } from '../styles/workTypeColors';

type ChecklistStateItem = {
    id: string;
    label: string;
    type: 'toggle' | 'text' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'media';
    required: boolean;
    options?: string[];
    value: string | number | string[];
};

const buildChecklistState = (): ChecklistStateItem[] =>
    CHECKLIST_TEMPLATE.map((item) => ({
        ...item,
        value: item.type === 'photo' || item.type === 'media' ? 0 : '',
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

type DetailTab = 'Tasks' | 'Activities';
type ActivityFilter = 'All' | 'Comment' | 'Activity';

export const TaskDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const workOrder = getWorkOrderById(route.params?.taskId);
    const typeColors = getServiceTypeColors(workOrder.type, isDark);
    const [items, setItems] = useState<ChecklistStateItem[]>(buildChecklistState);
    const [signatureCaptured, setSignatureCaptured] = useState(false);
    const [completionNote, setCompletionNote] = useState('');
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [activeTab, setActiveTab] = useState<DetailTab>('Tasks');
    const [activityFilter, setActivityFilter] = useState<ActivityFilter>('All');

    const requiredItems = items.filter((item) => item.required);
    const completedRequired = requiredItems.filter(isComplete).length;
    const readyToComplete = completedRequired === requiredItems.length && signatureCaptured;
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
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.headerTitle, { color: colors.text }]}>{workOrder.siteName}</Text>
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
                        <Text style={[styles.jobTitle, { color: colors.text }]}>{workOrder.title}</Text>
                        <View style={styles.locationRow}>
                            <Text style={[styles.jobAddress, { color: colors.textSecondary, flex: 1 }]}>
                                {workOrder.address}
                            </Text>
                            <TouchableOpacity style={[styles.navButton, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="navigate" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.chipRow}>
                            <View style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>{workOrder.assetId}</Text>
                            </View>
                            <View style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>{workOrder.siteName}</Text>
                            </View>
                        </View>

                        <View style={styles.chipRow}>
                            <View style={[styles.heroChip, { backgroundColor: typeColors.tint, borderColor: typeColors.border }]}>
                                <Text style={[styles.heroChipText, { color: typeColors.tintText }]}>{workOrder.type}</Text>
                            </View>
                            {workOrder.type === 'Installation' ? (
                                <View style={[styles.heroChip, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                                    <Text style={[styles.heroChipText, { color: colors.primary }]}>{workOrder.stage}</Text>
                                </View>
                            ) : null}
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
                        {(['Tasks', 'Activities'] as const).map((tab) => {
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
                                                style={[styles.notesInput, { color: colors.text, backgroundColor: colors.cardAlt, shadowColor: colors.shadow }]}
                                                value={String(item.value)}
                                                onChangeText={(value) => updateItem(item.id, value)}
                                            />
                                        ) : (
                                            <TextInput
                                                keyboardType={item.type === 'number' ? 'numeric' : 'default'}
                                                placeholder={getChecklistPlaceholder(item)}
                                                placeholderTextColor={colors.textSecondary}
                                                style={[styles.inputSingle, { color: colors.text, backgroundColor: colors.cardAlt, shadowColor: colors.shadow }]}
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

                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Customer Sign-off</Text>
                            <View style={[styles.signatureCard, { backgroundColor: colors.surface, shadowColor: colors.shadow }]}>
                                <Text style={[styles.signatureTitle, { color: colors.text }]}>Signature</Text>
                                <Text style={[styles.signatureCopy, { color: colors.textSecondary }]}>
                                    Capture customer confirmation before marking the work complete.
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setSignatureCaptured((current) => !current)}
                                    style={[
                                        styles.signatureButton,
                                        {
                                            backgroundColor: signatureCaptured ? colors.success : colors.surfaceHighlight,
                                            borderColor: signatureCaptured ? colors.success : colors.border,
                                        },
                                    ]}
                                >
                                    <Ionicons name={signatureCaptured ? 'checkmark-circle' : 'create-outline'} size={20} color={colors.white} />
                                    <Text style={[styles.signatureButtonText, { color: colors.white }]}>
                                        {signatureCaptured ? 'Signature stored' : 'Capture signature'}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Completion Note</Text>
                            <TextInput
                                multiline
                                placeholder="Summarize findings and follow-up actions."
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.completionInput, { color: colors.text, backgroundColor: colors.surface, shadowColor: colors.shadow }]}
                                value={completionNote}
                                onChangeText={setCompletionNote}
                            />
                        </>
                    ) : (
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
                                        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No matching items</Text>
                                        <Text style={[styles.emptyStateCopy, { color: colors.textSecondary }]}>
                                            Try another activity filter.
                                        </Text>
                                    </View>
                                ) : null}
                            </View>
                        </>
                    )}
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
                        disabled={!readyToComplete}
                        onPress={() => navigation.goBack()}
                        style={[
                            styles.footerButton,
                            {
                                backgroundColor: readyToComplete ? colors.primary : colors.surfaceHighlight,
                                borderColor: readyToComplete ? colors.primary : colors.border,
                                opacity: readyToComplete ? 1 : 0.55,
                            },
                        ]}
                    >
                        <Text style={[styles.footerPrimaryText, { color: readyToComplete ? colors.white : colors.textSecondary }]}>
                            Mark Complete
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
                            
                            <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => { setMediaModalVisible(false); if(activeMediaId) updateItem(activeMediaId, Number(items.find(i=>i.id===activeMediaId)?.value||0)+1); }}>
                                <FontAwesome name="camera" size={20} color={colors.primary} style={styles.sheetIcon} />
                                <Text style={[styles.sheetOptionText, { color: colors.text }]}>Take Photo</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={[styles.sheetOption, { borderBottomColor: colors.border, borderBottomWidth: 1 }]} onPress={() => { setMediaModalVisible(false); if(activeMediaId) updateItem(activeMediaId, Number(items.find(i=>i.id===activeMediaId)?.value||0)+1); }}>
                                <FontAwesome name="video-camera" size={20} color={colors.primary} style={styles.sheetIcon} />
                                <Text style={[styles.sheetOptionText, { color: colors.text }]}>Record Video</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity style={styles.sheetOption} onPress={() => { setMediaModalVisible(false); if(activeMediaId) updateItem(activeMediaId, Number(items.find(i=>i.id===activeMediaId)?.value||0)+1); }}>
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
                        <View style={[{ backgroundColor: colors.surface, borderRadius: 12, padding: 8, minWidth: 200, shadowColor: colors.shadow, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 8 }]}>
                            <TouchableOpacity onPress={() => { setActionModalVisible(false); if(readyToComplete) navigation.goBack(); }} style={[{ flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                <Ionicons name="checkmark-circle-outline" size={20} color={readyToComplete ? colors.success : colors.textSecondary} style={{ marginRight: 10 }} />
                                <Text style={[{ color: readyToComplete ? colors.text : colors.textSecondary, ...FONTS.body }]}>Mark Complete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setActionModalVisible(false); }} style={[{ flexDirection: 'row', alignItems: 'center', padding: 12 }]}>
                                <Ionicons name="arrow-redo-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                                <Text style={[{ color: colors.text, ...FONTS.body }]}>Forward</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
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
    content: {
        padding: 16,
        paddingBottom: 24,
    },
    heroCard: {
        borderRadius: 18,
        padding: 18,
        marginBottom: 16,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    jobTitle: {
        ...FONTS.h2,
        marginBottom: 6,
    },
    jobAddress: {
        ...FONTS.body,
    },
    locationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        marginBottom: 14,
    },
    navButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 14,
    },
    heroChip: {
        minHeight: 28,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    heroChipText: {
        ...FONTS.label,
        fontSize: 10,
    },
    heroSubLabel: {
        ...FONTS.label,
        fontSize: 10,
        marginBottom: 8,
        marginTop: 4,
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
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    emptyStateTitle: {
        ...FONTS.bodyStrong,
        marginBottom: 4,
    },
    emptyStateCopy: {
        ...FONTS.body,
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
        borderRadius: 10,
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
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingHorizontal: 14,
    },
    captureButtonText: {
        ...FONTS.bodyStrong,
        textAlign: 'center',
    },
    signatureCard: {
        borderRadius: 16,
        padding: 18,
        marginBottom: 14,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
        elevation: 5,
    },
    signatureTitle: {
        ...FONTS.h3,
        marginBottom: 8,
    },
    signatureCopy: {
        ...FONTS.body,
        marginBottom: 14,
    },
    signatureButton: {
        minHeight: 54,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
    },
    signatureButtonText: {
        ...FONTS.bodyStrong,
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
        minHeight: 56,
        borderRadius: 14,
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
        bottom: 86,
        right: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
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
});
