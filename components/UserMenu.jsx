import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Settings, LogOut, User } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { User as UserEntity } from '@/api/entities';
import ConfirmDialog from './ConfirmDialog';
import { logout } from './auth/logout';
import { toast } from 'sonner';

export default function UserMenu({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await UserEntity.me();
        setCurrentUser(user);
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };
    loadUser();
  }, []);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
        case 'ArrowDown':
          event.preventDefault();
          const firstItem = menuRef.current?.querySelector('[role="menuitem"]');
          firstItem?.focus();
          break;
        case 'ArrowUp':
          event.preventDefault();
          const items = menuRef.current?.querySelectorAll('[role="menuitem"]');
          const lastItem = items?.[items.length - 1];
          lastItem?.focus();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle clicks outside menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleMenuToggle = () => {
    setIsOpen(!isOpen);
    // Analytics
    if (!isOpen && window.gtag) {
      window.gtag('event', 'user_menu_opened');
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    navigate(createPageUrl('Settings'));
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'settings_opened');
    }
  };

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowLogoutConfirm(true);
    // Analytics
    if (window.gtag) {
      window.gtag('event', 'logout_clicked');
    }
  };

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('התנתקת בהצלחה');
      // Analytics
      if (window.gtag) {
        window.gtag('event', 'logout_success');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('שגיאה בהתנתקות, נסה שוב');
      // Analytics
      if (window.gtag) {
        window.gtag('event', 'logout_failed', { error: error.message });
      }
    } finally {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
    }
  };

  const handleMenuItemKeyDown = (event, action) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextItem = event.currentTarget.nextElementSibling;
      nextItem?.focus();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevItem = event.currentTarget.previousElementSibling;
      prevItem?.focus();
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'מ';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getUserRole = () => {
    const role = currentUser?.custom_role || 'pending';
    const roleMap = {
      admin: 'מנהל מערכת',
      store_manager: 'מנהל חנות',
      baker: 'אופה',
      picker: 'מלקט',
      picker_baker: 'מלקט ואופה',
      courier: 'שליח',
      pending: 'ממתין לאישור'
    };
    return roleMap[role] || 'משתמש';
  };

  if (!currentUser) {
    return null; // Don't render if no user is loaded
  }

  return (
    <>
      <div className={`relative ${className}`} data-testid="user-menu">
        <button
          ref={buttonRef}
          onClick={handleMenuToggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleMenuToggle();
            }
          }}
          className="flex items-center gap-2 md:gap-3 w-full p-2 rounded-lg hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
          aria-haspopup="menu"
          aria-expanded={isOpen}
          aria-controls="user-dropdown-menu"
          aria-label="פתיחת תפריט משתמש"
          id="user-identity-anchor"
        >
          {/* User Avatar */}
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-bold text-xs md:text-sm">
              {getUserInitials(currentUser.full_name)}
            </span>
          </div>
          
          {/* User Info */}
          <div className="flex-1 min-w-0 text-right">
            <p className="font-semibold text-gray-900 text-xs md:text-sm truncate">
              {currentUser.full_name || 'משתמש'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {getUserRole()}
            </p>
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            ref={menuRef}
            id="user-dropdown-menu"
            role="menu"
            aria-labelledby="user-identity-anchor"
            className="absolute bottom-full left-0 mb-2 w-60 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50"
            style={{ minWidth: '240px' }}
          >
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">
                    {getUserInitials(currentUser.full_name)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">
                    {currentUser.full_name || 'משתמש'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {currentUser.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {getUserRole()}
                  </p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-1">
              {/* Settings */}
              <button
                role="menuitem"
                onClick={handleSettingsClick}
                onKeyDown={(e) => handleMenuItemKeyDown(e, handleSettingsClick)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors duration-200"
                data-testid="menu-item-settings"
              >
                <Settings className="w-4 h-4 text-gray-500" />
                <span>הגדרות</span>
              </button>

              {/* Divider */}
              <hr className="my-1 border-gray-100" />

              {/* Logout */}
              <button
                role="menuitem"
                onClick={handleLogoutClick}
                onKeyDown={(e) => handleMenuItemKeyDown(e, handleLogoutClick)}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus:bg-red-50 focus:outline-none transition-colors duration-200"
                data-testid="menu-item-logout"
              >
                <LogOut className="w-4 h-4" />
                <span>התנתק</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="להתנתק מהמערכת?"
        body="תצטרך להתחבר מחדש כדי לגשת לחשבון"
        confirmText={isLoggingOut ? "מתנתק..." : "התנתק"}
        cancelText="ביטול"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
        confirmButtonDisabled={isLoggingOut}
        confirmButtonVariant="destructive"
      />
    </>
  );
}