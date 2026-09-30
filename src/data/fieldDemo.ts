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
    lead?: string;
    charger?: string;
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
    status: AssetAlertStatus | WorkOrderStatus;
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
    if (/^remarks:/i.test(trimmed) || /^instruction:/i.test(trimmed)) return trimmed;
    return `Remarks: ${trimmed}`;
};

const instructionRow = (id: string, content: string, showWhenFieldId?: string): ChecklistTemplateItem => {
    const lbl = instructionLabel(content);
    return {
        id,
        label: lbl,
        type: 'none',
        dataType: 'None',
        required: false,
        isReadOnly: true,
        ...(showWhenFieldId ? { showWhenFieldId, showWhenEquals: 'Yes' } : {}),
    };
};

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
    { id: 'react-t1-input-remarks', label: 'Remarks', type: 'text', dataType: 'Short text', required: false },

    checklist('react-t2-instruction', 'Connector & Cable Diagnostics'),
    yesNoRadio('react-t2-visual', 'Visual Check'),
    instructionRow('react-t2-remarks', 'Remarks: Inspect charging cable, connector latch, and pins for damage or burn marks.'),
    { id: 'react-t2-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Connector pins', 'Cable sleeve', 'Lock mechanism'] },
    { id: 'react-t2-input-remarks', label: 'Remarks', type: 'text', dataType: 'Short text', required: false },

    section('react-sec-2', 'Electrical & Earthing Diagnostics'),
    checklist('react-t3-instruction', 'Electrical & Earthing Measurement'),
    yesNoRadio('react-t3-visual', 'Visual Check'),
    instructionRow('react-t3-remarks', 'Remarks: Verify input supply voltage and Neutral-Earth voltage (< 3V).'),
    { id: 'react-t3-voltage', label: 'Three-phase input voltage measurements', type: 'three_phase_voltage', dataType: '3 phase voltage', required: true },
    { id: 'react-t3-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Multimeter screen', 'Busbar terminals', 'Earthing pit'] },
    { id: 'react-t3-input-remarks', label: 'Remarks', type: 'text', dataType: 'Short text', required: false },

    section('react-sec-3', 'Component Repair & Verification'),
    checklist('react-t4-instruction', 'Component Repair / Replacement Verification'),
    yesNoRadio('react-t4-visual', 'Visual Check'),
    instructionRow('react-t4-remarks', 'Remarks: Replace blown fuse, damaged gun latch, or loose terminal connections as required.'),
    { id: 'react-t4-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Old component removed', 'New component installed', 'Wiring completed'] },
    { id: 'react-t4-input-remarks', label: 'Remarks', type: 'text', dataType: 'Short text', required: false },

    checklist('react-t5-instruction', 'Post-Repair Test & Operational Sign-off'),
    yesNoRadio('react-t5-visual', 'Visual Check'),
    instructionRow('react-t5-remarks', 'Remarks: Initiate 5-minute test charging session and confirm normal operation.'),
    { id: 'react-t5-media', label: 'Upload 3 photos', type: 'media', dataType: 'Media', required: true, options: ['Active charging HMI screen', 'Restored charger enclosure', 'Site area cleared'] },
    { id: 'react-t5-input-remarks', label: 'Remarks', type: 'text', dataType: 'Short text', required: false },
];

export const REACTIVE_FAULT_QUESTION_COUNT = REACTIVE_FAULT_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

export const CHECKLIST_TEMPLATE: ChecklistTemplateItem[] = REACTIVE_FAULT_CHECKLIST;


const evInfraChecklist = (
    sno: string,
    title: string,
    remarks?: string,
    photoRequired = true
): ChecklistTemplateItem[] => {
    const visualId = `evpm-t${sno}-visual`;
    const items: ChecklistTemplateItem[] = [
        checklist(`evpm-t${sno}-instruction`, title),
        yesNoRadio(visualId, 'Visual Check'),
    ];
    const trimmedRemarks = (remarks || '').trim();
    if (trimmedRemarks) {
        items.push(instructionRow(`evpm-t${sno}-remarks-ins`, trimmedRemarks));
    }
    if (photoRequired !== false) {
        items.push({
            id: `evpm-t${sno}-media`,
            label: 'Upload 3 photos',
            type: 'media',
            dataType: 'Media',
            required: true,
            options: ['Photo 1', 'Photo 2', 'Photo 3'],
        });
    }
    items.push({
        id: `evpm-t${sno}-remarks`,
        label: 'Remarks',
        type: 'text',
        dataType: 'Short text',
        required: false,
    });
    return items;
};

