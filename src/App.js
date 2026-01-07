import React, { useState, useEffect } from "react";
import { Trophy, RefreshCw, LayoutGrid, Play } from "lucide-react";

// 卡牌花色與數值定義
const SUITS = ["♠", "♥", "♦", "♣"];
const VALUES = [
  { val: 1, label: "A" },
  { val: 2, label: "2" },
  { val: 3, label: "3" },
  { val: 4, label: "4" },
  { val: 5, label: "5" },
  { val: 6, label: "6" },
  { val: 7, label: "7" },
  { val: 8, label: "8" },
  { val: 9, label: "9" },
  { val: 10, label: "10" },
  { val: 11, label: "J" },
  { val: 12, label: "Q" },
  { val: 13, label: "K" },
];

// 產生隨機卡牌
const getRandomCard = () => {
  const randomSuit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const randomValueObj = VALUES[Math.floor(Math.random() * VALUES.length)];
  return {
    suit: randomSuit,
    value: randomValueObj.val,
    label: randomValueObj.label,
    color:
      randomSuit === "♥" || randomSuit === "♦"
        ? "text-red-600"
        : "text-slate-800",
    id: Math.random().toString(36).substr(2, 9), // 唯一ID用於React Key
  };
};

// 單張卡牌元件
const Card = ({ card, isFaceUp, onClick, label, isInteractive }) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="font-bold text-white/80 text-sm md:text-base tracking-widest uppercase">
        {label}
      </div>
      <div
        onClick={isInteractive ? onClick : undefined}
        className={`
          relative w-32 h-48 md:w-40 md:h-56 rounded-xl shadow-xl transition-all duration-500 transform preserve-3d cursor-pointer
          ${isFaceUp ? "rotate-y-0" : "rotate-y-180"}
          ${
            isInteractive && !isFaceUp
              ? "hover:shadow-2xl ring-2 ring-white/30 hover:ring-yellow-400"
              : ""
          }
        `}
        style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
      >
        {/* 卡牌正面 */}
        <div
          className="absolute w-full h-full backface-hidden bg-white rounded-xl border-2 border-gray-200 flex flex-col justify-between p-3 select-none"
          style={{ transform: "rotateY(0deg)" }}
        >
          <div className={`text-2xl font-bold ${card.color} text-left`}>
            {card.label} <span className="text-xl">{card.suit}</span>
          </div>
          <div className={`text-6xl text-center ${card.color}`}>
            {card.suit}
          </div>
          <div
            className={`text-2xl font-bold ${card.color} text-right transform rotate-180`}
          >
            <span className="text-xl">{card.suit}</span> {card.label}
          </div>
        </div>

        {/* 卡牌背面 */}
        <div
          className="absolute w-full h-full backface-hidden rounded-xl border-4 border-white shadow-inner flex items-center justify-center bg-blue-900"
          style={{
            transform: "rotateY(180deg)",
            backgroundImage:
              "repeating-linear-gradient(45deg, #1e3a8a 25%, #172554 25%, #172554 50%, #1e3a8a 50%, #1e3a8a 75%, #172554 75%, #172554 100%)",
            backgroundSize: "20px 20px",
          }}
        >
          <div className="w-20 h-20 rounded-full border-2 border-yellow-500/30 flex items-center justify-center bg-blue-950/80">
            <span className="text-2xl font-serif text-yellow-500/50">Card</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 牌堆元件
const DeckPile = () => (
  <div className="hidden lg:flex flex-col items-center justify-center absolute left-8 top-1/2 -translate-y-1/2">
    <div className="relative w-32 h-48">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-full h-full rounded-xl border-2 border-white bg-blue-900 shadow-xl"
          style={{
            top: `-${i * 2}px`,
            left: `-${i * 2}px`,
            backgroundImage:
              "repeating-linear-gradient(45deg, #1e3a8a 25%, #172554 25%, #172554 50%, #1e3a8a 50%, #1e3a8a 75%, #172554 75%, #172554 100%)",
            backgroundSize: "20px 20px",
            zIndex: 5 - i,
          }}
        />
      ))}
      <div className="absolute top-20 left-4 text-white font-bold text-center w-full transform -rotate-45 opacity-50 text-sm">
        牌堆
      </div>
    </div>
  </div>
);

