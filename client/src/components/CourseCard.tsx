import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users } from "lucide-react";
import { formatPrice, getCategoryColor, getLevelBadgeColor } from "@/lib/utils";
import type { Course } from "@shared/schema";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: number) => void;
}

export default function CourseCard({ course, onEnroll }: CourseCardProps) {
  const getIconByCategory = (category: string) => {
    switch (category) {
      case 'quran':
        return '📖';
      case 'arabic':
        return '🌍';
      case 'islamic-studies':
        return '☪️';
      case 'tajweed':
        return '🕌';
      default:
        return '📚';
    }
  };

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'quran':
        return 'Quran Recitation';
      case 'arabic':
        return 'Arabic Language';
      case 'islamic-studies':
        return 'Islamic Studies';
      case 'tajweed':
        return 'Tajweed';
      default:
        return category;
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className={`h-48 bg-gradient-to-br ${getCategoryColor(course.category)} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-6xl opacity-80">{getIconByCategory(course.category)}</span>
        </div>
        <div className="absolute top-4 right-4">
          <Badge className={`${getLevelBadgeColor(course.level)} border-0`}>
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <span>{getIconByCategory(course.category)}</span>
          <span>{getCategoryName(course.category)}</span>
        </div>
        
        <h3 className="text-xl font-semibold text-slate-900 mb-2">{course.title}</h3>
        <p className="text-slate-600 mb-4 line-clamp-3">{course.description}</p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.studentCount?.toLocaleString()} students
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-primary-600">
            {formatPrice(course.price)}
          </div>
          <Button 
            onClick={() => onEnroll(course.id)}
            className="bg-primary-600 hover:bg-primary-700"
          >
            Enroll Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
