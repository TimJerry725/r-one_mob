import React from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { getStatusColor } from '../styles/statusColors';
import { FONTS } from '../styles/futurist';

export const ProjectInfoScreen = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { colors, isDark } = useTheme();

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
                            <InfoRow vertical label="Charge Station Name" value="Powy Hub Torino Centro" />
                            <InfoRow vertical label="Scheduled Date" value="15 Ott 2024 - 28 Ott 2024" />
                            <InfoRow vertical label="Signature Date" value="04 Set 2024" />
                            <InfoRow vertical label="Indirizzo" value="Corso Vittorio Emanuele II, 58, Torino" />
                            <InfoRow vertical label="Regione / Provincia" value="Piemonte / Torino (TO)" />
                            <InfoRow vertical label="Codice Sito Powy" value="IT-TO-0042" />
                        </View>
                    </View>

                    {/* Charger Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Charger Details" 
                            extra={<Text style={{ ...FONTS.label, color: colors.primary }}>3 colonnine</Text>}
                        />
                        <View style={{ padding: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {[
                                    { make: 'Alpitronic', model: 'Hypercharger HYC300', type: 'DC Ultra-Fast', power: '300 kW', sn: 'ALP-IT-9921', conn: '2 CCS', cpid: 'CP-100239', status: 'WORKING' },
                                    { make: 'ABB', model: 'Terra 184', type: 'DC Fast', power: '180 kW', sn: 'ABB-IT-4882', conn: '2 CCS', cpid: 'CP-100240', status: 'WORKING' },
                                    { make: 'Scame', model: 'BE-W Wallbox', type: 'AC', power: '22 kW', sn: 'SCM-77281', conn: '2 Type 2', cpid: 'CP-100241', status: 'APPR' }
                                ].map((charger, idx) => (
                                    <View key={idx} style={[styles.chargerItem, { borderColor: colors.border, backgroundColor: colors.background }]}>
                                        <Text style={[FONTS.bodyStrong, { color: colors.text }]}>{charger.make} {charger.model}</Text>
                                        <Text style={[FONTS.caption, { color: colors.textSecondary }]}>{charger.type} • {charger.power} • {charger.conn}</Text>
                                        <Text style={[FONTS.caption, { color: colors.textSecondary, marginTop: 4 }]}>SN: {charger.sn} | CPID: {charger.cpid}</Text>
                                        <View style={{ position: 'absolute', top: 12, right: 12, backgroundColor: getStatusColor(charger.status, colors, isDark) + '20', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                            <Text style={[FONTS.label, { fontSize: 10, color: getStatusColor(charger.status, colors, isDark) }]}>{charger.status}</Text>
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
                            extra={<Text style={{ ...FONTS.label, color: colors.primary }}>4 assegnati</Text>}
                        />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="Created By" value="Ing. Alessandro Gallo on 04 Set 2024" />
                            <InfoRow vertical label="Assigned By" value="Marco Bianchi on 10 Ott 2024" />
                            <View style={[styles.infoRowVertical, { width: '100%' }]}>
                                <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Assigned To</Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                                    {['Timothy (Lead)', 'Matteo Ferrari', 'Luca Esposito', 'Giulia Conti'].map((name, idx) => (
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
                        <SectionHeader title="DSO (Distributore di Rete)" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="DSO Name" value="e-distribuzione S.p.A." />
                            <InfoRow vertical label="Application Number" value="PRAT-IT-2024-884920" />
                            <InfoRow vertical label="Contact Person" value="Ing. Roberto Ferri" />
                            <InfoRow vertical label="Phone Number" value="+39 011 556 811" />
                            <InfoRow vertical label="Email Address" value="allacciamenti.piemonte@e-distribuzione.com" />
                            <InfoRow vertical label="DATA RICHIESTA DI ALLACCIO" value="18 Giugno 2024" />
                            <InfoRow vertical label="_RICHIESTA ALLACCIO" value="Richiesta_Allaccio_Powy_TO_v2.pdf" />
                            <InfoRow vertical label="_SPECIFICA TECNICA" value="Specifica_Tecnica_MT_BT_edistr.pdf" />
                            <InfoRow vertical label="_PREVENTIVO" value="Preventivo_Allaccio_Accettato.pdf" />
                            <InfoRow vertical label="_ISTANZA URBANISTICA" value="SCIA_Comune_Torino_Prot_2024_0812.pdf" />
                            <InfoRow vertical label="_QUIETANZA PAGAMENTO" value="Quietanza_Oneri_Bonifico.pdf" />
                            <InfoRow vertical label="CDR (Codice Rete)" value="CDR-TO-883921" />
                        </View>
                    </View>

                    {/* Attachments */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader 
                            title="Attachments (Documenti di Progetto)" 
                            extra={<Text style={{ ...FONTS.label, color: colors.warning }}>8 file</Text>}
                        />
                        <View style={{ padding: 16 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                {[
                                    'Relazione Tecnica As-Built.pdf',
                                    'Foto Scavi e Cavidotti.jpg',
                                    'Specifiche Alpitronic HYC300.pdf',
                                    'Planimetria Layout Elettrico.png',
                                    'Video Ispezione Cabina MT.mp4',
                                    'DICO Conformita DM37_08.pdf',
                                    'Certificato Messa a Terra.pdf',
                                    'Cronoprogramma Lavori.xlsx'
                                ].map((file, idx) => (
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
                        <SectionHeader title="Ricambi e Apparecchiature" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="Spares (Ricambi)" value="1x Cavo CCS 400A Liquid Cooled, 2x Fusibili DC 250A" />
                            <InfoRow vertical label="OPT INST" value="Basamento prefabbricato CLS armato" />
                            <InfoRow vertical label="POS Payment Terminal" value="Ingenico Self/2000 Contactless" />
                        </View>
                    </View>

                    {/* Partners */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="Partners e Fornitori" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="OWNER ENG" value="Studio Tecnico Ing. Moretti (Torino)" />
                            <InfoRow vertical label="OWNER INST" value="ElettroImpianti Piemonte S.r.l." />
                            <InfoRow vertical label="OWNER HSE" value="SicurConsulting Italia S.r.l." />
                            <InfoRow vertical label="OWNER FRAZIONAMENTO (SE DOVUTO)" value="Studio Geom. Barone & Associati" />
                            <InfoRow vertical label="OWNER NON AGGRAVIO (SE DOVUTO)" value="Relazione Non Aggravio Rischio VVF" />
                        </View>
                    </View>

                    {/* Other Details */}
                    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <SectionHeader title="Dettagli Amministrativi e Urbanistici" />
                        <View style={styles.cardContentGrid}>
                            <InfoRow vertical label="BD - INFORMAZIONI BASE" value="Convenzione 10 Anni + 5 Rinnovo" />
                            <InfoRow vertical label="DATA DI FIRMA" value="04/09/2024" />
                            <InfoRow vertical label="Landlord" value="Immobiliare Lingotto S.p.A." />
                            <InfoRow vertical label="STELLANTIS" value="Accreditato Free2Move / Powy Network" />
                            <InfoRow vertical label="ID Hubspot" value="HS-POWY-IT-99238" />
                            <InfoRow vertical label="PLANIMETRIA" value="Planimetria_As-Built_Torino_v2.dwg" />
                            <InfoRow vertical label="CONVENZIONE" value="Convenzione_Spazi_Powy_Signed.pdf" />
                            <InfoRow vertical label="PROGETTO ELETTRICO" value="Progetto_Esecutivo_MT_BT_Timbro.pdf" />
                            <InfoRow vertical label="DICO" value="DICO_DM37_08_Certificato.pdf" />
                            <InfoRow vertical label="Visura Catastale" value="Foglio 42, Particella 819, Sub 4" />
                            <InfoRow vertical label="PROPRIETA' PARCHEGGIO" value="Privato ad uso pubblico H24" />
                            <InfoRow vertical label="CPI" value="CPI_Pratica_VVFF_TO_44921" />
                            <InfoRow vertical label="POD" value="IT001E89234882" />
                            <InfoRow vertical label="STATUS PROGETTO" value="In Corso (Allaccio e-distribuzione)" />
                            <InfoRow vertical label="ASSEGNAZIONE" value="Team Nord-Ovest (Piemonte / Liguria)" />
                            <InfoRow vertical label="PM" value="Ing. Alessandro Gallo" />
                            <InfoRow vertical label="STATUS" value="Lavori in corso" />
                            <InfoRow vertical label="PROPOSTA KO" value="No" />
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
