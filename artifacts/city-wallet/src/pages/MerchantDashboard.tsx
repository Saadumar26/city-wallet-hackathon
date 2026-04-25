import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  useGetMerchantDashboard, 
  useGetMerchantRules, 
  useUpdateMerchantRules,
  getGetMerchantDashboardQueryKey,
  getGetMerchantRulesQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { Store, TrendingUp, Users, Ticket, ArrowRight, Activity, Settings2, BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { MerchantRules, MerchantRulesPreferredTone } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

export default function MerchantDashboard() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: dashboard, isLoading: isDashboardLoading } = useGetMerchantDashboard({
    query: { 
      queryKey: getGetMerchantDashboardQueryKey(),
      refetchInterval: 30000
    }
  });

  const { data: merchantData, isLoading: isRulesLoading } = useGetMerchantRules({
    query: { queryKey: getGetMerchantRulesQueryKey() }
  });

  const updateRulesMutation = useUpdateMerchantRules();

  const [rulesForm, setRulesForm] = useState<MerchantRules>({
    maxDiscountPercent: 15,
    triggerStartHour: 9,
    triggerEndHour: 17,
    volumeThreshold: 5,
    preferredTone: MerchantRulesPreferredTone.warm,
    autoGenerate: true
  });

  useEffect(() => {
    if (merchantData?.rules) {
      setRulesForm(merchantData.rules);
    }
  }, [merchantData]);

  const handleSaveRules = () => {
    updateRulesMutation.mutate({ data: rulesForm }, {
      onSuccess: () => {
        toast({
          title: "Rules updated",
          description: "Your AI offer rules have been saved successfully.",
        });
        queryClient.invalidateQueries({ queryKey: getGetMerchantRulesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetMerchantDashboardQueryKey() });
      },
      onError: () => {
        toast({
          title: "Error",
          description: "Failed to update rules. Please try again.",
          variant: "destructive"
        });
      }
    });
  };

  if (isDashboardLoading || isRulesLoading || !dashboard || !merchantData) {
    return (
      <div className="min-h-screen bg-muted/10 p-8 flex flex-col gap-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-6">
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <div className="lg:col-span-8">
            <Skeleton className="h-[600px] w-full" />
          </div>
        </div>
      </div>
    );
  }

  const today = format(new Date(), "EEEE, MMMM do, yyyy");

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Top Navigation / Header */}
      <header className="bg-card border-b sticky top-0 z-30 shadow-sm">
        <div className="container max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-xl">
              {merchantData.emoji}
            </div>
            <div>
              <h1 className="font-semibold text-foreground tracking-tight flex items-center gap-2">
                {merchantData.name}
                <div className="flex items-center gap-1.5 bg-primary/10 px-2 py-0.5 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-bold tracking-wider uppercase text-primary">AI Active</span>
                </div>
              </h1>
              <p className="text-xs text-muted-foreground">{merchantData.address} • {today}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline" size="sm" className="hidden md:flex">
                <Store className="w-4 h-4 mr-2" />
                View Consumer App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-4 mt-8 space-y-8">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard 
            title="Offers Today" 
            value={dashboard.offersToday.toString()} 
            icon={<Ticket className="w-4 h-4 text-primary" />}
            trend="+12% from yesterday"
            positive={true}
          />
          <MetricCard 
            title="Accept Rate" 
            value={`${dashboard.acceptRate.toFixed(1)}%`} 
            icon={<Activity className="w-4 h-4 text-blue-500" />}
            trend="+2.4% from average"
            positive={true}
          />
          <MetricCard 
            title="Revenue Lift" 
            value={`€${dashboard.totalRevenueLift.toFixed(2)}`} 
            icon={<TrendingUp className="w-4 h-4 text-green-500" />}
            trend="+€45 in last hour"
            positive={true}
          />
          <MetricCard 
            title="Avg Discount" 
            value={`${dashboard.avgDiscount.toFixed(1)}%`} 
            icon={<BarChart3 className="w-4 h-4 text-amber-500" />}
            trend="Well within limits"
            positive={true}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Active Offer Panel */}
            <Card className="border-primary/20 shadow-md overflow-hidden relative">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex justify-between items-center">
                  Live AI Offer
                  {dashboard.currentOffer && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md font-medium">
                      {dashboard.currentOffer.discountPercent}% Off
                    </span>
                  )}
                </CardTitle>
                <CardDescription>Currently broadcasting to nearby users</CardDescription>
              </CardHeader>
              <CardContent>
                {dashboard.currentOffer ? (
                  <>
                    <div className="bg-muted/50 rounded-lg p-4 mb-5 border">
                      <h3 className="font-serif text-xl font-medium mb-1">{dashboard.currentOffer.headline}</h3>
                      <p className="text-sm text-muted-foreground">{dashboard.currentOffer.subtext}</p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground font-medium">Views</span>
                          <span className="font-semibold">{Math.floor(dashboard.viewsProgress * 100)}</span>
                        </div>
                        <Progress value={dashboard.viewsProgress * 100} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="text-muted-foreground font-medium">Redemptions</span>
                          <span className="font-semibold">{Math.floor(dashboard.redemptionsProgress * 100)}</span>
                        </div>
                        <Progress value={dashboard.redemptionsProgress * 100} className="h-2 bg-green-100 dark:bg-green-950" indicatorClassName="bg-green-500" />
                      </div>
                    </div>
                    
                    <div className="mt-5 text-xs text-muted-foreground bg-background p-3 rounded-md border border-dashed">
                      <strong className="text-foreground block mb-1">Trigger Context:</strong>
                      {dashboard.context.weather.temp}°C {dashboard.context.weather.condition}, {dashboard.context.time.period}. Traffic: {dashboard.context.merchantDemand.status}.
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No active offers at the moment.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Rule Config */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings2 className="w-5 h-5" />
                  AI Rules Engine
                </CardTitle>
                <CardDescription>Control how the AI generates offers</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-generate</Label>
                    <p className="text-xs text-muted-foreground">Let AI create offers automatically</p>
                  </div>
                  <Switch 
                    checked={rulesForm.autoGenerate} 
                    onCheckedChange={(c) => setRulesForm({...rulesForm, autoGenerate: c})} 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Max Discount (%)</Label>
                  <div className="flex items-center gap-3">
                    <Input 
                      type="number" 
                      value={rulesForm.maxDiscountPercent} 
                      onChange={(e) => setRulesForm({...rulesForm, maxDiscountPercent: Number(e.target.value)})}
                      className="w-20"
                    />
                    <span className="text-sm text-muted-foreground">Protects your margin</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Hour</Label>
                    <Input 
                      type="number" 
                      value={rulesForm.triggerStartHour} 
                      onChange={(e) => setRulesForm({...rulesForm, triggerStartHour: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>End Hour</Label>
                    <Input 
                      type="number" 
                      value={rulesForm.triggerEndHour} 
                      onChange={(e) => setRulesForm({...rulesForm, triggerEndHour: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Volume Threshold</Label>
                  <Input 
                    type="number" 
                    value={rulesForm.volumeThreshold} 
                    onChange={(e) => setRulesForm({...rulesForm, volumeThreshold: Number(e.target.value)})}
                  />
                  <p className="text-xs text-muted-foreground">Trigger offers when foot traffic drops below this</p>
                </div>

                <div className="space-y-2">
                  <Label>Brand Tone</Label>
                  <Select 
                    value={rulesForm.preferredTone} 
                    onValueChange={(v: MerchantRulesPreferredTone) => setRulesForm({...rulesForm, preferredTone: v})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={MerchantRulesPreferredTone.warm}>Warm & Welcoming</SelectItem>
                      <SelectItem value={MerchantRulesPreferredTone.urgent}>Urgent & Direct</SelectItem>
                      <SelectItem value={MerchantRulesPreferredTone.playful}>Playful & Fun</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full mt-2" 
                  onClick={handleSaveRules}
                  disabled={updateRulesMutation.isPending}
                >
                  {updateRulesMutation.isPending ? "Saving..." : "Save Rules"}
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* Right Column */}
          <div className="lg:col-span-8">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>Recent Offer Performance</CardTitle>
                <CardDescription>How your AI-generated campaigns are converting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-muted-foreground">
                        <th className="text-left font-medium pb-3 pr-4">Headline</th>
                        <th className="text-left font-medium pb-3 px-4">Time</th>
                        <th className="text-right font-medium pb-3 px-4">Discount</th>
                        <th className="text-left font-medium pb-3 px-4 w-32">Accept Rate</th>
                        <th className="text-right font-medium pb-3 pl-4">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.offersList.map((offer) => (
                        <tr key={offer.offerId} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                          <td className="py-4 pr-4 font-medium max-w-[200px] truncate" title={offer.headline}>
                            {offer.headline}
                          </td>
                          <td className="py-4 px-4 text-muted-foreground whitespace-nowrap">
                            {format(new Date(offer.timestamp), "HH:mm")}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <span className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded text-xs font-semibold">
                              {offer.discountPercent}%
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium w-8">{offer.acceptRate.toFixed(0)}%</span>
                              <Progress value={offer.acceptRate} className="h-1.5 flex-1" />
                            </div>
                          </td>
                          <td className="py-4 pl-4 text-right font-semibold text-primary">
                            +€{offer.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {dashboard.offersList.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-muted-foreground">
                            No offers generated today yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function MetricCard({ title, value, icon, trend, positive }: { title: string, value: string, icon: React.ReactNode, trend: string, positive: boolean }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-muted/50 rounded-lg">{icon}</div>
        </div>
        <div className="flex flex-col gap-1">
          <h3 className="text-3xl font-semibold tracking-tight">{value}</h3>
          <p className={`text-xs font-medium ${positive ? "text-green-600" : "text-muted-foreground"}`}>
            {trend}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
