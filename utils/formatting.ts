// Formatting utility module for consistent data display

export function formatCurrency(amount: number): string {
  return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPhoneNumber(phone: string): string {
  // Format as: +234 XXX XXX XXXX or 0XXX XXX XXXX
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('234')) {
    return `+234 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  if (cleaned.startsWith('0')) {
    return `0${cleaned.slice(1, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-NG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-NG', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatAccountNumber(accountNumber: string): string {
  // Format as: XXXX XXXX XX
  return accountNumber.replace(/(\d{4})(\d{4})(\d{2})/, '$1 $2 $3');
}

export function generatePaymentReference(): string {
  return `AJO_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
}
