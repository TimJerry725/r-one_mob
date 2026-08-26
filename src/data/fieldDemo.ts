export type WorkOrderStatus = 'Unassigned' | 'Assigned' | 'Working' | 'Under Review' | 'Completed' | 'Requested';

export type WorkOrder = {
    id: string;
    projectId: string;
    title: string;
    siteName: string;
    address: string;
    type: 'Installation' | 'Service' | 'Preventive';
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
    defaultValue?: string;
    isReadOnly?: boolean;
};

export type ActivityItem = {
    id: string;
    type: 'status' | 'comment' | 'sync';
    title: string;
    detail: string;
    time: string;
};

export const CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = [
    {
        id: 'step-1',
        label: 'Date of service',
        type: 'date',
        required: true,
    },
    {
        id: 'step-2',
        label: 'Charger visual condition',
        type: 'radio',
        required: true,
        options: ['Pass', 'Needs cleaning', 'Damage found'],
    },
    {
        id: 'step-3',
        label: 'Connector temperature or voltage note',
        type: 'text',
        required: true,
    },
    {
        id: 'step-4',
        label: 'Capture enclosure and connector photos',
        type: 'photo',
        required: true,
    },
    {
        id: 'step-5',
        label: 'Customer access area restored and verified',
        type: 'toggle',
        required: true,
    },
    {
        id: 'step-6',
        label: 'Parts used',
        type: 'radio',
        required: false,
        options: ['None', 'Fuse set', 'Cable', 'Connector latch'],
    },
    {
        id: 'step-7',
        label: 'Voltage reading (V)',
        type: 'number',
        required: true,
    },
    {
        id: 'step-8',
        label: 'Next service date',
        type: 'date',
        required: false,
    },
    {
        id: 'step-9',
        label: 'Hardware upgrade needed?',
        type: 'not_applicable',
        required: false,
    },
    {
        id: 'step-10',
        label: 'Cellular network',
        type: 'radio',
        required: true,
        options: ['Vodafone', 'AT&T', 'Verizon', 'T-Mobile'],
    },
    {
        id: 'step-11',
        label: 'Power module type',
        type: 'radio',
        required: true,
        options: ['AC 22kW', 'DC 50kW', 'DC 150kW'],
    },
    {
        id: 'step-12',
        label: 'Consumables applied',
        type: 'multiselect',
        required: false,
        options: ['Thermal paste', 'Cable ties', 'Insulation tape', 'Screws'],
    },
    {
        id: 'step-13',
        label: 'Attach site survey files',
        type: 'media',
        dataType: 'Media',
        required: true,
    },
    {
        id: 'step-14',
        label: 'Three-phase input voltage measurements',
        type: 'three_phase_voltage',
        dataType: '3 phase voltage',
        required: true,
    },
    {
        id: 'step-15',
        label: 'Site supervisor contact email',
        type: 'email',
        dataType: 'Email',
        required: false,
    },
    {
        id: 'step-16',
        label: 'Detailed maintenance remarks & logs',
        type: 'textarea',
        dataType: 'Long text',
        required: false,
    },
    {
        id: 'step-17',
        label: 'Safety equipment checks completed',
        type: 'checkbox',
        dataType: 'Checkbox',
        required: true,
        options: ['Earthing line ok', 'Insulation gloves used', 'Danger sign placed', 'Fire extinguisher present'],
    },
];

const instructionLabel = (content: string) => {
    const trimmed = content.trim();
    return /^instruction:/i.test(trimmed) ? trimmed : `Instruction: ${trimmed}`;
};

const instructionRow = (id: string, content: string): ChecklistTemplateItem => ({
    id,
    label: instructionLabel(content),
    type: 'none',
    dataType: 'None',
    required: false,
    isReadOnly: true,
});

const yesNoRadio = (id: string, label: string, showWhenFieldId?: string): ChecklistTemplateItem => ({
    id,
    label,
    type: 'radio',
    required: true,
    options: ['Yes', 'No'],
    ...(showWhenFieldId ? { showWhenFieldId, showWhenEquals: 'Yes' } : {}),
});

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

const section = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'section_header', required: false });
const checklist = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'checklist_header', required: false });

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

