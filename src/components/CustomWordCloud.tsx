"use client";
import { useTheme } from "next-themes";
import WordCloud from "react-d3-cloud";

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

type Props = {
  formatTopics: { text: string; value: number }[];
};

const CustomWordCloud = ({ formatTopics }: Props) => {
  const theme = useTheme();
  return (
    <div>
      <WordCloud
        height={550}
        font="Times"
        fontSize={fontSizeMapper}
        rotate={0}
        padding={10}
        fill={theme.theme === "dark" ? "white" : "black"}
        data={formatTopics}
      />
    </div>
  );
};

export default CustomWordCloud;
