export type WorkOrderStatus = 'Unassigned' | 'Assigned' | 'Accepted' | 'Working' | 'Under Review' | 'Completed' | 'Requested';

export type WorkOrder = {
    id: string;
    projectId: string;
    title: string;
    siteName: string;
    address: string;
    type: 'Installation' | 'Service' | 'Reactive' | 'Preventive';
    stage: string;
    status: WorkOrderStatus;
    dueWindow: string;
    eta: string;
    distance: string;
    checklistCompleted: number;
    checklistTotal: number;
    tools: string[];
    parts: string[];
    technicians: string[];
    assetId: string;
    assetIds?: string[];
    checklistItems?: ChecklistTemplateItem[];
    offlineReady: boolean;
    notes: string;
    latitude: number;
    longitude: number;
    priority: 'High' | 'Medium' | 'Low';
    targetStartTime?: number;
    targetTime: number;
    assignedBy?: string;
    approver?: string;
    primaryApprover?: string;
    secondaryApprover?: string;
    createdBy?: string;
    requestedBy?: string;
    isRequested?: boolean;
};

export type AssetStatus = 'Healthy' | 'Service Due' | 'Offline';

export type AssetRecord = {
    id: string;
    cpid: string;
    serial: string;
    model: string;
    status: AssetStatus;
    location: string;
    lastService: string;
    firmware: string;
    linkedWorkOrderId?: string;
    pmAssignee?: string;
    pmDurationMonths?: number;
};

export type AssetAlertPriority = 'Highest' | 'High' | 'Medium';
export type AssetAlertStatus = 'Open' | 'Assigned' | 'Closed';

export type AssetAlertItem = {
    id: string;
    title: string;
    priority: AssetAlertPriority;
    status: AssetAlertStatus;
    date?: string;
};

export type AssetWorkHistoryItem = {
    id: string;
    title: string;
    date: string;
    status: AssetAlertStatus;
    linkedWorkOrderId?: string;
};

export type AssetRealtimeItem = {
    id: string;
    realTime: string;
    receivedTime: string;
    recordId: string;
};

export type AssetVisionDetail = {
    chargerLabel: string;
    commissionedOn: string;
    siteLead: string;
    contactNumber: string;
    peakPower: string;
    voltageRange: string;
    currentRating: string;
    connectors: string;
    warrantyTill: string;
    alerts: AssetAlertItem[];
    workHistory: AssetWorkHistoryItem[];
    realtimeEvents: AssetRealtimeItem[];
};

export type ChecklistTemplateItem = {
    id: string;
    label: string;
    type: 'toggle' | 'text' | 'textarea' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'checkbox' | 'dropdown' | 'media' | 'remarks_response' | 'three_phase_voltage' | 'email' | 'section_header' | 'checklist_header' | 'none';
    dataType?: string;
    required: boolean;
    options?: string[];
    /** For radio visual-check tasks: show Remarks only when this field's value equals this */
    showWhenFieldId?: string;
    showWhenEquals?: string;
    defaultValue?: any;
    isReadOnly?: boolean;
};

export type ActivityItem = {
    id: string;
    type: 'status' | 'comment' | 'sync';
    title: string;
    detail: string;
    time: string;
};

const instructionLabel = (content: string) => {
    const trimmed = content.trim();
    return /^instruction:/i.test(trimmed) ? trimmed : `Instruction: ${trimmed}`;
};

const instructionRow = (id: string, content: string, showWhenFieldId?: string): ChecklistTemplateItem => ({
    id,
    label: instructionLabel(content),
    type: 'none',
    dataType: 'None',
    required: false,
    isReadOnly: true,
    ...(showWhenFieldId ? { showWhenFieldId, showWhenEquals: 'Yes' } : {}),
});

const yesNoRadio = (id: string, label: string, showWhenFieldId?: string): ChecklistTemplateItem => ({
    id,
    label,
    type: 'radio',
    required: true,
    options: ['Yes', 'No'],
    ...(showWhenFieldId ? { showWhenFieldId, showWhenEquals: 'Yes' } : {}),
});

const section = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'section_header', required: false });
const checklist = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'checklist_header', required: false });

export const REACTIVE_FAULT_CHECKLIST: ChecklistTemplateItem[] = [
    section('react-sec-1', 'Reactive Fault & Diagnostics'),
    checklist('react-t1-instruction', 'Initial Fault & Alarm Inspection'),
    yesNoRadio('react-t1-visual', 'Visual Check'),
    instructionRow('react-t1-remarks', 'Remarks: Inspect HMI screen, warning LEDs, and physical enclosure for visible damage.'),
    { id: 'react-t1-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of fault area', 'Close-up of error screen', 'Surrounding area'] },

    checklist('react-t2-instruction', 'Connector & Cable Diagnostics'),
    yesNoRadio('react-t2-visual', 'Visual Check'),
    instructionRow('react-t2-remarks', 'Remarks: Inspect charging cable, connector latch, and pins for damage or burn marks.'),
    { id: 'react-t2-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Connector pins', 'Cable sleeve', 'Lock mechanism'] },

    section('react-sec-2', 'Electrical & Earthing Diagnostics'),
    checklist('react-t3-instruction', 'Electrical & Earthing Measurement'),
    yesNoRadio('react-t3-visual', 'Visual Check'),
    instructionRow('react-t3-remarks', 'Remarks: Verify input supply voltage and Neutral-Earth voltage (< 3V).'),
    { id: 'react-t3-voltage', label: 'Three-phase input voltage measurements', type: 'three_phase_voltage', dataType: '3 phase voltage', required: true },

    section('react-sec-3', 'Component Repair & Verification'),
    checklist('react-t4-instruction', 'Component Repair / Replacement Verification'),
    yesNoRadio('react-t4-visual', 'Visual Check'),
    instructionRow('react-t4-remarks', 'Remarks: Replace blown fuse, damaged gun latch, or loose terminal connections as required.'),

    checklist('react-t5-instruction', 'Post-Repair Test & Operational Sign-off'),
    yesNoRadio('react-t5-visual', 'Visual Check'),
    instructionRow('react-t5-remarks', 'Remarks: Initiate 5-minute test charging session and confirm normal operation.'),
    { id: 'react-t5-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Active charging HMI screen', 'Restored charger enclosure', 'Site area cleared'] },
];

export const REACTIVE_FAULT_QUESTION_COUNT = REACTIVE_FAULT_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

export const CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = REACTIVE_FAULT_CHECKLIST;


const THREE_PHOTO_REMARKS = ['Photo 1', 'Photo 2', 'Photo 3'];

const evidenceRow = (
    id: string,
    label: string,
    showWhenFieldId: string,
    kind: 'photos' | 'documents' = 'photos'
): ChecklistTemplateItem => {
    if (kind === 'documents') {
        const options = /SLD|diagram/i.test(label)
            ? ['SLD document', 'As-installed copy']
            : ['Test certificate', 'Validity marking'];
        return {
    id,
    label,
    type: 'media',
    dataType: 'Media',
    required: true,
    showWhenFieldId,
    showWhenEquals: 'Yes',
            options,
        };
    }
    const threePhotos = /3 photos/i.test(label);
    return {
        id,
        label,
        type: 'media',
        dataType: 'Media',
        required: true,
        showWhenFieldId,
        showWhenEquals: 'Yes',
        options: threePhotos ? [...THREE_PHOTO_REMARKS] : [''],
    };
};


const pmChecklist = (
    sno: string,
    title: string,
    instruction: string,
    observation: string,
    action?: string,
    evidence?: string,
    evidenceKind: 'photos' | 'documents' = 'photos'
): ChecklistTemplateItem[] => {
    const instructionId = `evpm-t${sno}-instruction`;
    const observationId = `evpm-t${sno}-obs`;
    const actionId = `evpm-t${sno}-action`;
    const evidenceId = `evpm-t${sno}-evidence`;
    const rows: ChecklistTemplateItem[] = [
        section(`evpm-sec-${sno}`, title),
        instructionRow(instructionId, instruction),
    ];
    const hasAction = Boolean(action);
    const hasEvidence = Boolean(evidence);
    if (hasAction) {
        rows.push(yesNoRadio(observationId, observation));
        rows.push(yesNoRadio(actionId, action as string, observationId));
        if (hasEvidence) rows.push(evidenceRow(evidenceId, evidence as string, actionId, evidenceKind));
    } else {
        rows.push(yesNoRadio(observationId, observation));
        if (hasEvidence) rows.push(evidenceRow(evidenceId, evidence as string, observationId, evidenceKind));
    }
    return rows;
};

