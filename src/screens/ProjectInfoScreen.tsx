import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { FONTS } from '../styles/futurist';

export const ProjectInfoScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors } = useTheme();

    const projectName = route.params?.projectName || 'Project Details';

    const InfoRow = ({ label, value, icon, vertical = false }: { label: string; value: string; icon?: keyof typeof Ionicons.glyphMap, vertical?: boolean }) => {
        if (vertical) {
            return (
                <View style={styles.infoRowVertical}>
                    <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                    <View style={styles.valueContainerVertical}>
                        {icon && <Ionicons name={icon} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />}
                        <Text style={[styles.infoValue, { color: colors.text, textAlign: 'left' }]}>{value}</Text>
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
                <View style={styles.valueContainer}>
                    {icon && <Ionicons name={icon} size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />}
                    <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
                </View>
            </View>
        );
    };

    const SectionHeader = ({ title, extra }: { title: string, extra?: React.ReactNode }) => (
        <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
            {extra}
        </View>
    );

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SafeAreaView style={styles.safeArea}>
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={22} color={colors.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.pageTitle, { color: colors.text }]} numberOfLines={1}>
                        {projectName}
                    </Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                    
                    {/* Station Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Station Details" 
                            extra={<Text style={{ ...FONTS.label, color: colors.success }}>Status: Active</Text>}
                        />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="Charge Station Name" value="Sri Saravana Bhavan" />
                            <InfoRow vertical label="Scheduled Date" value="2 Oct 2024 - 3 Oct 2024" />
                            <InfoRow vertical label="Signature Date" value="-" />
                        </View>
                    </View>

                    {/* Charger Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Charger Details" 
                            extra={<Text style={{ ...FONTS.label, color: colors.primary }}>3 chargers</Text>}
                        />
                        <View style={{ padding: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {[
                                    { make: 'ABB', model: 'Terra 184', type: 'DC', power: '150 kW', sn: 'Assign', conn: '2', cpid: '-', status: 'NONE' },
                                    { make: 'Tesla', model: 'Supercharger V3', type: 'DC', power: '250 kW', sn: 'Assign', conn: '1', cpid: '-', status: 'NONE' },
                                    { make: 'Siemens', model: 'VersiCharge', type: 'AC', power: '22 kW', sn: 'SVC-77281', conn: '2', cpid: 'Assign', status: 'APPR' }
                                ].map((charger, idx) => (
                                    <View key={idx} style={[styles.chargerItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <Text style={[FONTS.bodyStrong, { color: colors.text }]}>{charger.make} {charger.model}</Text>
                                        <Text style={[FONTS.caption, { color: colors.textSecondary }]}>{charger.type} • {charger.power} • {charger.conn} Connectors</Text>
                                        <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 4 }]}>SN: {charger.sn} | CPID: {charger.cpid}</Text>
                                        <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: charger.status === 'APPR' ? colors.success + '20' : colors.textSecondary + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={[FONTS.label, { fontSize: 10, color: charger.status === 'APPR' ? colors.success : colors.textSecondary }]}>{charger.status}</Text>
                                        </View>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Team Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Team Details" 
                            extra={<Text style={{ ...FONTS.label, color: colors.primary }}>4 assigned</Text>}
                        />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="Created By" value="Rohit on 12 Oct 2024" />
                            <InfoRow vertical label="Assigned By" value="Tamizh vanan on 14 Oct 2024" />
                            <View style={[styles.infoRowVertical, { width: '100%' }]}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Assigned To</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                    {['Liam', 'Sofia', 'Zara', 'Ethan'].map((name, idx) => (
                                        <View key={idx} style={{ backgroundColor: idx === 0 ? colors.primary : colors.surfaceHighlight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: idx === 0 ? colors.primary : colors.border }}>
                                            <Text style={[FONTS.caption, { color: idx === 0 ? colors.white : colors.text }]}>{name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* DSO */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="DSO" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="DSO Name" value="Wiener Netze" />
                            <InfoRow vertical label="Application Number" value="A10283999" />
                            <InfoRow vertical label="Contact Person" value="Christian Wagner" />
                            <InfoRow vertical label="Phone Number" value="+43 664 1234567" />
                            <InfoRow vertical label="Email Address" value="c.wagner@wienernetze.at" />
                            <InfoRow vertical label="DATA RICHIESTA DI ALLACCIO" value="-" />
                            <InfoRow vertical label="_RICHIESTA ALLACCIO" value="No file uploaded" />
                            <InfoRow vertical label="_SPECIFICA TECNICA" value="No file uploaded" />
                            <InfoRow vertical label="_PREVENTIVO" value="No file uploaded" />
                            <InfoRow vertical label="_ISTANZA URBANISTICA" value="No file uploaded" />
                            <InfoRow vertical label="_QUIETANZA PAGAMENTO" value="No file uploaded" />
                            <InfoRow vertical label="CDR" value="-" />
                        </View>
                    </View>

                    {/* Attachments */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Attachments" 
                            extra={<Text style={{ ...FONTS.label, color: colors.warning }}>8 total</Text>}
                        />
                        <View style={{ padding: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {['Site Survey Report.pdf', 'Installation Photos', 'Equipment Specifications.docx', 'Site Layout Diagram.png', 'Video', 'Safety Inspection.pdf', 'Equipment.jpeg', 'Timeline.xlsx'].map((file, idx) => (
                                    <View key={idx} style={[styles.attachmentBox, { borderColor: colors.border, backgroundColor: colors.surfaceHighlight }]}>
                                        <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                                        <Text style={[FONTS.caption, { color: colors.text, marginTop: 8, textAlign: 'center' }]} numberOfLines={2}>{file}</Text>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    </View>

                    {/* Chargers (Spares) */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="Chargers" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="Spares" value="No spares selected" />
                            <InfoRow vertical label="OPT INST" value="-" />
                            <InfoRow vertical label="POS" value="-" />
                        </View>
                    </View>

                    {/* Partners */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="Partners" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="OWNER ENG" value="-" />
                            <InfoRow vertical label="OWNER INST" value="-" />
                            <InfoRow vertical label="OWNER HSE" value="-" />
                            <InfoRow vertical label="OWNER FRAZIONAMENTO (SE DOVUTO)" value="-" />
                            <InfoRow vertical label="OWNER NON AGGRAVIO (SE DOVUTO)" value="-" />
                        </View>
                    </View>

                    {/* Other Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="Other Details" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="BD - INFORMAZIONI BASE" value="-" />
                            <InfoRow vertical label="DATA DI FIRMA" value="-" />
                            <InfoRow vertical label="Landlord" value="-" />
                            <InfoRow vertical label="STELLANTIS" value="-" />
                            <InfoRow vertical label="ID Hubspot" value="-" />
                            <InfoRow vertical label="PLANIMETRIA" value="-" />
                            <InfoRow vertical label="CONVENZIONE" value="-" />
                            <InfoRow vertical label="PROGETTO ELETTRICO" value="-" />
                            <InfoRow vertical label="DICO" value="-" />
                            <InfoRow vertical label="Visura Catastale" value="-" />
                            <InfoRow vertical label="PROPRIETA' PARCHEGGIO" value="-" />
                            <InfoRow vertical label="CPI" value="-" />
                            <InfoRow vertical label="POD" value="-" />
                            <InfoRow vertical label="STATUS PROGETTO" value="-" />
                            <InfoRow vertical label="ASSEGNAZIONE" value="-" />
                            <InfoRow vertical label="PM" value="-" />
                            <InfoRow vertical label="STATUS" value="-" />
                            <InfoRow vertical label="PROPOSTA KO" value="-" />
                            <InfoRow vertical label="DATA KO" value="-" />
                            <InfoRow vertical label="MOTIVAZIONE KO" value="-" />
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
    },
    backButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: -8,
    },
    pageTitle: {
        ...FONTS.h3,
        flex: 1,
        textAlign: 'center',
    },
    content: {
        padding: 16,
        gap: 16,
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    sectionTitle: {
        ...FONTS.bodyStrong,
        fontSize: 15,
    },
    cardContentGrid: {
        padding: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
    },
    infoRowVertical: {
        width: '45%', // To allow two items per row
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    valueContainerVertical: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
        marginBottom: 8,
    },
    infoLabel: {
        ...FONTS.label,
        fontSize: 11,
        textTransform: 'uppercase',
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1.5,
        justifyContent: 'flex-end',
    },
    infoValue: {
        ...FONTS.bodyStrong,
        fontSize: 13,
    },
    chargerItem: {
        width: 200,
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
    },
    attachmentBox: {
        width: 100,
        height: 100,
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
});
