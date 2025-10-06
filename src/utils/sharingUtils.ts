interface ListingShareData {
  title: string;
  description?: string;
  price?: number;
  location?: string;
  listingId: string;
}

export const sharingUtils = {
  /**
   * Share via WhatsApp
   */
  shareViaWhatsApp: (data: ListingShareData) => {
    const url = `${window.location.origin}/marketplace/${data.listingId}`;
    const text = `
🐄 ${data.title}

${data.description ? `📝 ${data.description}\n` : ''}
${data.price ? `💰 Price: ${data.price.toLocaleString()} ETB\n` : ''}
${data.location ? `📍 Location: ${data.location}\n` : ''}

🔗 View listing: ${url}
    `.trim();

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  },

  /**
   * Share via SMS
   */
  shareViaSMS: (data: ListingShareData) => {
    const url = `${window.location.origin}/marketplace/${data.listingId}`;
    const text = `${data.title} - ${data.price ? data.price.toLocaleString() + ' ETB' : 'Price available'}\n${url}`;
    
    const smsUrl = `sms:?body=${encodeURIComponent(text)}`;
    window.location.href = smsUrl;
  },

  /**
   * Share via Email
   */
  shareViaEmail: (data: ListingShareData) => {
    const url = `${window.location.origin}/marketplace/${data.listingId}`;
    const subject = `Livestock Listing: ${data.title}`;
    const body = `
I found this livestock listing that might interest you:

${data.title}
${data.description ? `\nDescription: ${data.description}` : ''}
${data.price ? `\nPrice: ${data.price.toLocaleString()} ETB` : ''}
${data.location ? `\nLocation: ${data.location}` : ''}

View full listing: ${url}
    `.trim();

    const emailUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = emailUrl;
  },

  /**
   * Copy link to clipboard
   */
  copyLink: async (listingId: string): Promise<boolean> => {
    const url = `${window.location.origin}/marketplace/${listingId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  },

  /**
   * Native share API (for mobile devices)
   */
  nativeShare: async (data: ListingShareData): Promise<boolean> => {
    if (!navigator.share) {
      return false;
    }

    const url = `${window.location.origin}/marketplace/${data.listingId}`;
    
    try {
      await navigator.share({
        title: data.title,
        text: `${data.description || ''}\n${data.price ? `Price: ${data.price.toLocaleString()} ETB` : ''}`,
        url: url,
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred
      return false;
    }
  },
};
