export default function Wordle() {
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

  let history = ['piano', 'horse'];
  let currentAttempt = 'wat';
  let secret = wordList[0];

  let GRAY = '#212121';
  let LIGHTGRAY = '#888';
  let GREEN = '#538d4e';
  let YELLOW = '#b59f3b';
  let MIDDLEGREY = '#666';
  let BLACK = '#111';

  return (
    <div id="screen">
      <h1>Wordle</h1>
      <Grid />
      <Keyboard />
    </div>
  );

  function Grid() {
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

  function Keyboard() {
    return (
      <div id="keyboard">
        <KeyboardRow letters="qwertyuiop" isLast={false} />
        <KeyboardRow letters="asdfghjkl" isLast={false} />
        <KeyboardRow letters="zxcvbnm" isLast={true} />
      </div>
    );
  }

  function KeyboardRow({ letters, isLast }) {
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
        <Button key={letter} buttonKey={letter}>
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

  function Button({ buttonKey, children }) {
    return (
      <button
        style={{
          backgroundColor: LIGHTGRAY,
        }}
        onClick={() => handleKey(buttonKey)}
      >
        {children}
      </button>
    );
  }

  function handleKey(key) {
    console.log(key);
  }

  function Attempt({ attempt, solved }) {
    let cells = [];
    for (let i = 0; i < 5; i++) {
      cells.push(<Cell key={i} attempt={attempt} index={i} solved={solved} />);
    }
    return <div>{cells}</div>;
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

  function Cell({ attempt, index, solved }) {
    let hasLetter = attempt[index] !== undefined;
    let bgColor = getBgColor(attempt, index);

    let content = hasLetter ? (
      attempt[index]
    ) : (
      <div style={{ opacity: 0 }}>X</div>
    );

    return (
      <div className={'cell ' + (solved ? 'solved' : '')}>
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
}
