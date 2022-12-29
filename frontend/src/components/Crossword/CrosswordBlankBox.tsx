import styled from 'styled-components';
import React from 'react';
import { memo } from 'react';

const CrosswordBox = styled.div`
   border-top: black 1px solid;
   border-left: black 1px solid;

   box-sizing: content-box;
   width: 2em;
   height: 2em;
   display: flex;
   justify-content: center;
   align-items: center;
   background-color: black;
   caret-color: transparent;
`;

const CrosswordBlank = React.forwardRef<HTMLDivElement, any>((_, ref) => {
   return <CrosswordBox ref={ref} />;
});
const CrosswordBlankBox = memo(CrosswordBlank);
export default CrosswordBlankBox;
