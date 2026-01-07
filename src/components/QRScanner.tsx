import React, { useState } from 'react';
import {
  QrCode, Camera, X, CheckCircle, History, Package, Calendar, MapPin, Tag
} from 'lucide-react';
import './AssetManagement.css';

const COLORS = {
  primary: '#111827',
  secondary: '#6b7280',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
  purple: '#7c3aed',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0'
};

interface ScannedAsset {
  sNo: number;
  modelNumber: string;
  assetName: string;
  assetCategory: string;
  assetType: string;
  manufacturer: string;
  tagsLocations: string;
  branch: string;
  status: string;
  scannedAt: string;
  qrCode: string;
}

const QRScanner: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedAsset, setScannedAsset] = useState<ScannedAsset | null>(null);
  const [scanHistory, setScanHistory] = useState<ScannedAsset[]>([]);

  // Mock scan function
  const simulateScan = () => {
    const mockAsset: ScannedAsset = {
      sNo: 1,
      modelNumber: 'FCVFQ71AV16',
      assetName: 'Cassette AC Unit -1',
      assetCategory: 'HVAC',
      assetType: 'Cassette AC',
      manufacturer: 'Daikin',
      tagsLocations: '3rd floor IDF-1',
      branch: 'Hyderabad',
      status: 'In-Use (Deployed)',
      scannedAt: new Date().toISOString(),
      qrCode: 'QR-HVAC-001'
    };
    setScannedAsset(mockAsset);
    setScanHistory(prev => [mockAsset, ...prev.slice(0, 9)]);
    setIsScanning(false);
  };

  const getStatusColor = (status: string) => {
    if (status.includes('In-Use') || status.includes('Deployed')) return COLORS.success;
    if (status.includes('Maintenance')) return COLORS.warning;
    return COLORS.info;
  };

  return (
    <div className="iot-screen">
      {/* Header */}
      <div className="iot-screen-header">
        <div>
          <h2 className="iot-screen-title">QR Code Scanner</h2>
          <p className="iot-screen-subtitle">Scan asset QR codes for instant information and verification</p>
        </div>
        <div style={{
          padding: '12px 16px',
          borderRadius: '10px',
          backgroundColor: `${COLORS.info}15`,
          border: `2px solid ${COLORS.info}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <QrCode style={{ width: '20px', height: '20px', color: COLORS.info }} />
          <div>
            <div style={{ fontSize: '11px', color: COLORS.info, fontWeight: '700', textTransform: 'uppercase' }}>
              Total Scans Today
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: COLORS.info }}>
              {scanHistory.length}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
        {/* Scanner Section */}
        <div>
          {/* Scanner Controls */}
          <div className="screen-card" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              {!isScanning ? (
                <button
                  onClick={() => setIsScanning(true)}
                  className="iot-download-btn"
                  style={{ flex: 1, backgroundColor: COLORS.info, color: COLORS.white }}
                >
                  <Camera style={{ width: '20px', height: '20px' }} />
                  Start Camera
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsScanning(false)}
                    className="iot-download-btn"
                    style={{ flex: 1, backgroundColor: COLORS.danger, color: COLORS.white }}
                  >
                    <X style={{ width: '20px', height: '20px' }} />
                    Stop Camera
                  </button>
                  <button
                    onClick={simulateScan}
                    className="iot-download-btn"
                    style={{ flex: 1, backgroundColor: COLORS.success, color: COLORS.white }}
                  >
                    <QrCode style={{ width: '20px', height: '20px' }} />
                    Simulate Scan
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Scanner Display */}
          <div style={{
            backgroundColor: COLORS.primary,
            borderRadius: '16px',
            overflow: 'hidden',
            position: 'relative',
            aspectRatio: '4/3',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            marginBottom: '16px'
          }}>
            {isScanning ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: COLORS.white,
                textAlign: 'center',
                padding: '40px'
              }}>
                <div style={{
                  width: '250px',
                  height: '250px',
                  border: `3px solid ${COLORS.success}`,
                  borderRadius: '16px',
                  marginBottom: '20px',
                  animation: 'pulse 2s infinite'
                }} />
                <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                  Position QR code within the frame
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: COLORS.white,
                textAlign: 'center',
                padding: '40px'
              }}>
                <QrCode style={{ width: '80px', height: '80px', marginBottom: '20px', opacity: 0.5 }} />
                <h3 style={{ fontSize: '20px', fontWeight: '700', margin: '0 0 8px 0' }}>
                  Ready to Scan
                </h3>
                <p style={{ fontSize: '14px', opacity: 0.7, margin: 0 }}>
                  Click "Start Camera" to begin scanning asset QR codes
                </p>
              </div>
            )}
          </div>

          {/* Scanned Asset Details */}
          {scannedAsset && (
            <div className="screen-card" style={{
              border: `2px solid ${COLORS.success}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${COLORS.success}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle style={{ width: '28px', height: '28px', color: COLORS.success }} />
                </div>
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: COLORS.success, margin: '0 0 4px 0' }}>
                    Scan Successful!
                  </h3>
                  <p style={{ fontSize: '12px', color: COLORS.secondary, margin: 0 }}>
                    Asset verified and details retrieved
                  </p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="detail-item">
                  <div className="detail-label">Asset Name</div>
                  <div className="detail-value">{scannedAsset.assetName}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Model Number</div>
                  <div className="detail-value" style={{ fontFamily: 'monospace' }}>
                    {scannedAsset.modelNumber}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Category / Type</div>
                  <div className="detail-value">
                    {scannedAsset.assetCategory} / {scannedAsset.assetType}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Manufacturer</div>
                  <div className="detail-value">{scannedAsset.manufacturer}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Location</div>
                  <div className="detail-value" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin style={{ width: '14px', height: '14px', color: COLORS.secondary }} />
                    {scannedAsset.tagsLocations}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Branch</div>
                  <div className="detail-value">{scannedAsset.branch}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Status</div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: `${getStatusColor(scannedAsset.status)}15`,
                    color: getStatusColor(scannedAsset.status)
                  }}>
                    {scannedAsset.status}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">QR Code</div>
                  <div className="detail-value" style={{ fontFamily: 'monospace', color: COLORS.success }}>
                    {scannedAsset.qrCode}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: `1px solid ${COLORS.border}` }}>
                <button className="iot-download-btn" style={{ flex: 1 }}>
                  View Full Details
                </button>
                <button
                  onClick={() => setScannedAsset(null)}
                  className="iot-download-btn"
                  style={{ flex: 1, backgroundColor: COLORS.info, color: COLORS.white }}
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Scan History */}
        <div>
          <div className="screen-card">
            <div className="chart-header">
              <h3 className="chart-title">
                <History style={{ width: '18px', height: '18px', display: 'inline', marginRight: '8px' }} />
                Recent Scans
              </h3>
            </div>

            {scanHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <QrCode style={{ width: '48px', height: '48px', color: COLORS.secondary, opacity: 0.3, marginBottom: '12px' }} />
                <p style={{ fontSize: '13px', color: COLORS.secondary, margin: 0 }}>
                  No scans yet. Start scanning to see history.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {scanHistory.map((asset, index) => (
                  <div
                    key={`${asset.qrCode}-${index}`}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: COLORS.bg,
                      border: `1px solid ${COLORS.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.white;
                      e.currentTarget.style.borderColor = COLORS.info;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = COLORS.bg;
                      e.currentTarget.style.borderColor = COLORS.border;
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'start', gap: '10px' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: `${COLORS.info}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Package style={{ width: '18px', height: '18px', color: COLORS.info }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: COLORS.primary, marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {asset.assetName}
                        </div>
                        <div style={{ fontSize: '11px', color: COLORS.info, fontFamily: 'monospace', fontWeight: '600', marginBottom: '6px' }}>
                          {asset.modelNumber}
                        </div>
                        <div style={{ fontSize: '10px', color: COLORS.secondary, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '10px', height: '10px' }} />
                          {new Date(asset.scannedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;