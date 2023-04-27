import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const test = document.getElementsByClassName('top-level');
  expect(test).toBeInTheDocument();
});
