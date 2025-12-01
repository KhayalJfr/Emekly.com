import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import type { User } from "@supabase/supabase-js";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

interface PendingAd {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  job: "Vakansiya",
  internship: "Təcrübə proqramı",
  volunteer: "Könüllülük",
  seminar: "Seminar",
  study_abroad: "Xaricdə təhsil",
  other: "Digər",
};

const ConfirmDialog = ({ open, onOpenChange, user }: ConfirmDialogProps) => {
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchPendingAds();
    }
  }, [open]);

  const fetchPendingAds = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching pending ads:", error);
      toast.error("Gözləyən elanlar yüklənərkən xəta baş verdi");
    } else {
      setPendingAds(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (adId: string) => {
    const { error } = await supabase
      .from("ads")
      .update({ status: "approved" })
      .eq("id", adId);

    if (error) {
      console.error("Error approving ad:", error);
      toast.error("Elan təsdiqlənərkən xəta baş verdi");
    } else {
      toast.success("Elan uğurla təsdiqləndi!");
      setPendingAds(pendingAds.filter((ad) => ad.id !== adId));
    }
  };

  const handleReject = async (adId: string) => {
    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", adId);

    if (error) {
      console.error("Error rejecting ad:", error);
      toast.error("Elan silinərkən xəta baş verdi");
    } else {
      toast.success("Elan rədd edildi və silindi");
      setPendingAds(pendingAds.filter((ad) => ad.id !== adId));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[90vh] p-0 gap-0">
        <DialogHeader className="px-4 sm:px-6 py-3 sm:py-4 border-b">
          <DialogTitle className="text-base sm:text-lg">Təsdiq gözləyən elanlar</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-80px)]">
          <div className="px-3 sm:px-6 py-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingAds.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Təsdiq gözləyən elan yoxdur</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Başlıq</TableHead>
                        <TableHead>Kateqoriya</TableHead>
                        <TableHead>Şəhər</TableHead>
                        <TableHead>Əlaqə</TableHead>
                        <TableHead>Tarix</TableHead>
                        <TableHead className="text-right">Əməliyyatlar</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingAds.map((ad) => (
                        <TableRow key={ad.id}>
                          <TableCell className="font-medium max-w-[200px] truncate">
                            {ad.title}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {categoryLabels[ad.category] || ad.category}
                            </Badge>
                          </TableCell>
                          <TableCell>{ad.city}</TableCell>
                          <TableCell className="text-sm">
                            <div className="space-y-1">
                              <div>{ad.contact_email}</div>
                              <div>{ad.contact_phone}</div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {format(new Date(ad.created_at), "dd MMM yyyy", { locale: az })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleApprove(ad.id)}
                                className="gap-1"
                              >
                                <Check className="h-4 w-4" />
                                Təsdiqlə
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(ad.id)}
                                className="gap-1"
                              >
                                <X className="h-4 w-4" />
                                Rədd et
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-3">
                  {pendingAds.map((ad) => (
                    <div key={ad.id} className="border rounded-xl p-5 space-y-4 bg-card shadow-sm hover:shadow-md transition-shadow">
                      <div className="space-y-2.5">
                        <h3 className="font-bold text-lg leading-tight">{ad.title}</h3>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge variant="secondary" className="text-xs px-2.5 py-0.5">
                            {categoryLabels[ad.category] || ad.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">• {ad.city}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm bg-muted/30 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground shrink-0 font-medium min-w-[45px]">Email:</span>
                          <span className="break-all">{ad.contact_email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-muted-foreground shrink-0 font-medium min-w-[45px]">Tel:</span>
                          <span>{ad.contact_phone}</span>
                        </div>
                        <div className="text-xs text-muted-foreground pt-1 border-t border-border/50">
                          {format(new Date(ad.created_at), "dd MMM yyyy, HH:mm", { locale: az })}
                        </div>
                      </div>

                      <div className="flex gap-2.5 pt-1">
                        <Button
                          size="default"
                          variant="default"
                          onClick={() => handleApprove(ad.id)}
                          className="gap-2 flex-1 h-11 font-semibold"
                        >
                          <Check className="h-4 w-4" />
                          Təsdiqlə
                        </Button>
                        <Button
                          size="default"
                          variant="destructive"
                          onClick={() => handleReject(ad.id)}
                          className="gap-2 flex-1 h-11 font-semibold"
                        >
                          <X className="h-4 w-4" />
                          Rədd et
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