export const PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST: ChecklistTemplateItem[] = [
    section('evpm-yellow-1', 'Electrical: LT/Main DB Panel (Public Charging)'),
    ...evInfraChecklist('1', 'Check cables in the cable alley for cuts or discoloration.', 'If cuts or discoloration is found, replace it.', true),
    ...evInfraChecklist('2', 'Ensure all dummy holes in the cable alley are properly sealed.', 'seal if open', true),
    ...evInfraChecklist('3', 'Verify surge protection device functionality and look for warning indicators.', 'check with warning indicators', true),
    ...evInfraChecklist('4', 'Confirm the absence of loose or temporary connections.', 'check for burns'),
    ...evInfraChecklist('5', 'Ensure phase indication lamps are operational.'),
    ...evInfraChecklist('6', 'Verify the multi-functional meter displays accurate readings.', 'verify with multimeter'),
    ...evInfraChecklist('7', 'Confirm correct installation of insulating shrouds.', 'install if missing'),
    ...evInfraChecklist('8', 'Check for signs of rodent presence near the panel.'),
    ...evInfraChecklist('9', 'Ensure the internal area is free of dust and debris.', 'To be cleaned using blower when required', true),
    ...evInfraChecklist('10', 'Inspect surroundings for signs of water accumulation.', 'check for water marks, click picture; issue to be resolved from source', true),
    ...evInfraChecklist('11', 'Verify IS15652 compliance and ensure the insulation mat is undamaged.', 'Replace if damaged or stolen', true),
    ...evInfraChecklist('13', 'Ensure cable glands are securely fitted, correctly sized, and free of gaps.', 'tighten if loose; replace if damaged'),
    ...evInfraChecklist('14', 'Confirm the single line diagram (SLD) is displayed inside the panel door. (Single line diagram)', 'if no, paste the diagram'),
    ...evInfraChecklist('15', 'Inspect terminal blocks and cable terminations for overheating or damage.'),
    ...evInfraChecklist('16', 'Ensure the power distribution board (PDB) is clean internally and externally. (Power distribution board)', 'Clean using blower', true),
    ...evInfraChecklist('17', 'Measure neutral-to-earth voltage and verify earth integrity.', 'Check using voltmeter or multimeter, write reading'),
    ...evInfraChecklist('18', 'Record power factor, current, voltage, KW, KWH, and demand from the MFM (Multifunction meter)', 'Record reading'),
    ...evInfraChecklist('19', 'No MCCB is in bypassed condition', 'Check with switching off MCCB'),
    ...evInfraChecklist('20', 'ELR is functioning proper way ( Yes/No)', 'Check with test button'),
    ...evInfraChecklist('21', 'Door is in closed condition and locked', 'no gaps, damage to be checked; report if found.'),

    section('evpm-yellow-2', 'Electrical: Illumination Lights in Charger Locations'),
    ...evInfraChecklist('22', 'All Lights are glowing (no insects trapped inside)', 'Check by turning lights on; clean and remove insects', true),
    ...evInfraChecklist('23', 'Light fixtures are firmly fixed & not hanging', 'No light should be hanging or have loose fixture', true),

    section('evpm-yellow-3', 'Electrical: Earth Pits & Earth Grid'),
    ...evInfraChecklist('24', 'Earth pits are marked & are visible', 'Clean the pit cover if marking is not visible; mark using paint/marker if required', true),

    section('evpm-yellow-4', 'Electrical: CCTV Camera'),
    ...evInfraChecklist('25', 'All CCTV cameras are functional as per the monitor and record non working cameras', 'Check for any obstruction of view, dirt on lens etc (check for on light if available)'),

    section('evpm-yellow-5', 'Charger Cabinet: EV Chargers (AC & DC) (Only Look, Listen & Feel Checks)-  Record charger id wherever required'),
    ...evInfraChecklist('26', 'Abnormal noise during operation noticed.'),
    ...evInfraChecklist('27', 'All lights in the charger vicinity are glowing', 'clean if required', true),
    ...evInfraChecklist('28', 'Damage observed on Supporting accessories (Guns, connector etc)', 'if yes; inform Ops team', true),
    ...evInfraChecklist('29', 'Doors are locked & working and no damage observed', 'Also check error log for door open. Door locked sensor should not be bypassed'),
    ...evInfraChecklist('30', 'Foundation bolts are tight', 'All bolts as per charger diagram should be tight; tighten if loose'),
    ...evInfraChecklist('31', 'Emergency Push Button is working', 'Check and then release the button'),

    section('evpm-yellow-6', 'Housekeeping at  Charger Surrounding, Parking'),
    ...evInfraChecklist('32', 'All area is free of scrap/Flammable/unwanted materials', undefined, true),
    ...evInfraChecklist('33', 'Signs of Paan Stains/ Cigarette / trash', undefined, true),
    ...evInfraChecklist('34', 'Water leakage and Stagnation observed in any area', undefined, true),
    ...evInfraChecklist('35', 'Entire area is neat & clean', 'Charger, wet cleaning of parking bay, canopy, pedestal, gun, cable, pdb, lights', true),
    ...evInfraChecklist('36', 'Bird nest visible anywhere in the premises and traces of bird stay', 'Remove if found', true),

    section('evpm-yellow-7', 'Health Safety & Environment-General Issues - Safety Equipments/ Environments'),
    ...evInfraChecklist('37', 'All fire extinguishers are at the designated place as per SOP', 'Clean the pipe', true),
    ...evInfraChecklist('38', 'Fire extinguisher are in charged condition and ready for use with Validity /Test certificates', 'check validy date is visible; re-write if fading', true),

    section('evpm-yellow-8', 'Civil Structures & Facilities - Charger Location'),
    ...evInfraChecklist('39', 'Parking Slot free from pothole and damage', 'if found, inform and take picture', true),
    ...evInfraChecklist('40', 'Canopy Provided is firmly fixed on the column, no loose bolts', 'Gentle push on the Canopy structure'),
    ...evInfraChecklist('41', 'Bollard foundation is in good condition and is firmly fixed', 'check bolting and tighten if loose', true),
    ...evInfraChecklist('42', 'Charger is firmly bolted and does not wobble', 'Gentle push on the charger'),
    ...evInfraChecklist('43', 'Wheel Stopper is firmly fixed and not damaged', 'check bolting and tighten if loose', true),

    section('evpm-yellow-9', 'Mechanical (Structures/Facilities) - Charger Location & Panel Area'),
    ...evInfraChecklist('44', 'Canopy Structure is rust free', 'Check all bolts and infra', true),
    ...evInfraChecklist('45', 'PDB Structure is rust free', 'Check PDB and stand', true),

    section('evpm-yellow-10', 'Signage'),
    ...evInfraChecklist('46', 'Signages are intact,not damaged & fixed properly', undefined, true),
    ...evInfraChecklist('47', 'No Fading of colour on Signages observed', undefined, true),
    ...evInfraChecklist('48', 'Charger Usage , DOs & DONTs, Customer Care number is available', undefined, true),
];

