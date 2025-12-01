import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Calendar, DollarSign, ArrowLeft, Eye, MapPin, Briefcase, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { az } from "date-fns/locale";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import CreateAdDialog from "@/components/CreateAdDialog";
import { User } from "@supabase/supabase-js";

const categoryLabels: Record<string, string> = {
  internship: "Təcrübə",
  job: "Vakansiya",
  volunteer: "Könüllü",
  seminar: "Seminar",
  study_abroad: "Xaricdə təhsil",
  other: "Digər",
};

const experienceLevelLabels: Record<string, string> = {
  entry: "Başlanğıc səviyyə",
  mid: "Orta səviyyə",
  senior: "Yüksək səviyyə",
};

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  city?: string;
  experience_level?: string;
  salary?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  views: number;
}

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const { isAdmin } = useIsAdmin(user);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    const fetchAd = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching ad:", error);
        navigate("/");
        return;
      }

      setAd(data);
      setLoading(false);

      // Increment view count
      await supabase.rpc("increment_ad_views", { ad_id: id });
    };

    fetchAd();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!ad) {
    return null;
  }

  const handleDelete = async () => {
    if (!id) return;

    const { error } = await supabase
      .from("ads")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Elan silinərkən xəta baş verdi");
      console.error("Error deleting ad:", error);
      return;
    }

    toast.success("Elan uğurla silindi");
    navigate("/");
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    // Refresh the ad data
    if (id) {
      supabase
        .from("ads")
        .select("*")
        .eq("id", id)
        .single()
        .then(({ data }) => {
          if (data) setAd(data);
        });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Button
          variant="ghost"
          className="mb-4 sm:mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>

        <Card className="max-w-3xl mx-auto">
          <CardHeader className="px-4 sm:px-6">
            <div className="flex items-start justify-between gap-2 sm:gap-4">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl">{ad.title}</CardTitle>
              <Badge variant="secondary" className="shrink-0 text-xs sm:text-sm">
                {categoryLabels[ad.category] || ad.category}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{format(new Date(ad.created_at), "dd MMMM yyyy, HH:mm", { locale: az })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm">{ad.views} baxış</span>
              </div>
              {ad.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{ad.city}</span>
                </div>
              )}
              {ad.experience_level && (
                <div className="flex items-center gap-1">
                  <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="text-xs sm:text-sm">{experienceLevelLabels[ad.experience_level] || ad.experience_level}</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
            {ad.salary && (
              <div className="flex items-center gap-2 p-3 sm:p-4 bg-muted rounded-lg">
                <div className="h-5 w-5 text-primary flex items-center justify-center font-bold text-lg sm:text-xl">₼</div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Maaş</p>
                  <p className="text-base sm:text-lg font-semibold">{ad.salary}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-2">Təsvir</h3>
              <p className="text-sm sm:text-base text-muted-foreground whitespace-pre-wrap">{ad.description}</p>
            </div>

            <div className="border-t pt-4 sm:pt-6">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Əlaqə məlumatları</h3>
              <div className="space-y-3">
                {ad.contact_email && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                    <a href={`mailto:${ad.contact_email}`} className="hover:underline text-primary text-sm sm:text-base break-all">
                      {ad.contact_email}
                    </a>
                  </div>
                )}
                {ad.contact_phone && (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground shrink-0" />
                    <a href={`tel:${ad.contact_phone}`} className="hover:underline text-primary text-sm sm:text-base">
                      {ad.contact_phone}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {isAdmin && (
              <div className="border-t pt-4 sm:pt-6 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditDialogOpen(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Düzəliş et
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Sil
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Əminsiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Bu əməliyyat geri qaytarıla bilməz. Elan tamamilə silinəcək.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                      <AlertDialogCancel className="m-0">Ləğv et</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CreateAdDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        user={user}
        adId={id}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export default AdDetail;
