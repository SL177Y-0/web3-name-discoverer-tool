
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const ResultModal: React.FC<ResultModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium text-lg">{title}</h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResultModal;
