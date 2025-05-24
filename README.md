# Regicide

Win at [LinkedIn Queens](https://www.linkedin.com/games/queens/) automatically.

Installation:

Requires [`node` v22.13.1 or higher](https://nodejs.org/en)

Run `npm run install` to install all dependencies.

Run `npm run build:extension` to build the extension source code with webpack

To install the extension locally, navigate to `chrome://extensions`, and select `Load Unpacked`. Select the `extension` directory when prompted to.

## Implementation
Regicide is implemented with a DPLL SAT Solver, but is designed to be flexible and solve any grid-based puzzle.
Implementation is inspired by the [MIT 6.101 SAT Solver](https://py.mit.edu/spring25/labs/sat) lab, with the test suite and abstract data type designed following principles from MIT 6.102: Software Construction.


Built in 2 days because Perry was bored. Writeup coming soon!
Next up, NYT Sudoku!

