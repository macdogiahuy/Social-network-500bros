import { Typography } from '@/components/typography';
import React from 'react';
import style from "@/styles/preferences-setting.module.css";
import { useSettings } from '@/context/theme-context';

interface TextSizeSliderProps {
  minValue?: number;  // Minimum font size
  maxValue?: number;  // Maximum font size
}

const TextSizeSlider: React.FC<TextSizeSliderProps> = ({
  minValue = 12,
  maxValue = 36,
}) => {
  const { textSize, setTextSize } = useSettings();

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextSize(Number(event.target.value));
  };

  return (
    <div className={`${style.textSizeSlider} flex gap-1 items-center`} style={{ width: '168px' }}>
        <Typography level="captionr" className=" text-tertiary">A</Typography>
      <input
        id="text-size-slider"
        type="range"
        min={minValue}
        max={maxValue}
        value={textSize}
        onChange={handleSliderChange}
      />
        <Typography level="base2r" className=" text-tertiary">A</Typography>

    </div>
  );
};

export default TextSizeSlider;
