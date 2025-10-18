'use client';

import React, { useState, useEffect } from 'react';
import {
  Location,
  LocationType,
  CreateLocationDto,
  UpdateLocationDto,
} from '@/types/system-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
// import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Save,
  X,
  MapPin,
  FileText,
  Settings,
  Navigation,
  Globe,
  Map as MapIcon,
  Building,
  Home,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Validation schema
const locationSchema = z.object({
  name: z
    .string()
    .min(2, 'Tên địa điểm phải có ít nhất 2 ký tự')
    .max(100, 'Tên địa điểm không được vượt quá 100 ký tự'),
  type: z.nativeEnum(LocationType),
  parentId: z.string().optional().nullable(),
  latitude: z
    .number()
    .min(-90, 'Vĩ độ phải trong khoảng -90 đến 90')
    .max(90, 'Vĩ độ phải trong khoảng -90 đến 90')
    .optional()
    .nullable()
    .or(z.literal('')),
  longitude: z
    .number()
    .min(-180, 'Kinh độ phải trong khoảng -180 đến 180')
    .max(180, 'Kinh độ phải trong khoảng -180 đến 180')
    .optional()
    .nullable()
    .or(z.literal('')),
  isActive: z.boolean().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLocationDto | UpdateLocationDto) => Promise<boolean>;
  location?: Location | null;
  parentLocations?: Record<LocationType, Location[]>;
  mode?: 'create' | 'edit';
  isPage?: boolean; // For dedicated page mode
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

const typeHierarchy: Record<LocationType, LocationType | null> = {
  [LocationType.COUNTRY]: null,
  [LocationType.PROVINCE]: LocationType.COUNTRY,
  [LocationType.CITY]: LocationType.PROVINCE,
  [LocationType.DISTRICT]: LocationType.CITY,
};

export function LocationForm({
  open,
  onClose,
  onSubmit,
  location,
  parentLocations = {
    [LocationType.COUNTRY]: [],
    [LocationType.PROVINCE]: [],
    [LocationType.CITY]: [],
    [LocationType.DISTRICT]: [],
  },
  mode = 'create',
  isPage = false,
}: LocationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    setValue,
    watch,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      type: LocationType.PROVINCE,
      parentId: null,
      latitude: null,
      longitude: null,
      isActive: true,
    },
  });

  const watchedType = watch('type');
  const watchedParentId = watch('parentId');

  // Get available parent locations based on selected type
  const getAvailableParents = () => {
    const expectedParentType = typeHierarchy[watchedType];
    if (!expectedParentType) return [];

    return parentLocations[expectedParentType] || [];
  };

  // Reset form when location changes
  useEffect(() => {
    if (location && mode === 'edit') {
      reset({
        name: location.name,
        type: location.type,
        parentId: location.parentId || null,
        latitude: location.latitude || null,
        longitude: location.longitude || null,
        isActive: location.isActive,
      });
    } else if (mode === 'create') {
      reset({
        name: '',
        type: LocationType.PROVINCE,
        parentId: null,
        latitude: null,
        longitude: null,
        isActive: true,
      });
    }
  }, [location, mode, reset]);

  // Clear parent selection when type changes
  useEffect(() => {
    const expectedParentType = typeHierarchy[watchedType];
    if (!expectedParentType) {
      setValue('parentId', null);
    } else if (watchedParentId) {
      // Check if current parent is valid for new type
      const availableParents = parentLocations[expectedParentType] || [];
      const isValidParent = availableParents.some((p) => p.id === watchedParentId);
      if (!isValidParent) {
        setValue('parentId', null);
      }
    }
  }, [watchedType, watchedParentId, parentLocations, setValue]);

  // Handle form submission
  const onFormSubmit = async (data: LocationFormData) => {
    try {
      setLoading(true);
      setError(null);

      // Prepare data
      const submitData: CreateLocationDto | UpdateLocationDto = {
        name: data.name.trim(),
        type: data.type,
        parentId: data.parentId || undefined,
        latitude: data.latitude || undefined,
        longitude: data.longitude || undefined,
      };

      if (mode === 'edit') {
        (submitData as UpdateLocationDto).isActive = data.isActive;
      }

      const success = await onSubmit(submitData);

      if (success) {
        if (!isPage) {
          onClose();
        }
        reset();
      }
    } catch (err) {
      console.error('Form submission error:', err);
      setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi khi lưu dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const formContent = (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )} */}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">
            <FileText className="mr-2 h-4 w-4" />
            Thông tin cơ bản
          </TabsTrigger>
          <TabsTrigger value="coordinates">
            <Navigation className="mr-2 h-4 w-4" />
            Tọa độ
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="mr-2 h-4 w-4" />
            Cài đặt
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên địa điểm <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Ví dụ: Hà Nội, TP. Hồ Chí Minh..."
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">
              Loại địa điểm <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watchedType}
              onValueChange={(value) => setValue('type', value as LocationType)}
              disabled={mode === 'edit' && location?.children && location.children.length > 0}
            >
              <SelectTrigger id="type" className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Chọn loại địa điểm" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(locationTypeLabels).map(([type, label]) => {
                  const Icon = locationTypeIcons[type as LocationType];
                  return (
                    <SelectItem key={type} value={type}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {mode === 'edit' && location?.children && location.children.length > 0 && (
              <p className="text-muted-foreground text-sm">
                Không thể thay đổi loại địa điểm khi có địa điểm con
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentId">
              Địa điểm cha
              {typeHierarchy[watchedType] && <span className="text-red-500"> *</span>}
            </Label>
            {typeHierarchy[watchedType] ? (
              <Select
                value={watchedParentId || 'none'}
                onValueChange={(value) => setValue('parentId', value === 'none' ? null : value)}
              >
                <SelectTrigger id="parentId">
                  <SelectValue placeholder="Chọn địa điểm cha" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableParents().length > 0 ? (
                    getAvailableParents().map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {parent.name}
                        </div>
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      Không có địa điểm {locationTypeLabels[typeHierarchy[watchedType]!]} nào
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-muted-foreground py-2 text-sm">
                {locationTypeLabels[LocationType.COUNTRY]} không cần địa điểm cha
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="coordinates" className="mt-4 space-y-4">
          <div className="bg-muted/50 mb-4 rounded-lg border p-4">
            <p className="text-muted-foreground text-sm">
              Nhập tọa độ địa lý để hiển thị vị trí chính xác trên bản đồ. Bạn có thể lấy tọa độ từ
              Google Maps hoặc các dịch vụ bản đồ khác.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="latitude">Vĩ độ (Latitude)</Label>
              <Input
                id="latitude"
                type="number"
                step="0.000001"
                {...register('latitude', {
                  setValueAs: (v) => (v === '' ? null : parseFloat(v)),
                })}
                placeholder="Ví dụ: 21.028511"
                className={errors.latitude ? 'border-red-500' : ''}
              />
              {errors.latitude && <p className="text-sm text-red-500">{errors.latitude.message}</p>}
              <p className="text-muted-foreground text-xs">Giá trị từ -90 đến 90</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Kinh độ (Longitude)</Label>
              <Input
                id="longitude"
                type="number"
                step="0.000001"
                {...register('longitude', {
                  setValueAs: (v) => (v === '' ? null : parseFloat(v)),
                })}
                placeholder="Ví dụ: 105.804817"
                className={errors.longitude ? 'border-red-500' : ''}
              />
              {errors.longitude && (
                <p className="text-sm text-red-500">{errors.longitude.message}</p>
              )}
              <p className="text-muted-foreground text-xs">Giá trị từ -180 đến 180</p>
            </div>
          </div>

          {watch('latitude') && watch('longitude') && (
            <div className="mt-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const lat = watch('latitude');
                  const lng = watch('longitude');
                  window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                }}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Xem trên Google Maps
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-4 space-y-4">
          {mode === 'edit' && (
            <div className="space-y-2">
              <Label htmlFor="isActive">Trạng thái</Label>
              <Select
                value={watch('isActive') ? 'true' : 'false'}
                onValueChange={(value) => setValue('isActive', value === 'true')}
              >
                <SelectTrigger id="isActive">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">
                    <Badge variant="default">Hoạt động</Badge>
                  </SelectItem>
                  <SelectItem value="false">
                    <Badge variant="secondary">Không hoạt động</Badge>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-muted-foreground text-sm">
                Địa điểm không hoạt động sẽ không hiển thị trong danh sách lựa chọn
              </p>
            </div>
          )}

          {mode === 'edit' && location && (
            <div className="bg-muted/50 space-y-2 rounded-lg border p-4">
              <h4 className="text-sm font-medium">Thông tin hệ thống</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">ID:</span>
                  <code className="bg-muted rounded px-1">{location.id}</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày tạo:</span>
                  <span>{new Date(location.createdAt).toLocaleString('vi-VN')}</span>
                </div>
                {location._count && location._count.children > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Địa điểm con:</span>
                    <span>{location._count.children}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isPage ? (
        <div className="flex items-center gap-2 pt-4">
          <Button type="submit" disabled={loading || !isDirty}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo địa điểm' : 'Cập nhật'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Hủy
          </Button>
        </div>
      ) : (
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading || !isDirty}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? 'Đang lưu...' : mode === 'create' ? 'Tạo địa điểm' : 'Cập nhật'}
          </Button>
        </DialogFooter>
      )}
    </form>
  );

  if (isPage) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Thêm địa điểm mới' : 'Chỉnh sửa địa điểm'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Điền thông tin để tạo địa điểm mới trong hệ thống.'
              : `Chỉnh sửa thông tin địa điểm "${location?.name}".`}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
