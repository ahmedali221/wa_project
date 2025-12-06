import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import SignUp from './pages/SignUp/SignUp'
import ConnectWhatsApp from './pages/ConnectWhatsApp/ConnectWhatsApp'
import UploadExcel from './pages/UploadExcel/UploadExcel'
import SendMessages from './pages/SendMessages/SendMessages'
import ViewMessages from './pages/ViewMessages/ViewMessages'
import Messages from './pages/Messages/Messages'
import MessageDetail from './pages/MessageDetail/MessageDetail'
import Contacts from './pages/Contacts/Contacts'
import SendMessagesFromContacts from './pages/SendMessagesFromContacts/SendMessagesFromContacts'
import Payment from './pages/Payment/Payment'
import UserProfile from './pages/UserProfile/UserProfile'
import YourPlan from './pages/YourPlan/YourPlan'
import About from './pages/About/About'
import HowItWorks from './pages/HowItWorks/HowItWorks'

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/connect-whatsapp" element={<ConnectWhatsApp />} />
          <Route path="/upload-excel" element={<UploadExcel />} />
          <Route path="/send-messages" element={<SendMessages />} />
          <Route path="/view-messages" element={<ViewMessages />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/messages/:messageText" element={<MessageDetail />} />
          <Route path="/contacts" element={<Contacts />} />
          <Route path="/send-messages-from-contacts" element={<SendMessagesFromContacts />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/your-plan" element={<YourPlan />} />
        </Routes>
      </Router>
      </AppProvider>
    </AuthProvider>
  )
}

export default App