export const PREVENTIVE_EV_INFRA_QUESTION_COUNT = PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

const evChargerChecklist = (
    sno: string,
    title: string,
    remarks?: string | string[],
    photoRequired = true,
    numericFields?: string[],
    photoOptions: string[] = ['Photo 1', 'Photo 2', 'Photo 3']
): ChecklistTemplateItem[] => {
    const visualId = `evch-t${sno}-visual`;
    const items: ChecklistTemplateItem[] = [
        checklist(`evch-t${sno}-instruction`, title),
        yesNoRadio(visualId, 'Visual Check'),
    ];
    if (remarks) {
        const remarksArray = Array.isArray(remarks) ? remarks : [remarks];
        remarksArray.forEach((rm, idx) => {
            const trimmed = rm.trim();
            if (trimmed) {
                items.push(instructionRow(`evch-t${sno}-remarks-ins${idx > 0 ? `-${idx + 1}` : ''}`, trimmed));
            }
        });
    }
    if (photoRequired !== false) {
        items.push({
            id: `evch-t${sno}-media`,
            label: 'Upload 3 photos',
            type: 'media',
            dataType: 'Media',
            required: true,
            options: photoOptions,
        });
    }
    if (numericFields && numericFields.length > 0) {
        items.push({
            id: `evch-t${sno}-nums`,
            label: 'Record Values',
            type: 'number',
            dataType: 'Number',
            required: false,
            options: numericFields,
        });
    }
    items.push({
        id: `evch-t${sno}-remarks`,
        label: 'Remarks',
        type: 'text',
        dataType: 'Short text',
        required: false,
    });
    return items;
};

export const PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST: ChecklistTemplateItem[] = [
    section('evch-yellow-1', 'EV Charger'),
    ...evChargerChecklist('1', 'Check cables for cuts or discoloration', 'Check for cuts, cracks or discoloration at cable ends and sleeves.', true, undefined, ['Overview of cable condition', 'Close-up of connector sleeve', 'Terminations']),
    ...evChargerChecklist('2', 'MCB/MCCB is not burnt and working', 'switch off and turn back on', true, undefined, ['Overview of breaker', 'Close-up of contacts', 'Panel surround']),
    ...evChargerChecklist('3', 'Air Filter Cleaning', 'Clean the air filters periodically to avoid dust accumulation and maintain proper airflow.', true, undefined, ['Filter before cleaning', 'Filter after cleaning', 'Airflow vent']),
    ...evChargerChecklist('4', 'Exhaust is working and clean(if visible)', 'clean with blower/cloth', true, undefined, ['Exhaust fan overview', 'Blades clean condition', 'Vent louvers']),
    ...evChargerChecklist('5', 'No signs of rodents', 'Remove if found any', true, undefined, ['Bottom gland plate', 'Internal wire conduits', 'Surrounding floor']),
    ...evChargerChecklist('6', 'Charger is clean from inside', 'clean with blower', true, undefined, ['Internal cabinet before', 'Internal cabinet after', 'Module bay']),
    ...evChargerChecklist('7', 'Charger is clean from outside', 'clean with wet cloth wherever possible (only panels and connector cable)', true, undefined, ['Front panel', 'Side panels & holster', 'Connector cables clean']),
    ...evChargerChecklist('8', 'HMI screen is clan with no dust', 'Clean with dry cloth', true, undefined, ['HMI screen display', 'Touch area clean', 'Enclosure bezel']),
    ...evChargerChecklist('9', 'Emergency button is working and clean', 'check by pushing and releasing, clean with dry cloth', true, undefined, ['EPO button released', 'EPO button pressed test', 'EPO label visible']),
    ...evChargerChecklist('10', 'Input and Earthing Voltage Validation', 'Verify input voltage levels and ensure N-E voltage should be maintained < 03 Volts. Check earthing voltage', true, undefined, ['Multimeter input voltage', 'N-E voltage reading', 'Earthing busbar']),
    ...evChargerChecklist('11', 'Earthing Resistance Check', 'Measure and maintain earthing resistance < 05 Ω(ohms) regularly to ensure effective grounding.', true, ['EP-1 Value (Ohms)', 'EP-2 Value (Ohms)'], ['Earth tester connected', 'Pit 1 test reading', 'Pit 2 test reading']),
    ...evChargerChecklist('12', 'Gun & Vehicle Inlet Cleaning', 'Clean the charging gun and vehicle inlet terminals regularly to avoid contamination and ensure a secure connection.', true, undefined, ['Gun A pins clean', 'Gun B pins clean', 'Holster clean']),
    ...evChargerChecklist('13', 'Physical Verification of Gun and Contact Points', 'Inspect the charging gun and contact points for physical damage or wear', true, undefined, ['Gun terminal pins', 'Latch mechanism', 'Cable strain relief']),
    ...evChargerChecklist('14', 'Verification and Monitoring of Critical Alarms', 'Regularly verify and monitor critical alarms related to EPO pressed, earthing faults, or any input-related faults.', true, undefined, ['Alarm log screen', 'System healthy status', 'Active warning lights']),
];

