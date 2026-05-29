import { LoanServiceProvider } from './context/LoanServiceProvider';
import { Board } from './components/board/Board';
import { LoanDetailPanel } from './components/detail/LoanDetailPanel';

export default function App() {
  return (
    <LoanServiceProvider>
      <Board />
      <LoanDetailPanel />
    </LoanServiceProvider>
  );
}
