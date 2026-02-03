import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, LayoutAnimation, Platform, UIManager, KeyboardAvoidingView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { NeonButton } from '../components/NeonButton';
import { GlassCard } from '../components/GlassCard';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- Types ---
type DataType = 'text' | 'number' | 'media' | 'multiple_choice' | 'radio' | '3_phase' | 'none' | 'date' | 'dropdown';

interface ChecklistItemData {
    id: string;
    label: string;
    type: DataType;
    options?: string[]; // For dropdown, radio, multiple_choice
    value?: any;
    completed: boolean;
}

// --- Mock Data ---
const MOCK_CHECKLIST: ChecklistItemData[] = [
    { id: '1', label: 'Check network connectivity', type: 'none', completed: false },
    { id: '2', label: 'Record Intake Temperature', type: 'number', completed: false, value: '' },
    { id: '3', label: 'Technician Name', type: 'text', completed: false, value: '' },
    { id: '4', label: 'Select Reason for Visit', type: 'dropdown', options: ['Routine Maintenance', 'Emergency Repair', 'Installation', 'Audit'], completed: false, value: '' },
    { id: '5', label: 'Safety Checks (Select all that apply)', type: 'multiple_choice', options: ['Gloves', 'Helmet', 'Insulated Tools', 'Goggles'], completed: false, value: [] },
    { id: '6', label: 'Charger Condition', type: 'radio', options: ['Good', 'Damaged', 'Needs Cleaning'], completed: false, value: '' },
    { id: '7', label: 'Measure 3-Phase Voltage', type: '3_phase', completed: false, value: { r: '', y: '', b: '' } },
    { id: '8', label: 'Installation Date', type: 'date', completed: false, value: '' },
    { id: '9', label: 'Capture Site Photos', type: 'media', completed: false, value: [] },
];

const MOCK_ACTIVITIES = [
    {
        id: '1',
        user: 'Mathew',
        action: 'reassigned the work',
        date: '28 May 2024',
        details: 'Serial number: FHV982389 has been assigned with Cp id: 16388802, Station name: Kohapur Railway Station',
        type: 'timeline'
    },
    {
        id: '2',
        user: 'John Abraham',
        action: 'Commented',
        date: '28 May 2024',
        comment: 'Replaced the SDR module',
        type: 'comment'
    },
    {
        id: '3',
        user: 'Mathew',
        action: 'reassigned the work',
        date: '28 May 2024',
        details: 'Serial number: FHV982389 has been assigned with Cp id: 16388802, Station name: Kohapur Railway Station',
        type: 'timeline'
    },
    {
        id: '4',
        user: 'John Abraham',
        action: 'Commented',
        date: '28 May 2024',
        comment: 'Replaced the SDR module',
        type: 'comment'
    }
];

// --- Components ---

