import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import UserSelector from './components/UserSelector';
import { UserProvider } from './services/UserContext';
import QuemMeSegue from './pages/QuemMeSegue';
import QuemEuSigo from './pages/QuemEuSigo';
import FeedDePublicacoes from './pages/FeedDePublicacoes';
import CriarPublicacao from './pages/CriarPublicacao';
import ProdutosEmPromocao from './pages/ProdutosEmPromocao';

const App = () => {
 

  return (
    <UserProvider>
      <Router>
        <Navigation />
        <UserSelector />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-me-segue" element={<QuemMeSegue />} />
          <Route path="/quem-eu-sigo" element={<QuemEuSigo />} />
          <Route path="/feed-de-publicacoes" element={<FeedDePublicacoes />} />
          <Route path="/criar-publicacao" element={<CriarPublicacao />} />
          <Route path="/produtos-em-promocao" element={<ProdutosEmPromocao />} />
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
