import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import Header from "@/components/Header";
import CreateAdDialog from "@/components/CreateAdDialog";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, Phone, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { az } from "date-fns/locale";

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingAdId, setEditingAdId] = useState<string | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      fetchUserAds(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserAds = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data || []);
    } catch (error) {
      console.error("Error fetching ads:", error);
      toast.error("Elanlar yüklənərkən xəta baş verdi");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (adId: string) => {
    if (!confirm("Elanı silmək istədiyinizə əminsiniz?")) return;

    try {
      const { error } = await supabase.from("ads").delete().eq("id", adId);

      if (error) throw error;

      setAds(ads.filter(ad => ad.id !== adId));
      toast.success("Elan uğurla silindi");
    } catch (error) {
      console.error("Error deleting ad:", error);
      toast.error("Elan silinərkən xəta baş verdi");
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      job: "Vakansiya",
      internship: "Təcrübə",
      volunteer: "Könüllü",
      other: "Digər",
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Mənim Elanlarım</h1>
          <p className="text-muted-foreground">
            {ads.length} elan tapıldı
          </p>
        </div>

        {ads.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">Hələ elan əlavə etməmisiniz</p>
            <Button onClick={() => navigate("/create-ad")}>
              İlk Elanı Əlavə Et
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ads.map((ad) => (
              <Card key={ad.id} className="overflow-hidden">
                {ad.image_url && (
                  <img
                    src={ad.image_url}
                    alt={ad.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{ad.title}</CardTitle>
                    <Badge variant="secondary">{getCategoryLabel(ad.category)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(ad.created_at), {
                      addSuffix: true,
                      locale: az,
                    })}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground line-clamp-3 mb-4">
                    {ad.description}
                  </p>
                  <div className="space-y-2 text-sm">
                    {ad.contact_email && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span className="truncate">{ad.contact_email}</span>
                      </div>
                    )}
                    {ad.contact_phone && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-4 w-4" />
                        <span>{ad.contact_phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setEditingAdId(ad.id);
                    setShowEditDialog(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Redaktə et
                </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleDelete(ad.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Sil
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateAdDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        user={user}
        adId={editingAdId || undefined}
        onSuccess={() => {
          if (user) {
            fetchUserAds(user.id);
          }
        }}
      />
    </div>
  );
};

export default Dashboard;
