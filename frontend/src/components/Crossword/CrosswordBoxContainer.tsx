import React, { FormEvent, useMemo, useState, useEffect, createRef } from 'react';
import styled from 'styled-components';
import { mod, deepCopy, createBlankGrid } from '@crossword/utils';
import { CONFIG } from '@crossword/config';
import { Crossword, Point, Answer, useDirectionQuery, DirectionDocument, DirectionQuery, IsAnsweredQuery, IsAnsweredDocument } from '../../generated/generated';
import CrosswordInputBox from './CrosswordInputBox';
import CrosswordBlankBox from './CrosswordBlankBox';
import AnswerContainer from '../Answers/AnswerContainer';
import { getActiveElement } from '@testing-library/user-event/dist/utils';
import { ApolloClient, useApolloClient } from '@apollo/client';

const Main = styled.div`
   width: fit-content;
   margin: auto;
   display: flex;
   flex-direction: row;
   gap: 10px;
   font-size: x-large;
   #hideBig {
      display: none;
   }
   @media (max-width: 750px) {
      flex-direction: column;
      #hideSmall {
         display: none;
      }
      #hideBig {
         display: contents;
      }
   }
`;
const CrosswordContainer = styled.div`
   border-bottom: solid 1px black;
   width: fit-content;
   min-width: fit-content;
   margin: auto;
`;
const CrosswordRow = styled.div`
   display: flex;
`;

// Compare two grids for equality
function checkAnswer(grid: Point[][], downAnswerMap: Map<number, Answer>, acrossAnswerMap: Map<number, Answer>): boolean {
   if (!downAnswerMap || !acrossAnswerMap) {
      return false;
   }
   for (let answer of downAnswerMap.values()) {
      let x = answer.location.x;
      let y = answer.location.y;
      for (let i = 0; i < answer.answer.length; i++) {
         if (grid[y + i][x].value.localeCompare(answer.answer[i], undefined, { sensitivity: 'accent' }) !== 0) {
            return false;
         }
      }
   }
   for (let answer of acrossAnswerMap.values()) {
      let x = answer.location.x;
      let y = answer.location.y;
      for (let i = 0; i < answer.answer.length; i++) {
         if (grid[y][x + i].value.localeCompare(answer.answer[i], undefined, { sensitivity: 'accent' }) !== 0) {
            return false;
         }
      }
   }
   return true;
}

const handleRight = (refGrid: React.RefObject<HTMLDivElement>[][], rowIndex: number, columnIndex: number, dimension: number) => {
   let current = refGrid[rowIndex][mod(columnIndex + 1, dimension)]?.current;
   current?.focus();
   let count = 1;
   while (current && !(current === getActiveElement(document))) {
      current = refGrid[rowIndex][mod(columnIndex + count, dimension)]?.current;
      current?.focus();
      count += 1;
   }
};

const markAnswered = (client : ApolloClient<object>, isAnswered: boolean ) => {
   client.writeQuery({
      query: IsAnsweredDocument,
      data: { isAnswered }
   })
}
const toggleDirection = (client: ApolloClient<object>, data: DirectionQuery | undefined) => {
   client.writeQuery({
      query: DirectionDocument,
      data: { direction: data?.direction === 'across' ? 'down' : 'across' },
   });
};

const handleDown = (refGrid: React.RefObject<HTMLDivElement>[][], rowIndex: number, columnIndex: number, dimension: number) => {
   let current = refGrid[(rowIndex + 1) % dimension][columnIndex]?.current;
   current?.focus();
   let count = 1;
   while (current && !(current === getActiveElement(document))) {
      current = refGrid[(rowIndex + count) % dimension][columnIndex]?.current;
      current?.focus();
      count += 1;
   }
};