export const PREVENTIVE_EV_CHARGER_QUESTION_COUNT = PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;

const htYardChecklist = (
    sno: string,
    title: string,
    remarks?: string | string[],
    photoRequired = true,
    numericFields?: string[]
): ChecklistTemplateItem[] => {
    const visualId = `htpm-t${sno}-visual`;
    const items: ChecklistTemplateItem[] = [
        checklist(`htpm-t${sno}-instruction`, title),
        yesNoRadio(visualId, 'Visual Check'),
    ];
    if (remarks) {
        const remarksArray = Array.isArray(remarks) ? remarks : [remarks];
        remarksArray.forEach((rm, idx) => {
            const trimmed = rm.trim();
            if (trimmed) {
                items.push(instructionRow(`htpm-t${sno}-remarks-ins${idx > 0 ? `-${idx + 1}` : ''}`, trimmed));
            }
        });
    }
    if (photoRequired !== false) {
        items.push({
            id: `htpm-t${sno}-media`,
            label: 'Upload 3 photos',
            type: 'media',
            dataType: 'Media',
            required: true,
            options: ['Photo 1', 'Photo 2', 'Photo 3'],
        });
    }
    if (numericFields && numericFields.length > 0) {
        items.push({
            id: `htpm-t${sno}-nums`,
            label: 'Record Values',
            type: 'number',
            dataType: 'Number',
            required: false,
            options: numericFields,
        });
    }
    items.push({
        id: `htpm-t${sno}-remarks`,
        label: 'Remarks',
        type: 'text',
        dataType: 'Short text',
        required: false,
    });
    return items;
};

export const PREVENTIVE_HT_YARD_CHECKLIST: ChecklistTemplateItem[] = [
    section('htpm-yellow-1', 'HT / DP - INSTALLATION'),
    ...htYardChecklist(
        '1',
        "Check that all equipments-Lighting arrestor (LA's) Gang operated switch are properly opeartional",
        ['LA and GOS is operational with AB Switch ,No burnt mark and disclaration at termination', 'All LA should be healthy without physical damage']
    ),
    ...htYardChecklist(
        '2',
        'Check that earthing resistance and termination are not corroded',
        'ensure HT power supply is OFF before testing',
        true,
        ['EP-1 Value (Ohms)', 'EP-2 Value (Ohms)']
    ),

    section('htpm-yellow-2', 'RING MAIN UNIT'),
    ...htYardChecklist('3', 'RMU Panel and Switch gears are properly operational and double earthed.', 'Double and independent earthing for meter box'),
    ...htYardChecklist('4', 'Check that earthing resistance and termination are not corroded of RMU / VCB / Panel', 'ensure HT power supply is OFF before testing'),
    ...htYardChecklist('5', 'Check the tightness of all HT cable terminations at the Transformer, VCB/RMU ends.', 'Check for burn marks and tightness'),
    ...htYardChecklist('6', 'Discoloration or burn marks observed at the termination end', 'Damage on CCTV/ view block'),
    ...htYardChecklist('7', 'Incoming VCB is in working condition and handle is intact for both the Power Supplies if applicable', 'Operational checks'),
    ...htYardChecklist('8', 'Inspect for Physical Damage of any Civil Foundation/Fencing/gate in HT yard', 'Visual check'),
    ...htYardChecklist('9', 'Inspect security systems.', 'Damage on CCTV/ view block'),
    ...htYardChecklist('10', 'Ensure yard is free from waterlogging, vegetation, or debris.', 'Visual check'),

    section('htpm-yellow-3', 'SEB METER BOX AND HT Panel'),
    ...htYardChecklist('11', 'Lubrication to be applied in the parts of the VCB where it is engaged for establishing connection', 'Shutdown to be done before testing and to be restored after checking'),
    ...htYardChecklist('12', 'All setting to be verified as per the load applied with SEB and to be recorded', 'Shutdown to be done before testing and to be restored after checking'),
    ...htYardChecklist('13', 'Condition of SEB seal on meter box', 'Mention any damage'),
    ...htYardChecklist('14', 'Capture the HT meter reading', 'Required Photograph', true),

    section('htpm-yellow-4', 'Transformer Oil Cooled / Air Cooled'),
    ...htYardChecklist('15', 'Check and Record the Winding Temperature Indicator', 'Temp as per the Indicator'),
    ...htYardChecklist('16', 'Check the Oil level in the conservator', 'Should be above the Half Level in the Sight glass and to be Topped up'),
    ...htYardChecklist('17', 'Check for any oil leakage in the transformer unit', 'No oil leakage should be there'),
    ...htYardChecklist('18', 'Check the breather for good silica gel condition', 'Colour should be blue or replace it'),
    ...htYardChecklist(
        '19',
        'Check the transformer neutral is solidly earthed & earthing electrode for transformer neutral.',
        '2 nos electodes / Earth Pit and Interconnected, Not rusted and in good condition with marking',
        true,
        ['NEE-1 Value (Ohms)', 'NEE-2 Value (Ohms)']
    ),
    ...htYardChecklist('20', 'Check the statutory "Danger Notice"is Displayed', 'To be fixed on Fencing facing customer area near gate'),
    ...htYardChecklist('21', 'Oil filtration', 'This would be on call basis and in coordination with DISCOM'),
    ...htYardChecklist('22', 'BDV Test', 'This would be on call basis and in coordination with DISCOM'),
];

