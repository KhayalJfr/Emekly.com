import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";

interface PendingAd {
  id: string;
  title: string;
  description: string;
  category: string;
  city?: string;
  salary?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  user_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const { isAdmin, loading } = useIsAdmin(user);
  const [pendingAds, setPendingAds] = useState<PendingAd[]>([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Auth state changed:", { session: !!session, userId: session?.user?.id });
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Got session:", { session: !!session, userId: session?.user?.id });
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    console.log("Admin check:", { loading, isAdmin, userId: user?.id });
    if (!loading && !isAdmin && user) {
      console.log("Redirecting to home - not admin");
      navigate("/");
    }
  }, [isAdmin, loading, user, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingAds();
    }
  }, [isAdmin]);

  const fetchPendingAds = async () => {
    setLoadingAds(true);
    try {
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingAds(data || []);
    } catch (error) {
      console.error("Error fetching pending ads:", error);
      toast.error("Gözləyən elanları yükləyərkən xəta baş verdi");
    } finally {
      setLoadingAds(false);
    }
  };

  const handleApprove = async (adId: string) => {
    setProcessingId(adId);
    try {
      const { error } = await supabase
        .from("ads")
        .update({ status: "approved" })
        .eq("id", adId);

      if (error) throw error;
      
      toast.success("Elan təsdiqləndi!");
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
    } catch (error) {
      console.error("Error approving ad:", error);
      toast.error("Elan təsdiqləmə xətası");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (adId: string) => {
    setProcessingId(adId);
    try {
      const { error } = await supabase
        .from("ads")
        .update({ status: "rejected" })
        .eq("id", adId);

      if (error) throw error;
      
      toast.success("Elan rədd edildi!");
      setPendingAds(pendingAds.filter(ad => ad.id !== adId));
    } catch (error) {
      console.error("Error rejecting ad:", error);
      toast.error("Elan rədd etmə xətası");
    } finally {
      setProcessingId(null);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      job: "Vakansiya",
      internship: "Təcrübə proqramı",
      volunteer: "Könüllü fəaliyyət",
      seminar: "Seminar",
      study_abroad: "Xaricdə təhsil",
      other: "Digər"
    };
    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yüklənir...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Admin Paneli
          </h1>
          <p className="text-muted-foreground">Gözləyən elanları idarə edin</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Təsdiq Gözləyən Elanlar</CardTitle>
            <CardDescription>
              İstifadəçilər tərəfindən yerləşdirilən elanları təsdiqləyin və ya rədd edin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingAds ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : pendingAds.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Təsdiq gözləyən elan yoxdur</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Başlıq</TableHead>
                    <TableHead>Kateqoriya</TableHead>
                    <TableHead>Şəhər</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Tarix</TableHead>
                    <TableHead className="text-right">Əməliyyatlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingAds.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">
                        <div className="max-w-xs">
                          <p className="font-semibold truncate">{ad.title}</p>
                          <p className="text-sm text-muted-foreground truncate">
                            {ad.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {getCategoryLabel(ad.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>{ad.city || "—"}</TableCell>
                      <TableCell>
                        {ad.contact_email}
                      </TableCell>
                      <TableCell>
                        {ad.contact_phone || "—"}
                      </TableCell>
                      <TableCell>
                        {new Date(ad.created_at).toLocaleDateString("az-AZ")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(ad.id)}
                            disabled={processingId === ad.id}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {processingId === ad.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Təsdiq
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(ad.id)}
                            disabled={processingId === ad.id}
                          >
                            {processingId === ad.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-1" />
                                Rədd
                              </>
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
