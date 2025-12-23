export default function Logo({ size = 'medium' }: { size?: 'small' | 'medium' | 'large' }) {
  const scale = size === 'small' ? 0.8 : size === 'large' ? 1.3 : 1;

  return (
    <div className="logo" style={{ transform: `scale(${scale})` }}>
      <div className="logo-icon">
        <span>{'{'}</span>
        <div className="logo-shapes">
          <div className="shape-square" />
          <div className="shape-triangle" />
          <div className="shape-circle" />
        </div>
        <span>{'}'}</span>
      </div>
      <span className="logo-text">KODLAB</span>
    </div>
  );
}
