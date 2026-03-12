import { useEffect, useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { Trophy } from 'lucide-react';

export default function Bingo() {
  const { currentUser, boards, questions, initializeBoard, toggleBoardSquare } = useStore();
  const [showWinAnimation, setShowWinAnimation] = useState(false);

  useEffect(() => {
    if (currentUser) {
      initializeBoard(currentUser.id);
    }
  }, [currentUser, initializeBoard]);

  const userBoard = boards.find(b => b.userId === currentUser?.id);
  const boardState = userBoard?.boardState || [];

  const hasWon = useMemo(() => {
    if (boardState.length !== 25) return false;

    // Check rows & columns
    for (let i = 0; i < 5; i++) {
      let rowWin = true;
      let colWin = true;
      for (let j = 0; j < 5; j++) {
        if (!boardState[i * 5 + j].isChecked) rowWin = false;
        if (!boardState[j * 5 + i].isChecked) colWin = false;
      }
      if (rowWin || colWin) return true;
    }

    // Check diagonals
    let diag1Win = true;
    let diag2Win = true;
    for (let i = 0; i < 5; i++) {
      if (!boardState[i * 5 + i].isChecked) diag1Win = false;
      if (!boardState[i * 5 + (4 - i)].isChecked) diag2Win = false;
    }

    return diag1Win || diag2Win;
  }, [boardState]);

  useEffect(() => {
    if (hasWon && !showWinAnimation) {
      setShowWinAnimation(true);
      setTimeout(() => setShowWinAnimation(false), 5000);
    }
  }, [hasWon, showWinAnimation]);

  if (!currentUser || !userBoard) {
    return <div className="flex justify-center py-12"><div className="animate-pulse flex space-x-4">Loading your board...</div></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 relative">
      {showWinAnimation && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-budapest-green/20 backdrop-blur-sm transition-opacity duration-1000">
          <div className="animate-bounce bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center">
            <Trophy size={64} className="text-yellow-400 mb-4" />
            <h2 className="text-4xl font-extrabold text-budapest-green">BINGO!</h2>
            <p className="text-gray-600 mt-2 text-lg">Gratulálok! You did it!</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Bingo Card</h1>
          <p className="text-gray-500 mt-1">Get 5 in a row to win!</p>
        </div>
        {hasWon && (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full font-bold shadow-sm">
            <Trophy size={20} /> Winner!
          </div>
        )}
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-5 gap-1 sm:gap-2 lg:gap-3 aspect-square max-w-2xl mx-auto">
          {boardState.map((square, idx) => {
            const isFreeSpace = square.questionId === 'FREE_SPACE';
            const question = isFreeSpace 
              ? { text: 'FREE BP' } 
              : questions.find(q => q.id === square.questionId) || { text: '?' };

            return (
              <button
                key={`${idx}-${square.questionId}`}
                disabled={isFreeSpace}
                onClick={() => toggleBoardSquare(currentUser.id, square.questionId)}
                className={`
                  relative group min-h-[4rem] sm:min-h-[5rem] md:min-h-[6rem] p-1 sm:p-2 rounded sm:rounded-md flex items-center justify-center text-center transition-all duration-300
                  ${isFreeSpace ? 'bg-budapest-red text-white font-black shadow-inner' : 
                    square.isChecked 
                      ? 'bg-budapest-green text-white shadow-md transform scale-[0.98]' 
                      : 'bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:shadow-sm'
                  }
                `}
              >
                <span className={`text-[10px] sm:text-xs md:text-sm leading-tight ${isFreeSpace ? 'text-lg sm:text-2xl' : 'font-medium'}`}>
                  {question.text}
                </span>
                
                {/* Stamp overlay effect when checked */}
                {!isFreeSpace && square.isChecked && (
                  <div className="absolute inset-0 border-4 border-white/20 rounded z-0 pointer-events-none" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
