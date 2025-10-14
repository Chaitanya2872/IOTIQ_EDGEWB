import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import facility from '../assets/facility.png';
import iotiq from '../assets/iotiq.png';
import logo from '../assets/logo.png';
import '../App.css';

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    if (onLogout) {
      onLogout();
    }
  };

  const getUserName = () => {
    if (user?.fullName) return user.fullName;
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        return userData.fullName || userData.email || 'User';
      }
    } catch (error) {
      console.error('Error parsing stored user data:', error);
    }
    
    return 'User';
  };

  return (
    <div
      className="top-header"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.25s ease'
      }}
    >
      {/* Left Logo */}
      <div 
        className="left-logo" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          transition: 'transform 0.25s ease',
          cursor: 'pointer'
        }}
      >
        <img
          src={logo}
          alt="IOTIQ"
          style={{
            height: '36px',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04))',
          }}
        />
      </div>

      {/* Center Branding */}
      <div 
        className="center-branding" 
        style={{ 
          display: 'flex',
          alignItems: 'center',
          opacity: 0.9,
        }}
      >
        <img
          src={facility}
          alt="SmartEdgeFM"
          style={{ 
            height: '40px',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04))'
          }}
        />
      </div>

      {/* Right User Section */}
      <div 
        className="right-user" 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px'
        }}
      >
        <div
          className="user-info"
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.04) 100%)',
            borderRadius: '20px',
            padding: '6px 12px',
            border: '1px solid rgba(24, 144, 255, 0.1)',
            transition: 'all 0.25s ease',
            cursor: 'pointer',
            boxShadow: '0 1px 4px rgba(24, 144, 255, 0.06)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(24, 144, 255, 0.12) 0%, rgba(24, 144, 255, 0.06) 100%)';
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(24, 144, 255, 0.08) 0%, rgba(24, 144, 255, 0.04) 100%)';
            e.currentTarget.style.boxShadow = '0 1px 4px rgba(24, 144, 255, 0.06)';
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '30px',
              height: '30px',
              marginRight: '8px'
            }}
          >
            <img
              src="https://www.w3schools.com/howto/img_avatar.png"
              alt="User Avatar"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: '2px solid #1890ff',
                boxShadow: '0 1px 4px rgba(24, 144, 255, 0.15)'
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '0',
                right: '0',
                width: '8px',
                height: '8px',
                backgroundColor: '#52c41a',
                borderRadius: '50%',
                border: '2px solid white',
              }}
            />
          </div>
          <span
            title={user?.email || 'No email available'}
            style={{
              fontWeight: 600,
              color: '#1a1a1a',
              fontSize: '13px',
              letterSpacing: '-0.01em'
            }}
          >
            {getUserName()}
          </span>
          <span 
            style={{ 
              margin: '0 10px', 
              color: '#e0e0e0',
              fontSize: '16px',
              fontWeight: 300
            }}
          >
            |
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)',
              border: 'none',
              cursor: 'pointer',
              color: 'white',
              fontWeight: 600,
              fontSize: '12px',
              padding: '5px 12px',
              borderRadius: '10px',
              transition: 'all 0.25s ease',
              boxShadow: '0 1px 6px rgba(24, 144, 255, 0.2)',
              letterSpacing: '0.01em'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #0f7ae5 0%, #2d9aff 100%)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(24, 144, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)';
              e.currentTarget.style.boxShadow = '0 1px 6px rgba(24, 144, 255, 0.2)';
            }}
          >
            Logout
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <img
            src={iotiq}
            alt="IOTIQ Edge"
            style={{
              height: '34px',
              filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.04))',
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Header;