import { Route, Routes } from 'react-router-dom'
import Dashboard from './admin/Dashboard'
import EventForm from './admin/EventForm'
import AdminEvents from './admin/Events'
import AdminHorses from './admin/Horses'
import AdminTickets from './admin/Tickets'
import AdminUsers from './admin/Users'
import WebsiteSettings from './admin/WebsiteSettings'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import WhatsappFab from './components/WhatsappFab'
import About from './pages/About'
import Championships from './pages/Championships'
import Contact from './pages/Contact'
import EventDetails from './pages/EventDetails'
import Events from './pages/Events'
import Home from './pages/Home'
import HorseDetails from './pages/HorseDetails'
import Horses from './pages/Horses'
import Login from './pages/Login'
import MyTickets from './pages/MyTickets'
import NotFound from './pages/NotFound'
import PostHorse from './pages/PostHorse'
import Profile from './pages/Profile'
import Register from './pages/Register'
import TicketDetails from './pages/TicketDetails'
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
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/horses" element={<Horses />} />
          <Route path="/horses/:id" element={<HorseDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Any logged-in user */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/tickets/:id" element={<TicketDetails />} />
          </Route>

          {/* Admins only: the only accounts that can post horses and events */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/horses" element={<AdminHorses />} />
            <Route path="/admin/horses/new" element={<PostHorse />} />
            <Route path="/admin/horses/:id/edit" element={<PostHorse />} />
            <Route path="/admin/events" element={<AdminEvents />} />
            <Route path="/admin/events/new" element={<EventForm />} />
            <Route path="/admin/events/:id/edit" element={<EventForm />} />
            <Route path="/admin/tickets" element={<AdminTickets />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/settings" element={<WebsiteSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <WhatsappFab />
    </div>
  )
}
