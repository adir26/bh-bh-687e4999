import { ShieldAlert, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function AdminAccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-destructive/10 p-4 text-destructive">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">אין לך הרשאה לממשק הניהול</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          נראה שאתה מחובר אך התפקיד שלך אינו כולל גישה למערכת הניהול. אם זו טעות,
          פנה לצוות התמיכה כדי שנוכל לעדכן את ההרשאות שלך.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild className="min-w-[180px]">
          <Link to="/" className="flex items-center justify-center gap-2">
            <ArrowRight className="h-4 w-4" />
            <span>חזרה לדף הבית</span>
          </Link>
        </Button>
        <Button asChild variant="outline" className="min-w-[180px]">
          <Link to="/support" className="flex items-center justify-center gap-2">
            <span>צור קשר עם התמיכה</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
