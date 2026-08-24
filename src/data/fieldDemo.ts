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
    type: 'toggle' | 'text' | 'textarea' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'checkbox' | 'dropdown' | 'media' | 'remarks_response' | 'three_phase_voltage' | 'email' | 'section_header';
    dataType?: string;
    required: boolean;
    options?: string[];
    /** For radio/checkbox visual-check tasks: show Remarks/Photo rows only when this field's value equals this */
    showWhenFieldId?: string;
    showWhenEquals?: string;
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

const vcRadio = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'radio', required: true, options: ['Yes', 'No'] });
const remarksRow = (id: string, vcId: string, hint?: string): ChecklistTemplateItem => ({ id, label: hint ? `Remarks — ${hint}` : 'Remarks', type: 'textarea', required: false, showWhenFieldId: vcId, showWhenEquals: 'Yes' });
const photoRow = (id: string, vcId: string): ChecklistTemplateItem => ({ id, label: 'Photo', type: 'media', required: false, showWhenFieldId: vcId, showWhenEquals: 'Yes' });
const section = (id: string, label: string): ChecklistTemplateItem => ({ id, label, type: 'section_header', required: false });

export const PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST: ChecklistTemplateItem[] = [
    // ── Section 1 ──────────────────────────────────────────────────
    section('evpm-sec-1', 'Electrical: LT/Main DB Panel (Public Charging)'),
    vcRadio('evpm-t1-vc', 'Check cables in the cable alley for cuts or discoloration.'),
    remarksRow('evpm-t1-rem', 'evpm-t1-vc', 'If cuts or discoloration is found, replace it.'),
    photoRow('evpm-t1-ph', 'evpm-t1-vc'),
    vcRadio('evpm-t2-vc', 'Ensure all dummy holes in the cable alley are properly sealed.'),
    remarksRow('evpm-t2-rem', 'evpm-t2-vc', 'seal if open'),
    photoRow('evpm-t2-ph', 'evpm-t2-vc'),
    vcRadio('evpm-t3-vc', 'Verify surge protection device functionality and look for warning indicators.'),
    remarksRow('evpm-t3-rem', 'evpm-t3-vc', 'check with warning indicators'),
    photoRow('evpm-t3-ph', 'evpm-t3-vc'),
    vcRadio('evpm-t4-vc', 'Confirm the absence of loose or temporary connections.'),
    remarksRow('evpm-t4-rem', 'evpm-t4-vc', 'check for burns'),
    photoRow('evpm-t4-ph', 'evpm-t4-vc'),
    vcRadio('evpm-t5-vc', 'Ensure phase indication lamps are operational.'),
    remarksRow('evpm-t5-rem', 'evpm-t5-vc'),
    photoRow('evpm-t5-ph', 'evpm-t5-vc'),
    vcRadio('evpm-t6-vc', 'Verify the multi-functional meter displays accurate readings.'),
    remarksRow('evpm-t6-rem', 'evpm-t6-vc', 'verify with multimeter'),
    photoRow('evpm-t6-ph', 'evpm-t6-vc'),
    vcRadio('evpm-t7-vc', 'Confirm correct installation of insulating shrouds.'),
    remarksRow('evpm-t7-rem', 'evpm-t7-vc', 'install if missing'),
    photoRow('evpm-t7-ph', 'evpm-t7-vc'),
    vcRadio('evpm-t8-vc', 'Check for signs of rodent presence near the panel.'),
    remarksRow('evpm-t8-rem', 'evpm-t8-vc'),
    photoRow('evpm-t8-ph', 'evpm-t8-vc'),
    vcRadio('evpm-t9-vc', 'Ensure the internal area is free of dust and debris.'),
    remarksRow('evpm-t9-rem', 'evpm-t9-vc', 'To be cleaned using blower when required'),
    photoRow('evpm-t9-ph', 'evpm-t9-vc'),
    vcRadio('evpm-t10-vc', 'Inspect surroundings for signs of water accumulation.'),
    remarksRow('evpm-t10-rem', 'evpm-t10-vc', 'check for water marks, click picture'),
    photoRow('evpm-t10-ph', 'evpm-t10-vc'),
    vcRadio('evpm-t11-vc', 'Verify IS15652 compliance and ensure the insulation mat is undamaged.'),
    remarksRow('evpm-t11-rem', 'evpm-t11-vc', 'Replace if damaged or stolen'),
    photoRow('evpm-t11-ph', 'evpm-t11-vc'),
    vcRadio('evpm-t12-vc', 'Ensure cable glands are securely fitted, correctly sized, and free of gaps.'),
    remarksRow('evpm-t12-rem', 'evpm-t12-vc', 'tighten if loose; replace if damaged'),
    photoRow('evpm-t12-ph', 'evpm-t12-vc'),
    vcRadio('evpm-t13-vc', 'Confirm the single line diagram (SLD) is displayed inside the panel door.'),
    remarksRow('evpm-t13-rem', 'evpm-t13-vc', 'if no, paste the diagram'),
    photoRow('evpm-t13-ph', 'evpm-t13-vc'),
    vcRadio('evpm-t14-vc', 'Inspect terminal blocks and cable terminations for overheating or damage.'),
    remarksRow('evpm-t14-rem', 'evpm-t14-vc'),
    photoRow('evpm-t14-ph', 'evpm-t14-vc'),
    vcRadio('evpm-t15-vc', 'Ensure the power distribution board (PDB) is clean internally and externally.'),
    remarksRow('evpm-t15-rem', 'evpm-t15-vc', 'Clean using blower'),
    photoRow('evpm-t15-ph', 'evpm-t15-vc'),
    vcRadio('evpm-t16-vc', 'Measure neutral-to-earth voltage and verify earth integrity.'),
    remarksRow('evpm-t16-rem', 'evpm-t16-vc', 'Check using voltmeter or multimeter, write reading'),
    photoRow('evpm-t16-ph', 'evpm-t16-vc'),
    vcRadio('evpm-t17-vc', 'Record power factor, current, voltage, KW, KWH, and demand from the MFM.'),
    remarksRow('evpm-t17-rem', 'evpm-t17-vc', 'Record reading'),
    photoRow('evpm-t17-ph', 'evpm-t17-vc'),
    vcRadio('evpm-t18-vc', 'No MCCB is in bypassed condition.'),
    remarksRow('evpm-t18-rem', 'evpm-t18-vc', 'Check with switching off MCCB'),
    photoRow('evpm-t18-ph', 'evpm-t18-vc'),
    vcRadio('evpm-t19-vc', 'ELR is functioning proper way.'),
    remarksRow('evpm-t19-rem', 'evpm-t19-vc', 'Check with test button'),
    photoRow('evpm-t19-ph', 'evpm-t19-vc'),
    vcRadio('evpm-t20-vc', 'Door is in closed condition and locked.'),
    remarksRow('evpm-t20-rem', 'evpm-t20-vc', 'no gaps, damage to be checked; report if found'),
    photoRow('evpm-t20-ph', 'evpm-t20-vc'),

    // ── Section 2 ──────────────────────────────────────────────────
    section('evpm-sec-2', 'Electrical: Illumination Lights in Charger Locations'),
    vcRadio('evpm-t21-vc', 'All Lights are glowing (no insects trapped inside).'),
    remarksRow('evpm-t21-rem', 'evpm-t21-vc', 'Check by turning lights on; clean and remove insects'),
    photoRow('evpm-t21-ph', 'evpm-t21-vc'),
    vcRadio('evpm-t22-vc', 'Light fixtures are firmly fixed & not hanging.'),
    remarksRow('evpm-t22-rem', 'evpm-t22-vc', 'No light should be hanging or have loose fixture'),
    photoRow('evpm-t22-ph', 'evpm-t22-vc'),

    // ── Section 3 ──────────────────────────────────────────────────
    section('evpm-sec-3', 'Electrical: Earth Pits & Earth Grid'),
    vcRadio('evpm-t23-vc', 'Earth pits are marked & are visible.'),
    remarksRow('evpm-t23-rem', 'evpm-t23-vc', 'Clean the pit cover if marking is not visible; mark using paint/marker if required'),
    photoRow('evpm-t23-ph', 'evpm-t23-vc'),

    // ── Section 4 ──────────────────────────────────────────────────
    section('evpm-sec-4', 'Electrical: CCTV Camera'),
    vcRadio('evpm-t24-vc', 'All CCTV cameras are functional; record non working cameras.'),
    remarksRow('evpm-t24-rem', 'evpm-t24-vc', 'Check for any obstruction of view, dirt on lens etc'),
    photoRow('evpm-t24-ph', 'evpm-t24-vc'),

    // ── Section 5 ──────────────────────────────────────────────────
    section('evpm-sec-5', 'Charger Cabinet: EV Chargers (AC & DC) — Look, Listen & Feel'),
    vcRadio('evpm-t25-vc', 'Abnormal noise during operation noticed.'),
    remarksRow('evpm-t25-rem', 'evpm-t25-vc'),
    photoRow('evpm-t25-ph', 'evpm-t25-vc'),
    vcRadio('evpm-t26-vc', 'All lights in the charger vicinity are glowing.'),
    remarksRow('evpm-t26-rem', 'evpm-t26-vc', 'clean if required'),
    photoRow('evpm-t26-ph', 'evpm-t26-vc'),
    vcRadio('evpm-t27-vc', 'Damage observed on supporting accessories (Guns, connector etc).'),
    remarksRow('evpm-t27-rem', 'evpm-t27-vc', 'if yes; inform Ops team'),
    photoRow('evpm-t27-ph', 'evpm-t27-vc'),
    vcRadio('evpm-t28-vc', 'Doors are locked & working and no damage observed.'),
    remarksRow('evpm-t28-rem', 'evpm-t28-vc', 'Also check error log for door open. Door locked sensor should not be bypassed'),
    photoRow('evpm-t28-ph', 'evpm-t28-vc'),
    vcRadio('evpm-t29-vc', 'Foundation bolts are tight.'),
    remarksRow('evpm-t29-rem', 'evpm-t29-vc', 'All bolts as per charger diagram should be tight; tighten if loose'),
    photoRow('evpm-t29-ph', 'evpm-t29-vc'),
    vcRadio('evpm-t30-vc', 'Emergency Push Button is working.'),
    remarksRow('evpm-t30-rem', 'evpm-t30-vc', 'Check and then release the button'),
    photoRow('evpm-t30-ph', 'evpm-t30-vc'),

    // ── Section 6 ──────────────────────────────────────────────────
    section('evpm-sec-6', 'Housekeeping at Charger Surrounding, Parking'),
    vcRadio('evpm-t31-vc', 'All area is free of scrap/Flammable/unwanted materials.'),
    remarksRow('evpm-t31-rem', 'evpm-t31-vc'),
    photoRow('evpm-t31-ph', 'evpm-t31-vc'),
    vcRadio('evpm-t32-vc', 'Signs of Paan Stains / Cigarette / trash.'),
    remarksRow('evpm-t32-rem', 'evpm-t32-vc'),
    photoRow('evpm-t32-ph', 'evpm-t32-vc'),
    vcRadio('evpm-t33-vc', 'Water leakage and stagnation observed in any area.'),
    remarksRow('evpm-t33-rem', 'evpm-t33-vc'),
    photoRow('evpm-t33-ph', 'evpm-t33-vc'),
    vcRadio('evpm-t34-vc', 'Entire area is neat & clean.'),
    remarksRow('evpm-t34-rem', 'evpm-t34-vc', 'Charger, wet cleaning of parking bay, canopy, pedestal, gun, cable, pdb, lights'),
    photoRow('evpm-t34-ph', 'evpm-t34-vc'),
    vcRadio('evpm-t35-vc', 'Bird nest visible anywhere in the premises and traces of bird stay.'),
    remarksRow('evpm-t35-rem', 'evpm-t35-vc', 'Remove if found'),
    photoRow('evpm-t35-ph', 'evpm-t35-vc'),

    // ── Section 7 ──────────────────────────────────────────────────
    section('evpm-sec-7', 'Health Safety & Environment — Safety Equipments / Environments'),
    vcRadio('evpm-t36-vc', 'All fire extinguishers are at the designated place as per SOP.'),
    remarksRow('evpm-t36-rem', 'evpm-t36-vc', 'Clean the pipe'),
    photoRow('evpm-t36-ph', 'evpm-t36-vc'),
    vcRadio('evpm-t37-vc', 'Fire extinguisher are in charged condition and ready for use with Validity/Test certificates.'),
    remarksRow('evpm-t37-rem', 'evpm-t37-vc', 'check validity date is visible; re-write if fading'),
    photoRow('evpm-t37-ph', 'evpm-t37-vc'),

    // ── Section 8 ──────────────────────────────────────────────────
    section('evpm-sec-8', 'Civil Structures & Facilities — Charger Location'),
    vcRadio('evpm-t38-vc', 'Parking Slot free from pothole and damage.'),
    remarksRow('evpm-t38-rem', 'evpm-t38-vc', 'if found, inform and take picture'),
    photoRow('evpm-t38-ph', 'evpm-t38-vc'),
    vcRadio('evpm-t39-vc', 'Canopy Provided is firmly fixed on the column, no loose bolts.'),
    remarksRow('evpm-t39-rem', 'evpm-t39-vc', 'Gentle push on the Canopy structure'),
    photoRow('evpm-t39-ph', 'evpm-t39-vc'),
    vcRadio('evpm-t40-vc', 'Bollard foundation is in good condition and is firmly fixed.'),
    remarksRow('evpm-t40-rem', 'evpm-t40-vc', 'check bolting and tighten if loose'),
    photoRow('evpm-t40-ph', 'evpm-t40-vc'),
    vcRadio('evpm-t41-vc', 'Charger is firmly bolted and does not wobble.'),
    remarksRow('evpm-t41-rem', 'evpm-t41-vc', 'Gentle push on the charger'),
    photoRow('evpm-t41-ph', 'evpm-t41-vc'),
    vcRadio('evpm-t42-vc', 'Wheel Stopper is firmly fixed and not damaged.'),
    remarksRow('evpm-t42-rem', 'evpm-t42-vc', 'check bolting and tighten if loose'),
    photoRow('evpm-t42-ph', 'evpm-t42-vc'),

    // ── Section 9 ──────────────────────────────────────────────────
    section('evpm-sec-9', 'Mechanical (Structures/Facilities) — Charger Location & Panel Area'),
    vcRadio('evpm-t43-vc', 'Canopy Structure is rust free.'),
    remarksRow('evpm-t43-rem', 'evpm-t43-vc', 'Check all bolts and infra'),
    photoRow('evpm-t43-ph', 'evpm-t43-vc'),
    vcRadio('evpm-t44-vc', 'PDB Structure is rust free.'),
    remarksRow('evpm-t44-rem', 'evpm-t44-vc', 'Check PDB and stand'),
    photoRow('evpm-t44-ph', 'evpm-t44-vc'),

    // ── Section 10 ─────────────────────────────────────────────────
    section('evpm-sec-10', 'Signage'),
    vcRadio('evpm-t45-vc', 'Signages are intact, not damaged & fixed properly.'),
    remarksRow('evpm-t45-rem', 'evpm-t45-vc'),
    photoRow('evpm-t45-ph', 'evpm-t45-vc'),
    vcRadio('evpm-t46-vc', 'No Fading of colour on Signages observed.'),
    remarksRow('evpm-t46-rem', 'evpm-t46-vc'),
    photoRow('evpm-t46-ph', 'evpm-t46-vc'),
    vcRadio('evpm-t47-vc', 'Charger Usage, DOs & DONTs, Customer Care number is available.'),
    remarksRow('evpm-t47-rem', 'evpm-t47-vc'),
    photoRow('evpm-t47-ph', 'evpm-t47-vc'),

    // ── Section 11 ─────────────────────────────────────────────────
    section('evpm-sec-11', 'EV Charger'),
    vcRadio('evpm-t48-vc', 'Check cables for cuts or discoloration.'),
    remarksRow('evpm-t48-rem', 'evpm-t48-vc'),
    photoRow('evpm-t48-ph', 'evpm-t48-vc'),
    vcRadio('evpm-t49-vc', 'MCB/MCCB is not burnt and working.'),
    remarksRow('evpm-t49-rem', 'evpm-t49-vc', 'switch off and turn back on'),
    photoRow('evpm-t49-ph', 'evpm-t49-vc'),
    vcRadio('evpm-t50-vc', 'Air Filter Cleaning.'),
    remarksRow('evpm-t50-rem', 'evpm-t50-vc', 'Clean the air filters periodically to avoid dust accumulation and maintain proper airflow'),
    photoRow('evpm-t50-ph', 'evpm-t50-vc'),
    vcRadio('evpm-t51-vc', 'Exhaust is working and clean (if visible).'),
    remarksRow('evpm-t51-rem', 'evpm-t51-vc', 'clean with blower/cloth'),
    photoRow('evpm-t51-ph', 'evpm-t51-vc'),
    vcRadio('evpm-t52-vc', 'No signs of rodents.'),
    remarksRow('evpm-t52-rem', 'evpm-t52-vc', 'Remove if found any'),
    photoRow('evpm-t52-ph', 'evpm-t52-vc'),
    vcRadio('evpm-t53-vc', 'Charger is clean from inside.'),
    remarksRow('evpm-t53-rem', 'evpm-t53-vc', 'clean with blower'),
    photoRow('evpm-t53-ph', 'evpm-t53-vc'),
    vcRadio('evpm-t54-vc', 'Charger is clean from outside.'),
    remarksRow('evpm-t54-rem', 'evpm-t54-vc', 'clean with wet cloth wherever possible'),
    photoRow('evpm-t54-ph', 'evpm-t54-vc'),
    vcRadio('evpm-t55-vc', 'HMI screen is clean with no dust.'),
    remarksRow('evpm-t55-rem', 'evpm-t55-vc', 'Clean with dry cloth'),
    photoRow('evpm-t55-ph', 'evpm-t55-vc'),
    vcRadio('evpm-t56-vc', 'Emergency button is working and clean.'),
    remarksRow('evpm-t56-rem', 'evpm-t56-vc', 'check by pushing and releasing, clean with dry cloth'),
    photoRow('evpm-t56-ph', 'evpm-t56-vc'),
    vcRadio('evpm-t57-vc', 'Input and Earthing Voltage Validation.'),
    remarksRow('evpm-t57-rem', 'evpm-t57-vc', 'Verify input voltage levels; N-E voltage should be < 03 Volts'),
    photoRow('evpm-t57-ph', 'evpm-t57-vc'),
    vcRadio('evpm-t58-vc', 'Earthing Resistance Check.'),
    remarksRow('evpm-t58-rem', 'evpm-t58-vc', 'Earthing resistance should be < 05 Ω'),
    photoRow('evpm-t58-ph', 'evpm-t58-vc'),
    vcRadio('evpm-t59-vc', 'Gun & Vehicle Inlet Cleaning.'),
    remarksRow('evpm-t59-rem', 'evpm-t59-vc', 'Clean the charging gun and vehicle inlet terminals regularly'),
    photoRow('evpm-t59-ph', 'evpm-t59-vc'),
    vcRadio('evpm-t60-vc', 'Physical Verification of Gun and Contact Points.'),
    remarksRow('evpm-t60-rem', 'evpm-t60-vc', 'Inspect the charging gun and contact points for physical damage or wear'),
    photoRow('evpm-t60-ph', 'evpm-t60-vc'),
    vcRadio('evpm-t61-vc', 'Verification and Monitoring of Critical Alarms.'),
    remarksRow('evpm-t61-rem', 'evpm-t61-vc', 'Verify critical alarms related to EPO pressed, earthing faults, or input-related faults'),
    photoRow('evpm-t61-ph', 'evpm-t61-vc'),

    // ── Section 12 ─────────────────────────────────────────────────
    section('evpm-sec-12', 'HT / DP — Installation'),
    vcRadio('evpm-t62-vc', 'Check that all equipment — LAs and Gang Operated Switch are properly operational.'),
    remarksRow('evpm-t62-rem', 'evpm-t62-vc', 'All LA should be healthy without physical damage'),
    photoRow('evpm-t62-ph', 'evpm-t62-vc'),
    vcRadio('evpm-t63-vc', 'Check that earthing resistance and termination are not corroded.'),
    remarksRow('evpm-t63-rem', 'evpm-t63-vc', 'EP-1 Value --- Ohms  EP-2 Value ---- Ohms'),
    photoRow('evpm-t63-ph', 'evpm-t63-vc'),

    // ── Section 13 ─────────────────────────────────────────────────
    section('evpm-sec-13', 'Ring Main Unit'),
    vcRadio('evpm-t64-vc', 'RMU Panel and Switchgears are properly operational and double earthed.'),
    remarksRow('evpm-t64-rem', 'evpm-t64-vc'),
    photoRow('evpm-t64-ph', 'evpm-t64-vc'),
    vcRadio('evpm-t65-vc', 'Check that earthing resistance and termination are not corroded of RMU / VCB / Panel.'),
    remarksRow('evpm-t65-rem', 'evpm-t65-vc', 'EP-1 Value --- Ohms  EP-2 Value ---- Ohms'),
    photoRow('evpm-t65-ph', 'evpm-t65-vc'),
    vcRadio('evpm-t66-vc', 'Check the tightness of all HT cable terminations at the Transformer, VCB/RMU ends.'),
    remarksRow('evpm-t66-rem', 'evpm-t66-vc'),
    photoRow('evpm-t66-ph', 'evpm-t66-vc'),
    vcRadio('evpm-t67-vc', 'Discoloration or burn marks observed at the termination end.'),
    remarksRow('evpm-t67-rem', 'evpm-t67-vc'),
    photoRow('evpm-t67-ph', 'evpm-t67-vc'),
    vcRadio('evpm-t68-vc', 'Incoming VCB is in working condition and handle is intact for both Power Supplies.'),
    remarksRow('evpm-t68-rem', 'evpm-t68-vc'),
    photoRow('evpm-t68-ph', 'evpm-t68-vc'),
    vcRadio('evpm-t69-vc', 'Inspect for Physical Damage of any Civil Foundation/Fencing/gate in HT yard.'),
    remarksRow('evpm-t69-rem', 'evpm-t69-vc'),
    photoRow('evpm-t69-ph', 'evpm-t69-vc'),
    vcRadio('evpm-t70-vc', 'Inspect security systems.'),
    remarksRow('evpm-t70-rem', 'evpm-t70-vc'),
    photoRow('evpm-t70-ph', 'evpm-t70-vc'),
    vcRadio('evpm-t71-vc', 'Ensure yard is free from waterlogging, vegetation, or debris.'),
    remarksRow('evpm-t71-rem', 'evpm-t71-vc'),
    photoRow('evpm-t71-ph', 'evpm-t71-vc'),

    // ── Section 14 ─────────────────────────────────────────────────
    section('evpm-sec-14', 'SEB Meter Box and HT Panel'),
    vcRadio('evpm-t72-vc', 'Lubrication to be applied in the parts of the VCB where it is engaged for establishing connection.'),
    remarksRow('evpm-t72-rem', 'evpm-t72-vc'),
    photoRow('evpm-t72-ph', 'evpm-t72-vc'),
    vcRadio('evpm-t73-vc', 'All settings to be verified as per the load applied with SEB and to be recorded.'),
    remarksRow('evpm-t73-rem', 'evpm-t73-vc'),
    photoRow('evpm-t73-ph', 'evpm-t73-vc'),
    vcRadio('evpm-t74-vc', 'Condition of SEB seal on meter box.'),
    remarksRow('evpm-t74-rem', 'evpm-t74-vc'),
    photoRow('evpm-t74-ph', 'evpm-t74-vc'),
    vcRadio('evpm-t75-vc', 'Capture the HT meter reading.'),
    remarksRow('evpm-t75-rem', 'evpm-t75-vc'),
    photoRow('evpm-t75-ph', 'evpm-t75-vc'),

    // ── Section 15 ─────────────────────────────────────────────────
    section('evpm-sec-15', 'Transformer Oil Cooled / Air Cooled'),
    vcRadio('evpm-t76-vc', 'Check and Record the Winding Temperature Indicator.'),
    remarksRow('evpm-t76-rem', 'evpm-t76-vc'),
    photoRow('evpm-t76-ph', 'evpm-t76-vc'),
    vcRadio('evpm-t77-vc', 'Check the Oil level in the conservator.'),
    remarksRow('evpm-t77-rem', 'evpm-t77-vc', 'Should be above half level in the Sight glass'),
    photoRow('evpm-t77-ph', 'evpm-t77-vc'),
    vcRadio('evpm-t78-vc', 'Check for any oil leakage in the transformer unit.'),
    remarksRow('evpm-t78-rem', 'evpm-t78-vc'),
    photoRow('evpm-t78-ph', 'evpm-t78-vc'),
    vcRadio('evpm-t79-vc', 'Check the breather for good silica gel condition.'),
    remarksRow('evpm-t79-rem', 'evpm-t79-vc', 'Colour should be blue or replace it'),
    photoRow('evpm-t79-ph', 'evpm-t79-vc'),
    vcRadio('evpm-t80-vc', 'Check the transformer neutral is solidly earthed & earthing electrode for transformer neutral.'),
    remarksRow('evpm-t80-rem', 'evpm-t80-vc', 'NEE-1 Value --- Ohms  NEE-2 Value ---- Ohms'),
    photoRow('evpm-t80-ph', 'evpm-t80-vc'),
    vcRadio('evpm-t81-vc', 'Check the statutory "Danger Notice" is Displayed.'),
    remarksRow('evpm-t81-rem', 'evpm-t81-vc'),
    photoRow('evpm-t81-ph', 'evpm-t81-vc'),
    vcRadio('evpm-t82-vc', 'Oil filtration.'),
    remarksRow('evpm-t82-rem', 'evpm-t82-vc', 'This would be on call basis and in coordination with DISCOM'),
    photoRow('evpm-t82-ph', 'evpm-t82-vc'),
    vcRadio('evpm-t83-vc', 'BDV Test.'),
    remarksRow('evpm-t83-rem', 'evpm-t83-vc', 'This would be on call basis and in coordination with DISCOM'),
    photoRow('evpm-t83-ph', 'evpm-t83-vc'),
];

