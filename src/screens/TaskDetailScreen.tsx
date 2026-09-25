import React, { useState, useRef, useEffect, useMemo } from 'react';
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
    Switch,
    Image,
    Linking,
} from 'react-native';
import * as Location from 'expo-location';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { EmptyStateIllustration } from '../components/EmptyStateIllustration';
import { getStatusColor } from '../styles/statusColors';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { ACTIVITY_LOG, CHECKLIST_TEMPLATE, ChecklistTemplateItem, getWorkOrderById } from '../data/fieldDemo';
import { PM_DEMO_PHOTOS, getPmDemoPhotoSeed, resolvePmDemoPhotoSource } from '../data/pmDemoPhotos';
import { FONTS, getInputShellStyle } from '../styles/futurist';
import { PopoverDropdown } from '../components/PopoverDropdown';
import { DATA_TYPES, getSelectorOptions } from '../data/createTaskOptions';
import { getServiceTypeColors } from '../styles/workTypeColors';

type ChecklistStateItem = {
    id: string;
    label: string;
    type: 'toggle' | 'text' | 'textarea' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'checkbox' | 'dropdown' | 'media' | 'remarks_response' | 'three_phase_voltage' | 'email' | 'section_header' | 'checklist_header' | 'none';
    dataType?: string;
    required: boolean;
    options?: string[];
    value: any;
    isNa?: boolean;
    isNotApplicable?: boolean;
    originalType?: 'toggle' | 'text' | 'textarea' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'checkbox' | 'dropdown' | 'media' | 'remarks_response' | 'three_phase_voltage' | 'email' | 'section_header' | 'checklist_header' | 'none';
    showWhenFieldId?: string;
    showWhenEquals?: string;
    defaultValue?: string;
    isReadOnly?: boolean;
};

const getDataTypeColor = (dataType?: string, type?: string): string => {
    const key = (dataType || type || '').toLowerCase();
    if (key.includes('short text') || key === 'text') return '#1890ff';
    if (key.includes('long text') || key === 'textarea') return '#13c2c2';
    if (key.includes('number')) return '#fa8c16';
    if (key.includes('date')) return '#eb2f96';
    if (key.includes('media') || key.includes('photo') || key.includes('image')) return '#52c41a';
    if (key.includes('multiple choice') || key.includes('multiselect') || key.includes('radio') || key.includes('checkbox') || key.includes('dropdown')) return '#722ed1';
    if (key.includes('voltage') || key.includes('3 phase')) return '#2f54eb';
    if (key.includes('email')) return '#00b96b';
    return '#8c8c8c';
};

const getDataTypeLabel = (item: ChecklistStateItem): string => {
    if (item.dataType) return item.dataType;
    if (item.type === 'section_header') return 'Section Header';
    if (item.type === 'checklist_header') return 'Checklist Header';
    switch (item.type) {
        case 'text': return 'Short text';
        case 'textarea': return 'Long text';
        case 'number': return 'Number';
        case 'date': return 'Date';
        case 'photo':
        case 'media': return 'Media';
        case 'radio': return 'Radio button';
        case 'multiselect': return 'Multiple Choice';
        case 'checkbox': return 'Checkbox';
        case 'dropdown': return 'Dropdown';
        case 'three_phase_voltage': return '3 phase voltage';
        case 'email': return 'Email';
        case 'not_applicable': return 'N/A';
        case 'toggle': return 'None';
        case 'none': return 'None';
        default: return 'Short text';
    }
};

const mapDataTypeToType = (dataType: string): ChecklistStateItem['type'] => {
    switch (dataType) {
        case 'Section Header': return 'section_header';
        case 'Checklist Header': return 'checklist_header';
        case 'Short text': return 'text';
        case 'Long text': return 'textarea';
        case 'Number': return 'number';
        case 'Date': return 'date';
        case 'Media': return 'media';
        case 'Multiple Choice': return 'multiselect';
        case 'Radio button': return 'radio';
        case 'Checkbox': return 'checkbox';
        case 'Dropdown': return 'dropdown';
        case 'None': return 'checkbox';
        case '3 phase voltage': return 'three_phase_voltage';
        case 'Email': return 'email';
        default: return 'text';
    }
};

