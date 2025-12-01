import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";

const adSchema = z.object({
  title: z.string().min(5, "Başlıq ən azı 5 simvol olmalıdır").max(100, "Başlıq 100 simvoldan çox ola bilməz"),
  description: z.string().min(20, "Təsvir ən azı 20 simvol olmalıdır").max(1000, "Təsvir 1000 simvoldan çox ola bilməz"),
  category: z.enum(["internship", "job", "volunteer", "seminar", "study_abroad", "other"]),
  city: z.string().min(1, "Şəhər seçin"),
  experienceLevel: z.string().optional(),
  contactEmail: z.string().email("Düzgün email daxil edin"),
  contactPhone: z.string().min(1, "Əlaqə telefonu tələb olunur"),
  salary: z.string().optional(),
});

const CreateAd = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    city: "",
    experienceLevel: "",
    contactEmail: "",
    contactPhone: "",
    salary: "",
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
      }
    };
    checkUser();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = adSchema.parse(formData);

      const { error } = await supabase.from("ads").insert({
        user_id: user?.id,
        title: validatedData.title,
        description: validatedData.description,
        category: validatedData.category,
        city: validatedData.city,
        experience_level: validatedData.experienceLevel || null,
        contact_email: validatedData.contactEmail,
        contact_phone: validatedData.contactPhone,
        salary: validatedData.salary || null,
      });

      if (error) throw error;

      toast.success("Elan uğurla yerləşdirildi!");
      navigate("/");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Yeni elan yerləşdir</CardTitle>
            <CardDescription>Elanınızın məlumatlarını daxil edin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Başlıq *</Label>
                <Input
                  id="title"
                  placeholder="Elanın başlığı"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Kateqoriya *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kateqoriya seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="job">Vakansiya</SelectItem>
                    <SelectItem value="internship">Təcrübə proqramı</SelectItem>
                    <SelectItem value="volunteer">Könüllü fəaliyyət</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="study_abroad">Xaricdə təhsil</SelectItem>
                    <SelectItem value="other">Digər</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Şəhər *</Label>
                <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Şəhər seçin" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    <SelectItem value="Ağcabədi">Ağcabədi</SelectItem>
                    <SelectItem value="Ağdam">Ağdam</SelectItem>
                    <SelectItem value="Ağdaş">Ağdaş</SelectItem>
                    <SelectItem value="Ağdərə">Ağdərə</SelectItem>
                    <SelectItem value="Ağstafa">Ağstafa</SelectItem>
                    <SelectItem value="Ağsu">Ağsu</SelectItem>
                    <SelectItem value="Astara">Astara</SelectItem>
                    <SelectItem value="Bakı">Bakı</SelectItem>
                    <SelectItem value="Balakən">Balakən</SelectItem>
                    <SelectItem value="Beyləqan">Beyləqan</SelectItem>
                    <SelectItem value="Bərdə">Bərdə</SelectItem>
                    <SelectItem value="Biləsuvar">Biləsuvar</SelectItem>
                    <SelectItem value="Cəbrayıl">Cəbrayıl</SelectItem>
                    <SelectItem value="Cəlilabad">Cəlilabad</SelectItem>
                    <SelectItem value="Culfa">Culfa</SelectItem>
                    <SelectItem value="Daşkəsən">Daşkəsən</SelectItem>
                    <SelectItem value="Füzuli">Füzuli</SelectItem>
                    <SelectItem value="Gədəbəy">Gədəbəy</SelectItem>
                    <SelectItem value="Gəncə">Gəncə</SelectItem>
                    <SelectItem value="Goranboy">Goranboy</SelectItem>
                    <SelectItem value="Göyçay">Göyçay</SelectItem>
                    <SelectItem value="Göygöl">Göygöl</SelectItem>
                    <SelectItem value="Hacıqabul">Hacıqabul</SelectItem>
                    <SelectItem value="İmişli">İmişli</SelectItem>
                    <SelectItem value="İsmayıllı">İsmayıllı</SelectItem>
                    <SelectItem value="Kəlbəcər">Kəlbəcər</SelectItem>
                    <SelectItem value="Kürdəmir">Kürdəmir</SelectItem>
                    <SelectItem value="Laçın">Laçın</SelectItem>
                    <SelectItem value="Lerik">Lerik</SelectItem>
                    <SelectItem value="Lənkəran">Lənkəran</SelectItem>
                    <SelectItem value="Masallı">Masallı</SelectItem>
                    <SelectItem value="Mingəçevir">Mingəçevir</SelectItem>
                    <SelectItem value="Naftalan">Naftalan</SelectItem>
                    <SelectItem value="Naxçıvan">Naxçıvan</SelectItem>
                    <SelectItem value="Neftçala">Neftçala</SelectItem>
                    <SelectItem value="Oğuz">Oğuz</SelectItem>
                    <SelectItem value="Ordubad">Ordubad</SelectItem>
                    <SelectItem value="Qəbələ">Qəbələ</SelectItem>
                    <SelectItem value="Qax">Qax</SelectItem>
                    <SelectItem value="Qazax">Qazax</SelectItem>
                    <SelectItem value="Qobustan">Qobustan</SelectItem>
                    <SelectItem value="Quba">Quba</SelectItem>
                    <SelectItem value="Qubadlı">Qubadlı</SelectItem>
                    <SelectItem value="Qusar">Qusar</SelectItem>
                    <SelectItem value="Saatlı">Saatlı</SelectItem>
                    <SelectItem value="Sabirabad">Sabirabad</SelectItem>
                    <SelectItem value="Şabran">Şabran</SelectItem>
                    <SelectItem value="Şahbuz">Şahbuz</SelectItem>
                    <SelectItem value="Şamaxı">Şamaxı</SelectItem>
                    <SelectItem value="Şəki">Şəki</SelectItem>
                    <SelectItem value="Şəmkir">Şəmkir</SelectItem>
                    <SelectItem value="Şərur">Şərur</SelectItem>
                    <SelectItem value="Şirvan">Şirvan</SelectItem>
                    <SelectItem value="Şuşa">Şuşa</SelectItem>
                    <SelectItem value="Sumqayıt">Sumqayıt</SelectItem>
                    <SelectItem value="Tərtər">Tərtər</SelectItem>
                    <SelectItem value="Tovuz">Tovuz</SelectItem>
                    <SelectItem value="Ucar">Ucar</SelectItem>
                    <SelectItem value="Xaçmaz">Xaçmaz</SelectItem>
                    <SelectItem value="Xankəndi">Xankəndi</SelectItem>
                    <SelectItem value="Xızı">Xızı</SelectItem>
                    <SelectItem value="Xocalı">Xocalı</SelectItem>
                    <SelectItem value="Xocavənd">Xocavənd</SelectItem>
                    <SelectItem value="Yardımlı">Yardımlı</SelectItem>
                    <SelectItem value="Yevlax">Yevlax</SelectItem>
                    <SelectItem value="Zaqatala">Zaqatala</SelectItem>
                    <SelectItem value="Zəngilan">Zəngilan</SelectItem>
                    <SelectItem value="Zərdab">Zərdab</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experienceLevel">Təcrübə səviyyəsi (istəyə bağlı)</Label>
                <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Təcrübə səviyyəsi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Başlanğıc səviyyə</SelectItem>
                    <SelectItem value="mid">Orta səviyyə</SelectItem>
                    <SelectItem value="senior">Yüksək səviyyə</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Təsvir *</Label>
                <Textarea
                  id="description"
                  placeholder="Elanın təsviri"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">Maaş (istəyə bağlı)</Label>
                <Input
                  id="salary"
                  type="text"
                  placeholder="Məsələn: 1000-1500 AZN"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Əlaqə email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="email@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Əlaqə telefonu *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+994 XX XXX XX XX"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? "Gözləyin..." : "Yerləşdir"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/")} disabled={loading}>
                  İmtina
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateAd;
