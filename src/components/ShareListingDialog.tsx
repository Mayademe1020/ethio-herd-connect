import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { sharingUtils } from '@/utils/sharingUtils';
import { MessageCircle, Mail, Link2, Share2, MessageSquare } from 'lucide-react';

interface ShareListingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id: string;
    title: string;
    description?: string | null;
    price?: number | null;
    location?: string | null;
  };
  language?: string;
}

export const ShareListingDialog = ({ isOpen, onClose, listing, language = 'en' }: ShareListingDialogProps) => {
  const { toast } = useToast();

  const translations = {
    en: {
      title: 'Share Listing',
      whatsapp: 'WhatsApp',
      sms: 'SMS',
      email: 'Email',
      copyLink: 'Copy Link',
      nativeShare: 'More Options',
      linkCopied: 'Link copied!',
      linkCopiedDesc: 'Listing link copied to clipboard',
      shareFailed: 'Share failed',
      shareFailedDesc: 'Could not share listing',
    },
    am: {
      title: 'ማጋራት',
      whatsapp: 'ዋትስአፕ',
      sms: 'ኤስኤምኤስ',
      email: 'ኢሜይል',
      copyLink: 'አገናኝ ቅዳ',
      nativeShare: 'ተጨማሪ አማራጮች',
      linkCopied: 'አገናኝ ተቀድቷል!',
      linkCopiedDesc: 'የዝርዝር አገናኝ ወደ ቅዳ ተቀድቷል',
      shareFailed: 'ማጋራት አልተሳካም',
      shareFailedDesc: 'ዝርዝሩን ማጋራት አልተቻለም',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  const handleWhatsAppShare = () => {
    sharingUtils.shareViaWhatsApp({
      title: listing.title,
      description: listing.description || undefined,
      price: listing.price || undefined,
      location: listing.location || undefined,
      listingId: listing.id,
    });
    onClose();
  };

  const handleSMSShare = () => {
    sharingUtils.shareViaSMS({
      title: listing.title,
      description: listing.description || undefined,
      price: listing.price || undefined,
      location: listing.location || undefined,
      listingId: listing.id,
    });
    onClose();
  };

  const handleEmailShare = () => {
    sharingUtils.shareViaEmail({
      title: listing.title,
      description: listing.description || undefined,
      price: listing.price || undefined,
      location: listing.location || undefined,
      listingId: listing.id,
    });
    onClose();
  };

  const handleCopyLink = async () => {
    const success = await sharingUtils.copyLink(listing.id);
    if (success) {
      toast({
        title: t.linkCopied,
        description: t.linkCopiedDesc,
      });
      onClose();
    } else {
      toast({
        title: t.shareFailed,
        description: t.shareFailedDesc,
        variant: 'destructive',
      });
    }
  };

  const handleNativeShare = async () => {
    const success = await sharingUtils.nativeShare({
      title: listing.title,
      description: listing.description || undefined,
      price: listing.price || undefined,
      location: listing.location || undefined,
      listingId: listing.id,
    });
    
    if (success) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t.title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-3 py-4">
          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleWhatsAppShare}
          >
            <MessageCircle className="w-5 h-5 text-green-600" />
            <span>{t.whatsapp}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleSMSShare}
          >
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <span>{t.sms}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleEmailShare}
          >
            <Mail className="w-5 h-5 text-orange-600" />
            <span>{t.email}</span>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-12"
            onClick={handleCopyLink}
          >
            <Link2 className="w-5 h-5 text-purple-600" />
            <span>{t.copyLink}</span>
          </Button>

          {/* Show native share only if supported */}
          {navigator.share && (
            <Button
              variant="outline"
              className="w-full justify-start gap-3 h-12"
              onClick={handleNativeShare}
            >
              <Share2 className="w-5 h-5 text-gray-600" />
              <span>{t.nativeShare}</span>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
