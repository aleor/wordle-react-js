import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { KeyContext } from './context';

export default function Wordle() {
  let [history, setHistory] = useState([]);
  let [currentAttempt, setCurrentAttempt] = useState('');
  let [bestColors, setBestColors] = useState(() => new Map());
  let loadedRef = useRef(false);
  let animatingRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) {
      return;
    }

    loadedRef.current = true;
    let savedHistory = loadHistory();
    if (savedHistory) {
      setHistory(savedHistory);
      setBestColors(calculateBestColor(savedHistory));
    }
  });

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  let wordList = [
    'patio',
    'darts',
    'piano',
    'horse',
    'hello',
    'water',
    'pizza',
    'sushi',
    'crabs',
  ];

  let secret = wordList[0];

  let GRAY = '#212121';
  let LIGHTGRAY = '#888';
  let GREEN = '#538d4e';
  let YELLOW = '#b59f3b';
  let MIDDLEGREY = '#666';
  let BLACK = '#111';

  function waitForAnimation(nextHistory) {
    if (animatingRef.current)
      throw Error('Should not be called during animation');

    animatingRef.current = true;
    setTimeout(() => {
      animatingRef.current = false;
      setBestColors(calculateBestColor(nextHistory));
    }, 2000);
  }

  function onKeyDown(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) {
      return;
    }

    handleKey(e.key);
  }

  function calculateBestColor(history) {
    let map = new Map();
    for (let attempt of history) {
      for (let i = 0; i < attempt.length; i++) {
        let color = getBgColor(attempt, i);
        let key = attempt[i];
        let bestColor = map.get(key);
        map.set(key, getBetterColor(color, bestColor));
      }
    }
    return map;
  }

  function handleKey(key) {
    if (history.length === 6) {
      return;
    }

    if (animatingRef.current) {
      return;
    }

    let letter = key.toLowerCase();
    if (letter === 'enter') {
      if (currentAttempt?.length < 5) {
        return;
      }

      if (!wordList.includes(currentAttempt)) {
        alert('Not in the dictionary');
        return;
      }

      setHistory([...history, currentAttempt]);

      if (currentAttempt === secret) {
        alert('You win!');

        return;
      }

      setCurrentAttempt('');
      waitForAnimation([...history, currentAttempt]);
    } else if (letter === 'backspace') {
      setCurrentAttempt(currentAttempt.slice(0, currentAttempt.length - 1));
    } else if (/^[a-z]$/.test(letter)) {
      if (currentAttempt.length < 5) {
        setCurrentAttempt(currentAttempt + letter);
      }
    }

    if (history.length === 6 && currentAttempt !== secret) {
      setTimeout(() => alert(secret), 0);
    }
  }

  return (
    <div id="screen">
      <KeyContext.Provider value={handleKey}>
        <h1>Wordle</h1>
        <Grid history={history} currentAttempt={currentAttempt} />
        <Keyboard bestColors={bestColors} />
      </KeyContext.Provider>
    </div>
  );

  function Grid({ history, currentAttempt }) {
    let rows = [];

    for (let i = 0; i < 6; i++) {
      if (i < history.length) {
        rows.push(<Attempt key={i} attempt={history[i]} solved={true} />);
      } else if (i === history.length) {
        rows.push(<Attempt key={i} attempt={currentAttempt} solved={false} />);
      } else {
        rows.push(<Attempt key={i} attempt="" solved={false} />);
      }
    }

    return <div id="grid">{rows}</div>;
  }

  function Attempt({ attempt, solved }) {
    let cells = [];
    for (let i = 0; i < 5; i++) {
      cells.push(<Cell key={i} attempt={attempt} index={i} solved={solved} />);
    }
    return <div>{cells}</div>;
  }

  function Cell({ attempt, index, solved }) {
    let hasLetter = attempt[index] !== undefined;
    let bgColor = getBgColor(attempt, index);

    let content = hasLetter ? (
      attempt[index]
    ) : (
      <div style={{ opacity: 0 }}>X</div>
    );

    return (
      <div
        className={
          'cell' + (solved ? ' solved ' : '') + (hasLetter ? ' filled' : '')
        }
      >
        <div
          className="surface"
          style={{
            transitionDelay: index * 300 + 'ms',
          }}
        >
          <div
            className="front"
            style={{
              backgroundColor: BLACK,
              borderColor: hasLetter ? MIDDLEGREY : '',
            }}
          >
            {content}
          </div>
          <div
            className="back"
            style={{
              backgroundColor: bgColor,
              borderColor: bgColor,
            }}
          >
            {content}
          </div>
        </div>
      </div>
    );
  }

  function Keyboard({ bestColors }) {
    return (
      <div id="keyboard">
        <KeyboardRow
          bestColors={bestColors}
          letters="qwertyuiop"
          isLast={false}
        />
        <KeyboardRow
          bestColors={bestColors}
          letters="asdfghjkl"
          isLast={false}
        />
        <KeyboardRow bestColors={bestColors} letters="zxcvbnm" isLast={true} />
      </div>
    );
  }

  function KeyboardRow({ letters, isLast, bestColors }) {
    let buttons = [];
    if (isLast) {
      buttons.push(
        <Button key="enter" buttonKey="Enter">
          Enter
        </Button>
      );
    }

    for (let letter of letters) {
      buttons.push(
        <Button key={letter} buttonKey={letter} color={bestColors.get(letter)}>
          {letter}
        </Button>
      );
    }

    if (isLast) {
      buttons.push(
        <Button key="backspace" buttonKey="Backspace">
          BkSpc
        </Button>
      );
    }

    return <div>{buttons}</div>;
  }

  function Button({ buttonKey, children, color = LIGHTGRAY }) {
    const handleKey = useContext(KeyContext);

    return (
      <button
        style={{
          backgroundColor: color,
          borderColor: color,
        }}
        onClick={() => handleKey(buttonKey)}
      >
        {children}
      </button>
    );
  }

  function getBgColor(attempt, i) {
    let correctLetter = secret[i];
    let attemptLetter = attempt[i];

    if (!attemptLetter || !attempt.includes(correctLetter)) {
      return GRAY;
    }

    if (attemptLetter === correctLetter) {
      return GREEN;
    }

    return YELLOW;
  }

  function loadHistory() {
    let data;
    try {
      data = JSON.parse(localStorage.getItem('data'));
    } catch {}

    return data?.secret === secret ? data.history : [];
  }

  function saveHistory(history) {
    let data = { secret, history };
    try {
      localStorage.setItem('data', JSON.stringify(data));
    } catch {}
  }

  function getBetterColor(a, b) {
    if (a === GREEN || b === GREEN) {
      return GREEN;
    }

    if (a === YELLOW || b === YELLOW) {
      return YELLOW;
    }

    return GRAY;
  }
}
