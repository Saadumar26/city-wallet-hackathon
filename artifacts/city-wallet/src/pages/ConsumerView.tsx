import { useState, useEffect } from "react";
import { Link } from "wouter";
import { MobileFrame } from "@/components/consumer/MobileFrame";
import { OfferCard } from "@/components/consumer/OfferCard";
import { QRModal } from "@/components/consumer/QRModal";
import { 
  useGetContext, 
  useGenerateOffer, 
  useListOffers,
  getGetContextQueryKey,
  getListOffersQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Cloud, MapPin, Clock, Info, ShieldCheck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { RedeemResponse } from "@workspace/api-client-react";
import miaAvatar from "@/assets/mia.png";
import gradientBg from "@/assets/gradient-bg.png";

export default function ConsumerView() {
  const queryClient = useQueryClient();
  const { data: context, isLoading: isContextLoading } = useGetContext({ 
    query: { queryKey: getGetContextQueryKey() } 
  });
  
  const generateOfferMutation = useGenerateOffer();
  const { data: offersList } = useListOffers({
    query: { queryKey: getListOffersQueryKey() }
  });
  const [generatedOffer, setGeneratedOffer] = useState<any>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [redeemData, setRedeemData] = useState<RedeemResponse | null>(null);

  const currentOffer = generatedOffer ?? (offersList && offersList.length > 0 ? offersList[0] : null);

  // Fetch initial offer on mount if none exist
  useEffect(() => {
    if (hasTriggered) return;
    if (offersList === undefined) return;
    if (offersList.length === 0) {
      setHasTriggered(true);
      handleGenerateOffer();
    } else {
      setHasTriggered(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offersList, hasTriggered]);

  const handleGenerateOffer = () => {
    generateOfferMutation.mutate(undefined, {
      onSuccess: (data) => {
        setGeneratedOffer(data);
        queryClient.invalidateQueries({ queryKey: getListOffersQueryKey() });
      }
    });
  };

  const handleRedeemSuccess = (data: RedeemResponse) => {
    setRedeemData(data);
    setQrModalOpen(true);
  };

  return (
    <MobileFrame>
      <div className="min-h-full pb-8">
        {/* Header Section */}
        <div className="relative pt-6 px-6 pb-8">
          <div className="absolute inset-0 z-0">
            <img src={gradientBg} alt="" className="w-full h-full object-cover opacity-60" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-muted-foreground text-sm font-medium mb-1">Good afternoon,</p>
                <h1 className="font-serif text-3xl font-medium tracking-tight text-foreground">Mia</h1>
              </div>
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-background shadow-sm">
                <img src={miaAvatar} alt="Mia" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Context Strip */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
              {isContextLoading || !context ? (
                <>
                  <Skeleton className="h-8 w-24 rounded-full" />
                  <Skeleton className="h-8 w-28 rounded-full" />
                  <Skeleton className="h-8 w-20 rounded-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium whitespace-nowrap">
                    <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    {context.weather.temp}°C {context.weather.condition}
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium whitespace-nowrap">
                    <MapPin className="w-3.5 h-3.5 text-red-500" />
                    {context.location.district}
                  </div>
                  <div className="flex items-center gap-1.5 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium whitespace-nowrap">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {context.time.period}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Offer Card */}
        <div className="px-6 mb-8 relative z-10 -mt-2">
          {!currentOffer || generateOfferMutation.isPending && !currentOffer ? (
            <div className="w-full h-[400px] rounded-[2rem] bg-card border shadow-sm p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between mb-8">
                  <div className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="w-24 h-4" />
                      <Skeleton className="w-16 h-3" />
                    </div>
                  </div>
                  <Skeleton className="w-12 h-6 rounded-full" />
                </div>
                <Skeleton className="w-full h-8 mb-3" />
                <Skeleton className="w-3/4 h-8 mb-6" />
                <Skeleton className="w-full h-4 mb-2" />
                <Skeleton className="w-2/3 h-4" />
              </div>
              <div className="flex gap-3">
                <Skeleton className="flex-1 h-12 rounded-xl" />
                <Skeleton className="w-24 h-12 rounded-xl" />
              </div>
            </div>
          ) : (
            <OfferCard 
              offer={currentOffer} 
              onRedeemSuccess={handleRedeemSuccess}
              onRegenerate={handleGenerateOffer}
              isRegenerating={generateOfferMutation.isPending}
            />
          )}
        </div>

        {/* What triggered this */}
        {currentOffer && context && (
          <div className="px-6 mb-8">
            <Collapsible className="bg-card border rounded-2xl overflow-hidden shadow-sm">
              <CollapsibleTrigger className="flex items-center justify-between w-full p-4 font-medium text-sm hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Why am I seeing this?
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 pt-0 text-sm text-muted-foreground border-t bg-muted/20">
                <p className="leading-relaxed">
                  It's <strong className="text-foreground font-semibold">{context.weather.temp}°C and {context.weather.condition.toLowerCase()}</strong> in {context.location.district}. {currentOffer.merchantName}'s traffic is unusually quiet right now, and our AI noticed you might appreciate a {currentOffer.tone} offer nearby.
                </p>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Nearby Static Offers */}
        <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg tracking-tight">Nearby offers</h3>
            <span className="text-xs font-medium text-muted-foreground">Based on location</span>
          </div>
          
          <div className="space-y-3">
            {/* Static Card 1 */}
            <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl shrink-0">
                🥗
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">Marktküche</h4>
                <p className="text-xs text-muted-foreground truncate">Lunch special · 2 seats left</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-secondary-foreground bg-secondary/20 px-1.5 py-0.5 rounded text-[10px]">10% off</span>
                  <span className="text-[10px] text-muted-foreground">140m away</span>
                </div>
              </div>
            </div>
            
            {/* Static Card 2 */}
            <div className="bg-card border rounded-2xl p-4 flex items-center gap-4 shadow-sm">
              <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-2xl shrink-0">
                📚
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm truncate">Bücherstube König</h4>
                <p className="text-xs text-muted-foreground truncate">Quiet afternoon deal</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-bold text-secondary-foreground bg-secondary/20 px-1.5 py-0.5 rounded text-[10px]">12% off</span>
                  <span className="text-[10px] text-muted-foreground">210m away</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* GDPR Note */}
        <div className="px-8 mt-12 mb-6">
          <div className="flex gap-3 items-start text-xs text-muted-foreground/70">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <p>
              Location intent processed on-device. Only abstract signals sent to server to generate offers.
            </p>
          </div>
        </div>
      </div>

      <QRModal 
        open={qrModalOpen} 
        onOpenChange={setQrModalOpen}
        redeemData={redeemData}
      />
    </MobileFrame>
  );
}
