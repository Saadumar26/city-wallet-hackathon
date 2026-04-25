import { useState, useEffect } from "react";
import { MapPin, Clock, ArrowRight, RotateCcw } from "lucide-react";
import { Offer } from "@workspace/api-client-react";
import { useRedeemOffer } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

interface OfferCardProps {
  offer: Offer;
  onRedeemSuccess: (data: any) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export function OfferCard({ offer, onRedeemSuccess, onRegenerate, isRegenerating }: OfferCardProps) {
  const [timeLeft, setTimeLeft] = useState(offer.expiryMinutes * 60);
  const [dismissed, setDismissed] = useState(false);
  
  const redeemMutation = useRedeemOffer();

  useEffect(() => {
    setTimeLeft(offer.expiryMinutes * 60);
    setDismissed(false);
  }, [offer.id]);

  useEffect(() => {
    if (timeLeft <= 0 || dismissed) return;
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, dismissed]);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;

  const handleRedeem = () => {
    redeemMutation.mutate({
      data: { offerId: offer.id, userId: "mia" }
    }, {
      onSuccess: (data) => {
        onRedeemSuccess(data);
      }
    });
  };

  if (dismissed) {
    return (
      <div className="w-full bg-card border rounded-2xl p-6 flex flex-col items-center justify-center opacity-60 transition-opacity duration-500">
        <p className="text-sm font-medium text-muted-foreground mb-2">Offer dismissed</p>
        <button onClick={() => setDismissed(false)} className="text-primary text-sm font-semibold hover:underline">
          Bring it back
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-[#111] text-white rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-3xl">
      {/* Background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 opacity-50 mix-blend-overlay pointer-events-none" />
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{offer.merchantEmoji}</span>
            <div>
              <h3 className="font-sans font-semibold text-sm tracking-wide text-white/90">{offer.merchantName}</h3>
              <div className="flex items-center gap-1 text-xs text-white/60">
                <MapPin className="w-3 h-3" />
                <span>{offer.distanceMeters}m away</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider uppercase text-white/90">Live</span>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="font-serif text-3xl font-medium leading-tight mb-2">{offer.headline}</h2>
          <p className="text-white/70 text-sm font-sans">{offer.subtext}</p>
        </div>

        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-4xl font-serif font-semibold text-secondary tracking-tight">
              {offer.discountPercent}%
              <span className="text-xl font-sans text-white/50 ml-1">off</span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-white/50 uppercase tracking-wider font-semibold mb-1">Expires in</span>
            <div className="flex items-center gap-1.5 font-mono text-xl text-white/90 bg-white/5 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4 text-white/50" />
              {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            className="flex-1 rounded-xl h-12 font-semibold text-base bg-white text-black hover:bg-white/90 border-0"
            onClick={handleRedeem}
            disabled={redeemMutation.isPending || isRegenerating}
          >
            {redeemMutation.isPending ? "Claiming..." : offer.ctaText}
            {!redeemMutation.isPending && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
          <Button 
            variant="outline" 
            className="rounded-xl h-12 px-6 font-semibold bg-white/5 text-white border-white/10 hover:bg-white/10 hover:text-white"
            onClick={() => setDismissed(true)}
            disabled={redeemMutation.isPending || isRegenerating}
          >
            Not now
          </Button>
        </div>
      </div>
      
      <div className="bg-white/5 border-t border-white/10 p-3 flex justify-center">
        <button 
          onClick={onRegenerate}
          disabled={isRegenerating || redeemMutation.isPending}
          className="text-xs font-medium text-white/60 hover:text-white flex items-center gap-1 transition-colors"
        >
          <RotateCcw className={`w-3 h-3 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Thinking..." : "Generate new offer"}
        </button>
      </div>
    </div>
  );
}
