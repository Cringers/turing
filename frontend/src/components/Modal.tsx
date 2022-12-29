import { useApolloClient } from "@apollo/client";
import styled from "styled-components";
import { IsAnsweredDocument, useIsAnsweredQuery } from "../generated/generated";

const ModalBackground = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  display: flex;
  background: rgb(0, 0, 0, 0.7);
  backdrop-filter: blur(2px);
  z-index: 100;
`;

const ModalBox = styled.div`
  background: whitesmoke;
  padding: 1em;
  border-radius: .1em;
  align-items: center;
`

export type ModalProps = { children: string };
export const Modal = ({children,}: ModalProps) => {
  const { data: answerData } = useIsAnsweredQuery();
  const client = useApolloClient();
  const onClose = (isAnswered: boolean ) => {
      client.writeQuery({
         query: IsAnsweredDocument,
         data: { isAnswered }
      })
  }
  const modal : JSX.Element | null = answerData?.isAnswered ? 
                  <ModalBackground onClick={() => onClose(false)}>
                    <ModalBox> You win!</ModalBox> 
                  </ModalBackground>
                : null
  
  return <>{modal}</>
}
