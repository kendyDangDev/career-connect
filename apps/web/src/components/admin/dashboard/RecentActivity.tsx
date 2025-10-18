import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Briefcase,
  UserPlus,
  Building2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';

interface Activity {
  id: string;
  type:
    | 'job_post'
    | 'user_register'
    | 'company_register'
    | 'application'
    | 'job_approved'
    | 'job_rejected';
  title: string;
  description: string;
  user?: {
    name: string;
    avatar?: string;
  };
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
  className?: string;
}

const activityIcons = {
  job_post: Briefcase,
  user_register: UserPlus,
  company_register: Building2,
  application: FileText,
  job_approved: CheckCircle,
  job_rejected: XCircle,
};

const activityColors = {
  job_post: 'text-blue-600 bg-blue-100',
  user_register: 'text-green-600 bg-green-100',
  company_register: 'text-purple-600 bg-purple-100',
  application: 'text-orange-600 bg-orange-100',
  job_approved: 'text-emerald-600 bg-emerald-100',
  job_rejected: 'text-red-600 bg-red-100',
};

export function RecentActivity({ activities, className }: RecentActivityProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Hoạt động gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {(activities || []).map((activity) => {
              const Icon = activityIcons[activity.type];
              const colorClass = activityColors[activity.type];

              return (
                <div key={activity.id} className="flex gap-4">
                  <div className={`mt-1 rounded-full p-2 ${colorClass}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none font-medium">{activity.title}</p>
                    <p className="text-muted-foreground text-sm">{activity.description}</p>
                    <div className="flex items-center gap-2">
                      {activity.user && (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={activity.user.avatar} />
                            <AvatarFallback>
                              {activity.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs">
                            {activity.user.name}
                          </span>
                        </div>
                      )}
                      <span className="text-muted-foreground text-xs">•</span>
                      <span className="text-muted-foreground text-xs">
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                          locale: vi,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
