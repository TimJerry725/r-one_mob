export const SERVICE_TYPES = ['Service', 'Request Preventive'] as const;
export const DATA_TYPES = ['Text', 'Number', 'Date', 'Radio', 'Multiselect', 'Media', 'Toggle', 'Not applicable'] as const;
export const STAGE_NAMES = ['Site Prep', 'Fault Check', 'Inspection', 'Commissioning', 'Closeout'] as const;
export const CHECKLIST_NAMES = ['Pedestal Repair', 'Grounding Check', 'Annual Maintenance'] as const;

export type SelectorSheetType = 'station' | 'stage' | 'dataType' | 'assignees';

export type StationProjectOption = {
    siteName: string;
    projectId: string;
};

export type SelectorOption = {
    key: string;
    label: string;
    value: string;
    meta?: string;
};

export type SelectorResult = {
    type: SelectorSheetType;
    value: string | string[];
    token: number;
};

export type ChecklistTaskDraft = {
    title: string;
    dataType: typeof DATA_TYPES[number];
    options: string[];
};

export type TaskDraftResult = {
    task: ChecklistTaskDraft;
    token: number;
};

export const STATION_PROJECT_OPTIONS: StationProjectOption[] = [
    { siteName: 'Pune Central Station', projectId: 'PJ001' },
    { siteName: 'Pune Central Station', projectId: 'PJ011' },
    { siteName: 'Mumbai Highway Point', projectId: 'PJ002' },
    { siteName: 'Skyline Mall Parking', projectId: 'PJ003' },
    { siteName: 'Harbor Transit Hub', projectId: 'PJ006' },
];

export const getStationSelectionValue = (siteName: string, projectId: string) =>
    siteName && projectId ? `${siteName}__${projectId}` : '';

export const findStationProjectOptionByValue = (value: string) =>
    STATION_PROJECT_OPTIONS.find((item) => getStationSelectionValue(item.siteName, item.projectId) === value) ?? null;

export const getSelectorOptions = (selectorType: SelectorSheetType): { title: string; options: SelectorOption[]; isMulti?: boolean } => {
    if (selectorType === 'station') {
        return {
            title: 'Select station',
            options: STATION_PROJECT_OPTIONS.map((item) => ({
                key: `${item.siteName}-${item.projectId}`,
                label: item.siteName,
                value: getStationSelectionValue(item.siteName, item.projectId),
                meta: item.projectId,
            })),
        };
    }

    if (selectorType === 'stage') {
        return {
            title: 'Select stage',
            options: STAGE_NAMES.map((item) => ({
                key: item,
                label: item,
                value: item,
            })),
        };
    }

    if (selectorType === 'assignees') {
        const workers = ['Timothy', 'Arjun', 'Sarah', 'Alex'];
        return {
            title: 'Select Assignees',
            isMulti: true,
            options: workers.map((worker) => ({
                key: worker,
                label: worker,
                value: worker,
            })),
        };
    }

    return {
        title: 'Select data type',
        options: DATA_TYPES.map((item) => ({
            key: item,
            label: item,
            value: item,
        })),
    };
};
