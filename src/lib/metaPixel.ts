// Facebook Meta Pixel Integration Module

interface PixelConfig {
  pixelId: string;
  isEnabled: boolean;
}

export interface PixelAuditLog {
  id: string;
  eventName: string;
  timestamp: string;
  payload: any;
}

// Retrive Pixel ID & Status from storage
export function getPixelConfig(): PixelConfig {
  try {
    const saved = localStorage.getItem("zshop_bd_facebook_pixel_config_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Failed to read Pixel configuration:", err);
  }
  return { pixelId: "", isEnabled: false };
}

// Save Pixel configurations
export function savePixelConfig(pixelId: string, isEnabled: boolean) {
  try {
    const config: PixelConfig = { pixelId: pixelId.trim(), isEnabled };
    localStorage.setItem("zshop_bd_facebook_pixel_config_v1", JSON.stringify(config));
    
    // Dispatch custom event to notify React components to reload the script
    window.dispatchEvent(new Event("zshop_bd_pixel_config_updated"));
    
    // Add an audit log
    addPixelAuditLog("PixelUpdated", { pixelId, isEnabled });
  } catch (err) {
    console.error("Failed to save Pixel configuration:", err);
  }
}

// Log of simulated or actual fired tracking events so user can debug
export function getPixelAuditLogs(): PixelAuditLog[] {
  try {
    const saved = localStorage.getItem("zshop_bd_pixel_audit_logs_v1");
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  return [];
}

export function addPixelAuditLog(eventName: string, payload: any) {
  try {
    const currentLogs = getPixelAuditLogs();
    const newLog: PixelAuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      eventName,
      timestamp: new Date().toISOString(),
      payload
    };
    const updated = [newLog, ...currentLogs].slice(0, 40); // Keep last 40 logs
    localStorage.setItem("zshop_bd_pixel_audit_logs_v1", JSON.stringify(updated));
    window.dispatchEvent(new Event("zshop_bd_pixel_logs_updated"));
  } catch (e) {
    console.error(e);
  }
}

export function clearPixelAuditLogs() {
  try {
    localStorage.setItem("zshop_bd_pixel_audit_logs_v1", JSON.stringify([]));
    window.dispatchEvent(new Event("zshop_bd_pixel_logs_updated"));
  } catch (e) {
    console.error(e);
  }
}

// Dynamically inject the Meta Pixel JS scripts into the document head
export function initMetaPixel() {
  const config = getPixelConfig();
  if (!config.isEnabled || !config.pixelId) {
    console.log("Meta Pixel is currently disabled or has no valid Pixel ID configured.");
    return;
  }

  const f = window as any;
  if (f.fbq) return; // Already initialized

  f.fbq = function () {
    f.fbq.callMethod ? f.fbq.callMethod.apply(f, arguments) : f.fbq.queue.push(arguments);
  };
  if (!f._fbq) f._fbq = f.fbq;
  f.fbq.push = f.fbq;
  f.fbq.loaded = true;
  f.fbq.version = "2.0";
  f.fbq.queue = [];

  const scriptElement = document.createElement("script");
  scriptElement.async = true;
  scriptElement.src = "https://connect.facebook.net/en_US/fbevents.js";
  
  const firstScript = document.getElementsByTagName("script")[0];
  if (firstScript && firstScript.parentNode) {
    firstScript.parentNode.insertBefore(scriptElement, firstScript);
  } else {
    document.head.appendChild(scriptElement);
  }

  // Setup fallback image tag for no-js context
  const noscript = document.createElement("noscript");
  const img = document.createElement("img");
  img.height = 1;
  img.width = 1;
  img.style.display = "none";
  img.src = `https://www.facebook.com/tr?id=${encodeURIComponent(config.pixelId)}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.body.appendChild(noscript);

  // Initialize the specific Pixel ID
  f.fbq("init", config.pixelId);
  f.fbq("track", "PageView");

  console.log(`[Meta Pixel Active] Initialized Pixel ID: ${config.pixelId}`);
}

// Fire standardized Standard events
export function trackPixelEvent(eventName: string, data?: any) {
  const config = getPixelConfig();
  const f = window as any;

  // Track natively if initialized
  if (config.isEnabled && config.pixelId && f.fbq) {
    try {
      f.fbq("track", eventName, data);
      console.log(`[Meta Pixel Event Fired] ${eventName}`, data || "");
    } catch (err) {
      console.error("Meta Pixel tracking error:", err);
    }
  }

  // Always log the track event locally to the Audit panel so users can inspect it
  addPixelAuditLog(eventName, data || null);
}
