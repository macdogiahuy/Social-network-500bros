import React from 'react';

import style from '@/styles/preferences-setting.module.css';
import { useSettings } from '@/context/theme-context';

//-----------------------------------------------------------------------------------------------

interface ColorOptions {
  key: string;
  value: string;
}
interface ColorToggleProps {
  colorOptions: ColorOptions[];
}

export default function ColorToggleGroup({
  colorOptions
}: ColorToggleProps) {
  const { accentColor, setAccentColor } = useSettings();

  return (
    <div className="flex gap-3">
      {colorOptions.map((colorOption) => (
        <ColorToggleItem
          key={colorOption.key}
          colorValue={colorOption.value}
          onClick={() => setAccentColor(colorOption.key)}
          isActive={accentColor === colorOption.key}
        />
      ))}
    </div>
  );
}

interface ColorToggleItemProps {
  colorValue: string;
  onClick: () => void;
  isActive?: boolean;
}

function ColorToggleItem({
  colorValue,
  onClick,
  isActive,
}: ColorToggleItemProps) {
  return (
    <button
      onClick={onClick}
      className={`${style.circleToggle} ${isActive && 'after:absolute after:inset-0 after:w-2.5 after:h-2.5 after:rounded-full after:bg-primary after:m-auto'}`}
      style={{
        backgroundColor: colorValue,
      }}
    />
  );
}
