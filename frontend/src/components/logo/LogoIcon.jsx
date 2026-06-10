import smartpostLogo from 'assets/images/smartpost-logo.png';

// ==============================|| LOGO ICON - SMARTPOST ||============================== //

export default function LogoIcon() {
  return (
    <img
      src={smartpostLogo}
      alt="SmartPost"
      style={{ height: 36, width: 36, objectFit: 'contain' }}
    />
  );
}
