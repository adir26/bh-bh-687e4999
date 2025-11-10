import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Hebrew fonts
Font.register({
  family: 'Rubik',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFV0U1.ttf', fontWeight: 400 },
    { src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-WYiFV0U1.ttf', fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Rubik',
    fontSize: 10,
    direction: 'rtl',
    position: 'relative',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 80,
    color: '#f1f5f9',
    opacity: 0.1,
    zIndex: -1,
  },
  header: {
    marginBottom: 20,
    paddingBottom: 20,
    borderBottomWidth: 3,
  },
  headerGradient: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
  },
  logoContainer: {
    width: 100,
    height: 80,
    objectFit: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 700,
    marginBottom: 8,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
  },
  section: {
    marginTop: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 10,
    textAlign: 'right',
    padding: 8,
    borderRadius: 4,
  },
  infoGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: 10,
  },
  infoCard: {
    flex: 1,
    minWidth: '45%',
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    marginBottom: 5,
    textAlign: 'right',
  },
  label: {
    fontWeight: 700,
    color: '#475569',
    marginLeft: 8,
  },
  value: {
    color: '#1e293b',
    flex: 1,
  },
  finding: {
    marginBottom: 15,
    padding: 12,
    borderRadius: 8,
    borderRightWidth: 4,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  findingHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  severityBadge: {
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontSize: 8,
    fontWeight: 700,
    color: '#fff',
  },
  findingTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
    textAlign: 'right',
    flex: 1,
  },
  findingDescription: {
    fontSize: 10,
    marginBottom: 6,
    textAlign: 'right',
    lineHeight: 1.5,
  },
  findingMeta: {
    fontSize: 9,
    textAlign: 'right',
    marginTop: 4,
  },
  costTable: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
  },
  costTableHeader: {
    flexDirection: 'row-reverse',
    padding: 8,
    fontWeight: 700,
    fontSize: 9,
  },
  costTableRow: {
    flexDirection: 'row-reverse',
    padding: 8,
    fontSize: 9,
    borderTopWidth: 1,
  },
  costCol1: { width: '40%', textAlign: 'right' },
  costCol2: { width: '15%', textAlign: 'center' },
  costCol3: { width: '15%', textAlign: 'center' },
  costCol4: { width: '15%', textAlign: 'center' },
  costCol5: { width: '15%', textAlign: 'left', fontWeight: 700 },
  summary: {
    marginTop: 25,
    padding: 20,
    borderRadius: 8,
    borderWidth: 2,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 8,
    textAlign: 'right',
    fontSize: 11,
  },
  summaryLabel: {
    fontWeight: 700,
  },
  summaryValue: {
    fontWeight: 700,
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 3,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: 700,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: 700,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  signatureSection: {
    marginTop: 30,
    padding: 20,
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginTop: 10,
    alignSelf: 'flex-end',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
  },
  badge: {
    padding: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    fontSize: 8,
    fontWeight: 700,
    alignSelf: 'flex-start',
  },
});

interface InspectionReportPDFProps {
  report: any;
  findings: any[];
  costs: any[];
  signature?: string; // base64 signature image
  template?: string;
  logoUrl?: string;
}

