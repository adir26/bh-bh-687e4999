import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register font for Hebrew support
Font.register({
  family: 'Heebo',
  src: 'https://fonts.gstatic.com/s/heebo/v21/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiS2cckOnz02SXQ.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Heebo',
    fontSize: 12,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 30,
    direction: 'rtl',
  },
  header: {
    flexDirection: 'row-reverse',
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
    paddingBottom: 10,
  },
  supplierInfo: {
    flex: 1,
    textAlign: 'right',
  },
  quoteInfo: {
    flex: 1,
    textAlign: 'left',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 5,
    color: '#6B7280',
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  table: {
    marginTop: 20,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F3F4F6',
    padding: 8,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    flex: 1,
    textAlign: 'right',
  },
  tableCellNumber: {
    flex: 0.5,
    textAlign: 'center',
  },
  tableCellAmount: {
    flex: 0.8,
    textAlign: 'left',
  },
  summary: {
    marginTop: 20,
    alignSelf: 'flex-end',
    width: '50%',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryTotal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    marginTop: 10,
    borderTopWidth: 2,
    borderTopColor: '#3B82F6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notes: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#F9FAFB',
    borderRadius: 5,
  },
  terms: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#FEF3C7',
    borderRadius: 5,
    fontSize: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#6B7280',
    fontSize: 10,
  },
});

interface ProposalPDFProps {
  data: {
    quoteNumber: string;
    creationDate: string;
    supplierInfo: {
      name: string;
      phone: string;
      email: string;
      logo?: string;
    };
    clientInfo: {
      name: string;
      email: string;
      phone: string;
    };
    items: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      subtotal: number;
    }>;
    discount: number;
    vat: number;
    notes: string;
    terms: string;
    template: 'modern' | 'minimal' | 'classic';
  };
  calculations: {
    subtotalAmount: number;
    discountAmount: number;
    vatAmount: number;
    totalAmount: number;
  };
}

export const ProposalPDF: React.FC<ProposalPDFProps> = ({ data, calculations }) => {
  const getThemeColors = () => {
    switch (data.template) {
      case 'minimal':
        return { primary: '#64748B', secondary: '#F1F5F9' };
      case 'classic':
        return { primary: '#7C2D12', secondary: '#FEF7ED' };
      default: // modern
        return { primary: '#3B82F6', secondary: '#EFF6FF' };
    }
  };

  const colors = getThemeColors();

  const dynamicStyles = StyleSheet.create({
    headerDynamic: {
      ...styles.header,
      borderBottomColor: colors.primary,
    },
    titleDynamic: {
      ...styles.title,
      color: colors.primary,
    },
    summaryTotalDynamic: {
      ...styles.summaryTotal,
      borderTopColor: colors.primary,
    },
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={dynamicStyles.headerDynamic}>
          <View style={styles.supplierInfo}>
            <Text style={dynamicStyles.titleDynamic}>הצעת מחיר</Text>
            <Text style={styles.subtitle}>מספר: {data.quoteNumber}</Text>
            <Text style={styles.subtitle}>תאריך: {new Date(data.creationDate).toLocaleDateString('he-IL')}</Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
              {data.supplierInfo.name}
            </Text>
            <Text style={styles.subtitle}>טל: {data.supplierInfo.phone}</Text>
            <Text style={styles.subtitle}>מייל: {data.supplierInfo.email}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>פרטי לקוח:</Text>
          <Text>שם: {data.clientInfo.name}</Text>
          {data.clientInfo.email && <Text>מייל: {data.clientInfo.email}</Text>}
          {data.clientInfo.phone && <Text>טלפון: {data.clientInfo.phone}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>תיאור</Text>
            <Text style={styles.tableCellNumber}>כמות</Text>
            <Text style={styles.tableCellAmount}>מחיר יחידה</Text>
            <Text style={styles.tableCellAmount}>סה"כ</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCellNumber}>{item.quantity}</Text>
              <Text style={styles.tableCellAmount}>₪{item.unitPrice.toFixed(2)}</Text>
              <Text style={styles.tableCellAmount}>₪{item.subtotal.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>סכום ביניים:</Text>
            <Text>₪{calculations.subtotalAmount.toFixed(2)}</Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>הנחה ({data.discount}%):</Text>
              <Text>-₪{calculations.discountAmount.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text>מע"מ ({data.vat}%):</Text>
            <Text>₪{calculations.vatAmount.toFixed(2)}</Text>
          </View>
          <View style={dynamicStyles.summaryTotalDynamic}>
            <Text>סה"כ לתשלום:</Text>
            <Text>₪{calculations.totalAmount.toFixed(2)}</Text>
          </View>
        </View>

        {/* Notes */}
        {data.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>הערות:</Text>
            <Text>{data.notes}</Text>
          </View>
        )}

        {/* Terms */}
        {data.terms && (
          <View style={styles.terms}>
            <Text style={styles.sectionTitle}>תנאי ההצעה:</Text>
            <Text>{data.terms}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          הצעה זו בתוקף למשך 30 יום מתאריך ההצעה
        </Text>
      </Page>
    </Document>
  );
};