export const PREVENTIVE_HT_YARD_QUESTION_COUNT = PREVENTIVE_HT_YARD_CHECKLIST.filter(
    (item) => item.type !== 'section_header' && item.type !== 'checklist_header' && !item.isReadOnly
).length;


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
        id: 'ev-infra-monthly',
        templateId: 'TMP010',
        name: 'Monthly PM for EV Infra',
        items: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        total: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
    },
    {
        id: 'ev-charger-monthly',
        templateId: 'TMP011',
        name: 'Monthly PM for EV Charger',
        items: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        total: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
    },
    {
        id: 'ht-yard-half-yearly',
        templateId: 'TMP012',
        name: 'Half yearly PM for HT Yard',
        items: PREVENTIVE_HT_YARD_CHECKLIST,
        total: PREVENTIVE_HT_YARD_QUESTION_COUNT,
    },
    {
        id: 'standard-fault',
        templateId: 'standard-fault',
        name: 'Standard Reactive Fault Checklist',
        items: REACTIVE_FAULT_CHECKLIST,
        total: REACTIVE_FAULT_QUESTION_COUNT,
    },
    {
        id: 'steam-a-cbe-all-types',
        templateId: 'steam-a-cbe-all-types',
        name: 'Steam a Station CBE Diagnostics Checklist',
        items: STEAM_A_CBE_CHECKLIST,
        total: STEAM_A_CBE_QUESTION_COUNT,
    },
];

export const resolveChecklistForWorkOrder = (
    wo?: Partial<WorkOrder> | null
): { items: ChecklistTemplateItem[]; total: number } => {
    if (!wo) {
        return { items: REACTIVE_FAULT_CHECKLIST, total: REACTIVE_FAULT_QUESTION_COUNT };
    }
    const title = (wo.title || '').toLowerCase();
    const notes = (wo.notes || '').toLowerCase();
    const id = (wo.id || '').toLowerCase();

    // 1. Monthly PM for EV Infra (TMP010)
    if (
        id.includes('infra') ||
        title.includes('ev infra') ||
        notes.includes('ev infra') ||
        title.includes('inverter & cable')
    ) {
        return { items: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST, total: PREVENTIVE_EV_INFRA_QUESTION_COUNT };
    }

    // 2. Monthly PM for EV Charger (TMP011)
    if (
        id.includes('charger') ||
        title.includes('ev charger') ||
        notes.includes('ev charger') ||
        title.includes('filter replacement')
    ) {
        return { items: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST, total: PREVENTIVE_EV_CHARGER_QUESTION_COUNT };
    }

    // 3. Half yearly PM for HT Yard (TMP012)
    if (
        id.includes('ht-yard') ||
        id.includes('ht_yard') ||
        title.includes('ht yard') ||
        notes.includes('ht yard') ||
        title.includes('grounding inspection')
    ) {
        return { items: PREVENTIVE_HT_YARD_CHECKLIST, total: PREVENTIVE_HT_YARD_QUESTION_COUNT };
    }

    // 4. Steam CBE
    if (id.includes('steam-cbe') || title.includes('steam a station')) {
        return { items: STEAM_A_CBE_CHECKLIST, total: STEAM_A_CBE_QUESTION_COUNT };
    }

    // 5. Reactive works
    if (
        wo.type === 'Reactive' ||
        title.includes('fault') ||
        title.includes('repair') ||
        title.includes('cable') ||
        title.includes('liquid cooled')
    ) {
        return { items: REACTIVE_FAULT_CHECKLIST, total: REACTIVE_FAULT_QUESTION_COUNT };
    }

    // 6. Existing items if valid and full length
    if (wo.checklistItems && wo.checklistItems.length > 8) {
        return { items: wo.checklistItems, total: wo.checklistTotal || wo.checklistItems.length };
    }

    // 7. Preventive fallback
    if (wo.type === 'Preventive') {
        return { items: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST, total: PREVENTIVE_EV_CHARGER_QUESTION_COUNT };
    }

    return { items: REACTIVE_FAULT_CHECKLIST, total: REACTIVE_FAULT_QUESTION_COUNT };
};