export let WORK_ORDERS: WorkOrder[] = [
    {
        id: 'wo-pm-infra-01',
        projectId: 'PJ001',
        title: 'Preventive Maintenance for EV Infra',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Assigned',
        dueWindow: 'Today, 09:00 - 12:00',
        eta: 'Starts in 10 min',
        distance: '0.5 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
        tools: ['Multimeter', 'Blower', 'Anti-rust Spray', 'Insulation Meter'],
        parts: ['Insulation Mat', 'Cable Gland', 'SPD Unit'],
        technicians: ['Tim', 'Neha'],
        assetId: 'CPID-KN-01',
        assetIds: ['CPID-KN-01', 'CPID-KN-02'],
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Preventive Maintenance for EV Infra. Complete EV Infra PM checklist grouped by Excel yellow sections.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 3 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
    },
    {
        id: 'wo-pm-ht-yard-01',
        projectId: 'PJ001',
        title: 'Preventive Maintenance for HT Yard',
        siteName: 'Skyline Mall Parking Hub',
        address: 'MG Road Basement B2, Bengaluru',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Working',
        dueWindow: 'Today, 14:00 - 17:00',
        eta: 'In Progress',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: 22,
        tools: ['Multimeter', 'Insulation Meter', 'WTI Gauge', 'Lubricant Kit'],
        parts: ['Silica Gel Pack', 'Danger Decals', 'GOS Fuse'],
        technicians: ['Tim', 'Arjun'],
        assetId: 'CP-100102',
        assetIds: ['CP-100102', 'CP-100103'],
        checklistItems: PREVENTIVE_HT_YARD_CHECKLIST,
        offlineReady: true,
        notes: 'Preventive Maintenance for HT Yard. Complete all 22 HT yard checks.',
        latitude: 12.9754,
        longitude: 77.6056,
        priority: 'Medium',
        targetTime: Date.now() + 5 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
        approver: 'Andrea Meuschke',
    },
    {
        id: 'wo-101',
        projectId: 'PJ001',
        title: 'DC Fast Charger Install',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Site Prep',
        status: 'Assigned',
        dueWindow: 'Today, 09:30 - 12:30',
        eta: 'Starts in 35 min',
        distance: '0.8 km',
        checklistCompleted: 1,
        checklistTotal: 7,
        tools: ['Torque wrench', 'Insulation meter'],
        parts: ['CCS cable', 'Breaker kit'],
        technicians: ['Tim', 'Arjun'],
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240', 'CP-100241'],
        offlineReady: true,
        notes: 'Heavy public traffic. Customer requests zero downtime for adjacent chargers.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'Medium',
        targetTime: Date.now() + 2 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
    },
    {
        id: 'wo-101-b',
        projectId: 'PJ001',
        title: 'Site Prep Phase 2',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Site Prep',
        status: 'Working',
        dueWindow: 'Today, 10:30 - 13:30',
        eta: 'Started',
        distance: '0.8 km',
        checklistCompleted: 4,
        checklistTotal: 7,
        tools: ['Power drill'],
        parts: ['Anchors'],
        technicians: ['Arjun'],
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240', 'CP-100241'],
        offlineReady: true,
        notes: 'Follow up on foundation work.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 1 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
    },
    {
        id: 'wo-101-c',
        projectId: 'PJ001',
        title: 'Pre-Commissioning Checks',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Commissioning',
        status: 'Assigned',
        dueWindow: 'Tomorrow, 09:30 - 12:30',
        eta: 'Not started',
        distance: '0.8 km',
        checklistCompleted: 0,
        checklistTotal: 5,
        tools: ['Multimeter'],
        parts: [],
        technicians: ['Tim'],
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240', 'CP-100241'],
        offlineReady: true,
        notes: 'Check wiring before final energization.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'Medium',
        targetTime: Date.now() + 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-101-d',
        projectId: 'PJ001',
        title: 'Cable Routing & Trenching',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Site Prep',
        status: 'Completed',
        dueWindow: 'Completed on 21 Jun',
        eta: 'Done',
        distance: '0.8 km',
        checklistCompleted: 5,
        checklistTotal: 6,
        tools: ['Trench digger', 'Conduit'],
        parts: ['PVC Conduit', 'Warning Tape'],
        technicians: ['Arjun', 'Ravi'],
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240', 'CP-100241'],
        checklistItems: [
            ...CHECKLIST_TEMPLATE.slice(0, 5),
            {
                id: 'step-cr-remarks',
                label: '',
                type: 'remarks_response',
                required: true,
            }
        ],
        offlineReady: true,
        notes: 'Trenching completed successfully without hitting utility lines.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'Low',
        targetTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-101-e',
        projectId: 'PJ001',
        title: 'Network Switch Configuration',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Commissioning',
        status: 'Under Review',
        dueWindow: 'Yesterday, 14:00 - 15:30',
        eta: 'Awaiting QC approval',
        distance: '0.8 km',
        checklistCompleted: 3,
        checklistTotal: 3,
        tools: ['Laptop', 'Ethernet Cable'],
        parts: [],
        technicians: ['Tim'],
        assetId: 'CP-100239',
        offlineReady: true,
        notes: 'Network is stable but needs remote ping test confirmation.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'Medium',
        targetTime: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-101-f',
        projectId: 'PJ001',
        title: 'Final Customer Sign-off',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Installation',
        stage: 'Closeout',
        status: 'Assigned',
        dueWindow: 'Next Week, 10:00 - 11:00',
        eta: 'Scheduled',
        distance: '0.8 km',
        checklistCompleted: 0,
        checklistTotal: 2,
        tools: ['Tablet'],
        parts: [],
        technicians: ['Tim', 'Neha'],
        assetId: 'CP-100239',
        offlineReady: true,
        notes: 'Ensure all site pictures are uploaded before customer review.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 5 * 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-102',
        projectId: 'PJ002',
        title: 'Connector Fault Investigation',
        siteName: 'Mumbai Highway Point',
        address: 'NH48 Service Lane, Panvel',
        type: 'Service',
        stage: 'Fault Check',
        status: 'Assigned',
        dueWindow: 'Today, 13:00 - 16:00',
        eta: 'Starts in 20 min',
        distance: '1.6 km',
        checklistCompleted: 5,
        checklistTotal: 8,
        tools: ['Clamp meter', 'Laptop'],
        parts: ['Connector latch', 'Fuse set'],
        technicians: ['Tim'],
        assetId: 'CP-200451',
        offlineReady: true,
        notes: 'Intermittent handshake failure reported overnight.',
        latitude: 18.5324,
        longitude: 73.8456,
        priority: 'High',
        targetTime: Date.now() + 1 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
    },
    {
        id: 'wo-103',
        projectId: 'PJ003',
        title: 'Quarterly Preventive Service',
        siteName: 'Skyline Mall Parking',
        address: 'MG Road Basement B2, Bengaluru',
        type: 'Preventive',
        stage: 'Inspection',
        status: 'Under Review',
        dueWindow: 'Tomorrow, 08:00 - 11:00',
        eta: 'Cached for offline',
        distance: '2.4 km',
        checklistCompleted: 0,
        checklistTotal: 6,
        tools: ['Cleaning kit', 'Thermal camera'],
        parts: ['Air filter'],
        technicians: ['Tim', 'Neha'],
        assetId: 'CP-100102',
        offlineReady: true,
        notes: 'Customer asked for image evidence of cable wear and enclosure seal.',
        latitude: 12.9754,
        longitude: 77.6056,
        priority: 'Low',
        targetTime: Date.now() + 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-104',
        projectId: 'PJ004',
        title: 'Cable Replacement and Test',
        siteName: 'Industrial Zone B',
        address: 'Plot 14, Peenya, Bengaluru',
        type: 'Service',
        stage: 'Closeout',
        status: 'Completed',
        dueWindow: 'Completed on 22 Mar',
        eta: 'Signed off',
        distance: '5.1 km',
        checklistCompleted: 8,
        checklistTotal: 8,
        tools: ['Crimping tool', 'Insulation meter'],
        parts: ['Output cable'],
        technicians: ['Tim'],
        assetId: 'CP-300182',
        offlineReady: true,
        notes: 'Customer signature stored offline and synced later.',
        latitude: 12.9912,
        longitude: 77.5349,
        priority: 'Medium',
        targetTime: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-105',
        projectId: 'PJ005',
        title: 'Commissioning Safety Audit',
        siteName: 'City Square Terminal',
        address: 'T Nagar Bus Hub, Chennai',
        type: 'Installation',
        stage: 'Commissioning',
        status: 'Working',
        dueWindow: 'Today, 17:00 - 19:00',
        eta: '2 checkpoints left',
        distance: '3.3 km',
        checklistCompleted: 4,
        checklistTotal: 6,
        tools: ['PAT tester', 'Label kit'],
        parts: ['Safety decals'],
        technicians: ['Tim', 'Sara'],
        assetId: 'CP-100555',
        offlineReady: false,
        notes: 'Weak network on site. Manual sync may be required.',
        latitude: 13.0418,
        longitude: 80.2341,
        priority: 'High',
        targetTime: Date.now() + 5 * 60 * 60 * 1000,
    },
    {
        id: 'wo-106',
        projectId: 'PJ006',
        title: 'Expansion Bay Preventive Checklist',
        siteName: 'Harbor Transit Hub',
        address: 'Dock Access Road, Kochi',
        type: 'Preventive',
        stage: 'Inspection',
        status: 'Requested',
        isRequested: true,
        dueWindow: 'Tomorrow, 14:00 - 16:00',
        eta: 'Request Pending',
        distance: '4.7 km',
        checklistCompleted: 0,
        checklistTotal: 5,
        tools: ['Inspection torch'],
        parts: [],
        technicians: ['Tim'],
        assetId: 'CP-400210',
        checklistItems: [],
        offlineReady: true,
        notes: 'Preventive request sent to Central Team.',
        latitude: 9.9312,
        longitude: 76.2673,
        priority: 'Medium',
        targetTime: Date.now() + 48 * 60 * 60 * 1000,
    },
    {
        id: 'wo-107',
        projectId: 'PJ001',
        title: 'Quarterly Inverter & Cable Inspection',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Preventive',
        stage: 'Scheduled',
        status: 'Unassigned',
        isRequested: false,
        dueWindow: '24 Aug 2026',
        eta: 'Pending Request',
        distance: '0.8 km',
        checklistCompleted: 0,
        checklistTotal: 6,
        tools: ['Thermal camera', 'Multimeter'],
        parts: ['DC Fuses'],
        technicians: ['Unassigned'],
        assetId: 'CPID-KN-01',
        offlineReady: true,
        notes: 'Preventive maintenance work ready to send request.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 10 * 24 * 60 * 60 * 1000,
    },
    {
        id: 'wo-108',
        projectId: 'PJ002',
        title: 'HV Transformer Thermal Imaging & Calibration',
        siteName: 'Mumbai Highway Point',
        address: 'NH48 Service Lane, Panvel',
        type: 'Preventive',
        stage: 'Calibration',
        status: 'Assigned',
        isRequested: false,
        dueWindow: '28 Aug 2026',
        eta: 'Scheduled',
        distance: '1.5 km',
        checklistCompleted: 0,
        checklistTotal: 4,
        tools: ['Calibrator', 'Safety gloves'],
        parts: [],
        technicians: ['Arjun'],
        assetId: 'CPID-KN-01',
        offlineReady: true,
        notes: 'Semi-annual HV transformer check.',
        latitude: 19.0760,
        longitude: 72.8777,
        priority: 'Medium',
        targetTime: Date.now() + 14 * 24 * 60 * 60 * 1000,
    },
];

