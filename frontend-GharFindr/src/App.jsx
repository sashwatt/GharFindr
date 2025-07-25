import { Suspense } from "react";
import { ToastContainer } from 'react-toastify';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SearchBar from "./components/Searchbar.jsx";
import EditProfile from "./pages/account/editProfile.jsx";
import ForgotPassword from "./pages/account/forgetPassword.jsx";
import Login from "./pages/account/Login";
import Register from "./pages/account/Register";
import ResetPassword from "./pages/account/resetPassword.jsx";
import AboutUs from "./pages/homepage/AboutUs.jsx";
import Address from "./pages/homepage/Address.jsx";
import ContactUs from "./pages/homepage/ContactUs.jsx";
import Dashboard from "./pages/homepage/Dashboard.jsx";
import HelpAndSupport from "./pages/homepage/HelpAndSupport.jsx";
import RoomDetails from "./pages/homepage/RoomDetails.jsx";
import TermsCondition from "./pages/homepage/TermsCondition.jsx";
import WishList from "./pages/homepage/Wishlist.jsx";
import RoommateDetails from './pages/homepage/RoommateDetails.jsx';


import Failure from "./pages/payment/Failure.jsx";
import Success from "./pages/payment/Success.jsx";
import AddRooms from "./pages/private/AddRooms.jsx";
import AdminDashboard from "./pages/private/AdminDashboard.jsx";
import AdminUpdate from "./pages/private/AdminUpdate.jsx";
import EditUser from "./pages/private/EditUser.jsx";
import Profile from "./pages/private/Profile.jsx";
import UserListings from "./pages/private/UserListings.jsx";

import Rooms from "./pages/homepage/Rooms.jsx";
import Roommates from "./pages/homepage/Roommates.jsx";
import AddRoommate from "./pages/private/AddRoommate.jsx";
import EditRoommate from "./pages/private/EditRoommate.jsx";


function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/searchbar" element={<SearchBar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/edit-profile/:id" element={<EditProfile />} />
            <Route path="/adminDash" element={<AdminDashboard />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/termscondition" element={<TermsCondition />} />
            <Route path="/address/:location" element={<Address />} />
            <Route path="/helpandsupport" element={<HelpAndSupport />} />
            <Route path="/room-details/:id" element={<RoomDetails />} />
            <Route path="/wishlist" element={<WishList />} />
            <Route path="/adminUpdate/:id" element={<AdminUpdate />} />
            <Route path="/roommate-details/:id" element={<RoommateDetails />} />
            <Route path="/addRooms" element={<AddRooms />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/addRoommate" element={<AddRoommate />} />
            <Route path="/editRoommate/:id" element={<EditRoommate />} />
            <Route path="/edit-user/:id" element={<EditUser />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/success" element={<Success />} />
            <Route path="/failure" element={<Failure />} />
            <Route path="/rooms" element={<Rooms />} />
            <Route path="/roommates" element={<Roommates />} />
            <Route path="/userListings" element={<UserListings />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;
