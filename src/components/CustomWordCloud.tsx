"use client";
import { useTheme } from "next-themes";
import WordCloud from "react-d3-cloud";
const data = [
  {
    text: "hello",
    value: 3
  },
  {
    text: "word",
    value: 12
  },
  {
    text: "computer",
    value: 4
  },
  {
    text: "typescript",
    value: 8
  }
];

const fontSizeMapper = (word: { value: number }) => {
  return Math.log2(word.value) * 5 + 16;
};

type Props = {};

const CustomWordCloud = (props: Props) => {
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
        data={data}
      />
    </div>
  );
};

export default CustomWordCloud;
