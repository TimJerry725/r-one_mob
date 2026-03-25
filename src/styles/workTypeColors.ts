export type ServiceType = 'Installation' | 'Maintenance' | 'Preventive';

type ServiceTypeColors = {
    background: string;
    border: string;
    text: string;
    tint: string;
    tintText: string;
};

const LIGHT_TYPE_COLORS: Record<ServiceType, ServiceTypeColors> = {
    Installation: {
        background: '#005EB8',
        border: '#004A90',
        text: '#FFFFFF',
        tint: '#E6F1FB',
        tintText: '#003F74',
    },
    Maintenance: {
        background: '#A64B00',
        border: '#7A3600',
        text: '#FFFFFF',
        tint: '#FDEFE2',
        tintText: '#6B2E00',
    },
    Preventive: {
        background: '#006B4F',
        border: '#004E3A',
        text: '#FFFFFF',
        tint: '#E4F6EE',
        tintText: '#004C39',
    },
};

const DARK_TYPE_COLORS: Record<ServiceType, ServiceTypeColors> = {
    Installation: {
        background: '#57B5FF',
        border: '#1E6088',
        text: '#051823',
        tint: '#D9F0FF',
        tintText: '#0F405E',
    },
    Maintenance: {
        background: '#FFB04C',
        border: '#7A4208',
        text: '#2A1400',
        tint: '#FFE4BF',
        tintText: '#5E2E00',
    },
    Preventive: {
        background: '#54E0A4',
        border: '#1F6B4E',
        text: '#041F17',
        tint: '#D8F8E9',
        tintText: '#0B4B36',
    },
};

export const getServiceTypeColors = (type: ServiceType, isDark: boolean) =>
    (isDark ? DARK_TYPE_COLORS : LIGHT_TYPE_COLORS)[type];
