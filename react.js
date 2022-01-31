import { render } from 'react-dom';
import { renderToString } from 'react-dom/server';
import { hydrate } from 'react-dom';
import Wordle from './wordle';

render(<Wordle />, document.getElementById('root'));

// SSR simulation

// document.getElementById('root').innerHTML = renderToString(<Wordle />);

// setTimeout(() => {
//   hydrate(<Wordle />, document.getElementById('root'));
// }, 1500);
