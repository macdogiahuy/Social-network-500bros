export interface IconProps {
  name?: string;
  width?: number;
  height?: number;
  color?: string;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export type Icon = IconProps;