export const InspectionReportPDF = ({ report, findings, costs, signature, template = 'classic', logoUrl }: InspectionReportPDFProps) => {
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  // Get theme colors based on template
  const getThemeColors = () => {
    switch (template) {
      case 'modern':
        return { 
          primary: '#8b5cf6', 
          secondary: '#a78bfa', 
          accent: '#6d28d9', 
          light: '#f3e8ff',
          gradient: ['#8b5cf6', '#a78bfa'],
          finding: '#faf5ff',
        };
      case 'elegant':
        return { 
          primary: '#059669', 
          secondary: '#34d399', 
          accent: '#047857', 
          light: '#d1fae5',
          gradient: ['#059669', '#34d399'],
          finding: '#ecfdf5',
        };
      case 'premium':
        return { 
          primary: '#dc2626', 
          secondary: '#f87171', 
          accent: '#991b1b', 
          light: '#fee2e2',
          gradient: ['#dc2626', '#f87171'],
          finding: '#fef2f2',
        };
      default: // classic
        return { 
          primary: '#2563eb', 
          secondary: '#64748b', 
          accent: '#1e40af', 
          light: '#eff6ff',
          gradient: ['#2563eb', '#3b82f6'],
          finding: '#eff6ff',
        };
    }
  };

  const colors = getThemeColors();

  // Dynamic styles based on template
  const dynamicStyles = StyleSheet.create({
    headerGradient: {
      backgroundColor: colors.light,
      borderBottomWidth: 3,
      borderBottomColor: colors.primary,
    },
    headerBorder: {
      borderBottomColor: colors.primary,
    },
    titleColor: {
      color: colors.accent,
    },
    sectionTitleBg: {
      backgroundColor: colors.light,
      color: colors.accent,
    },
    findingBg: {
      backgroundColor: colors.finding,
      borderRightColor: colors.primary,
    },
    costTableHeader: {
      backgroundColor: colors.light,
      borderColor: colors.secondary,
    },
    costTableBorder: {
      borderColor: colors.secondary,
    },
    summaryBg: {
      backgroundColor: colors.light,
      borderColor: colors.primary,
    },
    accentText: {
      color: colors.accent,
    },
    primaryBorder: {
      borderTopColor: colors.primary,
    },
  });

  // Group costs by finding
  const costsByFinding = costs.reduce((acc, cost) => {
    if (!acc[cost.item_id]) {
      acc[cost.item_id] = [];
    }
    acc[cost.item_id].push(cost);
    return acc;
  }, {} as Record<string, any[]>);

  // Calculate total cost
  const totalCost = costs.reduce((sum, cost) => sum + (cost.total_price || 0), 0);

  // Get severity badge color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#f59e0b';
      case 'low': return '#84cc16';
      default: return '#64748b';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'קריטי';
      case 'high': return 'גבוה';
      case 'medium': return 'בינוני';
      case 'low': return 'נמוך';
      default: return severity;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark for Premium */}
        {template === 'premium' && (
          <Text style={styles.watermark}>PREMIUM</Text>
        )}

        {/* Header */}
        <View style={[styles.headerGradient, dynamicStyles.headerGradient]}>
          <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, dynamicStyles.titleColor]}>דוח בדיקה מקצועי</Text>
              <Text style={styles.subtitle}>תאריך: {formatDate(report.created_at)}</Text>
              <Text style={[styles.badge, { backgroundColor: colors.primary, color: '#fff', marginTop: 8 }]}>
                {template === 'premium' ? 'תבנית פרימיום' : 
                 template === 'modern' ? 'תבנית מודרנית' :
                 template === 'elegant' ? 'תבנית אלגנטית' : 'תבנית קלאסית'}
              </Text>
            </View>
            
            {/* Inspector info and logo on the left */}
            <View style={{ marginLeft: 15, alignItems: 'flex-start' }}>
              {logoUrl && (
                <Image 
                  src={logoUrl} 
                  style={styles.logoContainer}
                />
              )}
              {report.inspector_name && (
                <View style={{ marginTop: 10, alignItems: 'flex-start' }}>
                  <Text style={{ fontSize: 10, fontWeight: 700, color: colors.accent, marginBottom: 4 }}>
                    {report.inspector_name}
                  </Text>
                  {report.inspector_company && (
                    <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>
                      {report.inspector_company}
                    </Text>
                  )}
                  {report.inspector_license && (
                    <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>
                      רישיון: {report.inspector_license}
                    </Text>
                  )}
                  {report.inspector_phone && (
                    <Text style={{ fontSize: 8, color: '#64748b', marginBottom: 2 }}>
                      ☎ {report.inspector_phone}
                    </Text>
                  )}
                  {report.inspector_email && (
                    <Text style={{ fontSize: 8, color: '#64748b' }}>
                      ✉ {report.inspector_email}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Report Details */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, dynamicStyles.sectionTitleBg]}>פרטי הדוח</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>כותרת:</Text>
                <Text style={styles.value}>{report.title || 'ללא כותרת'}</Text>
              </View>
            </View>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Text style={styles.label}>סטטוס:</Text>
                <Text style={styles.value}>{report.status === 'draft' ? 'טיוטה' : report.status === 'final' ? 'סופי' : 'הושלם'}</Text>
              </View>
            </View>
            {report.property_address && (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>כתובת נכס:</Text>
                  <Text style={styles.value}>{report.property_address}</Text>
                </View>
              </View>
            )}
            {report.client_name && (
              <View style={styles.infoCard}>
                <View style={styles.infoRow}>
                  <Text style={styles.label}>שם לקוח:</Text>
                  <Text style={styles.value}>{report.client_name}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Findings */}
        {findings.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitleBg]}>ממצאים ({findings.length})</Text>
            {findings.map((finding, index) => (
              <View key={finding.id} style={[styles.finding, dynamicStyles.findingBg]}>
                <View style={styles.findingHeader}>
                  <Text style={styles.findingTitle}>
                    {index + 1}. {finding.title}
                  </Text>
                  <View style={[styles.severityBadge, { backgroundColor: getSeverityColor(finding.severity) }]}>
                    <Text style={{ color: '#fff' }}>{getSeverityLabel(finding.severity)}</Text>
                  </View>
                </View>
                {finding.description && (
                  <Text style={styles.findingDescription}>{finding.description}</Text>
                )}
                <Text style={styles.findingMeta}>
                  📍 מיקום: {finding.location || 'לא צוין'}
                  {finding.room && ` | 🏠 חדר: ${finding.room}`}
                </Text>

                {/* Costs for this finding */}
                {costsByFinding[finding.id] && costsByFinding[finding.id].length > 0 && (
                  <View style={[styles.costTable, dynamicStyles.costTableBorder]}>
                    <View style={[styles.costTableHeader, dynamicStyles.costTableHeader]}>
                      <Text style={styles.costCol1}>תיאור</Text>
                      <Text style={styles.costCol2}>כמות</Text>
                      <Text style={styles.costCol3}>יחידה</Text>
                      <Text style={styles.costCol4}>מחיר יחידה</Text>
                      <Text style={styles.costCol5}>סה"כ</Text>
                    </View>
                    {costsByFinding[finding.id].map((cost) => (
                      <View key={cost.id} style={[styles.costTableRow, dynamicStyles.costTableBorder]}>
                        <Text style={styles.costCol1}>{cost.description}</Text>
                        <Text style={styles.costCol2}>{cost.quantity}</Text>
                        <Text style={styles.costCol3}>{cost.unit}</Text>
                        <Text style={styles.costCol4}>{formatCurrency(cost.unit_price)}</Text>
                        <Text style={styles.costCol5}>{formatCurrency(cost.total_price)}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Cost Summary */}
        {costs.length > 0 && (
          <View style={[styles.summary, dynamicStyles.summaryBg]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitleBg]}>סיכום עלויות</Text>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, dynamicStyles.accentText]}>מספר ממצאים:</Text>
              <Text style={[styles.summaryValue, dynamicStyles.accentText]}>{findings.length}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, dynamicStyles.accentText]}>סה"כ פריטי עלות:</Text>
              <Text style={[styles.summaryValue, dynamicStyles.accentText]}>{costs.length}</Text>
            </View>
            <View style={[styles.totalRow, dynamicStyles.primaryBorder]}>
              <Text style={[styles.totalLabel, dynamicStyles.accentText]}>סה"כ עלות משוערת:</Text>
              <Text style={[styles.totalValue, dynamicStyles.accentText]}>{formatCurrency(totalCost)}</Text>
            </View>
          </View>
        )}

        {/* Signature */}
        {signature && (
          <View style={[styles.signatureSection, { borderColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, dynamicStyles.sectionTitleBg]}>חתימה דיגיטלית</Text>
            <Image src={signature} style={styles.signatureImage} />
            <Text style={[styles.subtitle, { marginTop: 10, textAlign: 'right' }]}>
              ✓ נחתם בתאריך: {formatDate(new Date().toISOString())}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>דוח זה נוצר באופן אוטומטי על ידי מערכת הבדיקה המקצועית</Text>
          <Text>תאריך הפקה: {formatDate(new Date().toISOString())}</Text>
        </View>
      </Page>
    </Document>
  );
};
