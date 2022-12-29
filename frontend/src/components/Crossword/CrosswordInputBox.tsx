import styled from 'styled-components';
import React from 'react';
import { memo, FormEvent } from 'react';
import { Point } from '../../generated/generated';

// Make style of focus a function of the current direction
type CrosswordBoxStyleProps = {
   direction: string;
   point: Point;
};
const CrosswordBox = styled.div<CrosswordBoxStyleProps>`
   :before {
      content: attr(placeholder);
      position: absolute;
      top: 0px;
      left: 0.2em;
      font-size: 0.6em;
      color: rgba(0, 0, 0);
   }
   box-sizing: content-box;
   position: relative;
   text-transform: uppercase;
   background-color: white;
   border-top: black 1px solid;
   border-left: black 1px solid;
   width: 2em;
   height: 2em;
   display: flex;
   justify-content: center;
   align-items: center;
   &:focus {
      background-color: transparent;
      outline: none;
      box-shadow: inset 0px 0px 0px 1px white, inset 0px 0px 0px 2px ${(props) => (props.direction === 'down' ? 'red' : 'green')};
   }
   ::selection { background: transparent }
   :focus::after {
      content: '';
      position: absolute;
      right: 0.6em;
      top: 0.65em;
      width: 0.8em;
      height: 0.8em;
      background: linear-gradient(
         to bottom right,
         ${({ direction }) => (direction === 'down' ? 'red' : 'green')} 50%,
         rgba(0, 0, 0, 0.5) 50%,
         transparent 52%
      );
      transform: rotate(${({ direction }) => (direction === 'down' ? '-135deg' : '135deg')}) translate(-0.65em, -0.65em);
      box-shadow: 0px 0px 0px -2px rgba(0, 0, 0, 0.5);
      z-index: 1;
   }
   caret-color: transparent;
`;

export type CrossWordInputBoxProps = {
   direction: string | undefined;
   point: Point;
   onDoubleClick?: (event: React.MouseEvent) => void;
   onInput?: (event: FormEvent<HTMLDivElement>) => void;
   onDelete: (event: React.KeyboardEvent<HTMLDivElement>) => void;
};
const CrosswordInput = React.forwardRef<HTMLDivElement, CrossWordInputBoxProps>(
   ({ direction, point, onDoubleClick, onDelete, onInput }, ref) => {
      return (
         <CrosswordBox
            direction={direction as string}
            point={point}
            ref={ref}
            placeholder={Number(point.value) ? point.value : ''}
            contentEditable
            onDoubleClick={onDoubleClick}
            onInput={onInput}
            onKeyDown={onDelete}
         />
      );
   },
);
const CrosswordInputBox = memo(CrosswordInput);
export default CrosswordInputBox;
