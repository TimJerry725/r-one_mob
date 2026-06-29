import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { WORK_ORDERS, ASSETS, getAssetVisionDetailById, requestPM } from '../data/fieldDemo';
import { FONTS } from '../styles/futurist';
import { OrderCard } from './ProjectDetailScreen';

export const SingleProjectScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();
    const [showMenu, setShowMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'work' | 'activities' | 'attachments'>('work');
    const [activityFilter, setActivityFilter] = useState<'All' | 'Comment' | 'Activity'>('All');
    const [projectComments, setProjectComments] = useState([
        {
            id: 'pact-4',
            type: 'attachment',
            title: 'Site Survey Checklist uploaded',
            detail: 'PuneCentral_survey_v2.pdf',
            time: '15 mins ago',
        },
        {
            id: 'pact-3',
            type: 'status',
            title: 'Charger Commissioned',
            detail: 'CPID CP-100239 has been successfully taken live.',
            time: '30 mins ago',
        },
        {
            id: 'pact-2',
            type: 'comment',
            title: 'Timothy Field',
            detail: 'Foundation work completed. Awaiting cables delivery to site.',
            time: '1 hour ago',
        },
        {
            id: 'pact-1',
            type: 'status',
            title: 'Project Initialized',
            detail: 'Central team dispatched Pune Central Station DC installation.',
            time: '2 hours ago',
        },
    ]);
    const [newProjectComment, setNewProjectComment] = useState('');
    const [commentHasAttachment, setCommentHasAttachment] = useState(false);

    const handleAddProjectComment = () => {
        if (!newProjectComment.trim()) return;
        const newComm = {
            id: Date.now().toString(),
            type: 'comment',
            title: 'Andrea Meuschke (You)',
            detail: newProjectComment.trim() + (commentHasAttachment ? ' (Attachment Added)' : ''),
            time: 'Just now',
        };
        setProjectComments([newComm, ...projectComments]);
        setNewProjectComment('');
        setCommentHasAttachment(false);
        setActivityFilter('All');
    };

    const filteredActivities = useMemo(() => {
        if (activityFilter === 'Activity') {
            return projectComments.filter(a => a.type === 'status');
        }
        if (activityFilter === 'Comment') {
            return projectComments.filter(a => a.type === 'comment');
        }
        return projectComments;
    }, [projectComments, activityFilter]);

    const projectId = route.params?.projectId;
    const projectName = route.params?.projectName;

    const visibleOrders = useMemo(() => {
        return WORK_ORDERS.filter((item) => item.projectId === projectId && item.type === 'Installation');
    }, [projectId]);

    const projectAssets = useMemo(() => {
        const orderIds = visibleOrders.map(wo => wo.id);
        return ASSETS.filter(a => a.linkedWorkOrderId && orderIds.includes(a.linkedWorkOrderId));
    }, [visibleOrders]);

    const [takeLiveModalVisible, setTakeLiveModalVisible] = useState(false);
    const [pmConfirmModalVisible, setPmConfirmModalVisible] = useState(false);
    const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
    const [liveFromDates, setLiveFromDates] = useState<Record<string, string>>({});

    const toggleAssetSelection = (id: string) => {
        setSelectedAssets(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
    };

    const handleSelectDate = (id: string) => {
        const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        setLiveFromDates(prev => ({ ...prev, [id]: today }));
    };

    const handleTakeLive = () => {
        if (selectedAssets.length === 0) {
            Alert.alert('Selection Required', 'Please select at least one charger.');
            return;
        }
        setTakeLiveModalVisible(false);
        setTimeout(() => {
            setPmConfirmModalVisible(true);
        }, 400);
    };

    const handleConfirmTakeLive = (includePM: boolean) => {
        setPmConfirmModalVisible(false);
        
        if (includePM) {
            selectedAssets.forEach(assetId => {
                requestPM(assetId, 'Auto-scheduled during Take Live', false, 'System Dispatch');
            });
            Alert.alert('Success', `${selectedAssets.length} charger(s) are now live with Preventive Maintenance scheduled.`);
        } else {
            Alert.alert('Success', `${selectedAssets.length} charger(s) are now live.`);
        }
        
        setSelectedAssets([]);
        setLiveFromDates({});
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
                        {projectName || `Project ${projectId}`}
                    </Text>
                    <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={[styles.actionDropdownButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                        <Text style={[styles.actionDropdownText, { color: colors.text }]}>Actions</Text>
                        <Ionicons name="chevron-down" size={16} color={colors.text} />
                    </TouchableOpacity>
                </View>

                {showMenu && (
                    <TouchableOpacity 
                        style={styles.menuOverlay} 
                        activeOpacity={1} 
                        onPress={() => setShowMenu(false)}
                    >
                        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.border, shadowColor: colors.shadow }]}>
                            <TouchableOpacity 
                                style={styles.dropdownItem} 
                                onPress={() => {
                                    setShowMenu(false);
                                    setTakeLiveModalVisible(true);
                                }}
                            >
                                <Feather name="arrow-up-right" size={20} color={colors.primary} />
                                <Text style={[styles.dropdownText, { color: colors.text }]}>Take Live</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Tab Switcher */}
                <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
                    <View style={[styles.tabSwitch, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                        {(['Worklist', 'Activities', 'Attachments'] as const).map((tab, idx) => {
                            const tabKey = idx === 0 ? 'work' : idx === 1 ? 'activities' : 'attachments';
                            const isSelected = activeTab === tabKey;
                            return (
                                <TouchableOpacity
                                    key={tab}
                                    onPress={() => setActiveTab(tabKey)}
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
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    {activeTab === 'work' ? (
                        visibleOrders.length > 0 ? (
                            <View style={styles.listColumn}>
                                {visibleOrders.map((item) => (
                                    <OrderCard
                                        key={item.id}
                                        item={item}
                                        colors={colors}
                                        isDark={isDark}
                                        onOpen={() => navigation.navigate('TaskDetails', { taskId: item.id })}
                                        hideTypeChip={true}
                                        hideStationChip={true}
                                    />
                                ))}
                            </View>
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={48} color={colors.textSecondary} />
                                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                                    No installation work found for this project.
                                </Text>
                            </View>
                        )
                    ) : activeTab === 'activities' ? (
                        <View style={{ gap: 4 }}>
                            {/* Filter Chips */}
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

                            {filteredActivities.length === 0 ? (
                                <Text style={[styles.emptyText, { color: colors.textSecondary, marginTop: 32, textAlign: 'center' }]}>
                                    No {activityFilter.toLowerCase()} found.
                                </Text>
                            ) : (
                                filteredActivities.map((activity, index) => {
                                    const isComment = activity.type === 'comment';
                                    const isAttachment = activity.type === 'attachment';
                                    const badgeColor = isComment ? colors.primary : isAttachment ? colors.secondary : colors.success;
                                    const iconName = isComment ? 'chatbubble-outline' : isAttachment ? 'attach-outline' : 'build-outline';
                                    return (
                                        <View key={activity.id} style={styles.timelineRow}>
                                            <View style={styles.timelineRail}>
                                                <View style={[styles.timelineLineTop, index === 0 && { opacity: 0 }, { backgroundColor: colors.border }]} />
                                                <View style={[styles.timelineDot, { backgroundColor: badgeColor }]} />
                                                <View style={[styles.timelineLineBottom, index === filteredActivities.length - 1 && { opacity: 0 }, { backgroundColor: colors.border }]} />
                                            </View>
                                            <View style={[styles.timelineContent, { backgroundColor: colors.surfaceHighlight }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                                    <Ionicons name={iconName} size={14} color={badgeColor} />
                                                    <Text style={[styles.activityTitle, { color: colors.text }]}>{activity.title}</Text>
                                                </View>
                                                <Text style={[styles.activityDetail, { color: colors.textSecondary }]}>{activity.detail}</Text>
                                                <Text style={[styles.activityTime, { color: colors.textSecondary }]}>{activity.time}</Text>
                                            </View>
                                        </View>
                                    );
                                })
                            )}
                        </View>
                    ) : activeTab === 'attachments' ? (
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
                                    <View style={[styles.stepIcon, { backgroundColor: colors.primary + '15', width: 48, height: 48 }]}>
                                        <Ionicons name="document-text" size={24} color={colors.primary} />
                                    </View>
                                    <View style={{ flex: 1, marginLeft: 12 }}>
                                        <Text style={[styles.stepTitle, { color: colors.text }]}>PuneCentral_survey_v2.pdf</Text>
                                        <Text style={[styles.stepMeta, { color: colors.textSecondary }]}>PDF Document • 1.8 MB</Text>
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

                {activeTab === 'activities' && (
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
                                    { 
                                        color: colors.text, 
                                        borderColor: colors.border,
                                        backgroundColor: colors.surfaceHighlight,
                                        paddingRight: 44,
                                    }
                                ]}
                                placeholder="Add a comment..."
                                placeholderTextColor={colors.textSecondary}
                                value={newProjectComment}
                                onChangeText={setNewProjectComment}
                                multiline
                            />
                            <TouchableOpacity
                                onPress={() => {
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
                            onPress={handleAddProjectComment}
                        >
                            <Ionicons name="send" size={16} color={colors.white} />
                        </TouchableOpacity>
                    </KeyboardAvoidingView>
                )}

                <Modal visible={takeLiveModalVisible} transparent animationType="slide">
                    <TouchableOpacity style={styles.modalOverlayFull} activeOpacity={1} onPress={() => setTakeLiveModalVisible(false)}>
                        <TouchableOpacity activeOpacity={1} style={[styles.modalSheetLarge, { backgroundColor: colors.surface }]}>
                            <View style={styles.modalHeaderRow}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <Ionicons name="play-circle-outline" size={24} color={colors.primary} />
                                    <Text style={[styles.pageTitle, { color: colors.text }]}>Take Station Live</Text>
                                </View>
                                <View />
                            </View>
                            
                            <Text style={[{ color: colors.text, marginHorizontal: 20, marginBottom: 16 }, FONTS.bodyStrong]}>
                                Select the chargers to be take live
                            </Text>

                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 12 }}>
                                {projectAssets.map((asset) => {
                                    const detail = getAssetVisionDetailById(asset.id);
                                    const isSelected = selectedAssets.includes(asset.id);
                                    const dateSelected = liveFromDates[asset.id];
                                    const make = asset.model.split(' ')[0];
                                    const model = asset.model.split(' ').slice(1).join(' ');

                                    return (
                                        <TouchableOpacity 
                                            key={asset.id} 
                                            activeOpacity={0.9} 
                                            onPress={() => toggleAssetSelection(asset.id)}
                                            style={[
                                                styles.chargerCard,
                                                { 
                                                    backgroundColor: colors.surface, 
                                                    borderColor: isSelected ? colors.primary : colors.border,
                                                    borderWidth: isSelected ? 2 : 1
                                                }
                                            ]}
                                        >
                                            <View style={styles.chargerCardHeader}>
                                                <View style={{ flex: 1, paddingRight: 16 }}>
                                                    <Text style={[styles.chargerCardTitle, { color: colors.text }]} numberOfLines={1}>{make} {model}</Text>
                                                    <Text style={[styles.chargerCardSub, { color: colors.textSecondary }]} numberOfLines={1}>
                                                        CPID: <Text style={{ color: colors.text }}>{asset.cpid}</Text>  •  SN: <Text style={{ color: colors.text }}>{asset.serial}</Text>
                                                    </Text>
                                                </View>
                                                <Ionicons name={isSelected ? "checkmark-circle" : "ellipse-outline"} size={26} color={isSelected ? colors.primary : colors.textSecondary} />
                                            </View>
                                            
                                            <View style={[styles.chargerCardDetails, { backgroundColor: colors.surfaceHighlight }]}>
                                                <View style={styles.chargerCardDetailItem}>
                                                    <Text style={[styles.chargerCardDetailLabel, { color: colors.textSecondary }]}>Power</Text>
                                                    <Text style={[styles.chargerCardDetailValue, { color: colors.text }]}>{detail.peakPower}</Text>
                                                </View>
                                                <View style={styles.chargerCardDetailItem}>
                                                    <Text style={[styles.chargerCardDetailLabel, { color: colors.textSecondary }]}>Connectors</Text>
                                                    <Text style={[styles.chargerCardDetailValue, { color: colors.text }]}>{detail.connectors}</Text>
                                                </View>
                                            </View>

                                            {isSelected && (
                                                <View style={[styles.chargerCardFooter, { borderTopColor: colors.border }]}>
                                                    <Text style={[styles.chargerCardDetailLabel, { color: colors.textSecondary }]}>Live From</Text>
                                                    <TouchableOpacity onPress={() => handleSelectDate(asset.id)} style={[styles.datePickerBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, borderWidth: 1 }]}>
                                                        <Text style={[{ color: dateSelected ? colors.text : colors.textSecondary }, FONTS.body]}>{dateSelected || 'Select date'}</Text>
                                                        <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                                                    </TouchableOpacity>
                                                </View>
                                            )}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <View style={[styles.modalFooterRow, { borderTopColor: colors.border }]}>
                                <TouchableOpacity onPress={() => setTakeLiveModalVisible(false)} style={[styles.footerBtn, { backgroundColor: colors.surfaceHighlight }]}>
                                    <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={handleTakeLive} style={[styles.footerBtn, { backgroundColor: colors.primary }]}>
                                    <Text style={[styles.footerBtnText, { color: '#FFF' }]}>Take Live</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </Modal>

                {/* PM Confirmation Modal */}
                <Modal visible={pmConfirmModalVisible} transparent animationType="fade">
                    <View style={styles.modalOverlayFull}>
                        <TouchableOpacity 
                            style={StyleSheet.absoluteFill} 
                            activeOpacity={1} 
                            onPress={() => {
                                setPmConfirmModalVisible(false);
                                setTimeout(() => {
                                    setTakeLiveModalVisible(true);
                                }, 400);
                            }} 
                        />
                        <View style={[styles.confirmSheet, { backgroundColor: colors.surface }]}>
                            <View style={[styles.warningIconCircle, { backgroundColor: colors.primary + '15' }]}>
                                <Ionicons name="build" size={32} color={colors.primary} />
                            </View>

                            <Text style={[styles.confirmTitle, { color: colors.text }]}>Include Preventive Maintenance?</Text>
                            <Text style={[styles.confirmMessage, { color: colors.textSecondary }]}>
                                Would you like to automatically schedule a Preventive Maintenance work order for the {selectedAssets.length} selected charger(s)?
                            </Text>

                            <View style={styles.confirmActions}>
                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                    onPress={() => handleConfirmTakeLive(false)}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.text }]}>No, Skip PM</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
                                    onPress={() => handleConfirmTakeLive(true)}
                                >
                                    <Text style={[styles.confirmBtnText, { color: colors.white }]}>Yes, Include PM</Text>
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
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 8,
    },
    pageTitle: {
        ...FONTS.h3,
        fontSize: 16,
        flex: 1,
    },
    actionDropdownButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    actionDropdownText: {
        ...FONTS.bodyStrong,
    },
    menuOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 10,
    },
    dropdown: {
        position: 'absolute',
        top: 0,
        right: 16,
        width: 200,
        borderRadius: 12,
        borderWidth: 1,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 8,
        zIndex: 20,
    },
    dropdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    dropdownText: {
        ...FONTS.bodyStrong,
    },
    content: {
        padding: 24,
        paddingBottom: 36,
    },
    listColumn: {
        gap: 16,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 64,
        gap: 16,
    },
    emptyText: {
        ...FONTS.body,
        textAlign: 'center',
    },
    modalOverlayFull: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalSheetLarge: {
        maxHeight: '90%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingTop: 16,
    },
    modalHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    chargerCard: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    chargerCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    chargerCardTitle: {
        ...FONTS.h3,
        fontSize: 16,
        marginBottom: 4,
    },
    chargerCardSub: {
        ...FONTS.caption,
    },
    chargerCardDetails: {
        flexDirection: 'row',
        padding: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 12,
        gap: 16,
    },
    chargerCardDetailItem: {
        flex: 1,
    },
    chargerCardDetailLabel: {
        ...FONTS.label,
        marginBottom: 4,
    },
    chargerCardDetailValue: {
        ...FONTS.bodyStrong,
    },
    chargerCardFooter: {
        padding: 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    datePickerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 140,
    },
    modalFooterRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        gap: 12,
        paddingBottom: 36, // safe area approx
    },
    footerBtn: {
        flex: 1,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerBtnText: {
        ...FONTS.bodyStrong,
    },
    confirmSheet: {
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        padding: 32,
        alignItems: 'center',
        width: '100%',
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
    tabSwitch: {
        minHeight: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 4,
        gap: 4,
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
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 1,
    },
    filterChipText: {
        ...FONTS.label,
        fontSize: 12,
    },
    timelineRow: {
        flexDirection: 'row',
        gap: 12,
        alignItems: 'flex-start',
        minHeight: 80,
    },
    timelineRail: {
        width: 32,
        alignItems: 'center',
        position: 'relative',
        alignSelf: 'stretch',
    },
    timelineDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginVertical: 4,
    },
    timelineLineTop: {
        flex: 1,
        width: 2,
        alignSelf: 'center',
    },
    timelineLineBottom: {
        flex: 1,
        width: 2,
        alignSelf: 'center',
    },
    timelineContent: {
        flex: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    activityTitle: {
        ...FONTS.bodyStrong,
        fontSize: 13,
        marginBottom: 2,
    },
    activityDetail: {
        ...FONTS.body,
        fontSize: 12,
    },
    activityTime: {
        ...FONTS.caption,
        fontSize: 10,
        marginTop: 4,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: Platform.OS === 'ios' ? 36 : 16,
        borderTopWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    commentInput: {
        flex: 1,
        minHeight: 44,
        paddingHorizontal: 16,
        paddingVertical: 10,
        ...FONTS.body,
        borderRadius: 12,
        borderWidth: 1,
    },
    addCommentButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepCard: {
        borderRadius: 14,
        padding: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 3,
        marginBottom: 12,
    },
    stepIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepTitle: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        marginBottom: 2,
    },
    stepMeta: {
        ...FONTS.caption,
        fontSize: 12,
    },
    captureButton: {
        minHeight: 52,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: 'dashed',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    },
    captureButtonText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
});
