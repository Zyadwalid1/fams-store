import LoginHistory from '../models/LoginHistory.js';
import { AppError } from '../middleware/errorMiddleware.js';
import useragent from 'express-useragent';
import geoip from 'geoip-lite';

// @desc    Get user's login history
// @route   GET /api/users/login-history
// @access  Private
export const getLoginHistory = async (req, res, next) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;
    
    // Get pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Query login history for the user, sorted by most recent first
    const loginHistory = await LoginHistory.find({ user: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await LoginHistory.countDocuments({ user: userId });
    
    res.status(200).json({
      success: true,
      data: loginHistory,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a new login attempt (success or failure)
// @route   Internal function, not exposed as API
// @access  Internal
export const recordLoginAttempt = async (userId, req, status = 'success') => {
  try {
    // Use the parsed useragent from middleware if available
    const ua = req.useragent || useragent.parse(req.headers['user-agent']);
    
    // Get IP address
    const ip = req.ip || 
               req.headers['x-forwarded-for'] || 
               req.connection.remoteAddress ||
               'Unknown';
    
    // Get location from IP
    const geo = geoip.lookup(ip);
    const location = geo ? `${geo.city || ''}, ${geo.country || ''}`.replace(', ,', ',').trim() : 'Unknown location';
    
    // Extract real browser name and platform
    const browserName = getBrowserName(ua);
    const platformName = getPlatformName(ua);
    
    // Create device string
    const device = `${browserName} on ${platformName}`;
    
    // Create login history entry
    const loginHistory = new LoginHistory({
      user: userId,
      ipAddress: ip,
      device,
      browser: browserName,
      location,
      status
    });
    
    await loginHistory.save();
    
    return loginHistory;
  } catch (error) {
    console.error('Error recording login attempt:', error);
    // Don't throw error to avoid disrupting the login flow
    return null;
  }
};

// Helper function to get more accurate browser name
function getBrowserName(ua) {
  let browser = 'Unknown Browser';
  let version = '';
  
  // First check for common browsers
  if (ua.isChrome) {
    browser = 'Chrome';
    version = ua.version || '';
  } else if (ua.isFirefox) {
    browser = 'Firefox';
    version = ua.version || '';
  } else if (ua.isSafari) {
    browser = 'Safari';
    version = ua.version || '';
  } else if (ua.isEdge) {
    browser = 'Edge';
    version = ua.version || '';
  } else if (ua.isIE) {
    browser = 'Internet Explorer';
    version = ua.version || '';
  } else if (ua.isOpera) {
    browser = 'Opera';
    version = ua.version || '';
  }
  
  // Check for mobile browsers
  if (ua.isMobile) {
    if (ua.isiPhone || ua.isiPad) {
      browser = 'Safari Mobile';
      version = ua.version || '';
    } else if (ua.isAndroid) {
      if (ua.isChrome) {
        browser = 'Chrome Mobile';
        version = ua.version || '';
      } else {
        browser = 'Android Browser';
        version = ua.version || '';
      }
    }
  }
  
  // Fallback to the browser name from the UA
  if (browser === 'Unknown Browser' && ua.browser) {
    browser = ua.browser;
    version = ua.version || '';
  }
  
  // Add version if available
  if (version) {
    return `${browser} ${version}`;
  }
  
  return browser;
}

// Helper function to get more accurate platform name
function getPlatformName(ua) {
  // Check for mobile devices first
  if (ua.isMobile) {
    if (ua.isiPhone) return 'iPhone';
    if (ua.isiPad) return 'iPad';
    if (ua.isiPod) return 'iPod';
    
    if (ua.isAndroid) {
      // Try to get more specific Android device info if available
      const uaString = ua.source || '';
      if (uaString.includes('SM-')) {
        // Samsung device
        return 'Samsung Android';
      } else if (uaString.includes('Pixel')) {
        // Google Pixel
        return 'Google Pixel';
      } else if (uaString.includes('Xiaomi') || uaString.includes('Redmi')) {
        // Xiaomi
        return 'Xiaomi Android';
      } else if (uaString.includes('OnePlus')) {
        // OnePlus
        return 'OnePlus Android';
      }
      return 'Android';
    }
    
    // Generic mobile
    return 'Mobile Device';
  }
  
  // Desktop platforms
  if (ua.isWindows) {
    const versionMap = {
      '10.0': 'Windows 10',
      '6.3': 'Windows 8.1',
      '6.2': 'Windows 8',
      '6.1': 'Windows 7',
      '6.0': 'Windows Vista',
      '5.2': 'Windows XP x64',
      '5.1': 'Windows XP'
    };
    
    if (ua.version && versionMap[ua.version]) {
      return versionMap[ua.version];
    }
    return 'Windows';
  }
  
  if (ua.isMac) return 'macOS';
  if (ua.isLinux) {
    if (ua.source && ua.source.includes('Ubuntu')) {
      return 'Ubuntu Linux';
    }
    return 'Linux';
  }
  
  // Fallback to UA platform
  return ua.platform || 'Unknown Platform';
}

// @desc    Clear login history for a user
// @route   DELETE /api/users/login-history
// @access  Private
export const clearLoginHistory = async (req, res, next) => {
  try {
    // Get user ID from auth middleware
    const userId = req.user.id;
    
    // Delete all login history entries for this user
    const result = await LoginHistory.deleteMany({ user: userId });
    
    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} login history entries`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    next(error);
  }
}; 