export let WORK_ORDERS: WorkOrder[] = [
    // --- 4 Reactive Works ---
    {
        id: 'SW000',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Infra',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Working',
        dueWindow: 'Today, 10:00 - 13:00',
        eta: 'Starts in 15 min',
        distance: '0.5 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        tools: ['Multimeter', 'Blower', 'Anti-rust Spray', 'Insulation Meter'],
        parts: ['Insulation Mat', 'Cable Gland', 'SPD Unit'],
        technicians: ['Tim', 'Neha'],
        lead: 'John Smith',
        charger: 'ABB Terra 54',
        assetId: 'CPID-KN-01',
        assetIds: ['CPID-KN-01', 'CPID-KN-02'],
        offlineReady: true,
        notes: 'Monthly PM for EV Infra — visual checks with Yes/No radios and conditional remarks.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 1 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
    },
    {
        id: 'SW001',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Charger',
        siteName: 'Shell Recharge',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Working',
        dueWindow: 'Today, 13:00 - 16:00',
        eta: 'Starts in 45 min',
        distance: '0.7 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        tools: ['Multimeter', 'Insulation Tester', 'Torque Wrench', 'Cleaning Kit'],
        parts: ['Air Filter', 'Charging Cable Terminal', 'Safety Decals'],
        technicians: ['Tim', 'Arjun'],
        lead: 'John Smith',
        charger: 'Kempower Satellite',
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240'],
        offlineReady: true,
        notes: 'Monthly PM for EV Charger — visual checks, remarks, and progressive media uploads.',
        latitude: 18.5340,
        longitude: 73.8470,
        priority: 'High',
        targetTime: Date.now() + 2 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
        approver: 'Andrea Meuschke',
        primaryApprover: 'Andrea Meuschke',
        secondaryApprover: 'Marcus Aurelius',
    },
    {
        id: 'SW002',
        projectId: 'PJ001',
        title: 'Half yearly PM for HT Yard',
        siteName: 'Tesco Extra',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Assigned',
        dueWindow: 'Tomorrow, 09:00 - 12:00',
        eta: 'Scheduled',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_HT_YARD_QUESTION_COUNT,
        checklistItems: PREVENTIVE_HT_YARD_CHECKLIST,
        tools: ['Multimeter', 'Insulation Meter', 'WTI Gauge', 'Lubricant Kit'],
        parts: ['Silica Gel Pack', 'Danger Decals', 'GOS Fuse'],
        technicians: ['Tim', 'Emily Davis'],
        lead: 'Sarah Johnson',
        charger: 'Tritium RTM75',
        assetId: 'CP-100102',
        assetIds: ['CP-100102', 'CP-100103'],
        offlineReady: true,
        notes: 'Half yearly PM for HT Yard — visual checks, remarks, and evidence uploads.',
        latitude: 18.5380,
        longitude: 73.8420,
        priority: 'Medium',
        targetTime: Date.now() + 20 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        approver: 'Sarah Johnson',
        primaryApprover: 'Sarah Johnson',
        secondaryApprover: 'Marcus Hale',
    },
    {
        id: 'SW003',
        projectId: 'PJ005',
        title: 'Monthly PM for EV Charger',
        siteName: 'Moto Services',
        address: 'Highway Service Plaza, Baner, Pune',
        type: 'Reactive',
        stage: 'Fault Check',
        status: 'Completed',
        dueWindow: 'Completed Yesterday',
        eta: 'Signed off',
        distance: '2.1 km',
        checklistCompleted: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        tools: ['Oscilloscope', 'High-voltage probe', 'Insulation tester'],
        parts: ['DC Contactor', 'Control PCB'],
        technicians: ['Tim', 'Sara'],
        lead: 'Mike Wilson',
        charger: 'Delta UFC 200',
        assetId: 'CP-100555',
        offlineReady: true,
        notes: 'Monthly PM for EV Charger at Moto Services highway plaza.',
        latitude: 18.5360,
        longitude: 73.8500,
        priority: 'High',
        targetTime: Date.now() - 24 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
    },

    // --- 4 Preventive Works ---
    {
        id: 'PM-1001',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Charger',
        siteName: 'Shell Recharge',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Working',
        dueWindow: 'Today, 11:00 - 14:00',
        eta: 'Starts in 45 min',
        distance: '0.7 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        tools: ['Multimeter', 'Insulation Tester', 'Torque Wrench', 'Cleaning Kit'],
        parts: ['Air Filter', 'Charging Cable Terminal', 'Safety Decals'],
        technicians: ['Tim', 'Arjun'],
        lead: 'John Smith',
        charger: 'ABB Terra 54',
        assetId: 'CP-100239',
        assetIds: ['CP-100239', 'CP-100240'],
        offlineReady: true,
        notes: 'Monthly PM for EV Charger. Complete 14 critical checkpoints including earthing resistance values.',
        latitude: 18.5340,
        longitude: 73.8470,
        priority: 'High',
        targetTime: Date.now() + 4 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
        approver: 'Andrea Meuschke',
        primaryApprover: 'Andrea Meuschke',
        secondaryApprover: 'Marcus Aurelius',
    },
    {
        id: 'PM-1002',
        projectId: 'PJ001',
        title: 'Half yearly PM for HT Yard',
        siteName: 'Tesco Extra',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Preventive',
        stage: 'Half yearly Inspection',
        status: 'Assigned',
        dueWindow: 'Today, 14:00 - 17:00',
        eta: 'In Progress',
        distance: '1.2 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_HT_YARD_QUESTION_COUNT,
        checklistItems: PREVENTIVE_HT_YARD_CHECKLIST,
        tools: ['Multimeter', 'Insulation Meter', 'WTI Gauge', 'Lubricant Kit'],
        parts: ['Silica Gel Pack', 'Danger Decals', 'GOS Fuse'],
        technicians: ['Tim', 'Arjun'],
        lead: 'Sarah Johnson',
        charger: 'Delta ModelZ',
        assetId: 'CP-100102',
        assetIds: ['CP-100102', 'CP-100103'],
        offlineReady: true,
        notes: 'Half yearly PM for HT Yard. Complete RMU, transformer, earthing and yard safety checks.',
        latitude: 18.5380,
        longitude: 73.8420,
        priority: 'Medium',
        targetTime: Date.now() + 5 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
        approver: 'Andrea Meuschke',
        primaryApprover: 'Andrea Meuschke',
        secondaryApprover: 'Marcus Aurelius',
    },
    {
        id: 'PM-1003',
        projectId: 'PJ005',
        title: 'Monthly PM for EV Charger',
        siteName: 'Moto Services',
        address: 'Highway Service Plaza, Baner, Pune',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Under Review',
        dueWindow: 'Tomorrow, 15:00 - 18:00',
        eta: 'Pending Review',
        distance: '2.1 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_CHARGER_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_CHARGER_MONTHLY_CHECKLIST,
        tools: ['Multimeter', 'Insulation Tester', 'Thermal Camera'],
        parts: ['Air Filter', 'HEPA Intake Mesh'],
        technicians: ['Tim', 'Sara'],
        lead: 'Mike Wilson',
        charger: 'Delta UFC 200',
        assetId: 'CP-100555',
        offlineReady: true,
        notes: 'Scheduled monthly inspection for charger unit at Moto Services.',
        latitude: 18.5360,
        longitude: 73.8500,
        priority: 'Medium',
        targetTime: Date.now() + 24 * 60 * 60 * 1000,
        assignedBy: 'Marcus Hale',
        approver: 'Andrea Meuschke',
    },
    {
        id: 'PM-1000',
        projectId: 'PJ001',
        title: 'Monthly PM for EV Infra',
        siteName: 'Pune Central Station',
        address: 'Platform Road, Shivajinagar, Pune',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Working',
        dueWindow: 'Today, 09:00 - 12:00',
        eta: 'Starts in 10 min',
        distance: '0.5 km',
        checklistCompleted: 0,
        checklistTotal: PREVENTIVE_EV_INFRA_QUESTION_COUNT,
        checklistItems: PREVENTIVE_EV_INFRA_MONTHLY_CHECKLIST,
        tools: ['Multimeter', 'Blower', 'Anti-rust Spray', 'Insulation Meter'],
        parts: ['Insulation Mat', 'Cable Gland', 'SPD Unit'],
        technicians: ['Tim', 'Neha'],
        lead: 'John Smith',
        charger: 'ABB Terra 54',
        assetId: 'CPID-KN-01',
        assetIds: ['CPID-KN-01', 'CPID-KN-02'],
        offlineReady: true,
        notes: 'Monthly Preventive Maintenance for EV Infra as per standard SOW OM tasks.',
        latitude: 18.5314,
        longitude: 73.8446,
        priority: 'High',
        targetTime: Date.now() + 3 * 60 * 60 * 1000,
        assignedBy: 'Andrea Meuschke',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
    },
    {
        id: 'wo-steam-cbe-01',
        projectId: 'PJ001',
        title: 'Steam a station CBE',
        siteName: 'Steam a station CBE',
        address: 'Avinashi Road, Peelamedu, Coimbatore (CBE), Tamil Nadu 641004',
        type: 'Preventive',
        stage: 'Monthly Inspection',
        status: 'Working',
        dueWindow: 'Today, 10:00 - 18:00',
        eta: 'Ready on Site',
        distance: '0.2 km',
        checklistCompleted: 0,
        checklistTotal: STEAM_A_CBE_QUESTION_COUNT,
        tools: ['Multimeter', 'Insulation Meter', 'Torque Wrench', 'Phase Rotation Tester'],
        parts: ['Surge Protection Device', 'Insulation Mats', 'Terminal Lugs'],
        technicians: ['Tim', 'Arjun', 'Neha'],
        assetId: 'CP-STEAM-01',
        assetIds: ['CP-STEAM-01', 'CP-STEAM-02'],
        checklistItems: STEAM_A_CBE_CHECKLIST,
        offlineReady: true,
        notes: 'Comprehensive multi-datatype work order for Steam a station CBE covering all supported input and checklist types.',
        latitude: 11.0168,
        longitude: 76.9558,
        priority: 'High',
        targetTime: Date.now() + 6 * 60 * 60 * 1000,
        assignedBy: 'Marcus Aurelius',
        approver: 'Marcus Aurelius',
        primaryApprover: 'Marcus Aurelius',
        secondaryApprover: 'Andrea Meuschke',
        createdBy: 'Andrea Meuschke',
        requestedBy: 'Operations Lead CBE',
    },
];