export default function App() {
  const [gameState, setGameState] = useState("setup"); // setup, playing, ended
  const [targetWins, setTargetWins] = useState(3);
  const [playerScore, setPlayerScore] = useState(0);
  const [computerScore, setComputerScore] = useState(0);

  const [playerCard, setPlayerCard] = useState(getRandomCard());
  const [computerCard, setComputerCard] = useState(getRandomCard());

  const [isRevealed, setIsRevealed] = useState(false);
  const [roundResult, setRoundResult] = useState(""); // 'Win', 'Lose', 'Draw'
  const [matchResult, setMatchResult] = useState(null); // 'Victory', 'Defeat'

  // 開始新遊戲
  const startGame = (wins) => {
    setTargetWins(wins);
    setPlayerScore(0);
    setComputerScore(0);
    setGameState("playing");
    setMatchResult(null);
    startNewRound(true);
  };

  // 開始新的一局
  const startNewRound = (isFirst = false) => {
    setIsRevealed(false);
    setRoundResult("");
    // 延遲一點點換牌，讓蓋牌動畫自然
    setTimeout(
      () => {
        setPlayerCard(getRandomCard());
        setComputerCard(getRandomCard());
      },
      isFirst ? 0 : 300
    );
  };

  // 處理點擊卡牌
  const handleCardClick = () => {
    if (isRevealed || gameState !== "playing") return;

    setIsRevealed(true);

    // 計算勝負
    const pVal = playerCard.value;
    const cVal = computerCard.value;

    let result = "Draw";
    if (pVal > cVal) {
      result = "Win";
      setPlayerScore((prev) => prev + 1);
    } else if (cVal > pVal) {
      result = "Lose";
      setComputerScore((prev) => prev + 1);
    }
    setRoundResult(result);
  };

  // 監聽分數變化以判斷是否結束遊戲
  useEffect(() => {
    if (gameState !== "playing") return;

    if (playerScore >= targetWins) {
      setTimeout(() => {
        setMatchResult("Victory");
        setGameState("ended");
      }, 1000);
    } else if (computerScore >= targetWins) {
      setTimeout(() => {
        setMatchResult("Defeat");
        setGameState("ended");
      }, 1000);
    }
  }, [playerScore, computerScore, targetWins, gameState]);

  return (
    <div className="min-h-screen bg-green-800 flex flex-col items-center justify-center font-sans overflow-hidden relative selection:bg-yellow-400 selection:text-black">
      {/* 背景紋理 */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #ffffff 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }}
      ></div>

      {/* 頂部標題與狀態 */}
      <div className="absolute top-0 w-full p-4 flex justify-between items-center z-10 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center gap-2 text-yellow-400">
          <Trophy size={24} />
          <span className="font-bold text-lg hidden sm:inline">
            紙牌比大小大戰
          </span>
        </div>

        {gameState !== "setup" && (
          <div className="flex gap-8 text-white font-bold text-xl">
            <div className="flex flex-col items-center">
              <span className="text-xs text-gray-300 uppercase">
                對家 (電腦)
              </span>
              <span className="text-2xl">{computerScore}</span>
            </div>
            <div className="flex items-center text-yellow-400 text-sm">
              目標 {targetWins} 勝
            </div>
            <div className="flex flex-col items-center">
              <span className="text-xs text-green-300 uppercase">
                玩家 (你)
              </span>
              <span className="text-2xl">{playerScore}</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setGameState("setup")}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          title="重新開始"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      {/* 遊戲主區域 */}
      <div className="relative w-full max-w-4xl flex flex-col items-center justify-center gap-8 p-4 z-0">
        {/* 設置畫面 */}
        {gameState === "setup" && (
          <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl shadow-2xl text-center max-w-md w-full animate-fade-in-up">
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              準備好了嗎？
            </h1>
            <p className="text-slate-500 mb-6">選擇獲勝所需的局數</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {[3, 5, 10].map((num) => (
                <button
                  key={num}
                  onClick={() => startGame(num)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border-2 border-slate-200 hover:border-yellow-500 hover:bg-yellow-50 transition-all group"
                >
                  <Trophy
                    className={`w-8 h-8 ${
                      targetWins === num
                        ? "text-yellow-500"
                        : "text-slate-300 group-hover:text-yellow-500"
                    }`}
                  />
                  <span className="font-bold text-xl text-slate-700">
                    {num} 勝
                  </span>
                </button>
              ))}
            </div>

            <div className="text-sm text-slate-400 bg-slate-100 p-3 rounded-lg text-left">
              <span className="font-bold block mb-1 text-slate-600">
                規則：
              </span>
              1. 點擊你的卡牌翻開
              <br />
              2. 雙方同時亮牌
              <br />
              3. 點數大者得分 (A最小, K最大)
            </div>
          </div>
        )}

        {/* 遊戲進行中畫面 */}
        {(gameState === "playing" || gameState === "ended") && (
          <>
            <DeckPile />

            <div className="flex flex-col items-center gap-8 md:gap-12 w-full">
              {/* 電腦區域 */}
              <div className="relative">
                <Card
                  card={computerCard}
                  isFaceUp={isRevealed}
                  label="對家"
                  isInteractive={false}
                />
                {isRevealed && (
                  <div
                    className={`absolute -right-24 top-1/2 -translate-y-1/2 font-bold text-2xl animate-bounce
                     ${
                       roundResult === "Lose"
                         ? "text-green-400"
                         : roundResult === "Win"
                         ? "text-red-400 opacity-50"
                         : "text-gray-400"
                     }
                   `}
                  >
                    {roundResult === "Lose" ? "+1 分" : ""}
                  </div>
                )}
              </div>

              {/* 中間狀態區 (訊息/按鈕) */}
              <div className="h-16 flex items-center justify-center w-full">
                {!isRevealed ? (
                  <div className="text-yellow-200 animate-pulse font-bold tracking-wider bg-black/30 px-6 py-2 rounded-full">
                    👇 點擊你的牌來翻開
                  </div>
                ) : (
                  gameState !== "ended" && (
                    <button
                      onClick={() => startNewRound()}
                      className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 px-8 py-3 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all"
                    >
                      <Play size={20} fill="currentColor" />
                      下一局
                    </button>
                  )
                )}
              </div>

              {/* 玩家區域 */}
              <div className="relative">
                <Card
                  card={playerCard}
                  isFaceUp={isRevealed}
                  onClick={handleCardClick}
                  label="玩家 (我)"
                  isInteractive={!isRevealed && gameState === "playing"}
                />
                {isRevealed && (
                  <div
                    className={`absolute -right-24 top-1/2 -translate-y-1/2 font-bold text-2xl animate-bounce
                     ${
                       roundResult === "Win"
                         ? "text-green-400"
                         : roundResult === "Lose"
                         ? "text-red-400 opacity-50"
                         : "text-gray-400"
                     }
                   `}
                  >
                    {roundResult === "Win" ? "+1 分" : ""}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 遊戲結束對話框 */}
      {gameState === "ended" && matchResult && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl p-8 shadow-2xl max-w-sm w-full text-center transform scale-100 animate-pop-in border-4 border-yellow-500">
            <div className="mb-4 flex justify-center">
              {matchResult === "Victory" ? (
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-600">
                  <Trophy size={48} />
                </div>
              ) : (
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-500">
                  <LayoutGrid size={48} />
                </div>
              )}
            </div>

            <h2
              className={`text-4xl font-black mb-2 ${
                matchResult === "Victory" ? "text-yellow-600" : "text-gray-600"
              }`}
            >
              {matchResult === "Victory" ? "你贏了！" : "你輸了"}
            </h2>

            <p className="text-gray-500 mb-8">
              {matchResult === "Victory"
                ? "恭喜！你的運氣真不錯。"
                : "別氣餒，再來一場吧？"}
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => setGameState("setup")}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-yellow-950 font-bold rounded-xl transition-colors"
              >
                回到主選單
              </button>
              <button
                onClick={() => startGame(targetWins)}
                className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
              >
                再玩一次 ({targetWins}局)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tailwind 自定義動畫補充樣式 */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .rotate-y-0 { transform: rotateY(0deg); }
        
        @keyframes pop-in {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-pop-in { animation: pop-in 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>
    </div>
  );
}
