export interface JobCardProps {
  id: string;
  title: string;
  company: string;
  logo?: string;
  salaryRange: string;
  location: string;
  isVerified?: boolean;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
}