export const STATION_BUSINESS_IMPACT: Record<string, 'High' | 'Medium' | 'Low'> = {
    'Steam a station CBE': 'High',
    'Pune Central Station': 'High',
    'Shell Recharge': 'High',
    'Tesco Extra': 'Medium',
    'Mumbai Highway Point': 'High',
    'Industrial Zone B': 'Low',
    'Moto Services': 'High',
    'Westfield Hub': 'Medium',
    'Skyline Mall Parking': 'Medium',
    'Harbor Transit Hub': 'Low',
};

export const ASSETS: AssetRecord[] = [
    {
        id: 'asset-steam-01',
        cpid: 'CP-STEAM-01',
        serial: 'RONE-883190',
        model: 'ABB Terra 360 Fast DC',
        status: 'Healthy',
        location: 'Steam a station CBE',
        lastService: '24 Sep 2026',
        firmware: 'v5.1.0',
        linkedWorkOrderId: 'wo-steam-cbe-01',
        pmAssignee: 'Tim',
        pmDurationMonths: 3,
    },
    {
        id: 'asset-1',
        cpid: 'CPID-KN-01',
        serial: 'RONE-778392',
        model: 'ABB Terra 360',
        status: 'Healthy',
        location: 'Pune Central Station',
        lastService: '18 Mar 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'PM-1000',
        pmAssignee: 'Tim',
        pmDurationMonths: 1,
    },
    {
        id: 'asset-2',
        cpid: 'CP-100239',
        serial: 'RONE-778395',
        model: 'ABB Terra 360 DC',
        status: 'Healthy',
        location: 'Shell Recharge',
        lastService: '15 Mar 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'PM-1001',
        pmAssignee: 'Tim',
        pmDurationMonths: 1,
    },
    {
        id: 'asset-3',
        cpid: 'CP-100102',
        serial: 'RONE-550412',
        model: 'Tritium RTM75',
        status: 'Healthy',
        location: 'Tesco Extra',
        lastService: '11 Mar 2026',
        firmware: 'v4.6.0',
        linkedWorkOrderId: 'PM-1002',
        pmAssignee: 'Arjun',
        pmDurationMonths: 6,
    },
    {
        id: 'asset-4',
        cpid: 'CP-200451',
        serial: 'RONE-661205',
        model: 'Tritium PKM150',
        status: 'Service Due',
        location: 'Pune Central Station',
        lastService: '02 Feb 2026',
        firmware: 'v4.5.8',
        linkedWorkOrderId: 'SW000',
    },
    {
        id: 'asset-5',
        cpid: 'CP-300182',
        serial: 'RONE-449102',
        model: 'Kempower Satellite',
        status: 'Healthy',
        location: 'Shell Recharge',
        lastService: '22 Mar 2026',
        firmware: 'v3.2.1',
        linkedWorkOrderId: 'SW001',
    },
    {
        id: 'asset-6',
        cpid: 'CP-100555',
        serial: 'RONE-903117',
        model: 'Delta UFC 200',
        status: 'Offline',
        location: 'Moto Services',
        lastService: '21 Mar 2026',
        firmware: 'v4.4.9',
        linkedWorkOrderId: 'PM-1003',
    },
    {
        id: 'asset-7',
        cpid: 'CP-400210',
        serial: 'RONE-332190',
        model: 'Delta UFC 200',
        status: 'Service Due',
        location: 'Moto Services',
        lastService: '10 Feb 2026',
        firmware: 'v4.4.9',
        linkedWorkOrderId: 'SW003',
    },
    {
        id: 'asset-8',
        cpid: 'CPID-KN-02',
        serial: 'RONE-778393',
        model: 'ABB Terra 360',
        status: 'Healthy',
        location: 'Pune Central Station',
        lastService: '18 Mar 2026',
        firmware: 'v4.6.2',
        linkedWorkOrderId: 'SW000',
    },
    {
        id: 'asset-9',
        cpid: 'CP-100240',
        serial: 'RONE-778396',
        model: 'Kempower Satellite',
        status: 'Healthy',
        location: 'Shell Recharge',
        lastService: '18 Mar 2026',
        firmware: 'v2.1.0',
        linkedWorkOrderId: 'PM-1001',
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
            { id: 'work-1', title: 'Monthly PM for EV Infra', date: '09 Dec 2024', status: 'Working', linkedWorkOrderId: 'PM-1000' },
            { id: 'work-2', title: 'Monthly PM for EV Infra', date: '11 Dec 2024', status: 'Working', linkedWorkOrderId: 'SW000' },
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
            { id: 'work-4', title: 'Monthly PM for EV Charger', date: '02 Feb 2026', status: 'Working', linkedWorkOrderId: 'PM-1001' },
            { id: 'work-5', title: 'Monthly PM for EV Charger', date: '18 Jan 2026', status: 'Working', linkedWorkOrderId: 'SW001' },
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
            { id: 'work-6', title: 'Half yearly PM for HT Yard', date: '11 Mar 2026', status: 'Assigned', linkedWorkOrderId: 'PM-1002' },
            { id: 'work-7', title: 'Half yearly PM for HT Yard', date: '12 Dec 2025', status: 'Assigned', linkedWorkOrderId: 'SW002' },
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
            { id: 'work-8', title: 'Monthly PM for EV Charger', date: '21 Mar 2026', status: 'Under Review', linkedWorkOrderId: 'PM-1003' },
            { id: 'work-9', title: 'Monthly PM for EV Charger', date: '14 Feb 2026', status: 'Completed', linkedWorkOrderId: 'SW003' },
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
                    const pmResolved = resolveChecklistForWorkOrder({
                        type: 'Preventive',
                        title: 'Monthly PM for EV Charger',
                    });
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
                        checklistTotal: pmResolved.total,
                        checklistItems: pmResolved.items,
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
    const reqResolved = resolveChecklistForWorkOrder({
        type: 'Preventive',
        title: 'Monthly PM for EV Charger',
    });
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
        checklistTotal: reqResolved.total,
        checklistItems: reqResolved.items,
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

