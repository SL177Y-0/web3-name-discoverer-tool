
import { toast } from '@/hooks/use-toast';

export const copyToClipboard = async (text: string, label: string = 'Text') => {
  try {
    await navigator.clipboard.writeText(text);
    toast({
      title: 'Copied to clipboard',
      description: `${label} has been copied to your clipboard.`,
      duration: 3000,
    });
    return true;
  } catch (error) {
    console.error('Failed to copy:', error);
    toast({
      title: 'Failed to copy',
      description: 'Could not copy to clipboard. Please try again.',
      variant: 'destructive',
      duration: 3000,
    });
    return false;
  }
};
