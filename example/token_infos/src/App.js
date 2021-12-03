import './App.css';

import TokenDetails from "./components/TokenDetails";

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <p>
                Example for viewing basic information about a Synapse Protocol ERC20 Token on a given chain.
                </p>
                <TokenDetails/>
            </header>

        </div>
    );
}

export default App;
