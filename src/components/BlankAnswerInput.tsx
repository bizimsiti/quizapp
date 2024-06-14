import React, { SetStateAction, useEffect, useMemo } from "react";
import keyword_extractor from "keyword-extractor";
type Props = {
  answer: string;
  setBlankAnswer: React.Dispatch<SetStateAction<string>>;
};
const blank = "_____";
const BlankAnswerInput = React.memo(({ answer, setBlankAnswer }: Props) => {
  console.log(answer);

  const keywords = React.useMemo(() => {
    const words = keyword_extractor.extract(answer, {
      language: "english",
      remove_digits: true,
      return_changed_case: false,
      remove_duplicates: false
    });

    const shuffled = words.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, [answer]);

  const answerWithBlanks = () => {
    const answerWithBlanks = keywords.reduce((acc, curr) => {
      return acc.replaceAll(curr, blank);
    }, answer);
    setBlankAnswer(answerWithBlanks);
    return answerWithBlanks;
  };
  //console.log(answerWithBlanks);
  const test = answerWithBlanks();
  return (
    <div className="flex justify-start w-full mt-4">
      <div className="text-xl font-semibold">
        {test.split(blank).map((word, index) => {
          return (
            <React.Fragment key={index}>
              {word}
              {index === test.split(blank).length - 1 ? (
                ""
              ) : (
                <input
                  id="user-blank-input"
                  className="text-center border-b-2 border-black dark:border-white w-28 focus:border-2  focus:outline-none"
                  type="text"
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

export default BlankAnswerInput;
