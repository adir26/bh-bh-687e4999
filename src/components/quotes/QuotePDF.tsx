import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Quote, QuoteItem } from '@/services/quotesService';

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
    color: '#3B82F6',
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
    flex: 2,
    textAlign: 'right',
  },
  tableCellNumber: {
    flex: 0.5,
    textAlign: 'center',
  },
  tableCellAmount: {
    flex: 1,
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

interface QuotePDFProps {
  quote: Quote;
  items: QuoteItem[];
  supplierInfo: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  clientInfo: {
    name: string;
    email?: string;
    phone?: string;
  };
  calculations: {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  };
  discountPercent?: number;
}

export const QuotePDF: React.FC<QuotePDFProps> = ({
  quote,
  items,
  supplierInfo,
  clientInfo,
  calculations,
  discountPercent = 0
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.supplierInfo}>
            <Text style={styles.title}>הצעת מחיר</Text>
            <Text style={styles.subtitle}>מספר: {quote.id.slice(0, 8).toUpperCase()}</Text>
            <Text style={styles.subtitle}>
              תאריך: {new Date(quote.created_at).toLocaleDateString('he-IL')}
            </Text>
          </View>
          <View style={styles.quoteInfo}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 5 }}>
              {supplierInfo.name}
            </Text>
            {supplierInfo.phone && (
              <Text style={styles.subtitle}>טל: {supplierInfo.phone}</Text>
            )}
            {supplierInfo.email && (
              <Text style={styles.subtitle}>מייל: {supplierInfo.email}</Text>
            )}
            {supplierInfo.address && (
              <Text style={styles.subtitle}>{supplierInfo.address}</Text>
            )}
          </View>
        </View>

        {/* Quote Title */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.sectionTitle}>{quote.title}</Text>
        </View>

        {/* Client Information */}
        <View style={styles.clientSection}>
          <Text style={styles.sectionTitle}>פרטי לקוח:</Text>
          <Text>שם: {clientInfo.name}</Text>
          {clientInfo.email && <Text>מייל: {clientInfo.email}</Text>}
          {clientInfo.phone && <Text>טלפון: {clientInfo.phone}</Text>}
        </View>

        {/* Items Table */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>תיאור</Text>
            <Text style={styles.tableCellNumber}>כמות</Text>
            <Text style={styles.tableCellAmount}>מחיר יחידה</Text>
            <Text style={styles.tableCellAmount}>סה"כ</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>
                {item.name}
                {item.description && (
                  <Text style={{ fontSize: 10, color: '#6B7280', marginTop: 2 }}>
                    {'\n'}{item.description}
                  </Text>
                )}
              </Text>
              <Text style={styles.tableCellNumber}>{item.quantity}</Text>
              <Text style={styles.tableCellAmount}>
                ₪{item.unit_price.toLocaleString('he-IL')}
              </Text>
              <Text style={styles.tableCellAmount}>
                ₪{item.subtotal.toLocaleString('he-IL')}
              </Text>
            </View>
          ))}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text>סכום ביניים:</Text>
            <Text>₪{calculations.subtotal.toLocaleString('he-IL')}</Text>
          </View>
          {discountPercent > 0 && (
            <View style={styles.summaryRow}>
              <Text>הנחה ({discountPercent}%):</Text>
              <Text>-₪{calculations.discountAmount.toLocaleString('he-IL')}</Text>
            </View>
          )}
          <View style={styles.summaryRow}>
            <Text>מע"מ ({quote.subtotal > 0 ? ((quote.tax_amount / quote.subtotal) * 100).toFixed(0) : '17'}%):</Text>
            <Text>₪{calculations.taxAmount.toLocaleString('he-IL')}</Text>
          </View>
          <View style={styles.summaryTotal}>
            <Text>סה"כ לתשלום:</Text>
            <Text>₪{calculations.totalAmount.toLocaleString('he-IL')}</Text>
          </View>
        </View>

        {/* Notes */}
        {quote.notes && (
          <View style={styles.notes}>
            <Text style={styles.sectionTitle}>הערות:</Text>
            <Text>{quote.notes}</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          הצעה זו בתוקף למשך 30 יום מתאריך ההצעה • סטטוס: {quote.status === 'draft' ? 'טיוטה' : quote.status === 'sent' ? 'נשלחה' : quote.status === 'accepted' ? 'אושרה' : 'נדחתה'}
        </Text>
      </Page>
    </Document>
  );
};