// Minimal Clean Tab
const MinimalTab = ({ active, label, onPress }: any) => {
    const { colors } = useTheme();
    return (
        <TouchableOpacity
            onPress={onPress}
            style={[
                styles.tabItem,
                active && { backgroundColor: colors.surfaceHighlight }
            ]}
        >
            <Text style={[
                styles.tabText,
                { color: active ? colors.text : colors.textSecondary, fontWeight: active ? '700' : '500' }
            ]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
};

// Dynamic Input Renderer
const DynamicInput = ({ item, onChange }: { item: ChecklistItemData, onChange: (val: any) => void }) => {
    const { colors, isDark } = useTheme();
    const [expanded, setExpanded] = useState(false); // For Dropdown

    switch (item.type) {
        case 'text':
            return (
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="Enter text..."
                    placeholderTextColor={colors.textSecondary}
                    value={item.value}
                    onChangeText={onChange}
                />
            );
        case 'number':
            return (
                <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                    placeholder="0.00"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={item.value}
                    onChangeText={onChange}
                />
            );
        case 'date':
            return (
                <View style={[styles.inputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <TextInput
                        style={[styles.inputFlex, { color: colors.text }]}
                        placeholder="DD/MM/YYYY"
                        placeholderTextColor={colors.textSecondary}
                        value={item.value}
                        onChangeText={onChange}
                    />
                    <Ionicons name="calendar" size={20} color={colors.primary} />
                </View>
            );
        case '3_phase':
            const phases = item.value || { r: '', y: '', b: '' };
            return (
                <View style={styles.phaseContainer}>
                    {['R', 'Y', 'B'].map((phase) => (
                        <View key={phase} style={{ flex: 1 }}>
                            <Text style={[styles.phaseLabel, { color: phase === 'R' ? colors.danger : phase === 'Y' ? colors.warning : '#4da6ff' }]}>{phase}-Phase</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border, textAlign: 'center' }]}
                                placeholder="0V"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                value={phases[phase.toLowerCase()]}
                                onChangeText={(text) => onChange({ ...phases, [phase.toLowerCase()]: text })}
                            />
                        </View>
                    ))}
                </View>
            );
        case 'dropdown':
            return (
                <View>
                    <TouchableOpacity
                        style={[styles.dropdownHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}
                        onPress={() => setExpanded(!expanded)}
                    >
                        <Text style={{ color: item.value ? colors.text : colors.textSecondary }}>
                            {item.value || 'Select an option'}
                        </Text>
                        <Ionicons name={expanded ? "chevron-up" : "chevron-down"} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                    {expanded && item.options && (
                        <View style={[styles.dropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            {item.options.map((opt) => (
                                <TouchableOpacity
                                    key={opt}
                                    style={[styles.dropdownItem, item.value === opt && { backgroundColor: isDark ? colors.surfaceHighlight : colors.background }]}
                                    onPress={() => {
                                        onChange(opt);
                                        setExpanded(false);
                                    }}
                                >
                                    <Text style={{ color: colors.text }}>{opt}</Text>
                                    {item.value === opt && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            );
        case 'radio':
            return (
                <View style={styles.radioGroup}>
                    {item.options?.map((opt) => (
                        <TouchableOpacity
                            key={opt}
                            style={[
                                styles.radioRow,
                                item.value === opt && { borderColor: colors.primary, backgroundColor: colors.primary + '10' }
                            ]}
                            onPress={() => onChange(opt)}
                        >
                            <View style={[styles.radioOuter, { borderColor: item.value === opt ? colors.primary : colors.textSecondary }]}>
                                {item.value === opt && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                            </View>
                            <Text style={[styles.radioText, { color: colors.text }]}>{opt}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            );
        case 'multiple_choice':
            const currentSelection = item.value || [];
            return (
                <View style={styles.checkGroup}>
                    {item.options?.map((opt) => {
                        const isSelected = currentSelection.includes(opt);
                        return (
                            <TouchableOpacity
                                key={opt}
                                style={styles.checkRow}
                                onPress={() => {
                                    if (isSelected) {
                                        onChange(currentSelection.filter((i: string) => i !== opt));
                                    } else {
                                        onChange([...currentSelection, opt]);
                                    }
                                }}
                            >
                                <View style={[
                                    styles.checkboxSquare,
                                    { borderColor: isSelected ? colors.primary : colors.textSecondary, backgroundColor: isSelected ? colors.primary : 'transparent' }
                                ]}>
                                    {isSelected && <Ionicons name="checkmark" size={12} color={colors.white} />}
                                </View>
                                <Text style={[styles.checkText, { color: colors.text }]}>{opt}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            );
        case 'media':
            return (
                <TouchableOpacity style={[styles.uploadBox, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}>
                    <Ionicons name="camera" size={24} color={colors.primary} />
                    <Text style={[styles.uploadText, { color: colors.primary }]}>Capture Photo / Video</Text>
                </TouchableOpacity>
            );
        case 'none':
        default:
            return null;
    }
};

const ActivityItem = ({ item, isLast, showTimeline }: { item: any, isLast: boolean, showTimeline: boolean }) => {
    const { colors, isDark } = useTheme();
    const isComment = item.type === 'comment';

    return (
        <View style={styles.activityCardWrapper}>
            {/* Timeline Line */}
            {showTimeline && (
                <View style={styles.timelineContainer}>
                    <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
                    <View style={[styles.timelineDot, { backgroundColor: item.type === 'timeline' ? colors.primary : colors.success }]} />
                </View>
            )}

            <View style={[styles.activityCard, { backgroundColor: colors.surface, flex: 1 }]}>
                <View style={styles.activityHeader}>
                    <View style={styles.activityUserRow}>
                        <View style={[styles.activityAvatar, { backgroundColor: item.user.startsWith('M') ? colors.success : colors.primary }]}>
                            <Text style={styles.activityAvatarText}>{item.user[0]}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 }}>
                                    <Text style={[styles.activityUser, { color: colors.text }]}>{item.user}{' '}</Text>
                                    <Text style={[styles.activityAction, { color: colors.textSecondary }]}>{item.action}</Text>
                                </View>
                                <Text style={[styles.activityDate, { color: colors.textSecondary }]}>{item.date}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {isComment && (
                    <View style={styles.commentRow}>
                        <View style={[styles.commentBadge, { backgroundColor: colors.primary + '20' }]}>
                            <Text style={[styles.commentBadgeText, { color: colors.primary }]}>Commented</Text>
                        </View>
                        <Text style={[styles.commentText, { color: colors.text }]}>{item.comment}</Text>
                    </View>
                )}

                {item.details && (
                    <View style={[styles.activityDetailBox, { backgroundColor: isDark ? colors.background : '#F8F9FA' }]}>
                        <Text style={[styles.activityDetailText, { color: colors.textSecondary }]}>{item.details}</Text>
                    </View>
                )}
            </View>
        </View>
    );
};

// Checkbox Row
const SurveyStep = ({
    item,
    onToggle,
    onUpdate
}: {
    item: ChecklistItemData,
    onToggle: () => void,
    onUpdate: (val: any) => void
}) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.stepCard, { backgroundColor: colors.surface }]}>
            <TouchableOpacity onPress={onToggle} style={styles.stepHeader}>
                <View style={[styles.stepCircle, {
                    borderColor: item.completed ? colors.success : colors.border,
                    backgroundColor: item.completed ? colors.success : 'transparent'
                }]}>
                    {item.completed && <Ionicons name="checkmark" size={14} color="#FFF" />}
                </View>
                <Text style={[styles.stepLabel, { color: colors.text, flex: 1 }]}>
                    {item.label}
                </Text>
            </TouchableOpacity>
            {item.type !== 'none' && (
                <View style={styles.stepBody}>
                    <DynamicInput item={item} onChange={onUpdate} />
                </View>
            )}
        </View>
    );
};

export const TaskDetailScreen = () => {
    const navigation = useNavigation();
    const { colors, isDark } = useTheme();
    const [activeTab, setActiveTab] = useState('Worklist');
    const [items, setItems] = useState<ChecklistItemData[]>(MOCK_CHECKLIST);
    const [showHeaderDropdown, setShowHeaderDropdown] = useState(false);
    const [activityFilter, setActivityFilter] = useState('All');

    const handleToggle = (id: string) => {
        setItems(prev => prev.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        ));
    };

    const handleUpdate = (id: string, value: any) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            let isComplete = false;

            // Auto-completion logic based on type
            switch (item.type) {
                case 'text':
                case 'number':
                case 'date':
                case 'dropdown':
                case 'radio':
                    // Check if string is not empty
                    isComplete = !!value && value.toString().trim().length > 0;
                    break;
                case 'multiple_choice':
                case 'media':
                    // Check if array has items
                    isComplete = Array.isArray(value) && value.length > 0;
                    break;
                case '3_phase':
                    // Check all phases are filled
                    isComplete = !!value.r && !!value.y && !!value.b;
                    break;
                case 'none':
                    // Keep existing state for manual toggles
                    isComplete = item.completed;
                    break;
                default:
                    isComplete = !!value;
            }

            return { ...item, value, completed: isComplete };
        }));
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 }}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
                            <Ionicons name="arrow-back" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <View style={{ flex: 1, justifyContent: 'center' }}>
                            <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'left' }]} numberOfLines={1}>Pune Central Station</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.headerActionBtn, { borderColor: colors.border }]}
                            onPress={() => setShowHeaderDropdown(!showHeaderDropdown)}
                        >
                            <Text style={[styles.headerActionText, { color: colors.textSecondary }]}>Action</Text>
                            <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingLeft: 12 }}>
                        <TouchableOpacity style={styles.iconBtn}>
                            <Ionicons name="share-outline" size={22} color={colors.text} />
                        </TouchableOpacity>
                    </View>

                    {showHeaderDropdown && (
                        <View style={[styles.headerDropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                            <TouchableOpacity style={styles.headerDropdownItem} onPress={() => setShowHeaderDropdown(false)}>
                                <Text style={{ color: colors.text, fontSize: 14 }}>Submit for review</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.headerDropdownItem, { borderTopWidth: 1, borderTopColor: colors.border }]} onPress={() => setShowHeaderDropdown(false)}>
                                <Text style={{ color: colors.text, fontSize: 14 }}>Forward</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Project Info Card - Now matches TaskCard style */}
                    <View style={[styles.projectCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.projectHeader}>
                            <Text style={[styles.projectName, { color: colors.text }]}>Crimson Moon - DC installation</Text>
                        </View>

                        <View style={styles.idRow}>
                            <View style={[styles.idBadge, { backgroundColor: colors.surfaceHighlight }]}>
                                <Text style={[styles.idText, { color: colors.textSecondary }]}>CPID: </Text>
                                <Text style={[styles.idValue, { color: colors.text }]}>CP-100239</Text>
                            </View>
                            <View style={[styles.idBadge, { backgroundColor: colors.surfaceHighlight }]}>
                                <Text style={[styles.idText, { color: colors.textSecondary }]}>Station: </Text>
                                <Text style={[styles.idValue, { color: colors.text }]}>Pune Central Station</Text>
                            </View>
                        </View>

                        <View style={styles.addressRow}>
                            <Ionicons name="location-outline" size={14} color={colors.primary} />
                            <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
                                123 Tech Park, Hinjewadi, Pune, MH
                            </Text>
                            <TouchableOpacity style={[styles.directionBtn, { backgroundColor: colors.primary + '20' }]}>
                                <Ionicons name="navigate" size={14} color={colors.primary} />
                            </TouchableOpacity>
                        </View>



                        <View style={styles.metaRow}>
                            <View style={styles.metaItem}>
                                <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                                <Text style={[styles.metaText, { color: colors.textSecondary }]}>Oct 01, 2024 - Oct 31, 2024</Text>
                            </View>
                        </View>

                        <View style={styles.assigneeChipsRow}>
                            {['Tony Ware', 'Sarah J.', 'Mike B.'].map((name, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.assigneeChip,
                                        { backgroundColor: index === 0 ? colors.primary : colors.primary + '20' }
                                    ]}
                                >
                                    <Text style={[styles.assigneeChipText, { color: index === 0 ? colors.white : colors.primary }]}>{name}</Text>
                                </View>
                            ))}
                        </View>



                        <View style={styles.creatorSection}>
                            <View style={styles.creatorItem}>
                                <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>Created by</Text>
                                <Text style={[styles.creatorValue, { color: colors.text }]}>Admin User</Text>
                            </View>
                            <View style={styles.creatorItem}>
                                <Text style={[styles.creatorLabel, { color: colors.textSecondary }]}>Assigned by</Text>
                                <Text style={[styles.creatorValue, { color: colors.text }]}>John Doe</Text>
                            </View>
                        </View>
                    </View>

                    <View style={[styles.tabSegment, { backgroundColor: colors.surface }]}>
                        <MinimalTab active={activeTab === 'Worklist'} label="Worklist" onPress={() => setActiveTab('Worklist')} />
                        <MinimalTab active={activeTab === 'Activities'} label="Activities" onPress={() => setActiveTab('Activities')} />
                    </View>

                    {activeTab === 'Worklist' && (
                        <View style={styles.workListContainer}>

                            {items.map(item => (
                                <SurveyStep
                                    key={item.id}
                                    item={item}
                                    onToggle={() => handleToggle(item.id)}
                                    onUpdate={(val) => handleUpdate(item.id, val)}
                                />
                            ))}
                        </View>
                    )}

                    {activeTab === 'Activities' && (
                        <View style={styles.activitiesContainer}>
                            {/* Inner Filters */}
                            <View style={styles.activityFilters}>
                                {['All', 'Comments', 'Timeline'].map((f) => (
                                    <TouchableOpacity
                                        key={f}
                                        onPress={() => setActivityFilter(f)}
                                        style={[
                                            styles.activityFilterBtn,
                                            { backgroundColor: f === activityFilter ? colors.primary : colors.surfaceHighlight }
                                        ]}
                                    >
                                        <Text style={[
                                            styles.activityFilterText,
                                            { color: f === activityFilter ? colors.white : colors.textSecondary }
                                        ]}>{f}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Activity List */}
                            {MOCK_ACTIVITIES
                                .filter(act => {
                                    if (activityFilter === 'All') return true;
                                    if (activityFilter === 'Comments' && act.type === 'comment') return true;
                                    if (activityFilter === 'Timeline' && act.type === 'timeline') return true;
                                    return false;
                                })
                                .map((activity, index, arr) => (
                                    <ActivityItem
                                        key={activity.id}
                                        item={activity}
                                        isLast={index === arr.length - 1}
                                        showTimeline={activityFilter === 'Timeline' || activityFilter === 'All'}
                                    />
                                ))}

                            {/* Completion Comments Section */}
                            <View style={[styles.completionSection, { backgroundColor: 'rgba(255,255,255,0.02)', borderColor: colors.border }]}>
                                <Text style={[styles.completionTitle, { color: colors.textSecondary }]}>Work completion comments</Text>
                                <View style={[styles.completionInputContainer, { borderColor: colors.border }]}>
                                    <TextInput
                                        style={[styles.completionInput, { color: colors.text }]}
                                        placeholder="Enter comments..."
                                        placeholderTextColor={colors.textSecondary}
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </View>

                        </View>
                    )}

                    <View style={{ height: 100 }} />
                </ScrollView>

                {/* Footer */}
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    keyboardVerticalOffset={0}
                    style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}
                >
                    <NeonButton
                        title={activeTab === 'Worklist' ? "Complete Task" : "Submit for review"}
                        onPress={() => navigation.goBack()}
                        style={{ width: '100%' }}
                        animate={false}
                    />
                </KeyboardAvoidingView>

            </SafeAreaView>
        </View >
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        height: 56,
        borderBottomWidth: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '700',
        lineHeight: 24, // Consistent with icons
    },
    headerActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        gap: 6,
    },
    headerActionText: {
        fontSize: 13,
        fontWeight: '600',
    },
    headerDropdownMenu: {
        position: 'absolute',
        top: 54,
        right: 16,
        borderRadius: 12,
        borderWidth: 1,
        width: 160,
        zIndex: 100,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    headerDropdownItem: {
        padding: 12,
    },
    iconBtn: { padding: 4 },
    scrollContent: { padding: 16 },
    projectCard: {
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
    },
    projectHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    projectName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    idRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
        flexWrap: 'wrap',
    },
    idBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        flexDirection: 'row',
    },
    idText: {
        fontSize: 11,
    },
    idValue: {
        fontSize: 11,
        fontWeight: '700',
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 12,
    },
    addressText: {
        flex: 1,
        fontSize: 12,
    },
    directionBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    divider: {
        height: 1,
        marginBottom: 12,
    },
    creatorSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    creatorItem: {
        flex: 1,
    },
    creatorLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
        fontWeight: '700',
        marginBottom: 2,
    },
    creatorValue: {
        fontSize: 12,
        fontWeight: '600',
    },
    metaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    metaText: {
        fontSize: 13,
    },
    assigneeChipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    assigneeChip: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    assigneeChipText: {
        fontSize: 11,
        fontWeight: '700',
    },
    tabSegment: { flexDirection: 'row', borderRadius: 12, padding: 4, marginBottom: 12 },
    tabItem: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
    tabText: { fontSize: 14 },

    // Activities
    activitiesContainer: { paddingBottom: 20 },
    activityFilters: { flexDirection: 'row', gap: 10, marginBottom: 16 },
    activityFilterBtn: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
    activityFilterText: { fontSize: 12, fontWeight: '600' },
    activityCardWrapper: { flexDirection: 'row', gap: 12 },
    timelineContainer: { width: 20, alignItems: 'center' },
    timelineLine: { position: 'absolute', top: 0, bottom: -12, width: 2 },
    timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 18, zIndex: 1 },
    activityCard: { borderRadius: 12, padding: 12, marginBottom: 12 },
    activityHeader: { marginBottom: 8 },
    activityUserRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    activityAvatar: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    activityAvatarText: { color: '#FFF', fontWeight: 'bold', fontSize: 11 },
    activityUser: { fontWeight: '700', fontSize: 13 },
    activityAction: { fontSize: 13 },
    activityDate: { fontSize: 11 },
    activityDetailBox: { borderRadius: 8, padding: 10, marginTop: 8 },
    activityDetailText: { fontSize: 12, lineHeight: 18 },
    commentRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
    commentBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    commentBadgeText: { fontSize: 10, fontWeight: 'bold' },
    commentText: { fontSize: 13, flex: 1 },

    // Completion Section
    completionSection: { marginTop: 8, padding: 16, borderRadius: 12 },
    completionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
    completionInputContainer: { borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 80 },
    completionInput: { fontSize: 13, textAlignVertical: 'top' },

    workListContainer: { marginTop: 8 },
    sectionHeaderTitle: { fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 16 },

    // Checkbox Step
    // Checklist Cards
    stepCard: {
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 10,
        marginBottom: 12,
    },
    stepHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    stepLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    stepBody: {
        marginTop: 10,
    },

    // Inputs
    input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
    inputFlex: { flex: 1, paddingVertical: 10, fontSize: 14 },

    // 3 Phase
    phaseContainer: { flexDirection: 'row', gap: 10 },
    phaseLabel: { fontSize: 10, marginBottom: 4, textAlign: 'center', fontWeight: 'bold' },

    // Dropdown
    dropdownHeader: { borderWidth: 1, borderRadius: 8, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    dropdownList: { borderWidth: 1, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
    dropdownItem: { padding: 12, flexDirection: 'row', justifyContent: 'space-between' },

    // Radio
    radioGroup: { gap: 8 },
    radioRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: 'transparent', borderRadius: 8 },
    radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    radioInner: { width: 10, height: 10, borderRadius: 5 },
    radioText: { fontSize: 14 },

    // Multiple Choice
    checkGroup: { gap: 8 },
    checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
    checkboxSquare: { width: 18, height: 18, borderRadius: 4, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
    checkText: { fontSize: 14 },

    // Media
    uploadBox: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, height: 80, alignItems: 'center', justifyContent: 'center', gap: 8 },
    uploadText: { fontSize: 14, fontWeight: '500' },

    placeholderContainer: { padding: 40, alignItems: 'center' },
    footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, borderTopWidth: 1 },
});
