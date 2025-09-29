'use client';

import React from 'react';
import { Location, LocationType } from '@/types/system-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Edit,
  Trash2,
  X,
  CheckCircle,
  XCircle,
  MapPin,
  Calendar,
  Clock,
  Hash,
  Link,
  FileText,
  Navigation,
  Activity,
  TrendingUp,
  Map as MapIcon,
  Globe,
  Building,
  Home,
  ExternalLink,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface LocationDetailProps {
  open: boolean;
  onClose: () => void;
  location: Location | null;
  onEdit: (location: Location) => void;
  onDelete: (location: Location) => void;
  onStatusChange: (location: Location, isActive: boolean) => void;
}

const locationTypeLabels: Record<LocationType, string> = {
  [LocationType.COUNTRY]: 'Quốc gia',
  [LocationType.PROVINCE]: 'Tỉnh/Thành phố',
  [LocationType.CITY]: 'Quận/Huyện',
  [LocationType.DISTRICT]: 'Phường/Xã',
};

const locationTypeIcons: Record<LocationType, React.ComponentType<{ className?: string }>> = {
  [LocationType.COUNTRY]: Globe,
  [LocationType.PROVINCE]: MapIcon,
  [LocationType.CITY]: Building,
  [LocationType.DISTRICT]: Home,
};

export function LocationDetail({
  open,
  onClose,
  location,
  onEdit,
  onDelete,
  onStatusChange,
}: LocationDetailProps) {
  if (!location) return null;

  const TypeIcon = locationTypeIcons[location.type];

  // Render child locations tree
  const renderChildLocations = (children: Location[], level = 0): React.ReactNode => {
    if (!children || children.length === 0) return null;

    return (
      <ul className="space-y-2">
        level
        {children.map((child) => {
          const ChildIcon = locationTypeIcons[child.type];
          return (
            <li key={child.id} style={{ paddingLeft: `${level * 1.5}rem` }}>
              <div className="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <ChildIcon className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">{child.name}</span>
                  <Badge variant="outline" className="ml-2">
                    {locationTypeLabels[child.type]}
                  </Badge>
                  <Badge variant={child.isActive ? 'default' : 'secondary'} className="ml-1">
                    {child.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </Badge>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-sm">
                  {child._count && child._count.children > 0 && (
                    <span>{child._count.children} địa điểm con</span>
                  )}
                </div>
              </div>
              {child.children && renderChildLocations(child.children, level + 1)}
            </li>
          );
        })}
      </ul>
    );
  };

  // Build breadcrumb path
  const buildLocationPath = () => {
    const path = [];
    let current: Location | null = location;

    while (current) {
      path.unshift(current);
      current = current.parent || null;
    }

    return path;
  };

  const locationPath = buildLocationPath();

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <TypeIcon className="h-6 w-6" />
                {location.name}
              </DialogTitle>
              <DialogDescription className="mt-1">Chi tiết thông tin địa điểm</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={location.isActive ? 'outline' : 'default'}
                size="sm"
                onClick={() => onStatusChange(location, !location.isActive)}
              >
                {location.isActive ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Vô hiệu hóa
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Kích hoạt
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm" onClick={() => onEdit(location)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(location)}
                className="text-red-600 hover:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="-mx-6 flex-1 px-6">
          <div className="space-y-6 py-4">
            {/* Location Path */}
            {locationPath.length > 1 && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                {locationPath.map((loc, index) => {
                  const LocIcon = locationTypeIcons[loc.type];
                  return (
                    <React.Fragment key={loc.id}>
                      {index > 0 && <span>/</span>}
                      <div className="flex items-center gap-1">
                        <LocIcon className="h-3 w-3" />
                        <span>{loc.name}</span>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Thông tin cơ bản
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Tên địa điểm</p>
                      <p className="mt-1 font-medium">{location.name}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Loại địa điểm</p>
                      <div className="mt-1">
                        <Badge variant="outline" className="gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {locationTypeLabels[location.type]}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Địa điểm cha</p>
                      <p className="mt-1">
                        {location.parent ? (
                          <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {location.parent.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Không có (Địa điểm gốc)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Trạng thái</p>
                      <div className="mt-1">
                        <Badge variant={location.isActive ? 'default' : 'secondary'}>
                          {location.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm font-medium">Số địa điểm con</p>
                      <p className="mt-1 font-medium">{location._count?.children || 0}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coordinates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Navigation className="h-5 w-5" />
                  Tọa độ địa lý
                </CardTitle>
              </CardHeader>
              <CardContent>
                {location.latitude && location.longitude ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Vĩ độ (Latitude)
                        </p>
                        <p className="mt-1 font-mono">{location.latitude.toFixed(6)}°</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">
                          Kinh độ (Longitude)
                        </p>
                        <p className="mt-1 font-mono">{location.longitude.toFixed(6)}°</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${location.latitude},${location.longitude}`,
                            '_blank'
                          );
                        }}
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Xem trên Google Maps
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `${location.latitude},${location.longitude}`
                          );
                        }}
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Sao chép tọa độ
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Chưa có thông tin tọa độ cho địa điểm này
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Child Locations */}
            {location.children && location.children.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MapIcon className="h-5 w-5" />
                    Địa điểm con ({location.children.length})
                  </CardTitle>
                  <CardDescription>Danh sách các địa điểm thuộc {location.name}</CardDescription>
                </CardHeader>
                <CardContent>{renderChildLocations(location.children)}</CardContent>
              </Card>
            )}

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Hash className="h-5 w-5" />
                  Thông tin hệ thống
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm font-medium">ID</p>
                    <code className="bg-muted rounded px-2 py-1 text-sm">{location.id}</code>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-sm font-medium">Ngày tạo</p>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="text-muted-foreground h-4 w-4" />
                      <span>
                        {format(new Date(location.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi })}
                      </span>
                      <span className="text-muted-foreground">
                        (
                        {formatDistanceToNow(new Date(location.createdAt), {
                          locale: vi,
                          addSuffix: true,
                        })}
                        )
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