const getCompletedChecklistValue = (item: ChecklistTemplateItem): any => {
    if (item.type === 'none' || item.isReadOnly) {
        return '';
    }
    const t = (item.dataType || item.type || '').toLowerCase();
    if (t.includes('voltage')) {
        return { 'L-N': '230', 'L-E': '230', 'L-L': '400', 'N-E': '2' };
    }
    if (t.includes('email')) {
        return 'tech.support@r-one.com';
    }
    if (t.includes('textarea') || t.includes('long text')) {
        return 'Detailed inspection completed without any warning signs observed.';
    }
    if (t.includes('checkbox') || t.includes('multiple choice') || t.includes('multiselect') || t.includes('none')) {
        return item.options?.slice(0, 1) ?? ['Yes'];
    }
    if (t.includes('dropdown') || t.includes('select')) {
        return item.options?.[0] ?? 'Pass';
    }
    if (t.includes('media') || t.includes('photo') || t.includes('image')) {
        if (item.options && item.options.some((option) => /certificate|document|SLD|diagram/i.test(option))) {
            return (item.options.length > 1 ? item.options : ['evidence']).map((option) =>
                `${(option || 'attachment').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
            );
        }
        return getPmDemoPhotoSeed(Math.max(item.options?.length || 0, 3)).values;
    }
    switch (item.type) {
        case 'date':
            return new Date().toISOString().slice(0, 10);
        case 'radio':
            return item.options?.[0] ?? 'Completed';
        case 'text':
            return 'Checked and verified on site.';
        case 'photo':
        case 'media':
            if (item.options && item.options.some((option) => /certificate|document|SLD|diagram/i.test(option))) {
                return (item.options.length > 1 ? item.options : ['evidence']).map((option) =>
                    `${(option || 'attachment').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.pdf`
                );
            }
            return getPmDemoPhotoSeed(Math.max(item.options?.length || 0, 3)).values;
        case 'toggle':
            return 'Completed';
        case 'number':
            return '415';
        case 'not_applicable':
            return 'N/A';
        case 'remarks_response':
            return [['Checked on site.', 'No issues found.']];
        default:
            return 'Completed';
    }
};

const buildChecklistState = (template: ChecklistTemplateItem[], prefillComplete: boolean): ChecklistStateItem[] => {
    let lastQuestionId: string | null = null;

    return template.map((item) => {
        const rawType = item.type || (item.dataType ? mapDataTypeToType(item.dataType) : 'text');
        const itemType = (rawType || '').toLowerCase();
        const dataType = (item.dataType || '').toLowerCase();
        let initialVal: any = '';

        if (prefillComplete) {
            initialVal = item.isReadOnly && item.defaultValue
                ? item.defaultValue
                : getCompletedChecklistValue(item);
        } else if (item.defaultValue) {
            initialVal = item.defaultValue;
        } else if (itemType === 'photo' || itemType === 'media' || dataType === 'media') {
            initialVal = getPmDemoPhotoSeed(3).values;
        } else if (itemType === 'remarks_response') {
            initialVal = [['', '']];
        } else if (itemType === 'three_phase_voltage' || dataType === '3 phase voltage') {
            initialVal = { 'L-N': '', 'L-E': '', 'L-L': '', 'N-E': '' };
        } else if (itemType === 'multiselect' || itemType === 'checkbox' || dataType === 'multiple choice' || dataType === 'checkbox' || ((dataType === 'none' || itemType === 'toggle') && itemType !== 'none' && !item.isReadOnly)) {
            initialVal = [];
        }

        const isChoiceNone = !item.isReadOnly && itemType !== 'none' && (dataType === 'none' || itemType === 'toggle' || item.dataType === 'None');

        const resolvedOptions = (() => {
            if (isChoiceNone && (!item.options || item.options.length === 0)) return ['Yes', 'No'];
            if (itemType === 'photo' || itemType === 'media' || dataType === 'media') {
                const seed = getPmDemoPhotoSeed(Math.max(item.options?.length || 0, 3));
                const existing = item.options || [];
                if (existing.length > 1 && existing.some((o) => String(o || '').trim())) return existing;
                return seed.options;
            }
            return item.options;
        })();

        if (rawType === 'section_header' || rawType === 'checklist_header') {
            lastQuestionId = null;
        }

        const isYesNoQuestion =
            (resolvedOptions && (resolvedOptions.includes('Yes') || resolvedOptions.includes('No'))) ||
            isChoiceNone ||
            itemType === 'radio' ||
            itemType === 'toggle' ||
            dataType === 'yes_no' ||
            dataType === 'toggle';

        let showWhenFieldId = item.showWhenFieldId;
        let showWhenEquals = item.showWhenEquals;

        if (!showWhenFieldId && rawType !== 'section_header' && rawType !== 'checklist_header') {
            if (!isYesNoQuestion && lastQuestionId) {
                showWhenFieldId = lastQuestionId;
                showWhenEquals = 'Yes';
            }
        }

        if (isYesNoQuestion && rawType !== 'section_header' && rawType !== 'checklist_header') {
            lastQuestionId = item.id;
        }

        return {
            ...item,
            type: rawType,
            dataType: item.dataType || getDataTypeLabel({ ...item, type: rawType, value: initialVal }),
            options: resolvedOptions,
            value: rawType === 'section_header' || rawType === 'checklist_header' ? '' : initialVal,
            showWhenFieldId,
            showWhenEquals,
            defaultValue: item.defaultValue,
            isReadOnly: item.isReadOnly,
        };
    });
};

const isComplete = (item: ChecklistStateItem) => {
    if (item.type === 'section_header' || item.type === 'checklist_header') return true;
    if (item.isNa) return true;
    const itemType = (item.type || '').toLowerCase();
    const dataType = (item.dataType || '').toLowerCase();

    if (item.isReadOnly && (!item.options || item.options.length === 0)) return true;
    if (itemType === 'none' || dataType === 'none') {
        if (!item.options || item.options.length === 0) return true;
        if (Array.isArray(item.value)) return item.value.length > 0;
        return Boolean(item.value);
    }

    if (itemType === 'remarks_response') {
        const val = item.value as string[][];
        if (!val || val.length === 0) return false;
        return val.every(pair => pair && pair[0]?.trim().length > 0 && pair[1]?.trim().length > 0);
    }
    if (itemType === 'three_phase_voltage' || dataType === '3 phase voltage') {
        const val = item.value as Record<string, string>;
        if (!val || typeof val !== 'object') return false;
        return Boolean(val['L-N'] || val['L-E'] || val['L-L'] || val['N-E']);
    }
    if (itemType === 'not_applicable') return String(item.value).length > 0;
    if (itemType === 'photo' || itemType === 'media' || dataType === 'media') {
        if (Array.isArray(item.value)) {
            return item.value.some((value) => String(value ?? '').trim().length > 0);
        }
        if (typeof item.value === 'string') return item.value.trim().length > 0;
        return Number(item.value) > 0;
    }
    if (itemType === 'multiselect' || itemType === 'checkbox' || dataType === 'multiple choice' || dataType === 'checkbox') {
        if (Array.isArray(item.value)) return item.value.length > 0;
        return String(item.value).trim().length > 0;
    }
    return String(item.value ?? '').trim().length > 0;
};

const SITE_RADIUS_METERS = 250;

const distanceMeters = (
    from: { latitude: number; longitude: number },
    to: { latitude: number; longitude: number }
) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(to.latitude - from.latitude);
    const dLon = toRad(to.longitude - from.longitude);
    const lat1 = toRad(from.latitude);
    const lat2 = toRad(to.latitude);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * 6371000 * Math.asin(Math.min(1, Math.sqrt(a)));
};

const getChecklistPlaceholder = (item: ChecklistStateItem) => {
    switch (item.type) {
        case 'date':
            return 'Enter date (e.g. YYYY-MM-DD)';
        case 'number':
            return 'Enter numerical value';
        case 'toggle':
            return 'Enter status or check box';
        case 'radio':
            return 'Select option';
        case 'multiselect':
        case 'checkbox':
            return 'Select applicable options';
        case 'email':
            return 'Enter email address';
        case 'textarea':
            return 'Enter detailed notes / remarks';
        case 'not_applicable':
            return 'Enter N/A if not applicable';
        default:
            return 'Add measured values or notes';
    }
};

type DetailTab = 'Tasks' | 'Activities' | 'Attachments';
type ActivityFilter = 'All' | 'Comment' | 'Activity';

const MultiResponseEntryItem: React.FC<{
    item: ChecklistStateItem;
    colors: any;
    updateItem: (id: string, value: any) => void;
    setItems: React.Dispatch<React.SetStateAction<ChecklistStateItem[]>>;
    isUnderReview?: boolean;
}> = ({ item, colors, updateItem, setItems, isUnderReview }) => {
    const isNum = item.type === 'number' || item.dataType === 'Number';
    const isDate = item.type === 'date' || item.dataType === 'Date';

    const responses: string[] = Array.isArray(item.value)
        ? (item.value as string[])
        : (typeof item.value === 'object' && item.value !== null && !Array.isArray(item.value)
            ? Object.values(item.value).map(String)
            : [String(item.value ?? '')]);

    const remarks: string[] = (item.options && item.options.length > 0) ? item.options : [''];
    const maxEntries = Math.max(responses.length, remarks.length, 1);

    const updateResponseAt = (idx: number, newVal: string) => {
        const nextRes = [...responses];
        while (nextRes.length < maxEntries) nextRes.push('');
        nextRes[idx] = newVal;
        updateItem(item.id, nextRes.length === 1 ? nextRes[0] : nextRes);
    };

    const updateRemarkAt = (idx: number, newRemark: string) => {
        const nextRem = [...remarks];
        while (nextRem.length < maxEntries) nextRem.push('');
        nextRem[idx] = newRemark;
        setItems(curr => curr.map(i => i.id === item.id ? { ...i, options: nextRem } : i));
    };

    const addAnotherSlot = () => {
        if (maxEntries >= 4) return;
        const nextRes = [...responses];
        while (nextRes.length < maxEntries) nextRes.push('');
        nextRes.push('');

        const nextRem = [...remarks];
        while (nextRem.length < maxEntries) nextRem.push('');
        nextRem.push('');

        setItems(curr => curr.map(i => i.id === item.id ? {
            ...i,
            value: nextRes,
            options: nextRem
        } : i));
    };

    const removeSlot = (idx: number) => {
        const nextRes = responses.filter((_, i) => i !== idx);
        const nextRem = remarks.filter((_, i) => i !== idx);
        setItems(curr => curr.map(i => i.id === item.id ? {
            ...i,
            value: nextRes.length === 1 ? nextRes[0] : nextRes,
            options: nextRem.length > 0 ? nextRem : ['']
        } : i));
    };

    const hasMultipleOptions = Boolean(item.options && item.options.length > 1);

    if (!hasMultipleOptions && maxEntries === 1) {
        return (
            <View style={{ marginTop: 4 }}>
                <TextInput
                    keyboardType={isNum ? 'numeric' : 'default'}
                    editable={!isUnderReview}
                    placeholder={isDate ? 'YYYY-MM-DD' : (isNum ? 'Enter number' : 'Enter text...')}
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.formInputSingle, { color: colors.text, backgroundColor: colors.surfaceHighlight, borderColor: responses[0] ? colors.primary : colors.border }]}
                    value={responses[0] || ''}
                    onChangeText={(val) => updateResponseAt(0, val)}
                />
            </View>
        );
    }

    return (
        <View style={{ gap: 8, marginTop: 4 }}>
            {Array.from({ length: maxEntries }).map((_, idx) => {
                const resVal = responses[idx] || '';
                const remVal = remarks[idx] || '';
                const optionLabel = (item.options && item.options[idx]) ? item.options[idx] : null;

                return (
                    <View key={`entry-${idx}`} style={{ gap: 4 }}>
                        {optionLabel ? (
                            <Text style={[FONTS.caption, { color: colors.textSecondary, fontWeight: '600' }]}>
                                {optionLabel}
                            </Text>
                        ) : null}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <TextInput
                                keyboardType={isNum ? 'numeric' : 'default'}
                                editable={!isUnderReview}
                                placeholder={isDate ? 'YYYY-MM-DD' : (isNum ? 'Value' : 'Response')}
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.formInputSingle, { flex: 1, color: colors.text, backgroundColor: colors.surfaceHighlight, borderColor: resVal ? colors.primary : colors.border }]}
                                value={resVal}
                                onChangeText={(val) => updateResponseAt(idx, val)}
                            />
                            {!optionLabel && (
                                <TextInput
                                    editable={!isUnderReview}
                                    placeholder={`Remarks ${idx + 1}`}
                                    placeholderTextColor={colors.textSecondary}
                                    style={[styles.formInputSingle, { flex: 1, color: colors.text, backgroundColor: colors.surfaceHighlight, borderColor: remVal ? colors.primary : colors.border }]}
                                    value={remVal}
                                    onChangeText={(val) => updateRemarkAt(idx, val)}
                                />
                            )}
                            {maxEntries > 1 && !isUnderReview && (
                                <TouchableOpacity onPress={() => removeSlot(idx)} style={{ padding: 4 }}>
                                    <FontAwesome name="trash-o" size={18} color={colors.danger} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                );
            })}

            {maxEntries < ((item.type === 'photo' || item.type === 'media' || item.dataType === 'Media') ? 20 : 4) && !isUnderReview && (
                <TouchableOpacity
                    onPress={addAnotherSlot}
                    style={{
                        backgroundColor: colors.primary + '12',
                        borderWidth: 1,
                        borderColor: colors.primary + '30',
                        paddingVertical: 10,
                        borderRadius: 8,
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginTop: 4,
                    }}
                >
                    <Text style={[FONTS.bodyStrong, { color: colors.primary, fontSize: 13 }]}>+ Add Another Slot</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

export const TaskDetailScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { dutyStatus } = useSession();
    const workOrder = getWorkOrderById(route.params?.taskId);
    const typeColors = getServiceTypeColors(workOrder.type, isDark);
    const [workStatus, setWorkStatus] = useState(workOrder.status);
    // Geofencing / location-based access control enabled ONLY for Pune Central Station
    const siteNameLower = (workOrder.siteName || '').toLowerCase();
    const isGeoFenceStation = siteNameLower.includes('pune central');
    const [isNearSite, setIsNearSite] = useState<boolean>(() => !isGeoFenceStation);
    const isUnderReview = workStatus === 'Under Review';
    const isOffSite = isGeoFenceStation && !isNearSite;
    const isChecklistDisabled = isUnderReview || dutyStatus === 'away' || isOffSite;
    const isGeoFenceWarningVisible = isOffSite;
    const isPreventiveOrService = true;
    const isAssignedPending = workStatus === 'Assigned';
    const isFillOnlyChecklist = true;
    const isAllowNotApplicable = true;
    const checklistTemplate = workOrder.checklistItems ?? CHECKLIST_TEMPLATE;
    const [items, setItems] = useState<ChecklistStateItem[]>(() => buildChecklistState(checklistTemplate, isUnderReview));
    const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
    const sectionIds = useMemo(
        () => {
            const ids = items.filter((item) => item.type === 'section_header').map((item) => item.id);
            return ids.length > 0 ? ids : ['__root__'];
        },
        [items]
    );
    const [expandedSectionIds, setExpandedSectionIds] = useState<Set<string>>(
        () => new Set(sectionIds.slice(0, 1))
    );
    const hasChecklistHeaders = items.some((item) => item.type === 'checklist_header');

    const isItemVisible = (item: ChecklistStateItem): boolean => {
        if (!item.showWhenFieldId || !item.showWhenEquals) return true;
        const parentItem = items.find((i) => i.id === item.showWhenFieldId);
        if (!parentItem) return true;
        if (!isItemVisible(parentItem)) return false;
        const parentValue = Array.isArray(parentItem?.value) ? parentItem?.value[0] : parentItem?.value;
        return parentValue === item.showWhenEquals;
    };

    const taskNumbers = useMemo(() => {
        const numbers = new Map<string, string>();
        let n = 0;
        items.forEach((item) => {
            if (item.type === 'section_header') {
                n = 0;
                return;
            }
            if (hasChecklistHeaders) {
                if (item.type !== 'checklist_header') return;
            } else if (item.type === 'checklist_header') {
                return;
            }
            if (!isItemVisible(item)) return;
            n += 1;
            numbers.set(item.id, String(n));
        });
        return numbers;
    }, [items, hasChecklistHeaders]);
    const sectionTaskCounts = useMemo(() => {
        const counts = new Map<string, number>();
        let current: string | null = null;
        items.forEach((item) => {
            if (item.type === 'section_header') {
                current = item.id;
                counts.set(item.id, 0);
                return;
            }
            if (hasChecklistHeaders) {
                if (item.type !== 'checklist_header') return;
            } else {
                if (item.type === 'checklist_header') return;
                if (!isItemVisible(item)) return;
            }
            if (current) counts.set(current, (counts.get(current) || 0) + 1);
        });
        return counts;
    }, [items, hasChecklistHeaders]);

    type NestedChecklistBlock = { checklist: ChecklistStateItem; tasks: ChecklistStateItem[] };
    type NestedSectionBlock = { section: ChecklistStateItem; checklists: NestedChecklistBlock[]; looseTasks: ChecklistStateItem[] };

    const nestedFillTree = useMemo((): NestedSectionBlock[] => {
        const tree: NestedSectionBlock[] = [];
        let currentSection: NestedSectionBlock | null = null;
        let currentChecklist: NestedChecklistBlock | null = null;

        const pushChecklist = () => {
            if (currentSection && currentChecklist) {
                currentSection.checklists.push(currentChecklist);
                currentChecklist = null;
            }
        };
        const pushSection = () => {
            pushChecklist();
            if (currentSection) {
                tree.push(currentSection);
                currentSection = null;
            }
        };

        items.forEach((item) => {
            if (item.type === 'section_header') {
                pushSection();
                currentSection = { section: item, checklists: [], looseTasks: [] };
                return;
            }
            if (item.type === 'checklist_header') {
                pushChecklist();
                currentChecklist = { checklist: item, tasks: [] };
                if (!currentSection) {
                    currentSection = {
                        section: { id: '__root__', label: 'Tasks', type: 'section_header', required: false, value: '' },
                        checklists: [],
                        looseTasks: [],
                    };
                }
                return;
            }
            if (currentChecklist) {
                currentChecklist.tasks.push(item);
            } else if (currentSection) {
                currentSection.looseTasks.push(item);
            } else {
                currentSection = {
                    section: { id: '__root__', label: 'Tasks', type: 'section_header', required: false, value: '' },
                    checklists: [],
                    looseTasks: [item],
                };
            }
        });
        pushSection();
        return tree;
    }, [items]);

    const checklistTaskCounts = useMemo(() => {
        const counts = new Map<string, number>();
        nestedFillTree.forEach((section) => {
            section.checklists.forEach((block) => {
                const count = block.tasks.filter(isItemVisible).length;
                counts.set(block.checklist.id, count);
            });
        });
        return counts;
    }, [nestedFillTree, items]);

    const [expandedChecklistIds, setExpandedChecklistIds] = useState<Set<string>>(() => {
        // By default, open all checklists inside sections
        const allChecklistIds: string[] = [];
        for (const s of nestedFillTree) {
            for (const c of s.checklists) {
                allChecklistIds.push(c.checklist.id);
            }
        }
        return new Set(allChecklistIds);
    });

    const toggleSectionExpanded = (sectionId: string) => {
        setExpandedSectionIds((prev) => {
            // Accordion for top-level sections: if already open → close it; if closed → open it and close all other sections
            if (prev.has(sectionId)) {
                return new Set<string>();
            }
            return new Set<string>([sectionId]);
        });
    };

    const toggleChecklistExpanded = (checklistId: string) => {
        setExpandedChecklistIds((prev) => {
            // Inside the section, checklists can all be open: toggle only this checklist
            const next = new Set(prev);
            if (next.has(checklistId)) {
                next.delete(checklistId);
            } else {
                next.add(checklistId);
            }
            return next;
        });
    };

    const toggleTaskApplicable = (itemId: string) => {
        setItems(currentItems => currentItems.map(item => {
            if (item.id !== itemId) return item;
            const isNA = item.type === 'not_applicable' || item.isNotApplicable;
            if (isNA) {
                const restoredType = ((item.originalType && item.originalType !== 'not_applicable') ? item.originalType : 'text') as ChecklistStateItem['type'];
                return {
                    ...item,
                    isNotApplicable: false,
                    isNa: false,
                    type: restoredType,
                    dataType: getDataTypeLabel({ ...item, type: restoredType }),
                };
            } else {
                return {
                    ...item,
                    isNotApplicable: true,
                    isNa: true,
                    originalType: item.type,
                    type: 'not_applicable',
                };
            }
        }));
    };
    const [assignees, setAssignees] = useState<string[]>(workOrder.technicians || []);
    const [isAddingAssignee, setIsAddingAssignee] = useState(false);
    const [completionNote, setCompletionNote] = useState('');
    const [mediaModalVisible, setMediaModalVisible] = useState(false);
    const [activeMediaId, setActiveMediaId] = useState<string | null>(null);
    const [actionModalVisible, setActionModalVisible] = useState(false);
    const [forwardModalVisible, setForwardModalVisible] = useState(false);
    const [forwardAssignee, setForwardAssignee] = useState<string>('');
    const [forwardComments, setForwardComments] = useState<string>('');
    const [editingTask, setEditingTask] = useState<ChecklistStateItem | null>(null);
    const [editTaskLabel, setEditTaskLabel] = useState('');
    const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
    const [editDataType, setEditDataType] = useState<typeof DATA_TYPES[number]>('Short text');
    const [editTaskOptions, setEditTaskOptions] = useState<string[]>([]);
    const [editTaskRequired, setEditTaskRequired] = useState(true);
    const [newEditOption, setNewEditOption] = useState('');

    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [naConfirmModalVisible, setNaConfirmModalVisible] = useState(false);
    const [taskToMarkNa, setTaskToMarkNa] = useState<string | null>(null);
    const [deleteConfirmModalVisible, setDeleteConfirmModalVisible] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const [workInfoModalVisible, setWorkInfoModalVisible] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [isEditingAssignees, setIsEditingAssignees] = useState(false);
    const [editedNotes, setEditedNotes] = useState(workOrder.notes || '');
    const [editedStartTime, setEditedStartTime] = useState(new Date(workOrder.targetStartTime || (workOrder.targetTime - 24 * 60 * 60 * 1000)).toISOString().slice(0, 10));
    const [editedEndTime, setEditedEndTime] = useState(new Date(workOrder.targetTime).toISOString().slice(0, 10));
    const [editedPrimaryApprover, setEditedPrimaryApprover] = useState(workOrder.primaryApprover || workOrder.approver || 'Marcus Aurelius');
    const [editedSecondaryApprover, setEditedSecondaryApprover] = useState(workOrder.secondaryApprover || 'Andrea Meuschke');

    const handleSaveDetails = () => {
        workOrder.notes = editedNotes;
        workOrder.primaryApprover = editedPrimaryApprover;
        workOrder.secondaryApprover = editedSecondaryApprover;
        workOrder.approver = editedPrimaryApprover;
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
        setEditDataType((task.dataType as any) || (getDataTypeLabel(task) as any) || 'Short text');
        setEditTaskOptions(task.options ? [...task.options] : []);
        setEditTaskRequired(task.required ?? true);
        setEditTaskModalVisible(true);
    };

    const [addTaskModalVisible, setAddTaskModalVisible] = useState(false);
    const [newTaskLabel, setNewTaskLabel] = useState('');
    const [newTaskSectionId, setNewTaskSectionId] = useState('');
    const [newTaskChecklistId, setNewTaskChecklistId] = useState('');
    const [newDataType, setNewDataType] = useState<typeof DATA_TYPES[number]>('Short text');
    const [newTaskOptions, setNewTaskOptions] = useState<string[]>([]);
    const [addNewTaskOptionInput, setAddNewTaskOptionInput] = useState('');

    const sectionDropdownOptions = useMemo(() => {
        const validSections = nestedFillTree.filter(
            (s) => s.section.id !== '__root__' && Boolean(s.section.label)
        );
        return [
            { label: 'None (Optional)', value: '' },
            ...validSections.map((s) => ({
                label: s.section.label,
                value: s.section.id,
            })),
        ];
    }, [nestedFillTree]);

    const checklistDropdownOptions = useMemo(() => {
        if (newTaskSectionId) {
            const chosenSec = nestedFillTree.find((s) => s.section.id === newTaskSectionId);
            const checklists = chosenSec
                ? chosenSec.checklists.filter((c) => c.checklist.id !== '__root__' && Boolean(c.checklist.label))
                : [];
            return [
                { label: 'None (Optional)', value: '' },
                ...checklists.map((c) => ({
                    label: c.checklist.label,
                    value: c.checklist.id,
                })),
            ];
        }

        const allChecklists: { label: string; value: string }[] = [];
        const seenIds = new Set<string>();
        nestedFillTree.forEach((s) => {
            s.checklists.forEach((c) => {
                if (c.checklist.id !== '__root__' && Boolean(c.checklist.label) && !seenIds.has(c.checklist.id)) {
                    seenIds.add(c.checklist.id);
                    allChecklists.push({
                        label: c.checklist.label,
                        value: c.checklist.id,
                    });
                }
            });
        });

        return [
            { label: 'None (Optional)', value: '' },
            ...allChecklists,
        ];
    }, [nestedFillTree, newTaskSectionId]);

    const handleSelectNewTaskSection = (val: string | string[]) => {
        const secId = String(val);
        setNewTaskSectionId(secId);
        if (secId && newTaskChecklistId) {
            const sec = nestedFillTree.find((s) => s.section.id === secId);
            const exists = sec?.checklists.some((c) => c.checklist.id === newTaskChecklistId);
            if (!exists) {
                setNewTaskChecklistId('');
            }
        }
    };

    const handleSelectNewTaskChecklist = (val: string | string[]) => {
        setNewTaskChecklistId(String(val));
    };

    const handleAddNewTask = () => {
        if (!newTaskLabel.trim()) return;
        const newType = mapDataTypeToType(newDataType);
        const isChoiceType = ['Multiple Choice', 'Radio button', 'Dropdown', 'Checkbox'].includes(newDataType);
        const newItem: ChecklistStateItem = {
            id: `task-${Date.now()}`,
            label: newTaskLabel.trim(),
            type: newType,
            dataType: newDataType,
            required: false,
            options: isChoiceType ? [...newTaskOptions] : undefined,
            value: isChoiceType ? [] : '',
        };

        if (newTaskChecklistId) {
            const chIndex = items.findIndex((it) => it.id === newTaskChecklistId);
            if (chIndex !== -1) {
                let insertIndex = items.length;
                for (let i = chIndex + 1; i < items.length; i++) {
                    if (items[i].type === 'checklist_header' || items[i].type === 'section_header') {
                        insertIndex = i;
                        break;
                    }
                }
                const updated = [...items];
                updated.splice(insertIndex, 0, newItem);
                setItems(updated);
            } else {
                setItems([...items, newItem]);
            }
            setExpandedChecklistIds((prev) => new Set([...prev, newTaskChecklistId]));
            for (const s of nestedFillTree) {
                if (s.checklists.some((c) => c.checklist.id === newTaskChecklistId)) {
                    if (s.section.id !== '__root__') {
                        setExpandedSectionIds((prev) => new Set([...prev, s.section.id]));
                    }
                    break;
                }
            }
        } else if (newTaskSectionId) {
            const secIndex = items.findIndex((it) => it.id === newTaskSectionId);
            if (secIndex !== -1) {
                let insertIndex = items.length;
                for (let i = secIndex + 1; i < items.length; i++) {
                    if (items[i].type === 'section_header') {
                        insertIndex = i;
                        break;
                    }
                }
                const updated = [...items];
                updated.splice(insertIndex, 0, newItem);
                setItems(updated);
            } else {
                setItems([...items, newItem]);
            }
            setExpandedSectionIds((prev) => new Set([...prev, newTaskSectionId]));
        } else {
            setItems([...items, newItem]);
        }

        setNewTaskLabel('');
        setNewTaskSectionId('');
        setNewTaskChecklistId('');
        setNewDataType('Short text');
        setNewTaskOptions([]);
        setAddTaskModalVisible(false);
    };

    const saveEditTask = () => {
        if (editingTask && editTaskLabel.trim()) {
            const newType = mapDataTypeToType(editDataType);
            const isChoiceType = ['Multiple Choice', 'Radio button', 'Dropdown', 'Checkbox'].includes(editDataType);
            setItems(items.map(item => item.id === editingTask.id ? {
                ...item,
                label: editTaskLabel.trim(),
                dataType: editDataType,
                type: newType,
                options: isChoiceType ? [...editTaskOptions] : undefined,
                required: editTaskRequired,
            } : item));
        }
        setEditingTask(null);
        setEditTaskModalVisible(false);
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
    const [mandatoryErrorModalVisible, setMandatoryErrorModalVisible] = useState(false);
    const [incompleteMandatoryTasks, setIncompleteMandatoryTasks] = useState<ChecklistStateItem[]>([]);
    const [completionComments, setCompletionComments] = useState('');
    const [completionHasAttachment, setCompletionHasAttachment] = useState(false);

    const [approveModalVisible, setApproveModalVisible] = useState(false);
    const [approveComments, setApproveComments] = useState('');
    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectComments, setRejectComments] = useState('');
    const scrollViewRef = useRef<ScrollView>(null);
    const taskRefs = useRef<Map<string, View>>(new Map());
    const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);

    useEffect(() => {
        if (!isGeoFenceStation) {
            setIsNearSite(true);
            return;
        }

        let cancelled = false;
        const checkLocation = async () => {
            const siteLat = Number(workOrder.latitude);
            const siteLon = Number(workOrder.longitude);
            if (!Number.isFinite(siteLat) || !Number.isFinite(siteLon) || (Math.abs(siteLat) < 0.01 && Math.abs(siteLon) < 0.01)) {
                if (!cancelled) setIsNearSite(true);
                return;
            }
            try {
                const { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    if (!cancelled) setIsNearSite(false);
                    return;
                }

                // Check last known position for instant evaluation
                const lastKnown = await Location.getLastKnownPositionAsync({}).catch(() => null);
                if (lastKnown?.coords && !cancelled) {
                    const meters = distanceMeters(
                        { latitude: lastKnown.coords.latitude, longitude: lastKnown.coords.longitude },
                        { latitude: siteLat, longitude: siteLon }
                    );
                    setIsNearSite(meters <= SITE_RADIUS_METERS);
                }

                // Fetch fresh current position with 5s timeout
                const current = await Promise.race([
                    Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    }),
                    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
                ]);
                if (current && typeof current === 'object' && 'coords' in current && !cancelled) {
                    const meters = distanceMeters(
                        { latitude: current.coords.latitude, longitude: current.coords.longitude },
                        { latitude: siteLat, longitude: siteLon }
                    );
                    setIsNearSite(meters <= SITE_RADIUS_METERS);
                }
            } catch {
                if (!cancelled) setIsNearSite(false);
            }
        };
        checkLocation();
        return () => {
            cancelled = true;
        };
    }, [workOrder.id, workOrder.latitude, workOrder.longitude, isGeoFenceStation]);

    useEffect(() => {
        if (isUnderReview) {
            const timer = setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isUnderReview]);
    const visibleItems = items.filter(isItemVisible);
    const requiredItems = visibleItems.filter((item) => item.required && item.type !== 'section_header' && item.type !== 'checklist_header');
    const completedRequired = requiredItems.filter(isComplete).length;
    const allCompleted = visibleItems.every((item) => item.type === 'section_header' || item.type === 'checklist_header' || isComplete(item));
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
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }
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

    const updateItem = (id: string, value: any) => {
        if (isOffSite) return;
        setItems((current) => current.map((item) => (item.id === id ? { ...item, value } : item)));
    };

    const getTaskLocationInfo = (taskId: string) => {
        for (const sec of nestedFillTree) {
            for (const ch of sec.checklists) {
                if (ch.tasks.some((task) => task.id === taskId)) {
                    return {
                        section: sec.section.id !== '__root__' ? sec.section.label : null,
                        checklist: ch.checklist.id !== '__root__' ? ch.checklist.label : null,
                    };
                }
            }
            if (sec.looseTasks.some((task) => task.id === taskId)) {
                return {
                    section: sec.section.id !== '__root__' ? sec.section.label : null,
                    checklist: null,
                };
            }
        }
        return { section: null, checklist: null };
    };

    const navigateToTask = (targetTaskId: string) => {
        setMandatoryErrorModalVisible(false);

        if (activeTab !== 'Tasks') {
            setActiveTab('Tasks');
        }

        let targetSectionId: string | null = null;
        let targetChecklistId: string | null = null;

        for (const sec of nestedFillTree) {
            for (const ch of sec.checklists) {
                if (ch.tasks.some((t) => t.id === targetTaskId)) {
                    targetSectionId = sec.section.id;
                    targetChecklistId = ch.checklist.id;
                    break;
                }
            }
            if (targetSectionId) break;
            if (sec.looseTasks.some((t) => t.id === targetTaskId)) {
                targetSectionId = sec.section.id;
                break;
            }
        }

        if (targetSectionId && targetSectionId !== '__root__') {
            setExpandedSectionIds(new Set([targetSectionId]));
        }
        if (targetChecklistId && targetChecklistId !== '__root__') {
            setExpandedChecklistIds((prev) => new Set([...prev, targetChecklistId]));
        }

        setHighlightedTaskId(targetTaskId);
        setTimeout(() => {
            setHighlightedTaskId((curr) => (curr === targetTaskId ? null : curr));
        }, 4000);

        const scrollToTarget = (delay: number) => {
            setTimeout(() => {
                const node = taskRefs.current.get(targetTaskId);
                if (node && scrollViewRef.current) {
                    node.measureLayout(
                        scrollViewRef.current as any,
                        (_x, y) => {
                            scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 40), animated: true });
                        },
                        () => {}
                    );
                }
            }, delay);
        };

        scrollToTarget(100);
        scrollToTarget(300);
    };

    const handleCompleteAction = () => {
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }

        const mandatoryIncomplete = visibleItems.filter((item) => 
            item.required && 
            (item.type as any) !== 'section_header' && 
            (item.type as any) !== 'checklist_header' && 
            (item.type as any) !== 'instruction' && 
            !isComplete(item)
        );

        if (mandatoryIncomplete.length > 0) {
            setIncompleteMandatoryTasks(mandatoryIncomplete);
            setMandatoryErrorModalVisible(true);
            return;
        }

        if (!allCompleted) {
            setConfirmationModalVisible(true);
        } else {
            setCompletionModalVisible(true);
        }
    };

    const handleSubmitCompletion = () => {
        const mandatoryIncomplete = visibleItems.filter((item) => 
            item.required && 
            (item.type as any) !== 'section_header' && 
            (item.type as any) !== 'checklist_header' && 
            (item.type as any) !== 'instruction' && 
            !isComplete(item)
        );

        if (mandatoryIncomplete.length > 0) {
            setCompletionModalVisible(false);
            setIncompleteMandatoryTasks(mandatoryIncomplete);
            setMandatoryErrorModalVisible(true);
            return;
        }

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
        setWorkStatus('Under Review');

        setCompletionModalVisible(false);
        Alert.alert(
            'Submitted',
            'Work completed successfully and moved to Under Review.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleApproveWork = () => {
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }
        setApproveModalVisible(true);
    };

    const handleAcceptAssignedWork = () => {
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }
        workOrder.status = 'Accepted';
        setWorkStatus('Accepted');
        Alert.alert(
            'Work Accepted',
            `"${workOrder.title}" has been accepted.`
        );
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
        setWorkStatus('Completed');

        setApproveModalVisible(false);
        Alert.alert(
            'Approved',
            'The work order has been approved successfully.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleRejectWork = () => {
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }
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
        if (isAssignedPending) {
            workOrder.status = 'Unassigned';
            workOrder.isRequested = false;
            setWorkStatus('Unassigned');
            setRejectModalVisible(false);
            Alert.alert(
                'Rejected',
                'The assigned work has been rejected and moved to Unassigned.',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
            );
            return;
        }

        workOrder.status = 'Working';
        setWorkStatus('Working');

        setRejectModalVisible(false);
        Alert.alert(
            'Rejected',
            'The work order has been sent back for correction.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    const handleForwardWork = () => {
        if (isOffSite) {
            Alert.alert('Not at site', 'You can view this work, but actions are disabled until you are near the location.');
            return;
        }
        const assigneeOptions = getSelectorOptions('assignees').options;
        if (!forwardAssignee && assigneeOptions.length > 0) {
            setForwardAssignee(assigneeOptions[0].value);
        }
        setForwardModalVisible(true);
    };

    const handleConfirmForward = () => {
        if (!forwardAssignee) {
            Alert.alert('Assignee Required', 'Please select a team member to forward this work order to.');
            return;
        }

        const note = forwardComments.trim();
        const newAct = {
            id: Date.now().toString(),
            title: 'Timothy Field (You)',
            time: 'Just now',
            type: 'comment' as const,
            detail: note 
                ? `Work forwarded to ${forwardAssignee}: ${note}`
                : `Work forwarded to ${forwardAssignee}`,
        };

        setActivities([newAct, ...activities]);
        setAssignees([forwardAssignee]);
        workOrder.technicians = [forwardAssignee];
        setForwardModalVisible(false);
        setForwardComments('');

        Alert.alert(
            'Work Forwarded',
            `This work order has been forwarded to ${forwardAssignee}.`,
            [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
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

                <ScrollView
                    ref={scrollViewRef}
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.content,
                        { paddingBottom: Math.max(insets.bottom, 16) + 120 },
                    ]}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={[styles.heroCard, { backgroundColor: colors.surface, shadowColor: colors.shadow, zIndex: 10 }]}>
                        <View style={styles.heroTopRow}>
                            <View style={styles.heroTitleWrap}>
                                <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
                                    <Text style={[styles.jobTitle, { color: colors.text, flex: 1 }]}>{workOrder.title}</Text>
                                    <Text style={[{ color: colors.primary, marginTop: 2 }, FONTS.caption]}>{workOrder.projectId}</Text>
                                </View>
                                <View style={styles.heroTopChipRow}>
                                    <View style={[
                                        styles.heroChip,
                                        {
                                            backgroundColor: getStatusColor(workStatus, colors, isDark) + '15',
                                            borderColor: getStatusColor(workStatus, colors, isDark)
                                        }
                                    ]}>
                                        <Text style={[
                                            styles.heroChipText,
                                            { color: getStatusColor(workStatus, colors, isDark) }
                                        ]}>{workStatus}</Text>
                                    </View>
                                    {workOrder.type === 'Installation' && workOrder.stage ? (
                                        <View style={[styles.heroChip, { backgroundColor: (isDark ? colors.primaryLight : colors.primary) + '15', borderColor: isDark ? colors.primaryLight : colors.primary }]}>
                                            <Text style={[styles.heroChipText, { color: isDark ? colors.primaryLight : colors.primary }]}>{workOrder.stage}</Text>
                                        </View>
                                    ) : null}
                                    <View style={[styles.heroChip, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                        <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>
                                            {(workOrder.assetIds || [workOrder.assetId]).length > 1
                                                ? `${(workOrder.assetIds || [workOrder.assetId]).length} CPIDs`
                                                : `CPID: ${(workOrder.assetIds || [workOrder.assetId])[0]}`}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                                <TouchableOpacity 
                                    onPress={() => {
                                        setIsEditingDetails(false);
                                        setWorkInfoModalVisible(true);
                                    }}
                                    style={[styles.navButton, { backgroundColor: colors.primary + '15', marginTop: 4 }]}
                                    accessibilityLabel="View full work details"
                                >
                                    <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    onPress={handleShareWork}
                                    style={[styles.navButton, { backgroundColor: colors.primary + '15', marginTop: 4 }]}
                                    accessibilityLabel="Share work order"
                                >
                                    <Ionicons name="share-social-outline" size={16} color={colors.primary} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.compactLocationRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                                <Ionicons name="location-outline" size={15} color={colors.primary} />
                                <Text numberOfLines={1} style={[{ color: colors.text, flex: 1 }, FONTS.caption]}>{workOrder.address}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => {
                                    const lat = workOrder.latitude;
                                    const lon = workOrder.longitude;
                                    if (!lat || !lon) return;
                                    const url = Platform.select({
                                        ios: `maps:?daddr=${lat},${lon}`,
                                        default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                                    });
                                    if (url) Linking.openURL(url);
                                }}
                                style={[styles.compactNavBtn, { backgroundColor: colors.primary + '15' }]}
                            >
                                <Ionicons name="navigate" size={13} color={colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.compactMetaRow}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Ionicons name="calendar-outline" size={13} color={colors.textSecondary} />
                                <Text style={[FONTS.caption, { color: colors.textSecondary }]}>
                                    {new Date(workOrder.targetStartTime || (workOrder.targetTime - 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} - {new Date(workOrder.targetTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </Text>
                            </View>
                            {assignees.length > 0 && (
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                    <Ionicons name="person-outline" size={13} color={colors.textSecondary} />
                                    <Text numberOfLines={1} style={[FONTS.caption, { color: colors.textSecondary, maxWidth: 140 }]}>
                                        {assignees[0]}{assignees.length > 1 ? ` +${assignees.length - 1}` : ''}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {isGeoFenceWarningVisible ? (
                        <View
                            style={[
                                styles.geoFenceWarning,
                                {
                                    backgroundColor: isDark ? 'rgba(255, 183, 77, 0.14)' : '#FFF8E1',
                                    borderColor: isDark ? '#FFB74D' : '#E0A000',
                                },
                            ]}
                        >
                            <View
                                style={[
                                    styles.geoFenceIcon,
                                    { backgroundColor: isDark ? 'rgba(255, 183, 77, 0.2)' : '#FFECB3' },
                                ]}
                            >
                                <Ionicons name="location-outline" size={20} color={isDark ? '#FFB74D' : '#A66A00'} />
                            </View>
                            <View style={styles.geoFenceCopy}>
                                <Text style={[styles.geoFenceTitle, { color: isDark ? '#FFB74D' : '#8A5800' }]}>
                                    Location check
                                </Text>
                                <Text style={[styles.geoFenceMessage, { color: isDark ? colors.text : '#6B4A00' }]}>
                                    You are not at or near this work location. You can view the work, but all actions are disabled until you arrive on site.
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{ padding: 4 }}
                                onPress={() => {
                                    const lat = workOrder.latitude;
                                    const lon = workOrder.longitude;
                                    if (!lat || !lon) return;
                                    const url = Platform.select({
                                        ios: `maps:?daddr=${lat},${lon}`,
                                        default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                                    });
                                    if (url) Linking.openURL(url);
                                }}
                            >
                                <Ionicons name="navigate-outline" size={24} color={isDark ? '#FFB74D' : '#A66A00'} />
                            </TouchableOpacity>
                        </View>
                    ) : null}

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
                                    <View style={[styles.listColumn, isFillOnlyChecklist && styles.listColumnCompact]}>
                                        {(() => {
                                            const renderTaskCard = (item: ChecklistStateItem) => {
                                            // Conditional visibility: hide if dependent condition not met
                                            if (!isItemVisible(item)) return null;

                                            const isNA = item.type === 'not_applicable' || item.isNotApplicable;

                                            if (isFillOnlyChecklist) {
                                                const isCompleted = isComplete(item);
                                                const num = taskNumbers.get(item.id);
                                                const displayType = item.dataType || (
                                                    item.type === 'photo' || item.type === 'media' ? 'Media' :
                                                    item.type === 'three_phase_voltage' ? '3 phase voltage' :
                                                    item.type === 'textarea' ? 'Long text' :
                                                    item.type === 'radio' ? 'Radio button' :
                                                    item.type === 'dropdown' ? 'Dropdown' :
                                                    item.type === 'multiselect' ? 'Multiple Choice' :
                                                    item.type === 'checkbox' ? 'Checkbox' :
                                                    item.type === 'number' ? 'Number' :
                                                    item.type === 'date' ? 'Date' :
                                                    item.type === 'email' ? 'Email' :
                                                    item.type === 'text' ? 'Short text' :
                                                    item.type === 'none' ? 'None' :
                                                    ''
                                                );
                                                const isDropdownOpen = openDropdownId === item.id;
                                                const isFieldRequired = Boolean(item.required);

                                                const isHighlighted = highlightedTaskId === item.id;

                                                return (
                                                    <View
                                                        key={item.id}
                                                        ref={(el) => {
                                                            if (el) taskRefs.current.set(item.id, el);
                                                            else taskRefs.current.delete(item.id);
                                                        }}
                                                        style={[
                                                            styles.formFieldRow,
                                                            {
                                                                borderBottomColor: isHighlighted ? colors.primary : colors.border,
                                                                borderBottomWidth: isHighlighted ? 2 : StyleSheet.hairlineWidth,
                                                                backgroundColor: isHighlighted ? colors.primary + '20' : (isNA ? colors.surfaceHighlight + '40' : 'transparent'),
                                                                zIndex: openMenuId === item.id ? 100 : 1,
                                                                borderRadius: isHighlighted ? 8 : 0,
                                                            },
                                                        ]}
                                                    >
                                                        {/* Field Header */}
                                                        <View style={styles.formFieldHeader}>
                                                            {/* Left: number + label + required star */}
                                                            <View style={styles.formFieldLabelWrapper}>
                                                                <View style={styles.formFieldLabelRow}>
                                                                    {num ? (
                                                                        <Text style={[styles.formFieldNumber, { color: colors.textSecondary }]}>
                                                                            {num}.
                                                                        </Text>
                                                                    ) : null}
                                                                    <Text
                                                                        style={[
                                                                            styles.formFieldLabel,
                                                                            {
                                                                                color: isNA ? colors.textSecondary : colors.text,
                                                                                textDecorationLine: isNA ? 'line-through' : 'none',
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {item.label}
                                                                    </Text>
                                                                    {isFieldRequired && !isNA && (
                                                                        <Text style={{ color: colors.danger, fontWeight: '700', fontSize: 13.5 }}>*</Text>
                                                                    )}
                                                                </View>
                                                            </View>

                                                            {/* Right Side: type chip + checkmark + Action Menu */}
                                                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                                                                {isNA ? (
                                                                    <View style={[styles.formFieldTag, { backgroundColor: colors.border + '33', borderColor: colors.border, marginTop: 0 }]}>
                                                                        <Text style={[styles.formFieldTagText, { color: colors.textSecondary }]}>
                                                                            N/A
                                                                        </Text>
                                                                    </View>
                                                                ) : displayType && item.type !== 'none' ? (
                                                                    <View style={[styles.formFieldTag, { backgroundColor: colors.primary + '12', borderColor: colors.primary + '30', marginTop: 0 }]}>
                                                                        <Text style={[styles.formFieldTagText, { color: colors.primary }]}>
                                                                            {displayType}
                                                                        </Text>
                                                                    </View>
                                                                ) : null}
                                                                {!isChecklistDisabled && (
                                                                    <View style={{ position: 'relative', zIndex: openMenuId === item.id ? 120 : 1 }}>
                                                                        <TouchableOpacity
                                                                            onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                                                            style={styles.fieldMenuTrigger}
                                                                        >
                                                                            <Ionicons name="ellipsis-vertical" size={17} color={colors.textSecondary} />
                                                                        </TouchableOpacity>
                                                                        {openMenuId === item.id && (
                                                                            <View style={[styles.fieldActionPopover, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                                                <TouchableOpacity
                                                                                    style={styles.fieldActionPopoverItem}
                                                                                    onPress={() => {
                                                                                        setOpenMenuId(null);
                                                                                        startEditTask(item);
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome name="pencil" size={14} color={colors.primary} />
                                                                                    <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]}>Edit</Text>
                                                                                </TouchableOpacity>
                                                                                {isAllowNotApplicable && (
                                                                                    <TouchableOpacity
                                                                                        style={styles.fieldActionPopoverItem}
                                                                                        onPress={() => {
                                                                                            setOpenMenuId(null);
                                                                                            toggleTaskApplicable(item.id);
                                                                                        }}
                                                                                    >
                                                                                        <FontAwesome
                                                                                            name={isNA ? 'check-circle-o' : 'ban'}
                                                                                            size={14}
                                                                                            color={isNA ? colors.primary : colors.textSecondary}
                                                                                        />
                                                                                        <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]} numberOfLines={1}>
                                                                                            {isNA ? 'Applicable' : 'Not Applicable'}
                                                                                        </Text>
                                                                                    </TouchableOpacity>
                                                                                )}
                                                                                <TouchableOpacity
                                                                                    style={styles.fieldActionPopoverItem}
                                                                                    onPress={() => {
                                                                                        setOpenMenuId(null);
                                                                                        deleteTask(item.id);
                                                                                    }}
                                                                                >
                                                                                    <FontAwesome name="trash-o" size={14} color={colors.danger} />
                                                                                    <Text style={[FONTS.body, { color: colors.danger, fontSize: 13 }]}>Delete</Text>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        )}
                                                                    </View>
                                                                )}
                                                            </View>
                                                        </View>

                                                        {/* Field Control Body */}
                                                        {isNA ? (
                                                            <Text style={[FONTS.caption, { color: colors.textSecondary, fontStyle: 'italic', marginTop: 2 }]}>
                                                                Not Applicable — tap ••• to re-enable
                                                            </Text>
                                                        ) : (
                                                            <>
                                                                {item.type === 'photo' || item.type === 'media' || item.dataType === 'Media' ? (
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 4 }} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
                                                                        {(item.options?.length ? item.options : ['Photo Evidence']).map((remark, idx) => {
                                                                            const slotValue = Array.isArray(item.value)
                                                                                ? String(item.value[idx] ?? '')
                                                                                : idx === 0
                                                                                    ? String(item.value && item.value !== 0 ? item.value : '')
                                                                                    : '';
                                                                            const demoSource =
                                                                                resolvePmDemoPhotoSource(slotValue) ||
                                                                                (idx < PM_DEMO_PHOTOS.length ? PM_DEMO_PHOTOS[idx].source : null);
                                                                            const isDoc = (item.options || []).some((option) => /certificate|document|SLD|diagram/i.test(option));
                                                                            const hasPhoto = Boolean(demoSource || slotValue);
                                                                            return (
                                                                                <View key={`${item.id}-att-${idx}`} style={{ width: 130 }}>
                                                                                    <TouchableOpacity
                                                                                        onPress={() => {
                                                                                            if (isChecklistDisabled) return;
                                                                                            setActiveMediaId(item.id);
                                                                                            setMediaModalVisible(true);
                                                                                        }}
                                                                                        activeOpacity={0.8}
                                                                                        style={[
                                                                                            styles.formMediaThumbnailCard,
                                                                                            {
                                                                                                backgroundColor: colors.surfaceHighlight,
                                                                                                borderColor: hasPhoto ? colors.primary : colors.border,
                                                                                            },
                                                                                        ]}
                                                                                    >
                                                                                        {demoSource ? (
                                                                                            <>
                                                                                                <Image source={demoSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                                                                <View style={styles.formMediaCheckBadge}>
                                                                                                    <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                                                                                                </View>
                                                                                            </>
                                                                                        ) : (
                                                                                            <View style={{ alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                                                                                <Ionicons name={isDoc ? 'document-text-outline' : 'camera-outline'} size={24} color={colors.primary} />
                                                                                                <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 4, fontSize: 11, textAlign: 'center' }]} numberOfLines={2}>
                                                                                                    {slotValue || (isDoc ? 'Upload Doc' : 'Add Photo')}
                                                                                                </Text>
                                                                                            </View>
                                                                                        )}
                                                                                    </TouchableOpacity>
                                                                                    <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 4, fontSize: 11, textAlign: 'center' }]} numberOfLines={1}>
                                                                                        {remark || `Attachment ${idx + 1}`}
                                                                                    </Text>
                                                                                </View>
                                                                            );
                                                                        })}
                                                                    </ScrollView>
                                                                ) : item.type === 'three_phase_voltage' || item.dataType === '3 phase voltage' ? (
                                                                    (() => {
                                                                        const voltVal = (typeof item.value === 'object' && item.value !== null ? item.value : {}) as Record<string, string>;
                                                                        const phases = [
                                                                            { key: 'L-N', label: 'Line to Neutral', placeholder: '230' },
                                                                            { key: 'L-E', label: 'Line to Earth', placeholder: '230' },
                                                                            { key: 'L-L', label: 'Line to Line', placeholder: '400' },
                                                                            { key: 'N-E', label: 'Neutral to Earth', placeholder: '2' },
                                                                        ];
                                                                        return (
                                                                            <View style={styles.formVoltageGrid}>
                                                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                                                    {phases.slice(0, 2).map((phase) => (
                                                                                        <View key={phase.key} style={[styles.formVoltageCard, { backgroundColor: colors.surfaceHighlight, borderColor: voltVal[phase.key] ? colors.primary : colors.border }]}>
                                                                                            <Text style={[styles.formVoltageKey, { color: colors.textSecondary }]}>{phase.key} ({phase.label})</Text>
                                                                                            <View style={styles.formVoltageInputRow}>
                                                                                                <TextInput
                                                                                                    keyboardType="numeric"
                                                                                                    editable={!isChecklistDisabled}
                                                                                                    placeholder={phase.placeholder}
                                                                                                    placeholderTextColor={colors.textSecondary + '80'}
                                                                                                    style={[styles.formVoltageInput, { color: colors.text }]}
                                                                                                    value={voltVal[phase.key] || ''}
                                                                                                    onChangeText={(val) => updateItem(item.id, { ...voltVal, [phase.key]: val })}
                                                                                                />
                                                                                                <Text style={[styles.formVoltageUnit, { color: colors.textSecondary }]}>V</Text>
                                                                                            </View>
                                                                                        </View>
                                                                                    ))}
                                                                                </View>
                                                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                                                    {phases.slice(2, 4).map((phase) => (
                                                                                        <View key={phase.key} style={[styles.formVoltageCard, { backgroundColor: colors.surfaceHighlight, borderColor: voltVal[phase.key] ? colors.primary : colors.border }]}>
                                                                                            <Text style={[styles.formVoltageKey, { color: colors.textSecondary }]}>{phase.key} ({phase.label})</Text>
                                                                                            <View style={styles.formVoltageInputRow}>
                                                                                                <TextInput
                                                                                                    keyboardType="numeric"
                                                                                                    editable={!isChecklistDisabled}
                                                                                                    placeholder={phase.placeholder}
                                                                                                    placeholderTextColor={colors.textSecondary + '80'}
                                                                                                    style={[styles.formVoltageInput, { color: colors.text }]}
                                                                                                    value={voltVal[phase.key] || ''}
                                                                                                    onChangeText={(val) => updateItem(item.id, { ...voltVal, [phase.key]: val })}
                                                                                                />
                                                                                                <Text style={[styles.formVoltageUnit, { color: colors.textSecondary }]}>V</Text>
                                                                                            </View>
                                                                                        </View>
                                                                                    ))}
                                                                                </View>
                                                                            </View>
                                                                        );
                                                                    })()
                                                                ) : item.type === 'email' || item.dataType === 'Email' ? (
                                                                    <View style={[styles.formInputWithIcon, { backgroundColor: colors.surfaceHighlight, borderColor: item.value ? colors.primary : colors.border }]}>
                                                                        <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
                                                                        <TextInput
                                                                            keyboardType="email-address"
                                                                            autoCapitalize="none"
                                                                            editable={!isChecklistDisabled}
                                                                            placeholder="name@example.com"
                                                                            placeholderTextColor={colors.textSecondary}
                                                                            style={[styles.formInputInsideIcon, { color: colors.text }]}
                                                                            value={String(item.value ?? '')}
                                                                            onChangeText={(value) => updateItem(item.id, value)}
                                                                        />
                                                                    </View>
                                                                ) : item.isReadOnly || item.type === 'textarea' || item.dataType === 'Long text' ? (
                                                                    item.isReadOnly ? (
                                                                        <Text style={[FONTS.body, { color: colors.textSecondary, fontSize: 13, lineHeight: 19, fontStyle: 'italic', marginTop: 2 }]}>
                                                                            {String(item.value ?? item.defaultValue ?? item.label ?? '')}
                                                                        </Text>
                                                                    ) : (
                                                                        <TextInput
                                                                            multiline
                                                                            numberOfLines={3}
                                                                            editable={!isChecklistDisabled}
                                                                            placeholder="Enter detailed description / remarks..."
                                                                            placeholderTextColor={colors.textSecondary}
                                                                            style={[styles.formTextarea, { backgroundColor: colors.surfaceHighlight, borderColor: item.value ? colors.primary : colors.border, color: colors.text }]}
                                                                            value={String(item.value ?? item.defaultValue ?? '')}
                                                                            onChangeText={(value) => updateItem(item.id, value)}
                                                                        />
                                                                    )
                                                                ) : item.type === 'dropdown' || item.dataType === 'Dropdown' ? (
                                                                    (() => {
                                                                        const options = item.options?.length ? item.options : ['Select Option'];
                                                                        const selectedValue = String(item.value ?? '');
                                                                        return (
                                                                            <View>
                                                                                <TouchableOpacity
                                                                                    disabled={isChecklistDisabled}
                                                                                    onPress={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                                                                                    style={[
                                                                                        styles.formDropdownSelector,
                                                                                        {
                                                                                            backgroundColor: colors.surfaceHighlight,
                                                                                            borderColor: selectedValue ? colors.primary : colors.border,
                                                                                        },
                                                                                    ]}
                                                                                >
                                                                                    <Text style={[FONTS.body, { color: selectedValue ? colors.text : colors.textSecondary }]}>
                                                                                        {selectedValue || 'Select an option...'}
                                                                                    </Text>
                                                                                    <Ionicons
                                                                                        name={isDropdownOpen ? 'chevron-up' : 'chevron-down'}
                                                                                        size={18}
                                                                                        color={colors.textSecondary}
                                                                                    />
                                                                                </TouchableOpacity>
                                                                                {isDropdownOpen && (
                                                                                    <View style={[styles.formDropdownList, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                                                        {options.map((opt) => {
                                                                                            const isSelected = selectedValue === opt;
                                                                                            return (
                                                                                                <TouchableOpacity
                                                                                                    key={opt}
                                                                                                    onPress={() => {
                                                                                                        updateItem(item.id, opt);
                                                                                                        setOpenDropdownId(null);
                                                                                                    }}
                                                                                                    style={[
                                                                                                        styles.formDropdownItem,
                                                                                                        {
                                                                                                            backgroundColor: isSelected ? colors.primary + '12' : 'transparent',
                                                                                                            borderBottomColor: colors.border,
                                                                                                        },
                                                                                                    ]}
                                                                                                >
                                                                                                    <Text style={[FONTS.body, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '600' : '400' }]}>
                                                                                                        {opt}
                                                                                                    </Text>
                                                                                                    {isSelected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                                                                                                </TouchableOpacity>
                                                                                            );
                                                                                        })}
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                        );
                                                                    })()
                                                                ) : item.type === 'radio' || item.dataType === 'Radio button' ? (
                                                                    <View style={{ gap: 8, marginTop: 2, flexDirection: (item.options || []).length <= 2 ? 'row' : 'column', flexWrap: 'wrap' }}>
                                                                        {(item.options || ['Yes', 'No']).map((opt) => {
                                                                            const selected = item.value === opt;
                                                                            return (
                                                                                <TouchableOpacity
                                                                                    key={opt}
                                                                                    disabled={isChecklistDisabled}
                                                                                    onPress={() => updateItem(item.id, opt)}
                                                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 0 }}
                                                                                >
                                                                                    <Ionicons
                                                                                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                                                                                        size={18}
                                                                                        color={selected ? colors.primary : colors.textSecondary}
                                                                                    />
                                                                                    <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]}>{opt}</Text>
                                                                                </TouchableOpacity>
                                                                            );
                                                                        })}
                                                                    </View>
                                                                ) : !item.isReadOnly && (item.type === 'multiselect' || item.type === 'checkbox' || item.dataType === 'Multiple Choice' || item.dataType === 'Checkbox') ? (
                                                                    <View style={{ gap: 6, marginTop: 4 }}>
                                                                        {(item.options && item.options.length > 0 ? item.options : ['Option 1', 'Option 2']).map((opt) => {
                                                                            const currentArray = Array.isArray(item.value) ? (item.value as string[]) : (item.value ? [String(item.value)] : []);
                                                                            const selected = currentArray.includes(opt);
                                                                            return (
                                                                                <TouchableOpacity
                                                                                    key={opt}
                                                                                    disabled={isChecklistDisabled}
                                                                                    onPress={() => {
                                                                                        if (isChecklistDisabled) return;
                                                                                        const nextArray = selected ? currentArray.filter(i => i !== opt) : [...currentArray, opt];
                                                                                        updateItem(item.id, nextArray);
                                                                                    }}
                                                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                                                                                >
                                                                                    <Ionicons
                                                                                        name={selected ? 'checkbox' : 'square-outline'}
                                                                                        size={20}
                                                                                        color={selected ? colors.primary : colors.textSecondary}
                                                                                    />
                                                                                    <Text style={[FONTS.body, { color: colors.text, fontWeight: selected ? '600' : '400' }]}>
                                                                                        {opt}
                                                                                    </Text>
                                                                                </TouchableOpacity>
                                                                            );
                                                                        })}
                                                                    </View>
                                                                ) : (item.type === 'none' || item.dataType === 'None' || (item.dataType && item.dataType.toLowerCase() === 'none')) ? (
                                                                    (() => {
                                                                        const hasOpts = Boolean(item.options && item.options.length > 0);
                                                                        if (!hasOpts) {
                                                                            return null;
                                                                        }
                                                                        return (
                                                                            <View style={{ gap: 6, marginTop: 4 }}>
                                                                                {item.options!.map((opt) => {
                                                                                    const currentArray = Array.isArray(item.value) ? item.value : (item.value ? [String(item.value)] : []);
                                                                                    const isChecked = currentArray.includes(opt);
                                                                                    return (
                                                                                        <TouchableOpacity
                                                                                            key={opt}
                                                                                            disabled={isChecklistDisabled}
                                                                                            onPress={() => {
                                                                                                if (isChecklistDisabled) return;
                                                                                                updateItem(item.id, isChecked ? [] : [opt]);
                                                                                            }}
                                                                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                                                                                        >
                                                                                            <Ionicons
                                                                                                name={isChecked ? 'checkbox' : 'square-outline'}
                                                                                                size={20}
                                                                                                color={isChecked ? colors.primary : colors.textSecondary}
                                                                                            />
                                                                                            <Text style={[FONTS.body, { color: colors.text, fontWeight: isChecked ? '600' : '400', flex: 1 }]}>
                                                                                                {opt}
                                                                                            </Text>
                                                                                        </TouchableOpacity>
                                                                                    );
                                                                                })}
                                                                            </View>
                                                                        );
                                                                    })()
                                                                ) : (item.type === 'text' || item.type === 'number' || item.type === 'date' || item.dataType === 'Short text' || item.dataType === 'Number' || item.dataType === 'Date') ? (
                                                                    <MultiResponseEntryItem
                                                                        item={item}
                                                                        colors={colors}
                                                                        updateItem={updateItem}
                                                                        setItems={setItems}
                                                                        isUnderReview={isChecklistDisabled}
                                                                    />
                                                                ) : (
                                                                    <TextInput
                                                                        keyboardType="default"
                                                                        editable={!isChecklistDisabled}
                                                                        placeholder={getChecklistPlaceholder(item)}
                                                                        placeholderTextColor={colors.textSecondary}
                                                                        style={[styles.formInputSingle, { backgroundColor: colors.surfaceHighlight, borderColor: item.value ? colors.primary : colors.border, color: colors.text }]}
                                                                        value={Array.isArray(item.value) ? item.value.join(', ') : String(item.value ?? '')}
                                                                        onChangeText={(value) => updateItem(item.id, value)}
                                                                    />
                                                                )}
                                                            </>
                                                        )}
                                                    </View>
                                                );
                                            }

                                            const hideStepIcon = isFillOnlyChecklist;
                                            const isHighlighted = highlightedTaskId === item.id;
                                            return (
                                                <View
                                                    key={item.id}
                                                    ref={(el) => {
                                                        if (el) taskRefs.current.set(item.id, el);
                                                        else taskRefs.current.delete(item.id);
                                                    }}
                                                    style={[
                                                        isFillOnlyChecklist ? styles.taskContainer : styles.stepCard,
                                                        {
                                                            backgroundColor: isHighlighted ? colors.primary + '15' : colors.surface,
                                                            borderColor: isHighlighted ? colors.primary : colors.border,
                                                            borderWidth: isHighlighted ? 2 : 1,
                                                            shadowColor: isFillOnlyChecklist ? 'transparent' : colors.shadow,
                                                            zIndex: openMenuId === item.id ? 100 : 1,
                                                            opacity: isNA ? 0.6 : 1,
                                                        },
                                                    ]}
                                                >
                                            <View style={[styles.stepHeader, isFillOnlyChecklist && styles.stepHeaderCompact, { zIndex: openMenuId === item.id ? 100 : 1 }]}>
                                                    {!hideStepIcon && (
                                                    <TouchableOpacity
                                                        activeOpacity={!isFillOnlyChecklist && !isNA && !item.isReadOnly ? 0.7 : 1}
                                                        onPress={() => {
                                                            if (isFillOnlyChecklist || item.type === 'radio' || item.dataType === 'Radio button') return;
                                                            if (!isChecklistDisabled && !isNA && !item.isReadOnly) {
                                                                const updateItem = (id: string, value: any) => {
                                                                    setItems(currentItems => currentItems.map(i => i.id === id ? { ...i, value } : i));
                                                                };
                                                                updateItem(item.id, isComplete(item) ? '' : 'done');
                                                            }
                                                        }}
                                                    >
                                                        <View style={[styles.stepIcon, { backgroundColor: isNA ? colors.border + '40' : (isComplete(item) ? colors.success : colors.surfaceHighlight) }]}>
                                                            <Ionicons
                                                                name={isNA ? 'ban-outline' : (isComplete(item) ? 'checkmark' : 'ellipse-outline')}
                                                                size={18}
                                                                color={isNA ? colors.textSecondary : (isComplete(item) ? colors.white : colors.textSecondary)}
                                                            />
                                                        </View>
                                                    </TouchableOpacity>
                                                    )}
                                                     <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginLeft: hideStepIcon ? 0 : 12 }}>
                                                            <View style={{ flex: 1 }}>
                                                                {item.label ? (
                                                                    <Text style={[isFillOnlyChecklist ? styles.stepTitleText : styles.stepTitle, { color: isNA ? colors.textSecondary : colors.text, textDecorationLine: isNA ? 'line-through' : 'none' }]}>
                                                                        {taskNumbers.get(item.id) ? `${taskNumbers.get(item.id)}. ${item.label}` : item.label}
                                                                    </Text>
                                                                ) : null}
                                                                {isNA && (
                                                                     <View style={{ alignSelf: 'flex-start', backgroundColor: colors.border + '33', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 }}>
                                                                         <Text style={{ color: colors.textSecondary, fontSize: 11, fontWeight: '600' }}>Not Applicable</Text>
                                                                     </View>
                                                                 )}
                                                            </View>
                                                            {!isChecklistDisabled && (
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

                                                                             {isAllowNotApplicable && (
                                                                                 <TouchableOpacity
                                                                                     style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}
                                                                                     onPress={() => {
                                                                                         setOpenMenuId(null);
                                                                                         toggleTaskApplicable(item.id);
                                                                                     }}
                                                                                 >
                                                                                     <FontAwesome
                                                                                         name={item.type === 'not_applicable' || item.isNotApplicable ? "check-circle-o" : "ban"}
                                                                                         size={16}
                                                                                         color={item.type === 'not_applicable' || item.isNotApplicable ? colors.primary : colors.textSecondary}
                                                                                     />
                                                                                     <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]} numberOfLines={1}>
                                                                                         {item.type === 'not_applicable' || item.isNotApplicable ? "Applicable" : "Not Applicable"}
                                                                                     </Text>
                                                                                 </TouchableOpacity>
                                                                             )}

                                                                             <TouchableOpacity style={{ paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); deleteTask(item.id); }}>
                                                                                 <FontAwesome name="trash-o" size={16} color={colors.danger} />
                                                                                 <Text style={[FONTS.body, { color: colors.danger }]}>Delete</Text>
                                                                             </TouchableOpacity>
                                                                        </View>
                                                                    )}
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>

                                                    {item.type !== 'none' && (
                                                        isNA ? (
                                                            <View style={{ marginTop: 8, padding: 10, backgroundColor: colors.surfaceHighlight, borderRadius: 8, borderWidth: 1, borderColor: colors.border }}>
                                                                <Text style={[FONTS.caption, { color: colors.textSecondary, fontStyle: 'italic' }]}>
                                                                    This task is marked as Not Applicable. Tap action menu (...) to re-enable.
                                                                </Text>
                                                            </View>
                                                        ) : (
                                                            <>
                                                                {item.type === 'photo' || item.type === 'media' || item.dataType === 'Media' ? (
                                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
                                                                        {(item.options?.length ? item.options : ['']).map((remark, idx) => {
                                                                            const slotValue = Array.isArray(item.value)
                                                                                ? String(item.value[idx] ?? '')
                                                                                : idx === 0
                                                                                    ? String(item.value && item.value !== 0 ? item.value : '')
                                                                                    : '';
                                                                            const demoSource =
                                                                                resolvePmDemoPhotoSource(slotValue) ||
                                                                                (isFillOnlyChecklist && idx < PM_DEMO_PHOTOS.length
                                                                                    ? PM_DEMO_PHOTOS[idx].source
                                                                                    : null);
                                                                            const isDoc = (item.options || []).some((option) => /certificate|document|SLD|diagram/i.test(option));
                                                                            return (
                                                                                <View key={`${item.id}-att-${idx}`} style={{ width: 128 }}>
                                                                                    <TouchableOpacity
                                                                                        onPress={() => {
                                                                                            if (isChecklistDisabled) return;
                                                                                            setActiveMediaId(item.id);
                                                                                            setMediaModalVisible(true);
                                                                                        }}
                                                                                        style={{
                                                                                            width: 128,
                                                                                            height: 96,
                                                                                            borderRadius: 8,
                                                                                            borderWidth: 1,
                                                                                            borderColor: colors.border,
                                                                                            backgroundColor: colors.surfaceHighlight,
                                                                                            overflow: 'hidden',
                                                                                            alignItems: 'center',
                                                                                            justifyContent: 'center',
                                                                                        }}
                                                                                    >
                                                                                        {demoSource ? (
                                                                                            <Image source={demoSource} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
                                                                                        ) : (
                                                                                            <>
                                                                                                <FontAwesome name={isDoc ? 'file-text-o' : 'paperclip'} size={18} color={colors.primary} />
                                                                                                <Text style={[styles.captureButtonText, { color: colors.text, marginTop: 6, fontSize: 11 }]} numberOfLines={2}>
                                                                                                    {slotValue || (isDoc ? 'Add document' : 'Add attachment')}
                                                                                                </Text>
                                                                                            </>
                                                                                        )}
                                                                                    </TouchableOpacity>
                                                                                    <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 6, lineHeight: 16 }]} numberOfLines={2}>
                                                                                        {remark || ((item.options?.length || 0) <= 1 ? 'Remarks' : `Remarks ${idx + 1}`)}
                                                                                    </Text>
                                                                                </View>
                                                                            );
                                                                        })}
                                                                    </ScrollView>
                                                                ) : item.type === 'three_phase_voltage' || item.dataType === '3 phase voltage' ? (
                                                                    <View style={{ gap: 10, marginTop: 4 }}>
                                                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                                                            <View style={{ flex: 1, gap: 4 }}>
                                                                                <Text style={[FONTS.caption, { color: colors.textSecondary }]}>L-N (Line to Neutral)</Text>
                                                                                <TextInput
                                                                                    keyboardType="numeric"
                                                                                    placeholder="e.g. 230V"
                                                                                    placeholderTextColor={colors.textSecondary}
                                                                                    style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                                    value={(typeof item.value === 'object' && item.value !== null ? item.value['L-N'] : '') || ''}
                                                                                    onChangeText={(val) => {
                                                                                        const curr = typeof item.value === 'object' && item.value !== null ? item.value : {};
                                                                                        updateItem(item.id, { ...curr, 'L-N': val });
                                                                                    }}
                                                                                />
                                                                            </View>
                                                                            <View style={{ flex: 1, gap: 4 }}>
                                                                                <Text style={[FONTS.caption, { color: colors.textSecondary }]}>L-E (Line to Earth)</Text>
                                                                                <TextInput
                                                                                    keyboardType="numeric"
                                                                                    placeholder="e.g. 230V"
                                                                                    placeholderTextColor={colors.textSecondary}
                                                                                    style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                                    value={(typeof item.value === 'object' && item.value !== null ? item.value['L-E'] : '') || ''}
                                                                                    onChangeText={(val) => {
                                                                                        const curr = typeof item.value === 'object' && item.value !== null ? item.value : {};
                                                                                        updateItem(item.id, { ...curr, 'L-E': val });
                                                                                    }}
                                                                                />
                                                                            </View>
                                                                        </View>
                                                                        <View style={{ flexDirection: 'row', gap: 10 }}>
                                                                            <View style={{ flex: 1, gap: 4 }}>
                                                                                <Text style={[FONTS.caption, { color: colors.textSecondary }]}>L-L (Line to Line)</Text>
                                                                                <TextInput
                                                                                    keyboardType="numeric"
                                                                                    placeholder="e.g. 400V"
                                                                                    placeholderTextColor={colors.textSecondary}
                                                                                    style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                                    value={(typeof item.value === 'object' && item.value !== null ? item.value['L-L'] : '') || ''}
                                                                                    onChangeText={(val) => {
                                                                                        const curr = typeof item.value === 'object' && item.value !== null ? item.value : {};
                                                                                        updateItem(item.id, { ...curr, 'L-L': val });
                                                                                    }}
                                                                                />
                                                                            </View>
                                                                            <View style={{ flex: 1, gap: 4 }}>
                                                                                <Text style={[FONTS.caption, { color: colors.textSecondary }]}>N-E (Neutral to Earth)</Text>
                                                                                <TextInput
                                                                                    keyboardType="numeric"
                                                                                    placeholder="e.g. 2V"
                                                                                    placeholderTextColor={colors.textSecondary}
                                                                                    style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                                    value={(typeof item.value === 'object' && item.value !== null ? item.value['N-E'] : '') || ''}
                                                                                    onChangeText={(val) => {
                                                                                        const curr = typeof item.value === 'object' && item.value !== null ? item.value : {};
                                                                                        updateItem(item.id, { ...curr, 'N-E': val });
                                                                                    }}
                                                                                />
                                                                            </View>
                                                                        </View>
                                                                    </View>
                                                                ) : item.type === 'email' || item.dataType === 'Email' ? (
                                                                    <TextInput
                                                                        keyboardType="email-address"
                                                                        autoCapitalize="none"
                                                                        placeholder="name@domain.com"
                                                                        placeholderTextColor={colors.textSecondary}
                                                                        style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                        value={String(item.value ?? '')}
                                                                        onChangeText={(value) => updateItem(item.id, value)}
                                                                    />
                                                                ) : item.isReadOnly || item.type === 'textarea' || item.dataType === 'Long text' ? (
                                                                    item.isReadOnly ? (
                                                                        <Text style={[styles.instructionText, isFillOnlyChecklist && styles.instructionTextCompact, { color: colors.textSecondary }]}>
                                                                            {String(item.value ?? item.defaultValue ?? item.label ?? '')}
                                                                        </Text>
                                                                    ) : (
                                                                    <TextInput
                                                                        multiline
                                                                        numberOfLines={3}
                                                                        editable={!isChecklistDisabled}
                                                                        placeholder={'Enter detailed description / remarks...'}
                                                                        placeholderTextColor={colors.textSecondary}
                                                                        style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text, minHeight: 70, textAlignVertical: 'top' }]}
                                                                        value={String(item.value ?? item.defaultValue ?? '')}
                                                                        onChangeText={(value) => updateItem(item.id, value)}
                                                                    />
                                                                    )
                                                                ) : item.type === 'radio' || item.dataType === 'Radio button' || item.type === 'dropdown' || item.dataType === 'Dropdown' ? (
                                                                    <View style={{ gap: isFillOnlyChecklist ? 8 : 12, marginTop: isFillOnlyChecklist ? 2 : 4, flexDirection: (item.options || []).length <= 2 ? 'row' : 'column', flexWrap: 'wrap' }}>
                                                                        {(item.options || ['Option 1', 'Option 2']).map((opt) => {
                                                                            const selected = item.value === opt;
                                                                            return (
                                                                                <TouchableOpacity
                                                                                    key={opt}
                                                                                    disabled={isChecklistDisabled}
                                                                                    onPress={() => updateItem(item.id, opt)}
                                                                                    style={{ flexDirection: 'row', alignItems: 'center', gap: isFillOnlyChecklist ? 6 : 10, paddingVertical: isFillOnlyChecklist ? 0 : 4 }}
                                                                                >
                                                                                    <Ionicons
                                                                                        name={selected ? 'radio-button-on' : 'radio-button-off'}
                                                                                        size={isFillOnlyChecklist ? 18 : 20}
                                                                                        color={selected ? colors.primary : colors.textSecondary}
                                                                                    />
                                                                                    <Text style={[FONTS.body, { color: colors.text, fontSize: isFillOnlyChecklist ? 13 : undefined }]}>{opt}</Text>
                                                                                </TouchableOpacity>
                                                                            );
                                                                        })}
                                                                    </View>
                                                                ) : !item.isReadOnly && (item.type === 'multiselect' || item.type === 'checkbox' || item.dataType === 'Multiple Choice' || item.dataType === 'Checkbox' || item.dataType === 'None' || (item.type as string) === 'None' || (item.dataType && item.dataType.toLowerCase() === 'none')) ? (
                                                                     <View style={{ gap: 6, marginTop: 4 }}>
                                                                         {(item.options && item.options.length > 0 ? item.options : ['Yes', 'No']).map((opt) => {
                                                                             const currentArray = Array.isArray(item.value) ? (item.value as string[]) : (item.value ? [String(item.value)] : []);
                                                                             const selected = currentArray.includes(opt);
                                                                             return (
                                                                                 <TouchableOpacity
                                                                                     key={opt}
                                                                                     disabled={isChecklistDisabled}
                                                                                     onPress={() => {
                                                                                         if (isChecklistDisabled) return;
                                                                                         const isNoneType = item.dataType === 'None' || (item.type as string) === 'None' || (item.dataType && item.dataType.toLowerCase() === 'none');
                                                                                         const nextArray = isNoneType
                                                                                             ? (selected ? [] : [opt])
                                                                                             : (selected ? currentArray.filter(i => i !== opt) : [...currentArray, opt]);
                                                                                         updateItem(item.id, nextArray);
                                                                                     }}
                                                                                     style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
                                                                                 >
                                                                                     <Ionicons
                                                                                         name={selected ? 'checkbox' : 'square-outline'}
                                                                                         size={20}
                                                                                         color={selected ? colors.primary : colors.textSecondary}
                                                                                     />
                                                                                     <Text style={[FONTS.body, { color: colors.text, fontWeight: selected ? '600' : '400' }]}>{opt}</Text>
                                                                                 </TouchableOpacity>
                                                                             );
                                                                         })}
                                                                     </View>
                                                                ) : (item.type === 'text' || item.type === 'number' || item.type === 'date' || item.dataType === 'Short text' || item.dataType === 'Number' || item.dataType === 'Date') ? (
                                                                     <MultiResponseEntryItem
                                                                         item={item}
                                                                         colors={colors}
                                                                         updateItem={updateItem}
                                                                         setItems={setItems}
                                                                         isUnderReview={isChecklistDisabled}
                                                                     />
                                                                ) : (
                                                                    <TextInput
                                                                        keyboardType="default"
                                                                        editable={!isChecklistDisabled}
                                                                        placeholder={getChecklistPlaceholder(item)}
                                                                        placeholderTextColor={colors.textSecondary}
                                                                        style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                                                        value={Array.isArray(item.value) ? item.value.join(', ') : String(item.value ?? '')}
                                                                        onChangeText={(value) => updateItem(item.id, value)}
                                                                    />
                                                                )}
                                                            </>
                                                        )
                                                    )}
                                                </View>
                                            );
                                            };

                                            if (isFillOnlyChecklist) {
                                                return nestedFillTree.map((sectionBlock) => {
                                                    const sectionId = sectionBlock.section.id;
                                                    const isRootSection = sectionId === '__root__';
                                                    const isExpanded = expandedSectionIds.has(sectionId) || isRootSection;

                                                    // Calculate tasks inside this section
                                                    const allTasksInSection = [
                                                        ...sectionBlock.checklists.flatMap((b) => b.tasks),
                                                        ...sectionBlock.looseTasks,
                                                    ].filter(isItemVisible);
                                                    const totalCount = allTasksInSection.length;
                                                    const completedCount = allTasksInSection.filter((t) => isComplete(t) || t.type === 'not_applicable' || t.isNotApplicable).length;
                                                    const progressPct = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                                                    const isAllDone = totalCount > 0 && completedCount === totalCount;

                                                    return (
                                                        <View
                                                            key={sectionId}
                                                            style={[
                                                                styles.formSectionCard,
                                                                {
                                                                    backgroundColor: colors.surface,
                                                                    borderColor: colors.border,
                                                                    shadowColor: colors.shadow,
                                                                },
                                                            ]}
                                                        >
                                                            {/* Section Header */}
                                                            {!isRootSection && (
                                                                <>

                                                                    {/* Header row: plain View so nested touches work correctly */}
                                                                    <View
                                                                        style={[
                                                                            styles.formSectionHeaderTouchable,
                                                                            {
                                                                                backgroundColor: isAllDone ? colors.success + '08' : colors.primary + '08',
                                                                                borderBottomColor: isExpanded ? colors.border : 'transparent',
                                                                                borderBottomWidth: isExpanded ? StyleSheet.hairlineWidth : 0,
                                                                            },
                                                                        ]}
                                                                    >
                                                                        {/* Left: tappable expand area */}
                                                                        <TouchableOpacity
                                                                            activeOpacity={0.7}
                                                                            onPress={() => toggleSectionExpanded(sectionId)}
                                                                            style={styles.formSectionHeaderLeft}
                                                                        >
                                                                            <View style={{ flex: 1 }}>
                                                                                <Text style={[styles.formSectionTitle, { color: isAllDone ? colors.success : colors.text }]} numberOfLines={2}>
                                                                                    {sectionBlock.section.label}
                                                                                </Text>
                                                                            </View>
                                                                        </TouchableOpacity>

                                                                        {/* Right: chevron + kebab — all as a plain View */}
                                                                        <View style={styles.formSectionHeaderRight}>
                                                                            <TouchableOpacity onPress={() => toggleSectionExpanded(sectionId)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 4 }}>
                                                                                <Ionicons
                                                                                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                                                    size={18}
                                                                                    color={colors.textSecondary}
                                                                                />
                                                                            </TouchableOpacity>
                                                                            {!isChecklistDisabled && (
                                                                                <View style={{ position: 'relative', zIndex: openMenuId === sectionBlock.section.id ? 110 : 1 }}>
                                                                                    <TouchableOpacity
                                                                                        onPress={() => setOpenMenuId(openMenuId === sectionBlock.section.id ? null : sectionBlock.section.id)}
                                                                                        style={{ padding: 4 }}
                                                                                        hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
                                                                                    >
                                                                                        <Ionicons name="ellipsis-vertical" size={17} color={colors.textSecondary} />
                                                                                    </TouchableOpacity>
                                                                                    {openMenuId === sectionBlock.section.id && (
                                                                                        <View style={[styles.fieldActionPopover, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                                                        <TouchableOpacity
                                                                                            style={styles.fieldActionPopoverItem}
                                                                                            onPress={() => {
                                                                                                setOpenMenuId(null);
                                                                                                startEditTask(sectionBlock.section);
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesome name="pencil" size={14} color={colors.primary} />
                                                                                            <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]}>Edit Section</Text>
                                                                                        </TouchableOpacity>
                                                                                        <TouchableOpacity
                                                                                            style={styles.fieldActionPopoverItem}
                                                                                            onPress={() => {
                                                                                                setOpenMenuId(null);
                                                                                                deleteTask(sectionBlock.section.id);
                                                                                            }}
                                                                                        >
                                                                                            <FontAwesome name="trash-o" size={14} color={colors.danger} />
                                                                                            <Text style={[FONTS.body, { color: colors.danger, fontSize: 13 }]}>Delete</Text>
                                                                                        </TouchableOpacity>
                                                                                    </View>
                                                                                )}
                                                                            </View>
                                                                            )}
                                                                        </View>
                                                                    </View>
                                                                </>
                                                            )}

                                                            {/* Collapsed summary teaser */}
                                                            {!isExpanded && !isRootSection && (
                                                                <TouchableOpacity
                                                                    activeOpacity={0.7}
                                                                    onPress={() => toggleSectionExpanded(sectionId)}
                                                                    style={[styles.formSectionSummaryRow, { backgroundColor: colors.surfaceHighlight + '40' }]}
                                                                >
                                                                    <Text style={[FONTS.caption, { color: colors.textSecondary }]}>
                                                                        Tap to view tasks
                                                                    </Text>
                                                                    <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600' }]}>
                                                                        Tap to view
                                                                    </Text>
                                                                </TouchableOpacity>
                                                            )}

                                                            {/* Expanded section contents */}
                                                            {isExpanded && (
                                                                <View>
                                                                    {sectionBlock.checklists.map((block) => {
                                                                        const isRootChecklist = block.checklist.id === '__root__';
                                                                        const num = taskNumbers.get(block.checklist.id);
                                                                        const blockTasks = block.tasks.filter(isItemVisible);
                                                                        const blockCompleted = blockTasks.filter(
                                                                            (t) => isComplete(t) || t.type === 'not_applicable' || t.isNotApplicable
                                                                        ).length;

                                                                        const isChecklistOpen = isRootChecklist || expandedChecklistIds.has(block.checklist.id);
                                                                        return (
                                                                            <View key={block.checklist.id}>
                                                                                {!isRootChecklist && (
                                                                                    <View
                                                                                        style={[
                                                                                            styles.formGroupBanner,
                                                                                            {
                                                                                                backgroundColor: colors.surfaceHighlight + '75',
                                                                                            },
                                                                                        ]}
                                                                                    >
                                                                                        <TouchableOpacity
                                                                                            activeOpacity={0.7}
                                                                                            onPress={() => toggleChecklistExpanded(block.checklist.id)}
                                                                                            style={styles.formGroupBannerLeft}
                                                                                        >
                                                                                            <View style={{ flex: 1 }}>
                                                                                                <Text style={[styles.formGroupTitle, { color: colors.text }]} numberOfLines={2}>
                                                                                                    {block.checklist.label}
                                                                                                </Text>
                                                                                            </View>
                                                                                        </TouchableOpacity>
                                                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                                                            <TouchableOpacity
                                                                                                onPress={() => toggleChecklistExpanded(block.checklist.id)}
                                                                                                hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
                                                                                            >
                                                                                                <Ionicons
                                                                                                    name={isChecklistOpen ? 'chevron-up' : 'chevron-down'}
                                                                                                    size={16}
                                                                                                    color={colors.textSecondary}
                                                                                                />
                                                                                            </TouchableOpacity>
                                                                                            {!isChecklistDisabled && (
                                                                                                <View style={{ position: 'relative', zIndex: openMenuId === block.checklist.id ? 110 : 1 }}>
                                                                                                    <TouchableOpacity
                                                                                                        onPress={() => setOpenMenuId(openMenuId === block.checklist.id ? null : block.checklist.id)}
                                                                                                        style={{ padding: 4 }}
                                                                                                    >
                                                                                                        <Ionicons name="ellipsis-vertical" size={16} color={colors.textSecondary} />
                                                                                                    </TouchableOpacity>
                                                                                                    {openMenuId === block.checklist.id && (
                                                                                                        <View style={[styles.fieldActionPopover, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                                                                            <TouchableOpacity
                                                                                                                style={styles.fieldActionPopoverItem}
                                                                                                                onPress={() => {
                                                                                                                    setOpenMenuId(null);
                                                                                                                    startEditTask(block.checklist);
                                                                                                                }}
                                                                                                            >
                                                                                                                <FontAwesome name="pencil" size={14} color={colors.primary} />
                                                                                                                <Text style={[FONTS.body, { color: colors.text, fontSize: 13 }]}>Edit</Text>
                                                                                                            </TouchableOpacity>
                                                                                                            <TouchableOpacity
                                                                                                                style={styles.fieldActionPopoverItem}
                                                                                                                onPress={() => {
                                                                                                                    setOpenMenuId(null);
                                                                                                                    deleteTask(block.checklist.id);
                                                                                                                }}
                                                                                                            >
                                                                                                                <FontAwesome name="trash-o" size={14} color={colors.danger} />
                                                                                                                <Text style={[FONTS.body, { color: colors.danger, fontSize: 13 }]}>Delete</Text>
                                                                                                            </TouchableOpacity>
                                                                                                        </View>
                                                                                                    )}
                                                                                                </View>
                                                                                            )}
                                                                                        </View>
                                                                                    </View>
                                                                                )}
                                                                                {isChecklistOpen && block.tasks.map((taskItem) => renderTaskCard(taskItem))}
                                                                            </View>
                                                                        );
                                                                    })}
                                                                    {sectionBlock.looseTasks.map((taskItem) => renderTaskCard(taskItem))}
                                                                </View>
                                                            )}
                                                        </View>
                                                    );
                                                });
                                            }

                                            let currentSectionId: string | null = null;
                                            return items.map((item) => {
                                            // Section header — render as a collapsible divider for fill-only PM/service
                                            if (item.type === 'section_header') {
                                                currentSectionId = item.id;
                                                const isExpanded = !isFillOnlyChecklist || expandedSectionIds.has(item.id);
                                                const taskCount = sectionTaskCounts.get(item.id) || 0;
                                                return (
                                                     <View
                                                         key={item.id}
                                                         style={[styles.sectionHeader, { borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: openMenuId === item.id ? 100 : 1 }]}
                                                     >
                                                        <TouchableOpacity
                                                            activeOpacity={isFillOnlyChecklist ? 0.7 : 1}
                                                            onPress={() => {
                                                                if (isFillOnlyChecklist) toggleSectionExpanded(item.id);
                                                            }}
                                                            style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                                        >
                                                            <Text style={[styles.sectionHeaderText, { color: colors.primary, flex: 1, paddingRight: 8 }]} numberOfLines={2}>
                                                                {item.label}
                                                            </Text>
                                                            {isFillOnlyChecklist && (
                                                                <View style={styles.sectionHeaderMeta}>

                                                                    <Ionicons
                                                                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                                                                        size={18}
                                                                        color={colors.textSecondary}
                                                                    />
                                                                </View>
                                                            )}
                                                        </TouchableOpacity>

                                                        {!isChecklistDisabled && (
                                                            <View style={{ position: 'relative', zIndex: openMenuId === item.id ? 110 : 1, marginLeft: 8 }}>
                                                                <TouchableOpacity onPress={() => setOpenMenuId(openMenuId === item.id ? null : item.id)} style={{ padding: 4 }}>
                                                                    <Ionicons name="ellipsis-vertical" size={20} color={colors.primary} />
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
                                                                        width: 140,
                                                                        shadowColor: '#000',
                                                                        shadowOffset: { width: 0, height: 2 },
                                                                        shadowOpacity: 0.15,
                                                                        shadowRadius: 4,
                                                                        elevation: 4,
                                                                        zIndex: 120
                                                                    }}>
                                                                        <TouchableOpacity style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); startEditTask(item); }}>
                                                                            <FontAwesome name="pencil" size={16} color={colors.primary} />
                                                                            <Text style={[FONTS.body, { color: colors.text }]}>Edit</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); deleteTask(item.id); }}>
                                                                            <FontAwesome name="trash-o" size={16} color={colors.danger} />
                                                                            <Text style={[FONTS.body, { color: colors.danger }]}>Delete</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            }

                                            if (isFillOnlyChecklist && currentSectionId && !expandedSectionIds.has(currentSectionId)) {
                                                return null;
                                            }

                                            if (item.type === 'checklist_header') {
                                                const num = taskNumbers.get(item.id);
                                                const nestCount = checklistTaskCounts.get(item.id) || 0;
                                                return (
                                                    <View
                                                        key={item.id}
                                                        style={[styles.checklistHeader, { borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: openMenuId === item.id ? 100 : 1 }]}
                                                    >
                                                        <Text style={[styles.checklistHeaderText, { color: colors.text, flex: 1 }]} numberOfLines={3}>
                                                            {num ? `${num}. ` : ''}{item.label}
                                                            {nestCount ? `  (${nestCount} ${nestCount === 1 ? 'task' : 'tasks'})` : ''}
                                                        </Text>

                                                        {!isChecklistDisabled && (
                                                            <View style={{ position: 'relative', zIndex: openMenuId === item.id ? 110 : 1, marginLeft: 8 }}>
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
                                                                        width: 140,
                                                                        shadowColor: '#000',
                                                                        shadowOffset: { width: 0, height: 2 },
                                                                        shadowOpacity: 0.15,
                                                                        shadowRadius: 4,
                                                                        elevation: 4,
                                                                        zIndex: 120
                                                                    }}>
                                                                        <TouchableOpacity style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); startEditTask(item); }}>
                                                                            <FontAwesome name="pencil" size={16} color={colors.primary} />
                                                                            <Text style={[FONTS.body, { color: colors.text }]}>Edit</Text>
                                                                        </TouchableOpacity>
                                                                        <TouchableOpacity style={{ paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 8 }} onPress={() => { setOpenMenuId(null); deleteTask(item.id); }}>
                                                                            <FontAwesome name="trash-o" size={16} color={colors.danger} />
                                                                            <Text style={[FONTS.body, { color: colors.danger }]}>Delete</Text>
                                                                        </TouchableOpacity>
                                                                    </View>
                                                                )}
                                                            </View>
                                                        )}
                                                    </View>
                                                );
                                            }

                                            return renderTaskCard(item);
                                        });
                                        })()}
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

                            {!isOffSite ? (
                            <TouchableOpacity style={[styles.captureButton, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, marginTop: 16 }]}>
                                <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
                                <View style={{ alignItems: 'flex-start' }}>
                                    <Text style={[styles.captureButtonText, { color: colors.text }]}>Upload New Attachment</Text>
                                    <Text style={[styles.stepMeta, { color: colors.textSecondary, fontSize: 12, marginTop: 2 }]}>Max-125mb size limit</Text>
                                </View>
                            </TouchableOpacity>
                            ) : null}
                        </>
                    ) : null}
                </ScrollView>

                {activeTab !== 'Activities' && (
                    <View
                        style={[
                            styles.footer,
                            {
                                backgroundColor: colors.surface,
                                borderTopColor: colors.border,
                                paddingBottom: Math.max(insets.bottom, 16),
                            },
                        ]}
                    >
                        <TouchableOpacity
                            onPress={handleForwardWork}
                            style={[
                                styles.footerButton,
                                {
                                    backgroundColor: colors.surfaceHighlight,
                                    borderColor: colors.border,
                                },
                            ]}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="arrow-redo-outline" size={18} color={colors.text} />
                            <Text style={[styles.footerButtonText, { color: colors.text }]}>Forward</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleCompleteAction}
                            style={[
                                styles.footerButton,
                                {
                                    backgroundColor: colors.primary,
                                    borderColor: colors.primary,
                                },
                            ]}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="checkmark-circle-outline" size={18} color={colors.white} />
                            <Text style={[styles.footerPrimaryText, { color: colors.white }]}>
                                Mark as Complete
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {activeTab === 'Activities' && !isOffSite && (
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

                {activeTab === 'Tasks' && !isChecklistDisabled && (
                    <TouchableOpacity
                        style={[
                            styles.fab, 
                            { 
                                backgroundColor: colors.primary, 
                                shadowColor: colors.shadow || '#000', 
                                zIndex: 100,
                                bottom: Math.max(insets.bottom, 16) + 74,
                            }
                        ]}
                        activeOpacity={0.85}
                        onPress={() => {
                            setNewTaskLabel('');
                            setNewTaskSectionId('');
                            setNewTaskChecklistId('');
                            setNewDataType('Short text');
                            setNewTaskOptions([]);
                            setAddTaskModalVisible(true);
                        }}
                    >
                        <Ionicons name="add" size={30} color={colors.white} />
                    </TouchableOpacity>
                )}
            </SafeAreaView>

                <Modal visible={mediaModalVisible} transparent animationType="fade" statusBarTranslucent>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMediaModalVisible(false)} />
                        <View style={[styles.bottomSheetInner, { backgroundColor: colors.background, paddingBottom: Math.max(insets.bottom + 20, 36), width: '100%' }]}>
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
                            {isOffSite ? (
                                <View style={{ paddingVertical: 16, paddingHorizontal: 16 }}>
                                    <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 16, marginBottom: 6 }]}>View only</Text>
                                    <Text style={[{ color: colors.textSecondary, ...FONTS.body, fontSize: 14 }]}>
                                        Work actions are disabled until you are near this location.
                                    </Text>
                                </View>
                            ) : isAssignedPending ? (
                                <>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleAcceptAssignedWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Accept</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleForwardWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="arrow-redo-outline" size={26} color={colors.primary} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Forward</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleRejectWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                        <Ionicons name="close-circle-outline" size={26} color={colors.danger} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            ) : isUnderReview ? (
                                <>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleApproveWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Approve</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleForwardWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="arrow-redo-outline" size={26} color={colors.primary} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Forward</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleRejectWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                        <Ionicons name="close-circle-outline" size={26} color={colors.danger} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Reject</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                <>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleCompleteAction(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16, borderBottomColor: colors.border, borderBottomWidth: 1 }]}>
                                        <Ionicons name="checkmark-circle-outline" size={26} color={colors.success} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Mark as Complete</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => { setActionModalVisible(false); handleForwardWork(); }} style={[{ flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16 }]}>
                                        <Ionicons name="arrow-redo-outline" size={26} color={colors.primary} style={{ marginRight: 14 }} />
                                        <Text style={[{ color: colors.text, ...FONTS.bodyStrong, fontSize: 18 }]}>Forward</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                </Modal>
                <Modal visible={mandatoryErrorModalVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setMandatoryErrorModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setMandatoryErrorModalVisible(false)} />
                        <View
                            style={{
                                width: '100%',
                                backgroundColor: colors.surface,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                paddingBottom: Math.max(insets.bottom + 16, 24),
                                maxHeight: '85%',
                                gap: 14,
                            }}
                        >
                            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4 }} />
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={[styles.warningIconCircle, { backgroundColor: colors.danger + '18', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginBottom: 0 }]}>
                                    <Ionicons name="alert-circle" size={28} color={colors.danger} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.confirmTitle, { color: colors.danger, fontSize: 18, marginBottom: 2, textAlign: 'left' }]}>
                                        Cannot Mark as Complete
                                    </Text>
                                    <Text style={[FONTS.caption, { color: colors.textSecondary }]}>
                                        Mandatory task(s) incomplete
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => setMandatoryErrorModalVisible(false)} style={{ padding: 4 }}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />

                            <Text style={[FONTS.body, { color: colors.text, lineHeight: 20 }]}>
                                Please complete all required tasks below before marking as complete. Tap any task to navigate directly to it:
                            </Text>

                            <ScrollView style={{ maxHeight: 260, marginVertical: 4 }} showsVerticalScrollIndicator={true}>
                                {incompleteMandatoryTasks.map((t, idx) => {
                                    const loc = getTaskLocationInfo(t.id);
                                    const locText = [loc.section, loc.checklist].filter(Boolean).join(' › ');
                                    const taskNum = taskNumbers.get(t.id);

                                    return (
                                        <TouchableOpacity
                                            key={t.id || idx}
                                            activeOpacity={0.7}
                                            onPress={() => navigateToTask(t.id)}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                gap: 12,
                                                backgroundColor: colors.surfaceHighlight,
                                                padding: 12,
                                                borderRadius: 10,
                                                marginBottom: 8,
                                                borderWidth: 1,
                                                borderColor: colors.danger + '35',
                                            }}
                                        >
                                            <View
                                                style={{
                                                    width: 32,
                                                    height: 32,
                                                    borderRadius: 16,
                                                    backgroundColor: colors.danger + '18',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            >
                                                <Ionicons name="alert-circle" size={20} color={colors.danger} />
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                {locText ? (
                                                    <Text
                                                        style={[FONTS.caption, { color: colors.textSecondary, marginBottom: 2, fontSize: 11 }]}
                                                        numberOfLines={1}
                                                    >
                                                        {locText}
                                                    </Text>
                                                ) : null}
                                                <Text style={[FONTS.bodyStrong, { color: colors.text, fontSize: 14 }]} numberOfLines={2}>
                                                    {taskNum ? `${taskNum}. ` : ''}{t.label || (t as any).title || 'Mandatory Task'}
                                                </Text>
                                                <Text style={[FONTS.caption, { color: colors.danger, marginTop: 2, fontSize: 11 }]}>
                                                    * Required field incomplete — tap to go to task
                                                </Text>
                                            </View>
                                            <View
                                                style={{
                                                    backgroundColor: colors.primary + '15',
                                                    paddingHorizontal: 8,
                                                    paddingVertical: 5,
                                                    borderRadius: 6,
                                                    flexDirection: 'row',
                                                    alignItems: 'center',
                                                    gap: 3,
                                                }}
                                            >
                                                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '600' }}>Go</Text>
                                                <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                                            </View>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>

                            <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 8 }]}>
                                {isAllowNotApplicable ? (
                                    <>
                                        Please complete all required tasks or mark them as <Text style={{ fontWeight: '700', color: colors.text }}>Not Applicable (N/A)</Text> before marking as complete.
                                    </>
                                ) : (
                                    'Please complete all required tasks before marking as complete.'
                                )}
                            </Text>

                            <TouchableOpacity
                                style={[styles.confirmBtn, { backgroundColor: colors.primary, width: '100%', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }]}
                                onPress={() => setMandatoryErrorModalVisible(false)}
                            >
                                <Text style={[styles.confirmBtnText, { color: colors.white, fontSize: 16, fontWeight: '700' }]}>Got it, complete tasks</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>

                <Modal visible={confirmationModalVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setConfirmationModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setConfirmationModalVisible(false)} />
                        <View
                            style={{
                                width: '100%',
                                backgroundColor: colors.surface,
                                borderTopLeftRadius: 24,
                                borderTopRightRadius: 24,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                paddingHorizontal: 20,
                                paddingTop: 20,
                                paddingBottom: Math.max(insets.bottom + 16, 24),
                                gap: 16,
                            }}
                        >
                            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4 }} />
                            <View style={{ alignItems: 'center', gap: 10 }}>
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
                            </View>

                            <View style={[styles.confirmActions, { paddingTop: 8 }]}>
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

                <Modal visible={completionModalVisible} transparent animationType="slide" statusBarTranslucent>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setCompletionModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
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

                <Modal visible={approveModalVisible} transparent animationType="slide" statusBarTranslucent>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setApproveModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
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

                <Modal visible={rejectModalVisible} transparent animationType="slide" statusBarTranslucent>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setRejectModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
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

                <Modal visible={forwardModalVisible} transparent animationType="slide" statusBarTranslucent onRequestClose={() => setForwardModalVisible(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setForwardModalVisible(false)} />
                        <View style={[styles.modalSheet, { backgroundColor: colors.surface, paddingBottom: Math.max(insets.bottom + 16, 24) }]}>
                            <View style={styles.modalHeader}>
                                <View>
                                    <Text style={[styles.modalTitle, { color: colors.text }]}>Forward Work</Text>
                                    <Text style={[styles.modalSub, { color: colors.textSecondary, marginTop: 2 }]}>Reassign or forward this work order</Text>
                                </View>
                                <TouchableOpacity onPress={() => setForwardModalVisible(false)} style={styles.modalClose}>
                                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                <View style={{ gap: 16, paddingBottom: 24 }}>
                                    <View style={{ gap: 8 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            <Text style={{ color: colors.danger }}>* </Text>Forward To
                                        </Text>
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                            {getSelectorOptions('assignees').options.map((option) => {
                                                const isSelected = forwardAssignee === option.value;
                                                return (
                                                    <TouchableOpacity
                                                        key={option.key}
                                                        onPress={() => setForwardAssignee(option.value)}
                                                        style={[
                                                            {
                                                                paddingVertical: 10,
                                                                paddingHorizontal: 16,
                                                                borderRadius: 20,
                                                                borderWidth: 1,
                                                                borderColor: isSelected ? colors.primary : colors.border,
                                                                backgroundColor: isSelected ? colors.primary + '18' : colors.surfaceHighlight,
                                                                flexDirection: 'row',
                                                                alignItems: 'center',
                                                                gap: 6,
                                                            }
                                                        ]}
                                                    >
                                                        {isSelected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                                                        <Text style={{ ...FONTS.body, color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '500' }}>
                                                            {option.label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </View>

                                    <View style={{ gap: 4 }}>
                                        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
                                            Instructions / Reason (Optional)
                                        </Text>
                                        <TextInput
                                            value={forwardComments}
                                            onChangeText={setForwardComments}
                                            style={[
                                                styles.commentInput, 
                                                getInputShellStyle(colors), 
                                                { 
                                                    color: colors.text, 
                                                    minHeight: 90, 
                                                    textAlignVertical: 'top',
                                                    paddingTop: 12,
                                                }
                                            ]}
                                            placeholder="Add notes for the assigned technician..."
                                            placeholderTextColor={colors.textSecondary}
                                            multiline
                                        />
                                    </View>
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooterRow}>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border, borderWidth: 1 }]}
                                    onPress={() => setForwardModalVisible(false)}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.text }]}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.footerBtn, { backgroundColor: colors.primary }]}
                                    onPress={handleConfirmForward}
                                >
                                    <Text style={[styles.footerBtnText, { color: colors.white }]}>Forward Work</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                <Modal
                    visible={editTaskModalVisible}
                    transparent
                    animationType="slide"
                    statusBarTranslucent
                    onRequestClose={() => setEditTaskModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setEditTaskModalVisible(false)} />
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={{ width: '100%', justifyContent: 'flex-end' }}
                        >
                            <View
                                style={{
                                    width: '100%',
                                    backgroundColor: colors.surface,
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: Math.max(insets.bottom + 16, 24),
                                    maxHeight: 620,
                                    gap: 16,
                                }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={[FONTS.h3, { color: colors.text }]}>Edit Task</Text>
                                    <TouchableOpacity onPress={() => setEditTaskModalVisible(false)} style={{ padding: 4 }}>
                                        <Ionicons name="close" size={24} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView contentContainerStyle={{ gap: 14, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                                    <View>
                                        <Text style={[FONTS.label, { color: colors.textSecondary, marginBottom: 6 }]}>Task Title / Question</Text>
                                        <TextInput
                                            style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                            value={editTaskLabel}
                                            onChangeText={setEditTaskLabel}
                                            placeholder="Enter task description"
                                            placeholderTextColor={colors.textSecondary}
                                        />
                                    </View>

                                    <View style={{ zIndex: 100 }}>
                                        <PopoverDropdown
                                            label="Data Type"
                                            placeholder="Select data type"
                                            options={getSelectorOptions('dataType').options}
                                            value={editDataType}
                                            onSelect={(val) => setEditDataType(val as any)}
                                            placement="top"
                                        />
                                    </View>

                                    {['Multiple Choice', 'Radio button', 'Dropdown', 'Checkbox'].includes(editDataType) && (
                                        <View style={{ gap: 8 }}>
                                            <Text style={[FONTS.label, { color: colors.textSecondary }]}>Options</Text>
                                            {editTaskOptions.map((option, idx) => (
                                                <View key={`${option}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceHighlight, padding: 12, borderRadius: 10 }}>
                                                    <Text style={[FONTS.body, { color: colors.text }]}>{option}</Text>
                                                    <TouchableOpacity onPress={() => setEditTaskOptions(editTaskOptions.filter((_, i) => i !== idx))}>
                                                        <Ionicons name="close-circle" size={20} color={colors.danger} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TextInput
                                                    style={[styles.inputSingle, getInputShellStyle(colors), { flex: 1, color: colors.text }]}
                                                    placeholder="Add option..."
                                                    placeholderTextColor={colors.textSecondary}
                                                    value={newEditOption}
                                                    onChangeText={setNewEditOption}
                                                    onSubmitEditing={() => {
                                                        if (newEditOption.trim() && !editTaskOptions.includes(newEditOption.trim())) {
                                                            setEditTaskOptions([...editTaskOptions, newEditOption.trim()]);
                                                            setNewEditOption('');
                                                        }
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (newEditOption.trim() && !editTaskOptions.includes(newEditOption.trim())) {
                                                            setEditTaskOptions([...editTaskOptions, newEditOption.trim()]);
                                                            setNewEditOption('');
                                                        }
                                                    }}
                                                    style={{ backgroundColor: colors.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <Ionicons name="add" size={24} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                <View style={{ flexDirection: 'row', gap: 12, paddingTop: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setEditTaskModalVisible(false)}
                                        style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={[FONTS.bodyStrong, { color: colors.text }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={saveEditTask}
                                        style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={[FONTS.bodyStrong, { color: '#FFF' }]}>Save Changes</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>

                {/* Add New Task Modal (BottomSheet) */}
                <Modal
                    visible={addTaskModalVisible}
                    transparent
                    animationType="slide"
                    statusBarTranslucent
                    onRequestClose={() => setAddTaskModalVisible(false)}
                >
                    <View style={styles.modalOverlay}>
                        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setAddTaskModalVisible(false)} />
                        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <View
                                style={{
                                    width: '100%',
                                    backgroundColor: colors.surface,
                                    borderTopLeftRadius: 24,
                                    borderTopRightRadius: 24,
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                    paddingHorizontal: 20,
                                    paddingTop: 20,
                                    paddingBottom: Math.max(insets.bottom + 16, 24),
                                    maxHeight: 650,
                                    gap: 16,
                                }}
                            >
                                <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 4 }} />
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Text style={[FONTS.h3, { color: colors.text }]}>Add New Task / Step</Text>
                                    <TouchableOpacity onPress={() => setAddTaskModalVisible(false)} style={{ padding: 4 }}>
                                        <Ionicons name="close" size={24} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>

                                <ScrollView style={{ flexGrow: 0 }} contentContainerStyle={{ gap: 16, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
                                    <View style={{ gap: 6 }}>
                                        <Text style={[FONTS.label, { color: colors.textSecondary }]}>Task Title / Question</Text>
                                        <TextInput
                                            style={[styles.inputSingle, getInputShellStyle(colors), { color: colors.text }]}
                                            placeholder="Enter task title or question..."
                                            placeholderTextColor={colors.textSecondary}
                                            value={newTaskLabel}
                                            onChangeText={setNewTaskLabel}
                                        />
                                    </View>

                                    <View style={{ gap: 6, zIndex: 1200 }}>
                                        <PopoverDropdown
                                            label="Section (Optional)"
                                            placeholder="Select section (optional)..."
                                            options={sectionDropdownOptions}
                                            value={newTaskSectionId}
                                            onSelect={handleSelectNewTaskSection}
                                            placement="bottom"
                                        />
                                    </View>

                                    <View style={{ gap: 6, zIndex: 1100 }}>
                                        <PopoverDropdown
                                            label="Checklist (Optional)"
                                            placeholder="Select checklist (optional)..."
                                            options={checklistDropdownOptions}
                                            value={newTaskChecklistId}
                                            onSelect={handleSelectNewTaskChecklist}
                                            placement="bottom"
                                        />
                                    </View>

                                    <View style={{ gap: 6, zIndex: 1000 }}>
                                        <PopoverDropdown
                                            label="Data Type"
                                            placeholder="Select data type..."
                                            options={DATA_TYPES.map(dt => ({ label: dt, value: dt }))}
                                            value={newDataType}
                                            onSelect={(val) => setNewDataType(val as any)}
                                            placement="top"
                                        />
                                    </View>

                                    {['Multiple Choice', 'Radio button', 'Dropdown', 'Checkbox'].includes(newDataType) && (
                                        <View style={{ gap: 8 }}>
                                            <Text style={[FONTS.label, { color: colors.textSecondary }]}>Options</Text>
                                            {newTaskOptions.map((option, idx) => (
                                                <View key={`${option}-${idx}`} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surfaceHighlight, padding: 12, borderRadius: 10 }}>
                                                    <Text style={[FONTS.body, { color: colors.text }]}>{option}</Text>
                                                    <TouchableOpacity onPress={() => setNewTaskOptions(newTaskOptions.filter((_, i) => i !== idx))}>
                                                        <Ionicons name="close-circle" size={20} color={colors.danger} />
                                                    </TouchableOpacity>
                                                </View>
                                            ))}
                                            <View style={{ flexDirection: 'row', gap: 8 }}>
                                                <TextInput
                                                    style={[styles.inputSingle, getInputShellStyle(colors), { flex: 1, color: colors.text }]}
                                                    placeholder="Add option..."
                                                    placeholderTextColor={colors.textSecondary}
                                                    value={addNewTaskOptionInput}
                                                    onChangeText={setAddNewTaskOptionInput}
                                                    onSubmitEditing={() => {
                                                        if (addNewTaskOptionInput.trim() && !newTaskOptions.includes(addNewTaskOptionInput.trim())) {
                                                            setNewTaskOptions([...newTaskOptions, addNewTaskOptionInput.trim()]);
                                                            setAddNewTaskOptionInput('');
                                                        }
                                                    }}
                                                />
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        if (addNewTaskOptionInput.trim() && !newTaskOptions.includes(addNewTaskOptionInput.trim())) {
                                                            setNewTaskOptions([...newTaskOptions, addNewTaskOptionInput.trim()]);
                                                            setAddNewTaskOptionInput('');
                                                        }
                                                    }}
                                                    style={{ backgroundColor: colors.primary, paddingHorizontal: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <Ionicons name="add" size={24} color="#FFF" />
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    )}
                                </ScrollView>

                                <View style={{ flexDirection: 'row', gap: 12, paddingTop: 8 }}>
                                    <TouchableOpacity
                                        onPress={() => setAddTaskModalVisible(false)}
                                        style={{ flex: 1, height: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={[FONTS.bodyStrong, { color: colors.text }]}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={handleAddNewTask}
                                        style={{ flex: 1, height: 48, borderRadius: 12, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                    >
                                        <Text style={[FONTS.bodyStrong, { color: '#FFF' }]}>Add Task</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>

                {/* Work Details Info Modal */}
                <Modal
                    visible={workInfoModalVisible}
                    transparent
                    animationType="slide"
                    statusBarTranslucent
                    onRequestClose={() => {
                        setIsEditingDetails(false);
                        setWorkInfoModalVisible(false);
                    }}
                >
                    <View style={styles.infoModalOverlay}>
                        <TouchableOpacity
                            style={StyleSheet.absoluteFill}
                            activeOpacity={1}
                            onPress={() => {
                                setIsEditingDetails(false);
                                setWorkInfoModalVisible(false);
                            }}
                        />
                        <KeyboardAvoidingView
                            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                            style={{ width: '100%', justifyContent: 'flex-end' }}
                        >
                            <View
                                style={[
                                    styles.infoModalContent,
                                    {
                                        backgroundColor: colors.surface,
                                        paddingBottom: Math.max(insets.bottom + 16, 24),
                                    }
                                ]}
                            >
                                <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 6 }} />
                                <View style={[styles.infoModalHeader, { borderBottomColor: colors.border }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                        <View style={[styles.infoModalHeaderIcon, { backgroundColor: colors.primary + '15' }]}>
                                            <Ionicons name="information-circle" size={22} color={colors.primary} />
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text numberOfLines={1} style={[FONTS.h3, { color: colors.text }]}>
                                                {isEditingDetails ? 'Edit Work Details' : 'Work Details'}
                                            </Text>
                                            <Text style={[FONTS.caption, { color: colors.textSecondary }]}>
                                                {workOrder.id} • {workOrder.projectId}
                                            </Text>
                                        </View>
                                    </View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        {!isOffSite && !isEditingDetails && (
                                            <TouchableOpacity
                                                onPress={() => setIsEditingDetails(true)}
                                                style={[styles.infoModalBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                                accessibilityLabel="Edit work details"
                                            >
                                                <Ionicons name="pencil" size={15} color={colors.primary} />
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity
                                            onPress={() => {
                                                setIsEditingDetails(false);
                                                setWorkInfoModalVisible(false);
                                            }}
                                            style={[styles.infoModalBtn, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}
                                            accessibilityLabel="Close"
                                        >
                                            <Ionicons name="close" size={18} color={colors.text} />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <ScrollView
                                    style={{ maxHeight: 540 }}
                                    contentContainerStyle={{ gap: 14, paddingBottom: 28 }}
                                    showsVerticalScrollIndicator={true}
                                >
                                    {isEditingDetails ? (
                                        <View style={{ gap: 14, zIndex: 1000 }}>
                                            {/* Approvers Dropdowns */}
                                            <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Approvals</Text>
                                            <View style={{ flexDirection: 'row', gap: 10, zIndex: 1010 }}>
                                                <View style={{ flex: 1, zIndex: 1010 }}>
                                                    <PopoverDropdown
                                                        label="Primary Approver"
                                                        placeholder="Select primary approver..."
                                                        options={getSelectorOptions('assignees').options}
                                                        value={editedPrimaryApprover}
                                                        onSelect={(val) => setEditedPrimaryApprover(val as string)}
                                                        isMulti={false}
                                                    />
                                                </View>
                                                <View style={{ flex: 1, zIndex: 1009 }}>
                                                    <PopoverDropdown
                                                        label="Secondary Approver"
                                                        placeholder="Select secondary approver..."
                                                        options={getSelectorOptions('assignees').options}
                                                        value={editedSecondaryApprover}
                                                        onSelect={(val) => setEditedSecondaryApprover(val as string)}
                                                        isMulti={false}
                                                    />
                                                </View>
                                            </View>

                                            {/* Lead & Assignees Dropdowns */}
                                            <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Assignees & Lead</Text>
                                            <View style={{ flexDirection: 'row', gap: 10, zIndex: 1000 }}>
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

                                            {/* Description Input */}
                                            <View style={{ gap: 6 }}>
                                                <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Description</Text>
                                                <TextInput
                                                    style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 10, minHeight: 70, textAlignVertical: 'top' }, FONTS.body]}
                                                    value={editedNotes}
                                                    onChangeText={setEditedNotes}
                                                    multiline
                                                    placeholder="Enter work description..."
                                                    placeholderTextColor={colors.textSecondary}
                                                />
                                            </View>

                                            {/* Date Inputs */}
                                            <View style={{ gap: 6 }}>
                                                <Text style={[styles.heroSubLabel, { color: colors.textSecondary }]}>Target Dates (YYYY-MM-DD)</Text>
                                                <View style={{ flexDirection: 'row', gap: 10 }}>
                                                    <View style={{ flex: 1, gap: 4 }}>
                                                        <Text style={[FONTS.caption, { color: colors.textSecondary }]}>Start Date</Text>
                                                        <TextInput
                                                            style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }, FONTS.body]}
                                                            value={editedStartTime}
                                                            onChangeText={setEditedStartTime}
                                                            placeholder="YYYY-MM-DD"
                                                            placeholderTextColor={colors.textSecondary}
                                                        />
                                                    </View>
                                                    <View style={{ flex: 1, gap: 4 }}>
                                                        <Text style={[FONTS.caption, { color: colors.textSecondary }]}>End Date</Text>
                                                        <TextInput
                                                            style={[{ color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 }, FONTS.body]}
                                                            value={editedEndTime}
                                                            onChangeText={setEditedEndTime}
                                                            placeholder="YYYY-MM-DD"
                                                            placeholderTextColor={colors.textSecondary}
                                                        />
                                                    </View>
                                                </View>
                                            </View>

                                            {/* Save & Cancel Buttons */}
                                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                                                <TouchableOpacity
                                                    onPress={() => setIsEditingDetails(false)}
                                                    style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <Text style={[FONTS.bodyStrong, { color: colors.text }]}>Cancel</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity
                                                    onPress={handleSaveDetails}
                                                    style={{ flex: 1, height: 44, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center' }}
                                                >
                                                    <Text style={[FONTS.bodyStrong, { color: '#FFF' }]}>Save Changes</Text>
                                                </TouchableOpacity>
                                            </View>
                                        </View>
                                    ) : (
                                        <>
                                            {/* 1. Station & Charge Points (Top) */}
                                            <View style={[styles.infoSectionCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                <Text style={[styles.infoSectionTitle, { color: colors.text }]}>Station & Assets</Text>
                                                <View style={styles.infoRow}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Station Name</Text>
                                                    <Text style={[styles.infoValue, { color: colors.text, fontWeight: '700' }]}>{workOrder.siteName}</Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Address</Text>
                                                    <View style={{ flex: 1, alignItems: 'flex-end', gap: 4 }}>
                                                        <Text style={[styles.infoValue, { color: colors.text, textAlign: 'right' }]}>{workOrder.address}</Text>
                                                        <TouchableOpacity
                                                            onPress={() => {
                                                                const lat = workOrder.latitude;
                                                                const lon = workOrder.longitude;
                                                                if (!lat || !lon) return;
                                                                const url = Platform.select({
                                                                    ios: `maps:?daddr=${lat},${lon}`,
                                                                    default: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`,
                                                                });
                                                                if (url) Linking.openURL(url);
                                                            }}
                                                            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                                                        >
                                                            <Ionicons name="navigate-outline" size={13} color={colors.primary} />
                                                            <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600' }]}>Open in Maps</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Charge Points (CPID)</Text>
                                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'flex-end', flex: 1 }}>
                                                        {(workOrder.assetIds || [workOrder.assetId]).map((cp) => (
                                                            <View key={cp} style={[styles.heroChip, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                                                                <Text style={[styles.heroChipText, { color: colors.text }]}>{cp}</Text>
                                                            </View>
                                                        ))}
                                                    </View>
                                                </View>
                                            </View>

                                            {/* 2. Overview Card */}
                                            <View style={[styles.infoSectionCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                <Text style={[styles.infoSectionTitle, { color: colors.text }]}>{workOrder.title}</Text>
                                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                    <View style={[styles.heroChip, { backgroundColor: getStatusColor(workStatus, colors, isDark) + '15', borderColor: getStatusColor(workStatus, colors, isDark) }]}>
                                                        <Text style={[styles.heroChipText, { color: getStatusColor(workStatus, colors, isDark) }]}>{workStatus}</Text>
                                                    </View>
                                                    <View style={[styles.heroChip, { backgroundColor: typeColors.tint, borderColor: typeColors.border }]}>
                                                        <Text style={[styles.heroChipText, { color: typeColors.tintText }]}>{workOrder.type}</Text>
                                                    </View>
                                                    {workOrder.type === 'Installation' && workOrder.stage && workOrder.stage !== 'Monthly Inspection' ? (
                                                        <View style={[styles.heroChip, { backgroundColor: (isDark ? colors.primaryLight : colors.primary) + '15', borderColor: isDark ? colors.primaryLight : colors.primary }]}>
                                                            <Text style={[styles.heroChipText, { color: isDark ? colors.primaryLight : colors.primary }]}>{workOrder.stage}</Text>
                                                        </View>
                                                    ) : null}
                                                    {workOrder.priority ? (
                                                        <View style={[styles.heroChip, { backgroundColor: (workOrder.priority === 'High' ? colors.danger : workOrder.priority === 'Medium' ? colors.warning : colors.secondary) + '15', borderColor: workOrder.priority === 'High' ? colors.danger : workOrder.priority === 'Medium' ? colors.warning : colors.secondary }]}>
                                                            <Text style={[styles.heroChipText, { color: workOrder.priority === 'High' ? colors.danger : workOrder.priority === 'Medium' ? colors.warning : colors.secondary }]}>
                                                                {workOrder.priority} Priority
                                                            </Text>
                                                        </View>
                                                    ) : null}
                                                </View>

                                                {/* Description inside Overview */}
                                                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, gap: 4 }}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Description</Text>
                                                    <Text style={[{ color: colors.text, lineHeight: 20 }, FONTS.body]}>
                                                        {workOrder.notes || 'No description provided for this work order.'}
                                                    </Text>
                                                </View>
                                            </View>

                                            {/* 3. Approvals & Assignees */}
                                            <View style={[styles.infoSectionCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                        <Ionicons name="people" size={17} color={colors.primary} />
                                                        <Text style={[styles.infoSectionTitle, { color: colors.text }]}>Approvals & Assignees</Text>
                                                    </View>
                                                    {!isOffSite && (
                                                        <TouchableOpacity onPress={() => setIsEditingDetails(true)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                                            <Ionicons name="pencil" size={13} color={colors.primary} />
                                                            <Text style={[FONTS.caption, { color: colors.primary, fontWeight: '600' }]}>Edit</Text>
                                                        </TouchableOpacity>
                                                    )}
                                                </View>

                                                {/* Approvers */}
                                                <View style={{ gap: 8, paddingTop: 4 }}>
                                                    <View style={styles.infoRow}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
                                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Primary Approver</Text>
                                                        </View>
                                                        <Text style={[styles.infoValue, { color: colors.text, fontWeight: '700' }]}>
                                                            {editedPrimaryApprover || workOrder.primaryApprover || workOrder.approver || 'Marcus Aurelius'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Ionicons name="shield-checkmark-outline" size={14} color={colors.textSecondary} />
                                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Secondary Approver</Text>
                                                        </View>
                                                        <Text style={[styles.infoValue, { color: colors.text, fontWeight: '600' }]}>
                                                            {editedSecondaryApprover || workOrder.secondaryApprover || 'Andrea Meuschke'}
                                                        </Text>
                                                    </View>
                                                </View>

                                                {/* Assignees */}
                                                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10, gap: 8 }}>
                                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                                            <Ionicons name="person" size={14} color={colors.primary} />
                                                            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Assignees</Text>
                                                        </View>
                                                        <Text style={[FONTS.caption, { color: colors.textSecondary }]}>
                                                            {assignees.length > 0 ? `${assignees.length} technician${assignees.length === 1 ? '' : 's'}` : 'Unassigned'}
                                                        </Text>
                                                    </View>

                                                    {/* Assignee Chips */}
                                                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                                        {assignees.length > 0 ? (
                                                            assignees.map((tech, idx) => {
                                                                const isLead = idx === 0;
                                                                return (
                                                                    <View
                                                                        key={tech}
                                                                        style={[
                                                                            styles.heroChip,
                                                                            {
                                                                                backgroundColor: isLead ? colors.primary : colors.surface,
                                                                                borderColor: isLead ? colors.primary : colors.border,
                                                                                flexDirection: 'row',
                                                                                alignItems: 'center',
                                                                                gap: 5,
                                                                                paddingHorizontal: 10,
                                                                            }
                                                                        ]}
                                                                    >
                                                                        <Ionicons name={isLead ? "star" : "person"} size={12} color={isLead ? colors.white : colors.primary} />
                                                                        <Text style={[styles.heroChipText, { color: isLead ? colors.white : colors.text, fontWeight: '600' }]}>
                                                                            {isLead ? `Lead: ${tech}` : tech}
                                                                        </Text>
                                                                    </View>
                                                                );
                                                            })
                                                        ) : (
                                                            <View style={[styles.heroChip, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 5 }]}>
                                                                <Ionicons name="alert-circle-outline" size={13} color={colors.warning} />
                                                                <Text style={[styles.heroChipText, { color: colors.textSecondary }]}>No technician assigned</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>

                                                {/* Stakeholders info */}
                                                <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 8, gap: 6 }}>
                                                    <View style={styles.infoRow}>
                                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Created by</Text>
                                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                                            {workOrder.createdBy || workOrder.assignedBy || 'Andrea Meuschke'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Requested by</Text>
                                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                                            {workOrder.requestedBy || 'Timothy Jerry'}
                                                        </Text>
                                                    </View>
                                                    <View style={styles.infoRow}>
                                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Assigned by</Text>
                                                        <Text style={[styles.infoValue, { color: colors.text }]}>
                                                            {workOrder.assignedBy || 'Andrea Meuschke'}
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            {/* 4. Schedule */}
                                            <View style={[styles.infoSectionCard, { backgroundColor: colors.surfaceHighlight, borderColor: colors.border }]}>
                                                <Text style={[styles.infoSectionTitle, { color: colors.text }]}>Schedule</Text>
                                                <View style={styles.infoRow}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Start Date</Text>
                                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                                        {new Date(workOrder.targetStartTime || (workOrder.targetTime - 24 * 60 * 60 * 1000)).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Text>
                                                </View>
                                                <View style={styles.infoRow}>
                                                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Target / Due Date</Text>
                                                    <Text style={[styles.infoValue, { color: colors.text }]}>
                                                        {new Date(workOrder.targetTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </Text>
                                                </View>
                                                {workOrder.dueWindow ? (
                                                    <View style={styles.infoRow}>
                                                        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Due Window</Text>
                                                        <Text style={[styles.infoValue, { color: colors.text }]}>{workOrder.dueWindow}</Text>
                                                    </View>
                                                ) : null}
                                            </View>
                                        </>
                                    )}
                                </ScrollView>
                            </View>
                        </KeyboardAvoidingView>
                    </View>
                </Modal>
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
    headerInfoBtn: {
        width: 36,
        height: 36,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 12,
        paddingBottom: 36,
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
    geoFenceWarning: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    geoFenceIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    geoFenceCopy: {
        flex: 1,
        gap: 3,
    },
    geoFenceTitle: {
        ...FONTS.bodyStrong,
        fontSize: 13,
    },
    geoFenceMessage: {
        ...FONTS.caption,
        lineHeight: 18,
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
    compactLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        marginTop: 6,
        marginBottom: 8,
    },
    compactNavBtn: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    compactMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
    },
    infoModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
        margin: 0,
        padding: 0,
    },
    infoModalContent: {
        width: '100%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingHorizontal: 20,
        paddingTop: 16,
        maxHeight: '90%',
        gap: 16,
        marginBottom: 0,
    },
    infoModalHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    infoModalHeaderIcon: {
        width: 38,
        height: 38,
        borderRadius: 19,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoModalBtn: {
        width: 34,
        height: 34,
        borderRadius: 17,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoSectionCard: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 14,
        gap: 10,
    },
    infoSectionTitle: {
        ...FONTS.bodyStrong,
        fontSize: 14,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
    },
    infoLabel: {
        ...FONTS.caption,
    },
    infoValue: {
        ...FONTS.body,
        fontSize: 13,
    },
    tabSwitch: {
        minHeight: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: 'row',
        padding: 4,
        gap: 4,
        marginBottom: 8,
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
        marginBottom: 8,
    },
    listColumn: {
        gap: 8,
        marginBottom: 8,
    },
    listColumnCompact: {
        gap: 0,
        marginBottom: 4,
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
    taskContainer: {
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
    },
    stepRowText: {
        paddingVertical: 4,
        paddingHorizontal: 0,
        marginBottom: 2,
    },
    stepHeader: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 14,
    },
    stepHeaderCompact: {
        gap: 0,
        marginBottom: 4,
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
    stepTitleText: {
        ...FONTS.body,
        fontSize: 13,
        lineHeight: 18,
        marginBottom: 0,
        fontWeight: '500',
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
        gap: 12,
        paddingHorizontal: 16,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    footerButton: {
        flex: 1,
        height: 50,
        borderRadius: 14,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 8,
    },
    footerButtonText: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    footerPrimaryText: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    fab: {
        position: 'absolute',
        right: 20,
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
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
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        padding: 24,
        paddingTop: 32,
        marginBottom: 0,
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
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 16,
        width: '100%',
        maxHeight: '80%',
        marginBottom: 0,
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
    checklistHeader: {
        paddingHorizontal: 0,
        paddingTop: 4,
        paddingBottom: 6,
    },
    checklistHeaderText: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '700',
        flex: 1,
        paddingRight: 8,
    },
    checklistCard: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
        marginBottom: 10,
    },
    checklistBlockText: {
        paddingHorizontal: 0,
        paddingTop: 4,
        paddingBottom: 2,
        marginBottom: 8,
        marginLeft: 0,
    },
    checklistCardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    sectionCard: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingTop: 10,
        paddingBottom: 8,
        marginBottom: 12,
    },
    sectionBlockText: {
        paddingHorizontal: 0,
        paddingTop: 4,
        paddingBottom: 6,
        marginBottom: 10,
    },
    sectionHeader: {
        paddingVertical: 4,
        paddingHorizontal: 0,
        marginTop: 0,
        marginBottom: 4,
        borderBottomWidth: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sectionHeaderText: {
        ...FONTS.bodyStrong,
        fontSize: 15,
        letterSpacing: 0.1,
        lineHeight: 20,
        fontWeight: '700',
    },
    sectionHeaderMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        flexShrink: 0,
    },
    instructionText: {
        ...FONTS.body,
        fontSize: 14,
        lineHeight: 20,
        marginTop: 2,
    },
    instructionTextCompact: {
        fontSize: 12,
        lineHeight: 16,
        marginTop: 0,
        marginBottom: 2,
    },
    // Modern Form UI Styles for PM & Reactive
    formSectionCard: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 2,
    },
    formSectionHeaderTouchable: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
    formSectionHeaderLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginRight: 8,
    },
    formSectionTitle: {
        ...FONTS.bodyStrong,
        fontSize: 14,
        lineHeight: 20,
        fontWeight: '700',
        flex: 1,
    },
    formSectionHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    formSectionProgressBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 1,
    },
    formSectionProgressText: {
        ...FONTS.caption,
        fontSize: 11,
        fontWeight: '700',
    },
    formSectionSummaryRow: {
        paddingHorizontal: 14,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    formGroupBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 9,
        paddingHorizontal: 14,
        marginTop: 0,
        marginHorizontal: 0,
        marginBottom: 0,
        borderRadius: 0,
    },
    formGroupBannerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginRight: 8,
    },
    formGroupTitle: {
        ...FONTS.bodyStrong,
        fontSize: 13,
        lineHeight: 18,
        fontWeight: '600',
        flex: 1,
    },
    formGroupCountBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 1,
    },
    formGroupCountText: {
        ...FONTS.caption,
        fontSize: 11,
        fontWeight: '600',
    },
    formFieldRow: {
        paddingHorizontal: 14,
        paddingVertical: 11,
    },
    formFieldHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    formFieldLabelWrapper: {
        flex: 1,
        marginRight: 6,
    },
    formFieldLabelRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 4,
    },
    formFieldNumber: {
        ...FONTS.bodyStrong,
        fontSize: 13.5,
        fontWeight: '700',
        marginRight: 2,
    },
    formFieldLabel: {
        ...FONTS.bodyStrong,
        fontSize: 13.5,
        lineHeight: 19,
        fontWeight: '600',
    },
    formFieldTag: {
        alignSelf: 'flex-start',
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 4,
        borderWidth: 0.5,
        marginTop: 3,
    },
    formFieldTagText: {
        ...FONTS.caption,
        fontSize: 10,
        fontWeight: '500',
    },
    fieldMenuTrigger: {
        padding: 4,
    },
    fieldActionPopover: {
        position: 'absolute',
        top: 26,
        right: 0,
        borderRadius: 8,
        paddingVertical: 6,
        paddingHorizontal: 10,
        width: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 6,
        borderWidth: 1,
        zIndex: 120,
    },
    fieldActionPopoverItem: {
        paddingVertical: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    formInputSingle: {
        ...FONTS.body,
        minHeight: 46,
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
    },
    formInputWithIcon: {
        minHeight: 46,
        borderRadius: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    formInputInsideIcon: {
        ...FONTS.body,
        flex: 1,
        paddingVertical: 0,
    },
    formTextarea: {
        ...FONTS.body,
        minHeight: 80,
        borderRadius: 10,
        padding: 12,
        textAlignVertical: 'top',
        borderWidth: 1,
    },
    formYesNoContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    formYesNoButton: {
        flex: 1,
        minHeight: 42,
        borderRadius: 8,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingHorizontal: 10,
    },
    formSelectOptionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    formDropdownSelector: {
        minHeight: 46,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    formDropdownList: {
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 4,
        overflow: 'hidden',
    },
    formDropdownItem: {
        paddingVertical: 11,
        paddingHorizontal: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 0.5,
    },
    formVoltageGrid: {
        gap: 8,
        marginTop: 4,
    },
    formVoltageCard: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        padding: 10,
    },
    formVoltageKey: {
        ...FONTS.caption,
        fontSize: 11,
        fontWeight: '600',
        marginBottom: 4,
    },
    formVoltageInputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    formVoltageInput: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        paddingVertical: 2,
        paddingHorizontal: 0,
        minHeight: 32,
    },
    formVoltageUnit: {
        fontSize: 12,
        fontWeight: '700',
    },
    formMediaThumbnailCard: {
        width: 130,
        height: 96,
        borderRadius: 8,
        borderWidth: 1,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    formMediaCheckBadge: {
        position: 'absolute',
        top: 6,
        right: 6,
        backgroundColor: '#FFFFFF',
        borderRadius: 999,
    },
    formVerificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
    },
    formInstructionCallout: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        marginTop: 4,
    },
});
