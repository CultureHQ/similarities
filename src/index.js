import React from "react";
import ReactDOM from "react-dom";

const App = () => (
  <>
    <nav>CultureHQ similarity engine</nav>
    <main>
      Hi there
    </main>
    {ReactDOM.createPortal(
      <footer>
        <p>
          Copyright (c) 2019 CultureHQ
          <br />
          <a href="https://culturehq.com">
            culturehq.com
          </a>
        </p>
      </footer>,
      document.body
    )}
  </>
);

ReactDOM.render(<App />, document.getElementById("main"));
