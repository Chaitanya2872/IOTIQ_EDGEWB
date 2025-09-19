
// import React from 'react';
// import facility from '../assets/facility.png';
// import iotiq from '../assets/iotiq.png';
// import logo from '../assets/logo.png';
// import { useNavigate } from 'react-router-dom';
// import '../App.css';

// const Header: React.FC = () => {
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     // if you store token in localStorage/sessionStorage, clear it here
//     localStorage.removeItem('token'); 
//     // redirect to login
//     navigate('/login');
//   };

//   return (
//     <div
//       className="top-header"
//       style={{
//         position: 'fixed',
//         top: 0,
//         left: 0,
//         right: 0,
//         height: '70px',
//         borderBottom: '1px solid #e0e0e0',
//         backgroundColor: '#fff',
//         zIndex: 1000,
//         display: 'flex',
//         alignItems: 'center',
//         justifyContent: 'space-between',
//         padding: '0 28px'
//       }}
//     >
//       {/* Left Logo */}
//       <div className="left-logo">
//         <img src={logo} alt="IOTIQ" className="right-logo" />
//       </div>

//       {/* Center Branding */}
//       <div className="center-branding">
//         <img src={facility} alt="SmartEdgeFM" />
//       </div>

//       {/* Right User Section */}
//       <div className="right-user">
//         <div className="user-info" style={{ display: 'flex', alignItems: 'center' }}>
//           <img
//             src="https://www.w3schools.com/howto/img_avatar.png"
//             alt="User Avatar"
//             style={{
//               width: '40px',
//               height: '40px',
//               borderRadius: '50%',
//               marginRight: '8px'
//             }}
//           />
//           <span>Jonson Jonson</span>
//           <span style={{ margin: '0 8px' }}>|</span>
//           <span
//             onClick={handleLogout}
//             style={{
//               cursor: 'pointer',
//               color: '#1890ff',
//               fontWeight: 500
//             }}
//           >
//             Logout
//           </span>
//           <span style={{ margin: '0 8px' }}>|</span>
//         </div>
//         <img src={iotiq} alt="IOTIQ Edge" className="right-logo" />
//       </div>
//     </div>
//   );
// };

// export default Header;
import React from 'react';
import facility from '../assets/facility.png';
import iotiq from '../assets/iotiq.png';
import logo from '../assets/logo.png';
import '../App.css';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const handleLogout = () => {
    // Clear any stored tokens
    localStorage.removeItem('token');
    
    // Call the logout function passed from parent (App.tsx)
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <div
      className="top-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '70px',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fff',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px'
      }}
    >
      {/* Left Logo */}
      <div className="left-logo">
        <img src={logo} alt="IOTIQ" className="right-logo" />
      </div>

      {/* Center Branding */}
      <div className="center-branding">
        <img src={facility} alt="SmartEdgeFM" />
      </div>

      {/* Right User Section */}
      <div className="right-user">
        <div className="user-info" style={{ display: 'flex', alignItems: 'center' }}>
          <img
            src="https://www.w3schools.com/howto/img_avatar.png"
            alt="User Avatar"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              marginRight: '8px'
            }}
          />
          <span>Jonson Jonson</span>
          <span style={{ margin: '0 8px' }}>|</span>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#1890ff',
              fontWeight: 500,
              fontSize: 'inherit',
              padding: 0
            }}
          >
            Logout
          </button>
          <span style={{ margin: '0 8px' }}>|</span>
        </div>
        <img src={iotiq} alt="IOTIQ Edge" className="right-logo" />
      </div>
    </div>
  );
};

export default Header;