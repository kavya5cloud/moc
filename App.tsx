
import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import ShopHighlights from './components/ShopHighlights';
import VisitInfo from './components/VisitInfo';
import Footer from './components/Footer';
import LoadingScreen from './components/LoadingScreen';
import BookingPage from './components/BookingPage';
import CollectablesPage from './components/CollectablesPage';
import OrderStatusPage from './components/OrderStatusPage';
import AdminPage from './components/AdminPage';
import CuratorChat from './components/CuratorChat';
import { DataProvider } from './services/DataContext';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <>
    <Hero />
    <div id="main-content" className="relative z-10 bg-white">
      <ShopHighlights />
      <VisitInfo />
    </div>
  </>
);

const Layout: React.FC = () => {
    return (
        <div className="font-sans text-black selection:bg-black selection:text-white">
            <Header />
            <main className="min-h-[70vh]">
              <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<CollectablesPage />} />
                  <Route path="/order-status" element={<OrderStatusPage />} />
                  <Route path="/booking" element={<BookingPage />} />
                  <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
            <Footer />
            <CuratorChat />
        </div>
    );
};

const App: React.FC = () => {
  return (
    <DataProvider>
        <Router>
            <ScrollToTop />
            <LoadingScreen />
            <Layout />
        </Router>
    </DataProvider>
  );
};

export default App;
