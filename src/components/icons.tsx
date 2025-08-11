import { Armchair, Snowflake, Wrench, Zap, LucideProps, Construction } from 'lucide-react';
import { MaintenanceCategory } from '@/lib/types';

export const Icons = {
  logo: Wrench,
  furniture: Armchair,
  ac: Snowflake,
  plumbing: Wrench,
  electrical: Zap,
  lift: Construction,
};

export function CategoryIcon({ category, ...props }: { category: MaintenanceCategory } & LucideProps) {
  const IconComponent = Icons[category.toLowerCase() as keyof typeof Icons] || Wrench;
  return <IconComponent {...props} />;
}