export const PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST: ChecklistTemplateItem[] = [
    section('evpm-yellow-1', 'Electrical: LT/Main DB Panel (Public Charging)'),
    checklist('evpm-t1-instruction', 'Check cables in the cable alley for cuts or discoloration.'),
    yesNoRadio('evpm-t1-visual', 'Visual Check'),
    instructionRow('evpm-t1-remarks', 'Remarks: If cuts or discoloration is found, replace it.'),
    { id: 'evpm-t1-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t2-instruction', 'Ensure all dummy holes in the cable alley are properly sealed.'),
    yesNoRadio('evpm-t2-visual', 'Visual Check'),
    instructionRow('evpm-t2-remarks', 'Remarks: seal if open'),
    { id: 'evpm-t2-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t3-instruction', 'Verify surge protection device functionality and look for warning indicators.'),
    yesNoRadio('evpm-t3-visual', 'Visual Check'),
    instructionRow('evpm-t3-remarks', 'Remarks: check with warning indicators'),
    { id: 'evpm-t3-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t4-instruction', 'Confirm the absence of loose or temporary connections.'),
    yesNoRadio('evpm-t4-visual', 'Visual Check'),
    instructionRow('evpm-t4-remarks', 'Remarks: check for burns'),
    checklist('evpm-t5-instruction', 'Ensure phase indication lamps are operational.'),
    yesNoRadio('evpm-t5-visual', 'Visual Check'),
    checklist('evpm-t6-instruction', 'Verify the multi-functional meter displays accurate readings.'),
    yesNoRadio('evpm-t6-visual', 'Visual Check'),
    instructionRow('evpm-t6-remarks', 'Remarks: verify with multimeter'),
    checklist('evpm-t7-instruction', 'Confirm correct installation of insulating shrouds.'),
    yesNoRadio('evpm-t7-visual', 'Visual Check'),
    instructionRow('evpm-t7-remarks', 'Remarks: install if missing'),
    checklist('evpm-t8-instruction', 'Check for signs of rodent presence near the panel.'),
    yesNoRadio('evpm-t8-visual', 'Visual Check'),
    checklist('evpm-t9-instruction', 'Ensure the internal area is free of dust and debris.'),
    yesNoRadio('evpm-t9-visual', 'Visual Check'),
    instructionRow('evpm-t9-remarks', 'Remarks: To be cleaned using blower when required'),
    { id: 'evpm-t9-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t10-instruction', 'Inspect surroundings for signs of water accumulation.'),
    yesNoRadio('evpm-t10-visual', 'Visual Check'),
    instructionRow('evpm-t10-remarks', 'Remarks: check for water marks, click picture; issue to be resolved from source'),
    { id: 'evpm-t10-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t11-instruction', 'Verify IS15652 compliance and ensure the insulation mat is undamaged.'),
    yesNoRadio('evpm-t11-visual', 'Visual Check'),
    instructionRow('evpm-t11-remarks', 'Remarks: Replace if damaged or stolen'),
    { id: 'evpm-t11-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t13-instruction', 'Ensure cable glands are securely fitted, correctly sized, and free of gaps.'),
    yesNoRadio('evpm-t13-visual', 'Visual Check'),
    instructionRow('evpm-t13-remarks', 'Remarks: tighten if loose; replace if damaged'),
    checklist('evpm-t14-instruction', 'Confirm the single line diagram (SLD) is displayed inside the panel door. (Single line diagram)'),
    yesNoRadio('evpm-t14-visual', 'Visual Check'),
    instructionRow('evpm-t14-remarks', 'Remarks: if no, paste the diagram'),
    checklist('evpm-t15-instruction', 'Inspect terminal blocks and cable terminations for overheating or damage.'),
    yesNoRadio('evpm-t15-visual', 'Visual Check'),
    checklist('evpm-t16-instruction', 'Ensure the power distribution board (PDB) is clean internally and externally. (Power distribution board)'),
    yesNoRadio('evpm-t16-visual', 'Visual Check'),
    instructionRow('evpm-t16-remarks', 'Remarks: Clean using blower'),
    { id: 'evpm-t16-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t17-instruction', 'Measure neutral-to-earth voltage and verify earth integrity.'),
    yesNoRadio('evpm-t17-visual', 'Visual Check'),
    instructionRow('evpm-t17-remarks', 'Remarks: Check using voltmeter or multimeter, write reading'),
    checklist('evpm-t18-instruction', 'Record power factor, current, voltage, KW, KWH, and demand from the MFM (Multifunction meter)'),
    yesNoRadio('evpm-t18-visual', 'Visual Check'),
    instructionRow('evpm-t18-remarks', 'Remarks: Record reading'),
    checklist('evpm-t19-instruction', 'No MCCB is in bypassed condition'),
    yesNoRadio('evpm-t19-visual', 'Visual Check'),
    instructionRow('evpm-t19-remarks', 'Remarks: Check with switching off MCCB'),
    checklist('evpm-t20-instruction', 'ELR is functioning proper way ( Yes/No)'),
    yesNoRadio('evpm-t20-visual', 'Visual Check'),
    instructionRow('evpm-t20-remarks', 'Remarks: Check with test button'),
    checklist('evpm-t21-instruction', 'Door is in closed condition and locked'),
    yesNoRadio('evpm-t21-visual', 'Visual Check'),
    instructionRow('evpm-t21-remarks', 'Remarks: no gaps, damage to be checked; report if found.'),
    section('evpm-yellow-2', 'Electrical: Illumination Lights in Charger Locations'),
    checklist('evpm-t22-instruction', 'All Lights are glowing (no insects trapped inside)'),
    yesNoRadio('evpm-t22-visual', 'Visual Check'),
    instructionRow('evpm-t22-remarks', 'Remarks: Check by turning lights on; clean and remove insects'),
    { id: 'evpm-t22-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t23-instruction', 'Light fixtures are firmly fixed & not hanging'),
    yesNoRadio('evpm-t23-visual', 'Visual Check'),
    instructionRow('evpm-t23-remarks', 'Remarks: No light should be hanging or have loose fixture'),
    { id: 'evpm-t23-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-3', 'Electrical: Earth Pits & Earth Grid'),
    checklist('evpm-t24-instruction', 'Earth pits are marked & are visible'),
    yesNoRadio('evpm-t24-visual', 'Visual Check'),
    instructionRow('evpm-t24-remarks', 'Remarks: Clean the pit cover if marking is not visible; mark using paint/marker if required'),
    { id: 'evpm-t24-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-4', 'Electrical: CCTV Camera'),
    checklist('evpm-t25-instruction', 'All CCTV cameras are functional as per the monitor and record non working cameras'),
    yesNoRadio('evpm-t25-visual', 'Visual Check'),
    instructionRow('evpm-t25-remarks', 'Remarks: Check for any obstruction of view, dirt on lens etc (check for on light if available)'),
    section('evpm-yellow-5', 'Charger Cabinet: EV Chargers (AC & DC) (Only Look, Listen & Feel Checks)- Record charger id wherever required'),
    checklist('evpm-t26-instruction', 'Abnormal noise during operation noticed.'),
    yesNoRadio('evpm-t26-visual', 'Visual Check'),
    checklist('evpm-t27-instruction', 'All lights in the charger vicinity are glowing'),
    yesNoRadio('evpm-t27-visual', 'Visual Check'),
    instructionRow('evpm-t27-remarks', 'Remarks: clean if required'),
    { id: 'evpm-t27-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t28-instruction', 'Damage observed on Supporting accessories (Guns, connector etc)'),
    yesNoRadio('evpm-t28-visual', 'Visual Check'),
    instructionRow('evpm-t28-remarks', 'Remarks: if yes; inform Ops team'),
    { id: 'evpm-t28-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t29-instruction', 'Doors are locked & working and no damage observed'),
    yesNoRadio('evpm-t29-visual', 'Visual Check'),
    instructionRow('evpm-t29-remarks', 'Remarks: Also check error log for door open. Door locked sensor should not be bypassed'),
    checklist('evpm-t30-instruction', 'Foundation bolts are tight'),
    yesNoRadio('evpm-t30-visual', 'Visual Check'),
    instructionRow('evpm-t30-remarks', 'Remarks: All bolts as per charger diagram should be tight; tighten if loose'),
    checklist('evpm-t31-instruction', 'Emergency Push Button is working'),
    yesNoRadio('evpm-t31-visual', 'Visual Check'),
    instructionRow('evpm-t31-remarks', 'Remarks: Check and then release the button'),
    section('evpm-yellow-6', 'Housekeeping at Charger Surrounding, Parking'),
    checklist('evpm-t32-instruction', 'All area is free of scrap/Flammable/unwanted materials'),
    yesNoRadio('evpm-t32-visual', 'Visual Check'),
    { id: 'evpm-t32-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t33-instruction', 'Signs of Paan Stains/ Cigarette / trash'),
    yesNoRadio('evpm-t33-visual', 'Visual Check'),
    { id: 'evpm-t33-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t34-instruction', 'Water leakage and Stagnation observed in any area'),
    yesNoRadio('evpm-t34-visual', 'Visual Check'),
    { id: 'evpm-t34-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t35-instruction', 'Entire area is neat & clean'),
    yesNoRadio('evpm-t35-visual', 'Visual Check'),
    instructionRow('evpm-t35-remarks', 'Remarks: Charger, wet cleaning of parking bay, canopy, pedestal, gun, cable, pdb, lights'),
    { id: 'evpm-t35-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t36-instruction', 'Bird nest visible anywhere in the premises and traces of bird stay'),
    yesNoRadio('evpm-t36-visual', 'Visual Check'),
    instructionRow('evpm-t36-remarks', 'Remarks: Remove if found'),
    { id: 'evpm-t36-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-7', 'Health Safety & Environment-General Issues - Safety Equipments/ Environments'),
    checklist('evpm-t37-instruction', 'All fire extinguishers are at the designated place as per SOP'),
    yesNoRadio('evpm-t37-visual', 'Visual Check'),
    instructionRow('evpm-t37-remarks', 'Remarks: Clean the pipe'),
    { id: 'evpm-t37-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t38-instruction', 'Fire extinguisher are in charged condition and ready for use with Validity /Test certificates'),
    yesNoRadio('evpm-t38-visual', 'Visual Check'),
    instructionRow('evpm-t38-remarks', 'Remarks: check validy date is visible; re-write if fading'),
    { id: 'evpm-t38-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-8', 'Civil Structures & Facilities - Charger Location'),
    checklist('evpm-t39-instruction', 'Parking Slot free from pothole and damage'),
    yesNoRadio('evpm-t39-visual', 'Visual Check'),
    instructionRow('evpm-t39-remarks', 'Remarks: if found, inform and take picture'),
    { id: 'evpm-t39-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t40-instruction', 'Canopy Provided is firmly fixed on the column, no loose bolts'),
    yesNoRadio('evpm-t40-visual', 'Visual Check'),
    instructionRow('evpm-t40-remarks', 'Remarks: Gentle push on the Canopy structure'),
    checklist('evpm-t41-instruction', 'Bollard foundation is in good condition and is firmly fixed'),
    yesNoRadio('evpm-t41-visual', 'Visual Check'),
    instructionRow('evpm-t41-remarks', 'Remarks: check bolting and tighten if loose'),
    { id: 'evpm-t41-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t42-instruction', 'Charger is firmly bolted and does not wobble'),
    yesNoRadio('evpm-t42-visual', 'Visual Check'),
    instructionRow('evpm-t42-remarks', 'Remarks: Gentle push on the charger'),
    checklist('evpm-t43-instruction', 'Wheel Stopper is firmly fixed and not damaged'),
    yesNoRadio('evpm-t43-visual', 'Visual Check'),
    instructionRow('evpm-t43-remarks', 'Remarks: check bolting and tighten if loose'),
    { id: 'evpm-t43-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-9', 'Mechanical (Structures/Facilities) - Charger Location & Panel Area'),
    checklist('evpm-t44-instruction', 'Canopy Structure is rust free'),
    yesNoRadio('evpm-t44-visual', 'Visual Check'),
    instructionRow('evpm-t44-remarks', 'Remarks: Check all bolts and infra'),
    { id: 'evpm-t44-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t45-instruction', 'PDB Structure is rust free'),
    yesNoRadio('evpm-t45-visual', 'Visual Check'),
    instructionRow('evpm-t45-remarks', 'Remarks: Check PDB and stand'),
    { id: 'evpm-t45-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('evpm-yellow-10', 'Signage'),
    checklist('evpm-t46-instruction', 'Signages are intact,not damaged & fixed properly'),
    yesNoRadio('evpm-t46-visual', 'Visual Check'),
    { id: 'evpm-t46-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t47-instruction', 'No Fading of colour on Signages observed'),
    yesNoRadio('evpm-t47-visual', 'Visual Check'),
    { id: 'evpm-t47-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evpm-t48-instruction', 'Charger Usage , DOs & DONTs, Customer Care number is available'),
    yesNoRadio('evpm-t48-visual', 'Visual Check'),
    { id: 'evpm-t48-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
];

export const PREVENTIVE_EV_INFRA_QUESTION_COUNT = PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

export const PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST: ChecklistTemplateItem[] = [
    section('evch-yellow-1', 'EV Charger'),
    checklist('evch-t1-instruction', 'Check cables for cuts or discoloration'),
    yesNoRadio('evch-t1-visual', 'Visual Check'),
    checklist('evch-t2-instruction', 'MCB/MCCB is not burnt and working'),
    yesNoRadio('evch-t2-visual', 'Visual Check'),
    instructionRow('evch-t2-remarks', 'Remarks: switch off and turn back on'),
    checklist('evch-t3-instruction', 'Air Filter Cleaning'),
    yesNoRadio('evch-t3-visual', 'Visual Check'),
    instructionRow('evch-t3-remarks', 'Remarks: Clean the air filters periodically to avoid dust accumulation and maintain proper airflow.'),
    { id: 'evch-t3-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t4-instruction', 'Exhaust is working and clean(if visible)'),
    yesNoRadio('evch-t4-visual', 'Visual Check'),
    instructionRow('evch-t4-remarks', 'Remarks: clean with blower/cloth'),
    { id: 'evch-t4-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t5-instruction', 'No signs of rodents'),
    yesNoRadio('evch-t5-visual', 'Visual Check'),
    instructionRow('evch-t5-remarks', 'Remarks: Remove if found any'),
    checklist('evch-t6-instruction', 'Charger is clean from inside'),
    yesNoRadio('evch-t6-visual', 'Visual Check'),
    instructionRow('evch-t6-remarks', 'Remarks: clean with blower'),
    { id: 'evch-t6-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t7-instruction', 'Charger is clean from outside'),
    yesNoRadio('evch-t7-visual', 'Visual Check'),
    instructionRow('evch-t7-remarks', 'Remarks: clean with wet cloth wherever possible (only panels and connector cable)'),
    { id: 'evch-t7-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t8-instruction', 'HMI screen is clan with no dust'),
    yesNoRadio('evch-t8-visual', 'Visual Check'),
    instructionRow('evch-t8-remarks', 'Remarks: Clean with dry cloth'),
    checklist('evch-t9-instruction', 'Emergency button is working and clean'),
    yesNoRadio('evch-t9-visual', 'Visual Check'),
    instructionRow('evch-t9-remarks', 'Remarks: check by pushing and releasing, clean with dry cloth'),
    checklist('evch-t10-instruction', 'Input and Earthing Voltage Validation'),
    yesNoRadio('evch-t10-visual', 'Visual Check'),
    instructionRow('evch-t10-remarks', 'Remarks: Verify input voltage levels and ensure N-E voltage should be maintained < 03 Volts. Check earthing voltage'),
    { id: 'evch-t10-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t11-instruction', 'Earthing Resistance Check'),
    yesNoRadio('evch-t11-visual', 'Visual Check'),
    instructionRow('evch-t11-remarks', 'Remarks: Measure and maintain earthing resistance < 05 Ω(ohms) regularly to ensure effective grounding.'),
    { id: 'evch-t11-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t12-instruction', 'Gun & Vehicle Inlet Cleaning'),
    yesNoRadio('evch-t12-visual', 'Visual Check'),
    instructionRow('evch-t12-remarks', 'Remarks: Clean the charging gun and vehicle inlet terminals regularly to avoid contamination and ensure a secure connection.'),
    { id: 'evch-t12-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    checklist('evch-t13-instruction', 'Physical Verification of Gun and Contact Points'),
    yesNoRadio('evch-t13-visual', 'Visual Check'),
    instructionRow('evch-t13-remarks', 'Remarks: Inspect the charging gun and contact points for physical damage or wear'),
    checklist('evch-t14-instruction', 'Verification and Monitoring of Critical Alarms'),
    yesNoRadio('evch-t14-visual', 'Visual Check'),
    instructionRow('evch-t14-remarks', 'Remarks: Regularly verify and monitor critical alarms related to EPO pressed, earthing faults, or any input-related faults.'),
    { id: 'evch-t14-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
];

export const PREVENTIVE_EV_CHARGER_QUESTION_COUNT = PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

export const PREVENTIVE_HT_YARD_CHECKLIST: ChecklistTemplateItem[] = [
    section('htpm-yellow-1', 'HT / DP - INSTALLATION'),
    checklist('htpm-t1-instruction', 'Check that all equipments-Lighting arrestor (LA\'s) Gang operated switch are properly opeartional'),
    yesNoRadio('htpm-t1-visual', 'Visual Check'),
    instructionRow('htpm-t1-remarks', 'Remarks: LA and GOS is operational with AB Switch ,No burnt mark and disclaration at termination'),
    checklist('htpm-t2-instruction', 'Check that earthing resistance and termination are not corroded'),
    yesNoRadio('htpm-t2-visual', 'Visual Check'),
    instructionRow('htpm-t2-remarks', 'Remarks: ensure HT power supply is OFF before testing'),
    section('htpm-yellow-2', 'RING MAIN UNIT'),
    checklist('htpm-t3-instruction', 'RMU Panel and Switch gears are properly operational and double earthed.'),
    yesNoRadio('htpm-t3-visual', 'Visual Check'),
    instructionRow('htpm-t3-remarks', 'Remarks: Double and independent earthing for meter box'),
    checklist('htpm-t4-instruction', 'Check that earthing resistance and termination are not corroded of RMU / VCB / Panel'),
    yesNoRadio('htpm-t4-visual', 'Visual Check'),
    instructionRow('htpm-t4-remarks', 'Remarks: ensure HT power supply is OFF before testing'),
    checklist('htpm-t5-instruction', 'Check the tightness of all HT cable terminations at the Transformer, VCB/RMU ends.'),
    yesNoRadio('htpm-t5-visual', 'Visual Check'),
    instructionRow('htpm-t5-remarks', 'Remarks: Check for burn marks and tightness'),
    checklist('htpm-t6-instruction', 'Discoloration or burn marks observed at the termination end'),
    yesNoRadio('htpm-t6-visual', 'Visual Check'),
    instructionRow('htpm-t6-remarks', 'Remarks: Damage on CCTV/ view block'),
    checklist('htpm-t7-instruction', 'Incoming VCB is in working condition and handle is intact for both the Power Supplies if applicable'),
    yesNoRadio('htpm-t7-visual', 'Visual Check'),
    instructionRow('htpm-t7-remarks', 'Remarks: Operational checks'),
    checklist('htpm-t8-instruction', 'Inspect for Physical Damage of any Civil Foundation/Fencing/gate in HT yard'),
    yesNoRadio('htpm-t8-visual', 'Visual Check'),
    instructionRow('htpm-t8-remarks', 'Remarks: Visual check'),
    checklist('htpm-t9-instruction', 'Inspect security systems.'),
    yesNoRadio('htpm-t9-visual', 'Visual Check'),
    instructionRow('htpm-t9-remarks', 'Remarks: Damage on CCTV/ view block'),
    checklist('htpm-t10-instruction', 'Ensure yard is free from waterlogging, vegetation, or debris.'),
    yesNoRadio('htpm-t10-visual', 'Visual Check'),
    instructionRow('htpm-t10-remarks', 'Remarks: Visual check'),
    section('htpm-yellow-3', 'SEB METER BOX AND HT Panel'),
    checklist('htpm-t11-instruction', 'Lubrication to be applied in the parts of the VCB where it is engaged for establishing connection'),
    yesNoRadio('htpm-t11-visual', 'Visual Check'),
    instructionRow('htpm-t11-remarks', 'Remarks: Shutdown to be done before testing and to be restored after checking'),
    checklist('htpm-t12-instruction', 'All setting to be verified as per the load applied with SEB and to be recorded'),
    yesNoRadio('htpm-t12-visual', 'Visual Check'),
    instructionRow('htpm-t12-remarks', 'Remarks: Shutdown to be done before testing and to be restored after checking'),
    checklist('htpm-t13-instruction', 'Condition of SEB seal on meter box'),
    yesNoRadio('htpm-t13-visual', 'Visual Check'),
    instructionRow('htpm-t13-remarks', 'Remarks: Mention any damage'),
    checklist('htpm-t14-instruction', 'Capture the HT meter reading'),
    yesNoRadio('htpm-t14-visual', 'Visual Check'),
    instructionRow('htpm-t14-remarks', 'Remarks: Required Photograph'),
    { id: 'htpm-t14-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Overview of inspection area', 'Close-up of equipment condition', 'Surrounding area / accessories'] },
    section('htpm-yellow-4', 'Transformer Oil Cooled / Air Cooled'),
    checklist('htpm-t15-instruction', 'Check and Record the Winding Temperature Indicator'),
    yesNoRadio('htpm-t15-visual', 'Visual Check'),
    instructionRow('htpm-t15-remarks', 'Remarks: Temp as per the Indicator'),
    checklist('htpm-t16-instruction', 'Check the Oil level in the conservator'),
    yesNoRadio('htpm-t16-visual', 'Visual Check'),
    instructionRow('htpm-t16-remarks', 'Remarks: Should be above the Half Level in the Sight glass and to be Topped up'),
    checklist('htpm-t17-instruction', 'Check for any oil leakage in the transformer unit'),
    yesNoRadio('htpm-t17-visual', 'Visual Check'),
    instructionRow('htpm-t17-remarks', 'Remarks: No oil leakage should be there'),
    checklist('htpm-t18-instruction', 'Check the breather for good silica gel condition'),
    yesNoRadio('htpm-t18-visual', 'Visual Check'),
    instructionRow('htpm-t18-remarks', 'Remarks: Colour should be blue or replace it'),
    checklist('htpm-t19-instruction', 'Check the transformer neutral is solidly earthed & earthing electrode for transformer neutral.'),
    yesNoRadio('htpm-t19-visual', 'Visual Check'),
    instructionRow('htpm-t19-remarks', 'Remarks: 2 nos electodes / Earth Pit and Interconnected, Not rusted and in good condition with marking'),
    checklist('htpm-t20-instruction', 'Check the statutory "Danger Notice"is Displayed'),
    yesNoRadio('htpm-t20-visual', 'Visual Check'),
    instructionRow('htpm-t20-remarks', 'Remarks: To be fixed on Fencing facing customer area near gate'),
    checklist('htpm-t21-instruction', 'Oil filtration'),
    yesNoRadio('htpm-t21-visual', 'Visual Check'),
    checklist('htpm-t22-instruction', 'BDV Test'),
    yesNoRadio('htpm-t22-visual', 'Visual Check'),
];

export const STEAM_A_CBE_CHECKLIST: ChecklistTemplateItem[] = [
    // 1. Section Header (data type: Section Header)
    {
        id: 'steam-sec-1',
        label: '1. Site Information & Contact Verification',
        type: 'section_header',
        dataType: 'Section Header',
        required: false,
    },
    // 2. Checklist Header (data type: Checklist Header)
    {
        id: 'steam-chk-1',
        label: 'Station Identification & Basic Parameters',
        type: 'checklist_header',
        dataType: 'Checklist Header',
        required: false,
    },
    // 3. Short text (data type: Short text)
    {
        id: 'steam-t-short-text',
        label: 'Station Supervisor Name',
        type: 'text',
        dataType: 'Short text',
        required: true,
        defaultValue: 'Rajesh Kumar',
    },
    // 4. Email (data type: Email)
    {
        id: 'steam-t-email',
        label: 'Station Official Contact Email',
        type: 'email',
        dataType: 'Email',
        required: true,
        defaultValue: 'rajesh.cbe@steama.com',
    },
    // 5. Number (data type: Number)
    {
        id: 'steam-t-number',
        label: 'Sanctioned Transformer Load (kVA)',
        type: 'number',
        dataType: 'Number',
        required: true,
        defaultValue: '250',
    },
    // 6. Date (data type: Date)
    {
        id: 'steam-t-date',
        label: 'Commissioning & Inspection Date',
        type: 'date',
        dataType: 'Date',
        required: true,
        defaultValue: '2026-10-15',
    },
    // 7. Long text (data type: Long text)
    {
        id: 'steam-t-long-text',
        label: 'Site Access Instructions & Environmental Remarks',
        type: 'textarea',
        dataType: 'Long text',
        required: false,
        defaultValue: 'Substation bay is shaded, well-ventilated, with 24/7 security access.',
    },

    // 8. Section Header (data type: Section Header)
    {
        id: 'steam-sec-2',
        label: '2. Electrical Diagnostics & Hardware Checks',
        type: 'section_header',
        dataType: 'Section Header',
        required: false,
    },
    // 9. Checklist Header (data type: Checklist Header)
    {
        id: 'steam-chk-2',
        label: 'Three Phase Power & Safety Switchgear',
        type: 'checklist_header',
        dataType: 'Checklist Header',
        required: false,
    },
    // 10. 3 phase voltage (data type: 3 phase voltage)
    {
        id: 'steam-t-3phase',
        label: 'Three Phase Grid Input Voltage Measurements',
        type: 'three_phase_voltage',
        dataType: '3 phase voltage',
        required: true,
    },
    // 11. Radio button (data type: Radio button)
    {
        id: 'steam-t-radio',
        label: 'Surge Protection Device (SPD) Status',
        type: 'radio',
        dataType: 'Radio button',
        required: true,
        options: ['Healthy (Green)', 'Tripped (Red)', 'Maintenance Required'],
        defaultValue: 'Healthy (Green)',
    },
    // 12. Dropdown (data type: Dropdown)
    {
        id: 'steam-t-dropdown',
        label: 'Primary Transformer Configuration',
        type: 'dropdown',
        dataType: 'Dropdown',
        required: true,
        options: ['Dry Type Cast Resin (11kV / 415V)', 'Oil Immersed ONAN', 'Step Down Isolation Unit', 'Pad Mounted Substation'],
        defaultValue: 'Dry Type Cast Resin (11kV / 415V)',
    },
    // 13. Multiple Choice (data type: Multiple Choice)
    {
        id: 'steam-t-multiselect',
        label: 'Protective Relays & Interlocks Verified',
        type: 'multiselect',
        dataType: 'Multiple Choice',
        required: true,
        options: ['Over-Voltage Protection', 'Under-Voltage Protection', 'Earth Fault Relay (51N)', 'RCD / Ground Leakage Monitor'],
        defaultValue: ['Over-Voltage Protection', 'Earth Fault Relay (51N)'],
    },
    // 14. Checkbox (data type: Checkbox)
    {
        id: 'steam-t-checkbox',
        label: 'Personal Protective Equipment (PPE) Compliance',
        type: 'checkbox',
        dataType: 'Checkbox',
        required: true,
        options: ['Insulated Gloves (10kV)', 'Safety Helmet & Visor', 'Dielectric Safety Boots', 'Arc Flash Shield'],
        defaultValue: ['Insulated Gloves (10kV)', 'Dielectric Safety Boots'],
    },
    // 15. Media (data type: Media)
    {
        id: 'steam-t-media',
        label: 'Upload Evidence Photos (Panel, Earthing & Enclosure)',
        type: 'media',
        dataType: 'Media',
        required: true,
        options: ['Main Distribution Incomer', 'Earth Pit Resistance Link', 'Station Overview & Safety Signage'],
    },
    // 16. None (data type: None)
    {
        id: 'steam-t-none',
        label: 'Emergency Stop Mechanical Lockout Verified',
        type: 'checkbox',
        dataType: 'None',
        required: false,
        options: ['Verified and Latched'],
        defaultValue: ['Verified and Latched'],
    },
];

export const STEAM_A_CBE_QUESTION_COUNT = 12;

export const WORK_ORDER_TEMPLATES = [
    {
        id: 'power-supply-emergency',
        name: 'Power Supply Emergency Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'connector-repair',
        name: 'Connector Repair Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'inverter-service',
        name: 'Inverter Service Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'controller-recovery',
        name: 'Controller Recovery Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'electrical-isolation',
        name: 'Electrical Isolation Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'cooling-leak-service',
        name: 'Cooling Leak Service Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'hmi-repair',
        name: 'HMI Repair Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'network-repair',
        name: 'Network Repair Template',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'monthly-pm-ev-charger',
        name: 'Monthly PM for EV Charger',
        items: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        total: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
    },
    {
        id: 'half-yearly-pm-ht-yard',
        name: 'Half yearly PM for HT Yard',
        items: PREVENTIVE_HT_YARD_CHECKLIST,
        total: 8,
    },
    {
        id: 'monthly-pm-ev-infra',
        name: 'Monthly PM for EV Infra',
        items: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        total: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
    },
    {
        id: 'steam-a-cbe-all-types',
        name: 'Stazione FS Milano Centrale Complete Diagnostics',
        items: STEAM_A_CBE_CHECKLIST,
        total: STEAM_A_CBE_QUESTION_COUNT,
    },
];

export let WORK_ORDERS: WorkOrder[] = [
    // --- PM Works (Synchronized with Web Preventive Maintenance module) ---
    {
        id: 'wo-pm-1646',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Charger',
        siteName: 'Stazione FS Milano Centrale',
        address: "Piazza Duca d'Aosta, 1, 20124 Milano (MI), Italy",
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Assigned',
        dueWindow: '15 Aug 2026',
        eta: 'Ready on Site',
        distance: '0.2 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        tools: ['Multimeter', 'Insulation Meter', 'Torque Wrench'],
        parts: ['Surge Protection Device', 'Terminal Lugs'],
        technicians: ['Tim', 'Laura'],
        assetId: 'CP001',
        assetIds: ['CP001'],
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Monthly PM for EV Charger at Stazione FS Milano Centrale. ABB Terra 54 (Charger 01).',
        latitude: 45.4870,
        longitude: 9.2045,
        priority: 'High',
        targetTime: Date.now() + 6 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-pm-1647',
        projectId: 'PJ002',
        title: 'Monthly PM for EV Charger',
        siteName: 'Autostrada A1 Area Servizio',
        address: 'Autostrada A1 Milano-Napoli KM 15, San Donato Milanese (MI), Italy',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Unassigned',
        dueWindow: '22 Aug 2026',
        eta: 'Starts in 10 min',
        distance: '0.5 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        tools: ['Multimeter', 'Blower', 'Anti-rust Spray'],
        parts: ['Insulation Mat', 'Cable Gland'],
        technicians: ['James Carter'],
        assetId: 'CP002',
        assetIds: ['CP002'],
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Monthly PM for EV Charger at Autostrada A1 Area Servizio. ABB Terra 44 (Charger 02).',
        latitude: 44.5750,
        longitude: 11.4120,
        priority: 'Medium',
        targetTime: Date.now() + 3 * 60 * 60 * 1000,
        assignedBy: 'Manager Craig',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-pm-1648',
        projectId: 'PJ003',
        title: 'Half yearly PM for HT Yard',
        siteName: 'Aeroporto di Roma Fiumicino',
        address: "Via dell'Aeroporto di Fiumicino, 320, 00054 Roma (RM), Italy",
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Unassigned',
        dueWindow: '05 Sep 2026',
        eta: 'In Progress',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: 8,
        tools: ['Multimeter', 'Insulation Meter', 'WTI Gauge', 'Lubricant Kit'],
        parts: ['Silica Gel Pack', 'Danger Decals', 'GOS Fuse'],
        technicians: ['Marcus Hale'],
        assetId: 'CP003',
        assetIds: ['CP003'],
        checklistItems: PREVENTIVE_HT_YARD_CHECKLIST,
        offlineReady: true,
        notes: 'Half yearly PM for HT Yard at Aeroporto di Roma Fiumicino. Delta ModelZ (Charger 03).',
        latitude: 41.7999,
        longitude: 12.2462,
        priority: 'Medium',
        targetTime: Date.now() + 5 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        approver: 'Andrea Meuschke',
        primaryApprover: 'Andrea Meuschke',
        secondaryApprover: 'Marcus Aurelius',
        createdBy: 'System',
    },
    {
        id: 'wo-pm-1649',
        projectId: 'PJ004',
        title: 'Monthly PM for EV Infra',
        siteName: 'Powy Hub Torino Centro',
        address: 'Corso Vittorio Emanuele II, 58, 10121 Torino (TO), Italy',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Working',
        dueWindow: '20 Sep 2026',
        eta: 'Active',
        distance: '0.8 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
        tools: ['Multimeter', 'Insulation Meter', 'Thermal Camera'],
        parts: ['Insulation Mat', 'Cable Gland', 'SPD Unit'],
        technicians: ['Marcus Hale', 'Laura'],
        assetId: 'CP004',
        assetIds: ['CP004'],
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Monthly PM for EV Infra at Powy Hub Torino Centro. Delta ModelX (Charger 04).',
        latitude: 45.0622,
        longitude: 7.6784,
        priority: 'High',
        targetTime: Date.now() + 2 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-pm-1650',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Charger',
        siteName: 'Stazione FS Milano Centrale',
        address: "Piazza Duca d'Aosta, 1, 20124 Milano (MI), Italy",
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Under Review',
        dueWindow: '15 Nov 2026',
        eta: '3-Month Cycle',
        distance: '0.2 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        tools: ['Multimeter', 'Insulation Meter'],
        parts: ['Terminal Lugs'],
        technicians: ['James Carter'],
        assetId: 'CP001',
        assetIds: ['CP001'],
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Recurring 3-month cycle PM for Charger 01 at Milano Centrale.',
        latitude: 45.4870,
        longitude: 9.2045,
        priority: 'Medium',
        targetTime: Date.now() + 45 * 24 * 60 * 60 * 1000,
        assignedBy: 'Manager Craig',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-pm-1651',
        projectId: 'PJ002',
        title: 'Monthly PM for EV Charger',
        siteName: 'Autostrada A1 Area Servizio',
        address: 'Autostrada A1 Milano-Napoli KM 15, San Donato Milanese (MI), Italy',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Completed',
        dueWindow: '22 Nov 2026',
        eta: 'Completed',
        distance: '0.5 km',
        checklistCompleted: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        tools: ['Multimeter'],
        parts: [],
        technicians: ['Daniel Brooks'],
        assetId: 'CP002',
        assetIds: ['CP002'],
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Recurring 3-month cycle PM for Charger 02 at Bologna.',
        latitude: 44.5750,
        longitude: 11.4120,
        priority: 'High',
        targetTime: Date.now() - 24 * 60 * 60 * 1000,
        assignedBy: 'Daniel Brooks',
        createdBy: 'James Carter',
    },
    {
        id: 'wo-pm-1652',
        projectId: 'PJ003',
        title: 'Half yearly PM for HT Yard',
        siteName: 'Aeroporto di Roma Fiumicino',
        address: "Via dell'Aeroporto di Fiumicino, 320, 00054 Roma (RM), Italy",
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Unassigned',
        dueWindow: '05 Dec 2026',
        eta: 'Scheduled',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: 8,
        tools: ['Multimeter'],
        parts: [],
        technicians: ['Sarah Johnson'],
        assetId: 'CP003',
        assetIds: ['CP003'],
        checklistItems: PREVENTIVE_HT_YARD_CHECKLIST,
        offlineReady: true,
        notes: 'Recurring 3-month cycle PM for Charger 03 at Roma.',
        latitude: 41.7999,
        longitude: 12.2462,
        priority: 'Medium',
        targetTime: Date.now() + 65 * 24 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-pm-1653',
        projectId: 'PJ004',
        title: 'Monthly PM for EV Infra',
        siteName: 'Powy Hub Torino Centro',
        address: 'Corso Vittorio Emanuele II, 58, 10121 Torino (TO), Italy',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Unassigned',
        dueWindow: '20 Dec 2026',
        eta: 'Scheduled',
        distance: '0.8 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
        tools: ['Thermal camera', 'Multimeter'],
        parts: [],
        technicians: ['Marcus Hale'],
        assetId: 'CP004',
        assetIds: ['CP004'],
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Recurring 3-month cycle PM for Charger 04 at Torino.',
        latitude: 45.0622,
        longitude: 7.6784,
        priority: 'Medium',
        targetTime: Date.now() + 80 * 24 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        createdBy: 'Field Technician',
    },

    // --- RM Works (Synchronized with Web Reactive Maintenance module) ---
    {
        id: 'wo-rm-000',
        projectId: 'PJ001',
        title: 'Emergency PSU Replacement - Milano Centrale',
        siteName: 'Stazione FS Milano Centrale',
        address: "Piazza Duca d'Aosta, 1, 20124 Milano (MI), Italy",
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Assigned',
        dueWindow: '10 Aug - 12 Aug 2026',
        eta: 'In Progress',
        distance: '0.2 km',
        checklistCompleted: 0,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Multimeter', 'Torque Wrench', 'Safety Gloves'],
        parts: ['150kW PSU Module', 'Busbar Screws'],
        technicians: ['Tim', 'Laura'],
        assetId: 'CP001',
        assetIds: ['CP001'],
        offlineReady: true,
        notes: 'Urgent replacement of faulty 150kW power supply module causing charger trip at Milano Centrale.',
        latitude: 45.4870,
        longitude: 9.2045,
        priority: 'High',
        targetTime: Date.now() + 1 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-rm-001',
        projectId: 'PJ003',
        title: 'CCS2 Connector Cable & Pin Fault Repair - Roma Fiumicino',
        siteName: 'Aeroporto di Roma Fiumicino',
        address: "Via dell'Aeroporto di Fiumicino, 320, 00054 Roma (RM), Italy",
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Assigned',
        dueWindow: '22 Aug - 24 Aug 2026',
        eta: 'Starts in 20 min',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Crimping tool', 'Insulation meter', 'Contact pin kit'],
        parts: ['CCS2 Connector Pins', 'Cable Sleeve'],
        technicians: ['John Smith', 'Sarah Johnson'],
        assetId: 'CP003',
        assetIds: ['CP003'],
        offlineReady: true,
        notes: 'Damaged charging connector contact pins and cut insulation repaired and dielectric tested.',
        latitude: 41.7999,
        longitude: 12.2462,
        priority: 'High',
        targetTime: Date.now() + 2 * 60 * 60 * 1000,
        assignedBy: 'Manager Craig',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-rm-002',
        projectId: 'PJ005',
        title: 'Inverter Overheating & Fault Shutdown - Firenze Nord',
        siteName: 'Centro Commerciale Firenze Nord',
        address: 'Via Francesco de Sanctis, 50136 Firenze (FI), Italy',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Working',
        dueWindow: '05 Sep - 07 Sep 2026',
        eta: 'In Progress',
        distance: '2.5 km',
        checklistCompleted: 2,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Clamp meter', 'Thermal camera', 'Screwdriver Set'],
        parts: ['High-capacity Cooling Fan', 'Thermal Paste'],
        technicians: ['Mike Wilson', 'Emily Davis'],
        assetId: 'CP-FIRENZE-01',
        assetIds: ['CP-FIRENZE-01'],
        offlineReady: true,
        notes: 'Thermal shutdown diagnosis, high-capacity cooling fan replacement, and inverter reset.',
        latitude: 43.7765,
        longitude: 11.2480,
        priority: 'High',
        targetTime: Date.now() + 3 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        approver: 'Marcus Aurelius',
        createdBy: 'System',
    },
    {
        id: 'wo-rm-003',
        projectId: 'PJ006',
        title: 'Charger Controller Boot Failure Recovery - Milano Malpensa',
        siteName: 'Aeroporto Malpensa T2',
        address: 'Aeroporto Malpensa Terminal 2, 21010 Somma Lombardo (VA), Italy',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Unassigned',
        dueWindow: '18 Sep - 20 Sep 2026',
        eta: 'Not started',
        distance: '3.8 km',
        checklistCompleted: 0,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Laptop', 'Ethernet Cable', 'Serial Debug Kit'],
        parts: ['Controller SD Card', 'Bootloader Recovery Module'],
        technicians: [],
        assetId: 'CP-MALPENSA-01',
        assetIds: ['CP-MALPENSA-01'],
        offlineReady: true,
        notes: 'Controller board unresponsive after power transient; firmware recovery and bootloader reset.',
        latitude: 45.6301,
        longitude: 8.7255,
        priority: 'Medium',
        targetTime: Date.now() + 12 * 60 * 60 * 1000,
        assignedBy: 'Daniel Brooks',
        createdBy: 'James Carter',
    },
    {
        id: 'wo-rm-004',
        projectId: 'PJ002',
        title: 'DC Isolation Ground Fault Repair - Autostrada A1',
        siteName: 'Autostrada A1 Area Servizio',
        address: 'Autostrada A1 Milano-Napoli KM 15, San Donato Milanese (MI), Italy',
        type: 'Reactive',
        stage: 'Closeout',
        status: 'Completed',
        dueWindow: '02 Oct - 04 Oct 2026',
        eta: 'Completed',
        distance: '0.5 km',
        checklistCompleted: REACTIVE_FAULT_QUESTION_COUNT,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Insulation Megohmmeter', 'Torque Wrench'],
        parts: ['DC Surge Varistor', 'Ground Lug'],
        technicians: ['David Brown', 'Lisa Anderson'],
        assetId: 'CP002',
        assetIds: ['CP002'],
        offlineReady: true,
        notes: 'Ground isolation fault triggered; insulation resistance verified and damaged varistor replaced.',
        latitude: 44.5750,
        longitude: 11.4120,
        priority: 'High',
        targetTime: Date.now() - 48 * 60 * 60 * 1000,
        assignedBy: 'Admin User',
        createdBy: 'Marcus Hale',
    },
    {
        id: 'wo-rm-005',
        projectId: 'PJ007',
        title: 'Liquid Cooling Leak & Thermal Cutoff Repair - Lingotto Fiere',
        siteName: 'Lingotto Fiere',
        address: 'Via Nizza, 294, 10126 Torino (TO), Italy',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Under Review',
        dueWindow: '15 Oct - 17 Oct 2026',
        eta: 'Awaiting Sign-off',
        distance: '1.8 km',
        checklistCompleted: 3,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Pressure test gauge', 'Coolant fill pump'],
        parts: ['Glycol Coolant 5L', 'O-ring Seal Pack', 'Hose Clamp'],
        technicians: ['Lisa Chen'],
        assetId: 'CP-LINGOTTO-01',
        assetIds: ['CP-LINGOTTO-01'],
        offlineReady: true,
        notes: 'Glycol coolant line leak detected and repaired; coolant pressure and flow rate re-established.',
        latitude: 45.0315,
        longitude: 7.6658,
        priority: 'Medium',
        targetTime: Date.now() + 24 * 60 * 60 * 1000,
        assignedBy: 'James Carter',
        createdBy: 'Daniel Brooks',
    },
    {
        id: 'wo-rm-006',
        projectId: 'PJ008',
        title: 'HMI Touchscreen Display Glitch Repair - Parcheggio Duomo',
        siteName: 'Parcheggio Duomo',
        address: 'Via Santa Radegonda, 10, 20121 Milano (MI), Italy',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Working',
        dueWindow: '28 Oct - 30 Oct 2026',
        eta: 'In Progress',
        distance: '0.9 km',
        checklistCompleted: 2,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Display suction tool', 'Precision screwdriver'],
        parts: ['10-inch HMI Display Panel', 'Ribbon Cable'],
        technicians: ['Emily Davis'],
        assetId: 'CP-DUOMO-01',
        assetIds: ['CP-DUOMO-01'],
        offlineReady: true,
        notes: 'Unresponsive touch matrix and distorted LCD panel replaced and touch calibration completed.',
        latitude: 45.4642,
        longitude: 9.1900,
        priority: 'Low',
        targetTime: Date.now() + 4 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        createdBy: 'Admin User',
    },
    {
        id: 'wo-rm-007',
        projectId: 'PJ009',
        title: 'OCPP Gateway Communication Outage - Stazione Termini',
        siteName: 'Stazione Termini',
        address: 'Piazza dei Cinquecento, 1, 00185 Roma (RM), Italy',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Unassigned',
        dueWindow: '12 Nov - 14 Nov 2026',
        eta: 'Not started',
        distance: '1.5 km',
        checklistCompleted: 0,
        checklistTotal: REACTIVE_FAULT_QUESTION_COUNT,
        checklistItems: REACTIVE_FAULT_CHECKLIST,
        tools: ['Multimeter', 'RF Signal Analyzer'],
        parts: ['4G LTE Gateway Modem', 'High-gain Antenna'],
        technicians: [],
        assetId: 'CP-TERMINI-01',
        assetIds: ['CP-TERMINI-01'],
        offlineReady: true,
        notes: '4G LTE modem and antenna replaced to restore offline station communication with central backend.',
        latitude: 41.9010,
        longitude: 12.5015,
        priority: 'Medium',
        targetTime: Date.now() + 30 * 24 * 60 * 60 * 1000,
        assignedBy: 'Admin User',
        createdBy: 'Marcus Hale',
    },
];

export const STATION_BUSINESS_IMPACT: Record<string, 'High' | 'Medium' | 'Low'> = {
    'Stazione FS Milano Centrale': 'High',
    'Autostrada A1 Area Servizio': 'High',
    'Aeroporto di Roma Fiumicino': 'High',
    'Powy Hub Torino Centro': 'High',
    'Centro Commerciale Firenze Nord': 'High',
    'Aeroporto Malpensa T2': 'Medium',
    'Lingotto Fiere': 'Medium',
    'Parcheggio Duomo': 'Medium',
    'Stazione Termini': 'High',
};

export const ASSETS: AssetRecord[] = [
    {
        id: 'asset-cp001',
        cpid: 'CP001',
        serial: 'TWBCE-HU1-4622-131',
        model: 'ABB Terra 54',
        status: 'Healthy',
        location: 'Stazione FS Milano Centrale',
        lastService: '15 May 2026',
        firmware: 'v5.1.0',
        linkedWorkOrderId: 'wo-pm-1646',
        pmAssignee: 'Tim',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-cp002',
        cpid: 'CP002',
        serial: 'TWBCE-HU1-4622-132',
        model: 'ABB Terra 44',
        status: 'Healthy',
        location: 'Autostrada A1 Area Servizio',
        lastService: '22 May 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'wo-pm-1647',
        pmAssignee: 'James Carter',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-cp003',
        cpid: 'CP003',
        serial: 'TWBCE-HU1-4622-133',
        model: 'Delta ModelZ',
        status: 'Service Due',
        location: 'Aeroporto di Roma Fiumicino',
        lastService: '05 Jun 2026',
        firmware: 'v4.5.8',
        linkedWorkOrderId: 'wo-pm-1648',
        pmAssignee: 'Marcus Hale',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-cp004',
        cpid: 'CP004',
        serial: 'TWBCE-HU1-4622-134',
        model: 'Delta ModelX',
        status: 'Healthy',
        location: 'Powy Hub Torino Centro',
        lastService: '20 Jun 2026',
        firmware: 'v4.6.0',
        linkedWorkOrderId: 'wo-pm-1649',
        pmAssignee: 'Laura',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-cp-firenze',
        cpid: 'CP-FIRENZE-01',
        serial: 'TWBCE-HU1-4622-135',
        model: 'Tritium RTM75',
        status: 'Offline',
        location: 'Centro Commerciale Firenze Nord',
        lastService: '05 Sep 2026',
        firmware: 'v4.4.9',
        linkedWorkOrderId: 'wo-rm-002',
    },
    {
        id: 'asset-cp-malpensa',
        cpid: 'CP-MALPENSA-01',
        serial: 'TWBCE-HU1-4622-136',
        model: 'ABB Terra 54',
        status: 'Healthy',
        location: 'Aeroporto Malpensa T2',
        lastService: '18 Sep 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'wo-rm-003',
    },
    {
        id: 'asset-cp-lingotto',
        cpid: 'CP-LINGOTTO-01',
        serial: 'TWBCE-HU1-4622-137',
        model: 'ABB Terra 54',
        status: 'Healthy',
        location: 'Lingotto Fiere',
        lastService: '15 Oct 2026',
        firmware: 'v2.1.0',
        linkedWorkOrderId: 'wo-rm-005',
    },
    {
        id: 'asset-cp-duomo',
        cpid: 'CP-DUOMO-01',
        serial: 'TWBCE-HU1-4622-138',
        model: 'Kempower Satellite',
        status: 'Healthy',
        location: 'Parcheggio Duomo',
        lastService: '28 Oct 2026',
        firmware: 'v2.3.0',
        linkedWorkOrderId: 'wo-rm-006',
    },
    {
        id: 'asset-cp-termini',
        cpid: 'CP-TERMINI-01',
        serial: 'TWBCE-HU1-4622-139',
        model: 'Delta UFC 200',
        status: 'Offline',
        location: 'Stazione Termini',
        lastService: '12 Nov 2026',
        firmware: 'v3.8.0',
        linkedWorkOrderId: 'wo-rm-007',
    },
];

export const ASSET_VISION_DETAILS: Record<string, AssetVisionDetail> = {
    'asset-1': {
        chargerLabel: 'Charge Point 1001',
        commissionedOn: '12 Oct 2023',
        siteLead: 'Marco Rossi',
        contactNumber: '+39 011 556 4211',
        peakPower: '360 kW',
        voltageRange: '400 - 920 V',
        currentRating: '250 A',
        connectors: '4',
        warrantyTill: '18 Oct 2027',
        alerts: [
            { id: 'alert-1', title: 'Charger offline', priority: 'High', status: 'Open', date: '10 Oct 2024' },
            { id: 'alert-2', title: 'Consistent high temperature', priority: 'Highest', status: 'Assigned', date: '09 Oct 2024' },
            { id: 'alert-3', title: 'Irregular power delivery', priority: 'Medium', status: 'Open', date: '08 Oct 2024' },
        ],
        workHistory: [
            { id: 'work-1', title: 'DC fast charger install', date: '09 Dec 2024', status: 'Open', linkedWorkOrderId: 'wo-101' },
            { id: 'work-2', title: 'Connector fault investigation', date: '11 Dec 2024', status: 'Open', linkedWorkOrderId: 'wo-102' },
            { id: 'work-3', title: 'Power module replacement', date: '13 Aug 2024', status: 'Closed' },
        ],
        realtimeEvents: [
            { id: 'rt-1', realTime: '10 Oct 2024 12:27 PM', receivedTime: '10 Oct 2024 12:27 PM', recordId: '11098766-res-01' },
            { id: 'rt-2', realTime: '09 Oct 2024 06:45 PM', receivedTime: '09 Oct 2024 06:47 PM', recordId: '11098766-res-02' },
            { id: 'rt-3', realTime: '08 Oct 2024 08:14 AM', receivedTime: '08 Oct 2024 08:15 AM', recordId: '11098766-res-03' },
        ],
    },
    'asset-2': {
        chargerLabel: 'Charge Point 2004',
        commissionedOn: '05 Jan 2024',
        siteLead: 'Sagar',
        contactNumber: '+91 98220 44112',
        peakPower: '150 kW',
        voltageRange: '380 - 920 V',
        currentRating: '220 A',
        connectors: '2',
        warrantyTill: '05 Jan 2028',
        alerts: [
            { id: 'alert-4', title: 'Handshake timeout', priority: 'High', status: 'Assigned', date: '06 Apr 2026' },
            { id: 'alert-5', title: 'Door sensor warning', priority: 'Medium', status: 'Open', date: '05 Apr 2026' },
        ],
        workHistory: [
            { id: 'work-4', title: 'Connector fault investigation', date: '02 Feb 2026', status: 'Open', linkedWorkOrderId: 'wo-102' },
            { id: 'work-5', title: 'Fuse set replacement', date: '18 Jan 2026', status: 'Closed' },
        ],
        realtimeEvents: [
            { id: 'rt-4', realTime: '06 Apr 2026 09:45 AM', receivedTime: '06 Apr 2026 09:46 AM', recordId: '12014544-res-11' },
            { id: 'rt-5', realTime: '05 Apr 2026 07:13 PM', receivedTime: '05 Apr 2026 07:14 PM', recordId: '12014544-res-12' },
        ],
    },
    'asset-3': {
        chargerLabel: 'Charge Point 3012',
        commissionedOn: '21 Jul 2023',
        siteLead: 'Neha',
        contactNumber: '+91 88990 11234',
        peakPower: '75 kW',
        voltageRange: '150 - 920 V',
        currentRating: '200 A',
        connectors: '2',
        warrantyTill: '21 Jul 2027',
        alerts: [
            { id: 'alert-6', title: 'Cable wear warning', priority: 'Medium', status: 'Open', date: '04 Apr 2026' },
        ],
        workHistory: [
            { id: 'work-6', title: 'Quarterly preventive service', date: '11 Mar 2026', status: 'Assigned', linkedWorkOrderId: 'wo-103' },
            { id: 'work-7', title: 'Cooling fan inspection', date: '12 Dec 2025', status: 'Closed' },
        ],
        realtimeEvents: [
            { id: 'rt-6', realTime: '05 Apr 2026 11:02 AM', receivedTime: '05 Apr 2026 11:02 AM', recordId: '11887644-res-21' },
            { id: 'rt-7', realTime: '03 Apr 2026 01:26 PM', receivedTime: '03 Apr 2026 01:27 PM', recordId: '11887644-res-22' },
        ],
    },
    'asset-4': {
        chargerLabel: 'Charge Point 4018',
        commissionedOn: '17 Nov 2023',
        siteLead: 'Sara',
        contactNumber: '+91 93450 77118',
        peakPower: '200 kW',
        voltageRange: '400 - 1000 V',
        currentRating: '400 A',
        connectors: '4',
        warrantyTill: '17 Nov 2027',
        alerts: [
            { id: 'alert-7', title: 'Charger offline', priority: 'Highest', status: 'Open', date: '07 Apr 2026' },
            { id: 'alert-8', title: 'Network packet loss', priority: 'High', status: 'Assigned', date: '06 Apr 2026' },
        ],
        workHistory: [
            { id: 'work-8', title: 'Commissioning safety audit', date: '21 Mar 2026', status: 'Open', linkedWorkOrderId: 'wo-105' },
            { id: 'work-9', title: 'Output contactor reset', date: '14 Feb 2026', status: 'Closed' },
        ],
        realtimeEvents: [
            { id: 'rt-8', realTime: '07 Apr 2026 06:18 AM', receivedTime: '07 Apr 2026 06:19 AM', recordId: '13008721-res-31' },
            { id: 'rt-9', realTime: '06 Apr 2026 10:31 PM', receivedTime: '06 Apr 2026 10:31 PM', recordId: '13008721-res-32' },
        ],
    },
    'asset-5': {
        chargerLabel: 'Charge Point 1002',
        commissionedOn: '12 Oct 2023',
        siteLead: 'Rohit',
        contactNumber: '+91 82488 6155',
        peakPower: '360 kW',
        voltageRange: '400 - 920 V',
        currentRating: '250 A',
        connectors: '4',
        warrantyTill: '18 Oct 2027',
        alerts: [],
        workHistory: [],
        realtimeEvents: [],
    },
    'asset-6': {
        chargerLabel: 'Charge Point 1003',
        commissionedOn: '12 Oct 2023',
        siteLead: 'Rohit',
        contactNumber: '+91 82488 6155',
        peakPower: '200 kW',
        voltageRange: '400 - 920 V',
        currentRating: '200 A',
        connectors: '2',
        warrantyTill: '18 Oct 2027',
        alerts: [],
        workHistory: [],
        realtimeEvents: [],
    },
};


export const ACTIVITY_LOG: ActivityItem[] = [
    {
        id: 'act-1',
        type: 'status',
        title: 'Work accepted',
        detail: 'Cached locally for offline execution.',
        time: '09:12',
    },
    {
        id: 'act-2',
        type: 'comment',
        title: 'Dispatcher note',
        detail: 'Customer requests photo proof before re-energizing the charger.',
        time: '09:18',
    },
    {
        id: 'act-3',
        type: 'sync',
        title: 'Last sync',
        detail: '4 items waiting for upload. Safe to continue offline.',
        time: '09:24',
    },
];

export const getWorkOrderById = (taskId?: string) =>
    WORK_ORDERS.find((item) => item.id === taskId) ?? WORK_ORDERS[0];

export const getAssetById = (assetId?: string) =>
    ASSETS.find((item) => item.id === assetId) ?? ASSETS[0];

export const getAssetVisionDetailById = (assetId?: string) =>
    ASSET_VISION_DETAILS[assetId ?? ''] ?? ASSET_VISION_DETAILS[ASSETS[0].id];

// --- PM Auto-Schedule and Request Logic ---
export const addWorkOrder = (wo: WorkOrder) => {
    WORK_ORDERS = [wo, ...WORK_ORDERS];
    
    if (ASSET_VISION_DETAILS[wo.assetId]) {
        ASSET_VISION_DETAILS[wo.assetId].workHistory = [
            {
                id: `work-auto-${Date.now()}`,
                title: wo.title,
                date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                status: 'Assigned',
                linkedWorkOrderId: wo.id,
            },
            ...ASSET_VISION_DETAILS[wo.assetId].workHistory,
        ];
    }
};

export const autoSchedulePMs = () => {
    const now = new Date();
    
    ASSETS.forEach((asset) => {
        if (asset.pmAssignee && asset.pmDurationMonths) {
            const lastServiceDate = new Date(asset.lastService);
            const dueDate = new Date(lastServiceDate);
            dueDate.setMonth(dueDate.getMonth() + asset.pmDurationMonths);
            
            if (now >= dueDate) {
                // Check if a Preventive WO already exists for this asset in "Unassigned" or "Assigned" or "Working"
                const existingPM = WORK_ORDERS.find(
                    (wo) => wo.assetId === asset.id && wo.type === 'Preventive' && (wo.status === 'Unassigned' || wo.status === 'Assigned' || wo.status === 'Working')
                );
                
                if (!existingPM) {
                    const newWoId = `wo-auto-${Date.now()}-${asset.id}`;
                    addWorkOrder({
                        id: newWoId,
                        projectId: `PJ-AUTO-${Math.floor(Math.random() * 1000)}`,
                        title: 'Auto-Scheduled Preventive Maintenance',
                        siteName: asset.location,
                        address: 'Location Address',
                        type: 'Preventive',
                        stage: 'Inspection',
                        status: 'Unassigned',
                        dueWindow: 'Scheduled by System',
                        eta: 'Pending',
                        distance: '0.0 km',
                        checklistCompleted: 0,
                        checklistTotal: 5,
                        tools: ['Inspection kit'],
                        parts: [],
                        technicians: [asset.pmAssignee],
                        assetId: asset.id,
                        offlineReady: true,
                        notes: 'System auto-scheduled PM based on maintenance due date.',
                        latitude: 0,
                        longitude: 0,
                        priority: 'Medium',
                        targetTime: dueDate.getTime(),
                    });
                }
            }
        }
    });
};

export const requestPM = (assetId: string, notes: string, hasAttachment: boolean, user: string) => {
    const asset = getAssetById(assetId);
    const newWoId = `wo-req-${Date.now()}`;
    addWorkOrder({
        id: newWoId,
        projectId: `PJ-REQ-${Math.floor(Math.random() * 1000)}`,
        title: 'Requested Preventive Maintenance',
        siteName: asset.location,
        address: 'Location Address',
        type: 'Preventive',
        stage: 'Requested',
        status: 'Unassigned',
        dueWindow: 'ASAP',
        eta: 'Pending Dispatch',
        distance: '0.0 km',
        checklistCompleted: 0,
        checklistTotal: 5,
        tools: ['Inspection kit'],
        parts: [],
        technicians: [user],
        assetId: asset.id,
        offlineReady: true,
        notes: `${notes}${hasAttachment ? ' (Attachment included)' : ''}`,
        latitude: 0,
        longitude: 0,
        priority: 'High',
        targetTime: Date.now() + 24 * 60 * 60 * 1000, // Due in 24 hours
    });
};

// Run on load
autoSchedulePMs();

