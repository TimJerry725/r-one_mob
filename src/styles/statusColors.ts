export const getStatusColor = (status: string, colors: any, isDark: boolean): string => {
    const s = (status || '').toLowerCase();
    
    // In progress -> green
    if (['working', 'in progress', 'active', 'online', 'appr'].includes(s)) {
        return colors.success;
    }
    
    // Completed -> blue
    if (['completed', 'complete', 'closed'].includes(s)) {
        return isDark ? (colors.primaryLight || colors.primary) : colors.primary;
    }
    
    // Others
    if (['assigned', 'on route', 'at site'].includes(s)) {
        return colors.secondary;
    }
    if (['unassigned', 'open', 'under review', 'faulted'].includes(s)) {
        return colors.warning;
    }
    if (['offline', 'error'].includes(s)) {
        return colors.danger;
    }
    
    return colors.textSecondary;
};
