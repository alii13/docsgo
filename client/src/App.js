import React from 'react';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import CreateRoom from "./routes/CreateRoom";
import Room from "./routes/Room";
import StoreContextProvider from "./contexts/StoreContextProvider"; 
function App() {

  return (
    <StoreContextProvider>
      <BrowserRouter>
        <Switch>
          <Route path="/" exact component={CreateRoom} />
          <Route path="/room/:roomID"  component={Room} />
        </Switch>
      </BrowserRouter>
    </StoreContextProvider>
  );
}

export default App;
