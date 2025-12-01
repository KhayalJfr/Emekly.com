import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { az } from "date-fns/locale";

interface AdCardProps {
  id: string;
  title: string;
  category: string;
  salary?: string;
  city?: string;
  experienceLevel?: string;
  createdAt: string;
  views: number;
}

const categoryLabels: Record<string, string> = {
  job: "Vakansiya",
  internship: "Təcrübə proqramı",
  volunteer: "Könüllülük",
};

const experienceLevelLabels: Record<string, string> = {
  "0-2": "0-2 il",
  "3-5": "3-5 il",
  "5-10": "5-10 il",
  "10+": "10+ il",
};

const AdCard = ({ id, title, category, salary, city, experienceLevel, createdAt, views }: AdCardProps) => {
  const navigate = useNavigate();

  return (
    <Card 
      className="overflow-hidden hover:shadow-lg transition-all cursor-pointer"
      onClick={() => navigate(`/ad/${id}`)}
    >
      <CardHeader>
        <CardTitle className="text-xl text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="flex items-center gap-1">
            {categoryLabels[category] || category}
          </Badge>
          {city && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {city}
            </Badge>
          )}
          {experienceLevel && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {experienceLevelLabels[experienceLevel] || experienceLevel}
            </Badge>
          )}
        </div>
        {salary && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">AZN</span>
            <span className="text-sm font-medium">{salary}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(createdAt), "dd MMM yyyy, HH:mm", { locale: az })}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{views}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdCard;
