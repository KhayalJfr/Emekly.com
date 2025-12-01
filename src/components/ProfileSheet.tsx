import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, LogOut, FileText, Shield, CheckCircle } from "lucide-react";
import CreateAdDialog from "./CreateAdDialog";
import ConfirmDialog from "./ConfirmDialog";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import type { User } from "@supabase/supabase-js";

interface ProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onLogout: () => void;
}

const ProfileSheet = ({ open, onOpenChange, user, onLogout }: ProfileSheetProps) => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { isAdmin } = useIsAdmin(user);

  const fetchAvatar = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setAvatarUrl(data.avatar_url);
    }
  }, [user]);

  useEffect(() => {
    if (user && open) {
      fetchAvatar();
    }
  }, [user, open, fetchAvatar]);

  const getInitials = () => {
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-96">
          <SheetHeader>
            <SheetTitle>Profil</SheetTitle>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-2">
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {isAdmin && (
                  <Badge variant="secondary" className="gap-1.5">
                    <Shield className="h-3.5 w-3.5" />
                    Admin
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowCreateDialog(true);
                  onOpenChange(false);
                }}
                className="w-full gap-2"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Yeni elan yarat
              </Button>

              <Button
                onClick={() => {
                  navigate("/my-ads");
                  onOpenChange(false);
                }}
                variant="outline"
                className="w-full gap-2"
                size="lg"
              >
                <FileText className="h-5 w-5" />
                Mənim elanlarım
              </Button>

              {isAdmin && (
                <Button
                  onClick={() => {
                    setShowConfirmDialog(true);
                    onOpenChange(false);
                  }}
                  variant="outline"
                  className="w-full gap-2"
                  size="lg"
                >
                  <CheckCircle className="h-5 w-5" />
                  Təsdiq et
                </Button>
              )}

              <Button
                onClick={onLogout}
                variant="destructive"
                className="w-full gap-2"
                size="lg"
              >
                <LogOut className="h-5 w-5" />
                Çıxış
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <CreateAdDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        user={user}
      />

      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        user={user}
      />
    </>
  );
};

export default ProfileSheet;