export const PREVENTIVE_HT_YARD_CHECKLIST: ChecklistTemplateItem[] = [
    { id: 'htpm-1', label: 'Check that all Lighting Arrestors (LAs) and Gang Operated Switches (GOS) are operational through the AB switch, with no burnt marks or discoloration at the terminations, and ensure all LAs are free from physical damage.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-2', label: 'Check the earthing resistance and terminations for corrosion after switching OFF the HT power supply. Record EP-1 and EP-2 earthing resistance value.', type: 'number', dataType: 'Number', required: true },
    { id: 'htpm-3', label: 'Verify that the RMU panel and switchgear are operational and have double, independent earthing for the meter box.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-4', label: 'Check the earthing resistance and terminations of the RMU, VCB, and panel for corrosion after switching OFF the HT power supply. Record EP-1 and EP-2 earthing resistance value.', type: 'number', dataType: 'Number', required: true },
    { id: 'htpm-5', label: 'Check the tightness of all HT cable terminations at the transformer and VCB/RMU ends, including any burn marks.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-6', label: 'Check the termination ends for discoloration or burn marks and record any damage observed.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-7', label: 'Verify that the incoming VCB is operational and that the handle is intact for both power supplies, where applicable.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-8', label: 'Inspect the HT yard for physical damage to the civil foundation, fencing, or gate.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-9', label: 'Inspect the security systems for CCTV damage or obstruction to the camera view.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-10', label: 'Ensure the HT yard is free from waterlogging, vegetation, and debris.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-11', label: 'Apply lubrication to the engaged parts of the VCB used for establishing the connection, after taking the required shutdown and restoring the system after testing.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-12', label: 'Verify and record all settings according to the load applied with SEB, after taking the required shutdown and restoring the system after testing.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-13', label: 'Check the condition of the SEB seal on the meter box and record any damage observed.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-14', label: 'Capture the HT meter reading.', type: 'media', dataType: 'Media', required: true },
    { id: 'htpm-15', label: 'Record the transformer winding temperature from the Winding Temperature Indicator (WTI).', type: 'number', dataType: 'Number', required: true },
    { id: 'htpm-16', label: 'Check the transformer conservator oil level through the sight glass and ensure it is above the half-level mark; top up if required.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-17', label: 'Check the transformer unit for any oil leakage and record any leakage observed.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-18', label: 'Check the transformer breather and ensure the silica gel is blue and in good condition; replace it if required.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-19', label: 'Verify that the transformer neutral is solidly earthed and that two interconnected earthing electrodes/earth pits are provided, free from rust, in good condition, and properly marked. Record NEE-1 and NEE-2 earthing resistance value.', type: 'number', dataType: 'Number', required: true },
    { id: 'htpm-20', label: 'Verify that the statutory “Danger Notice” is displayed on the fencing facing the customer area near the gate.', type: 'checkbox', dataType: 'None', required: true, options: ['Yes', 'No'] },
    { id: 'htpm-21', label: 'Perform oil filtration on a call basis in coordination with the DISCOM.', type: 'textarea', dataType: 'Long text', required: false },
    { id: 'htpm-22', label: 'Perform the BDV test on a call basis in coordination with the DISCOM.', type: 'textarea', dataType: 'Long text', required: false },
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
        checklistTotal: 83,
        tools: ['Multimeter', 'Blower', 'Anti-rust Spray', 'Insulation Meter'],
        parts: ['Insulation Mat', 'Cable Gland', 'SPD Unit'],
        technicians: ['Tim', 'Neha'],
        assetId: 'CPID-KN-01',
        assetIds: ['CPID-KN-01', 'CPID-KN-02'],
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        offlineReady: true,
        notes: 'Preventive Maintenance for EV Infra. Complete all 15 checklist sections (83 visual checks).',
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
        status: 'Working',
        dueWindow: 'Today, 13:00 - 16:00',
        eta: 'Resume now',
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

