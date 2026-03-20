import React, { HTMLAttributes } from 'react';

import { Typography } from '@/components/typography';

import { cn } from '@/lib';
import { ThemeOption, useSettings } from '@/context/theme-context';

export { ThemeOption };

//-----------------------------------------------------------------------------------------------

type ThemeSelectGroupProps = HTMLAttributes<HTMLDivElement>;

const ThemeSelectGroup = ({
  children,
  className,
  ...props
}: ThemeSelectGroupProps) => {
  return (
    <div {...props} className={cn('flex gap-5', className)}>
      {children}
    </div>
  );
};

interface GroupItemProps extends HTMLAttributes<HTMLButtonElement> {
  leading: React.ReactNode;
  title: string;
  value: ThemeOption;
}

const GroupItem = ({ leading, title, value, className }: GroupItemProps) => {
  const { activeTheme, setActiveTheme } = useSettings();

  const handleSetActiveTheme = () => {
    setActiveTheme(value);
  };
  const isActive = activeTheme === value;
  return (
    <button
      onClick={handleSetActiveTheme}
      className={`group/item flex flex-col gap-3 items-center cursor-pointer ${isActive && 'active'}`}
    >
      <div
        className={cn(`h-[76px] w-[102px] rounded-xl border p-[2px] border-neutral1-5 group-[.active]/item:border-neutral1-80 flex flex-shrink-0 flex-col items-center justify-center bg-neutral2-20`, className)}
      >
        {leading}
      </div>
      <Typography
        level="captionsm"
        className="text-secondary opacity-80 capitalize group-[.active]/item:text-primary group-hover/item:opacity-100"
      >
        {title}
      </Typography>
    </button>
  );
};

ThemeSelectGroup.item = GroupItem;

export default ThemeSelectGroup;