export const STATION_BUSINESS_IMPACT: Record<string, 'High' | 'Medium' | 'Low'> = {
    'Pune Central Station': 'High',
    'Mumbai Highway Point': 'High',
    'Skyline Mall Parking': 'Medium',
    'Industrial Zone B': 'Low',
    'City Square Terminal': 'High',
    'Harbor Transit Hub': 'Low',
};

export const ASSETS: AssetRecord[] = [
    {
        id: 'asset-1',
        cpid: 'CP-100239',
        serial: 'RONE-778392',
        model: 'ABB Terra 360',
        status: 'Healthy',
        location: 'Pune Central Station',
        lastService: '18 Mar 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'wo-101',
        pmAssignee: 'Tim',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-2',
        cpid: 'CP-200451',
        serial: 'RONE-661205',
        model: 'Tritium PKM150',
        status: 'Service Due',
        location: 'Mumbai Highway Point',
        lastService: '02 Feb 2026',
        firmware: 'v4.5.8',
        linkedWorkOrderId: 'wo-102',
    },
    {
        id: 'asset-3',
        cpid: 'CP-100102',
        serial: 'RONE-550412',
        model: 'Tritium RTM75',
        status: 'Healthy',
        location: 'Skyline Mall Parking',
        lastService: '11 Mar 2026',
        firmware: 'v4.6.0',
        linkedWorkOrderId: 'wo-103',
        pmAssignee: 'Arjun',
        pmDurationMonths: 1, // Will be overdue if current month is June
    },
    {
        id: 'asset-4',
        cpid: 'CP-100555',
        serial: 'RONE-903117',
        model: 'Delta UFC 200',
        status: 'Offline',
        location: 'City Square Terminal',
        lastService: '21 Mar 2026',
        firmware: 'v4.4.9',
        linkedWorkOrderId: 'wo-105',
    },
    {
        id: 'asset-5',
        cpid: 'CP-100240',
        serial: 'RONE-778393',
        model: 'ABB Terra 360',
        status: 'Healthy',
        location: 'Pune Central Station',
        lastService: '18 Mar 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'wo-101',
    },
    {
        id: 'asset-6',
        cpid: 'CP-100241',
        serial: 'RONE-778394',
        model: 'Kempower Satellite',
        status: 'Healthy',
        location: 'Pune Central Station',
        lastService: '18 Mar 2026',
        firmware: 'v2.1.0',
        linkedWorkOrderId: 'wo-101',
    },
];

export const ASSET_VISION_DETAILS: Record<string, AssetVisionDetail> = {
    'asset-1': {
        chargerLabel: 'Charge Point 1001',
        commissionedOn: '12 Oct 2023',
        siteLead: 'Rohit',
        contactNumber: '+91 82488 6155',
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

