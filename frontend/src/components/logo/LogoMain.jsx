import smartpostLogo from 'assets/images/smartpost-logo.png';

// ==============================|| LOGO - SMARTPOST MAIN ||============================== //

export default function LogoMain() {
  return (
    <img
      src={smartpostLogo}
      alt="SmartPost"
      style={{ height: 40, width: 'auto', objectFit: 'contain' }}
    />
  );
}
