import { useState, useEffect, useCallback } from "react";
import { Search, LogIn, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ProfileSheet from "@/components/ProfileSheet";
import type { User } from "@supabase/supabase-js";

interface HeaderProps {
  onSearch?: (query: string) => void;
  showPostButton?: boolean;
  user?: User | null;
  onMenuClick?: () => void;
}

const Header = ({ onSearch, showPostButton = false, user, onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

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
    if (user) {
      fetchAvatar();
    }
  }, [user, fetchAvatar]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Çıxış zamanı xəta baş verdi");
    } else {
      toast.success("Çıxış edildi");
      navigate("/auth");
    }
  };

  const getInitials = () => {
    return user?.email?.[0].toUpperCase() || "U";
  };

  return (
    <header className="bg-primary text-primary-foreground sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-2 sm:px-4 py-2">
        <div className="flex items-center gap-2 sm:gap-4 justify-between">
          {/* Logo - left side with more padding */}
          <h1
            className="text-lg sm:text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity whitespace-nowrap shrink-0 sm:pl-4"
            onClick={() => navigate("/")}
          >
            Emekly
          </h1>

          {/* Search Bar - centered on desktop */}
          <div className="flex-1 sm:flex-initial sm:w-auto md:w-96 lg:w-[500px] xl:w-[600px] sm:mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
              <Input
                placeholder="Axtar..."
                className="pl-9 sm:pl-10 bg-card text-card-foreground border-border text-sm sm:text-base h-9 sm:h-10"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right side: Menu button (mobile only) + User/Login with more padding */}
          <div className="flex items-center gap-2 shrink-0 sm:pr-4">
            {/* Mobile Menu Button - to the right of search */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="md:hidden p-2"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {user ? (
              <>
                <button
                  onClick={() => setShowProfileSheet(true)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={avatarUrl || undefined} />
                    <AvatarFallback className="text-xs">{getInitials()}</AvatarFallback>
                  </Avatar>
                </button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2"
              >
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Daxil ol</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <ProfileSheet
        open={showProfileSheet}
        onOpenChange={setShowProfileSheet}
        user={user || null}
        onLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
