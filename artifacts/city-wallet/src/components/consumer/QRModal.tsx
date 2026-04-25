import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useValidateRedemption } from "@workspace/api-client-react";
import { CheckCircle2, ScanLine } from "lucide-react";
import { RedeemResponse } from "@workspace/api-client-react";

interface QRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redeemData: RedeemResponse | null;
}

export function QRModal({ open, onOpenChange, redeemData }: QRModalProps) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [scanned, setScanned] = useState(false);
  const validateMutation = useValidateRedemption();

  useEffect(() => {
    if (open) {
      setTimeLeft(30);
      setScanned(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || scanned) return;
    if (timeLeft <= 0) {
      onOpenChange(false);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, open, onOpenChange, scanned]);

  const handleSimulateScan = () => {
    if (!redeemData?.token) return;
    
    validateMutation.mutate({
      data: { token: redeemData.token }
    }, {
      onSuccess: () => {
        setScanned(true);
        setTimeout(() => {
          onOpenChange(false);
        }, 2000);
      }
    });
  };

  if (!redeemData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[340px] rounded-[2rem] p-0 overflow-hidden border-0 shadow-2xl">
        {scanned ? (
          <div className="p-10 flex flex-col items-center justify-center text-center bg-primary text-primary-foreground">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="font-serif text-3xl font-medium mb-2">Offer Claimed</h2>
            <p className="text-white/80 font-medium">
              You saved €{redeemData.cashbackAmount.toFixed(2)}
            </p>
          </div>
        ) : (
          <div className="bg-card text-card-foreground">
            <div className="p-8 pb-6 text-center">
              <h2 className="font-serif text-2xl font-medium mb-2">Scan at register</h2>
              <p className="text-muted-foreground text-sm">
                Show this QR code to the cashier to claim your offer.
              </p>
            </div>
            
            <div className="px-8 pb-8 flex flex-col items-center">
              <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 relative">
                {/* Simulated scanner line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary/50 animate-[scan_2s_ease-in-out_infinite]" />
                <img 
                  src={redeemData.qrDataUrl} 
                  alt="QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <div className="w-full bg-muted/50 rounded-xl p-4 text-center mb-6">
                <span className="text-sm text-muted-foreground block mb-1">Cashback earned</span>
                <span className="text-2xl font-semibold text-primary">€{redeemData.cashbackAmount.toFixed(2)}</span>
              </div>
              
              <div className="w-full flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-closes in {timeLeft}s</span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSimulateScan}
                  disabled={validateMutation.isPending}
                  className="h-8 text-xs font-semibold"
                >
                  <ScanLine className="w-3 h-3 mr-1" />
                  Simulate scan
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Add simple keyframes for scan animation in a real app, 
// here we'll rely on tailwind arbitrary values if needed, 
// but we didn't add the custom animation to tailwind config.
