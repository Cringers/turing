import TerminalInputBox from './components/Terminal/TerminalInputBox';
import { Modal } from './components/Modal';
import {Crossword, useCrosswordQuery } from './generated/generated';

function App() {
  const { data, loading } = useCrosswordQuery();
  return (
    <>
      <h1 style={{ textAlign: 'center'}}>Turing Test</h1>
      <hr></hr>
      <h2 style={{ textAlign: 'center', textTransform: 'capitalize'}}>{data?.crossword.name}</h2>
      {!loading && (
          <TerminalInputBox/>
      )}
      <Modal>test</Modal>
    </>
  );
}

export default App;