export type CrosswordBoxContainerProps = { crossword: Crossword };
const CrosswordBoxContainer = ({ crossword }: CrosswordBoxContainerProps) => {
   // Initialize empty crossword grid
   const dimension: number = crossword.grid.dimension;
   const client = useApolloClient();
   const { data: directionData, loading } = useDirectionQuery();

   // Initialize the across/down answer maps
   const [downAnswerMap, acrossAnswerMap] = useMemo<Map<number, Answer>[]>(() => {
      let downMap: Map<number, Answer> = new Map();
      crossword.answers.down.forEach((answer) => {
         downMap.set(answer.key, deepCopy(answer));
      });

      let acrossMap: Map<number, Answer> = new Map();
      crossword.answers.across.forEach((answer) => {
         acrossMap.set(answer.key, deepCopy(answer));
      });
      return [downMap, acrossMap];
   }, [crossword]);

   // Initialize the template grid
   const template = useMemo<Point[][]>(() => {
      let template: Point[][] = createBlankGrid(dimension);
      crossword.grid.points.forEach((point) => {
         template[point.y][point.x] = point;
         if (Number(point.value)) {
            let answer = downAnswerMap.get(Number(point.value));
            if (answer) {
               answer.location = deepCopy(point);
            }
            answer = acrossAnswerMap.get(Number(point.value));
            if (answer) {
               answer.location = deepCopy(point);
            }
         }
      });
      return template;
   }, [crossword, dimension]);

   const [grid, setGrid] = useState<Point[][]>(template);
   const [refGrid, _] = useState<React.RefObject<HTMLDivElement>[][]>(
      createBlankGrid(dimension).map((row, _) => row.map(() => createRef())),
   );

   // Check if the crossword is complete
   useEffect(() => {
      if (checkAnswer(grid, downAnswerMap, acrossAnswerMap)) {
         markAnswered(client, true);
      } else {
         markAnswered(client, false);
      }
   }, [grid, downAnswerMap, acrossAnswerMap]);

   // Update grid with newest input
   const crosswordBoxInputHandler = (event: FormEvent<HTMLDivElement>, cellNumber: number) => {
      let columnIndex = cellNumber % dimension;
      let rowIndex = Math.floor(cellNumber / dimension);
      event.currentTarget.textContent = event?.currentTarget?.textContent?.at(0) || '';
      let input: string = event?.currentTarget?.textContent?.at(0) || '';
      setGrid((currentGrid) => {
         var newGrid: Point[][] = deepCopy(currentGrid);
         newGrid[rowIndex][columnIndex].value = input ? input.trim() : currentGrid[rowIndex][columnIndex].value.trim();
         return newGrid;
      });

      let handle = directionData?.direction === 'down' ? handleDown : handleRight;
      handle(refGrid, rowIndex, columnIndex, dimension);
   };

   // On backspace/delete delete the current element from the grid
   const keyStrokeHandler = (event: React.KeyboardEvent<HTMLDivElement>, cellNumber: number) => {
      let columnIndex = cellNumber % dimension;
      let rowIndex = Math.floor(cellNumber / dimension);
      switch (event.key) {
         // Change whether the user is typing in the across/down direction
         case 'Shift': {
            toggleDirection(client, directionData);
            break;
         }
         case 'Backspace':
         case 'Delete': {
            (event.currentTarget as HTMLElement).textContent = '';

            setGrid((currentGrid) => {
               let newGrid: Point[][] = deepCopy(currentGrid);
               newGrid[rowIndex][columnIndex].value = '';
               return newGrid;
            });
            let next = event.currentTarget?.previousSibling as HTMLElement;
            next && next.focus();
            break;
         }
         case 'ArrowRight': {
            handleRight(refGrid, rowIndex, columnIndex, dimension);
            break;
         }
         case 'ArrowLeft': {
            let current = refGrid[rowIndex][mod(columnIndex - 1, dimension)]?.current;
            current?.focus();
            let count = 1;
            while (current && !(current === getActiveElement(document))) {
               current = refGrid[rowIndex][mod(columnIndex - count, dimension)]?.current;
               current?.focus();
               count += 1;
            }
            break;
         }
         case 'ArrowUp': {
            let current = refGrid[mod(rowIndex - 1, dimension)][columnIndex]?.current;
            current?.focus();
            let count = 1;
            while (current && !(current === getActiveElement(document))) {
               current = refGrid[mod(rowIndex - count, dimension)][columnIndex]?.current;
               current?.focus();
               count += 1;
            }
            break;
         }
         case 'ArrowDown': {
            let current = refGrid[(rowIndex + 1) % dimension][columnIndex]?.current;
            current?.focus();
            let count = 1;
            while (current && !(current === getActiveElement(document))) {
               current = refGrid[(rowIndex + count) % dimension][columnIndex]?.current;
               current?.focus();
               count += 1;
            }
            break;
         }
         case 'Escape': {
            markAnswered(client, false)
         }
      }
   };
   return (
      <Main>
         <AnswerContainer type="Across:" answers={acrossAnswerMap} grid={grid} id="hideSmall"></AnswerContainer>
         <div style={{ borderRight: 'black 1px solid', height: 'fit-content', margin: 'auto' }}>
            <CrosswordContainer>
               {template.map((row, i) => (
                  <CrosswordRow key={i}>
                     {row.map((point, j) => {
                        let cellIndex = i * dimension + j;
                        if (point.value === CONFIG.BLANK_CHARACTER) {
                           return <CrosswordBlankBox ref={refGrid[i][j]} key={cellIndex} />;
                        } else {
                           return (
                              <CrosswordInputBox
                                 key={cellIndex}
                                 point={point}
                                 onDoubleClick={() => toggleDirection(client, directionData)}
                                 onInput={(event) => crosswordBoxInputHandler(event, cellIndex)}
                                 onDelete={(event) => keyStrokeHandler(event, cellIndex)}
                                 ref={refGrid[i][j]}
                                 direction={directionData?.direction}
                              />
                           );
                        }
                     })}
                  </CrosswordRow>
               ))}
            </CrosswordContainer>
         </div>
         <AnswerContainer type="Across:" answers={acrossAnswerMap} grid={grid} id="hideBig"></AnswerContainer>
         <AnswerContainer type="Down:" answers={downAnswerMap} grid={grid}></AnswerContainer>
      </Main>
   );
};

export default CrosswordBoxContainer;
