import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register Hebrew fonts for better RTL support
Font.register({
  family: 'Rubik',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFWUUzdYPFkaVNA6w.ttf',
      fontWeight: 'normal',
    },
    {
      src: 'https://fonts.gstatic.com/s/rubik/v28/iJWZBXyIfDnIV5PNhY1KTN7Z-Yh-B4iFWkMxdYPFkaVNA6w.ttf',
      fontWeight: 'bold',
    }
  ]
});

// Fallback font
Font.register({
  family: 'Heebo',
  src: 'https://fonts.gstatic.com/s/heebo/v21/NGSpv5_NC0k9P_v6ZUCbLRAHxK1EiS2cckOnz02SXQ.ttf',
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Rubik',
    fontSize: 11,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 65,
    direction: 'rtl',
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row-reverse',
    marginBottom: 25,
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
    paddingBottom: 15,
    alignItems: 'flex-end',
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
    fontSize: 28,
    marginBottom: 8,
    color: '#1F2937',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 12,
    marginBottom: 4,
    color: '#6B7280',
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1F2937',
  },
  clientSection: {
    marginTop: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1E293B',
  },
  table: {
    marginTop: 25,
    marginBottom: 25,
  },
  tableHeader: {
    flexDirection: 'row-reverse',
    backgroundColor: '#F1F5F9',
    padding: 12,
    fontWeight: 'bold',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tableRow: {
    flexDirection: 'row-reverse',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CBD5E1',
  },
  tableCell: {
    flex: 2,
    textAlign: 'right',
    paddingRight: 8,
  },
  tableCellNumber: {
    flex: 0.8,
    textAlign: 'center',
  },
  tableCellAmount: {
    flex: 1.2,
    textAlign: 'left',
    paddingLeft: 8,
  },
  summary: {
    marginTop: 25,
    alignSelf: 'flex-end',
    width: '55%',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  summaryRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  summaryTotal: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#F8FAFC',
    fontWeight: 'bold',
    fontSize: 16,
  },
  notes: {
    marginTop: 30,
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  terms: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#FFFBEB',
    borderRadius: 8,
    fontSize: 10,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#64748B',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#F1F5F9',
    opacity: 0.1,
    zIndex: -1,
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
    template: 'modern' | 'minimal' | 'classic' | 'premium' | 'corporate';
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
      case 'premium':
        return { 
          primary: '#8B5CF6', 
          secondary: '#F3E8FF', 
          accent: '#A855F7',
          gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
        };
      case 'corporate':
        return { 
          primary: '#475569', 
          secondary: '#F1F5F9', 
          accent: '#64748B',
          gradient: 'linear-gradient(135deg, #475569 0%, #1E293B 100%)'
        };
      case 'minimal':
        return { 
          primary: '#64748B', 
          secondary: '#F8FAFC', 
          accent: '#475569',
          gradient: 'none'
        };
      case 'classic':
        return { 
          primary: '#92400E', 
          secondary: '#FEF7ED', 
          accent: '#D97706',
          gradient: 'linear-gradient(135deg, #92400E 0%, #451A03 100%)'
        };
      default: // modern
        return { 
          primary: '#2563EB', 
          secondary: '#EFF6FF', 
          accent: '#3B82F6',
          gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)'
        };
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
      backgroundColor: colors.secondary,
      color: colors.primary,
    },
    clientSectionDynamic: {
      ...styles.clientSection,
      backgroundColor: colors.secondary,
    },
  });

  // Helper function to compress/optimize content for smaller PDF size
  const formatCurrency = (amount: number) => `₪${amount.toLocaleString('he-IL', { minimumFractionDigits: 2 })}`;

  return (
    <Document title={`הצעת מחיר ${data.quoteNumber}`} author={data.supplierInfo.name}>
      <Page size="A4" style={styles.page}>
        {/* Watermark for premium template */}
        {data.template === 'premium' && (
          <Text style={styles.watermark}>PREMIUM</Text>
        )}

        {/* Header */}
        <View style={dynamicStyles.headerDynamic}>
          <View style={styles.supplierInfo}>
            <Text style={dynamicStyles.titleDynamic}>הצעת מחיר</Text>
            <Text style={styles.subtitle}>מספר: {data.quoteNumber}</Text>
            <Text style={styles.subtitle}>תאריך: {new Date(data.creationDate).toLocaleDateString('he-IL')}</Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={styles.companyName}>{data.supplierInfo.name}</Text>
            <Text style={styles.subtitle}>טל: {data.supplierInfo.phone}</Text>
            <Text style={styles.subtitle}>מייל: {data.supplierInfo.email}</Text>
          </View>
        </View>

        {/* Client Information */}
        <View style={dynamicStyles.clientSectionDynamic}>
          <Text style={styles.sectionTitle}>פרטי לקוח:</Text>
          <Text style={{ marginBottom: 4 }}>שם: {data.clientInfo.name}</Text>
          {data.clientInfo.email && <Text style={{ marginBottom: 4 }}>מייל: {data.clientInfo.email}</Text>}
          {data.clientInfo.phone && <Text style={{ marginBottom: 4 }}>טלפון: {data.clientInfo.phone}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={[styles.tableHeader, { backgroundColor: colors.secondary }]}>
            <Text style={styles.tableCell}>תיאור הפריט</Text>
            <Text style={styles.tableCellNumber}>כמות</Text>
            <Text style={styles.tableCellAmount}>מחיר יחידה</Text>
            <Text style={styles.tableCellAmount}>סה"כ</Text>
          </View>
          {data.items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.description}</Text>
              <Text style={styles.tableCellNumber}>{item.quantity.toLocaleString('he-IL')}</Text>
              <Text style={styles.tableCellAmount}>{formatCurrency(item.unitPrice)}</Text>
              <Text style={styles.tableCellAmount}>{formatCurrency(item.subtotal)}</Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>סכום ביניים:</Text>
            <Text>{formatCurrency(calculations.subtotalAmount)}</Text>
          </View>
          {data.discount > 0 && (
            <View style={styles.summaryRow}>
              <Text>הנחה ({data.discount}%):</Text>
              <Text>-{formatCurrency(calculations.discountAmount)}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text>מע"מ ({data.vat}%):</Text>
            <Text>{formatCurrency(calculations.vatAmount)}</Text>
          </View>
          <View style={dynamicStyles.summaryTotalDynamic}>
            <Text style={{ fontWeight: 'bold' }}>סה"כ לתשלום:</Text>
            <Text style={{ fontWeight: 'bold' }}>{formatCurrency(calculations.totalAmount)}</Text>
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
          הצעה זו בתוקף למשך 30 יום מתאריך ההצעה • נוצר באמצעות מערכת הצעות מחיר מתקדמת
        </Text>
      </Page>
    </Document>
  );
};