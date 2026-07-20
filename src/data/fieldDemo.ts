export type WorkOrderStatus = 'Unassigned' | 'Assigned' | 'Working' | 'Under Review' | 'Completed';

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
    checklistItems?: ChecklistTemplateItem[];
    offlineReady: boolean;
    notes: string;
    latitude: number;
    longitude: number;
    priority: 'High' | 'Medium' | 'Low';
    targetTime: number;
    assignedBy?: string;
    approver?: string;
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
    type: 'toggle' | 'text' | 'photo' | 'number' | 'date' | 'not_applicable' | 'radio' | 'multiselect' | 'media' | 'remarks_response';
    required: boolean;
    options?: string[];
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
        required: true,
    },
];

export let WORK_ORDERS: WorkOrder[] = [
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
        title: 'Expansion Bay Checklist',
        siteName: 'Harbor Transit Hub',
        address: 'Dock Access Road, Kochi',
        type: 'Preventive',
        stage: 'Draft',
        status: 'Unassigned',
        dueWindow: 'Tomorrow, 14:00 - 16:00',
        eta: 'Checklist not configured yet',
        distance: '4.7 km',
        checklistCompleted: 0,
        checklistTotal: 0,
        tools: ['Inspection torch'],
        parts: [],
        technicians: ['Tim'],
        assetId: 'CP-400210',
        checklistItems: [],
        offlineReady: true,
        notes: 'Checklist shell created before the field steps were added.',
        latitude: 9.9312,
        longitude: 76.2673,
        priority: 'Low',
        targetTime: Date.now() + 48 * 60 * 60 * 1000,
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

