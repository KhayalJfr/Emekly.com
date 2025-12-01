import { useState } from "react";
import { Briefcase, GraduationCap, Users, FileText, Info, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface SidebarProps {
  selectedCategory?: string;
  onCategorySelect?: (category: string) => void;
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const categories = [
  { id: "all", label: "Hamısı", icon: FileText },
  { id: "job", label: "Vakansiyalar", icon: Briefcase },
  { id: "internship", label: "Təcrübə proqramları", icon: GraduationCap },
  { id: "volunteer", label: "Könüllü fəaliyyət", icon: Users },
  { id: "other", label: "Digər", icon: Info },
];

const Sidebar = ({ selectedCategory = "all", onCategorySelect, mobileOpen = false, onMobileOpenChange }: SidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const CategoryList = ({ onItemClick, showLabels = false }: { onItemClick?: () => void; showLabels?: boolean }) => (
    <nav className="space-y-2">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <div key={category.id} className="relative group">
            <button
              onClick={() => {
                onCategorySelect?.(category.id);
                onItemClick?.();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                selectedCategory === category.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {showLabels ? (
                <span className="font-medium whitespace-nowrap">
                  {category.label}
                </span>
              ) : (
                <span className={`font-medium whitespace-nowrap transition-opacity duration-300 ${
                  isExpanded ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                } md:opacity-100 md:w-auto`}>
                  {category.label}
                </span>
              )}
            </button>
            {!isExpanded && !showLabels && (
              <div className="hidden md:block absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-popover text-popover-foreground rounded-md text-sm whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-50 shadow-md">
                {category.label}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Mobile Bottom Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="bottom" className="h-auto rounded-t-2xl p-6 [&>button]:hidden">
          <CategoryList onItemClick={() => onMobileOpenChange?.(false)} showLabels={true} />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block bg-card border-r border-border p-4 transition-all duration-300 ${
          isExpanded ? "w-64" : "w-20"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <CategoryList />
      </aside>
    </>
  );
};

export default Sidebar;
