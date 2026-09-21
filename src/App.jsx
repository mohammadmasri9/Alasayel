import { Route, Routes } from 'react-router-dom'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ScrollToTop from './components/ScrollToTop'
import WhatsappFab from './components/WhatsappFab'
import About from './pages/About'
import Championships from './pages/Championships'
import Contact from './pages/Contact'
import Events from './pages/Events'
import Home from './pages/Home'
import NotFound from './pages/NotFound'
import Training from './pages/Training'

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/training" element={<Training />} />
          <Route path="/championships" element={<Championships />} />
          <Route path="/events" element={<Events />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  )
}
