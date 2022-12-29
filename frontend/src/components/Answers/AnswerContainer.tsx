import React, { useState } from 'react';
import { useEffect } from 'react';
import styled from 'styled-components';
import { Answer, Point } from '../../generated/generated';

const AnswerWrapper = styled.div``;

const AnswerElement = styled.div`
   width: 11em;
   display: flex;
   justify-content: left;
   align-items: left;
   background-color: transparent;
   caret-color: transparent;
   margin-left: 1em;
   margin-top: 0.5em;
`;

const AnswerTitle = styled.div`
   margin-top: 1em;
   margin-bottom: 1em;
   text-decoration: underline;
   font-weight: bold;
`;

export type AnswerContainerProps = { type: string; answers: Map<number, Answer>; grid: Point[][]; id?: string };
const AnswerContainer = ({ type, answers, grid, id }: AnswerContainerProps) => {
   let [sortedAnswers, _] = useState(new Map([...answers].sort((a, b) => a[0] - b[0])));
   let [answerDivs, setAnswerDivs] = useState<JSX.Element[]>([]);

   useEffect(() => {
      let tmp = [];
      for (const [number, answer] of sortedAnswers.entries()) {
         tmp.push(<AnswerElement key={number}>{number + ') ' + answer.clue}</AnswerElement>);
      }
      setAnswerDivs(tmp);
   }, [answers]);
   return (
      <AnswerWrapper id={id}>
         <AnswerTitle>{type}</AnswerTitle>
         {answerDivs}
      </AnswerWrapper>
   );
};
export default AnswerContainer;
