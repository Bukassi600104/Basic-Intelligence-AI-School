import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BankDetailsCard = () => {
  const [copiedField, setCopiedField] = useState(null);

  const bankDetails = {
    bankName: 'Access Bank',
    accountName: 'Basic Intelligence Community School',
    accountNumber: '0123456789',
    sortCode: '044150149'
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard?.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const DetailRow = ({ label, value, field, copyable = true }) => (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        <div className="text-sm font-semibold text-foreground font-mono">
          {value}
        </div>
      </div>
      {copyable && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, field)}
          className="ml-3"
        >
          <Icon 
            name={copiedField === field ? 'Check' : 'Copy'} 
            size={16} 
            className={copiedField === field ? 'text-success' : 'text-muted-foreground'} 
          />
        </Button>
      )}
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name="CreditCard" size={24} className="text-accent" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">Payment Instructions</h3>
          <p className="text-sm text-muted-foreground">
            Transfer the membership fee to the account below and upload your payment screenshot
          </p>
        </div>
      </div>
      <div className="space-y-3 mb-6">
        <DetailRow 
          label="Bank Name" 
          value={bankDetails?.bankName} 
          field="bankName"
        />
        <DetailRow 
          label="Account Name" 
          value={bankDetails?.accountName} 
          field="accountName"
        />
        <DetailRow 
          label="Account Number" 
          value={bankDetails?.accountNumber} 
          field="accountNumber"
        />
        <DetailRow 
          label="Sort Code" 
          value={bankDetails?.sortCode} 
          field="sortCode"
        />
      </div>
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="AlertTriangle" size={20} className="text-warning flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-semibold text-warning mb-1">Important Notes</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Transfer the exact membership fee to avoid verification delays</li>
              <li>• Keep your transfer receipt/screenshot for upload</li>
              <li>• Verification typically takes 24-48 hours</li>
              <li>• You'll receive WhatsApp confirmation once verified</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsCard;
