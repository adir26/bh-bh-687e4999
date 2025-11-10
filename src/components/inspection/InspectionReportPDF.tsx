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
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'right',
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e293b',
    marginBottom: 8,
    textAlign: 'right',
    backgroundColor: '#f1f5f9',
    padding: 6,
  },
  infoRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 5,
    textAlign: 'right',
  },
  label: {
    fontWeight: 700,
    color: '#475569',
  },
  value: {
    color: '#1e293b',
  },
  finding: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 4,
    borderRightWidth: 3,
    borderRightColor: '#ef4444',
  },
  findingTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#991b1b',
    marginBottom: 4,
    textAlign: 'right',
  },
  findingDescription: {
    fontSize: 10,
    color: '#450a0a',
    marginBottom: 4,
    textAlign: 'right',
    lineHeight: 1.4,
  },
  findingMeta: {
    fontSize: 9,
    color: '#7f1d1d',
    textAlign: 'right',
  },
  costTable: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  costTableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#f1f5f9',
    padding: 6,
    fontWeight: 700,
    fontSize: 9,
  },
  costTableRow: {
    flexDirection: 'row-reverse',
    padding: 6,
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  costCol1: { width: '40%', textAlign: 'right' },
  costCol2: { width: '15%', textAlign: 'center' },
  costCol3: { width: '15%', textAlign: 'center' },
  costCol4: { width: '15%', textAlign: 'center' },
  costCol5: { width: '15%', textAlign: 'left' },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eff6ff',
    borderRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 6,
    textAlign: 'right',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1e40af',
  },
  summaryValue: {
    fontSize: 11,
    color: '#1e293b',
  },
  totalRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 2,
    borderTopColor: '#2563eb',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e40af',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: 700,
    color: '#1e40af',
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
    padding: 15,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 4,
  },
  signatureImage: {
    width: 200,
    height: 80,
    marginTop: 10,
    alignSelf: 'flex-end',
  },
});

interface InspectionReportPDFProps {
  report: any;
  findings: any[];
  costs: any[];
  signature?: string; // base64 signature image
}

export const InspectionReportPDF = ({ report, findings, costs, signature }: InspectionReportPDFProps) => {
  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

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

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>דוח בדיקה מקצועי</Text>
          <Text style={styles.subtitle}>תאריך: {formatDate(report.created_at)}</Text>
        </View>

        {/* Report Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>פרטי הדוח</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>כותרת:</Text>
            <Text style={styles.value}>{report.title || 'ללא כותרת'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>סטטוס:</Text>
            <Text style={styles.value}>{report.status === 'draft' ? 'טיוטה' : report.status === 'final' ? 'סופי' : 'הושלם'}</Text>
          </View>
          {report.property_address && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>כתובת נכס:</Text>
              <Text style={styles.value}>{report.property_address}</Text>
            </View>
          )}
          {report.client_name && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>שם לקוח:</Text>
              <Text style={styles.value}>{report.client_name}</Text>
            </View>
          )}
        </View>

        {/* Findings */}
        {findings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ממצאים ({findings.length})</Text>
            {findings.map((finding, index) => (
              <View key={finding.id} style={styles.finding}>
                <Text style={styles.findingTitle}>
                  {index + 1}. {finding.title}
                </Text>
                {finding.description && (
                  <Text style={styles.findingDescription}>{finding.description}</Text>
                )}
                <Text style={styles.findingMeta}>
                  חומרה: {finding.severity === 'critical' ? 'קריטי' : finding.severity === 'high' ? 'גבוה' : finding.severity === 'medium' ? 'בינוני' : 'נמוך'} | 
                  מיקום: {finding.location || 'לא צוין'}
                </Text>

                {/* Costs for this finding */}
                {costsByFinding[finding.id] && costsByFinding[finding.id].length > 0 && (
                  <View style={styles.costTable}>
                    <View style={styles.costTableHeader}>
                      <Text style={styles.costCol1}>תיאור</Text>
                      <Text style={styles.costCol2}>כמות</Text>
                      <Text style={styles.costCol3}>יחידה</Text>
                      <Text style={styles.costCol4}>מחיר יחידה</Text>
                      <Text style={styles.costCol5}>סה"כ</Text>
                    </View>
                    {costsByFinding[finding.id].map((cost) => (
                      <View key={cost.id} style={styles.costTableRow}>
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
          <View style={styles.summary}>
            <Text style={styles.sectionTitle}>סיכום עלויות</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>סה"כ פריטים:</Text>
              <Text style={styles.summaryValue}>{costs.length}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>סה"כ עלות משוערת:</Text>
              <Text style={styles.totalValue}>{formatCurrency(totalCost)}</Text>
            </View>
          </View>
        )}

        {/* Signature */}
        {signature && (
          <View style={styles.signatureSection}>
            <Text style={[styles.sectionTitle, { backgroundColor: 'transparent' }]}>חתימה</Text>
            <Image src={signature} style={styles.signatureImage} />
            <Text style={[styles.subtitle, { marginTop: 5 }]}>
              נחתם בתאריך: {formatDate(new Date().toISOString())}
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
