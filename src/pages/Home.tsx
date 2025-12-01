import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import AdCard from "@/components/AdCard";
import { Loader2 } from "lucide-react";
import type { User, Session } from "@supabase/supabase-js";

interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  city?: string;
  experience_level?: string;
  salary?: string;
  image_url?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
  views: number;
}

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [ads, setAds] = useState<Ad[]>([]);
  const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("ads")
        .select("*")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching ads:", error);
      } else {
        setAds(data || []);
        setFilteredAds(data || []);
      }
      setLoading(false);
    };

    fetchAds();
  }, []);

  useEffect(() => {
    let filtered = ads;

    if (selectedCategory !== "all") {
      filtered = filtered.filter((ad) => ad.category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (ad) =>
          ad.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ad.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredAds(filtered);
  }, [selectedCategory, searchQuery, ads]);

  const handleAdCreated = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (!error) {
      setAds(data || []);
      setFilteredAds(data || []);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onSearch={setSearchQuery}
        showPostButton={!!user}
        user={user}
        onMenuClick={() => setMobileMenuOpen(true)}
      />
      <div className="flex flex-1">
        <Sidebar
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
          mobileOpen={mobileMenuOpen}
          onMobileOpenChange={setMobileMenuOpen}
        />
        <main className="flex-1 p-3 sm:p-6 bg-background">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Elan tapılmadı</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredAds.map((ad) => (
                <AdCard
                  key={ad.id}
                  id={ad.id}
                  title={ad.title}
                  category={ad.category}
                  salary={ad.salary}
                  city={ad.city}
                  experienceLevel={ad.experience_level}
                  createdAt={ad.created_at}
                  views={ad.views}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;
