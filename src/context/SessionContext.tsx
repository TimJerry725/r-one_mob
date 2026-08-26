import React, { createContext, useContext, useState } from 'react';

type SessionState = {
    displayName: string;
    email: string;
    dutyStatus: 'working' | 'away';
};

type SessionContextType = SessionState & {
    setSession: (next: Partial<SessionState>) => void;
};

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const DEFAULT_SESSION: SessionState = {
    displayName: 'Technician',
    email: '',
    dutyStatus: 'working',
};

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [session, setSessionState] = useState<SessionState>(DEFAULT_SESSION);

    const setSession = (next: Partial<SessionState>) => {
        setSessionState((current) => ({
            ...current,
            ...next,
        }));
    };

    return (
        <SessionContext.Provider value={{ ...session, setSession }}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
