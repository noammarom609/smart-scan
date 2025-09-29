import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, ExternalLink, FileText, Building, Calendar, DollarSign, List, User, Percent, AlertCircle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

export default function InvoiceDetails({ invoice }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const safeFormatDate = (dateString) => {
    if (!dateString) return 'לא צוין';
    try {
      const date = parseISO(dateString);
      return format(date, "dd/MM/yyyy", { locale: he });
    } catch (e) {
      return dateString;
    }
  };

  const formatCurrency = (amount, currency) => {
    const symbols = { 'ILS': '₪', 'USD': '$', 'EUR': '€' };
    const symbol = symbols[currency] || currency || '₪';
    if (typeof amount !== 'number') return `לא צוין`;
    return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const getDocTypeBadge = (docType) => {
    const config = {
      TAX_INVOICE: { text: 'חשבונית מס', color: 'bg-blue-100 text-blue-800' },
      INVOICE_RECEIPT: { text: 'חשבונית מס/קבלה', color: 'bg-teal-100 text-teal-800' },
      RECEIPT: { text: 'קבלה', color: 'bg-green-100 text-green-800' },
      CREDIT_NOTE: { text: 'זיכוי', color: 'bg-orange-100 text-orange-800' },
      CARD_CHARGE: { text: 'חיוב אשראי', color: 'bg-purple-100 text-purple-800' },
      OTHER: { text: 'אחר', color: 'bg-gray-100 text-gray-800' },
    };
    const { text, color } = config[docType] || config.OTHER;
    return <Badge className={`${color} font-semibold`}>{text}</Badge>;
  };

  return (
    <Card className="border border-gray-200 elegant-shadow overflow-hidden">
      <CardHeader 
        className="p-4 flex flex-row items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base font-semibold text-gray-900 truncate">
              {invoice.vendor || 'ספק לא ידוע'}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 truncate">
              חשבונית #{invoice.invoiceNumber || 'לא ידוע'} &bull; התקבלה מ: {invoice.from}
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
                <span className="font-bold text-base text-green-600">
                {formatCurrency(invoice.total, invoice.currency)}
                </span>
                <span className="text-xs text-gray-500">
                {safeFormatDate(invoice.invoiceDate)}
                </span>
            </div>
             <Badge variant="outline" className="hidden lg:flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-orange-500"/>
                ביטחון: {Math.round((invoice.confidence || 0) * 100)}%
            </Badge>
            <Button variant="ghost" size="icon">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-4 border-t border-gray-100">
          <div className="space-y-4">
            {/* פרטים כלליים */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Building className="w-3 h-3"/> ספק</span>
                <span className="font-medium">{invoice.vendor || 'לא צוין'}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><FileText className="w-3 h-3"/> מס' חשבונית</span>
                <span className="font-mono">{invoice.invoiceNumber || 'לא צוין'}</span>
              </div>
               <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><List className="w-3 h-3"/> סוג מסמך</span>
                {getDocTypeBadge(invoice.docType)}
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> תאריך חשבונית</span>
                <span className="font-medium">{safeFormatDate(invoice.invoiceDate)}</span>
              </div>
               <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><Calendar className="w-3 h-3 text-red-500"/> תאריך לתשלום</span>
                <span className="font-medium text-red-600">{safeFormatDate(invoice.dueDate)}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 font-semibold mb-1 flex items-center gap-1"><User className="w-3 h-3"/> נשלח מ</span>
                <span className="font-medium truncate">{invoice.from}</span>
              </div>
            </div>

            {/* פרטי תשלום */}
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader className="p-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600"/>
                  פרטי תשלום
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">לפני מע"מ</span>
                  <span className="font-semibold">{formatCurrency(invoice.subtotal, invoice.currency)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">מע"מ ({invoice.vatRate || 17}%)</span>
                  <span className="font-semibold">{formatCurrency(invoice.vat, invoice.currency)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">סה"כ</span>
                  <span className="font-bold text-lg text-green-700">{formatCurrency(invoice.total, invoice.currency)}</span>
                </div>
                {invoice.paymentMethod && (
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">אמצעי תשלום</span>
                        <span className="font-semibold">{invoice.paymentMethod}</span>
                    </div>
                )}
              </CardContent>
            </Card>

            {/* פריטים בחשבונית */}
            {invoice.items && invoice.items.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><List className="w-4 h-4 text-gray-600"/> פריטים</h4>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="text-right text-xs">מוצר</TableHead>
                        <TableHead className="text-right text-xs w-24">כמות</TableHead>
                        <TableHead className="text-right text-xs w-32">מחיר יח'</TableHead>
                        <TableHead className="text-right text-xs w-32">סה"כ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {invoice.items.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="text-sm font-medium">{item.product_name}</TableCell>
                          <TableCell className="text-sm">{item.quantity || '-'}</TableCell>
                          <TableCell className="text-sm">{formatCurrency(item.unit_price, invoice.currency)}</TableCell>
                          <TableCell className="text-sm font-semibold">{formatCurrency(item.total_price, invoice.currency)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>
          <CardFooter className="p-0 pt-4 mt-4 border-t flex justify-end gap-2">
            {invoice.file_url && (
                <Button asChild variant="secondary" size="sm">
                  <a href={invoice.file_url} target="_blank" rel="noopener noreferrer">
                    פתח קובץ מצורף <ExternalLink className="mr-2 h-3 w-3" />
                  </a>
                </Button>
            )}
            <Button asChild variant="outline" size="sm">
              <a href={invoice.gmailLink} target="_blank" rel="noopener noreferrer">
                פתח במייל <ExternalLink className="mr-2 h-3 w-3" />
              </a>
            </Button>
          </CardFooter>
        </CardContent>
      )}
    </Card>
  );
}