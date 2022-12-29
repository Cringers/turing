import CrosswordBoxContainer from './components/Crossword/CrosswordBoxContainer';
import { Modal } from './components/Modal';
import {Crossword, useCrosswordQuery } from './generated/generated';

function App() {
  const { data, loading } = useCrosswordQuery();
  return (
    <>
      <h1 style={{ textAlign: 'center'}}>Crosswordle</h1>
      <hr></hr>
      <h2 style={{ textAlign: 'center', textTransform: 'capitalize'}}>{data?.crossword.name}</h2>
      {!loading && (
          <CrosswordBoxContainer crossword={data?.crossword as Crossword } />
      )}
      <Modal>test</Modal>
    </>
  );
}

export default App;
